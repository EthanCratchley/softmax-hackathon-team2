'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getCommunicationUnreadCountAction } from '@/app/communications/actions';

export function MessagesNavLink({ initialCount, role }: { initialCount: number; role: 'parent' | 'instructor' }) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();
  const refreshCount = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    const result = await getCommunicationUnreadCountAction();
    if (result.ok) setCount(result.count);
  }, []);

  useEffect(() => setCount(initialCount), [initialCount]);
  useEffect(() => {
    void refreshCount();
  }, [pathname, refreshCount]);
  useEffect(() => {
    const interval = window.setInterval(() => void refreshCount(), 30_000);
    const onVisibility = () => { if (document.visibilityState === 'visible') void refreshCount(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshCount]);

  const label = count === 1 ? '1 unread item' : `${count} unread items`;
  return <Link className="messages-nav-link" href={`/${role}/communications`} aria-label={`Messages, ${label}`} data-testid="messages-nav-link">
    <span>Messages</span>
    {count > 0 && <span className="messages-nav-count" aria-hidden="true">{count > 9 ? '9+' : count}</span>}
  </Link>;
}
