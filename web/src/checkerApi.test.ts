import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkEmail } from './checkerApi';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function rateLimited(seconds: number): Response {
  return new Response(null, { status: 429, headers: { 'Retry-After': String(seconds) } });
}

describe('email rate limit', () => {
  it('waits for Retry-After and makes at most one additional attempt', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(rateLimited(2))
      .mockResolvedValueOnce(rateLimited(2));
    vi.stubGlobal('fetch', fetchMock);

    const lookup = checkEmail('email@example.test', new AbortController().signal);
    const failure = expect(lookup).rejects.toThrow('Wait a moment and try again.');
    await vi.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(250);
    await failure;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips the retry when the provider requests a long wait', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(rateLimited(60));
    vi.stubGlobal('fetch', fetchMock);

    await expect(checkEmail('email@example.test', new AbortController().signal))
      .rejects.toThrow('Wait a moment and try again.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending retry on abort', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(rateLimited(2));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    const lookup = checkEmail('email@example.test', controller.signal);
    const failure = expect(lookup).rejects.toHaveProperty('name', 'AbortError');
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await failure;
    await vi.runAllTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
