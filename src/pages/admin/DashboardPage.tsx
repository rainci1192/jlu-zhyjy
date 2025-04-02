import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { FileTextOutlined, BellOutlined, TeamOutlined, PictureOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  newsCount: number;
  notificationsCount: number;
  admissionsCount: number;
  carouselCount: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    newsCount: 0,
    notificationsCount: 0,
    admissionsCount: 0,
    carouselCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: newsCount },
        { count: notificationsCount },
        { count: admissionsCount },
        { count: carouselCount }
      ] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('admissions').select('*', { count: 'exact', head: true }),
        supabase.from('carousel').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        newsCount: newsCount || 0,
        notificationsCount: notificationsCount || 0,
        admissionsCount: admissionsCount || 0,
        carouselCount: carouselCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">控制台</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="新闻总数"
              value={stats.newsCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="通知公告"
              value={stats.notificationsCount}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="招生信息"
              value={stats.admissionsCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="轮播图数量"
              value={stats.carouselCount}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <Card title="系统信息">
          <p>系统版本：1.0.0</p>
          <p>最后更新：2024-03-31</p>
          <p>服务器状态：正常运行</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;