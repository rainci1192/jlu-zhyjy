import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Space, Row, Col } from 'antd';
import CategorySelector from '../components/CategorySelector';
import { supabase } from '../lib/supabase';

interface FormValues {
  title: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  display_name: string;
}

const CategoryExample: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategoryChange = async (value: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, display_name')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedCategory(data);
        message.success(`已选择分类: ${data.display_name}`);
      }
    } catch (error) {
      console.error('获取分类详情失败:', error);
      message.error('获取分类详情失败');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      console.log('表单数据:', values);
      message.success('提交成功!');
      form.resetFields();
      setSelectedCategory(null);
    } catch (error) {
      console.error('提交表单出错:', error);
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="分类选择器示例" style={{ maxWidth: 800, margin: '40px auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: '',
          category_id: undefined,
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
          name="category_id"
          label="所属分类"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <CategorySelector 
            style={{ width: '100%' }}
            onChange={handleCategoryChange}
            defaultCategoryName="college_news" 
            moduleName="news"
          />
        </Form.Item>

        {selectedCategory && (
          <Row style={{ marginBottom: 24 }}>
            <Col span={24}>
              <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                当前选择的分类: <strong>{selectedCategory.display_name}</strong>
              </div>
            </Col>
          </Row>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 24 }}>
        <h3>如何使用</h3>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`import CategorySelector from '../components/CategorySelector';

// 基本用法
<CategorySelector onChange={(value) => console.log('选择的分类ID:', value)} />

// 高级用法
<CategorySelector 
  style={{ width: '100%' }}
  moduleName="news"
  defaultCategoryName="college_news"
  includeInactive={false}
  triggerChangeOnLoad={true}
  onChange={(value, option) => console.log('选择的分类:', value, option)}
/>`}
        </pre>
      </div>
    </Card>
  );
};

export default CategoryExample; 