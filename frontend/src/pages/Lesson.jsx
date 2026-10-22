import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { useAuth } from '../state.jsx';

// Browsers only read aloud in languages that have a voice installed.
// Kinyarwanda voices are rare, so the button appears only when one exists.
function useVoice(lang) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const check = () =>
      setAvailable(window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang)));
    check();
    window.speechSynthesis.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
  }, [lang]);
  return available;
}

export default function Lesson() {
  const { id } = useParams();
  const { lang, t } = useI18n();
  const { completed, markDone } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const canSpeak = useVoice(lang);

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await api(`/lessons/${id}?lang=${lang}`);
      setLesson(data.lesson);
    } catch {
      setError(true);
    }
  }, [id, lang]);

  useEffect(() => { setIndex(0); load(); }, [load]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (reading) { setReading(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    u.onend = () => setReading(false);
    setReading(true);
    window.speechSynthesis.speak(u);
  };

  if (error) {
    return (
      <div className="notice">
        <p>{t('loadError')}</p>
        <button className="btn" onClick={load}>{t('retry')}</button>
        <Link className="link_btn" to="/">{t('backToLessons')}</Link>
      </div>
    );
  }
  if (!lesson) return <p className="muted">{t('loading')}</p>;

  const total = lesson.steps.length;
  const isLast = index === total - 1;
  const isDone = completed.includes(lesson.id);

  return (
    <article className="lesson">
      <Link className="back" to="/">← {t('backToLessons')}</Link>
      <h1>
        <span aria-hidden="true">{lesson.icon} </span>
        {lesson.title}
      </h1>

      <section className="video">
        {lesson.videoUrl ? (
          <iframe
            src={lesson.videoUrl}
            title={`${t('watchVideo')}: ${lesson.title}`}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="video_empty">🎬 {t('videoSoon')}</div>
        )}
      </section>

      <section className="stepbox" aria-live="polite">
        <div className="step_count">{t('step')} {index + 1} / {total}</div>
        <div className="bar" aria-hidden="true">
          <div className="bar_fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <p className="step_text">{lesson.steps[index]}</p>

        {canSpeak && (
          <button className="btn ghost" onClick={() => speak(lesson.steps[index])}>
            🔊 {reading ? t('stopReading') : t('readAloud')}
          </button>
        )}

        <div className="step_nav">
          <button className="btn ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            ← {t('previous')}
          </button>
          {!isLast && (
            <button className="btn" onClick={() => setIndex((i) => i + 1)}>
              {t('next')} →
            </button>
          )}
          {isLast && !isDone && (
            <button className="btn" onClick={() => markDone(lesson.id)}>
              ✓ {t('finish')}
            </button>
          )}
        </div>

        {isDone && (
          <p className="success" role="status">
            🎉 {t('lessonDone')}
          </p>
        )}
      </section>
    </article>
  );
}
