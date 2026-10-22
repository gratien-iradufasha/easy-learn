import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

export default function Chat() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  const send = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setText('');
    setBusy(true);
    try {
      const { reply } = await api('/chat', { method: 'POST', body: { message, lang, history } });
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('helperError'), error: true }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="chat_fab" onClick={() => setOpen(true)} aria-label={t('helper')}>
        💬 <span>{t('helper')}</span>
      </button>
    );
  }

  return (
    <aside className="chat" role="dialog" aria-label={t('helperTitle')}>
      <div className="chat_head">
        <strong>{t('helperTitle')}</strong>
        <button className="chat_close" onClick={() => setOpen(false)} aria-label={t('close')}>✕</button>
      </div>

      <div className="chat_body">
        <div className="bubble bot">{t('helperHello')}</div>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'me' : 'bot'} ${m.error ? 'is_error' : ''}`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="bubble bot muted">{t('thinking')}</div>}
        <div ref={endRef} />
      </div>

      <form className="chat_form" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('typeQuestion')}
          maxLength={600}
          aria-label={t('typeQuestion')}
        />
        <button className="btn" type="submit" disabled={busy || !text.trim()}>{t('send')}</button>
      </form>
    </aside>
  );
}
