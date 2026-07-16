import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { currentCourse, progress, loading, fetchCourse, updateProgress } = useTraining();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (courseId && !currentCourse) {
      fetchCourse(courseId);
    }
  }, [courseId, currentCourse, fetchCourse]);

  // 更新进度
  useEffect(() => {
    if (courseId && lessonId && currentCourse) {
      const lessonIndex = currentCourse.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex >= 0) {
        const prog = Math.round(((lessonIndex + 1) / currentCourse.lessons.length) * 100);
        updateProgress(courseId, {
          status: 'in_progress',
          lesson_id: lessonId,
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

  if (!currentCourse) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Button onClick={() => navigate('/')}>返回首页</Button>
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
  const Icon = ICON_MAP[currentCourse.icon] || BookOpen;
  const isLastLesson = lessonIndex === currentCourse.lessons.length - 1;
  const prevLesson = lessonIndex > 0 ? currentCourse.lessons[lessonIndex - 1] : null;
  const nextLesson = !isLastLesson ? currentCourse.lessons[lessonIndex + 1] : null;

  const handleComplete = async () => {
    if (!courseId) return;
    setUpdating(true);

    if (isLastLesson) {
      // 最后一课，更新进度为100%并跳转到测验
      await updateProgress(courseId, {
        status: 'in_progress',
        lesson_id: lessonId,
        progress: 100,
      });
      navigate(`/course/${courseId}/quiz`);
    } else if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
    setUpdating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
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
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentCourse.color + '15' }}
          >
            <Icon size={14} color={currentCourse.color} />
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
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: '#FFF8E8',
              border: '1px solid #FFE0A0',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} color="#ED7B2F" />
              <span className="text-sm font-semibold" style={{ color: '#8B5A00' }}>
                本课要点
              </span>
            </div>
            <ul className="space-y-1.5">
              {lesson.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: '#7A5300' }}
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
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <SimpleMarkdown content={lesson.content} />
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between gap-4">
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
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i === lessonIndex
                    ? currentCourse.color
                    : i < lessonIndex
                    ? currentCourse.color + '60'
                    : 'var(--td-bg-color-component)',
                  width: i === lessonIndex ? '24px' : '8px',
                }}
              />
            ))}
          </div>

          <Button
            theme="primary"
            loading={updating}
            icon={!isLastLesson ? <ChevronRight size={18} /> : <CheckCircle size={18} />}
            iconAfter
            onClick={handleComplete}
          >
            {isLastLesson ? '完成学习，前往测验' : '下一课'}
          </Button>
        </div>
      </div>
    </div>
  );
}
