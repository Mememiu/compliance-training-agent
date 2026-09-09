import type { TrainingProgress } from '../types';

export const PRIVACY_OFFICES: Record<string, string[]> = {
  finance: ['salary-screen', 'expense-documents', 'tax-drawer'],
  research: ['password-note', 'whiteboard-photo', 'unmanaged-usb'],
  hr: ['exposed-resumes', 'health-group-message', 'stale-offboarding-account'],
  reception: ['open-visitor-register', 'shipping-label', 'visitor-tailgating'],
  legal: ['contract-comments', 'third-party-overshare', 'unchecked-cross-border'],
  executive: ['printer-minutes', 'undisclosed-recording', 'unapproved-ai'],
};
export type MicrocourseSnapshot = NonNullable<NonNullable<TrainingProgress['privacy_learning']>['microcourse']>;

function uniqueKnown(value: unknown, known: string[]): value is string[] {
  return Array.isArray(value) && value.every(id => typeof id === 'string' && known.includes(id)) && new Set(value).size === value.length;
}

export function validateMicrocourseSnapshot(value: unknown): value is MicrocourseSnapshot {
  if (!value || typeof value !== 'object') return false;
  const s = value as MicrocourseSnapshot;
  const ids = Object.keys(PRIVACY_OFFICES);
  if (!uniqueKnown(s.completedOffices, ids) || !uniqueKnown(s.passedCheckpoints, ids)
    || !s.foundHazards || typeof s.foundHazards !== 'object' || Array.isArray(s.foundHazards)) return false;
  if (!Object.entries(s.foundHazards).every(([id, hazards]) => ids.includes(id) && uniqueKnown(hazards, PRIVACY_OFFICES[id]))) return false;
  return s.completedOffices.every(id => s.foundHazards[id]?.length === PRIVACY_OFFICES[id].length)
    && s.passedCheckpoints.every(id => s.completedOffices.includes(id));
}

function derive(p: TrainingProgress, lessonIds: string[]): TrainingProgress {
  const state = p.privacy_learning!;
  const complete = state.completedLessonIds.length === lessonIds.length && Boolean(state.microcourseCompletedAt);
  const units = state.completedLessonIds.length + (state.microcourse?.passedCheckpoints.length || 0);
  const percent = complete ? 100 : Math.min(99, Math.round(units / (lessonIds.length + 6) * 100));
  return { ...p, status: complete ? 'completed' : percent > 0 || p.started_at ? 'in_progress' : 'not_started',
    progress: percent, passed: complete, score: null, completed_at: complete ? state.microcourseCompletedAt : null };
}

export function normalizePrivacyProgress(p: TrainingProgress, lessonIds: string[]): TrainingProgress {
  if (p.course_id !== 'data-privacy') return p;
  if (!p.privacy_learning) {
    const { status, progress, score, passed, completed_at, lesson_id } = p;
    const readCount = status === 'completed' ? lessonIds.length : Math.max(0, lessonIds.indexOf(lesson_id || ''));
    return derive({ ...p, privacy_learning: { version: 1, completedLessonIds: lessonIds.slice(0, readCount), microcourseCompletedAt: null,
      ...(status !== 'not_started' || progress > 0 ? { legacy: { status, progress, score, passed, completed_at, lesson_id } } : {}) } }, lessonIds);
  }
  const state = p.privacy_learning;
  const completed: string[] = [];
  for (const id of lessonIds) {
    if (!Array.isArray(state.completedLessonIds) || !state.completedLessonIds.includes(id)) break;
    completed.push(id);
  }
  return derive({ ...p, privacy_learning: { ...state, version: 1, completedLessonIds: completed,
    microcourse: validateMicrocourseSnapshot(state.microcourse) ? state.microcourse : undefined,
    microcourseCompletedAt: typeof state.microcourseCompletedAt === 'string' && Number.isFinite(Date.parse(state.microcourseCompletedAt)) ? state.microcourseCompletedAt : null,
  } }, lessonIds);
}

export function completePrivacyLesson(p: TrainingProgress, lessonIds: string[], id: string, now: string): TrainingProgress {
  const normalized = normalizePrivacyProgress(p, lessonIds);
  const state = normalized.privacy_learning!;
  if (state.completedLessonIds.includes(id)) return normalized;
  if (!lessonIds.includes(id) || lessonIds[state.completedLessonIds.length] !== id) throw new Error('请先按顺序完成前面的文字课时。');
  return derive({ ...normalized, lesson_id: id, started_at: normalized.started_at || now,
    privacy_learning: { ...state, completedLessonIds: [...state.completedLessonIds, id] } }, lessonIds);
}

export function recordPrivacyMicrocourse(p: TrainingProgress, lessonIds: string[], value: unknown, now: string): TrainingProgress {
  const normalized = normalizePrivacyProgress(p, lessonIds);
  const state = normalized.privacy_learning!;
  if (state.completedLessonIds.length !== lessonIds.length) throw new Error('请先完成全部文字课时。');
  if (!validateMicrocourseSnapshot(value)) throw new Error('微课进度校验失败，请重新载入微课。');
  return derive({ ...normalized, started_at: normalized.started_at || now, privacy_learning: {
    ...state, microcourse: structuredClone(value),
    microcourseCompletedAt: state.microcourseCompletedAt || (value.passedCheckpoints.length === 6 ? now : null),
  } }, lessonIds);
}

export function privacyResumePath(p: TrainingProgress, lessonIds: string[]): string {
  const state = normalizePrivacyProgress(p, lessonIds).privacy_learning!;
  const next = lessonIds[state.completedLessonIds.length];
  return next ? `/course/data-privacy/lesson/${next}` : '/course/data-privacy/microcourse';
}
