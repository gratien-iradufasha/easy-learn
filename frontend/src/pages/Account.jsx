import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';
import { useAuth } from '../state.jsx';

export default function Account() {
  const { t, lang } = useI18n();
  const { user, ready, login, register, logout, completed, total } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', phone: '', pin: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.phone, form.pin);
      else await register({ ...form, lang });
      navigate('/');
    } catch (err) {
      const known = ['invalid_name', 'invalid_phone', 'invalid_pin', 'phone_taken', 'bad_credentials'];
      setError(t(`errors.${known.includes(err.code) ? err.code : 'generic'}`));
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <p className="muted">{t('loading')}</p>;

  if (user) {
    return (
      <section className="panel">
        <h1>{t('account')}</h1>
        <p className="big">{user.name}</p>
        <p className="muted">{user.phone}</p>
        <p className="badge">{t(completed.length === 1 ? 'progressOne' : 'progress', { n: completed.length, total })}</p>
        <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>{t('logout')}</button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>{mode === 'login' ? t('login') : t('register')}</h1>
      <form onSubmit={submit} noValidate>
        {mode === 'register' && (
          <label>
            {t('name')}
            <input value={form.name} onChange={set('name')} autoComplete="name" required />
          </label>
        )}
        <label>
          {t('phone')}
          <input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="0788 000 000" required />
        </label>
        <label>
          {t('pin')}
          <input
            value={form.pin}
            onChange={set('pin')}
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          {mode === 'register' && <small className="muted">{t('pinHint')}</small>}
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn wide" type="submit" disabled={busy}>
          {mode === 'login' ? t('login') : t('register')}
        </button>
      </form>

      <button className="link_btn" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
        {mode === 'login' ? t('noAccount') : t('haveAccount')}
      </button>
    </section>
  );
}
