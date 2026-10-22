import { Router } from 'express';
import { lessons, LANGS } from '../content/lessons.js';

const router = Router();

const LANG_NAME = { rw: 'Kinyarwanda', en: 'English', fr: 'French' };

function systemPrompt(lang) {
  const lessonList = lessons.map((l) => `${l.id}: ${l.title.en}`).join('; ');
  return [
    'You are the Easy Learn helper. Easy Learn teaches basic digital skills to people in rural areas',
    'who may be new to smartphones and computers.',
    `Always answer in ${LANG_NAME[lang]}. Use very short, simple sentences and plain words.`,
    'Explain one step at a time, using numbered steps when giving instructions.',
    'Be patient and encouraging. Never ask for passwords, PINs or bank details.',
    `The portal has these lessons: ${lessonList}. Point people to a lesson when it fits.`,
    'If you do not know something, say so and suggest asking a trusted person.',
  ].join(' ');
}

// Simple built in answers so the helper still works without an API key or without internet access to the model.
const FALLBACK = {
  email: {
    rw: 'Kohereza imeri: 1) Fungura Gmail. 2) Kanda Compose. 3) Andika imeri y’uwo wandikira, umutwe n’ubutumwa. 4) Kanda Send. Reba isomo "Kohereza imeri".',
    en: 'To send an email: 1) Open Gmail. 2) Touch Compose. 3) Type the address, subject and message. 4) Touch Send. See the lesson "Sending an email".',
    fr: 'Pour envoyer un e-mail : 1) Ouvrez Gmail. 2) Touchez Écrire. 3) Saisissez l’adresse, l’objet et le message. 4) Touchez Envoyer. Voir la leçon « Envoyer un e-mail ».',
  },
  wifi: {
    rw: 'Kwinjira kuri interineti: Fungura Settings, kanda WiFi, hitamo umuyoboro wawe wandike ijambobanga. Reba isomo "Kwinjira kuri interineti".',
    en: 'To get online: open Settings, touch WiFi, choose your network and type the password. See the lesson "Getting online".',
    fr: 'Pour vous connecter : ouvrez Paramètres, touchez WiFi, choisissez votre réseau et saisissez le mot de passe. Voir la leçon « Se connecter à internet ».',
  },
  safe: {
    rw: 'Ntuzigere uha umuntu ijambobanga cyangwa PIN yawe. Witondere ubutumwa buvuga ko watsindiye amafaranga. Reba isomo "Kwirinda ibyago kuri interineti".',
    en: 'Never share your password or PIN. Be careful with messages saying you won money. See the lesson "Staying safe online".',
    fr: 'Ne partagez jamais votre mot de passe ou PIN. Méfiez-vous des messages annonçant un gain. Voir la leçon « Rester en sécurité en ligne ».',
  },
  video: {
    rw: 'Guhamagara kuri videwo: Fungura WhatsApp, hitamo umuntu, kanda ku kamenyetso ka kamera. Reba isomo "Guhamagara kuri videwo".',
    en: 'For a video call: open WhatsApp, choose a person, touch the camera icon. See the lesson "Making a video call".',
    fr: 'Pour un appel vidéo : ouvrez WhatsApp, choisissez une personne, touchez l’icône caméra. Voir la leçon « Passer un appel vidéo ».',
  },
  default: {
    rw: 'Mbwira icyo ushaka kumenya, nk’uko wohereza imeri, wiyinjiza kuri interineti, cyangwa wirinda ubujura. Ushobora no gufungura amasomo ku rupapuro rw’ibanze.',
    en: 'Tell me what you want to learn, like sending an email, getting online or staying safe. You can also open the lessons on the home page.',
    fr: 'Dites-moi ce que vous voulez apprendre, comme envoyer un e-mail, vous connecter ou rester en sécurité. Vous pouvez aussi ouvrir les leçons sur la page d’accueil.',
  },
};

const KEYWORDS = [
  ['email', /e-?mail|imeri|gmail|courriel|message/i],
  ['wifi', /wifi|internet|interineti|online|data|connect|connex/i],
  ['safe', /safe|scam|password|pin|ijambobanga|ubujura|arnaque|sécurité|securite|mot de passe/i],
  ['video', /video|videwo|vidéo|whatsapp|call|hamagara|appel/i],
];

function fallbackAnswer(message, lang) {
  const hit = KEYWORDS.find(([, re]) => re.test(message));
  return FALLBACK[hit ? hit[0] : 'default'][lang];
}

router.post('/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim().slice(0, 600);
  const lang = LANGS.includes(req.body?.lang) ? req.body.lang : 'rw';
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
  if (!message) return res.status(400).json({ error: 'empty_message' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.json({ reply: fallbackAnswer(message, lang), source: 'builtin' });

  const messages = [
    ...history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 600) })),
    { role: 'user', content: message },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || 'claude-haiku-5-5',
        max_tokens: 500,
        system: systemPrompt(lang),
        messages,
      }),
    });
    if (!r.ok) throw new Error(`model_http_${r.status}`);
    const data = await r.json();
    const reply = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!reply) throw new Error('empty_reply');
    res.json({ reply, source: 'ai' });
  } catch (err) {
    console.error('Chat model failed, using fallback:', err.message);
    res.json({ reply: fallbackAnswer(message, lang), source: 'builtin' });
  }
});

export default router;
