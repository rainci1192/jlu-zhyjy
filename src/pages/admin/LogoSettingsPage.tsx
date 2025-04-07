import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Upload, Switch } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';

interface LogoItem {
  id: string;
  name: string;
  url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const LogoSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LogoItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LogoItem | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  useEffect(() => {
    fetchLogos();
  }, []);
  
  const fetchLogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_logo')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('获取Logo列表失败:', error);
      message.error('获取Logo列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        message.error('请上传图片文件');
        onError('上传失败: 文件类型错误');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        message.error('图片大小不能超过2MB');
        onError('上传失败: 文件过大');
        return;
      }
      
      setUploading(true);
      
      // 生成安全的文件名
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const fileName = `logo_${timestamp}.${fileExt}`;
      
      // 上传到Supabase存储
      const { error: uploadError, data } = await supabase.storage
        .from('site-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-logos')
        .getPublicUrl(fileName);
        
      setImageUrl(publicUrl);
      onSuccess('上传成功');
      message.success('Logo上传成功');
    } catch (error) {
      console.error('Logo上传失败:', error);
      message.error('Logo上传失败');
      onError('上传失败');
    } finally {
      setUploading(false);
    }
  };
  
  const handleEdit = (record: LogoItem) => {
    setEditingItem(record);
    setImageUrl(record.url);
    setFileList([
      {
        uid: '-1',
        name: record.name,
        status: 'done',
        url: record.url
      }
    ]);
    form.setFieldsValue({
      name: record.name,
      active: record.active
    });
    setModalVisible(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_logo')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchLogos();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      // First, set all logos to inactive
      await supabase
        .from('site_logo')
        .update({ active: false })
        .neq('id', id);

      // Then set the selected logo to active
      const { error } = await supabase
        .from('site_logo')
        .update({ active: true })
        .eq('id', id);

      if (error) throw error;
      message.success('设置成功');
      fetchLogos();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const logoData = {
        ...values,
        url: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('site_logo')
          .update(logoData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('site_logo')
          .insert([{
            ...logoData,
            id: uuidv4(),
            created_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      message.success(`${editingItem ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setImageUrl('');
      setFileList([]);
      setEditingItem(null);
      fetchLogos();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '预览',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <img src={url} alt="Logo预览" style={{ height: 40 }} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? '使用中' : '未使用'}
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
      render: (_: any, record: LogoItem) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          {!record.active && (
            <a onClick={() => handleSetActive(record.id)}>设为当前Logo</a>
          )}
          {!record.active && (
            <a onClick={() => handleDelete(record.id)}>删除</a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Logo设置</h2>
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
          上传新Logo
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑Logo' : '上传新Logo'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrl('');
          setFileList([]);
          setEditingItem(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            active: false
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入Logo名称' }]}
          >
            <Input placeholder="请输入Logo名称，如：学校正式Logo" />
          </Form.Item>

          <Form.Item
            label="Logo图片"
            required
            rules={[{ required: true, message: '请上传Logo图片' }]}
            help="支持JPG、PNG、GIF和SVG格式，最大2MB，建议使用透明背景的图片"
          >
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-sm text-gray-600 mb-2">
                <strong>最佳实践：</strong>
                <ul className="list-disc pl-4 mt-1">
                  <li>使用透明背景的PNG或SVG格式</li>
                  <li>宽度建议200-400像素</li>
                  <li>高度建议不超过100像素</li>
                  <li>文件大小应尽量小，以加快加载速度</li>
                </ul>
              </div>
            </div>
            
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handleUpload}
              onRemove={() => {
                setFileList([]);
                setImageUrl('');
              }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('请上传图片文件');
                }
                return isImage || Upload.LIST_IGNORE;
              }}
              onChange={({ fileList }) => {
                setFileList(fileList);
              }}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传Logo</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="active"
            label="是否启用"
            valuePropName="checked"
            help="只能同时启用一个Logo，启用后将显示在网站上"
          >
            <Switch checkedChildren="启用" unCheckedChildren="不启用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogoSettingsPage;