import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, Upload, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface ResearchPlatform {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  image: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const ResearchPlatformsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResearchPlatform[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchPlatform | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const { data: platforms, error } = await supabase
        .from('research_platforms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setData(platforms || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('research_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchPlatforms();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleEdit = (record: ResearchPlatform) => {
    setEditingItem(record);
    setImageUrl(record.image);
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      description: record.description,
      display_order: record.display_order
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const platformData = {
        ...values,
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('research_platforms')
          .update(platformData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('research_platforms')
          .insert([{
            ...platformData,
            id: uuidv4(),
            created_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      message.success(`${editingItem ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setImageUrl('');
      setEditingItem(null);
      fetchPlatforms();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('platform-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('platform-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      message.success('图片上传成功');
    } catch (error: any) {
      message.error(`图片上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: '平台名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '英文名称',
      dataIndex: 'subtitle',
      key: 'subtitle',
    },
    {
      title: '简介',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '预览图',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="预览图" style={{ width: 100, height: 60, objectFit: 'cover' }} />
      ),
    },
    {
      title: '显示顺序',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: ResearchPlatform, b: ResearchPlatform) => a.display_order - b.display_order,
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
      render: (_: any, record: ResearchPlatform) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确定要删除这个研究平台吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">科研平台</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            setImageUrl('');
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新增平台
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑研究平台' : '新增研究平台'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrl('');
          setEditingItem(null);
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            display_order: 0
          }}
        >
          <Form.Item
            name="title"
            label="平台名称"
            rules={[{ required: true, message: '请输入平台名称' }]}
          >
            <Input placeholder="请输入平台名称" />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label="英文名称"
          >
            <Input placeholder="请输入英文名称（选填）" />
          </Form.Item>

          <Form.Item
            name="description"
            label="平台简介"
            rules={[{ required: true, message: '请输入平台简介' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入平台简介"
            />
          </Form.Item>

          <Form.Item
            label="平台图片"
            required
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div className="space-y-4">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="平台图片预览" 
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <Upload
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {imageUrl ? '更换图片' : '上传图片'}
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            name="display_order"
            label="显示顺序"
            rules={[{ required: true, message: '请输入显示顺序' }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResearchPlatformsPage;