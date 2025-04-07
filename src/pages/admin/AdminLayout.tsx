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
  TagsOutlined,
  MenuOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  CameraOutlined,
  BookOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import DashboardPage from './DashboardPage';
import NewsManagePage from './NewsManagePage';
import NewsEditPage from './NewsEditPage';
import NotificationsPage from './NotificationsPage';
import CategoryManagePage from './CategoryManagePage';
import NavigationSettingsPage from './NavigationSettingsPage';
import CategoryExample from '../CategoryExample';
import ResearchPlatformsPage from './ResearchPlatformsPage';
import LogoSettingsPage from './LogoSettingsPage';
import CampusSceneryPage from './CampusSceneryPage';
import AboutContentPage from './AboutContentPage';
import PartyContentPage from './PartyContentPage';

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
      key: 'about',
      icon: <BookOutlined />,
      label: <Link to="/admin/about">研究院介绍</Link>
    },
    {
      key: 'party',
      icon: <FlagOutlined />,
      label: <Link to="/admin/party">党建工作</Link>
    },
    {
      key: 'categories',
      icon: <TagsOutlined />,
      label: <Link to="/admin/categories">分类管理</Link>
    },
    {
      key: 'carousel',
      icon: <PictureOutlined />,
      label: <Link to="/admin/carousel">轮播图管理</Link>
    },
    {
      key: 'research-platforms',
      icon: <ExperimentOutlined />,
      label: <Link to="/admin/research-platforms">科研平台</Link>
    },
    {
      key: 'campus-scenery',
      icon: <CameraOutlined />,
      label: <Link to="/admin/campus-scenery">校园风光</Link>
    },
    {
      key: 'logo',
      icon: <PictureOutlined />,
      label: <Link to="/admin/logo">Logo设置</Link>
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
    },
    {
      key: 'navigation',
      icon: <MenuOutlined />,
      label: <Link to="/admin/navigation">导航管理</Link>
    },
    {
      key: 'category-example',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/category-example">分类选择器示例</Link>
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
            <Route path="/categories" element={<CategoryManagePage />} />
            <Route path="/navigation" element={<NavigationSettingsPage />} />
            <Route path="/category-example" element={<CategoryExample />} />
            <Route path="/research-platforms" element={<ResearchPlatformsPage />} />
            <Route path="/campus-scenery" element={<CampusSceneryPage />} />
            <Route path="/logo" element={<LogoSettingsPage />} />
            <Route path="/about" element={<AboutContentPage />} />
            <Route path="/party" element={<PartyContentPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;