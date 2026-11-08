import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.ts';
import { createHibpClient } from './hibp.ts';

const envFile = new URL('../../.env', import.meta.url);
if (existsSync(envFile)) loadEnvFile(envFile);

const host = process.env.HOST?.trim() || '127.0.0.1';
const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const hibp = createHibpClient({ apiKey: process.env.HIBP_API_KEY?.trim() });
const webBuild = new URL('../../web/dist/', import.meta.url);
const staticRoot = existsSync(new URL('index.html', webBuild)) ? fileURLToPath(webBuild) : undefined;
const app = createApp({ hibp, staticRoot });

app.listen(port, host).once('listening', () => {
  console.log(`pwnedApp listening on ${host} port ${port}`);
});
