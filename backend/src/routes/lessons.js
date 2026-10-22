import { Router } from 'express';
import { lessons, getLesson, localizeLesson } from '../content/lessons.js';
import { markComplete, completedLessons } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

router.get('/lessons', (req, res) => {
  const lang = req.query.lang;
  res.json({ lessons: lessons.map((l) => localizeLesson(l, lang)) });
});

router.get('/lessons/:id', (req, res) => {
  const lesson = getLesson(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'not_found' });
  res.json({ lesson: localizeLesson(lesson, req.query.lang, true) });
});

router.post('/lessons/:id/complete', requireAuth, (req, res) => {
  if (!getLesson(req.params.id)) return res.status(404).json({ error: 'not_found' });
  markComplete(req.user.id, req.params.id, 'web');
  res.json({ completed: completedLessons(req.user.id) });
});

router.get('/progress', requireAuth, (req, res) => {
  res.json({ completed: completedLessons(req.user.id), total: lessons.length });
});

export default router;
