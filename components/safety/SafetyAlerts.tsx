import type { SafetyAlert } from '@/lib/domain/types';
import s from './workspace.module.css';

export function SafetyAlerts({ alerts, testId }: { alerts: SafetyAlert[]; testId: string }) {
  return alerts.map((a, n) => (
    <div key={n} className={s.alert} data-testid={testId} data-kind={a.kind} role="note">
      <strong>{a.summary}</strong>
      {a.medicationLocation && <p>Medication: {a.medicationLocation}</p>}
      {a.instructions && <p>What to do: {a.instructions}</p>}
    </div>
  ));
}
