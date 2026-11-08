import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { EmailChecker, PasswordChecker } from './Checker';
import { Icon } from './Icon';
import './index.css';

const hibpUrl = 'https://haveibeenpwned.com/';
const modeHash = /^#(email|password)$/;

const modes = {
  email: {
    tab: 'Email',
    icon: 'mail',
    component: EmailChecker,
  },
  password: {
    tab: 'Password',
    icon: 'key',
    component: PasswordChecker,
  },
} as const;

type Mode = keyof typeof modes;

function readMode(): Mode {
  if (window.location.hash === '#email') return 'email';
  if (window.location.hash === '#password') return 'password';
  const lastSegment = window.location.pathname.toLowerCase().split('/').filter(Boolean).at(-1);
  return lastSegment === 'password' ? 'password' : 'email';
}

export default function App() {
  const [mode, setMode] = useState(readMode);
  const emailTab = useRef<HTMLButtonElement>(null);
  const passwordTab = useRef<HTMLButtonElement>(null);
  const Checker = modes[mode].component;

  useEffect(() => {
    function syncMode() {
      if (!window.location.hash || modeHash.test(window.location.hash)) {
        setMode(readMode());
        return;
      }

      // Keep the selected check with ordinary anchors when users move through history.
      const previousMode: unknown = window.history.state?.checkMode;
      if (previousMode === 'email' || previousMode === 'password') {
        setMode(previousMode);
      } else {
        window.history.replaceState({ checkMode: mode }, '');
      }
    }

    syncMode();
    window.addEventListener('popstate', syncMode);
    window.addEventListener('hashchange', syncMode);
    return () => {
      window.removeEventListener('popstate', syncMode);
      window.removeEventListener('hashchange', syncMode);
    };
  }, [mode]);

  function selectMode(nextMode: Mode) {
    if (nextMode === mode) return;
    window.history.pushState(null, '', `#${nextMode}`);
    setMode(nextMode);
  }

  function handleTabKeys(event: KeyboardEvent<HTMLDivElement>) {
    let nextMode: Mode;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        nextMode = mode === 'email' ? 'password' : 'email';
        break;
      case 'Home':
        nextMode = 'email';
        break;
      case 'End':
        nextMode = 'password';
        break;
      default:
        return;
    }

    event.preventDefault();
    selectMode(nextMode);
    (nextMode === 'email' ? emailTab : passwordTab).current?.focus();
  }

  return (
    <div id="top" className="app-shell">
      <a className="skip-link" href="#checker">Skip to breach checker</a>
      <header className="site-header">
        <div className="page-width header-inner">
          <a className="brand" href="#top" aria-label="PwnedApp home">
            <Icon className="brand-mark" name="shield" size={23} />
            PwnedApp
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="#how-it-works">Privacy</a>
          </nav>
        </div>
      </header>

      <main className="page-width main-content">
        <div className="intro">
          <h1>Check your email or password</h1>
          <p>Note: This is just a demo the code is not calling the actual HIBP API as it now charges uses</p>
          <p>See if it appears in a known data breach.</p>
        </div>

        <section className="checker-card tool-width" id="checker" aria-label="Breach checker" tabIndex={-1}>
          <div className="checker-tabs" role="tablist" aria-label="Check type" onKeyDown={handleTabKeys}>
            {(Object.keys(modes) as Mode[]).map((tabMode) => (
              <button key={tabMode} ref={tabMode === 'email' ? emailTab : passwordTab}
                type="button" id={`tab-${tabMode}`} role="tab" aria-selected={mode === tabMode}
                aria-controls={`panel-${tabMode}`} tabIndex={mode === tabMode ? 0 : -1}
                onClick={() => selectMode(tabMode)}>
                <Icon name={modes[tabMode].icon} size={19} /> {modes[tabMode].tab}
              </button>
            ))}
          </div>
          {(Object.keys(modes) as Mode[]).map((tabMode) => (
            <div key={tabMode} id={`panel-${tabMode}`} role="tabpanel" aria-labelledby={`tab-${tabMode}`}
              hidden={mode !== tabMode} className="checker-panel">
              {mode === tabMode && <Checker />}
            </div>
          ))}
        </section>

        <section className="check-guide tool-width" id="how-it-works" aria-labelledby="guide-title" tabIndex={-1}>
          <h2 id="guide-title">What gets shared</h2>
          <dl>
            <div>
              <dt>Email addresses</dt>
              <dd>We send each address to <a href={hibpUrl}>Have I Been Pwned</a> to find matching breaches.</dd>
            </div>
            <div>
              <dt>Passwords</dt>
              <dd>Your browser hashes the password and shares only the first five characters of that hash. It checks for a match on your device.</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
