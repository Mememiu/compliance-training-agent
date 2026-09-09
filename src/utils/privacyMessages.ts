import { validateMicrocourseSnapshot, type MicrocourseSnapshot } from './privacyProgress';
export const PRIVACY_CHANNEL = 'training-room/privacy-v1';
type PrivacyMessage = { type: 'ready' } | { type: 'state'; snapshot: MicrocourseSnapshot } | { type: 'error'; message: string };

export function acceptPrivacyMessage(event: MessageEvent, frame: Window | null, origin: string, token: string): PrivacyMessage | null {
  if (!frame || event.source !== frame || event.origin !== origin) return null;
  const data = event.data;
  if (!data || typeof data !== 'object' || data.channel !== PRIVACY_CHANNEL) return null;
  if (data.type === 'ready') return { type: 'ready' };
  if (data.token !== token) return null;
  if (data.type === 'state' && validateMicrocourseSnapshot(data.snapshot)) return { type: 'state', snapshot: data.snapshot };
  if (data.type === 'error' && typeof data.message === 'string') return { type: 'error', message: data.message.slice(0, 300) };
  return null;
}
