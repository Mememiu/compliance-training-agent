import { useState, useCallback } from 'react';
import { Model } from '../types';

const STORAGE_KEY = 'defaultModel';

// 静态模型列表（纯前端，无需后端）
const STATIC_MODELS: Model[] = [
  { modelId: 'compliance-ai', name: '合规培训助手', description: '基于课程内容的本地知识库' },
];

export function useModels() {
  const [models] = useState<Model[]>(STATIC_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || STATIC_MODELS[0].modelId;
  });

  const fetchModels = useCallback(async () => {
    // 纯前端模式：无需请求后端
    if (!selectedModel) {
      setSelectedModel(STATIC_MODELS[0].modelId);
    }
  }, [selectedModel]);

  const handleSetSelectedModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(STORAGE_KEY, modelId);
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel: handleSetSelectedModel,
    fetchModels,
  };
}
