import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { participantFetch, getParticipantFetchErrorMessage } from '../lib/participantApi';

const ParticipantPortalContext = createContext(null);

export function ParticipantPortalProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [readIds, setReadIds] = useState(() => new Set());

  const refetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await participantFetch('/api/participants-data/notifications');
      if (!res.ok) throw new Error('โหลดการแจ้งเตือนไม่สำเร็จ');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setReadIds(new Set(list.filter((n) => n.read).map((n) => n.id)));
    } catch (e) {
      setErr(getParticipantFetchErrorMessage(e, 'โหลดการแจ้งเตือนไม่สำเร็จ'));
      setNotifications([]);
      setReadIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  const persistRead = useCallback(async (ids) => {
    if (!ids.length) return;
    try {
      await participantFetch('/api/participants-data/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch {
      /* ถ้า API ล้ม ยังคงอัปเดต UI ในเครื่อง */
    }
  }, []);

  const markRead = useCallback(
    (id) => {
      void persistRead([id]);
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [persistRead]
  );

  const markAllRead = useCallback(() => {
    const unreadIds = notifications.filter((n) => !readIds.has(n.id)).map((n) => n.id);
    void persistRead(unreadIds);
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [notifications, readIds, persistRead]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const value = useMemo(
    () => ({
      notifications,
      loading,
      error: err,
      readIds,
      unreadCount,
      markRead,
      markAllRead,
      refetchNotifications,
    }),
    [notifications, loading, err, readIds, unreadCount, markRead, markAllRead, refetchNotifications]
  );

  return (
    <ParticipantPortalContext.Provider value={value}>
      {children}
    </ParticipantPortalContext.Provider>
  );
}

export function useParticipantPortal() {
  const ctx = useContext(ParticipantPortalContext);
  if (!ctx) {
    throw new Error('useParticipantPortal ต้องอยู่ภายใต้ ParticipantPortalProvider');
  }
  return ctx;
}
