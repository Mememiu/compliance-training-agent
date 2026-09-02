import { MessageSquare } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Agent, PermissionMode } from '../types';

interface NewChatViewProps {
  agents: Agent[];
  newChatAgentId: string;
  newChatPermissionMode: PermissionMode;
  onSelectAgent: (agentId: string) => void;
  onSetPermissionMode: (mode: PermissionMode) => void;
  onSendSuggestion: (text: string) => void;
}

const SUGGESTED_QUESTIONS = [
  '什么是个人信息保护法中的"最小必要原则"？',
  '收到供应商赠送的高价值礼品该如何处理？',
  '如何识别和防范钓鱼邮件？',
  '加班费的法定标准是什么？',
  '跨境数据传输需要满足哪些条件？',
  '职场性骚扰有哪些表现形式？',
];

export function NewChatView({
  onSendSuggestion,
}: NewChatViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-lg">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="learning-score-chat-mark mb-4 mx-auto" aria-hidden="true">
            <span className="learning-score-chat-mark__line" />
            <span className="learning-score-chat-mark__block is-done" />
            <span className="learning-score-chat-mark__block is-current" />
            <span className="learning-score-chat-mark__block" />
            <span className="learning-score-chat-mark__label">{APP_CONFIG.nameInitial}</span>
          </div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            AI 学习助手
          </h2>
          <p style={{ color: 'var(--td-text-color-secondary)' }}>
            把课程里的知识带回到真实工作场景
          </p>
        </div>

        {/* 建议问题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} style={{ color: 'var(--td-text-color-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
              常见问题
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                className="new-chat-suggestion p-3 rounded-lg text-sm cursor-pointer transition-all text-left"
                style={{
                  backgroundColor: 'var(--td-bg-color-component)',
                  border: '1px solid var(--td-component-stroke)',
                  color: 'var(--td-text-color-primary)',
                }}
                onClick={() => onSendSuggestion(q)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--td-brand-color-light)';
                  e.currentTarget.style.borderColor = 'var(--td-brand-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--td-bg-color-component)';
                  e.currentTarget.style.borderColor = 'var(--td-component-stroke)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--td-text-color-placeholder)' }}>
          在下方输入框中输入您的问题，按回车发送
        </p>
      </div>
    </div>
  );
}
