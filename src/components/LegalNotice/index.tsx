import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { defineStorage } from 'strata-storage';

import styles from './styles.module.css';

/**
 * The first-visit legal notice — one quiet bar, once per browser (fleet law `legal-notice.md`, OD-149 §B).
 *
 * 🔴 NEVER A DIALOG: no overlay, no focus trap, no title, `role="status"`, and the page stays usable under it.
 * Marked seen the moment it shows; it leaves by itself after ten seconds, hover or focus hold that timer, and
 * Okay or Escape close it at once. The words are the app's (`labflow/src/content/en/legal/notice.ts`); the
 * links go to the product's own policy pages. This site has no accounts, so the device flag is the record.
 */
/* Built on first use in the browser, never at import: the static build renders this module in Node. */
let storage: ReturnType<typeof defineStorage> | null = null;
const store = (): ReturnType<typeof defineStorage> => (storage ??= defineStorage({ namespace: 'labflow-docs' }));
const SEEN_KEY = 'legal-notice-seen';
const AUTO_DISMISS_MS = 10_000;
const SITE = 'https://labflow.aoneahsan.com';

export default function LegalNotice(): ReactNode {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = typeof store().getSync<string>(SEEN_KEY, { storage: 'localStorage' }) === 'string';
      if (!seen) store().setSync(SEEN_KEY, new Date().toISOString(), { storage: 'localStorage' });
    } catch {
      /* Storage refused (private mode): show it this once rather than never. */
    }
    if (!seen) setVisible(true);
  }, []);

  const stop = (): void => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  const close = (): void => {
    stop();
    setVisible(false);
  };
  const arm = (): void => {
    stop();
    timer.current = setTimeout(close, AUTO_DISMISS_MS);
  };

  useEffect(() => {
    if (!visible) return undefined;
    arm();
    return stop;
    // `arm` and `stop` touch only the ref; arming once per showing is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.wrap}>
      <div
        ref={bar}
        className={styles.bar}
        role="status"
        aria-live="polite"
        onMouseEnter={stop}
        onMouseLeave={() => {
          if (!bar.current?.contains(document.activeElement)) arm();
        }}
        onFocus={stop}
        onBlur={(event) => {
          if (!bar.current?.contains(event.relatedTarget as Node | null)) arm();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
      >
        <p className={styles.text}>
          By using LabFlow, you agree to our <a href={`${SITE}/privacy-policy`}>Privacy Policy</a> and{' '}
          <a href={`${SITE}/terms`}>Terms of Service</a>.
        </p>
        <button type="button" className="button button--primary button--sm" onClick={close}>
          Okay
        </button>
      </div>
    </div>
  );
}
