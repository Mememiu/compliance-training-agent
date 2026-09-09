import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Tag, Loading, Progress } from 'tdesign-react';
import {
  ChevronLeft,
  Clock,
  BookOpen,
  FileQuestion,
  CheckCircle,
  PlayCircle,
  Lock,
  Award,
} from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { ICON_MAP } from '../utils/iconMap';
import { getMicrocourse, microcourseResumePath } from '../utils/courseMicrocourses';
import { resolveCourseId } from '../data/courses';

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentCourse, progress, loading, error, fetchCourse, updateProgress } = useTraining();
  const [startingLesson, setStartingLesson] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

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
        <div className="text-center">
          <p role={error ? 'alert' : undefined} style={{ color: 'var(--td-text-color-secondary)' }}>{error || '课程不存在'}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[currentCourse.icon] || BookOpen;
  const courseTone = 'var(--td-brand-color)';
  const courseProgress = progress[currentCourse.id];
  const isCompleted = courseProgress?.status === 'completed' && courseProgress?.passed;
  const microcourse = getMicrocourse(currentCourse.id);
  const hasMicrocourse = Boolean(microcourse);
  const learning = microcourse?.state(courseProgress);

  // 计算已完成课程数
  const completedLessons = microcourse ? learning?.completedLessonIds.length || 0 : courseProgress?.lesson_id
    ? currentCourse.lessons.findIndex(l => l.id === courseProgress.lesson_id) + 1
    : 0;

  const handleStartLearning = async () => {
    if (!courseId) return;
    if (hasMicrocourse && courseProgress) {
      navigate(isCompleted ? `/course/${currentCourse.id}/lesson/${currentCourse.lessons[0].id}` : microcourseResumePath(currentCourse.id, courseProgress, currentCourse.lessons.map(l => l.id)));
      return;
    }
    setStartingLesson(true);

    // 找到第一个未完成的课程
    let targetLesson = currentCourse.lessons[0];
    if (courseProgress?.lesson_id) {
      const idx = currentCourse.lessons.findIndex(l => l.id === courseProgress.lesson_id);
      if (idx >= 0 && idx < currentCourse.lessons.length - 1) {
        targetLesson = currentCourse.lessons[idx + 1];
      } else if (idx === currentCourse.lessons.length - 1) {
        // 所有课程已学完，去测验
        navigate(`/course/${courseId}/quiz`);
        return;
      }
    }

    const saved = await updateProgress(courseId, {
      status: 'in_progress',
      lessonId: targetLesson.id,
      progress: Math.round((currentCourse.lessons.indexOf(targetLesson) / currentCourse.lessons.length) * 100),
    });

    if (saved) navigate(`/course/${courseId}/lesson/${targetLesson.id}`);
    setStartingLesson(false);
  };

  const handleLessonClick = (lessonId: string, index: number) => {
    // 允许点击已完成课程和当前课程
    if (index > completedLessons && !isCompleted) return;
    navigate(`/course/${courseId}/lesson/${lessonId}`);
  };

  const handleStartQuiz = () => {
    navigate(`/course/${currentCourse.id}/${hasMicrocourse ? 'microcourse' : 'quiz'}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* 返回按钮 */}
        <Button
          variant="text"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate('/')}
          className="mb-4"
        >
          返回首页
        </Button>

        {/* 课程头部 */}
        <div
          className="course-detail-hero rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--td-bg-color-component)' }}
            >
              <Icon size={32} color={courseTone} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tag size="small" variant="light" style={{ color: 'var(--td-text-color-primary)', borderColor: 'var(--td-component-stroke)' }}>
                  {currentCourse.difficulty}
                </Tag>
                <Tag size="small" variant="outline">
                  {currentCourse.category}
                </Tag>
                {isCompleted && (
                  <Tag size="small" theme="success" variant="light">
                    <CheckCircle size={12} className="mr-1" /> 已通过
                  </Tag>
                )}
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--td-text-color-primary)' }}>
                {currentCourse.title}
              </h1>
              <p className="text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
                {currentCourse.description}
              </p>
            </div>
          </div>

          {/* 课程信息 */}
          <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {currentCourse.lessons.length} 个课时
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              约 {currentCourse.estimatedTime} 分钟
            </span>
            <span className="flex items-center gap-1.5">
              <FileQuestion size={14} />
              {hasMicrocourse ? '1 个互动微课' : `${currentCourse.quiz.length} 道测验题`}
            </span>
            <span className="flex items-center gap-1.5">
              <Award size={14} />
              {microcourse ? microcourse.summary : `及格线 ${currentCourse.passThreshold} 分`}
            </span>
          </div>

          {/* 进度条 */}
          {courseProgress && courseProgress.status !== 'not_started' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
                  学习进度
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                  {courseProgress.progress}%
                  {courseProgress.score !== null && ` · ${courseProgress.score}分`}
                </span>
              </div>
              <Progress
                percentage={courseProgress.progress}
                size="small"
                color={courseTone}
              />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-5 flex gap-3">
            <Button
              theme="primary"
              size="large"
              loading={startingLesson}
              onClick={handleStartLearning}
              icon={!isCompleted ? <PlayCircle size={18} /> : undefined}
            >
              {isCompleted
                ? '复习课程'
                : courseProgress?.status === 'in_progress'
                ? '继续学习'
                : '开始学习'}
            </Button>
            {!hasMicrocourse && (isCompleted || (courseProgress && courseProgress.progress >= 50)) && (
              <Button
                variant="outline"
                size="large"
                onClick={handleStartQuiz}
                icon={<FileQuestion size={18} />}
              >
                {isCompleted ? '重新测验' : '前往测验'}
              </Button>
            )}
          </div>
          {error && <p role="alert" className="mt-3" style={{ color: 'var(--td-error-color)' }}>{error}</p>}
          {learning?.legacy && <p className="text-xs mt-3" style={{ color: 'var(--td-text-color-secondary)' }}>原版学习记录已保留{learning.legacy.score !== null ? `（历史成绩 ${learning.legacy.score} 分）` : ''}；新版需完成互动微课。</p>}
        </div>

        {/* 课程列表 */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--td-text-color-primary)' }}>
            课程目录
          </h2>
          <div className="space-y-2">
            {currentCourse.lessons.map((lesson, index) => {
              const isCurrent = hasMicrocourse ? index === completedLessons : courseProgress?.lesson_id === lesson.id;
              const isDone = index < completedLessons || isCompleted;
              const isLocked = index > completedLessons && !isCompleted;

              return (
                <div
                  key={lesson.id}
                  className="course-lesson-row rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all duration-200"
                  style={{
                      backgroundColor: isCurrent
                      ? 'var(--td-brand-color-light)'
                      : 'var(--td-bg-color-container)',
                    border: `1px solid ${isCurrent ? 'var(--td-brand-color)' : 'var(--td-component-stroke)'}`,
                    opacity: isLocked ? 0.6 : 1,
                  }}
                  onClick={() => handleLessonClick(lesson.id, index)}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  aria-disabled={isLocked}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleLessonClick(lesson.id, index); } }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isDone
                        ? 'var(--td-success-color-1)'
                        : isCurrent
                        ? 'var(--td-brand-color-light)'
                        : 'var(--td-bg-color-component)',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle size={18} color="var(--td-success-color)" />
                    ) : isLocked ? (
                      <Lock size={16} color="var(--td-text-color-secondary)" />
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--td-text-color-secondary)' }}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-medium mb-0.5"
                      style={{ color: 'var(--td-text-color-primary)' }}
                    >
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {lesson.duration}分钟
                      </span>
                      <span>{lesson.keyPoints.length} 个知识点</span>
                    </div>
                  </div>
                  {!isLocked && (
                    <PlayCircle
                      size={20}
                      className="flex-shrink-0"
                      style={{ color: courseTone }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 测验入口 */}
        <div
          className="rounded-lg p-5 flex flex-wrap items-center gap-4"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--td-bg-color-component)' }}
          >
            <FileQuestion size={24} color={courseTone} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--td-text-color-primary)' }}>
              {microcourse ? `《${microcourse.title}》互动微课` : '课程考核'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
              {microcourse ? (completedLessons < currentCourse.lessons.length
                ? `先完成全部文字课时，再进入互动微课（文字 ${completedLessons}/${currentCourse.lessons.length}）`
                : `文字已学完 · ${microcourse.unit} ${microcourse.completed(courseProgress)}/${microcourse.count} · 全部通过后模块完成`)
                : `${currentCourse.quiz.length} 道题目 · 及格线 ${currentCourse.passThreshold} 分 · 可多次尝试`}
            </p>
          </div>
          <Button
            theme="primary"
            variant="outline"
            onClick={handleStartQuiz}
            disabled={hasMicrocourse && completedLessons < currentCourse.lessons.length}
          >
            {hasMicrocourse ? (isCompleted ? '重温微课' : completedLessons < currentCourse.lessons.length ? '待解锁' : '进入互动微课') : isCompleted ? '重新测验' : '开始测验'}
          </Button>
        </div>
      </div>
    </div>
  );
}
