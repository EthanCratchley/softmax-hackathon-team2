import styles from './roster.module.css';

export default function DeskLoading() {
  return <main className={styles.desk} data-testid="desk-loading"><p role="status">Loading the desk roster…</p></main>;
}
