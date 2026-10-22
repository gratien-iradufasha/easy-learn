import { Router } from 'express';
import { lessons, LANGS } from '../content/lessons.js';
import { findUserByPhone, markComplete, completedLessons } from '../db.js';

// USSD endpoint in the Africa's Talking format.
// The gateway posts: sessionId, serviceCode, phoneNumber, text
// "text" is everything the person has typed so far, joined with "*".
// We answer with plain text starting with CON (keep the session open) or END (close it).

const router = Router();
const ORDER = ['rw', 'en', 'fr'];

const T = {
  chooseLang: 'Welcome to Easy Learn\nKaza neza / Bienvenue\n1. Kinyarwanda\n2. English\n3. Francais',
  menu: {
    rw: 'Easy Learn\n1. Amasomo\n2. Ibibazo bisanzwe\n3. Aho ngeze',
    en: 'Easy Learn\n1. Lessons\n2. Common questions\n3. My progress',
    fr: 'Easy Learn\n1. Leçons\n2. Questions fréquentes\n3. Ma progression',
  },
  chooseLesson: { rw: 'Hitamo isomo', en: 'Choose a lesson', fr: 'Choisissez une leçon' },
  next: { rw: '1. Komeza', en: '1. Next', fr: '1. Suivant' },
  stepWord: { rw: 'Intambwe', en: 'Step', fr: 'Étape' },
  done: {
    rw: 'Warangije isomo. Courage!',
    en: 'Lesson finished. Well done!',
    fr: 'Leçon terminée. Bravo !',
  },
  invalid: { rw: 'Ntibyumvikanye. Ongera ugerageze.', en: 'Invalid choice. Try again.', fr: 'Choix invalide. Réessayez.' },
  needAccount: {
    rw: 'Iyandikishe kuri porogaramu kugira ngo tubike aho ugeze.',
    en: 'Register on the app so we can save your progress.',
    fr: 'Inscrivez-vous sur l’application pour sauvegarder votre progression.',
  },
  progress: {
    rw: (n, t) => `Wasoje amasomo ${n} kuri ${t}.`,
    en: (n, t) => `You finished ${n} of ${t} lessons.`,
    fr: (n, t) => `Vous avez terminé ${n} leçons sur ${t}.`,
  },
  faq: {
    rw: '1. Kohereza imeri: fungura Gmail, kanda Compose, andika, kanda Send.\n2. Irinde ubujura: ntuhe undi PIN yawe.',
    en: '1. Email: open Gmail, touch Compose, write, touch Send.\n2. Stay safe: never share your PIN.',
    fr: '1. E-mail : ouvrez Gmail, Écrire, rédigez, Envoyer.\n2. Sécurité : ne partagez jamais votre PIN.',
  },
};

const con = (s) => `CON ${s}`;
const end = (s) => `END ${s}`;

export function handleUssd({ phoneNumber, text }) {
  const parts = text === '' || text == null ? [] : String(text).split('*');

  if (parts.length === 0) return con(T.chooseLang);

  const lang = ORDER[Number(parts[0]) - 1];
  if (!lang) return end('Invalid choice / Ntibyumvikanye / Choix invalide');
  if (parts.length === 1) return con(T.menu[lang]);

  const choice = parts[1];

  // 1. Lessons
  if (choice === '1') {
    if (parts.length === 2) {
      const list = lessons.map((l, i) => `${i + 1}. ${l.title[lang]}`).join('\n');
      return con(`${T.chooseLesson[lang]}\n${list}`);
    }
    const lesson = lessons[Number(parts[2]) - 1];
    if (!lesson) return end(T.invalid[lang]);

    // Every extra "1" after the lesson number means "next step".
    const stepIndex = parts.length - 3;
    const extras = parts.slice(3);
    if (extras.some((p) => p !== '1')) return end(T.invalid[lang]);

    const steps = lesson.steps[lang];
    if (stepIndex < steps.length) {
      const body = `${T.stepWord[lang]} ${stepIndex + 1}/${steps.length}\n${steps[stepIndex]}\n${T.next[lang]}`;
      return con(body);
    }

    const user = findUserByPhone(phoneNumber);
    if (user) {
      markComplete(user.id, lesson.id, 'ussd');
      return end(T.done[lang]);
    }
    return end(`${T.done[lang]}\n${T.needAccount[lang]}`);
  }

  // 2. Common questions
  if (choice === '2') return end(T.faq[lang]);

  // 3. Progress
  if (choice === '3') {
    const user = findUserByPhone(phoneNumber);
    if (!user) return end(T.needAccount[lang]);
    return end(T.progress[lang](completedLessons(user.id).length, lessons.length));
  }

  return end(T.invalid[lang]);
}

router.post('/ussd', async (req, res) => {
  const { phoneNumber = '', text = '' } = req.body || {};
  try {
    const out = await handleUssd({ phoneNumber, text });
    res.set('Content-Type', 'text/plain; charset=utf-8').send(out);
  } catch (err) {
    console.error('USSD error', err);
    res.set('Content-Type', 'text/plain; charset=utf-8').send('END Service error. Try again later.');
  }
});

export default router;
