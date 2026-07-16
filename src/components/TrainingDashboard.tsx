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
      color: '#0052D9',
      bgColor: '#E8F3FF',
    },
    {
      label: '已完成',
      value: stats.completedCourses,
      icon: CheckCircle,
      color: '#2BA471',
      bgColor: '#E8F8F0',
    },
    {
      label: '学习中',
      value: stats.inProgressCourses,
      icon: PlayCircle,
      color: '#ED7B2F',
      bgColor: '#FFF3E0',
    },
    {
      label: '平均成绩',
      value: `${stats.avgScore}分`,
      icon: Award,
      color: '#8B5CF6',
      bgColor: '#F5F0FF',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* 欢迎区域 */}
        <div
          className="rounded-2xl p-6 lg:p-8 mb-6"
          style={{
            background: 'linear-gradient(135deg, #0052D9 0%, #266FE8 100%)',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap size={28} color="white" />
                </div>
                <h1 className="text-2xl font-bold text-white">合规培训中心</h1>
              </div>
              <p className="text-white/80 text-sm max-w-lg">
                欢迎参加公司合规培训。请完成以下全部课程模块并通过考核，以确保您了解并遵守公司合规要求。
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
                <div className="text-white/70 text-xs mt-1">完成率</div>
              </div>
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34 * stats.completionRate / 100} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-white text-xs font-medium">
                  {stats.completedCourses}/{stats.totalCourses}
                </span>
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
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  backgroundColor: 'var(--td-bg-color-container)',
                  border: '1px solid var(--td-component-stroke)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
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
          className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{
            backgroundColor: 'var(--td-warning-color-1)',
            border: '1px solid var(--td-warning-color-2)',
          }}
        >
          <TrendingUp size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--td-warning-color)' }} />
          <div className="text-sm" style={{ color: 'var(--td-text-color-primary)' }}>
            <strong>培训要求：</strong>
            所有新员工需在入职30天内完成全部合规培训课程并通过考核（及格线80分）。
            如有疑问，可随时点击左侧"AI助手"进行咨询。
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: DashboardCourse; onClick: () => void }) {
  const Icon = ICON_MAP[course.icon] || BookOpen;

  const statusConfig = {
    not_started: { label: '未开始', color: '#909399', bgColor: '#F0F0F0' },
    in_progress: { label: '学习中', color: '#ED7B2F', bgColor: '#FFF3E0' },
    completed: { label: '已完成', color: '#2BA471', bgColor: '#E8F8F0' },
  };
  const status = statusConfig[course.status];

  return (
    <div
      className="rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg group"
      style={{
        backgroundColor: 'var(--td-bg-color-container)',
        border: '1px solid var(--td-component-stroke)',
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: course.color + '15' }}
        >
          <Icon size={24} color={course.color} />
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
            <Tag size="small" variant="light" style={{ color: course.color, borderColor: course.color + '30' }}>
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
          color={course.color}
        />
        {course.score !== null && (
          <span
            className="text-xs font-medium flex-shrink-0"
            style={{ color: course.passed ? '#2BA471' : '#D54941' }}
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
