import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Card, message, Upload } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import TextEditor from '../../components/TextEditor';
import CategorySelector from '../../components/CategorySelector';

const { Option } = Select;

const NewsEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNewsData();
    }
  }, [id]);

  const fetchNewsData = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.setFieldsValue({
          title: data.title,
          category: data.category,
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
      message.error('获取新闻数据失败');
    }
  };

  const uploadFile = async (file: File, type: 'images' | 'attachments') => {
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

      const newsData = {
        ...values,
        content,
        images: finalImages,
        attachments: finalFiles,
        updated_at: new Date().toISOString()
      };

      if (values.published && !newsData.published_at) {
        newsData.published_at = new Date().toISOString();
      }

      let error;
      if (id) {
        ({ error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('news')
          .insert([{
            ...newsData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]));
      }

      if (error) throw error;

      message.success('保存成功');
      navigate('/admin/news');
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
        <h2 className="text-2xl font-bold">{id ? '编辑新闻' : '新增新闻'}</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            title: '',
            category: '学院新闻',
            published: false
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入新闻标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <CategorySelector 
              style={{ width: '100%' }}
              moduleName="news"
              valueType="display_name"
            />
          </Form.Item>

          <Form.Item
            label="内容"
            required
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
            name="published"
            label="发布状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate('/admin/news')}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewsEditPage;