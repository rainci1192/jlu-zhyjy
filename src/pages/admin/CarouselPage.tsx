import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Modal, Form, Input, Upload, Switch, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const CarouselPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CarouselItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCarousel();
  }, []);

  const fetchCarousel = async () => {
    try {
      setLoading(true);
      const { data: carouselData, error } = await supabase
        .from('carousel')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setData(carouselData || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('carousel')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchCarousel();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleEdit = (record: CarouselItem) => {
    setEditingItem(record);
    setImageUrl(record.image);
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      active: record.active,
      display_order: record.display_order
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const carouselData = {
        ...values,
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('carousel')
          .update(carouselData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('carousel')
          .insert([{
            ...carouselData,
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
      fetchCarousel();
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
        .from('carousel-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('carousel-images')
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
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
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
      sorter: (a: CarouselItem, b: CarouselItem) => a.display_order - b.display_order,
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
      render: (_: any, record: CarouselItem) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确定要删除这个轮播图吗？"
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
        <h2 className="text-2xl font-bold">轮播图管理</h2>
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
          新增轮播图
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑轮播图' : '新增轮播图'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrl('');
          setEditingItem(null);
        }}
        confirmLoading={uploading}
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
            <Input />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label="副标题"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="轮播图片"
            required
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div className="space-y-4">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="轮播图预览" 
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

export default CarouselPage;