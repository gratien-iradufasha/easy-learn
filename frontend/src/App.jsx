import { Link, Route, Routes } from 'react-router-dom';
import { LANGUAGES, useI18n } from './i18n.jsx';
import { useAuth } from './state.jsx';
import Home from './pages/Home.jsx';
import Lesson from './pages/Lesson.jsx';
import Account from './pages/Account.jsx';
import Chat from './components/Chat.jsx';

function Header() {
  const { lang, setLang, t } = useI18n();
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="container header_row">
        <Link to="/" className="brand" aria-label={t('appName')}>
          <span className="brand_mark" aria-hidden="true">EL</span>
          <span>{t('appName')}</span>
        </Link>

        <nav className="header_actions">
          <div className="lang" role="group" aria-label="Language">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={`lang_btn ${lang === l.code ? 'is_active' : ''}`}
                aria-pressed={lang === l.code}
                onClick={() => setLang(l.code)}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/account" className="link_btn">
            {user ? user.name.split(' ')[0] : t('login')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons/:id" element={<Lesson />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Chat />
    </>
  );
}
