'use client';

import { useEffect } from 'react';
import desk from '../desk/roster.module.css';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Admin dashboard failed to load', error); }, [error]);
  return <main className={desk.desk} data-testid="admin-load-error"><p role="alert" className={desk.warning}>The operations dashboard could not be loaded. Try again.</p><button type="button" onClick={reset}>Retry</button></main>;
}
