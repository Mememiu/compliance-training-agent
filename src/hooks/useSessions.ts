import { useState, useCallback } from 'react';
import { Session, Message } from '../types';

const STORAGE_KEY = 'compliance_chat_sessions';
const MODELS_KEY = 'sessionModels';

function loadSessions(): Session[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        messages: (s.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

function persistSessions(sessions: Session[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [sessionModels, setSessionModels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(MODELS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // 持久化 sessions
  const persist = useCallback((newSessions: Session[]) => {
    persistSessions(newSessions);
  }, []);

  // 获取会话列表（本地）
  const fetchSessions = useCallback(async () => {
    const loaded = loadSessions();
    setSessions(loaded);
  }, []);

  // 删除会话
  const deleteSession = useCallback(async (sessionId: string): Promise<string | null> => {
    let navigateTo: string | null = null;

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      persist(filtered);
      return filtered;
    });

    const remaining = sessions.filter(s => s.id !== sessionId);
    if (currentSessionId === sessionId) {
      if (remaining.length > 0) {
        navigateTo = `/chat/${remaining[0].id}`;
        setCurrentSessionId(remaining[0].id);
      } else {
        navigateTo = '/chat';
        setCurrentSessionId(null);
      }
    }

    return navigateTo;
  }, [sessions, currentSessionId, persist]);

  const updateSessionModel = useCallback((sessionId: string, modelId: string) => {
    setSessionModels(prev => {
      const updated = { ...prev, [sessionId]: modelId };
      localStorage.setItem(MODELS_KEY, JSON.stringify(updated));
      return updated;
    });
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === sessionId ? { ...s, model: modelId } : s
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const addSession = useCallback((session: Session) => {
    setSessions(prev => {
      const updated = [session, ...prev];
      persist(updated);
      return updated;
    });
    setCurrentSessionId(session.id);
  }, [persist]);

  const updateSession = useCallback((sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const updateSessionMessages = useCallback((sessionId: string, updater: (messages: Message[]) => Message[]) => {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === sessionId ? { ...s, messages: updater(s.messages) } : s
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  return {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    sessionModels,
    fetchSessions,
    deleteSession,
    updateSessionModel,
    addSession,
    updateSession,
    updateSessionMessages,
  };
}
