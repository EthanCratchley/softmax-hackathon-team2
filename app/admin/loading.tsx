import desk from '../desk/roster.module.css';

export default function AdminLoading() {
  return <main className={desk.desk} data-testid="admin-loading"><p role="status">Loading the operations dashboard…</p></main>;
}
