import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
const GUEST_KEY = 'easylearn_guest_progress';

function readGuest() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); } catch { return []; }
}

// Holds the signed in person and their finished lessons.
// Guests keep progress on this device only. Signed in people keep it on the server.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(readGuest);
  const [total, setTotal] = useState(5);

  const loadProgress = useCallback(async () => {
    try {
      const data = await api('/progress');
      setCompleted(data.completed);
      setTotal(data.total);
    } catch { /* keep what we have */ }
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const { user: me } = await api('/auth/me');
          setUser(me);
          await loadProgress();
        } catch (err) {
          if (err.status === 401) setToken(null);
        }
      }
      setReady(true);
    })();
  }, [loadProgress]);

  const finishAuth = async ({ token, user: u }) => {
    setToken(token);
    setUser(u);
    // Move anything finished as a guest onto the account.
    const guest = readGuest();
    for (const id of guest) {
      try { await api(`/lessons/${id}/complete`, { method: 'POST' }); } catch { /* ignore */ }
    }
    try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    await loadProgress();
    return u;
  };

  const login = async (phone, pin) => finishAuth(await api('/auth/login', { method: 'POST', body: { phone, pin } }));
  const register = async (form) => finishAuth(await api('/auth/register', { method: 'POST', body: form }));

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompleted(readGuest());
  };

  const markDone = async (lessonId) => {
    if (completed.includes(lessonId)) return;
    if (user) {
      try {
        const data = await api(`/lessons/${lessonId}/complete`, { method: 'POST' });
        setCompleted(data.completed);
        return;
      } catch { /* fall through and keep it locally */ }
    }
    const next = [...completed, lessonId];
    setCompleted(next);
    if (!user) {
      try { localStorage.setItem(GUEST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    }
  };

  return (
    <AuthContext.Provider value={{ user, ready, completed, total, login, register, logout, markDone }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
