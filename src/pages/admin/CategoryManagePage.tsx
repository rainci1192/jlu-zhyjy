import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, InputNumber, Switch, Card, Tag, Tooltip, Popconfirm, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, ReloadOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';
import { checkSupabaseConnection } from '../../lib/supabase';

interface CategoryModule {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  display_name: string;
  module_id: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 临时演示数据 - 模拟数据库中的数据
const DEMO_MODULES: CategoryModule[] = [
  {
    id: '1',
    name: 'news',
    display_name: '新闻管理',
    description: '新闻资讯的分类管理',
    is_active: true
  },
  {
    id: '2',
    name: 'admissions',
    display_name: '招生信息',
    description: '招生相关信息的分类管理',
    is_active: true
  },
  {
    id: '3',
    name: 'about',
    display_name: '研究院介绍',
    description: '研究院介绍内容的分类管理',
    is_active: true
  },
  {
    id: '4',
    name: 'research',
    display_name: '科研平台',
    description: '科研平台相关的分类管理',
    is_active: true
  },
  {
    id: '5',
    name: 'notifications',
    display_name: '通知公告',
    description: '通知公告的分类管理',
    is_active: true
  }
];

// 临时演示数据 - 模拟分类数据
const DEMO_CATEGORIES: Record<string, Category[]> = {
  '1': [ // 新闻管理分类
    {
      id: '101',
      name: 'college_news',
      display_name: '学院新闻',
      module_id: '1',
      description: '学院重要新闻和活动',
      icon: 'news',
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '102',
      name: 'academic_activities',
      display_name: '学术活动',
      module_id: '1',
      description: '学术讲座、研讨会等学术活动',
      icon: 'book',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  '2': [ // 招生信息分类
    {
      id: '201',
      name: 'undergraduate',
      display_name: '本科生招生',
      module_id: '2',
      description: '本科生招生相关信息',
      icon: 'user',
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '202',
      name: 'graduate',
      display_name: '研究生招生',
      module_id: '2',
      description: '研究生招生相关信息',
      icon: 'user',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  '3': [ // 研究院介绍分类
    {
      id: '301',
      name: 'overview',
      display_name: '研究院概况',
      module_id: '3',
      description: '研究院基本情况介绍',
      icon: 'info-circle',
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '302',
      name: 'organization',
      display_name: '机构设置',
      module_id: '3',
      description: '研究院组织机构设置',
      icon: 'team',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  '4': [ // 科研平台分类
    {
      id: '401',
      name: 'laboratories',
      display_name: '重点实验室',
      module_id: '4',
      description: '各类重点实验室介绍',
      icon: 'experiment',
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  '5': [ // 通知公告分类
    {
      id: '501',
      name: 'announcement',
      display_name: '公告',
      module_id: '5',
      description: '重要公告',
      icon: 'notification',
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

const CategoryManagePage: React.FC = () => {
  const [modules, setModules] = useState<CategoryModule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [form] = Form.useForm();
  
  // 模块管理相关的状态
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [editingModule, setEditingModule] = useState<CategoryModule | null>(null);
  const [moduleForm] = Form.useForm();

  // 检查数据库连接状态
  const checkConnection = async () => {
    try {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      return isConnected;
    } catch (err) {
      console.error('连接检查失败:', err);
      setConnectionStatus(false);
      return false;
    }
  };

  // 获取所有模块
  const fetchModules = async () => {
    setError(null);
    try {
      setLoading(true);
      
      // 先检查连接
      const isConnected = await checkConnection();
      if (!isConnected) {
        // 数据库连接失败，使用演示数据
        setModules(DEMO_MODULES);
        if (!selectedModule && DEMO_MODULES.length > 0) {
          setSelectedModule(DEMO_MODULES[0].id);
        }
        return;
      }
      
      try {
        // 尝试从数据库获取数据
        const { data, error: fetchError } = await supabase
          .from('category_modules')
          .select('*')
          .order('display_name', { ascending: true });
        
        if (fetchError) {
          console.error('获取模块数据错误:', fetchError);
          // 如果出现"表不存在"的错误，切换到演示数据
          if (fetchError.message.includes('does not exist') || fetchError.message.includes('relation')) {
            message.warning('数据库表结构不存在，将使用演示数据');
            setModules(DEMO_MODULES);
            if (!selectedModule && DEMO_MODULES.length > 0) {
              setSelectedModule(DEMO_MODULES[0].id);
            }
            return;
          } else {
            setError(`获取模块失败: ${fetchError.message}`);
            return;
          }
        }
        
        if (!data || data.length === 0) {
          message.warning('数据库中没有找到模块数据，将使用演示数据');
          setModules(DEMO_MODULES);
          if (!selectedModule && DEMO_MODULES.length > 0) {
            setSelectedModule(DEMO_MODULES[0].id);
          }
          return;
        }
        
        setModules(data);
        
        // 默认选择第一个模块
        if (data && data.length > 0 && !selectedModule) {
          setSelectedModule(data[0].id);
        }
      } catch (dbErr) {
        console.error('数据库操作异常:', dbErr);
        // 出现异常，切换到演示数据
        message.warning('数据库操作异常，将使用演示数据');
        setModules(DEMO_MODULES);
        if (!selectedModule && DEMO_MODULES.length > 0) {
          setSelectedModule(DEMO_MODULES[0].id);
        }
      }
    } catch (err: Error | unknown) {
      console.error('获取模块异常:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`获取模块发生错误: ${errorMessage}`);
      
      // 出现严重错误也切换到演示数据
      message.warning('获取数据出错，将使用演示数据');
      setModules(DEMO_MODULES);
      if (!selectedModule && DEMO_MODULES.length > 0) {
        setSelectedModule(DEMO_MODULES[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  // 根据选中的模块获取分类
  const fetchCategories = async (moduleId: string) => {
    setError(null);
    try {
      setLoading(true);
      
      // 如果有演示数据，直接使用
      if (moduleId && typeof DEMO_CATEGORIES[moduleId] !== 'undefined') {
        setCategories(DEMO_CATEGORIES[moduleId] || []);
        return;
      }
      
      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .eq('module_id', moduleId)
          .order('display_order', { ascending: true });
        
        if (fetchError) {
          console.error('获取分类数据错误:', fetchError);
          // 如果出现"表不存在"的错误，切换到演示数据
          if (fetchError.message.includes('does not exist') || fetchError.message.includes('relation')) {
            message.warning('分类表结构不存在，将使用演示数据');
            setCategories(DEMO_CATEGORIES[moduleId] || []);
            return;
          } else {
            setError(`获取分类失败: ${fetchError.message}`);
            return;
          }
        }
        
        setCategories(data || []);
      } catch (dbErr) {
        console.error('分类数据库操作异常:', dbErr);
        // 出现异常，切换到演示数据
        message.warning('分类数据获取异常，将使用演示数据');
        setCategories(DEMO_CATEGORIES[moduleId] || []);
      }
    } catch (err: Error | unknown) {
      console.error('获取分类异常:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`获取分类发生错误: ${errorMessage}`);
      
      // 出现严重错误也切换到演示数据
      message.warning('获取分类出错，将使用演示数据');
      setCategories(DEMO_CATEGORIES[moduleId] || []);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchModules();
  }, []);

  // 当选中的模块改变时，获取对应的分类
  useEffect(() => {
    if (selectedModule) {
      fetchCategories(selectedModule);
    }
  }, [selectedModule]);

  // 处理模块切换
  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      
      if (selectedModule) {
        fetchCategories(selectedModule);
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error('删除分类失败');
    }
  };

  // 编辑分类
  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      display_name: record.display_name,
      description: record.description,
      icon: record.icon,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  // 添加分类
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      display_order: categories.length
    });
    setModalVisible(true);
  };

  // 提交表单
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 确保使用正确的模块ID
      values.module_id = selectedModule;

      let error;
      if (editingCategory) {
        // 更新现有分类
        ({ error } = await supabase
          .from('categories')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id));
      } else {
        // 创建新分类
        ({ error } = await supabase
          .from('categories')
          .insert([{
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      message.success(`${editingCategory ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      
      if (selectedModule) {
        fetchCategories(selectedModule);
      }
    } catch (error) {
      console.error('保存分类失败:', error);
      message.error('操作失败');
    }
  };

  // 模块操作相关方法
  const handleAddModule = () => {
    setEditingModule(null);
    moduleForm.resetFields();
    moduleForm.setFieldsValue({
      is_active: true
    });
    setModuleModalVisible(true);
  };

  const handleEditModule = (module: CategoryModule) => {
    setEditingModule(module);
    moduleForm.setFieldsValue({
      name: module.name,
      display_name: module.display_name,
      description: module.description,
      is_active: module.is_active
    });
    setModuleModalVisible(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      // 先检查此模块是否有关联的分类
      const { data: relatedCategories, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('module_id', moduleId);
      
      if (checkError) throw checkError;
      
      if (relatedCategories && relatedCategories.length > 0) {
        Modal.confirm({
          title: '确定要删除此模块吗？',
          content: `此模块有${relatedCategories.length}个关联的分类，删除模块将同时删除所有关联分类。`,
          okText: '确定删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            await performModuleDeletion(moduleId);
          }
        });
      } else {
        await performModuleDeletion(moduleId);
      }
    } catch (error) {
      console.error('检查模块关联分类失败:', error);
      message.error('删除模块失败');
    }
  };

  const performModuleDeletion = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('category_modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
      
      message.success('删除模块成功');
      
      // 如果删除的是当前选中的模块，清空选择
      if (selectedModule === moduleId) {
        setSelectedModule(null);
        setCategories([]);
      }
      
      // 重新加载模块列表
      fetchModules();
    } catch (error) {
      console.error('删除模块失败:', error);
      message.error('删除模块失败');
    }
  };

  const handleModuleModalOk = async () => {
    try {
      const values = await moduleForm.validateFields();
      
      let error;
      if (editingModule) {
        // 更新现有模块
        ({ error } = await supabase
          .from('category_modules')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingModule.id));
      } else {
        // 创建新模块
        ({ error } = await supabase
          .from('category_modules')
          .insert([{
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      message.success(`${editingModule ? '更新' : '创建'}模块成功`);
      setModuleModalVisible(false);
      moduleForm.resetFields();
      setEditingModule(null);
      
      // 重新加载模块列表
      fetchModules();
    } catch (error) {
      console.error('保存模块失败:', error);
      message.error('操作失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '系统名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '显示顺序',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除此分类吗？"
            description="删除后无法恢复，且可能影响使用该分类的内容"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 查找当前选中模块
  const currentModule = modules.find(module => module.id === selectedModule);

  // 操作区域渲染
  const renderActionArea = () => {
    if (error) {
      return (
        <Alert
          message="数据加载错误"
          description={
            <div>
              <p>{error}</p>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchModules()}
                type="primary"
                size="small"
                className="mt-2"
              >
                重试
              </Button>
            </div>
          }
          type="error"
          showIcon
          className="mb-4"
        />
      );
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">分类管理</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusCircleOutlined />}
            onClick={handleAddModule}
          >
            添加模块
          </Button>
          {selectedModule && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加分类
            </Button>
          )}
        </Space>
      </div>
      
      {renderActionArea()}
      
      <Card className="mb-4">
        <div className="text-sm text-gray-500 mb-4">
          <InfoCircleOutlined className="mr-1" /> 
          分类管理模块用于统一管理各个内容模块的分类信息，选择左侧的模块标签来管理对应模块的分类
          {connectionStatus !== null && (
            <Tag className="ml-2" color={connectionStatus ? 'success' : 'error'}>
              {connectionStatus ? '数据库已连接' : '数据库未连接'}
            </Tag>
          )}
        </div>
        
        <div className="flex">
          <div className="w-48 border-r pr-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium">内容模块</h3>
            </div>
            {loading && modules.length === 0 ? (
              <div className="text-gray-400">加载中...</div>
            ) : (
              <ul className="space-y-2">
                {modules.map(module => (
                  <li key={module.id} className="flex items-center">
                    <Button 
                      type={selectedModule === module.id ? "primary" : "default"}
                      onClick={() => handleModuleChange(module.id)}
                      block
                      className="flex-grow text-left"
                    >
                      {module.display_name}
                    </Button>
                    <Space size="small" className="ml-1">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModule(module);
                        }}
                      />
                      <Popconfirm
                        title="确定要删除此模块吗？"
                        description="删除后不可恢复，且会删除此模块下的所有分类"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />} 
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex-1 pl-4">
            {currentModule && (
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  {currentModule.display_name}
                  <Tooltip title={currentModule.description}>
                    <InfoCircleOutlined className="ml-2 text-gray-400" />
                  </Tooltip>
                </h3>
                <p className="text-sm text-gray-500">{currentModule.description}</p>
              </div>
            )}
            
            <Table 
              columns={columns} 
              dataSource={categories} 
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="categoryForm"
          id="categoryForm"
        >
          <Form.Item
            name="display_name"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
            tooltip="在各模块的下拉选项和前端页面展示的名称"
          >
            <Input placeholder="如：学院新闻" />
          </Form.Item>

          <Form.Item
            name="name"
            label="系统名称"
            rules={[
              { required: true, message: '请输入系统名称' },
              { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线' }
            ]}
            tooltip="用于系统识别的唯一标识，只能包含小写字母、数字和下划线"
          >
            <Input placeholder="如：college_news" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            tooltip="分类的详细描述，有助于内容编辑理解分类用途"
          >
            <Input.TextArea placeholder="描述该分类的用途" rows={3} />
          </Form.Item>

          <Form.Item
            name="icon"
            label="图标"
            tooltip="可选，分类的图标名称或图标代码"
          >
            <Input placeholder="如：news 或 file-text" />
          </Form.Item>

          <Form.Item
            name="display_order"
            label="显示顺序"
            tooltip="数字越小排序越靠前"
            rules={[{ required: true, message: '请输入显示顺序' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="是否启用"
            valuePropName="checked"
            tooltip="禁用后在前端和管理后台的分类选择中不会显示"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模块编辑模态框 */}
      <Modal
        title={editingModule ? '编辑模块' : '添加模块'}
        open={moduleModalVisible}
        onOk={handleModuleModalOk}
        onCancel={() => {
          setModuleModalVisible(false);
          moduleForm.resetFields();
          setEditingModule(null);
        }}
        width={600}
      >
        <Form
          form={moduleForm}
          layout="vertical"
          name="moduleForm"
          id="moduleForm"
        >
          <Form.Item
            name="display_name"
            label="显示名称"
            rules={[{ required: true, message: '请输入模块显示名称' }]}
            tooltip="在管理界面展示的模块名称"
          >
            <Input placeholder="如：新闻管理" />
          </Form.Item>

          <Form.Item
            name="name"
            label="系统名称"
            rules={[
              { required: true, message: '请输入模块系统名称' },
              { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线' }
            ]}
            tooltip="用于系统识别的唯一标识，只能包含小写字母、数字和下划线"
          >
            <Input placeholder="如：news" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            tooltip="模块的详细描述，帮助理解模块用途"
          >
            <Input.TextArea placeholder="描述该模块的用途" rows={3} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="是否启用"
            valuePropName="checked"
            tooltip="禁用后该模块在前端不会显示"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagePage;
