'use client';

export default function ParentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page"><div className="alert danger" role="alert"><h1>We couldn’t load this parent page</h1><p>Your information has not been changed. Check your connection and try again.</p><button className="button" onClick={reset}>Try again</button></div></main>;
}
