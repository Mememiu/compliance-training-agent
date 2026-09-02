import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Loading, Tag, Radio } from 'tdesign-react';
import {
  ChevronLeft,
  FileQuestion,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useTraining } from '../hooks/useTraining';
import { ICON_MAP } from '../utils/iconMap';
import { QuizSubmissionResult } from '../types';

export function QuizView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentCourse, loading, fetchCourse, submitQuiz } = useTraining();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId && !currentCourse) {
      fetchCourse(courseId);
    }
  }, [courseId, currentCourse, fetchCourse]);

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

  const Icon = ICON_MAP[currentCourse.icon] || FileQuestion;
  const courseTone = 'var(--td-brand-color)';
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === currentCourse.quiz.length;

  const handleSubmit = async () => {
    if (!courseId || !allAnswered) return;
    setSubmitting(true);
    const res = await submitQuiz(courseId, answers);
    if (res) {
      setResult(res);
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
  };

  // ========== 结果展示 ==========
  if (result) {
    return (
      <QuizResultView
        result={result}
        course={currentCourse}
        Icon={Icon}
        onRetry={handleRetry}
        onBackToCourse={() => navigate(`/course/${courseId}`)}
        onBackToDashboard={() => navigate('/')}
      />
    );
  }

  // ========== 答题页面 ==========
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

        {/* 测验头部 */}
        <div
          className="quiz-header rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--td-bg-color-component)' }}
            >
              <FileQuestion size={28} color={courseTone} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--td-text-color-primary)' }}>
                {currentCourse.title} — 课程考核
              </h1>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
                <span>{currentCourse.quiz.length} 道题目</span>
                <span>·</span>
                <span>及格线 {currentCourse.passThreshold} 分</span>
                <span>·</span>
                <span>已答 {answeredCount}/{currentCourse.quiz.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 题目列表 */}
        <div className="space-y-4 mb-6">
          {currentCourse.quiz.map((q, qIndex) => (
            <div
              key={q.id}
              className="quiz-question rounded-lg p-5"
              style={{
                backgroundColor: 'var(--td-bg-color-container)',
                border: '1px solid var(--td-component-stroke)',
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                  style={{
                    backgroundColor: answers[q.id] !== undefined
                      ? 'var(--td-brand-color-light)'
                      : 'var(--td-bg-color-component)',
                    color: answers[q.id] !== undefined
                      ? courseTone
                      : 'var(--td-text-color-secondary)',
                  }}
                >
                  {qIndex + 1}
                </div>
                <h3
                  className="text-sm font-medium pt-0.5"
                  style={{ color: 'var(--td-text-color-primary)' }}
                >
                  {q.question}
                </h3>
              </div>
              <div className="ml-10 space-y-2">
                {q.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: answers[q.id] === oIndex
                        ? 'var(--td-brand-color-light)'
                        : 'transparent',
                      border: `1px solid ${answers[q.id] === oIndex
                        ? 'var(--td-brand-color)'
                        : 'var(--td-component-stroke)'}`,
                    }}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, [q.id]: oIndex }));
                    }}
                  >
                    <Radio
                      checked={answers[q.id] === oIndex}
                      onChange={() => {
                        setAnswers(prev => ({ ...prev, [q.id]: oIndex }));
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--td-text-color-primary)' }}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 提交区域 */}
        <div
          className="quiz-submit rounded-lg p-4 flex items-center justify-between sticky bottom-0"
          style={{
            backgroundColor: 'var(--td-bg-color-container)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
            {!allAnswered ? (
              <>
                <AlertCircle size={16} />
                <span>还有 {currentCourse.quiz.length - answeredCount} 题未作答</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} color="var(--td-success-color)" />
                <span>所有题目已完成，可以提交</span>
              </>
            )}
          </div>
          <Button
            theme="primary"
            size="large"
            loading={submitting}
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            提交测验
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========== 测验结果组件 ==========
function QuizResultView({
  result,
  course,
  Icon,
  onRetry,
  onBackToCourse,
  onBackToDashboard,
}: {
  result: QuizSubmissionResult;
  course: any;
  Icon: any;
  onRetry: () => void;
  onBackToCourse: () => void;
  onBackToDashboard: () => void;
}) {
  const passed = result.passed;
  const scoreColor = passed ? 'var(--td-success-color)' : 'var(--td-error-color)';
  const bgColor = passed ? 'var(--td-success-color-1)' : 'var(--td-error-color-1)';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 lg:p-8">
        {/* 结果卡片 */}
        <div
          className="quiz-result rounded-lg p-8 mb-6 text-center"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${passed ? 'var(--td-success-color)' : 'var(--td-error-color)'}`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            {passed ? (
              <Award size={40} color={scoreColor} />
            ) : (
              <AlertCircle size={40} color={scoreColor} />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: scoreColor }}>
            {passed ? '恭喜通过！' : '未通过，请继续努力'}
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--td-text-color-secondary)' }}>
            {passed
              ? `您已完成 ${course.title} 课程考核`
              : `及格线为 ${result.passThreshold} 分，您差 ${result.passThreshold - result.score} 分通过`}
          </p>
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-lg" style={{ backgroundColor: 'var(--td-bg-color-container)' }}>
            <div>
              <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                {result.score}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--td-text-color-secondary)' }}>得分</div>
            </div>
            <div className="w-px h-12" style={{ backgroundColor: 'var(--td-component-stroke)' }} />
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--td-text-color-primary)' }}>
                {result.correctCount}/{result.totalQuestions}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--td-text-color-secondary)' }}>答对/总数</div>
            </div>
          </div>
        </div>

        {/* 答题详情 */}
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--td-text-color-primary)' }}>
          答题详情
        </h2>
        <div className="space-y-3 mb-6">
          {result.results.map((r, idx) => (
            <div
              key={r.questionId}
              className="quiz-answer-detail rounded-lg p-4"
              style={{
                backgroundColor: 'var(--td-bg-color-container)',
                border: `1px solid ${r.isCorrect ? 'var(--td-success-color)' : 'var(--td-error-color)'}`,
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: r.isCorrect ? 'var(--td-success-color-1)' : 'var(--td-error-color-1)',
                  }}
                >
                  {r.isCorrect ? (
                    <CheckCircle size={16} color="var(--td-success-color)" />
                  ) : (
                    <XCircle size={16} color="var(--td-error-color)" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium mr-2" style={{ color: 'var(--td-text-color-secondary)' }}>
                    Q{idx + 1}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                    {r.question}
                  </span>
                </div>
              </div>
              <div className="ml-9 space-y-1.5">
                {r.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className="flex items-center gap-2 text-sm py-1"
                    style={{
                      color: oi === r.correctAnswer
                        ? 'var(--td-success-color)'
                        : oi === r.userAnswer && !r.isCorrect
                        ? 'var(--td-error-color)'
                        : 'var(--td-text-color-secondary)',
                    }}
                  >
                    {oi === r.correctAnswer && <CheckCircle size={14} />}
                    {oi === r.userAnswer && !r.isCorrect && <XCircle size={14} />}
                    <span>{opt}</span>
                    {oi === r.correctAnswer && (
                      <Tag size="small" theme="success" variant="light">正确答案</Tag>
                    )}
                    {oi === r.userAnswer && !r.isCorrect && (
                      <Tag size="small" theme="danger" variant="light">你的选择</Tag>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="ml-9 mt-3 p-3 rounded-lg text-xs"
                style={{
                  backgroundColor: 'var(--td-bg-color-page)',
                  color: 'var(--td-text-color-secondary)',
                  lineHeight: '1.7',
                }}
              >
                <strong>解析：</strong>{r.explanation}
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            icon={<RotateCcw size={18} />}
            onClick={onRetry}
          >
            重新测验
          </Button>
          <div className="flex gap-3">
            <Button variant="text" onClick={onBackToCourse}>
              返回课程
            </Button>
            <Button
              theme="primary"
              icon={<ArrowRight size={18} />}
              iconAfter
              onClick={onBackToDashboard}
            >
              {passed ? '返回培训首页' : '返回继续学习'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
