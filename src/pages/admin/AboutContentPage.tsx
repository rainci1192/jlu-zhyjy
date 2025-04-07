import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, Switch, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import TextEditor from '../../components/TextEditor';
import CategorySelector from '../../components/CategorySelector';

const { Option } = Select;

interface AboutContent {
  id: string;
  title: string;
  content: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const AboutContentPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AboutContent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutContent | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    fetchContent();
    
    // 添加一次性样式注入到文档头部，确保所有的Froala富文本编辑器样式都正确加载
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .fr-box {
        position: relative !important;
        z-index: 10000 !important;
      }
      .fr-toolbar {
        z-index: 10001 !important;
        visibility: visible !important;
        display: block !important;
        opacity: 1 !important;
        position: sticky !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
      }
      .fr-wrapper {
        z-index: 9999 !important;
      }
      .fr-popup {
        z-index: 10002 !important;
      }
      .fr-second-toolbar {
        z-index: 10000 !important;
      }
      .fr-element {
        min-height: 500px !important;
      }
      .ant-modal-body {
        overflow: visible !important;
      }
      .ant-modal-content {
        overflow: visible !important;
      }
      .ant-modal {
        max-height: 90vh !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // 组件卸载时清理编辑器实例和样式
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('销毁编辑器实例时出错:', error);
        }
      }
      document.head.removeChild(styleEl);
    };
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data: contents, error } = await supabase
        .from('about_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(contents || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchContent();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleEdit = (record: AboutContent) => {
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      published: record.published,
      content: record.content
    });
    setModalVisible(true);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('about-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      message.error(`图片上传失败: ${error.message}`);
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const contentData = {
        ...values,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('about_content')
          .update(contentData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('about_content')
          .insert([{
            ...contentData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]));
      }

      if (error) throw error;

      message.success(`${editingItem ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchContent();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '发布状态',
      dataIndex: 'published',
      key: 'published',
      render: (published: boolean) => (
        <Tag color={published ? 'success' : 'default'}>
          {published ? '已发布' : '未发布'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AboutContent) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">研究院介绍管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            // 不在这里尝试设置编辑器内容，而是在编辑器准备好后设置
            setModalVisible(true);
          }}
        >
          新增内容
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑内容' : '新增内容'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        width={800}
        style={{ maxHeight: '90vh', overflow: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            published: true,
            category: '学校概况',
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
            <CategorySelector 
              style={{ width: '100%' }}
              moduleName="about"
              valueType="display_name"
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextEditor />
          </Form.Item>

          <Form.Item
            name="published"
            label="发布状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AboutContentPage;