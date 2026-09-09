import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, Loading } from 'tdesign-react';
import { ChevronLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { resolveCourseId } from '../data/courses';
import { getMicrocourse, microcourseResumePath, acceptMicrocourseMessage } from '../utils/courseMicrocourses';

export function CourseMicrocourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentCourse, progress, error, fetchCourse, saveMicrocourseStep } = useTraining();
  const frame = useRef<HTMLIFrameElement>(null);
  const [token, setToken] = useState(() => crypto.randomUUID());
  const [ready, setReady] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const id = resolveCourseId(courseId || '');
  const config = getMicrocourse(id);
  const p = progress[id];
  const eligible = Boolean(config && currentCourse?.id === id && config.state(p)?.completedLessonIds.length === currentCourse.lessons.length);

  useEffect(() => { if (courseId) fetchCourse(resolveCourseId(courseId)); }, [courseId, fetchCourse]);
  const init = useCallback(() => {
    if (config) frame.current?.contentWindow?.postMessage({ channel: config.channel, type: 'init', token }, window.location.origin);
  }, [token, config]);

  useEffect(() => {
    if (!eligible || !config) return;
    let active = true;
    const timeout = window.setTimeout(() => setBridgeError('微课载入超时，请检查连接后重新载入。'), 20000);
    const onMessage = async (event: MessageEvent) => {
      const message = acceptMicrocourseMessage(event, frame.current?.contentWindow || null, window.location.origin, token, config);
      if (!message) return;
      if (message.type === 'ready') { init(); return; }
      window.clearTimeout(timeout);
      if (message.type === 'error') { setBridgeError(message.message); return; }
      const saved = await saveMicrocourseStep(id, 'microcourse', message.snapshot);
      if (active && saved) { setReady(true); setBridgeError(null); }
    };
    window.addEventListener('message', onMessage);
    init();
    return () => { active = false; window.clearTimeout(timeout); window.removeEventListener('message', onMessage); };
  }, [eligible, token, init, saveMicrocourseStep, config, id]);

  if (!config) return <Navigate replace to={`/course/${courseId}`} />;
  if (!currentCourse || currentCourse.id !== id || !p) return <div className="flex-1 flex flex-col gap-4 items-center justify-center">{error ? <><p role="alert">{error}</p><Button onClick={() => fetchCourse(id)}>重试</Button></> : <Loading size="large" />}</div>;
  if (!eligible) return <Navigate replace to={microcourseResumePath(id, p, currentCourse.lessons.map(l => l.id))} />;
  const passed = config.completed(p);
  const reload = () => { setReady(false); setBridgeError(null); setToken(crypto.randomUUID()); };

  return (
    <section className="course-microcourse flex-1 overflow-y-auto" aria-label={`${config.title}互动微课`}>
      <div className="course-microcourse__toolbar px-4 py-4 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="text" icon={<ChevronLeft size={18} />} onClick={() => navigate(`/course/${id}`)}>课程目录</Button>
          <div><h1 className="text-lg font-semibold">《{config.title}》</h1><p className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>文字已学完 · {config.summary}</p></div>
        </div>
        <span role="status" className="text-sm">{p.passed ? '本模块已完成' : `${config.unit} ${passed}/${config.count}`}</span>
      </div>
      {p.passed && <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3" style={{ background: 'var(--td-success-color-1)' }}><p role="status" className="flex items-center gap-2"><CheckCircle size={18} />文字与互动微课均已完成，进度已保存。可继续重温。</p><Button variant="outline" onClick={() => navigate('/')}>返回课程空间</Button></div>}
      {(error || bridgeError) ? <div role="alert" className="px-5 py-3 flex flex-wrap items-center gap-3" style={{ background: 'var(--td-error-color-1)' }}><span>进度同步异常：{error || bridgeError}</span><Button icon={<RotateCcw size={16} />} onClick={reload}>重新载入并同步</Button></div>
        : !ready && <p role="status" className="px-5 py-3 text-sm">正在载入微课并恢复学习进度…</p>}
      <iframe key={token} ref={frame} src={`${import.meta.env.BASE_URL}microcourses/${config.asset}/index.html`} title={`${config.title}互动微课`} onLoad={init} onError={() => setBridgeError('微课文件未能载入，请重试。')} allow="fullscreen" style={{ display: 'block', width: '100%', height: 'calc(100dvh - 170px)', minHeight: 600, border: 0, background: 'var(--room-canvas)' }} />
      <p className="px-5 py-3 text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>进度保存在当前浏览器。{config.instructions}</p>
    </section>
  );
}
