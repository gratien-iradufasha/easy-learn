import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH || './data/easylearn.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'rw',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'web',
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Keep phone numbers in one format so web and USSD users match.
export function normalizePhone(raw) {
  let p = String(raw || '').replace(/[^\d+]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (/^07\d{8}$/.test(p)) p = '+250' + p.slice(1); // Rwanda local format
  if (/^250\d{9}$/.test(p)) p = '+' + p;
  return p;
}

export const findUserByPhone = (phone) =>
  db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(phone));

export function markComplete(userId, lessonId, channel = 'web') {
  db.prepare(
    'INSERT OR IGNORE INTO progress (user_id, lesson_id, channel) VALUES (?, ?, ?)'
  ).run(userId, lessonId, channel);
}

export const completedLessons = (userId) =>
  db.prepare('SELECT lesson_id FROM progress WHERE user_id = ?').all(userId).map((r) => r.lesson_id);
