import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  UserOutlined,
  PictureOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import DashboardPage from './DashboardPage';
import NewsManagePage from './NewsManagePage';
import NewsEditPage from './NewsEditPage';
import NotificationsPage from './NotificationsPage';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">控制台</Link>
    },
    {
      key: 'news',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/news">新闻管理</Link>
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: <Link to="/admin/notifications">通知公告</Link>
    },
    {
      key: 'admissions',
      icon: <TeamOutlined />,
      label: <Link to="/admin/admissions">招生信息</Link>
    },
    {
      key: 'carousel',
      icon: <PictureOutlined />,
      label: <Link to="/admin/carousel">轮播图管理</Link>
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">用户管理</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">系统设置</Link>
    }
  ];

  const currentPath = location.pathname;
  const activeMenuItem = items.find(item => 
    currentPath.startsWith(item.key === 'dashboard' ? '/admin/dashboard' : `/admin/${item.key}`)
  )?.key || 'dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="p-4">
          <h1 className="text-white text-lg font-bold truncate">
            {collapsed ? 'JLU' : '吉林大学珠海研究院'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenuItem]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-between items-center px-4 h-full">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleSignOut}
              danger
            >
              退出登录
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/news" element={<NewsManagePage />} />
            <Route path="/news/create" element={<NewsEditPage />} />
            <Route path="/news/edit/:id" element={<NewsEditPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;