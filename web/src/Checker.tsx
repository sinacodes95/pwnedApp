import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Icon } from './Icon';
import { checkEmail, checkPassword, lookupErrorMessage, MAX_EMAILS, parseEmails } from './checkerApi';
import type { Breach } from './checkerApi';

type Lookup<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function useLookup<T>() {
  const [lookup, setLookup] = useState<Lookup<T>>({ status: 'idle' });
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  function reset() {
    setLookup({ status: 'idle' });
  }

  async function run(task: (signal: AbortSignal) => Promise<T>) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setLookup({ status: 'pending' });

    try {
      const data = await task(controller.signal);
      if (!controller.signal.aborted) setLookup({ status: 'success', data });
    } catch (error) {
      if (!controller.signal.aborted) {
        setLookup({ status: 'error', message: lookupErrorMessage(error) });
      }
    } finally {
      pending.current = null;
    }
  }

  return { lookup, run, reset };
}

type Tone = 'warning' | 'clear' | 'error';
const RESULT_ICONS = { warning: 'alert', clear: 'check', error: 'info' } as const;

function ResultCard({ tone, title, detail, children }: {
  tone: Tone;
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <article className={`result-card result-card--${tone}`}>
      <div className="result-header">
        <Icon className="result-icon" name={RESULT_ICONS[tone]} />
        <div>
          <h2 className="result-title">{title}</h2>
          {detail && <p className="result-subtitle">{detail}</p>}
        </div>
      </div>
      {children}
    </article>
  );
}

function Results({ children }: { children: ReactNode }) {
  return (
    <section className="checker-results" aria-label="Check results">
      {children}
    </section>
  );
}

const NUMBER_FORMAT = new Intl.NumberFormat('en');
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });

function BreachDetails({ breach }: { breach: Breach }) {
  const date = new Date(breach.breachDate);
  return (
    <li className="breach-item">
      <details className="breach-details">
        <summary className="breach-summary">
          <span>
            <strong>{breach.title || breach.name}</strong>
            <span className="breach-meta">
              {breach.domain && <span>{breach.domain}</span>}
              {!Number.isNaN(date.getTime()) && (
                <time dateTime={breach.breachDate}>{DATE_FORMAT.format(date)}</time>
              )}
            </span>
          </span>
          <Icon className="breach-chevron" name="chevron-down" size={16} />
        </summary>
        <div className="breach-content">
          <p className="breach-meta">
            {NUMBER_FORMAT.format(breach.pwnCount)} {breach.pwnCount === 1 ? 'account' : 'accounts'} affected
          </p>
          {breach.dataClasses.length > 0 && (
            <dl className="breach-exposed-data">
              <dt>Exposed data</dt>
              <dd>{breach.dataClasses.join(', ')}</dd>
            </dl>
          )}
        </div>
      </details>
    </li>
  );
}

type EmailResult = { email: string; breaches: Breach[] } | { email: string; error: string };

function EmailResultCard({ result }: { result: EmailResult }) {
  if ('error' in result) {
    return (
      <ResultCard tone="error" title="Email check incomplete" detail={result.email}>
        <p className="result-advice">{result.error}</p>
      </ResultCard>
    );
  }

  const { email, breaches } = result;
  if (!breaches.length) {
    return <ResultCard tone="clear" title="No known breaches found" detail={email} />;
  }

  const title = `Found in ${NUMBER_FORMAT.format(breaches.length)} ${breaches.length === 1 ? 'breach' : 'breaches'}`;
  return (
    <ResultCard tone="warning" title={title} detail={email}>
      <ul className="breach-list" aria-label={`Breaches for ${email}`}>
        {breaches.map((breach) => <BreachDetails breach={breach} key={breach.name} />)}
      </ul>
      <p className="result-advice">
        Change any exposed passwords wherever you used them. Turn on two-factor authentication where available.
      </p>
    </ResultCard>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button className="checker-submit" type="submit" aria-disabled={busy}>
      <span>{children}</span>
      <Icon name="arrow-right" size={18} />
    </button>
  );
}

type BatchProgress = { completed: number; total: number };

function LookupFeedback({ announcement, busy, label, batch }: {
  announcement: string;
  busy: boolean;
  label: string;
  batch?: BatchProgress;
}) {
  return (
    <div className={busy ? `lookup-progress${batch ? '' : ' lookup-progress--indeterminate'}` : undefined}>
      <p className={busy ? 'lookup-progress-label' : 'sr-only'} role="status">{announcement}</p>
      {busy && (
        <div
          className="lookup-progress-track"
          role="progressbar"
          aria-label={label}
          aria-valuenow={batch?.completed}
          aria-valuemin={batch ? 0 : undefined}
          aria-valuemax={batch?.total}
          aria-valuetext={batch ? announcement : undefined}
        >
          {batch ? Array.from({ length: batch.total }, (_, index) => {
            const state = index < batch.completed ? 'complete' : index === batch.completed ? 'active' : 'waiting';
            return (
              <span className={`lookup-progress-segment lookup-progress-segment--${state}`} key={index}>
                <span className="lookup-progress-fill" />
              </span>
            );
          }) : <span className="lookup-progress-fill" />}
        </div>
      )}
    </div>
  );
}

export function EmailChecker() {
  const fieldId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [progress, setProgress] = useState<BatchProgress>({ completed: 0, total: 0 });
  const { lookup, run, reset } = useLookup<EmailResult[]>();
  const busy = lookup.status === 'pending';
  const batch = progress.total > 1 ? progress : undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const parsed = parseEmails(value);
    if ('error' in parsed) {
      setFieldError(parsed.error);
      input.current?.focus();
      return;
    }

    setFieldError('');
    void run(async (signal) => {
      const results: EmailResult[] = [];
      const total = parsed.emails.length;
      setProgress({ completed: 0, total });
      for (const email of parsed.emails) {
        signal.throwIfAborted();
        try {
          results.push({ email, breaches: await checkEmail(email, signal) });
        } catch (error) {
          results.push({ email, error: lookupErrorMessage(error) });
        }
        signal.throwIfAborted();
        setProgress({ completed: results.length, total });
      }
      return results;
    });
  }

  let announcement = '';
  if (busy) {
    announcement = batch ? `${batch.completed} of ${batch.total} addresses processed` : 'Checking email address…';
  }
  if (lookup.status === 'success') {
    const exposed = lookup.data.filter((result) => 'breaches' in result && result.breaches.length > 0).length;
    const failed = lookup.data.filter((result) => 'error' in result).length;
    const clear = lookup.data.length - exposed - failed;
    announcement = `Email check complete. ${exposed} with known breaches. ${clear} with no known breaches. ${failed} incomplete.`;
  }
  if (lookup.status === 'error') announcement = lookup.message;

  return (
    <>
      <form className="checker-form" onSubmit={submit} noValidate>
        <label className="field-label" htmlFor={fieldId}>Email address</label>
        <div className="checker-controls">
          <div className="field-wrap">
            <input
              className="field-input"
              id={fieldId}
              ref={input}
              type="text"
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              readOnly={busy}
              aria-describedby={`${fieldId}-help${fieldError ? ` ${fieldId}-error` : ''}`}
              aria-invalid={Boolean(fieldError)}
              placeholder="you@example.com"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (fieldError) setFieldError('');
                if (lookup.status !== 'idle') reset();
              }}
            />
          </div>
          <SubmitButton busy={busy}>Check email</SubmitButton>
        </div>
        <p className="field-help" id={`${fieldId}-help`}>
          Enter up to {MAX_EMAILS} addresses, separated by commas.
        </p>
        {fieldError && <p className="field-error" id={`${fieldId}-error`} role="alert">{fieldError}</p>}
      </form>
      <LookupFeedback announcement={announcement} busy={busy} label="Email check progress" batch={batch} />
      {lookup.status === 'success' && (
        <Results>
          {lookup.data.map((result) => <EmailResultCard key={result.email} result={result} />)}
        </Results>
      )}
      {lookup.status === 'error' && (
        <Results><ResultCard tone="error" title="Email check incomplete" detail={lookup.message} /></Results>
      )}
    </>
  );
}

function PasswordResult({ count }: { count: number }) {
  if (!count) {
    return <ResultCard tone="clear" title="No known exposure found" />;
  }

  return (
    <ResultCard
      tone="warning"
      title="Password exposed"
      detail={`This password appears ${NUMBER_FORMAT.format(count)} ${count === 1 ? 'time' : 'times'} in known breaches.`}
    >
      <p className="result-advice">
        Replace it everywhere you use it. Choose a unique password for each account.
      </p>
    </ResultCard>
  );
}

export function PasswordChecker() {
  const fieldId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const { lookup, run, reset } = useLookup<number>();
  const busy = lookup.status === 'pending';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!value) {
      setFieldError('Enter a password to check.');
      input.current?.focus();
      return;
    }

    setFieldError('');
    setVisible(false);
    setValue('');
    void run((signal) => checkPassword(value, signal));
  }

  let announcement = '';
  if (busy) announcement = 'Checking password…';
  if (lookup.status === 'success') {
    announcement = lookup.data ? 'Password exposed. See results for details.' : 'No known exposure found.';
  }
  if (lookup.status === 'error') announcement = lookup.message;

  return (
    <>
      <form className="checker-form" onSubmit={submit} noValidate>
        <label className="field-label" htmlFor={fieldId}>Password</label>
        <div className="checker-controls">
          <div className="field-wrap">
            <input
              className="field-input"
              id={fieldId}
              ref={input}
              type={visible ? 'text' : 'password'}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              readOnly={busy}
              aria-describedby={`${fieldId}-help${fieldError ? ` ${fieldId}-error` : ''}`}
              aria-invalid={Boolean(fieldError)}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (fieldError) setFieldError('');
                if (lookup.status !== 'idle') reset();
              }}
            />
            <button
              className="field-toggle"
              type="button"
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-controls={fieldId}
              disabled={busy}
              onClick={() => setVisible(!visible)}
            >
              <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
          <SubmitButton busy={busy}>Check password</SubmitButton>
        </div>
        <p className="field-help" id={`${fieldId}-help`}>
          Your password stays on this device.
        </p>
        {fieldError && <p className="field-error" id={`${fieldId}-error`} role="alert">{fieldError}</p>}
      </form>
      <LookupFeedback announcement={announcement} busy={busy} label="Password check progress" />
      {lookup.status === 'success' && <Results><PasswordResult count={lookup.data} /></Results>}
      {lookup.status === 'error' && (
        <Results><ResultCard tone="error" title="Password check incomplete" detail={lookup.message} /></Results>
      )}
    </>
  );
}
