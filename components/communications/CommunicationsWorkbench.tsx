'use client';

import { useState, type FormEvent } from 'react';
import type { DemoAlert, DemoAnnouncement, DemoConversation, DemoWorkspace } from '@/lib/communications-demo';

const when = (value: string) => new Date(value).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' });

function Chevron({ open }: { open: boolean }) {
  return <svg className={`communication-chevron${open ? ' is-open' : ''}`} viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Disclosure({ title, meta, urgent = false, children, testId }: {
  title: string; meta?: string; urgent?: boolean; children: React.ReactNode; testId: string;
}) {
  const [open, setOpen] = useState(false);
  return <article className={`communication-card${urgent ? ' urgent' : ''}`} data-testid={testId}>
    <button className="communication-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span className="communication-card-copy"><strong>{title}</strong>{meta && <span>{meta}</span>}</span>
      <Chevron open={open} />
    </button>
    <div className={`communication-disclosure${open ? ' expanded' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="communication-disclosure-inner">{children}</div>
    </div>
  </article>;
}

function AlertCard({ alert, userId, onAcknowledge }: { alert: DemoAlert; userId: string; onAcknowledge: (id: string) => void }) {
  const recipient = alert.recipients.find((entry) => entry.userId === userId);
  const [open, setOpen] = useState(false);
  return <article className="communication-card urgent alert-card" data-testid={`emergency-alert-${alert.id}`}>
    <button className="communication-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span className="urgent-badge">Urgent safety alert</span>
      <span className="communication-card-copy"><strong>{alert.title}</strong><span>Pickup information · {when(alert.createdAt)}</span></span>
      <Chevron open={open} />
    </button>
    <div className={`communication-disclosure${open ? ' expanded' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="communication-disclosure-inner alert-details">
        <p><strong>Reason</strong>{alert.reason}</p>
        <p><strong>Pickup location</strong>{alert.pickupLocation}</p>
        <p><strong>Pickup time</strong>{alert.pickupTime}</p>
        <p><strong>Instructions</strong>{alert.instructions}</p>
        {alert.contactInfo && <p><strong>Contact</strong>{alert.contactInfo}</p>}
        {recipient && (recipient.acknowledgedAt ? <p role="status" className="acknowledged">Acknowledged {when(recipient.acknowledgedAt)}</p> : <button className="button danger" type="button" onClick={() => onAcknowledge(alert.id)} data-testid={`acknowledge-${alert.id}`}>Acknowledge alert</button>)}
      </div>
    </div>
  </article>;
}

function ThreadCard({ conversation, userId, onSend }: { conversation: DemoConversation; userId: string; onSend: (id: string, body: string) => void }) {
  const [body, setBody] = useState('');
  const latest = conversation.messages.at(-1);
  return <Disclosure title={`${conversation.parentName} · ${conversation.childName}`} meta={`Private conversation · Group ${conversation.groupNumber} · ${latest ? when(latest.sentAt) : 'No messages yet'}`} testId={`conversation-${conversation.id}`}>
    <ol className="message-thread">{conversation.messages.map((message) => <li className={message.senderId === userId ? 'own-message' : ''} key={message.id}>
      <strong>{message.senderName}</strong><p>{message.body}</p><time dateTime={message.sentAt}>{when(message.sentAt)}</time>
    </li>)}</ol>
    <form className="communication-reply" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (body.trim()) { onSend(conversation.id, body.trim()); setBody(''); } }}>
      <label className="sr-only" htmlFor={`reply-${conversation.id}`}>Reply privately</label>
      <textarea id={`reply-${conversation.id}`} value={body} onChange={(event) => setBody(event.target.value)} rows={2} maxLength={1000} placeholder="Write a private reply…" data-testid={`reply-input-${conversation.id}`} />
      <button className="button primary" type="submit" disabled={!body.trim()} data-testid={`reply-send-${conversation.id}`}>Send privately</button>
    </form>
  </Disclosure>;
}

export function ParentUrgentAlerts({ workspace }: { workspace: DemoWorkspace }) {
  const [alerts, setAlerts] = useState(workspace.alerts);
  const acknowledge = (id: string) => setAlerts((current) => current.map((alert) => alert.id !== id ? alert : {
    ...alert, recipients: alert.recipients.map((recipient) => recipient.userId === workspace.userId ? { ...recipient, acknowledgedAt: new Date().toISOString() } : recipient),
  }));
  return <section className="communications-section urgent-section" aria-labelledby="parent-alerts-title">
    <div className="communications-section-heading"><div><p className="eyebrow">Safety updates</p><h2 id="parent-alerts-title">Emergency alerts</h2></div></div>
    {alerts.length ? alerts.map((alert) => <AlertCard key={alert.id} alert={alert} userId={workspace.userId} onAcknowledge={acknowledge} />) : <p className="communications-empty">No current emergency alerts.</p>}
  </section>;
}

export function CommunicationsWorkbench({ workspace }: { workspace: DemoWorkspace }) {
  const [conversations, setConversations] = useState(workspace.conversations);
  const [announcements, setAnnouncements] = useState(workspace.announcements);
  const [alerts, setAlerts] = useState(workspace.alerts);
  const [selectedChild, setSelectedChild] = useState(workspace.children[0]?.id ?? '');
  const [announcementGroup, setAnnouncementGroup] = useState(workspace.groups[0]?.id ?? '');

  const sendReply = (conversationId: string, body: string) => setConversations((current) => current.map((conversation) => conversation.id !== conversationId ? conversation : {
    ...conversation, messages: [...conversation.messages, { id: `message-${Date.now()}`, senderId: workspace.userId, senderName: workspace.displayName, body, sentAt: new Date().toISOString() }],
  }));

  const startParentConversation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const child = workspace.children.find((entry) => entry.id === selectedChild);
    const data = new FormData(event.currentTarget);
    const body = String(data.get('message') ?? '').trim();
    if (!child || !body) return;
    const existing = conversations.find((conversation) => conversation.parentUserId === workspace.userId && conversation.childName === child.name && conversation.instructorUserId === child.instructorUserId);
    if (existing) sendReply(existing.id, body);
    else setConversations((current) => [...current, {
      id: `conversation-${Date.now()}`, parentUserId: workspace.userId, parentName: workspace.displayName, childName: child.name,
      instructorUserId: child.instructorUserId, instructorName: child.instructorName, groupId: child.groupId, groupNumber: child.groupNumber,
      messages: [{ id: `message-${Date.now()}`, senderId: workspace.userId, senderName: workspace.displayName, body, sentAt: new Date().toISOString() }],
    }]);
    event.currentTarget.reset();
  };

  const sendAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = String(data.get('announcement') ?? '').trim();
    const group = workspace.groups.find((entry) => entry.id === announcementGroup);
    if (!body || !group) return;
    setAnnouncements((current) => [{ id: `announcement-${Date.now()}`, instructorUserId: workspace.userId, instructorName: workspace.displayName, groupId: group.id, groupNumber: group.groupNumber, body, sentAt: new Date().toISOString() }, ...current]);
    event.currentTarget.reset();
  };

  const createAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const allGroups = data.get('audience') === 'all';
    const groupIds = allGroups ? null : Array.from(data.getAll('groupIds')).map(String);
    if (!allGroups && !groupIds?.length) return;
    const title = String(data.get('title') ?? '').trim();
    const reason = String(data.get('reason') ?? '').trim();
    const pickupLocation = String(data.get('pickupLocation') ?? '').trim();
    const pickupTime = String(data.get('pickupTime') ?? '').trim();
    const instructions = String(data.get('instructions') ?? '').trim();
    if (!title || !reason || !pickupLocation || !pickupTime || !instructions) return;
    const recipientMap = new Map(workspace.parentGroups.map((parent) => [parent.userId, parent.name]));
    const recipients = [...recipientMap.entries()].filter(([userId]) => allGroups || workspace.parentGroups.some((parent) => parent.userId === userId && groupIds?.includes(parent.groupId)))
      .map(([userId, name]) => ({ userId, name, acknowledgedAt: null }));
    setAlerts((current) => [{
      id: `alert-${Date.now()}`, title, reason, pickupLocation, pickupTime, instructions,
      contactInfo: String(data.get('contactInfo') ?? '').trim() || null, createdAt: new Date().toISOString(), audienceGroupIds: groupIds, recipients,
    }, ...current]);
    event.currentTarget.reset();
  };

  const acknowledge = (id: string) => setAlerts((current) => current.map((alert) => alert.id !== id ? alert : {
    ...alert, recipients: alert.recipients.map((recipient) => recipient.userId === workspace.userId ? { ...recipient, acknowledgedAt: new Date().toISOString() } : recipient),
  }));

  const parentPrivateReply = (announcement: DemoAnnouncement, body: string) => {
    const child = workspace.children.find((entry) => entry.groupId === announcement.groupId);
    const existing = conversations.find((conversation) => conversation.parentUserId === workspace.userId && conversation.instructorUserId === announcement.instructorUserId && conversation.groupId === announcement.groupId);
    if (existing) return sendReply(existing.id, body);
    if (child) setConversations((current) => [...current, {
      id: `conversation-${Date.now()}`, parentUserId: workspace.userId, parentName: workspace.displayName,
      childName: child.name, instructorUserId: announcement.instructorUserId, instructorName: announcement.instructorName,
      groupId: child.groupId, groupNumber: child.groupNumber,
      messages: [{ id: `message-${Date.now()}`, senderId: workspace.userId, senderName: workspace.displayName, body, sentAt: new Date().toISOString() }],
    }]);
  };

  return <main className="page communications-page" data-testid={`communications-${workspace.role}`}>
    <header className="communications-heading"><p className="eyebrow">Kestrel Kids · {workspace.role}</p><h1>{workspace.role === 'admin' ? 'Emergency communications' : 'Messages & updates'}</h1><p className="page-intro">{workspace.role === 'parent' ? 'Private messages with your child’s instructor, group updates, and urgent safety alerts.' : workspace.role === 'instructor' ? 'Private family conversations and announcements for your assigned groups.' : 'Send urgent pickup updates to all families or selected lesson groups.'}</p><p className="mock-notice">Preview with synthetic data · Changes in this screen are temporary.</p></header>

    {workspace.role === 'parent' && <>
      <ParentUrgentAlerts workspace={{ ...workspace, alerts }} />
      <section className="communications-section" aria-labelledby="announcements-title"><div className="communications-section-heading"><div><p className="eyebrow">For your lesson group</p><h2 id="announcements-title">Announcements</h2></div></div>
        {announcements.map((announcement) => <Disclosure key={announcement.id} title={`Group ${announcement.groupNumber} announcement`} meta={`${announcement.instructorName} · ${when(announcement.sentAt)}`} testId={`announcement-${announcement.id}`}>
          <p className="announcement-body">{announcement.body}</p><PrivateReplyForm announcement={announcement} onSend={parentPrivateReply} />
        </Disclosure>)}
      </section>
      <section className="communications-section" aria-labelledby="messages-title"><div className="communications-section-heading"><div><p className="eyebrow">One-to-one</p><h2 id="messages-title">Private conversations</h2></div></div>
        <form className="communication-compose new-conversation" onSubmit={startParentConversation} data-testid="new-conversation-form"><label className="communication-field">Child<select value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)} data-testid="message-child-select">{workspace.children.map((child) => <option value={child.id} key={child.id}>{child.name} · Group {child.groupNumber} · {child.instructorName}</option>)}</select></label><label className="communication-field">Message<textarea name="message" rows={2} required maxLength={1000} placeholder="Start a private conversation…" data-testid="new-message-input" /></label><button className="button primary" type="submit" disabled={!workspace.children.length}>Start private conversation</button></form>
        {conversations.length ? conversations.map((conversation) => <ThreadCard key={conversation.id} conversation={conversation} userId={workspace.userId} onSend={sendReply} />) : <p className="communications-empty">No private conversations yet.</p>}
      </section>
    </>}

    {workspace.role === 'instructor' && <>
      <section className="communications-section" aria-labelledby="announce-compose-title"><div className="communications-section-heading"><div><p className="eyebrow">Assigned lesson groups</p><h2 id="announce-compose-title">Send a group announcement</h2></div></div>
        {workspace.groups.length ? <form className="communication-compose" onSubmit={sendAnnouncement} data-testid="announcement-form"><label className="communication-field">Lesson group<select value={announcementGroup} onChange={(event) => setAnnouncementGroup(event.target.value)}>{workspace.groups.map((group) => <option key={group.id} value={group.id}>Group {group.groupNumber}</option>)}</select></label><label className="communication-field">Announcement<textarea name="announcement" rows={3} required maxLength={2000} placeholder="Share a meeting point or lesson update…" data-testid="announcement-input" /></label><button className="button primary" type="submit">Post announcement</button><p className="small muted">Parents reply in a private conversation. Replies are never shown to the group.</p></form> : <p className="communications-empty">No lesson groups are assigned.</p>}
      </section>
      <section className="communications-section" aria-labelledby="instructor-conversations-title"><div className="communications-section-heading"><div><p className="eyebrow">Assigned families</p><h2 id="instructor-conversations-title">Private conversations</h2></div></div>
        {conversations.length ? conversations.map((conversation) => <ThreadCard key={conversation.id} conversation={conversation} userId={workspace.userId} onSend={sendReply} />) : <p className="communications-empty">No parent conversations yet.</p>}
      </section>
      <section className="communications-section" aria-labelledby="sent-announcements-title"><div className="communications-section-heading"><div><p className="eyebrow">Recent group posts</p><h2 id="sent-announcements-title">Announcements</h2></div></div>
        {announcements.map((announcement) => <Disclosure key={announcement.id} title={`Group ${announcement.groupNumber}`} meta={when(announcement.sentAt)} testId={`announcement-${announcement.id}`}><p className="announcement-body">{announcement.body}</p><p className="small muted">Parent replies go to private conversations.</p></Disclosure>)}
      </section>
    </>}

    {workspace.role === 'admin' && <>
      <section className="communications-section" aria-labelledby="alert-create-title"><div className="communications-section-heading"><div><p className="eyebrow">Safety broadcast</p><h2 id="alert-create-title">Create an emergency alert</h2></div></div>
        <form className="communication-compose alert-compose" onSubmit={createAlert} data-testid="emergency-alert-form">
          <label className="communication-field">Alert title<input name="title" required maxLength={120} placeholder="Early dismissal notice" /></label>
          <label className="communication-field">Audience<select name="audience" defaultValue="groups"><option value="groups">Selected lesson groups</option><option value="all">All parents</option></select></label>
          <fieldset className="group-checkboxes"><legend>Lesson groups</legend>{workspace.groups.map((group) => <label key={group.id}><input type="checkbox" name="groupIds" value={group.id} defaultChecked /> Group {group.groupNumber}</label>)}</fieldset>
          <label className="communication-field">Reason<input name="reason" required maxLength={300} /></label>
          <label className="communication-field">Pickup location<input name="pickupLocation" required maxLength={240} /></label>
          <label className="communication-field">Pickup time<input name="pickupTime" required maxLength={100} placeholder="12:30 p.m. today" /></label>
          <label className="communication-field">Detailed instructions<textarea name="instructions" rows={4} required maxLength={2000} /></label>
          <label className="communication-field">Contact information (optional)<input name="contactInfo" maxLength={240} /></label>
          <button className="button danger" type="submit">Create urgent alert</button><p className="small muted">The alert appears in the parent portal. This preview does not send email or text messages.</p>
        </form>
      </section>
      <section className="communications-section" aria-labelledby="active-alerts-title"><div className="communications-section-heading"><div><p className="eyebrow">Delivery and acknowledgements</p><h2 id="active-alerts-title">Current alerts</h2></div></div>
        {alerts.map((alert) => <Disclosure key={alert.id} title={alert.title} meta={`${alert.recipients.filter((entry) => entry.acknowledgedAt).length} of ${alert.recipients.length} acknowledged`} urgent testId={`admin-alert-${alert.id}`}><div className="alert-details"><p><strong>Reason</strong>{alert.reason}</p><p><strong>Pickup location</strong>{alert.pickupLocation}</p><p><strong>Pickup time</strong>{alert.pickupTime}</p><p><strong>Instructions</strong>{alert.instructions}</p>{alert.contactInfo && <p><strong>Contact</strong>{alert.contactInfo}</p>}</div><h3 className="recipient-heading">Recipients</h3><ul className="recipient-list">{alert.recipients.map((recipient) => <li key={recipient.userId}><span>{recipient.name}</span><span>{recipient.acknowledgedAt ? `Acknowledged ${when(recipient.acknowledgedAt)}` : 'Awaiting acknowledgement'}</span></li>)}</ul></Disclosure>)}
      </section>
    </>}
  </main>;
}

function PrivateReplyForm({ announcement, onSend }: { announcement: DemoAnnouncement; onSend: (announcement: DemoAnnouncement, body: string) => void }) {
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  return <form className="communication-reply private-announcement-reply" onSubmit={(event) => { event.preventDefault(); if (body.trim()) { onSend(announcement, body.trim()); setBody(''); setSent(true); } }}>
    <label className="sr-only" htmlFor={`announcement-reply-${announcement.id}`}>Reply privately to instructor</label>
    <textarea id={`announcement-reply-${announcement.id}`} value={body} onChange={(event) => setBody(event.target.value)} rows={2} maxLength={1000} placeholder="Reply privately to your instructor…" data-testid={`announcement-private-reply-${announcement.id}`} />
    <button className="button primary" type="submit" disabled={!body.trim()}>Reply privately</button>{sent && <p className="small acknowledged" role="status">Private reply added to your instructor conversation.</p>}
  </form>;
}
