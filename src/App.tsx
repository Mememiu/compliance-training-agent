import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@tdesign-react/chat/es/style/index.js';

import { useAgents } from './hooks/useAgents';
import { useTheme } from './hooks/useTheme';
import { useSessions } from './hooks/useSessions';
import { useModels } from './hooks/useModels';
import { useChat } from './hooks/useChat';
import { PermissionMode } from './types';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SettingsPage } from './components/SettingsPage';
import { ChatPage } from './pages/ChatPage';
import { TrainingDashboard } from './components/TrainingDashboard';
import { CourseDetailPage } from './components/CourseDetailPage';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/course/:courseId" element={<AppContent />} />
      <Route path="/course/:courseId/lesson/:lessonId" element={<AppContent />} />
      <Route path="/course/:courseId/quiz" element={<AppContent />} />
      <Route path="/chat" element={<AppContent />} />
      <Route path="/chat/:sessionId" element={<AppContent />} />
      <Route path="/settings" element={<AppContent />} />
    </Routes>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const location = useLocation();

  const isSettingsPage = location.pathname === '/settings';
  const isChatPage = location.pathname === '/chat' || location.pathname.startsWith('/chat/');
  const isTrainingPage = location.pathname === '/' ||
    location.pathname.startsWith('/course/');

  // Hooks
  const { theme, toggleTheme } = useTheme();
  const { agents, addAgent, updateAgent, deleteAgent, getAgent } = useAgents();
  const { models, selectedModel, setSelectedModel, fetchModels } = useModels();
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    sessionModels,
    fetchSessions,
    deleteSession,
    updateSessionModel,
    addSession,
    updateSession,
    updateSessionMessages,
  } = useSessions();

  // 聊天 Hook
  const {
    isLoading,
    inputValue,
    setInputValue,
    permissionRequest,
    sendMessage,
    handleStop,
    handlePermissionAllow,
    handlePermissionDeny,
  } = useChat({
    currentSession,
    currentSessionId,
    selectedModel,
    getAgent,
    addSession,
    updateSession,
    updateSessionMessages,
    updateSessionModel,
    setCurrentSessionId,
    setSessions,
  });

  // 获取当前会话的 Agent
  const currentAgent = currentSession?.agentId ? getAgent(currentSession.agentId) : getAgent('default');

  // 从 URL 同步 sessionId
  useEffect(() => {
    if (urlSessionId && urlSessionId !== currentSessionId) {
      setCurrentSessionId(urlSessionId);
    } else if (!urlSessionId && isChatPage && currentSessionId) {
      // 在 /chat 页面但没有 sessionId，清除当前会话
    } else if (!isChatPage && currentSessionId) {
      setCurrentSessionId(null);
    }
  }, [urlSessionId, isChatPage, isTrainingPage, isSettingsPage, currentSessionId, setCurrentSessionId]);

  // 当切换会话时，恢复该会话的模型选择
  useEffect(() => {
    if (currentSessionId && sessionModels[currentSessionId]) {
      setSelectedModel(sessionModels[currentSessionId]);
    } else if (currentSession) {
      setSelectedModel(currentSession.model);
    }
  }, [currentSessionId, sessionModels, currentSession, setSelectedModel]);

  // 会话列表已在 useSessions 初始化时从 localStorage 加载，无需额外请求

  // 更新当前会话的模型
  const updateCurrentSessionModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    if (currentSessionId) {
      updateSessionModel(currentSessionId, modelId);
    }
  }, [currentSessionId, updateSessionModel, setSelectedModel]);

  // 删除会话处理
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const navigateTo = await deleteSession(sessionId);
    if (navigateTo) {
      navigate(navigateTo);
    }
  }, [deleteSession, navigate]);

  // 侧边栏事件处理
  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    navigate('/chat');
  }, [navigate, setCurrentSessionId]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    navigate(`/chat/${sessionId}`);
  }, [navigate, setCurrentSessionId]);

  const handleOpenSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const handleNavigateToTraining = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleNavigateToChat = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  // Sidebar 状态
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 权限模式状态
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');

  // 确定页面标题
  const pageTitle = isSettingsPage
    ? '设置'
    : isChatPage
    ? (currentSession?.title || 'AI 合规助手')
    : location.pathname.startsWith('/course/') && location.pathname.includes('/quiz')
    ? '课程考核'
    : location.pathname.startsWith('/course/') && location.pathname.includes('/lesson/')
    ? '课程学习'
    : location.pathname.startsWith('/course/')
    ? '课程详情'
    : '合规培训中心';

  return (
    <div
      className="flex h-screen w-screen"
      style={{ backgroundColor: 'var(--td-bg-color-page)' }}
    >
      {/* 侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isSettingsPage={isSettingsPage}
        isChatPage={isChatPage}
        isTrainingPage={isTrainingPage}
        sidebarOpen={sidebarOpen}
        agents={agents}
        getAgent={getAgent}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={handleOpenSettings}
        onNavigateToTraining={handleNavigateToTraining}
        onNavigateToChat={handleNavigateToChat}
      />

      {/* 主内容区 */}
      <main
        className="flex-1 flex flex-col min-w-0"
        style={{ backgroundColor: 'var(--td-bg-color-page)' }}
      >
        {/* 顶部栏 */}
        <Header
          isSettingsPage={isSettingsPage}
          isChatPage={isChatPage}
          isTrainingPage={isTrainingPage}
          pageTitle={pageTitle}
          sidebarOpen={sidebarOpen}
          theme={theme}
          currentSession={currentSession}
          currentAgent={currentAgent}
          models={models}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleTheme={toggleTheme}
          onRefreshModels={fetchModels}
        />

        {/* 页面内容 */}
        {isSettingsPage ? (
          <SettingsPage
            agents={agents}
            onAdd={addAgent}
            onUpdate={updateAgent}
            onDelete={deleteAgent}
          />
        ) : isChatPage ? (
          <ChatPage
            currentSession={currentSession}
            models={models}
            selectedModel={selectedModel}
            agents={agents}
            isLoading={isLoading}
            inputValue={inputValue}
            permissionRequest={permissionRequest}
            permissionMode={permissionMode}
            onSendMessage={sendMessage}
            onStop={handleStop}
            onInputChange={setInputValue}
            onModelChange={updateCurrentSessionModel}
            onPermissionAllow={handlePermissionAllow}
            onPermissionDeny={handlePermissionDeny}
            onPermissionModeChange={setPermissionMode}
          />
        ) : location.pathname.startsWith('/course/') && location.pathname.includes('/quiz') ? (
          <QuizView />
        ) : location.pathname.startsWith('/course/') && location.pathname.includes('/lesson/') ? (
          <LessonView />
        ) : location.pathname.startsWith('/course/') ? (
          <CourseDetailPage />
        ) : (
          <TrainingDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
