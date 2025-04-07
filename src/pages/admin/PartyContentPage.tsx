import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Input, 
  Form, 
  message, 
  Spin, 
  Divider, 
  Typography,
  Table,
  Space,
  Modal,
  Popconfirm
} from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import { supabase } from '../../lib/supabase';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  published: boolean;
  created_at: string;
}

const PartyContentPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const categories = [
    { label: '党建动态', value: '党建动态' },
    { label: '理论学习', value: '理论学习' },
    { label: '组织建设', value: '组织建设' },
    { label: '党史教育', value: '党史教育' },
    { label: '廉政建设', value: '廉政建设' }
  ];

  useEffect(() => {
    fetchContentList();
  }, []);

  const fetchContentList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('party_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentList(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('获取内容列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record?: ContentItem) => {
    if (record) {
      setEditingContent(record);
      form.setFieldsValue({
        title: record.title,
        category: record.category,
        content: record.content,
        published: record.published
      });
    } else {
      setEditingContent(null);
      form.resetFields();
      form.setFieldsValue({
        category: '党建动态',
        published: true
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: {
    title: string;
    content: string;
    category: string;
    published: boolean;
  }) => {
    setLoading(true);
    try {
      if (editingContent) {
        // 更新现有内容
        const { error } = await supabase
          .from('party_content')
          .update({
            title: values.title,
            content: values.content,
            category: values.category,
            published: values.published
          })
          .eq('id', editingContent.id);

        if (error) throw error;
        message.success('内容更新成功');
      } else {
        // 创建新内容
        const { error } = await supabase
          .from('party_content')
          .insert([{
            title: values.title,
            content: values.content,
            category: values.category,
            published: values.published
          }]);

        if (error) throw error;
        message.success('内容创建成功');
      }

      setIsModalVisible(false);
      fetchContentList();
    } catch (error) {
      console.error('Error saving content:', error);
      message.error('保存内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('party_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('内容删除成功');
      fetchContentList();
    } catch (error) {
      console.error('Error deleting content:', error);
      message.error('删除内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat.label, value: cat.value })),
      onFilter: (value: string, record: ContentItem) => record.category === value,
      render: (text: string) => {
        const category = categories.find(cat => cat.value === text);
        return category ? category.label : text;
      }
    },
    {
      title: '发布状态',
      dataIndex: 'published',
      key: 'published',
      filters: [
        { text: '已发布', value: true },
        { text: '未发布', value: false }
      ],
      onFilter: (value: boolean, record: ContentItem) => record.published === value,
      render: (published: boolean) => (
        <Text type={published ? 'success' : 'danger'}>
          {published ? '已发布' : '未发布'}
        </Text>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ContentItem) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条内容吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="!mb-0">党建工作内容管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            添加内容
          </Button>
        </div>
        <Divider />
        <Spin spinning={loading}>
          <Table 
            dataSource={contentList} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingContent ? '编辑内容' : '添加内容'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: '党建动态',
            published: true
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <ReactQuill
              theme="snow"
              style={{ height: 300, marginBottom: 50 }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'indent': '-1'}, { 'indent': '+1' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </Form.Item>

          <Form.Item
            name="published"
            label="发布状态"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>已发布</Option>
              <Option value={false}>未发布</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button onClick={handleCancel} className="mr-2">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartyContentPage; 