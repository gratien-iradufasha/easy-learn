import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { useAuth } from '../state.jsx';

const USSD_CODE = import.meta.env.VITE_USSD_CODE || '*123#';
const SAVED_KEY = 'easylearn_saved_lessons';

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { lang, t } = useI18n();
  const { user, completed } = useAuth();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState(readSaved);

  const load = useCallback(async () => {
    setError(false);
    setLessons(null);
    try {
      const data = await api(`/lessons?lang=${lang}`);
      setLessons(data.lessons);
    } catch {
      setError(true);
    }
  }, [lang]);

  useEffect(() => { load(); }, [load]);

  const doneCount = lessons ? lessons.filter((l) => completed.includes(l.id)).length : 0;
  const nextLesson = lessons?.find((lesson) => !completed.includes(lesson.id)) ?? lessons?.[0];
  const toggleSaved = (lessonId) => {
    const next = saved.includes(lessonId)
      ? saved.filter((id) => id !== lessonId)
      : [...saved, lessonId];
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      // Keep the current page responsive if browser storage is unavailable.
    }
  };
  const visibleLessons = lessons?.filter((lesson) => {
    const matchesSearch = `${lesson.title} ${lesson.summary}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
    const isDone = completed.includes(lesson.id);
    const matchesFilter = filter === 'all'
      || (filter === 'done' && isDone)
      || (filter === 'new' && !isDone)
      || (filter === 'saved' && saved.includes(lesson.id));
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <section className="hero">
        <div className="hero_copy">
          <span className="eyebrow">{t(user ? 'welcomeBack' : 'welcome')}</span>
          <h1>{t('tagline')}</h1>
          <p className="hero_note">{user ? t('heroSignedIn') : t('guestNote')}</p>
          {nextLesson && (
            <Link className="btn hero_cta" to={`/lessons/${nextLesson.id}`}>
              {doneCount > 0 ? t('continueLearning') : t('exploreLessons')} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <aside className="ussd_card">
          <span className="ussd_icon" aria-hidden="true">☎</span>
          <div>
            <strong>{t('learnAnywhere')}</strong>
            <p>{t('ussdBanner', { code: USSD_CODE })}</p>
          </div>
        </aside>
      </section>

      {lessons && (
        <section className="overview_grid" aria-label={t('learningOverview')}>
          <article className="overview_card">
            <span className="overview_icon" aria-hidden="true">▤</span>
            <div><span>{t('totalLessons')}</span><strong>{lessons.length}</strong></div>
          </article>
          <article className="overview_card">
            <span className="overview_icon" aria-hidden="true">✓</span>
            <div><span>{t('completedLessons')}</span><strong>{doneCount}</strong></div>
          </article>
          <article className="overview_card">
            <span className="overview_icon" aria-hidden="true">☆</span>
            <div><span>{t('savedLessons')}</span><strong>{saved.length}</strong></div>
          </article>
        </section>
      )}

      <section aria-labelledby="lessons_title">
        <div className="section_head">
          <div>
            <span className="eyebrow">{t('yourJourney')}</span>
            <h2 id="lessons_title">{t('lessons')}</h2>
          </div>
          {lessons && (
            <span className="badge">{t(doneCount === 1 ? 'progressOne' : 'progress', { n: doneCount, total: lessons.length })}</span>
          )}
        </div>

        {lessons && (
          <div className="progress_card">
            <div className="progress_copy">
              <strong>{t('yourProgress')}</strong>
              <span>{t(doneCount === 1 ? 'progressOne' : 'progress', { n: doneCount, total: lessons.length })}</span>
            </div>
            <div className="bar" role="progressbar" aria-label={t('yourProgress')} aria-valuemin="0" aria-valuemax={lessons.length} aria-valuenow={doneCount}>
              <div className="bar_fill" style={{ width: `${(doneCount / lessons.length) * 100}%` }} />
            </div>
          </div>
        )}

        {!lessons && !error && <p className="muted">{t('loading')}</p>}
        {error && (
          <div className="notice">
            <p>{t('loadError')}</p>
            <button className="btn" onClick={load}>{t('retry')}</button>
          </div>
        )}

        {lessons && (
          <div className="lesson_tools">
            <label className="search_box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('searchLessons')}
                aria-label={t('searchLessons')}
              />
            </label>
            <div className="filter_group" role="group" aria-label={t('filterLessons')}>
              {['all', 'new', 'done', 'saved'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter_btn ${filter === item ? 'is_active' : ''}`}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {t(`filters.${item}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="grid">
          {visibleLessons?.map((l) => {
            const done = completed.includes(l.id);
            const isSaved = saved.includes(l.id);
            return (
              <li key={l.id} className={`card ${done ? 'is_done' : ''}`}>
                <div className="card_top">
                  <div className="card_icon" aria-hidden="true">{l.icon}</div>
                  <button
                    type="button"
                    className={`save_btn ${isSaved ? 'is_saved' : ''}`}
                    aria-label={t(isSaved ? 'removeSavedLesson' : 'saveLesson', { title: l.title })}
                    aria-pressed={isSaved}
                    onClick={() => toggleSaved(l.id)}
                  >
                    <span aria-hidden="true">{isSaved ? '★' : '☆'}</span>
                  </button>
                </div>
                <h3>{l.title}</h3>
                <p className="muted">{l.summary}</p>
                <div className="card_foot">
                  {done && <span className="tick">✓ {t('done')}</span>}
                  <Link className="btn" to={`/lessons/${l.id}`}>{done ? t('review') : t('start')}</Link>
                </div>
              </li>
            );
          })}
        </ul>
        {visibleLessons?.length === 0 && (
          <div className="empty_state">
            <span aria-hidden="true">🔎</span>
            <strong>{t('noLessonsFound')}</strong>
            <p>{t('changeSearch')}</p>
          </div>
        )}
      </section>
    </>
  );
}
