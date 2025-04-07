import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Upload, Switch, InputNumber, Select } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import TextEditor from '../../components/TextEditor';

const { Option } = Select;

interface AdmissionItem {
  id: string;
  title: string;
  content: string;
  category: string;
  images: Array<{
    url: string;
    name: string;
  }>;
  attachments: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  published: boolean;
  published_at: string | null;
  created_at: string;
  created_by: string;
  display_order: number;
  is_top: boolean;
}

const AdmissionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdmissionItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AdmissionItem | null>(null);
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const { data: admissions, error } = await supabase
        .from('admissions')
        .select('*')
        .order('is_top', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setData(admissions || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      fetchAdmissions();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleEdit = (record: AdmissionItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      published: record.published,
      display_order: record.display_order,
      is_top: record.is_top
    });
    setContent(record.content);
    setImageList(record.images?.map(img => ({
      uid: img.url,
      name: img.name,
      status: 'done',
      url: img.url
    })) || []);
    setFileList(record.attachments?.map(file => ({
      uid: file.url,
      name: file.name,
      status: 'done',
      url: file.url
    })) || []);
    setModalVisible(true);
  };

  const uploadFile = async (file: File, type: 'images' | 'attachments') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const bucketName = type === 'images' ? 'admissions-images' : 'admissions-attachments';
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        name: file.name,
        type: file.type
      };
    } catch (error: any) {
      message.error(`文件上传失败: ${error.message}`);
      return null;
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setImageList(newFileList);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Upload images
      const uploadedImages = await Promise.all(
        imageList
          .filter(file => file.originFileObj)
          .map(file => uploadFile(file.originFileObj, 'images'))
      );

      // Upload attachments
      const uploadedFiles = await Promise.all(
        fileList
          .filter(file => file.originFileObj)
          .map(file => uploadFile(file.originFileObj, 'attachments'))
      );

      const finalImages = [
        ...imageList.filter(file => !file.originFileObj).map(file => ({
          url: file.url,
          name: file.name
        })),
        ...uploadedImages.filter(Boolean)
      ];

      const finalFiles = [
        ...fileList.filter(file => !file.originFileObj).map(file => ({
          url: file.url,
          name: file.name,
          type: file.type
        })),
        ...uploadedFiles.filter(Boolean)
      ];

      const admissionData = {
        ...values,
        content,
        images: finalImages,
        attachments: finalFiles,
        updated_at: new Date().toISOString()
      };

      if (values.published && !admissionData.published_at) {
        admissionData.published_at = new Date().toISOString();
      }

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('admissions')
          .update(admissionData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('admissions')
          .insert([{
            ...admissionData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]));
      }

      if (error) throw error;

      message.success(`${editingItem ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setContent('');
      setImageList([]);
      setFileList([]);
      setEditingItem(null);
      fetchAdmissions();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    maxCount: 10
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: AdmissionItem) => (
        <Space>
          <span>{text}</span>
          {record.is_top && <Tag color="red">TOP</Tag>}
        </Space>
      ),
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
      title: '显示顺序',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: AdmissionItem, b: AdmissionItem) => a.display_order - b.display_order,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '发布时间',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AdmissionItem) => (
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
        <h2 className="text-2xl font-bold">招生信息</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setContent('');
            setImageList([]);
            setFileList([]);
            setModalVisible(true);
          }}
        >
          新增招生信息
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑招生信息' : '新增招生信息'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setContent('');
          setImageList([]);
          setFileList([]);
          setEditingItem(null);
        }}
        width={1200}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: '',
            category: '本科生招生',
            published: false,
            display_order: 0,
            is_top: false
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
            <Select>
              <Option value="本科生招生">本科生招生</Option>
              <Option value="研究生招生">研究生招生</Option>
              <Option value="国际学生招生">国际学生招生</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextEditor 
              value={content}
              onChange={setContent}
            />
          </Form.Item>

          <Form.Item label="图片">
            <Upload
              {...uploadProps}
              listType="picture-card"
              fileList={imageList}
              onChange={handleImageChange}
              accept="image/*"
            >
              {imageList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="附件">
            <Upload.Dragger
              {...uploadProps}
              fileList={fileList}
              onChange={handleFileChange}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单次或批量上传</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="display_order"
            label="显示顺序"
            rules={[{ required: true, message: '请输入显示顺序' }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="is_top"
            label="置顶"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
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

export default AdmissionsPage;