import { createHash, webcrypto } from 'node:crypto';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { EmailChecker, PasswordChecker } from './Checker';

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

const exampleBreach = {
  name: 'ExampleArchive',
  title: 'Example Archive',
  domain: 'archive.example',
  breachDate: '2024-02-03',
  pwnCount: 12_000,
  dataClasses: ['Email addresses', 'Passwords'],
};

describe('email checker', () => {
  it('identifies invalid input, keeps the field focused and skips the request', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<EmailChecker />);

    const input = screen.getByRole('textbox', { name: 'Email address' });
    await user.click(screen.getByRole('button', { name: 'Check email' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an email address');
    expect(input).toHaveFocus();

    await user.type(input, 'valid@example.com, invalid{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter valid email addresses');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('bounds each batch before making requests', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<EmailChecker />);

    await user.click(screen.getByRole('textbox', { name: 'Email address' }));
    await user.paste('1@a.test,2@a.test,3@a.test,4@a.test,5@a.test,6@a.test');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Check up to 5 email addresses');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deduplicates a batch and distinguishes exposure, failure and no match', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ breaches: [exampleBreach] }))
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json({ breaches: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<EmailChecker />);

    await user.click(screen.getByRole('textbox', { name: 'Email address' }));
    await user.paste(' Alex@example.com, alex@example.com, unavailable@example.com, clear@example.com');
    await user.keyboard('{Enter}');

    const results = await screen.findByRole('region', { name: 'Check results' });
    expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method, options?.body])).toEqual([
      ['/api/email', 'POST', '{"email":"Alex@example.com"}'],
      ['/api/email', 'POST', '{"email":"unavailable@example.com"}'],
      ['/api/email', 'POST', '{"email":"clear@example.com"}'],
    ]);
    const [exposed, failed, clear] = within(results).getAllByRole('article');
    expect(exposed).toHaveTextContent('Found in 1 breach');
    expect(exposed).toHaveTextContent('Alex@example.com');
    expect(failed).toHaveTextContent('Email check incomplete');
    expect(failed).toHaveTextContent('unavailable@example.com');
    expect(failed).toHaveTextContent('Wait a moment and try again.');
    expect(clear).toHaveTextContent('No known breaches found');
    expect(clear).toHaveTextContent('clear@example.com');

    await user.click(screen.getByText('Example Archive'));
    expect(screen.getByText('12,000 accounts affected')).toBeVisible();
    expect(screen.getByText('Email addresses, Passwords')).toBeVisible();
  });

  it('advances batch progress only after an address has been processed', async () => {
    let respondToFirst!: (response: Response) => void;
    const firstRequest = new Promise<Response>((resolve) => { respondToFirst = resolve; });
    const fetchMock = vi.fn<typeof fetch>()
      .mockReturnValueOnce(firstRequest)
      .mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(options.signal?.reason));
      }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<EmailChecker />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'first@example.com, second@example.com{Enter}');
    const progress = screen.getByRole('progressbar', { name: 'Email check progress' });
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '2');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => { respondToFirst(Response.json({ breaches: [] })); });
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 addresses processed');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('cancels a pending lookup when switching checkers with the keyboard', async () => {
    const fetchMock = vi.fn<typeof fetch>((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(options.signal?.reason));
    }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'alex@example.com, second@example.com{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('0 of 2 addresses processed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);

    screen.getByRole('tab', { name: 'Email' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
    expect(signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#password');
  });
});

describe('password checker', () => {
  it('sends only the five-character UTF-8 SHA-1 prefix and clears the input', async () => {
    const password = ' pāsswörd🔐 ';
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(
      `${'A'.repeat(35)}:0\r\n${hash.slice(5)}:2001\r\n`,
    ));
    vi.stubGlobal('crypto', webcrypto);
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<PasswordChecker />);

    const input = screen.getByLabelText('Password');
    await user.click(input);
    await user.paste(password);
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue(password);
    await user.click(screen.getByRole('button', { name: 'Check password' }));

    expect(await screen.findByRole('heading', { name: 'Password exposed' })).toBeVisible();
    expect(screen.getByText(/appears 2,001 times/)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`/api/password/${hash.slice(0, 5)}`, {
      cache: 'no-store',
      redirect: 'error',
      signal: expect.any(AbortSignal),
    });
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('');
  });

  it('ignores a matching padding entry with a count of zero', async () => {
    const password = 'example';
    const suffix = createHash('sha1').update(password).digest('hex').slice(5);
    vi.stubGlobal('crypto', webcrypto);
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(`${suffix}:0\n`)));
    const user = userEvent.setup();
    render(<PasswordChecker />);

    await user.type(screen.getByLabelText('Password'), `${password}{Enter}`);
    expect(await screen.findByRole('heading', { name: 'No known exposure found' })).toBeVisible();
  });

  it.each([
    ['service errors', () => Promise.resolve(new Response(null, { status: 502 }))],
    ['network errors', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['malformed ranges', () => Promise.resolve(new Response(`${'A'.repeat(35)}:2\ninvalid range`))],
  ])('shows incomplete results for %s', async (_name, response) => {
    vi.stubGlobal('crypto', webcrypto);
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(response));
    const user = userEvent.setup();
    render(<PasswordChecker />);

    await user.type(screen.getByLabelText('Password'), 'example{Enter}');
    expect(await screen.findByRole('heading', { name: 'Password check incomplete' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'No known exposure found' })).not.toBeInTheDocument();
  });
});
