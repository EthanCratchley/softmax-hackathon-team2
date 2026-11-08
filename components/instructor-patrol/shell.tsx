import Link from 'next/link';
import styles from './workspace.module.css';

export default function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className={styles.workspace} data-testid="safety-workspace">
    <header><span className="brand">▲ KESTREL KIDS</span><span className={styles.pill}>Design preview</span></header>
    <div className={styles.banner}>Fictional data only. Changes last while you browse here and reset on reload. Sign-in and secure saving are not connected.</div>
    <nav aria-label="Design previews"><Link data-testid="instructor-nav" href="/instructor">Instructor preview</Link><Link data-testid="patrol-nav" href="/patrol">Patrol preview</Link></nav>
    <h1>{title}</h1>{children}
    <footer>Use radios and resort procedures if there is no signal. People contact families and responders; this preview sends no messages.</footer>
  </main>;
}
