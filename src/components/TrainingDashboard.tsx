import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Progress, Tag, Loading } from 'tdesign-react';
import {
  GraduationCap,
  CheckCircle,
  PlayCircle,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { DashboardCourse } from '../types';
import { ICON_MAP } from '../utils/iconMap';

export function TrainingDashboard() {
  const navigate = useNavigate();
  const { dashboardStats, dashboardCourses, loading, fetchDashboard } = useTraining();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboardStats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  const stats = dashboardStats || {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    totalLessons: 0,
    avgScore: 0,
    completionRate: 0,
  };

  const statCards = [
    {
      label: '课程总数',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'var(--td-info-color)',
      bgColor: 'var(--td-bg-color-secondarycontainer)',
    },
    {
      label: '已完成',
      value: stats.completedCourses,
      icon: CheckCircle,
      color: 'var(--td-success-color)',
      bgColor: 'var(--td-success-color-1)',
    },
    {
      label: '学习中',
      value: stats.inProgressCourses,
      icon: PlayCircle,
      color: 'var(--td-warning-color)',
      bgColor: 'var(--td-warning-color-1)',
    },
    {
      label: '平均成绩',
      value: `${stats.avgScore}分`,
      icon: Award,
      color: 'var(--td-brand-color)',
      bgColor: 'var(--td-bg-color-component)',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* 欢迎区域 */}
        <div
          className="training-hero rounded-lg p-6 lg:p-8 mb-6"
          style={{
            backgroundColor: 'var(--score-ink)',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap size={28} color="white" />
                </div>
                <h1 className="text-2xl font-bold text-white">培训室</h1>
              </div>
              <p className="text-white/80 text-sm max-w-lg">
                这里汇集公司各类学习内容。沿着你的学习谱，完成课程、理解场景，并在需要时回到 AI 学习助手。
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
                <div className="text-white/70 text-xs mt-1">完成率</div>
              </div>
              <div className="learning-score-hero" aria-label={`已完成 ${stats.completedCourses} 门课程，共 ${stats.totalCourses} 门`}>
                <span className="learning-score-hero__line" />
                {Array.from({ length: Math.max(stats.totalCourses, 4) }).map((_, index) => {
                  const isDone = index < stats.completedCourses;
                  const isCurrent = !isDone && index === stats.completedCourses;
                  return (
                    <span
                      key={index}
                      className={`learning-score-hero__mark${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}
                    />
                  );
                })}
                <span className="learning-score-hero__caption">{stats.completedCourses}/{stats.totalCourses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="training-stat rounded-md p-4 flex items-center gap-3"
                style={{
                  backgroundColor: 'var(--td-bg-color-container)',
                  border: '1px solid var(--td-component-stroke)',
                }}
              >
                <div
                  className="training-stat__icon w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon size={22} color={card.color} />
                </div>
                <div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: 'var(--td-text-color-primary)' }}
                  >
                    {card.value}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--td-text-color-secondary)' }}
                  >
                    {card.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 课程列表 */}
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            培训课程
          </h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
            <Clock size={14} />
            <span>共 {stats.totalLessons} 个课时</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onClick={() => navigate(`/course/${course.courseId}`)}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div
          className="training-note mt-6 rounded-md p-4 flex items-start gap-3"
          style={{
            backgroundColor: 'var(--td-warning-color-1)',
            border: '1px solid var(--td-warning-color-2)',
          }}
        >
          <TrendingUp size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--td-warning-color)' }} />
          <div className="text-sm" style={{ color: 'var(--td-text-color-primary)' }}>
            <strong>培训要求：</strong>
            继续完成你的学习路径，课程负责人会持续更新内容和考核要求。
            如有疑问，可随时点击左侧“AI 学习助手”进行咨询。
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: DashboardCourse; onClick: () => void }) {
  const Icon = ICON_MAP[course.icon] || BookOpen;

  const statusConfig = {
    not_started: { label: '未开始', color: 'var(--td-text-color-secondary)', bgColor: 'var(--td-bg-color-component)' },
    in_progress: { label: '学习中', color: 'var(--td-warning-color)', bgColor: 'var(--td-warning-color-1)' },
    completed: { label: '已完成', color: 'var(--td-success-color)', bgColor: 'var(--td-success-color-1)' },
  };
  const status = statusConfig[course.status];

  return (
    <div
      className="course-card rounded-lg p-5 cursor-pointer transition-all duration-200 hover:shadow-lg group"
      style={{
        backgroundColor: 'var(--td-bg-color-container)',
        border: '1px solid var(--td-component-stroke)',
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 mb-3">
        <div
          className="course-card__mark w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--td-bg-color-component)' }}
        >
          <Icon size={24} color="var(--td-brand-color)" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-base font-semibold truncate"
              style={{ color: 'var(--td-text-color-primary)' }}
            >
              {course.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Tag size="small" variant="light" style={{ color: 'var(--td-text-color-primary)', borderColor: 'var(--td-component-stroke)' }}>
              {course.difficulty}
            </Tag>
            <span className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
              {course.lessonCount} 课时 · {course.estimatedTime}分钟
            </span>
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: status.bgColor, color: status.color }}
        >
          {status.label}
        </div>
      </div>

      <p
        className="text-sm mb-4 line-clamp-2"
        style={{ color: 'var(--td-text-color-secondary)' }}
      >
        {course.category}
      </p>

      <div className="flex items-center gap-3">
        <Progress
          percentage={course.progress}
          size="small"
          style={{ flex: 1 }}
          color="var(--td-brand-color)"
        />
        {course.score !== null && (
          <span
            className="text-xs font-medium flex-shrink-0"
            style={{ color: course.passed ? 'var(--td-success-color)' : 'var(--td-error-color)' }}
          >
            {course.score}分
          </span>
        )}
        <ChevronRight
          size={18}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--td-text-color-secondary)' }}
        />
      </div>
    </div>
  );
}
