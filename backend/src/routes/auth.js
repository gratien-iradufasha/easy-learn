import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, normalizePhone, findUserByPhone } from '../db.js';
import { LANGS } from '../content/lessons.js';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const router = Router();

const publicUser = (u) => ({ id: u.id, name: u.name, phone: u.phone, lang: u.lang });
const sign = (u) => jwt.sign({ uid: u.id }, SECRET, { expiresIn: '30d' });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'auth_required' });
  try {
    const { uid } = jwt.verify(token, SECRET);
    req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
    if (!req.user) return res.status(401).json({ error: 'auth_required' });
    next();
  } catch {
    res.status(401).json({ error: 'auth_required' });
  }
}

router.post('/register', (req, res) => {
  const { name, pin, lang } = req.body || {};
  const phone = normalizePhone(req.body?.phone);
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'invalid_name' });
  if (!/^\+?\d{8,15}$/.test(phone)) return res.status(400).json({ error: 'invalid_phone' });
  if (!/^\d{4}$/.test(String(pin))) return res.status(400).json({ error: 'invalid_pin' });
  if (findUserByPhone(phone)) return res.status(409).json({ error: 'phone_taken' });

  const userLang = LANGS.includes(lang) ? lang : 'rw';
  const hash = bcrypt.hashSync(String(pin), 10);
  const info = db
    .prepare('INSERT INTO users (phone, name, pin_hash, lang) VALUES (?, ?, ?, ?)')
    .run(phone, String(name).trim(), hash, userLang);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const user = findUserByPhone(req.body?.phone);
  if (!user || !bcrypt.compareSync(String(req.body?.pin || ''), user.pin_hash)) {
    return res.status(401).json({ error: 'bad_credentials' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.patch('/lang', requireAuth, (req, res) => {
  if (!LANGS.includes(req.body?.lang)) return res.status(400).json({ error: 'invalid_lang' });
  db.prepare('UPDATE users SET lang = ? WHERE id = ?').run(req.body.lang, req.user.id);
  res.json({ ok: true });
});

export default router;
