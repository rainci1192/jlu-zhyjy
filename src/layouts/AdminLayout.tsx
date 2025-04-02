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
  ExperimentOutlined,
  CameraOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import DashboardPage from '../pages/admin/DashboardPage';
import NewsManagePage from '../pages/admin/NewsManagePage';
import NewsEditPage from '../pages/admin/NewsEditPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import NotificationEditPage from '../pages/admin/NotificationEditPage';
import CarouselPage from '../pages/admin/CarouselPage';
import AdmissionsPage from '../pages/admin/AdmissionsPage';
import ResearchPlatformsPage from '../pages/admin/ResearchPlatformsPage';
import CampusSceneryPage from '../pages/admin/CampusSceneryPage';
import NavigationSettingsPage from '../pages/admin/NavigationSettingsPage';

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
      link: '/admin/dashboard'
    },
    {
      key: 'news',
      icon: <FileTextOutlined />,
      label: '新闻管理',
      link: '/admin/news'
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: '通知公告',
      link: '/admin/notifications'
    },
    {
      key: 'admissions',
      icon: <TeamOutlined />,
      label: '招生信息',
      link: '/admin/admissions'
    },
    {
      key: 'carousel',
      icon: <PictureOutlined />,
      label: '轮播图管理',
      link: '/admin/carousel'
    },
    {
      key: 'research-platforms',
      icon: <ExperimentOutlined />,
      label: '科研平台',
      link: '/admin/research-platforms'
    },
    {
      key: 'campus-scenery',
      icon: <CameraOutlined />,
      label: '校园风光',
      link: '/admin/campus-scenery'
    },
    {
      key: 'navigation',
      icon: <MenuOutlined />,
      label: '导航栏设置',
      link: '/admin/navigation'
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      link: '/admin/users'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      link: '/admin/settings'
    }
  ];

  const currentPath = location.pathname;
  const activeMenuItem = menuItems.find(item => 
    currentPath.startsWith(item.link)
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
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.link}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
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
            <Route path="/notifications/create" element={<NotificationEditPage />} />
            <Route path="/notifications/edit/:id" element={<NotificationEditPage />} />
            <Route path="/carousel" element={<CarouselPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/research-platforms" element={<ResearchPlatformsPage />} />
            <Route path="/campus-scenery" element={<CampusSceneryPage />} />
            <Route path="/navigation" element={<NavigationSettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;