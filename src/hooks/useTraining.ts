import { useState, useCallback, useEffect } from 'react';
import {
  CourseSummary,
  Course,
  TrainingProgress,
  QuizSubmissionResult,
  DashboardStats,
  DashboardCourse,
} from '../types';
import { COURSES } from '../data/courses';

const USER_ID = 'default';
const PROGRESS_STORAGE_KEY = 'compliance_training_progress';

// ========== localStorage 进度管理 ==========

function loadAllProgress(): Record<string, TrainingProgress> {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {};
}

function saveProgress(courseId: string, progress: TrainingProgress) {
  const all = loadAllProgress();
  all[courseId] = progress;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
}

function getProgress(courseId: string): TrainingProgress {
  const all = loadAllProgress();
  return all[courseId] || {
    id: `${USER_ID}_${courseId}`,
    user_id: USER_ID,
    course_id: courseId,
    lesson_id: null,
    status: 'not_started',
    progress: 0,
    score: null,
    passed: false,
    started_at: null,
    completed_at: null,
  };
}

// ========== Hook ==========

export function useTraining() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardCourses, setDashboardCourses] = useState<DashboardCourse[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Record<string, TrainingProgress | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取仪表盘数据（本地计算）
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const allProgress = loadAllProgress();
      const dashboardCourseList: DashboardCourse[] = COURSES.map((c) => {
        const p = allProgress[c.id];
        return {
          courseId: c.id,
          title: c.title,
          category: c.category,
          icon: c.icon,
          color: c.color,
          difficulty: c.difficulty,
          status: p?.status || 'not_started',
          progress: p?.progress || 0,
          score: p?.score ?? null,
          passed: p?.passed || false,
          lessonCount: c.lessons.length,
          estimatedTime: c.estimatedTime,
        };
      });

      const totalCourses = COURSES.length;
      const completedCourses = dashboardCourseList.filter(c => c.status === 'completed' && c.passed).length;
      const inProgressCourses = dashboardCourseList.filter(c => c.status === 'in_progress').length;
      const notStartedCourses = dashboardCourseList.filter(c => c.status === 'not_started').length;
      const totalLessons = COURSES.reduce((sum, c) => sum + c.lessons.length, 0);
      const scores = dashboardCourseList.filter(c => c.score !== null).map(c => c.score!);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

      const stats: DashboardStats = {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        totalLessons,
        avgScore,
        completionRate,
      };

      setDashboardStats(stats);
      setDashboardCourses(dashboardCourseList);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取课程列表（本地数据）
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const summaries: CourseSummary[] = COURSES.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        icon: c.icon,
        color: c.color,
        difficulty: c.difficulty,
        estimatedTime: c.estimatedTime,
        lessonCount: c.lessons.length,
        quizCount: c.quiz.length,
        passThreshold: c.passThreshold,
      }));
      setCourses(summaries);
    } catch (e: any) {
      setError(e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取课程详情（本地数据）
  const fetchCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    try {
      const course = COURSES.find(c => c.id === courseId) || null;
      setCurrentCourse(course);
      const p = getProgress(courseId);
      setProgress(prev => ({ ...prev, [courseId]: p }));
    } catch (e: any) {
      setError(e?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新课程进度（localStorage）
  const updateProgress = useCallback(async (
    courseId: string,
    updates: { status?: string; progress?: number; lessonId?: string; score?: number; passed?: boolean }
  ) => {
    try {
      const existing = getProgress(courseId);
      const now = new Date().toISOString();
      const updated: TrainingProgress = {
        ...existing,
        course_id: courseId,
        user_id: USER_ID,
        status: (updates.status as TrainingProgress['status']) || existing.status,
        progress: updates.progress !== undefined ? updates.progress : existing.progress,
        lesson_id: updates.lessonId !== undefined ? updates.lessonId : existing.lesson_id,
        score: updates.score !== undefined ? updates.score : existing.score,
        passed: updates.passed !== undefined ? updates.passed : existing.passed,
        started_at: existing.started_at || (updates.status === 'in_progress' ? now : null),
        completed_at: updates.status === 'completed' ? now : existing.completed_at,
      };
      saveProgress(courseId, updated);
      setProgress(prev => ({ ...prev, [courseId]: updated }));
      return updated;
    } catch (e: any) {
      setError(e?.message || 'Failed to update progress');
      return null;
    }
  }, []);

  // 提交测验（本地评分）
  const submitQuiz = useCallback(async (courseId: string, answers: Record<string, number>): Promise<QuizSubmissionResult | null> => {
    try {
      setLoading(true);
      const course = COURSES.find(c => c.id === courseId);
      if (!course) {
        setError('Course not found');
        return null;
      }

      const results = course.quiz.map(q => {
        const userAnswer = answers[q.id] ?? -1;
        const isCorrect = userAnswer === q.correctAnswer;
        return {
          questionId: q.id,
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
          options: q.options,
        };
      });

      const correctCount = results.filter(r => r.isCorrect).length;
      const totalQuestions = course.quiz.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= course.passThreshold;

      // 保存进度
      const updated = await updateProgress(courseId, {
        status: 'completed',
        progress: 100,
        score,
        passed,
      });

      // 刷新仪表盘
      fetchDashboard();

      return {
        score,
        passed,
        correctCount,
        totalQuestions,
        passThreshold: course.passThreshold,
        results,
      };
    } catch (e: any) {
      setError(e?.message || 'Failed to submit quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateProgress, fetchDashboard]);

  // 初始加载
  useEffect(() => {
    fetchDashboard();
    fetchCourses();
  }, [fetchDashboard, fetchCourses]);

  return {
    courses,
    dashboardStats,
    dashboardCourses,
    currentCourse,
    progress,
    loading,
    error,
    fetchDashboard,
    fetchCourses,
    fetchCourse,
    updateProgress,
    submitQuiz,
  };
}
