import type { DeskChild } from '@/lib/desk/fixtures';
import type { ReleaseRecord } from '@/lib/desk/pickup-mock';
import styles from './roster.module.css';

const recorded = (value?: string) => Boolean(value?.trim());
const validTime = (value?: string) => recorded(value) && !Number.isNaN(Date.parse(value!));

function RecordedTime({ value }: { value?: string }) {
  if (!validTime(value)) return <>Not recorded</>;
  return <time dateTime={value}>{new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver',
  }).format(new Date(value!))} Pacific</time>;
}

export default function AttendanceHistory({ child, release }: {
  child: DeskChild;
  release?: Partial<ReleaseRecord>;
}) {
  const missing = [
    !recorded(child.bib) && 'bib number',
    !validTime(child.checkedInAt) && 'check-in time',
    !recorded(child.checkedInBy) && 'check-in staff',
    ...(child.status === 'released' ? [
      !validTime(release?.releasedAt) && 'release time',
      !recorded(release?.staff) && 'release staff',
      !recorded(release?.adultName) && 'authorized pickup adult',
      !recorded(release?.source) && 'authorization source',
    ] : []),
  ].filter(Boolean);

  return <div data-testid={`check-in-details-${child.id}`}>
    <p>Bib {recorded(child.bib) ? child.bib : 'Not recorded'}</p>
    <dl className={styles.attendanceHistory}>
      <dt>Checked in at</dt><dd data-testid={`check-in-time-${child.id}`}><RecordedTime value={child.checkedInAt} /></dd>
      <dt>Checked in by</dt><dd data-testid={`check-in-staff-${child.id}`}>{recorded(child.checkedInBy) ? child.checkedInBy : 'Not recorded'}</dd>
      {child.status === 'released' && <>
        <dt>Released at</dt><dd data-testid={`release-time-${child.id}`}><RecordedTime value={release?.releasedAt} /></dd>
        <dt>Released by</dt><dd data-testid={`release-staff-${child.id}`}>{recorded(release?.staff) ? release?.staff : 'Not recorded'}</dd>
        <dt>Authorized pickup adult</dt><dd data-testid={`release-adult-${child.id}`}>{recorded(release?.adultName) ? release?.adultName : 'Not recorded'}</dd>
        <dt>Authorization source</dt><dd data-testid={`release-source-${child.id}`}>{recorded(release?.source) ? release?.source : 'Not recorded'}</dd>
      </>}
    </dl>
    {missing.length > 0 && <p className={styles.warning} data-testid={`attendance-incomplete-${child.id}`}>Incomplete attendance history · Not recorded: {missing.join(', ')}.</p>}
  </div>;
}
