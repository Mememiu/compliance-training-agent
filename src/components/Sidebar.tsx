import { Button, Tooltip } from 'tdesign-react';
import { AddIcon, DeleteIcon, SettingIcon } from 'tdesign-icons-react';
import { Bot, LayoutDashboard, MessageSquare } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Session, Agent } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isSettingsPage: boolean;
  isChatPage: boolean;
  isTrainingPage: boolean;
  sidebarOpen: boolean;
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  onNavigateToTraining: () => void;
  onNavigateToChat: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  isSettingsPage,
  isChatPage,
  isTrainingPage,
  sidebarOpen,
  agents,
  getAgent,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onNavigateToTraining,
  onNavigateToChat,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{
        width: sidebarOpen ? 260 : 0,
        backgroundColor: 'var(--td-bg-color-container)'
      }}
    >
      {/* Logo */}
      <div className="h-14 px-4 flex items-center flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--td-brand-color)' }}
          >
            <span className="text-white text-sm font-bold">{APP_CONFIG.nameInitial}</span>
          </div>
          <span
            className="text-lg font-semibold"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            {APP_CONFIG.name}
          </span>
        </div>
      </div>

      {/* 导航 */}
      <div className="px-3 space-y-1">
        <NavButton
          icon={<LayoutDashboard size={16} />}
          label="培训首页"
          active={isTrainingPage && !isSettingsPage}
          onClick={onNavigateToTraining}
        />
        <NavButton
          icon={<MessageSquare size={16} />}
          label="AI 合规助手"
          active={isChatPage && !isSettingsPage}
          onClick={onNavigateToChat}
        />
      </div>

      {/* 分隔线 */}
      {isChatPage && (
        <div className="px-4 mt-3 mb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--td-text-color-secondary)' }}>
              对话记录
            </span>
            <Button
              icon={<AddIcon />}
              variant="text"
              size="small"
              onClick={onNewChat}
            />
          </div>
        </div>
      )}

      {/* 会话列表（仅在聊天页面显示） */}
      {isChatPage && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
                暂无对话记录
              </p>
              <Button
                className="mt-3"
                size="small"
                variant="outline"
                icon={<AddIcon />}
                onClick={onNewChat}
              >
                新建对话
              </Button>
            </div>
          )}
          {sessions.map(session => {
            const sessionAgent = session.agentId ? getAgent(session.agentId) : getAgent('default');
            const AgentIcon = ICON_MAP[sessionAgent?.icon || 'Bot'] || Bot;
            return (
              <div
                key={session.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 group"
                style={{
                  backgroundColor: session.id === currentSessionId && !isSettingsPage
                    ? 'var(--td-brand-color-light)'
                    : 'transparent',
                  color: session.id === currentSessionId && !isSettingsPage
                    ? 'var(--td-brand-color)'
                    : 'var(--td-text-color-secondary)'
                }}
                onClick={() => onSelectSession(session.id)}
                onMouseEnter={(e) => {
                  if (session.id !== currentSessionId || isSettingsPage) {
                    e.currentTarget.style.backgroundColor = 'var(--td-bg-color-component-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (session.id !== currentSessionId || isSettingsPage) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: sessionAgent?.color || 'var(--td-brand-color)' }}
                >
                  <AgentIcon size={12} color="white" />
                </div>
                <span className="flex-1 truncate text-sm">{session.title}</span>
                <Tooltip content="删除会话">
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    variant="text"
                    shape="circle"
                    size="medium"
                    icon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}

      {/* 填充空间 */}
      {!isChatPage && <div className="flex-1" />}

      {/* 底部设置按钮 */}
      <div
        className="p-3 border-t flex-shrink-0"
        style={{ borderColor: 'var(--td-component-border)' }}
      >
        <Button
          icon={<SettingIcon />}
          onClick={onOpenSettings}
          block
          variant={isSettingsPage ? 'outline' : 'text'}
          theme={isSettingsPage ? 'primary' : 'default'}
        >
          设置
        </Button>
      </div>
    </aside>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: active
          ? 'var(--td-brand-color-light)'
          : 'transparent',
        color: active
          ? 'var(--td-brand-color)'
          : 'var(--td-text-color-secondary)',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--td-bg-color-component-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
    </div>
  );
}
