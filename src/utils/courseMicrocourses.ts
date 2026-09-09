import type { TrainingProgress } from '../types';
import { normalizePrivacyProgress, completePrivacyLesson, recordPrivacyMicrocourse, validateMicrocourseSnapshot } from './privacyProgress';
import { normalizeRespectProgress, completeRespectLesson, recordRespectMicrocourse, validateRespectSnapshot } from './respectProgress';
import { normalizeIntegrityProgress, completeIntegrityLesson, recordIntegrityMicrocourse, validateIntegritySnapshot } from './integrityProgress';

const MICROCOURSES = {
  'anti-corruption': {
    asset: 'integrity', channel: 'training-room/integrity-v1', title: '多停一秒·廉洁有度', summary: '可疑费用、利益冲突与礼品处置三段情境',
    unit: '情境练习', count: 3, instructions: '每段听完对话、核对四条记录、选择合适回应并查看复盘，点击「完成本段」；三段全部完成即完成本模块。',
    normalize: normalizeIntegrityProgress, completeLesson: completeIntegrityLesson, record: recordIntegrityMicrocourse,
    validate: validateIntegritySnapshot,
    state: (p?: TrainingProgress | null) => p?.integrity_learning,
    completed: (p?: TrainingProgress | null) => p?.integrity_learning?.microcourse?.completedStories.length || 0,
  },
  'data-privacy': {
    asset: 'privacy', channel: 'training-room/privacy-v1', title: '多停一秒', summary: '六区隐患探索与自测',
    unit: '区域自测', count: 6, instructions: '每区完成隐患探索并答对自测后计入通关；六区全部通过即完成本模块。',
    normalize: normalizePrivacyProgress, completeLesson: completePrivacyLesson, record: recordPrivacyMicrocourse,
    validate: validateMicrocourseSnapshot,
    state: (p?: TrainingProgress | null) => p?.privacy_learning,
    completed: (p?: TrainingProgress | null) => p?.privacy_learning?.microcourse?.passedCheckpoints.length || 0,
  },
  'labor-compliance': {
    asset: 'respect', channel: 'training-room/respect-v1', title: '多停一秒·尊重有界', summary: '三段职场情境与回应练习',
    unit: '情境练习', count: 3, instructions: '依次听完三段对话，选择合适的回应并点击「记住这次回应」；三段全部完成即完成本模块。',
    normalize: normalizeRespectProgress, completeLesson: completeRespectLesson, record: recordRespectMicrocourse,
    validate: validateRespectSnapshot,
    state: (p?: TrainingProgress | null) => p?.respect_learning,
    completed: (p?: TrainingProgress | null) => p?.respect_learning?.microcourse?.completedStories.length || 0,
  },
};
export function getMicrocourse(id: string) {
  return Object.prototype.hasOwnProperty.call(MICROCOURSES, id) ? MICROCOURSES[id as keyof typeof MICROCOURSES] : undefined;
}
export function normalizeCourseProgress(p: TrainingProgress, ids: string[]) { return getMicrocourse(p.course_id)?.normalize(p, ids) || p; }
export function microcourseResumePath(id: string, p: TrainingProgress | null | undefined, ids: string[]) {
  const completed = getMicrocourse(id)?.state(p)?.completedLessonIds.length || 0;
  return completed < ids.length ? `/course/${id}/lesson/${ids[completed]}` : `/course/${id}/microcourse`;
}
export function acceptMicrocourseMessage(event: MessageEvent, frame: Window | null, origin: string, token: string, config: NonNullable<ReturnType<typeof getMicrocourse>>) {
  if (!frame || event.source !== frame || event.origin !== origin) return null;
  const data = event.data;
  if (!data || typeof data !== 'object' || data.channel !== config.channel) return null;
  if (data.type === 'ready') return { type: 'ready' as const };
  if (data.token !== token) return null;
  if (data.type === 'state' && config.validate(data.snapshot)) return { type: 'state' as const, snapshot: data.snapshot as unknown };
  if (data.type === 'error' && typeof data.message === 'string') return { type: 'error' as const, message: data.message.slice(0, 300) };
  return null;
}
