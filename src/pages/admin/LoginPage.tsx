import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  
  // 检查Supabase连接状态
  useEffect(() => {
    checkConnection();
  }, [retryCount]);

  // 检查Supabase连接状态
  const checkConnection = async () => {
    try {
      setConnectionError(null);
      // 简单的健康检查请求
      const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
      
      if (error) {
        console.error('Connection check error:', error);
        setConnectionError(`连接错误: ${error.message}`);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Connection check exception:', error);
      setConnectionError(`连接异常: ${error.message || '未知错误'}`);
      return false;
    }
  };

  // 重试连接
  const retryConnection = () => {
    setRetryCount(prev => prev + 1);
  };

  const onFinish = async (values: LoginForm) => {
    try {
      // 先检查连接
      const isConnected = await checkConnection();
      if (!isConnected) {
        message.error('无法连接到服务器，请检查网络连接后重试');
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error('Authentication error details:', error);
        throw error;
      }

      // Get user role from public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('User data error:', userError);
        // 如果是找不到用户的错误，给出更明确的提示
        if (userError.code === 'PGRST116') {
          throw new Error('用户不存在或未授权，请联系管理员');
        }
        throw userError;
      }

      if (!userData || userData.role !== 'admin') {
        throw new Error('无权限访问管理后台');
      }

      message.success('登录成功');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 更详细的错误处理
      if (error.message?.includes('network') || error.message?.includes('connection') || error.name === 'AuthApiError') {
        setConnectionError(`服务连接错误: ${error.message || '未知网络错误'}`);
        message.error('连接服务器失败，请检查网络连接后重试');
      } else if (error.message?.includes('Invalid login credentials')) {
        message.error('邮箱或密码错误，请重新输入');
      } else {
        message.error(error.message || '登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#014c85] to-[#0066b3] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {connectionError && (
          <Alert
            message="连接错误"
            description={
              <div>
                <p>{connectionError}</p>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={retryConnection}
                  size="small"
                  className="mt-2"
                >
                  重试连接
                </Button>
              </div>
            }
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#014c85]">吉林大学珠海研究院</h1>
          <p className="text-gray-500">后台管理系统</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{
            email: 'admin@jlu.edu.cn',
            password: 'admin123'
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="邮箱" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full bg-[#014c85] hover:bg-[#0066b3]"
            >
              登录
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500 text-sm">
            <p>默认账号：admin@jlu.edu.cn</p>
            <p>默认密码：admin123</p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;