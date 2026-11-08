export type Breach = {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  pwnCount: number;
  dataClasses: string[];
};

export const MAX_EMAILS = 5;
const EMAIL_PATTERN = /^[^\s@\p{Cc}\p{Cs}]+@[^\s@\p{Cc}\p{Cs}]+\.[^\s@\p{Cc}\p{Cs}]+$/u;
const RANGE_LINE = /^([A-F0-9]{35}):(\d+)$/i;

class LookupError extends Error {}

export function lookupErrorMessage(error: unknown): string {
  return error instanceof LookupError
    ? error.message
    : 'The lookup could not be completed. Please try again.';
}

export function parseEmails(input: string): { emails: string[] } | { error: string } {
  const emails = new Map<string, string>();

  for (const entry of input.split(',')) {
    const email = entry.trim();
    if (!email) continue;
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return { error: 'Enter valid email addresses and separate them with commas.' };
    }

    const key = email.toLowerCase();
    if (!emails.has(key)) emails.set(key, email);
    if (emails.size > MAX_EMAILS) {
      return { error: `Check up to ${MAX_EMAILS} email addresses at a time.` };
    }
  }

  if (!emails.size) return { error: 'Enter an email address to check.' };
  return { emails: [...emails.values()] };
}

function isBreach(value: unknown): value is Breach {
  if (!value || typeof value !== 'object') return false;
  const breach = value as Record<string, unknown>;
  return (
    typeof breach.name === 'string' &&
    typeof breach.title === 'string' &&
    typeof breach.domain === 'string' &&
    typeof breach.breachDate === 'string' &&
    typeof breach.pwnCount === 'number' &&
    Number.isSafeInteger(breach.pwnCount) &&
    breach.pwnCount >= 0 &&
    Array.isArray(breach.dataClasses) &&
    breach.dataClasses.every((item) => typeof item === 'string')
  );
}

function retryDelay(response: Response): number | undefined {
  const seconds = response.headers.get('Retry-After');
  if (response.status !== 429 || !seconds || !/^\d+$/.test(seconds)) return;

  const delay = Number(seconds) * 1_000;
  // Leave a small buffer to account for the time needed to reset the rate limit.
  if (delay <= 10_000) return delay + 250;
}

function waitForRetry(delay: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, delay);

    function abort() {
      clearTimeout(timeout);
      reject(signal.reason);
    }

    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function checkEmail(email: string, signal: AbortSignal): Promise<Breach[]> {
  const request: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    redirect: 'error',
    signal,
  };
  let response = await fetch('/api/email', request);
  const delay = retryDelay(response);
  if (delay !== undefined) {
    await waitForRetry(delay, signal);
    response = await fetch('/api/email', request);
  }

  if (response.status === 503) {
    throw new LookupError("I didn't connect it to the API because it costs money so treat this as a proof of concept or go to https://haveibeenpwned.com/ if you really want to check if your email or password was in a data breach. For now feel free to use the test API described in the README.md on github: https://github.com/sinacodes95/pwnedApp/blob/master/README.md");
  }
  if (response.status === 429) {
    throw new LookupError('The breach service is busy. Wait a moment and try again.');
  }
  if (!response.ok) throw new LookupError('The email could not be checked. Please try again.');

  const result: unknown = await response.json();
  if (result && typeof result === 'object' && 'breaches' in result) {
    const { breaches } = result;
    if (Array.isArray(breaches) && breaches.every(isBreach)) return breaches;
  }

  throw new LookupError('The breach service returned an unreadable response. Please try again.');
}

function matchRange(range: string, suffix: string): number {
  let count = 0;
  for (const row of range.trimEnd().split(/\r?\n/)) {
    const [, candidate, rawCount] = RANGE_LINE.exec(row) ?? [];
    const occurrences = Number(rawCount);
    if (!candidate || !Number.isSafeInteger(occurrences)) {
      throw new LookupError('The password service returned an unreadable response. Please try again.');
    }
    if (candidate.toUpperCase() === suffix) count = Math.max(count, occurrences);
  }
  return count;
}

export async function checkPassword(password: string, signal: AbortSignal): Promise<number> {
  if (!globalThis.crypto?.subtle) {
    throw new LookupError('Password checks need a secure connection. Open this app over HTTPS or localhost.');
  }

  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-1', bytes);
  signal.throwIfAborted();
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  const response = await fetch(`/api/password/${hash.slice(0, 5)}`, {
    cache: 'no-store',
    redirect: 'error',
    signal,
  });
  if (!response.ok) throw new LookupError('The password could not be checked. Please try again.');

  return matchRange(await response.text(), hash.slice(5));
}
