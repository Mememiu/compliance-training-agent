import type { TrainingProgress } from '../types';

export const RESPECT_RESPONSES: Record<string, string[]> = {
  joke: ['direct', 'support'], opportunity: ['direct', 'support'], support: ['direct', 'support'],
};
export type RespectSnapshot = NonNullable<NonNullable<TrainingProgress['respect_learning']>['microcourse']>;
export function validateRespectSnapshot(value: unknown): value is RespectSnapshot {
  if (!value || typeof value !== 'object') return false;
  const s = value as RespectSnapshot;
  const ids = Object.keys(RESPECT_RESPONSES);
  if (!Array.isArray(s.completedStories) || s.completedStories.length > ids.length
    || !s.completedStories.every((id, i) => id === ids[i])
    || !s.acceptedResponses || typeof s.acceptedResponses !== 'object' || Array.isArray(s.acceptedResponses)) return false;
  return Object.keys(s.acceptedResponses).length === s.completedStories.length
    && s.completedStories.every(id => RESPECT_RESPONSES[id].includes(s.acceptedResponses[id]));
}
function derive(p: TrainingProgress, ids: string[]): TrainingProgress {
  const s = p.respect_learning!;
  const complete = s.completedLessonIds.length === ids.length && Boolean(s.microcourseCompletedAt);
  const percent = complete ? 100 : Math.min(99, Math.round(s.completedLessonIds.length / ids.length * 50 + (s.microcourse?.completedStories.length || 0) / 3 * 50));
  return { ...p, status: complete ? 'completed' : percent > 0 || p.started_at ? 'in_progress' : 'not_started',
    progress: percent, passed: complete, score: null, completed_at: complete ? s.microcourseCompletedAt : null };
}
export function normalizeRespectProgress(p: TrainingProgress, ids: string[]): TrainingProgress {
  if (p.course_id !== 'labor-compliance') return p;
  if (!p.respect_learning) {
    const { status, progress, score, passed, completed_at, lesson_id } = p;
    const count = status === 'completed' ? ids.length : Math.max(0, ids.indexOf(lesson_id || ''));
    return derive({ ...p, respect_learning: { version: 1, completedLessonIds: ids.slice(0, count), microcourseCompletedAt: null,
      ...(status !== 'not_started' || progress > 0 ? { legacy: { status, progress, score, passed, completed_at, lesson_id } } : {}) } }, ids);
  }
  const s = p.respect_learning;
  const completed: string[] = [];
  for (const id of ids) { if (!Array.isArray(s.completedLessonIds) || !s.completedLessonIds.includes(id)) break; completed.push(id); }
  return derive({ ...p, respect_learning: { ...s, version: 1, completedLessonIds: completed,
    microcourse: validateRespectSnapshot(s.microcourse) ? s.microcourse : undefined,
    microcourseCompletedAt: typeof s.microcourseCompletedAt === 'string' && Number.isFinite(Date.parse(s.microcourseCompletedAt)) ? s.microcourseCompletedAt : null,
  } }, ids);
}
export function completeRespectLesson(p: TrainingProgress, ids: string[], id: string, now: string): TrainingProgress {
  if (p.course_id !== 'labor-compliance') throw new Error('微课与课程不匹配。');
  const n = normalizeRespectProgress(p, ids), s = n.respect_learning!;
  if (s.completedLessonIds.includes(id)) return n;
  if (!ids.includes(id) || ids[s.completedLessonIds.length] !== id) throw new Error('请先按顺序完成前面的文字课时。');
  return derive({ ...n, lesson_id: id, started_at: n.started_at || now, respect_learning: { ...s, completedLessonIds: [...s.completedLessonIds, id] } }, ids);
}
export function recordRespectMicrocourse(p: TrainingProgress, ids: string[], value: unknown, now: string): TrainingProgress {
  if (p.course_id !== 'labor-compliance') throw new Error('微课与课程不匹配。');
  const n = normalizeRespectProgress(p, ids), s = n.respect_learning!;
  if (s.completedLessonIds.length !== ids.length) throw new Error('请先完成全部文字课时。');
  if (!validateRespectSnapshot(value)) throw new Error('微课进度校验失败，请重新载入微课。');
  return derive({ ...n, started_at: n.started_at || now, respect_learning: { ...s, microcourse: structuredClone(value),
    microcourseCompletedAt: s.microcourseCompletedAt || (value.completedStories.length === 3 ? now : null) } }, ids);
}
