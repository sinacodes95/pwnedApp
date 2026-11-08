import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { TestContext } from 'node:test';
import { createApp } from '../src/app.ts';
import { createHibpClient } from '../src/hibp.ts';

const email = 'person+tag@example.test';
const apiKey = 'test-only-key';

async function startApi(context: TestContext, options: Parameters<typeof createApp>[0] = {}) {
  const server = createApp(options).listen(0, '127.0.0.1');
  context.after(() => new Promise<void>((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => error ? reject(error) : resolve());
  }));

  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return `http://127.0.0.1:${address.port}`;
}

function emailRequest(origin: string, value: unknown = email) {
  return fetch(`${origin}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: value }),
  });
}

async function assertError(response: Response, status: number, code: string) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const payload = await response.json() as { error: { code: string; message: string } };
  assert.equal(payload.error.code, code);
  assert.ok(payload.error.message);
  assert.ok(!JSON.stringify(payload).includes(email));
  assert.ok(!JSON.stringify(payload).includes(apiKey));
}

test('email search calls the authenticated endpoint and returns normalized breach data', async (context) => {
  const requests: Request[] = [];
  const hibp = createHibpClient({
    apiKey,
    fetcher: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json([{
        Name: 'ExampleBreach',
        Title: 'Example Breach',
        Domain: 'example.test',
        BreachDate: '2021-04-01',
        PwnCount: 300,
        DataClasses: ['Email addresses', 'Passwords'],
        Description: '<script>provider markup</script>',
      }]);
    },
  });
  const origin = await startApi(context, { hibp });
  const result = await emailRequest(origin, ` ${email} `);

  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await result.json(), {
    breaches: [{
      name: 'ExampleBreach',
      title: 'Example Breach',
      domain: 'example.test',
      breachDate: '2021-04-01',
      pwnCount: 300,
      dataClasses: ['Email addresses', 'Passwords'],
    }],
  });
  assert.equal(requests.length, 1);
  const [upstream] = requests;
  assert.ok(upstream);
  assert.equal(upstream.url, 'https://haveibeenpwned.com/api/v3/breachedaccount/person%2Btag%40example.test?truncateResponse=false');
  assert.equal(upstream.headers.get('hibp-api-key'), apiKey);
  assert.equal(upstream.headers.get('User-Agent'), 'pwnedApp/1.0');
  assert.equal(upstream.redirect, 'error');
});

test('email search reports no known breaches for the provider’s 404 response', async (context) => {
  const hibp = createHibpClient({ apiKey, fetcher: async () => new Response(null, { status: 404 }) });
  const response = await emailRequest(await startApi(context, { hibp }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { breaches: [] });
});

test('email search separates authentication, rate limiting, and malformed provider data from clean results', async (context) => {
  const cases = [
    { upstream: new Response(apiKey, { status: 401 }), status: 503, code: 'EMAIL_UNAVAILABLE' },
    { upstream: new Response(email, { status: 429, headers: { 'Retry-After': '3' } }), status: 429, code: 'RATE_LIMITED', retry: '3' },
    { upstream: new Response(null, { status: 429, headers: { 'Retry-After': 'invalid' } }), status: 429, code: 'RATE_LIMITED' },
    { upstream: new Response(email, { status: 503 }), status: 502, code: 'UPSTREAM_ERROR' },
    { upstream: new Response('not JSON'), status: 502, code: 'UPSTREAM_ERROR' },
    { upstream: Response.json([{ Name: 'TruncatedBreach' }]), status: 502, code: 'UPSTREAM_ERROR' },
  ];
  const hibp = createHibpClient({
    apiKey,
    fetcher: async () => {
      const next = cases.shift();
      assert.ok(next);
      return next.upstream;
    },
  });
  const origin = await startApi(context, { hibp });

  for (const { status, code, retry } of [...cases]) {
    const response = await emailRequest(origin);
    assert.equal(response.headers.get('Retry-After'), retry ?? null);
    await assertError(response, status, code);
  }
});

test('email search rejects invalid input before querying the provider', async (context) => {
  let requests = 0;
  const hibp = createHibpClient({
    apiKey,
    fetcher: async () => {
      requests += 1;
      throw new Error('unexpected provider request');
    },
  });
  const origin = await startApi(context, { hibp });

  for (const invalidEmail of ['', 'abc', 'person @example.test', 'person@example', 123, '\uD800@example.test', `${'x'.repeat(255)}@example.test`]) {
    await assertError(await emailRequest(origin, invalidEmail), 400, 'INVALID_EMAIL');
  }

  for (const { contentType, body, status, code } of [
    { contentType: 'application/json', body: '{"email":', status: 400, code: 'INVALID_REQUEST' },
    { contentType: 'application/json', body: JSON.stringify({ email: 'x'.repeat(2_048) }), status: 413, code: 'PAYLOAD_TOO_LARGE' },
    { contentType: 'text/plain', body: email, status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' },
  ]) {
    const response = await fetch(`${origin}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
    await assertError(response, status, code);
  }
  assert.equal(requests, 0);
});

test('email search is explicitly unavailable without an API key', async (context) => {
  const origin = await startApi(context);
  await assertError(await emailRequest(origin), 503, 'EMAIL_UNAVAILABLE');
});

test('password checks proxy only a five-character prefix and retain zero-count padding', async (context) => {
  const requests: Request[] = [];
  const range = `${'A'.repeat(35)}:71\r\n${'B'.repeat(35)}:0\r\n`;
  const hibp = createHibpClient({
    apiKey,
    fetcher: async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(range);
    },
  });
  const origin = await startApi(context, { hibp });

  for (const invalidPrefix of ['AB1234', 'AB1Z3', 'AB12', 'A'.repeat(40)]) {
    await assertError(await fetch(`${origin}/api/password/${invalidPrefix}`), 400, 'INVALID_PREFIX');
  }

  const result = await fetch(`${origin}/api/password/ab123`);
  assert.equal(result.status, 200);
  assert.match(result.headers.get('Content-Type') ?? '', /^text\/plain\b/);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal(await result.text(), range);
  assert.equal(requests.length, 1);
  const [upstream] = requests;
  assert.ok(upstream);
  assert.equal(upstream.url, 'https://api.pwnedpasswords.com/range/AB123');
  assert.equal(upstream.headers.get('Add-Padding'), 'true');
  assert.equal(upstream.headers.get('hibp-api-key'), null);
});

test('password checks reject provider and network errors and empty or invalid ranges', async (context) => {
  const replies = [
    () => new Response(null, { status: 404 }),
    () => new Response(''),
    () => new Response('<html>unexpected response</html>'),
    () => { throw new Error('connection failed'); },
  ];
  const hibp = createHibpClient({
    fetcher: async () => {
      const next = replies.shift();
      assert.ok(next);
      return next();
    },
  });
  const origin = await startApi(context, { hibp });

  for (const _reply of [...replies]) {
    await assertError(await fetch(`${origin}/api/password/AB123`), 502, 'UPSTREAM_ERROR');
  }
});

test('the API bounds the upstream request duration', async (context) => {
  const hibp = createHibpClient({
    timeoutMs: 10,
    fetcher: async (_input, init) => new Promise((_resolve, reject) => {
      const signal = init?.signal;
      assert.ok(signal);
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
  });
  const origin = await startApi(context, { hibp });

  await assertError(await fetch(`${origin}/api/password/AB123`), 504, 'UPSTREAM_TIMEOUT');
});

test('serves built SPA routes and assets while keeping API and missing asset responses distinct', async (context) => {
  const staticRoot = await mkdtemp(join(tmpdir(), 'pwnedapp-web-'));
  context.after(() => rm(staticRoot, { recursive: true, force: true }));
  const html = '<!doctype html><title>pwnedApp</title>';
  await writeFile(join(staticRoot, 'index.html'), html);
  await mkdir(join(staticRoot, 'assets'));
  await writeFile(join(staticRoot, 'assets', 'app.js'), 'export {};');
  const origin = await startApi(context, { staticRoot });

  for (const path of ['/', '/Email', '/Password', '/pwnedApp']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Security-Policy') ?? '', /frame-ancestors 'none'/);
    assert.equal(await response.text(), html);
  }

  const script = await fetch(`${origin}/assets/app.js`);
  assert.equal(script.status, 200);
  assert.equal(await script.text(), 'export {};');

  const missing = await fetch(`${origin}/assets/missing.js`);
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('Content-Type') ?? '', /^application\/json\b/);
  await assertError(await fetch(`${origin}/api/missing`), 404, 'NOT_FOUND');

  const health = await fetch(`${origin}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
});
