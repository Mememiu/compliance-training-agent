import { useState } from 'react';
import { 
  Form, 
  Input, 
  Textarea, 
  Button, 
  Tooltip,
  Popconfirm,
  MessagePlugin,
  Select
} from 'tdesign-react';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon,
  CheckIcon,
} from 'tdesign-icons-react';
import { Bot, Sparkles, Code, FileText, Globe, Lightbulb } from 'lucide-react';
import { CustomAgent, PermissionMode } from '../types';

interface SettingsPageProps {
  agents: CustomAgent[];
  onAdd: (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => CustomAgent;
  onUpdate: (id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

const PRESET_ICONS = [
  { name: 'Bot', icon: Bot },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Code', icon: Code },
  { name: 'FileText', icon: FileText },
  { name: 'Globe', icon: Globe },
  { name: 'Lightbulb', icon: Lightbulb },
];

const PRESET_COLORS = [
  '#0052d9', '#0594fa', '#00a870', '#ed7b2f', 
  '#e34d59', '#a25eb5', '#5c6bc0', '#26a69a'
];

const PRESET_TEMPLATES = [
  {
    name: '数据合规顾问',
    description: '专注数据保护与隐私合规咨询',
    systemPrompt: '你是数据合规顾问，擅长个人信息保护法、数据分类分级、跨境传输等数据合规问题的解答。',
    icon: 'ShieldCheck',
    color: '#0052d9',
  },
  {
    name: '反腐败顾问',
    description: '商业道德与反贿赂专业咨询',
    systemPrompt: '你是反腐败合规顾问，专注反贿赂法律、利益冲突管理、廉洁行为准则等方面的咨询。',
    icon: 'Scale',
    color: '#e34d59',
  },
  {
    name: '信息安全顾问',
    description: '信息安全意识与防护咨询',
    systemPrompt: '你是信息安全顾问，擅长密码安全、钓鱼防范、社会工程学防护等信息安全问题的解答。',
    icon: 'Lock',
    color: '#00a870',
  },
  {
    name: '劳动法顾问',
    description: '劳动合同与职场权益咨询',
    systemPrompt: '你是劳动法顾问，专注劳动合同、加班薪酬、职场反骚扰等劳动合规问题的解答。',
    icon: 'Users',
    color: '#a25eb5',
  },
];

export function SettingsPage({ 
  agents, 
  onAdd, 
  onUpdate, 
  onDelete 
}: SettingsPageProps) {
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    icon: 'Bot',
    color: '#0052d9',
    permissionMode: 'default' as PermissionMode,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      icon: 'Bot',
      color: '#0052d9',
      permissionMode: 'default',
    });
    setEditingAgent(null);
    setIsCreating(false);
  };

  const handleEdit = (agent: CustomAgent) => {
    if (agent.id === 'default') return;
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || '',
      systemPrompt: agent.systemPrompt,
      icon: agent.icon || 'Bot',
      color: agent.color || '#0052d9',
      permissionMode: agent.permissionMode || 'default',
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      MessagePlugin.warning('请填写名称和系统提示词');
      return;
    }

    if (editingAgent) {
      onUpdate(editingAgent.id, formData);
      MessagePlugin.success('Agent 已更新');
    } else {
      onAdd(formData);
      MessagePlugin.success('Agent 已创建');
    }
    resetForm();
  };

  const handleUseTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setFormData({
      ...template,
      description: template.description,
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    MessagePlugin.success('Agent 已删除');
  };

  const getIconComponent = (iconName: string) => {
    const preset = PRESET_ICONS.find(p => p.name === iconName);
    return preset ? preset.icon : Bot;
  };

  const customAgents = agents.filter(a => a.id !== 'default');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            设置
          </h1>
          <p style={{ color: 'var(--td-text-color-secondary)' }}>
            管理自定义合规顾问 Agent
          </p>
        </div>

        {/* Agent 配置 */}
        <div>
          <div className="mb-4">
            <h2 
              className="text-lg font-medium"
              style={{ color: 'var(--td-text-color-primary)' }}
            >
              Agent 配置
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--td-text-color-secondary)' }}
            >
              创建和管理自定义合规顾问
            </p>
          </div>

          <div className="space-y-6">
            {/* 创建/编辑表单 */}
            {isCreating ? (
              <div 
                className="p-5 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--td-bg-color-container)',
                  borderColor: 'var(--td-component-border)'
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-base font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                      {editingAgent ? '编辑 Agent' : '创建新 Agent'}
                    </h4>
                    <Button variant="text" onClick={resetForm}>取消</Button>
                  </div>
                  
                  <Form labelAlign="top">
                    <Form.FormItem label="名称" requiredMark>
                      <Input 
                        value={formData.name}
                        onChange={(v) => setFormData(prev => ({ ...prev, name: v as string }))}
                        placeholder="例如：数据合规顾问"
                      />
                    </Form.FormItem>
                    
                    <Form.FormItem label="描述">
                      <Input 
                        value={formData.description}
                        onChange={(v) => setFormData(prev => ({ ...prev, description: v as string }))}
                        placeholder="简短描述这个 Agent 的用途"
                      />
                    </Form.FormItem>
                    
                    <Form.FormItem label="图标和颜色">
                      <div className="flex gap-4">
                        <div className="flex gap-2">
                          {PRESET_ICONS.map(({ name, icon: Icon }) => (
                            <button
                              key={name}
                              type="button"
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all border-2"
                              style={{
                                backgroundColor: formData.icon === name ? formData.color : 'transparent',
                                color: formData.icon === name ? 'white' : 'var(--td-text-color-secondary)',
                                borderColor: formData.icon === name ? formData.color : 'var(--td-component-border)',
                              }}
                              onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                            >
                              <Icon size={18} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5 items-center">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              onClick={() => setFormData(prev => ({ ...prev, color }))}
                            >
                              {formData.color === color && <CheckIcon style={{ color: 'white' }} size="14px" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Form.FormItem>
                    
                    <Form.FormItem label="系统提示词" requiredMark>
                      <Textarea 
                        value={formData.systemPrompt}
                        onChange={(v) => setFormData(prev => ({ ...prev, systemPrompt: v as string }))}
                        placeholder="定义 Agent 的行为和能力..."
                        autosize={{ minRows: 4, maxRows: 8 }}
                      />
                    </Form.FormItem>
                  </Form>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={resetForm}>取消</Button>
                    <Button theme="primary" onClick={handleSave}>
                      {editingAgent ? '保存修改' : '创建 Agent'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 快速模板 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--td-text-color-secondary)' }}>
                    快速创建
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_TEMPLATES.map(template => {
                      const Icon = getIconComponent(template.icon);
                      return (
                        <div 
                          key={template.name} 
                          className="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
                          style={{ backgroundColor: 'var(--td-bg-color-container)' }}
                          onClick={() => handleUseTemplate(template)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: template.color }}
                            >
                              <Icon size={20} color="white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate" style={{ color: 'var(--td-text-color-primary)' }}>
                                {template.name}
                              </div>
                              <div className="text-xs truncate" style={{ color: 'var(--td-text-color-placeholder)' }}>
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 自定义创建按钮 */}
                <Button 
                  icon={<AddIcon />} 
                  variant="dashed" 
                  block 
                  onClick={() => setIsCreating(true)}
                >
                  从头创建 Agent
                </Button>

                {/* 已有的自定义 Agent */}
                {customAgents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--td-text-color-secondary)' }}>
                      我的 Agent ({customAgents.length})
                    </h4>
                    <div className="space-y-2">
                      {customAgents.map(agent => {
                        const Icon = getIconComponent(agent.icon || 'Bot');
                        return (
                          <div 
                            key={agent.id} 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--td-bg-color-container)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: agent.color || '#0052d9' }}
                              >
                                <Icon size={20} color="white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                                  {agent.name}
                                </div>
                                <div className="text-xs truncate" style={{ color: 'var(--td-text-color-placeholder)' }}>
                                  {agent.description || agent.systemPrompt.slice(0, 50) + '...'}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Tooltip content="编辑">
                                  <Button 
                                    variant="text" 
                                    shape="circle" 
                                    size="small"
                                    icon={<EditIcon />}
                                    onClick={() => handleEdit(agent)}
                                  />
                                </Tooltip>
                                <Popconfirm
                                  content="确定删除这个 Agent 吗？"
                                  onConfirm={() => handleDelete(agent.id)}
                                >
                                  <Tooltip content="删除">
                                    <Button 
                                      variant="text" 
                                      shape="circle" 
                                      size="small"
                                      icon={<DeleteIcon />}
                                    />
                                  </Tooltip>
                                </Popconfirm>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
