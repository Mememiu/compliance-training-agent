import { useState, useEffect, useCallback } from 'react';
import { CustomAgent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'customAgents';

// 默认的 Agent — 合规培训AI助手
const DEFAULT_AGENT: CustomAgent = {
  id: 'default',
  name: '合规培训助手',
  description: '专业解答数据合规、反腐败、信息安全、劳动合规等问题',
  systemPrompt: `你是公司的合规培训AI助手，专门帮助新员工学习和理解公司合规要求。你的职责包括：

1. **解答合规问题** — 准确回答关于数据合规、反腐败、信息安全、劳动合规等方面的问题
2. **培训指导** — 引导员工学习合规课程，解释课程中的关键概念
3. **案例分析** — 帮助员工理解实际工作中的合规风险场景
4. **政策解读** — 解释公司合规政策和法律法规要求

回答要求：
- 使用简洁、专业的中文回答
- 引用具体的法律法规条款时确保准确
- 遇到不确定的问题时诚实说明
- 鼓励员工主动学习和遵守合规要求
- 涉及具体法律建议时，建议咨询公司法务部门`,
  icon: 'ShieldCheck',
  color: '#0052d9',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useAgents() {
  const [agents, setAgents] = useState<CustomAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [DEFAULT_AGENT, ...parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }))];
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
    return [DEFAULT_AGENT];
  });

  // 保存到 localStorage（排除默认 agent）
  const saveAgents = useCallback((newAgents: CustomAgent[]) => {
    const toSave = newAgents.filter(a => a.id !== 'default');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  const addAgent = useCallback((agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent: CustomAgent = {
      ...agent,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAgents(prev => {
      const updated = [...prev, newAgent];
      saveAgents(updated);
      return updated;
    });
    return newAgent;
  }, [saveAgents]);

  const updateAgent = useCallback((id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => {
    setAgents(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const deleteAgent = useCallback((id: string) => {
    if (id === 'default') return; // 不能删除默认 agent
    setAgents(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const getAgent = useCallback((id: string) => {
    return agents.find(a => a.id === id);
  }, [agents]);

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    defaultAgent: DEFAULT_AGENT,
  };
}
