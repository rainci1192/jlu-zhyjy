import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Modal, Form, Input, Upload, Switch, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface CampusSceneryItem {
  id: string;
  title: string;
  image: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const CampusSceneryPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CampusSceneryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CampusSceneryItem | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchScenery();
  }, []);

  const fetchScenery = async () => {
    try {
      setLoading(true);
      const { data: sceneryData, error } = await supabase
        .from('campus_scenery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setData(sceneryData || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campus_scenery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchScenery();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleEdit = (record: CampusSceneryItem) => {
    setEditingItem(record);
    setImageUrl(record.image);
    form.setFieldsValue({
      title: record.title,
      active: record.active,
      display_order: record.display_order
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const sceneryData = {
        ...values,
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('campus_scenery')
          .update(sceneryData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('campus_scenery')
          .insert([{
            ...sceneryData,
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
      fetchScenery();
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
        .from('campus-scenery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campus-scenery')
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '预览图',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="预览图" style={{ width: 200, height: 120, objectFit: 'cover' }} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? '已启用' : '已禁用'}
        </Tag>
      ),
    },
    {
      title: '显示顺序',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: CampusSceneryItem, b: CampusSceneryItem) => a.display_order - b.display_order,
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
      render: (_: any, record: CampusSceneryItem) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确定要删除这张图片吗？"
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
        <h2 className="text-2xl font-bold">校园风光</h2>
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
          新增图片
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑图片' : '新增图片'}
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
            active: true,
            display_order: 0
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
            label="图片"
            required
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div className="space-y-4">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="图片预览" 
                  className="w-full h-60 object-cover rounded"
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

          <Form.Item
            name="active"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampusSceneryPage;