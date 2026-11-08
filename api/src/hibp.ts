import { ApiError } from './api-error.ts';

const USER_AGENT = 'pwnedApp/1.0';

interface Breach {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  pwnCount: number;
  dataClasses: string[];
}

interface HibpOptions {
  apiKey?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

function providerError(): ApiError {
  return new ApiError(502, 'UPSTREAM_ERROR', 'The breach service could not complete the check. Please try again.');
}

function parseBreach(value: unknown): Breach {
  if (typeof value !== 'object' || value === null) throw providerError();
  const { Name, Title, Domain, BreachDate, PwnCount, DataClasses } = value as Record<string, unknown>;

  if (
    typeof Name !== 'string' || !Name ||
    typeof Title !== 'string' || !Title ||
    typeof Domain !== 'string' ||
    typeof BreachDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(BreachDate) ||
    typeof PwnCount !== 'number' || !Number.isSafeInteger(PwnCount) || PwnCount < 0 ||
    !Array.isArray(DataClasses) || !DataClasses.every((item) => typeof item === 'string')
  ) {
    throw providerError();
  }

  return {
    name: Name,
    title: Title,
    domain: Domain,
    breachDate: BreachDate,
    pwnCount: PwnCount,
    dataClasses: DataClasses,
  };
}

export function createHibpClient({ apiKey, fetcher = fetch, timeoutMs = 8_000 }: HibpOptions = {}) {
  async function request<T>(
    url: string,
    headers: Record<string, string>,
    readResponse: (response: Response) => Promise<T>,
  ): Promise<T> {
    const signal = AbortSignal.timeout(timeoutMs);
    try {
      const response = await fetcher(url, {
        headers: { 'User-Agent': USER_AGENT, ...headers },
        redirect: 'error',
        signal,
      });

      try {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new ApiError(
            429,
            'RATE_LIMITED',
            'The breach service is receiving too many requests. Please try again shortly.',
            retryAfter && /^\d+$/.test(retryAfter) ? retryAfter : undefined,
          );
        }
        return await readResponse(response);
      } finally {
        if (!response.bodyUsed) await response.body?.cancel().catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (signal.aborted) {
        throw new ApiError(504, 'UPSTREAM_TIMEOUT', 'The breach service took too long to respond. Please try again.');
      }
      throw providerError();
    }
  }

  return {
    async checkEmail(email: string): Promise<Breach[]> {
      if (!apiKey) {
        throw new ApiError(503, 'EMAIL_UNAVAILABLE', 'Email checks are unavailable because the breach service is not configured.');
      }

      const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
      return request(url, { Accept: 'application/json', 'hibp-api-key': apiKey }, async (response) => {
        if (response.status === 404) return [];
        if (response.status === 401 || response.status === 403) {
          throw new ApiError(503, 'EMAIL_UNAVAILABLE', 'The breach service could not authorize email checks.');
        }
        if (response.status !== 200) throw providerError();

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw providerError();
        return payload.map(parseBreach);
      });
    },

    async passwordRange(prefix: string): Promise<string> {
      const url = `https://api.pwnedpasswords.com/range/${prefix}`;
      return request(url, { Accept: 'text/plain', 'Add-Padding': 'true' }, async (response) => {
        if (response.status !== 200) throw providerError();
        const range = await response.text();
        if (!range.trimEnd().split(/\r?\n/).every((line) => /^[0-9A-F]{35}:\d+$/i.test(line))) {
          throw providerError();
        }
        return range;
      });
    },
  };
}
