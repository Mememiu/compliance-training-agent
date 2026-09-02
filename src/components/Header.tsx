import type { ReactNode } from 'react';
import { Button, Tooltip, Tag } from 'tdesign-react';
import {
  RefreshIcon,
  SunnyIcon,
  MoonIcon,
} from 'tdesign-icons-react';
import { Bot, ChevronDown, Clock3, MessageSquare, Plus, Settings2, Trash2 } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Model, Session, Agent, Theme } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface HeaderProps {
  isSettingsPage: boolean;
  isChatPage: boolean;
  isTrainingPage: boolean;
  pageTitle: string;
  theme: Theme;
  currentSession: Session | undefined;
  currentAgent: Agent | undefined;
  models: Model[];
  sessions: Session[];
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  onNavigateToTraining: () => void;
  onNavigateToChat: () => void;
  onToggleTheme: () => void;
  onRefreshModels: () => void;
}

export function Header({
  isSettingsPage,
  isChatPage,
  isTrainingPage,
  pageTitle,
  theme,
  currentSession,
  currentAgent,
  models,
  sessions,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onNavigateToTraining,
  onNavigateToChat,
  onToggleTheme,
  onRefreshModels,
}: HeaderProps) {
  const formatModelName = (modelId: string) => {
    const model = models.find(m => m.modelId === modelId);
    const name = model?.name || modelId;
    return name
      .replace(/^(Claude|GPT|Gemini|Kimi|DeepSeek|Qwen|GLM)\s*/i, '')
      .replace(/-/g, ' ')
      .trim() || name;
  };

  return (
    <header
      className="app-header flex flex-col gap-3 px-4 py-3 flex-shrink-0"
      data-surface={isTrainingPage ? 'training' : isChatPage ? 'chat' : 'settings'}
      style={{
        backgroundColor: 'var(--td-bg-color-page)'
      }}
    >
      <div className="app-header__main">
        <div className="app-header__identity">
          <div className="app-header__brand" aria-label={APP_CONFIG.name}>
            <img src={`${import.meta.env.BASE_URL}brand/learning-score-mark.svg`} alt="" />
            <span>{APP_CONFIG.name}</span>
          </div>
          {isChatPage && currentAgent && (
            <div
              className="app-header__agent-mark"
              style={{ backgroundColor: currentAgent.color || 'var(--td-brand-color)' }}
            >
              {(() => {
                const Icon = ICON_MAP[currentAgent.icon || 'Bot'] || Bot;
                return <Icon size={14} color="white" />;
              })()}
            </div>
          )}
          <h1
            className="app-header__title text-base font-semibold"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            {pageTitle}
          </h1>
          {isChatPage && currentSession && (
            <Tag size="small" variant="outline">
              {formatModelName(currentSession.model)}
            </Tag>
          )}
        </div>
        <div className="app-header__tools">
          <Tooltip content={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
            <Button
              variant="outline"
              shape="circle"
              icon={theme === 'light' ? <MoonIcon /> : <SunnyIcon />}
              onClick={onToggleTheme}
            />
          </Tooltip>
          {isChatPage && (
            <Tooltip content="刷新模型列表">
              <Button
                variant="outline"
                shape="circle"
                icon={<RefreshIcon />}
                onClick={onRefreshModels}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <div className="app-header__nav-row">
        <nav className="app-topnav" aria-label="主导航">
          <TopNavItem active={isTrainingPage && !isChatPage} onClick={onNavigateToTraining}>
            培训首页
          </TopNavItem>
          <TopNavItem active={isChatPage} onClick={onNavigateToChat} icon={<MessageSquare size={15} />}>
            AI 学习助手
          </TopNavItem>
          <TopNavItem active={isSettingsPage} onClick={onOpenSettings} icon={<Settings2 size={15} />}>
            编辑设置
          </TopNavItem>
          {isChatPage && (
            <details className="app-session-menu">
              <summary className="app-topnav__item app-topnav__item--menu">
                <span className="app-topnav__icon"><Clock3 size={15} /></span>
                <span>对话记录</span>
                <ChevronDown size={14} aria-hidden="true" />
              </summary>
              <div className="app-session-menu__panel">
                <button type="button" className="app-session-menu__new" onClick={onNewChat}>
                  <Plus size={15} aria-hidden="true" />
                  <span>新建对话</span>
                </button>
                {sessions.length > 0 ? (
                  <div className="app-session-menu__list">
                    {sessions.map(session => (
                      <div
                        key={session.id}
                        className={`app-session-menu__row${session.id === currentSession?.id ? ' is-active' : ''}`}
                      >
                        <button type="button" onClick={() => onSelectSession(session.id)}>
                          <span>{session.title}</span>
                        </button>
                        <button
                          type="button"
                          className="app-session-menu__delete"
                          aria-label={`删除会话 ${session.title}`}
                          onClick={() => onDeleteSession(session.id)}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="app-session-menu__empty">暂无对话记录</p>
                )}
              </div>
            </details>
          )}
        </nav>
      </div>
    </header>
  );
}

function TopNavItem({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`app-topnav__item${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {icon && <span className="app-topnav__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
