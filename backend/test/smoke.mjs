// Quick end to end check of the API and the USSD flow. Run with: npm test
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'easylearn_'));
process.env.DB_PATH = path.join(tmp, 'test.db');
process.env.JWT_SECRET = 'test_secret';
delete process.env.ANTHROPIC_API_KEY;

const { default: app } = await import('../src/server.js');
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const call = async (url, opts = {}) => {
  const r = await fetch(base + url, {
    ...opts,
    headers: { 'content-type': 'application/json', ...(opts.headers || {}) },
    body: opts.body && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body,
  });
  const text = await r.text();
  try { return { status: r.status, data: JSON.parse(text) }; } catch { return { status: r.status, data: text }; }
};
const ussd = (text, phone = '+250788123456') =>
  call('/api/ussd', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ sessionId: 's1', phoneNumber: phone, text }).toString(),
  }).then((r) => r.data);

try {
  // Lessons in each language
  for (const lang of ['rw', 'en', 'fr']) {
    const r = await call(`/api/lessons?lang=${lang}`);
    assert.equal(r.status, 200);
    assert.equal(r.data.lessons.length, 5);
  }
  const lesson = await call('/api/lessons/send-email?lang=fr');
  assert.equal(lesson.data.lesson.steps.length, 4);

  // Register (local Rwanda format), login, complete a lesson
  const reg = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Mukamana', phone: '0788123456', pin: '1234', lang: 'rw' },
  });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.phone, '+250788123456');
  const dup = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Again', phone: '+250788123456', pin: '1234' },
  });
  assert.equal(dup.status, 409);
  const bad = await call('/api/auth/login', { method: 'POST', body: { phone: '0788123456', pin: '9999' } });
  assert.equal(bad.status, 401);
  const login = await call('/api/auth/login', { method: 'POST', body: { phone: '0788123456', pin: '1234' } });
  const auth = { authorization: `Bearer ${login.data.token}` };
  const done = await call('/api/lessons/send-email/complete', { method: 'POST', headers: auth });
  assert.deepEqual(done.data.completed, ['send-email']);
  assert.equal((await call('/api/lessons/send-email/complete', { method: 'POST' })).status, 401);

  // Chat fallback (no API key)
  const chat = await call('/api/chat', { method: 'POST', body: { message: 'How do I send an email?', lang: 'en' } });
  assert.equal(chat.data.source, 'builtin');
  assert.match(chat.data.reply, /Gmail/);

  // USSD flow
  assert.match(await ussd(''), /^CON /);
  assert.match(await ussd('2'), /^CON Easy Learn\n1\. Lessons/);
  assert.match(await ussd('2*1'), /^CON Choose a lesson/);
  assert.match(await ussd('2*1*1'), /^CON Step 1\/4/);
  assert.match(await ussd('2*1*1*1*1*1'), /^CON Step 4\/4/);
  const finished = await ussd('2*1*1*1*1*1*1');
  assert.match(finished, /^END Lesson finished/);
  assert.match(await ussd('2*3'), /^END You finished 2 of 5 lessons\./);
  assert.match(await ussd('1*1*3*1*1*1*1', '+250700000000'), /^END .*Isomo|^END Warangije/s);

  console.log('All smoke tests passed');
} finally {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
