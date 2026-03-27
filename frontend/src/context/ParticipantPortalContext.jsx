import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { participantFetch } from '../lib/participantApi';

const LS_KEY = 'nu_seed_participant_notif_read_v1';

const ParticipantPortalContext = createContext(null);

export function ParticipantPortalProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const refetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await participantFetch('/api/participants-data/notifications');
      if (!res.ok) throw new Error('โหลดการแจ้งเตือนไม่สำเร็จ');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [notifications]);

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
