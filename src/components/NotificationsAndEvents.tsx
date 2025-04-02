import React, { useState, useEffect } from 'react';
import { Calendar, Bell, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  type: string;
  published_at: string | null;
  created_at: string;
}

interface AdmissionInfo {
  id: string;
  title: string;
  category: string;
  published_at: string | null;
  created_at: string;
  is_top: boolean;
}

function NotificationsAndEvents() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const [notificationsResponse, admissionsResponse] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('admissions')
          .select('*')
          .eq('published', true)
          .order('is_top', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (notificationsResponse.error) {
        throw new Error(`Failed to fetch notifications: ${notificationsResponse.error.message}`);
      }
      if (admissionsResponse.error) {
        throw new Error(`Failed to fetch admissions: ${admissionsResponse.error.message}`);
      }

      setNotifications(notificationsResponse.data || []);
      setAdmissions(admissionsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('获取数据失败，请稍后重试');
      setNotifications([]);
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-[#014c85] text-white rounded-lg hover:bg-[#0066b3] transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Notifications */}
        <div>
          <div className="section-title-container">
            <div className="section-title-content">
              <h2 className="section-title">通知公告</h2>
              <p className="section-subtitle">Notification</p>
            </div>
            <button className="section-arrow-button">
              <ArrowRight className="section-arrow-icon" />
            </button>
          </div>
          
          <div className="space-y-6">
            {notifications.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20">
                    <div className="text-2xl font-bold text-white bg-[#014c85] w-full text-center py-1">
                      {dayjs(item.published_at || item.created_at).format('DD')}
                    </div>
                    <div className="text-base text-white bg-[#014c85] border-t border-white w-full text-center py-1">
                      {dayjs(item.published_at || item.created_at).format('YYYY/MM')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-normal text-[#014c85] group-hover:text-[#0066b3] group-hover:font-bold transition-all duration-300 line-clamp-2 transform group-hover:translate-x-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Information */}
        <div>
          <div className="section-title-container">
            <div className="section-title-content">
              <h2 className="section-title">招生信息</h2>
              <p className="section-subtitle">Admission Information</p>
            </div>
            <Link to="/admission" className="section-arrow-button group">
              <ArrowRight className="section-arrow-icon group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {admissions.map((info) => (
                <Link
                  key={info.id}
                  to={`/admission/${info.id}`}
                  className="block relative overflow-hidden group"
                >
                  <div className="p-4 relative z-10 flex items-center gap-6">
                    <div className="flex-shrink-0 w-24 text-center">
                      <div className="text-2xl font-bold text-[#014c85] group-hover:text-white transition-colors duration-300">
                        {dayjs(info.published_at || info.created_at).format('DD')}
                      </div>
                      <div className="text-base text-[#014c85]/80 group-hover:text-white/80 transition-colors duration-300">
                        {dayjs(info.published_at || info.created_at).format('YYYY/MM')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-medium text-[#014c85] group-hover:text-white transition-colors duration-300 line-clamp-2">
                        {info.title}
                      </h3>
                    </div>
                  </div>
                  {info.is_top && (
                    <div className="absolute top-0 right-0 bg-[#014c85] text-white text-xs px-2 py-1 rounded-bl-lg z-20">
                      TOP
                    </div>
                  )}
                  {/* Background fill animation */}
                  <div 
                    className="absolute inset-0 bg-[#014c85] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"
                    style={{ transformOrigin: 'left' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsAndEvents;