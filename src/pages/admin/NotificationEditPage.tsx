import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Card, message, Upload, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const { Dragger } = Upload;

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const NotificationEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchNotificationData();
    }
  }, [id]);

  const fetchNotificationData = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.setFieldsValue({
          title: data.title,
          type: data.type,
          published: data.published
        });
        setContent(data.content);
        setImageList(data.images?.map(img => ({
          uid: img.url,
          name: img.name,
          status: 'done',
          url: img.url
        })) || []);
        setFileList(data.attachments?.map(file => ({
          uid: file.url,
          name: file.name,
          status: 'done',
          url: file.url
        })) || []);
      }
    } catch (error) {
      message.error('获取通知数据失败');
    }
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const uploadFile = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const bucketName = type === 'images' ? 'news-images' : 'news-attachments';
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
    } catch (error) {
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

  const onFinish = async (values) => {
    try {
      setLoading(true);

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
          name: file.name,
          type: file.type
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

      const notificationData = {
        ...values,
        content,
        images: finalImages,
        attachments: finalFiles,
        updated_at: new Date().toISOString()
      };

      if (values.published && !notificationData.published_at) {
        notificationData.published_at = new Date().toISOString();
      }

      let error;
      if (id) {
        ({ error } = await supabase
          .from('notifications')
          .update(notificationData)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('notifications')
          .insert([{
            ...notificationData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]));
      }

      if (error) throw error;

      message.success('保存成功');
      navigate('/admin/notifications');
    } catch (error) {
      message.error(`保存失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    maxCount: 10
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{id ? '编辑通知' : '新增通知'}</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            title: '',
            type: '通知公告',
            published: false
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入通知标题" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="通知公告">通知公告</Option>
              <Option value="活动通知">活动通知</Option>
              <Option value="会议通知">会议通知</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="内容"
            required
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ height: '400px', marginBottom: '50px' }}
            />
          </Form.Item>

          <Form.Item label="图片">
            <Upload
              {...uploadProps}
              listType="picture-card"
              fileList={imageList}
              onPreview={handlePreview}
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
            <Dragger
              {...uploadProps}
              fileList={fileList}
              onChange={handleFileChange}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单次或批量上传</p>
            </Dragger>
          </Form.Item>

          <Form.Item
            name="published"
            label="发布状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate('/admin/notifications')}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default NotificationEditPage;