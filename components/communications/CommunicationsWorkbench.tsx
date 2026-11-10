'use client';

import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { CommAnnouncement, CommunicationWorkspace, EmergencyAlertInput } from '@/lib/domain/communications';
import {
  acknowledgeEmergencyAlertAction,
  markAnnouncementReadAction,
  markConversationReadAction,
  issueEmergencyAlertAction,
  markEmergencyAlertViewedAction,
  postAnnouncementAction,
  replyToAnnouncementAction,
  replyToConversationAction,
  startConversationAction,
} from '@/app/communications/actions';

const when = (value: string) => new Date(value).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' });

function Chevron({ open }: { open: boolean }) {
  return <svg className={`communication-chevron${open ? ' is-open' : ''}`} viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

type Feedback = { message: string; success: boolean };
function CommunicationNotice({ notice }: { notice: Feedback | null }) {
  if (!notice) return null;
  return <p className={`alert communication-notice ${notice.success ? 'ok' : 'danger'}`} role={notice.success ? 'status' : 'alert'}>
    <svg className="communication-notice-icon" viewBox="0 0 20 20" aria-hidden="true">
      {notice.success
        ? <path d="m4 10.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        : <><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10 6v4.5m0 3v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>}
    </svg>
    <span>{notice.message}</span>
  </p>;
}

function Disclosure({ title, meta, urgent = false, children, testId, onToggle }: {
  title: string; meta?: string; urgent?: boolean; children: ReactNode; testId: string; onToggle?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  };
  return <article className={`communication-card${urgent ? ' urgent' : ''}`} data-testid={testId}>
    <button className="communication-toggle" type="button" aria-expanded={open} onClick={toggle}>
      <span className="communication-card-copy"><strong>{title}</strong>{meta && <span>{meta}</span>}</span>
      <Chevron open={open} />
    </button>
    <div className={`communication-disclosure${open ? ' expanded' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="communication-disclosure-inner">{children}</div>
    </div>
  </article>;
}

type AlertView = CommunicationWorkspace['alerts'][number];
function AlertCard({ alert, onView, onAcknowledge, pending }: {
  alert: AlertView; onView: (id: string) => void; onAcknowledge: (id: string) => void; pending: boolean;
}) {
  return <Disclosure title={alert.title} meta={`Posted in the parent portal · ${when(alert.createdAt)}`} urgent testId={`emergency-alert-${alert.id}`} onToggle={(open) => { if (open && !alert.recipient?.viewedAt) onView(alert.id); }}>
    <div className="alert-details">
      <p><strong>Reason</strong>{alert.reason}</p>
      <p><strong>Pickup location</strong>{alert.pickupLocation}</p>
      <p><strong>Pickup time</strong>{alert.pickupTime}</p>
      <p><strong>Detailed instructions</strong>{alert.instructions}</p>
      {alert.contactInfo && <p><strong>Contact information</strong>{alert.contactInfo}</p>}
      <p className="small muted">Issued by {alert.issuerName}. Acknowledging confirms receipt only; authorized pickup and ID checks still apply.</p>
      {alert.recipient?.acknowledgedAt
        ? <p role="status" className="acknowledged">Acknowledged {when(alert.recipient.acknowledgedAt)}</p>
        : <button className="button danger" type="button" onClick={() => onAcknowledge(alert.id)} disabled={pending} data-testid={`acknowledge-${alert.id}`}>I’ve received this alert</button>}
    </div>
  </Disclosure>;
}

export function ParentUrgentAlerts({ workspace }: { workspace: CommunicationWorkspace | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<Feedback | null>(null);
  const alerts = workspace?.alerts ?? [];
  const view = (id: string) => startTransition(async () => {
    const result = await markEmergencyAlertViewedAction(id);
    if (result.ok) router.refresh();
    else setNotice({ message: result.message, success: false });
  });
  const acknowledge = (id: string) => startTransition(async () => {
    setNotice(null);
    const result = await acknowledgeEmergencyAlertAction(id);
    setNotice({ message: result.message, success: result.ok });
  });
  return <section className="communications-section urgent-section" aria-labelledby="parent-alerts-title">
    <div className="communications-section-heading"><div><p className="eyebrow">Safety updates</p><h2 id="parent-alerts-title">Emergency alerts</h2></div></div>
    {!workspace && <p className="alert danger" role="alert">Emergency alerts could not be loaded right now.</p>}
    {alerts.length ? alerts.map((alert) => <AlertCard key={alert.id} alert={alert} onView={view} onAcknowledge={acknowledge} pending={pending} />) : workspace && <p className="communications-empty">No current emergency alerts.</p>}
    <CommunicationNotice notice={notice} />
  </section>;
}

type MessageThread = CommunicationWorkspace['conversations'][number];
function ThreadCard({ conversation, userId, onSend, onRead, pending }: {
  conversation: MessageThread; userId: string; onSend: (id: string, body: string) => void; onRead: (conversationId: string, lastVisibleMessageId: string) => void; pending: boolean;
}) {
  const [body, setBody] = useState('');
  const latest = conversation.messages.at(-1);
  const title = userId === conversation.parentUserId ? `Instructor · ${conversation.childName}` : `${conversation.parentName} · ${conversation.childName}`;
  return <Disclosure title={title} meta={`Private · Group ${conversation.groupNumber} · ${latest ? when(latest.sentAt) : 'No messages yet'}`} testId={`conversation-${conversation.id}`} onToggle={(open) => { if (open && latest) onRead(conversation.id, latest.id); }}>
    <ol className="message-thread">{conversation.messages.map((message) => <li className={message.senderUserId === userId ? 'own-message' : ''} key={message.id}>
      {message.announcementContext && <aside className="announcement-reply-context" aria-label={`Replying to announcement: ${message.announcementContext.title}`}>
        <span className="announcement-reply-label">Replying to announcement</span>
        <strong>{message.announcementContext.title}</strong>
        <p>{message.announcementContext.excerpt}</p>
        <time dateTime={message.announcementContext.sentAt}>{when(message.announcementContext.sentAt)}</time>
      </aside>}
      <strong>{message.senderName}</strong><p>{message.body}</p><time dateTime={message.sentAt}>{when(message.sentAt)}</time>
    </li>)}</ol>
    <form className="communication-reply" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (body.trim()) { onSend(conversation.id, body.trim()); setBody(''); } }}>
      <label className="sr-only" htmlFor={`reply-${conversation.id}`}>Reply privately</label>
      <textarea id={`reply-${conversation.id}`} value={body} onChange={(event) => setBody(event.target.value)} rows={2} maxLength={1000} placeholder="Write a private reply…" data-testid={`reply-input-${conversation.id}`} />
      <button className="button primary" type="submit" disabled={!body.trim() || pending} data-testid={`reply-send-${conversation.id}`}>{pending ? 'Sending…' : 'Send privately'}</button>
    </form>
  </Disclosure>;
}

function PrivateReplyForm({ announcement, children, onSend, pending }: {
  announcement: CommAnnouncement; children: CommunicationWorkspace['children']; onSend: (announcementId: string, childId: string, body: string) => void; pending: boolean;
}) {
  const [body, setBody] = useState('');
  const [childId, setChildId] = useState(children.find((child) => announcement.groupIds.includes(child.groupId))?.id ?? '');
  const eligibleChildren = children.filter((child) => announcement.groupIds.includes(child.groupId));
  return <form className="communication-reply private-announcement-reply" onSubmit={(event) => { event.preventDefault(); if (body.trim() && childId) { onSend(announcement.id, childId, body.trim()); setBody(''); } }}>
    {eligibleChildren.length > 1 && <label className="communication-field">For child<select value={childId} onChange={(event) => setChildId(event.target.value)}>{eligibleChildren.map((child) => <option value={child.id} key={child.id}>{child.name} · Group {child.groupNumber}</option>)}</select></label>}
    <label className="sr-only" htmlFor={`announcement-reply-${announcement.id}`}>Reply privately to instructor</label>
    <textarea id={`announcement-reply-${announcement.id}`} value={body} onChange={(event) => setBody(event.target.value)} rows={2} maxLength={1000} placeholder="Reply privately to your instructor…" data-testid={`announcement-private-reply-${announcement.id}`} />
    <button className="button primary" type="submit" disabled={!body.trim() || !childId || pending}>{pending ? 'Sending…' : 'Reply privately'}</button>
  </form>;
}

export function CommunicationsWorkbench({ workspace }: { workspace: CommunicationWorkspace | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<Feedback | null>(null);
  const [selectedChild, setSelectedChild] = useState(workspace?.children[0]?.id ?? '');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(workspace?.groups.map((group) => group.id) ?? []);
  const [audience, setAudience] = useState<'groups' | 'all'>('groups');
  const [instructorThreadFilter, setInstructorThreadFilter] = useState<'all' | 'announcement' | 'private'>('all');
  const role = workspace?.role ?? 'parent';
  const instructorConversations = workspace?.role === 'instructor' ? workspace.conversations : [];
  const filteredInstructorConversations = instructorConversations.filter((conversation) => {
    const isAnnouncementReply = conversation.messages.some((message) => message.announcementContext !== null);
    return instructorThreadFilter === 'all' || (instructorThreadFilter === 'announcement' ? isAnnouncementReply : !isAnnouncementReply);
  });
  const run = (action: () => Promise<{ ok: boolean; message: string }>) => startTransition(async () => {
    setNotice(null);
    const result = await action();
    setNotice({ message: result.message, success: result.ok });
    if (result.ok) router.refresh();
  });
  const sendPrivate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = String(new FormData(event.currentTarget).get('message') ?? '').trim();
    if (!selectedChild || !body) return;
    run(() => startConversationAction(selectedChild, body));
    event.currentTarget.reset();
  };
  const reply = (id: string, body: string) => run(() => replyToConversationAction(id, body));
  const markConversationRead = (id: string, lastVisibleMessageId: string) => startTransition(async () => {
    const result = await markConversationReadAction(id, lastVisibleMessageId);
    if (result.ok) router.refresh();
    else setNotice({ message: result.message, success: false });
  });
  const markAnnouncementRead = (id: string) => startTransition(async () => {
    const result = await markAnnouncementReadAction(id);
    if (result.ok) router.refresh();
    else setNotice({ message: result.message, success: false });
  });
  const privateAnnouncementReply = (id: string, childId: string, body: string) => run(() => replyToAnnouncementAction(id, childId, body));
  const postAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = String(new FormData(event.currentTarget).get('announcement') ?? '').trim();
    if (!body || !selectedGroups.length) return;
    run(() => postAnnouncementAction(selectedGroups, body));
    event.currentTarget.reset();
  };
  const createAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: EmergencyAlertInput = {
      title: String(data.get('title') ?? ''),
      reason: String(data.get('reason') ?? ''),
      pickupLocation: String(data.get('pickupLocation') ?? ''),
      pickupTime: String(data.get('pickupTime') ?? ''),
      instructions: String(data.get('instructions') ?? ''),
      contactInfo: String(data.get('contactInfo') ?? ''),
      allParents: audience === 'all',
      groupIds: audience === 'all' ? [] : Array.from(data.getAll('groupIds')).map(String),
    };
    run(() => issueEmergencyAlertAction(input));
    event.currentTarget.reset();
  };

  return <main className="page communications-page" data-testid={`communications-${role}`}>
    <header className="communications-heading"><p className="eyebrow">Kestrel Kids · {role}</p><h1>{role === 'admin' ? 'Emergency communications' : 'Messages & updates'}</h1><p className="page-intro">{role === 'parent' ? 'Private messages with your child’s instructor, group updates, and urgent safety alerts.' : role === 'instructor' ? 'Private family conversations and announcements for your assigned groups.' : 'Send urgent pickup updates to all families or selected lesson groups.'}</p></header>
    {!workspace && <p className="alert danger" role="alert">Communications could not be loaded right now. Please refresh the page.</p>}
    <CommunicationNotice notice={notice} />

    {workspace?.role === 'parent' && <>
      <ParentUrgentAlerts workspace={workspace} />
      <section className="communications-section" aria-labelledby="announcements-title"><div className="communications-section-heading"><div><p className="eyebrow">For your lesson group</p><h2 id="announcements-title">Announcements</h2></div></div>
        {workspace.announcements.map((announcement) => <Disclosure key={announcement.id} title={`Group ${announcement.groupNumbers.join(', ')} announcement`} meta={`${announcement.instructorName} · ${when(announcement.sentAt)}`} testId={`announcement-${announcement.id}`} onToggle={(open) => { if (open) markAnnouncementRead(announcement.id); }}>
          <p className="announcement-body">{announcement.body}</p><PrivateReplyForm announcement={announcement} children={workspace.children} onSend={privateAnnouncementReply} pending={pending} />
        </Disclosure>)}
        {!workspace.announcements.length && <p className="communications-empty">No group announcements yet.</p>}
      </section>
      <section className="communications-section" aria-labelledby="messages-title"><div className="communications-section-heading"><div><p className="eyebrow">One-to-one</p><h2 id="messages-title">Private conversations</h2></div></div>
        <form className="communication-compose new-conversation" onSubmit={sendPrivate} data-testid="new-conversation-form"><label className="communication-field">Child<select value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)} data-testid="message-child-select">{workspace.children.map((child) => <option value={child.id} key={child.id}>{child.name} · Group {child.groupNumber} · {child.instructorName}</option>)}</select></label><label className="communication-field">Message<textarea name="message" rows={2} required maxLength={1000} placeholder="Start a private conversation…" data-testid="new-message-input" /></label><button className="button primary" type="submit" disabled={!workspace.children.length || pending}>{pending ? 'Sending…' : 'Start private conversation'}</button></form>
        {workspace.conversations.length ? workspace.conversations.map((conversation) => <ThreadCard key={conversation.id} conversation={conversation} userId={workspace.userId} onSend={reply} onRead={markConversationRead} pending={pending} />) : <p className="communications-empty">No private conversations yet.</p>}
      </section>
    </>}

    {workspace?.role === 'instructor' && <>
      <section className="communications-section" aria-labelledby="announce-compose-title"><div className="communications-section-heading"><div><p className="eyebrow">Assigned lesson groups</p><h2 id="announce-compose-title">Send a group announcement</h2></div></div>
        {workspace.groups.length ? <form className="communication-compose" onSubmit={postAnnouncement} data-testid="announcement-form"><fieldset className="group-checkboxes"><legend>Lesson groups</legend>{workspace.groups.map((group) => <label key={group.id}><input type="checkbox" value={group.id} checked={selectedGroups.includes(group.id)} onChange={(event) => setSelectedGroups((current) => event.target.checked ? [...current, group.id] : current.filter((id) => id !== group.id))} /> Group {group.groupNumber}</label>)}</fieldset><label className="communication-field">Announcement<textarea name="announcement" rows={3} required maxLength={2000} placeholder="Share a meeting point or lesson update…" data-testid="announcement-input" /></label><button className="button primary" type="submit" disabled={!selectedGroups.length || pending}>{pending ? 'Posting…' : 'Post announcement'}</button><p className="small muted">Parents reply in a private conversation. Replies are never shown to other families.</p></form> : <p className="communications-empty">No lesson groups are assigned.</p>}
      </section>
      <section className="communications-section" aria-labelledby="instructor-conversations-title"><div className="communications-section-heading"><div><p className="eyebrow">Assigned families</p><h2 id="instructor-conversations-title">Conversations</h2></div></div>
        <div className="conversation-filters" role="group" aria-label="Filter instructor conversations">
          {(['all', 'announcement', 'private'] as const).map((filter) => <button key={filter} type="button" className={`conversation-filter${instructorThreadFilter === filter ? ' active' : ''}`} aria-pressed={instructorThreadFilter === filter} onClick={() => setInstructorThreadFilter(filter)}>
            {filter === 'all' ? 'All conversations' : filter === 'announcement' ? 'Announcement replies' : 'Private messages'}
          </button>)}
        </div>
        {filteredInstructorConversations.length ? filteredInstructorConversations.map((conversation) => <ThreadCard key={conversation.id} conversation={conversation} userId={workspace.userId} onSend={reply} onRead={markConversationRead} pending={pending} />) : <p className="communications-empty">{instructorThreadFilter === 'announcement' ? 'No announcement replies yet.' : instructorThreadFilter === 'private' ? 'No private conversations yet.' : 'No parent conversations yet.'}</p>}
      </section>
      <section className="communications-section" aria-labelledby="sent-announcements-title"><div className="communications-section-heading"><div><p className="eyebrow">Recent group posts</p><h2 id="sent-announcements-title">Announcements</h2></div></div>
        {workspace.announcements.map((announcement) => <Disclosure key={announcement.id} title={`Group ${announcement.groupNumbers.join(', ')}`} meta={when(announcement.sentAt)} testId={`announcement-${announcement.id}`}><p className="announcement-body">{announcement.body}</p><p className="small muted">Parent replies go to private conversations.</p></Disclosure>)}
        {!workspace.announcements.length && <p className="communications-empty">No announcements have been posted.</p>}
      </section>
    </>}

    {workspace?.role === 'admin' && <>
      <section className="communications-section" aria-labelledby="alert-create-title"><div className="communications-section-heading"><div><p className="eyebrow">Safety broadcast</p><h2 id="alert-create-title">Create an emergency alert</h2></div></div>
        <form className="communication-compose alert-compose" onSubmit={createAlert} data-testid="emergency-alert-form">
          <label className="communication-field">Alert title<input name="title" required maxLength={120} placeholder="Early dismissal notice" /></label>
          <label className="communication-field">Audience<select name="audience" value={audience} onChange={(event) => setAudience(event.target.value as 'groups' | 'all')}><option value="groups">Selected lesson groups</option><option value="all">All parents</option></select></label>
          {audience === 'groups' && <fieldset className="group-checkboxes"><legend>Lesson groups</legend>{workspace.groups.map((group) => <label key={group.id}><input type="checkbox" name="groupIds" value={group.id} defaultChecked /> Group {group.groupNumber}</label>)}</fieldset>}
          <label className="communication-field">Reason<input name="reason" required maxLength={300} /></label>
          <label className="communication-field">Pickup location<input name="pickupLocation" required maxLength={240} /></label>
          <label className="communication-field">Pickup time<input name="pickupTime" required maxLength={100} placeholder="12:30 p.m. today" /></label>
          <label className="communication-field">Detailed instructions<textarea name="instructions" rows={4} required maxLength={2000} /></label>
          <label className="communication-field">Contact information (optional)<input name="contactInfo" maxLength={240} /></label>
          <button className="button danger" type="submit" disabled={pending}>{pending ? 'Posting alert…' : 'Create urgent alert'}</button><p className="small muted">This posts an in-app alert only. It does not send email or text messages.</p>
        </form>
      </section>
      <section className="communications-section" aria-labelledby="active-alerts-title"><div className="communications-section-heading"><div><p className="eyebrow">Recipients and acknowledgements</p><h2 id="active-alerts-title">Emergency alerts</h2></div></div>
        {workspace.alerts.map((alert) => {
          const acknowledged = alert.recipients.filter((entry) => entry.acknowledgedAt).length;
          const viewed = alert.recipients.filter((entry) => entry.viewedAt).length;
          return <Disclosure key={alert.id} title={alert.title} meta={`${alert.recipients.length} targeted · ${viewed} viewed · ${acknowledged} acknowledged`} urgent testId={`admin-alert-${alert.id}`}><div className="alert-details"><p><strong>Reason</strong>{alert.reason}</p><p><strong>Pickup location</strong>{alert.pickupLocation}</p><p><strong>Pickup time</strong>{alert.pickupTime}</p><p><strong>Instructions</strong>{alert.instructions}</p>{alert.contactInfo && <p><strong>Contact information</strong>{alert.contactInfo}</p>}<p><strong>Issued by</strong>{alert.issuerName} · {when(alert.createdAt)}</p></div><h3 className="recipient-heading">Targeted parent accounts</h3><ul className="recipient-list">{alert.recipients.map((recipient) => <li key={recipient.userId}><span>{recipient.name}</span><span>Targeted {when(recipient.createdAt)} · {recipient.viewedAt ? `Viewed ${when(recipient.viewedAt)}` : 'Not viewed'} · {recipient.acknowledgedAt ? `Acknowledged ${when(recipient.acknowledgedAt)}` : 'Awaiting acknowledgement'}</span></li>)}</ul></Disclosure>;
        })}
        {!workspace.alerts.length && <p className="communications-empty">No emergency alerts have been posted.</p>}
      </section>
    </>}
  </main>;
}
