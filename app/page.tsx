import Link from 'next/link';

const workspaces = [
  ['Parent', 'Child details, emergency contacts and authorized pickup adults.'],
  ['Instructor', 'Assigned groups, safety alerts and missing-child reporting.'],
  ['Desk', 'Check-in, pickup verification and daily attendance.'],
  ['Patrol', 'Emergency information and incident timelines.'],
  ['Admin', 'Missing information, group assignments and daily overview.'],
];

export default function Home() {
  return (
    <main data-testid="frontend-home">
      <header><span className="brand">▲ KESTREL KIDS</span><span className="badge">Design preview</span></header>
      <section className="intro">
        <p className="eyebrow">SAFETY STARTS WITH SHARED INFORMATION</p>
        <h1>One team.<br />Every child accounted for.</h1>
        <p className="description">Explore the instructor roster, report a missing child, and follow an incident with patrol. These previews use fictional children and sample information.</p>
      </section>
      <section aria-label="Team workspaces" className="grid">
        {workspaces.map(([name, description], index) => (
          <article key={name} data-testid={`workspace-${name.toLowerCase()}`}>
            <span className="number">0{index + 1}</span><h2>{name}</h2><p>{description}</p>
            {name === 'Instructor' || name === 'Patrol' ? (
              <Link className="status preview-link" data-testid={`open-${name.toLowerCase()}-preview`} href={`/${name.toLowerCase()}`}>Open {name.toLowerCase()} preview →</Link>
            ) : <span className="status">Coming next</span>}
          </article>
        ))}
      </section>
      <footer>Local design preview · Fictional data only · No sign-in required for frontend development</footer>
    </main>
  );
}
