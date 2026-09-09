import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, Loading, Tag } from 'tdesign-react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { ICON_MAP } from '../utils/iconMap';
import { SimpleMarkdown } from './SimpleMarkdown';
import { resolveCourseId } from '../data/courses';
import { getMicrocourse, microcourseResumePath } from '../utils/courseMicrocourses';

export function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { currentCourse, progress, loading, error, fetchCourse, updateProgress, saveMicrocourseStep } = useTraining();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  useEffect(() => {
    document.querySelector('.lesson-scroll-container')?.scrollTo({ top: 0 });
  }, [lessonId]);

  // 更新进度
  useEffect(() => {
    if (courseId && lessonId && currentCourse && currentCourse.id === resolveCourseId(courseId) && !getMicrocourse(currentCourse.id)) {
      const lessonIndex = currentCourse.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex >= 0) {
        const prog = Math.round(((lessonIndex + 1) / currentCourse.lessons.length) * 100);
        updateProgress(courseId, {
          status: 'in_progress',
          lessonId,
          progress: prog,
        });
      }
    }
  }, [courseId, lessonId, currentCourse, updateProgress]);

  if (loading && !currentCourse) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (!currentCourse || currentCourse.id !== resolveCourseId(courseId || '')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div>{error && <p role="alert">{error}</p>}<Button onClick={() => navigate('/')}>返回首页</Button></div>
      </div>
    );
  }

  const lessonIndex = currentCourse.lessons.findIndex(l => l.id === lessonId);
  if (lessonIndex < 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Button onClick={() => navigate(`/course/${courseId}`)}>返回课程</Button>
      </div>
    );
  }

  const lesson = currentCourse.lessons[lessonIndex];
  const microcourse = getMicrocourse(currentCourse.id);
  const courseProgress = progress[currentCourse.id];
  const completedCount = microcourse?.state(courseProgress)?.completedLessonIds.length || 0;
  if (microcourse && courseProgress && lessonIndex > completedCount) {
    return <Navigate replace to={microcourseResumePath(currentCourse.id, courseProgress, currentCourse.lessons.map(l => l.id))} />;
  }
  const Icon = ICON_MAP[currentCourse.icon] || BookOpen;
  const courseTone = 'var(--td-brand-color)';
  const isLastLesson = lessonIndex === currentCourse.lessons.length - 1;
  const prevLesson = lessonIndex > 0 ? currentCourse.lessons[lessonIndex - 1] : null;
  const nextLesson = !isLastLesson ? currentCourse.lessons[lessonIndex + 1] : null;

  const handleComplete = async () => {
    if (!courseId) return;
    setUpdating(true);

    if (microcourse && lessonId) {
      const saved = await saveMicrocourseStep(currentCourse.id, 'lesson', lessonId);
      if (saved) navigate(isLastLesson ? `/course/${currentCourse.id}/microcourse` : `/course/${currentCourse.id}/lesson/${nextLesson!.id}`);
      setUpdating(false);
      return;
    }

    if (isLastLesson) {
      // 最后一课，更新进度为100%并跳转到测验
      const saved = await updateProgress(courseId, {
        status: 'in_progress',
        lessonId,
        progress: 100,
      });
      if (saved) navigate(`/course/${courseId}/quiz`);
    } else if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
    setUpdating(false);
  };

  return (
    <div className="lesson-scroll-container flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 lg:p-8">
        {/* 返回按钮 */}
        <Button
          variant="text"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-4"
        >
          返回课程目录
        </Button>

        {/* 课程头部信息 */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: 'var(--td-bg-color-component)' }}
          >
            <Icon size={14} color={courseTone} />
          </div>
          <span className="text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
            {currentCourse.title}
          </span>
          <Tag size="small" variant="outline">
            第 {lessonIndex + 1}/{currentCourse.lessons.length} 课
          </Tag>
        </div>

        {/* 课程标题 */}
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--td-text-color-primary)' }}>
          {lesson.title}
        </h1>
        <div className="flex items-center gap-3 text-sm mb-6" style={{ color: 'var(--td-text-color-secondary)' }}>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            预计 {lesson.duration} 分钟
          </span>
        </div>

        {/* 关键知识点 */}
        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <div
            className="lesson-keypoints rounded-lg p-4 mb-6"
            style={{
              backgroundColor: 'var(--td-warning-color-1)',
              border: '1px solid var(--td-warning-color-2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} color="var(--td-warning-color)" />
              <span className="text-sm font-semibold" style={{ color: 'var(--td-warning-color)' }}>
                本课要点
              </span>
            </div>
            <ul className="space-y-1.5">
              {lesson.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: 'var(--td-text-color-primary)' }}
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 课程内容 */}
        <div
          className="lesson-reading-surface rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <SimpleMarkdown content={lesson.content} />
        </div>

        {/* 导航按钮 */}
        {error && <p role="alert" className="mb-4" style={{ color: 'var(--td-error-color)' }}>{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {prevLesson ? (
            <Button
              variant="outline"
              icon={<ChevronLeft size={18} />}
              onClick={() => navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
            >
              上一课
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentCourse.lessons.map((l, i) => (
              <div
                key={l.id}
                className="w-2 h-2 rounded-sm transition-all"
                style={{
                  backgroundColor: i === lessonIndex
                    ? courseTone
                    : i < lessonIndex
                    ? 'var(--td-success-color)'
                    : 'var(--td-bg-color-component)',
                  width: i === lessonIndex ? '24px' : '8px',
                }}
              />
            ))}
          </div>

          <Button
            theme="primary"
            loading={updating}
            suffix={!isLastLesson ? <ChevronRight size={18} /> : <CheckCircle size={18} />}
            onClick={handleComplete}
          >
            {microcourse ? (isLastLesson ? '文字已学完，进入互动微课' : '已读完，下一课') : isLastLesson ? '完成学习，前往测验' : '下一课'}
          </Button>
        </div>
      </div>
    </div>
  );
}
