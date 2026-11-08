'use client';

import { useEffect } from 'react';
import styles from './roster.module.css';

export default function DeskError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Desk roster failed to load', error); }, [error]);
  return <main className={styles.desk} data-testid="desk-load-error"><p role="alert" className={styles.warning}>The desk roster could not be loaded. Try again.</p><button type="button" onClick={reset}>Retry</button></main>;
}
