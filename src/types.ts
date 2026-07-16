/**
 * 类型定义
 */

export type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';

export interface Model {
  modelId: string;
  name: string;
  description?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input?: Record<string, unknown>;
  status: 'running' | 'completed' | 'error';
  result?: string;
  isError?: boolean;
}

/**
 * 内容块类型 - 支持文字和工具调用按顺序排列
 */
export type ContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'tool_use'; toolCall: ToolCall };

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;  // 保留用于兼容，存储纯文本摘要
  model?: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];  // 保留用于兼容
  contentBlocks?: ContentBlock[];  // 新增：按顺序排列的内容块
}

export interface Session {
  id: string;
  title: string;
  model: string;
  agentId?: string;
  cwd?: string;
  permissionMode?: PermissionMode;
  createdAt: Date;
  messages: Message[];
}

export interface CustomAgent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  icon?: string;
  color?: string;
  permissionMode?: PermissionMode;
  createdAt: Date;
  updatedAt: Date;
}

// Agent 是 CustomAgent 的别名
export type Agent = CustomAgent;

export type Theme = 'light' | 'dark';

/**
 * 权限请求 - 用于工具调用确认
 */
export interface PermissionRequest {
  requestId: string;
  toolUseId: string;
  toolName: string;
  input: Record<string, unknown>;
  sessionId: string;
  timestamp: number;
}

/**
 * 权限响应
 */
export interface PermissionResponse {
  requestId: string;
  behavior: 'allow' | 'deny';
  message?: string;
}

// ============= 培训相关类型 =============

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  difficulty: '基础' | '进阶' | '高级';
  estimatedTime: number;
  lessonCount: number;
  quizCount: number;
  passThreshold: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  content: string;
  keyPoints: string[];
}

export interface Course extends CourseSummary {
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface TrainingProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score: number | null;
  passed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

export interface QuizResultDetail {
  questionId: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  passThreshold: number;
  results: QuizResultDetail[];
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  totalLessons: number;
  avgScore: number;
  completionRate: number;
}

export interface DashboardCourse {
  courseId: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  difficulty: '基础' | '进阶' | '高级';
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score: number | null;
  passed: boolean;
  lessonCount: number;
  estimatedTime: number;
}
