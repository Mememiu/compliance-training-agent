import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ToolCall, PermissionRequest, PermissionMode, Session, CustomAgent, ContentBlock } from '../types';
import { COURSES } from '../data/courses';

const STORAGE_KEYS = {
  draftInput: 'draftInput',
};

// ========== 本地合规知识库 ==========

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

function buildKnowledgeBase(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];

  for (const course of COURSES) {
    // 从课程内容中提取关键知识点
    for (const lesson of course.lessons) {
      // 为每个关键知识点生成条目
      for (const point of lesson.keyPoints) {
        entries.push({
          keywords: point.split(/[，、,。]/).filter(k => k.length > 1),
          answer: `## ${lesson.title}\n\n**${point}**\n\n以下是课程《${course.title}》中关于此知识点的要点：\n\n${lesson.content.split('\n').slice(0, 20).join('\n')}\n\n> 💡 更多详细内容请学习课程：${course.title} → ${lesson.title}`,
        });
      }
    }

    // 为测验题目生成条目
    for (const q of course.quiz) {
      entries.push({
        keywords: q.question.split(/[，、,。？?]/).filter(k => k.length > 2),
        answer: `**问题：** ${q.question}\n\n**正确答案：** ${q.options[q.correctAnswer]}\n\n**解析：** ${q.explanation}\n\n> 此题来自课程《${course.title}》的考核`,
      });
    }
  }

  // 添加通用合规问题
  entries.push({
    keywords: ['什么', '合规', '培训', '课程', '内容'],
    answer: `## 合规培训课程概览\n\n我们的合规培训包含以下四大模块：\n\n1. **数据合规与隐私保护** — 个人信息保护法、数据分类分级、跨境传输\n2. **反腐败与商业道德** — 反贿赂法律、利益冲突管理、廉洁行为准则\n3. **信息安全意识** — 安全威胁认知、密码安全、社会工程学防范\n4. **劳动合规与职场行为** — 劳动合同权益、职场反骚扰与平等就业\n\n每个课程模块包含多个课时学习和测验考核，及格线为80分。请在培训首页开始学习。`,
  });

  entries.push({
    keywords: ['个人信息', '隐私', '数据保护', 'PIPL'],
    answer: `## 个人信息保护要点\n\n根据《个人信息保护法》：\n\n- **个人信息**是以电子或其他方式记录的与已识别或可识别的自然人有关的各种信息\n- 分为**一般个人信息**和**敏感个人信息**（身份证号、生物识别、医疗健康、金融账户等）\n- 处理个人信息需基于**合法基础**：取得同意、履行合同必需、法定义务等\n- 企业需履行**告知义务**、**安全保障义务**和**个人信息影响评估**义务\n- 发生泄露事件需在**72小时内**通知监管部门和个人\n\n> 详细内容请学习课程《数据合规与隐私保护》`,
  });

  entries.push({
    keywords: ['贿赂', '腐败', '回扣', '礼品', '招待'],
    answer: `## 反腐败与商业道德要点\n\n- **商业贿赂**是指为谋取交易机会或竞争优势，给予或收受财物的行为\n- 红线行为：向政府官员行贿、向客户决策人提供回扣、虚假列支费用行贿\n- **礼品标准**：单次不超过500元，年度累计不超过2000元\n- **严禁**：收受现金/购物卡/奢侈品、接受旅游安排、招投标期间收受任何礼品\n- 超标礼品应在**3个工作日内**退还并报备\n- 发现利益冲突应在**3个工作日内**申报\n\n> 详细内容请学习课程《反腐败与商业道德》`,
  });

  entries.push({
    keywords: ['密码', '安全', '钓鱼', '攻击', '黑客', '勒索'],
    answer: `## 信息安全要点\n\n- **强密码要求**：至少12位，包含大小写字母、数字、特殊字符中至少3种\n- 禁止使用：个人信息、常见模式、其他系统用过的密码\n- **MFA（多因素认证）**：即使密码泄露也能提供额外保护\n- **钓鱼邮件特征**：发件人地址异常、紧迫感/威胁性内容、可疑链接和附件\n- 防范措施：不点击可疑链接、交叉验证、报告安全团队\n- 发现勒索软件：**立即断网**、不要关机、立即报告安全部门\n\n> 详细内容请学习课程《信息安全意识》`,
  });

  entries.push(
    {
      keywords: ['劳动合同', '试用期', '加班', '工资', '离职', '竞业'],
      answer: `## 劳动合规要点\n\n- **试用期期限**：3个月以下不得约定；3个月-1年最长1个月；1-3年最长2个月；3年以上最长6个月\n- **加班费**：工作日150%、休息日200%（不能补休时）、法定休假日300%\n- **经济补偿**：每满一年支付一个月工资\n- **竞业限制**：期限不超过2年，期间公司需按月支付经济补偿\n- 女职工怀孕7个月以上：不得安排加班和夜班\n\n> 详细内容请学习课程《劳动合规与职场行为》`,
    },
    {
      keywords: ['骚扰', '歧视', '霸凌', '投诉', '维权'],
      answer: `## 职场反骚扰与平等就业\n\n- **职场性骚扰**包括：言语骚扰、行为骚扰、环境骚扰、条件型骚扰\n- **职场霸凌**：言语攻击、工作干扰、社交孤立、权力滥用\n- 法律禁止就业歧视：民族、种族、性别、宗教信仰、残疾等\n- 女职工特殊保护：不得因结婚、怀孕、产假、哺乳降低工资或解除合同\n- **投诉渠道**：HR部门、合规部门、匿名举报、工会、劳动监察部门\n- 公司严禁对举报人进行任何形式的打击报复\n\n> 详细内容请学习课程《劳动合规与职场行为》`,
    },
    {
      keywords: ['跨境', '数据出境', '境外', '传输'],
      answer: `## 跨境数据传输合规\n\n向境外提供个人信息需满足以下条件之一：\n\n1. **通过安全评估** — 关键信息基础设施运营者、处理100万人以上个人信息的处理者\n2. **经专业机构认证** — 个人信息保护认证\n3. **签订标准合同** — 按国家网信部门标准合同与境外接收方订立合同\n\n基本要求：告知义务、取得单独同意、事前进行个人信息保护影响评估\n\n违规后果：最高5000万元或上一年度营业额5%罚款，可责令停业整顿\n\n> 详细内容请学习课程《数据合规与隐私保护》`,
    },
  );

  return entries;
}

const KNOWLEDGE_BASE = buildKnowledgeBase();

function searchKnowledgeBase(query: string): string {
  const lowerQuery = query.toLowerCase();
  let bestMatch: { entry: KnowledgeEntry; score: number } | null = null;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += keyword.length; // 更长的关键词权重更高
      }
    }
    // 也检查答案中是否包含查询词
    if (entry.answer.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score };
    }
  }

  if (bestMatch) {
    return bestMatch.entry.answer;
  }

  // 默认回复
  return `您好！我是合规培训AI助手。关于您的问题"${query}"，我目前的知识库中没有找到完全匹配的内容。\n\n我可以帮您解答以下方面的合规问题：\n\n- 📋 **数据合规与隐私保护** — 个人信息保护法、数据分类分级、跨境传输\n- ⚖️ **反腐败与商业道德** — 反贿赂法律、利益冲突、廉洁行为准则\n- 🔒 **信息安全意识** — 密码安全、钓鱼防范、数据泄露防护\n- 👥 **劳动合规与职场行为** — 劳动合同、加班费、职场反骚扰\n\n请尝试更具体地描述您的问题，或学习相关课程获取详细内容。`;
}

// ========== Chat Hook ==========

interface UseChatOptions {
  currentSession: Session | undefined;
  currentSessionId: string | null;
  selectedModel: string;
  getAgent: (id: string) => CustomAgent | undefined;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  updateSessionMessages: (sessionId: string, updater: (messages: Message[]) => Message[]) => void;
  updateSessionModel: (sessionId: string, modelId: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

interface NewChatOptions {
  agentId: string;
  cwd: string;
  permissionMode: PermissionMode;
}

export function useChat(options: UseChatOptions) {
  const {
    currentSession,
    currentSessionId,
    selectedModel,
    getAgent,
    updateSessionModel,
    setCurrentSessionId,
    setSessions,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.draftInput) || '';
  });
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);

  const saveInput = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  // 发送消息（本地知识库）
  const sendMessage = useCallback(async (
    messageContent: string,
    newChatOptions?: NewChatOptions,
    onNavigate?: (path: string) => void
  ) => {
    if (!messageContent.trim() || isLoading) return;

    let sessionId = currentSessionId;
    let currentAgentId = currentSession?.agentId || 'default';

    // 如果没有当前会话，创建新会话
    if (!sessionId && newChatOptions) {
      const newSession: Session = {
        id: uuidv4(),
        title: messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : ''),
        model: selectedModel,
        agentId: newChatOptions.agentId,
        permissionMode: newChatOptions.permissionMode,
        createdAt: new Date(),
        messages: []
      };

      setSessions(prev => {
        const updated = [newSession, ...prev];
        // 持久化
        try {
          localStorage.setItem('compliance_chat_sessions', JSON.stringify(updated));
        } catch { /* ignore */ }
        return updated;
      });
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
      currentAgentId = newSession.agentId || 'default';

      updateSessionModel(newSession.id, selectedModel);

      onNavigate?.(`/chat/${newSession.id}`);
    }

    const tempUserMessageId = uuidv4();
    const tempAssistantMessageId = uuidv4();

    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    const assistantMessage: Message = {
      id: tempAssistantMessageId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date(),
      isStreaming: true,
      contentBlocks: []
    };

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const newTitle = s.messages.length === 0
            ? messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '')
            : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage, assistantMessage]
          };
        }
        return s;
      });
      // 持久化
      try {
        localStorage.setItem('compliance_chat_sessions', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });

    setInputValue('');
    localStorage.removeItem(STORAGE_KEYS.draftInput);
    setIsLoading(true);

    // 搜索本地知识库
    const fullContent = searchKnowledgeBase(messageContent);
    const contentBlocks: ContentBlock[] = [{ type: 'text', text: fullContent }];

    // 模拟流式输出
    const words = fullContent.split('');
    const chunkSize = 3; // 每次输出3个字符
    let displayedContent = '';

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join('');
      displayedContent += chunk;

      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === tempAssistantMessageId
                  ? { ...m, content: displayedContent, model: selectedModel, contentBlocks: [{ type: 'text', text: displayedContent }] }
                  : m
              )
            };
          }
          return s;
        });
        return updated;
      });

      // 小延迟模拟流式效果
      await new Promise(resolve => setTimeout(resolve, 15));
    }

    // 标记完成
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map(m =>
              m.id === tempAssistantMessageId
                ? { ...m, isStreaming: false }
                : m
            )
          };
        }
        return s;
      });
      // 持久化
      try {
        localStorage.setItem('compliance_chat_sessions', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });

    setIsLoading(false);
  }, [currentSession, currentSessionId, selectedModel, getAgent, updateSessionModel, setCurrentSessionId, setSessions, isLoading]);

  const handleStop = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 权限处理（本地模式下不需要，但保留接口兼容）
  const handlePermissionAllow = useCallback(async () => {
    setPermissionRequest(null);
  }, []);

  const handlePermissionDeny = useCallback(async () => {
    setPermissionRequest(null);
  }, []);

  return {
    isLoading,
    inputValue,
    setInputValue: saveInput,
    permissionRequest,
    sendMessage,
    handleStop,
    handlePermissionAllow,
    handlePermissionDeny,
  };
}
