import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from 'tdesign-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  Play,
  Sparkles,
} from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { DashboardCourse } from '../types';
import { ICON_MAP } from '../utils/iconMap';
import { TextRotate } from './fancy/TextRotate';
import SplitText from './react-bits/SplitText';

const COURSE_PALETTES = [
  { surface: '#f6d5d0', ink: '#7e302b' },
  { surface: '#dcd5fa', ink: '#4a397a' },
  { surface: '#dcefd8', ink: '#2d684a' },
  { surface: '#f8e9a8', ink: '#765d16' },
];

export function TrainingDashboard() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { dashboardStats, dashboardCourses, loading, fetchDashboard } = useTraining();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboardStats) {
    return (
      <div className="training-loading" aria-label="正在加载培训内容">
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

  const nextCourse = useMemo(
    () => dashboardCourses.find((course) => course.status === 'in_progress')
      || dashboardCourses.find((course) => course.status === 'not_started')
      || dashboardCourses[0],
    [dashboardCourses],
  );

  const featuredCourse = dashboardCourses[featuredIndex] || nextCourse;
  const featuredPalette = COURSE_PALETTES[featuredIndex % COURSE_PALETTES.length];

  const moveFeatured = (direction: number) => {
    if (dashboardCourses.length < 2) return;
    setFeaturedIndex((current) => (current + direction + dashboardCourses.length) % dashboardCourses.length);
  };

  return (
    <div className="training-dashboard">
      <div className="training-dashboard__paper">
        <div className="training-dashboard__topline">
          <div className="training-dashboard__crumb">
            <span className="training-dashboard__dot" />
            <span>学习空间</span>
            <span className="training-dashboard__slash">/</span>
            <span className="training-dashboard__muted">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="training-dashboard__signal" aria-label={`${stats.completedCourses} 门课程已完成，共 ${stats.totalCourses} 门`}>
            <span className="training-dashboard__signal-label">学习进度</span>
            <span className="training-dashboard__signal-track">
              {Array.from({ length: Math.max(stats.totalCourses, 4) }).map((_, index) => (
                <span
                  key={index}
                  className={`training-dashboard__signal-mark${index < stats.completedCourses ? ' is-done' : ''}${index === stats.completedCourses ? ' is-current' : ''}`}
                />
              ))}
            </span>
            <span className="training-dashboard__signal-value">{stats.completionRate}%</span>
          </div>
        </div>

        <section className="training-welcome" aria-labelledby="training-welcome-title">
          <div className="training-welcome__copy">
            <p className="training-welcome__eyebrow">今天，从一个清晰的下一步开始</p>
            <h1 id="training-welcome-title">
              <SplitText
                tag="span"
                text="把知识变成"
                className="training-welcome__title-line training-welcome__title-line--primary"
                style={{
                  display: 'block',
                  overflow: 'visible',
                  clipPath: 'inset(0 -2em 0 0)',
                }}
                delay={38}
                duration={0.8}
                threshold={0.2}
                rootMargin="-80px"
                textAlign="left"
              />
              <SplitText
                tag="span"
                text="可以跟着走的路径"
                className="training-welcome__title-line training-welcome__title-line--secondary"
                style={{
                  display: 'block',
                  overflow: 'visible',
                  clipPath: 'inset(0 -2em 0 0)',
                }}
                delay={34}
                duration={0.9}
                threshold={0.2}
                rootMargin="-80px"
                textAlign="left"
              />
            </h1>
            <p className="training-welcome__description">
              课程、场景与考核都在这里。用一点时间，完成今天最重要的学习动作。
            </p>
            {nextCourse && (
              <div className="training-welcome__actions">
                <button
                  type="button"
                  className="training-action training-action--primary"
                  onClick={() => navigate(`/course/${nextCourse.courseId}`)}
                >
                  <Play size={16} fill="currentColor" />
                  <span>{nextCourse.progress > 0 ? '继续学习' : '开始学习'}</span>
                  <ArrowUpRight size={16} />
                </button>
                <span className="training-welcome__caption">
                  本周聚焦 <TextRotate texts={['隐私保护', '安全意识', '商业道德', '公司文化']} className="training-welcome__rotating" />
                </span>
              </div>
            )}
          </div>

          <div className="training-welcome__scene" aria-label="当前学习路径预览">
            <div className="training-scene__paper">
              <div className="training-scene__toolbar">
                <span>今日学习</span>
                <span className="training-scene__toolbar-dots"><i /><i /><i /></span>
              </div>
              <div className="training-scene__body">
                <div className="training-scene__side-list">
                  <span className="is-active">下一步</span>
                  <span>课程库</span>
                  <span>学习记录</span>
                </div>
                {featuredCourse ? (
                  <motion.div
                    className="training-scene__featured"
                    key={featuredCourse.courseId}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ backgroundColor: featuredPalette.surface, color: featuredPalette.ink }}
                  >
                    <div className="training-scene__featured-topline">
                      <span>{featuredCourse.status === 'in_progress' ? '正在学习' : '推荐课程'}</span>
                      <span className="training-scene__featured-icon"><BookOpen size={15} /></span>
                    </div>
                    <h2>{featuredCourse.title}</h2>
                    <div className="training-scene__progress-row">
                      <span>{featuredCourse.progress}% 完成</span>
                      <span>{featuredCourse.lessonCount} 课时</span>
                    </div>
                    <div className="training-scene__progress-track">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(featuredCourse.progress, 4)}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ backgroundColor: featuredPalette.ink }}
                      />
                    </div>
                    <button type="button" onClick={() => navigate(`/course/${featuredCourse.courseId}`)}>
                      查看课程 <ArrowUpRight size={15} />
                    </button>
                  </motion.div>
                ) : (
                  <div className="training-scene__empty">课程内容即将到达</div>
                )}
              </div>
              <div className="training-scene__footer">
                <span>员工学习台</span>
                <span className="training-scene__footer-code">LS / 02</span>
              </div>
            </div>
            <div className="training-scene__shape training-scene__shape--lavender" />
            <div className="training-scene__shape training-scene__shape--yellow" />
            <div className="training-scene__shape training-scene__shape--blue" />
          </div>
        </section>

        <section className="training-summary" aria-label="学习概览">
          <div className="training-summary__item training-summary__item--wide">
            <span className="training-summary__label">你的学习节奏</span>
            <strong>{stats.inProgressCourses > 0 ? '保持得很好' : '准备好出发'}</strong>
            <span className="training-summary__detail">{stats.inProgressCourses > 0 ? `正在进行 ${stats.inProgressCourses} 门课程` : '从第一门课程开始建立路径'}</span>
          </div>
          <div className="training-summary__item">
            <span className="training-summary__label">已完成</span>
            <strong>{stats.completedCourses}<small> 门</small></strong>
            <span className="training-summary__detail">共 {stats.totalCourses} 门课程</span>
          </div>
          <div className="training-summary__item">
            <span className="training-summary__label">累计课时</span>
            <strong>{stats.totalLessons}<small> 节</small></strong>
            <span className="training-summary__detail">平均成绩 {stats.avgScore || '--'} 分</span>
          </div>
          <button type="button" className="training-summary__assistant" onClick={() => navigate('/chat')}>
            <span className="training-summary__assistant-icon"><MessageCircle size={17} /></span>
            <span><strong>需要一点帮助？</strong><small>问问 AI 学习助手</small></span>
            <ArrowUpRight size={16} />
          </button>
        </section>

        <section className="training-courses" aria-labelledby="training-courses-title">
          <div className="training-section-heading">
            <div>
              <h2 id="training-courses-title">你的课程空间</h2>
              <p>按自己的节奏，完成每一个值得记住的场景。</p>
            </div>
            <span className="training-section-heading__meta">{stats.totalCourses} 门课程 · {stats.totalLessons} 个课时</span>
          </div>

          <div className="training-courses__layout">
            <div className="training-course-grid">
              {dashboardCourses.map((course, index) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  index={index}
                  reduceMotion={reduceMotion}
                  onClick={() => navigate(`/course/${course.courseId}`)}
                />
              ))}
            </div>
            {featuredCourse && dashboardCourses.length > 1 && (
              <div className="training-course-controls" aria-label="切换精选课程">
                <button type="button" onClick={() => moveFeatured(-1)} aria-label="上一门课程"><ChevronLeft size={17} /></button>
                <span><b>{String(featuredIndex + 1).padStart(2, '0')}</b> / {String(dashboardCourses.length).padStart(2, '0')}</span>
                <button type="button" onClick={() => moveFeatured(1)} aria-label="下一门课程"><ChevronRight size={17} /></button>
              </div>
            )}
          </div>
        </section>

        <section className="training-owner-note" aria-label="课程更新提示">
          <div className="training-owner-note__mark"><Sparkles size={18} /></div>
          <div>
            <strong>课程会持续更新</strong>
            <p>课程负责人正在把更多安全、制度、业务与文化内容加入学习空间。</p>
          </div>
          <span className="training-owner-note__code">ROOM / OPEN</span>
        </section>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  index,
  reduceMotion,
  onClick,
}: {
  course: DashboardCourse;
  index: number;
  reduceMotion: boolean | null;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const palette = COURSE_PALETTES[index % COURSE_PALETTES.length];
  const isComplete = course.status === 'completed' && course.passed;
  const status = isComplete ? '已完成' : course.status === 'in_progress' ? '学习中' : '未开始';

  return (
    <motion.button
      type="button"
      className="training-course-card"
      onClick={onClick}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <span className="training-course-card__topline">
        <span className="training-course-card__category">{course.category}</span>
        <span className={`training-course-card__status${isComplete ? ' is-complete' : ''}`}>
          {isComplete && <Check size={12} />}
          {status}
        </span>
      </span>
      <span className="training-course-card__icon"><Icon size={22} /></span>
      <span className="training-course-card__title">{course.title}</span>
      <span className="training-course-card__meta">
        <span><Clock3 size={13} /> {course.estimatedTime} 分钟</span>
        <span>{course.lessonCount} 课时</span>
      </span>
      <span className="training-course-card__bottomline">
        <span className="training-course-card__progress-track"><span style={{ width: `${course.progress}%`, backgroundColor: palette.ink }} /></span>
        <span className="training-course-card__progress-value">{course.progress}%</span>
        <ArrowUpRight size={17} className="training-course-card__arrow" />
      </span>
    </motion.button>
  );
}
