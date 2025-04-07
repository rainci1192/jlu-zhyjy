import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartySidebar from '../components/PartySidebar';
import { supabase } from '../lib/supabase';

interface MenuItem {
  id: string;
  title: string;
  link: string;
  parent_id: string | null;
  children?: MenuItem[];
}

interface PartyContent {
  id: string;
  title: string;
  content: string;
  category: string;
}

const PartyPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [content, setContent] = useState<PartyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNavItems();
    fetchContent();
    
    // 如果直接访问/party路径，重定向到/party/news
    if (location.pathname === '/party') {
      console.log('重定向到党建动态页面');
      navigate('/party/news');
      return;
    }
    
    // 记录当前路径
    console.log('当前路径:', location.pathname);
  }, [location.pathname]);

  const fetchNavItems = async () => {
    try {
      // 首先尝试从数据库获取菜单项
      const { data: allItems, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Find the "党建工作" section
      const partySection = allItems?.find(item => item.title === '党建工作');
      
      if (partySection) {
        // Get all submenu items for the party section
        const partyItems = allItems
          .filter(item => item.parent_id === partySection.id)
          .map(item => ({
            ...item,
            children: allItems.filter(child => child.parent_id === item.id)
          }));
        
        setMenuItems(partyItems);
      } else {
        // 如果找不到党建工作部分，使用硬编码的菜单项
        console.warn('未找到党建工作部分，使用硬编码的菜单项');
        const hardcodedItems = [
          { 
            id: 'party-news-item',
            title: '党建动态',
            link: '/party/news',
            parent_id: null,
            has_submenu: false,
            display_order: 0
          },
          { 
            id: 'party-study-item',
            title: '理论学习',
            link: '/party/study',
            parent_id: null,
            has_submenu: false,
            display_order: 1
          },
          { 
            id: 'party-organization-item',
            title: '组织建设',
            link: '/party/organization',
            parent_id: null,
            has_submenu: false,
            display_order: 2
          },
          { 
            id: 'party-education-item',
            title: '党史教育',
            link: '/party/education',
            parent_id: null,
            has_submenu: false,
            display_order: 3
          },
          { 
            id: 'party-discipline-item',
            title: '廉政建设',
            link: '/party/discipline',
            parent_id: null,
            has_submenu: false,
            display_order: 4
          }
        ];
        setMenuItems(hardcodedItems);
      }
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      setError('导航菜单加载失败');
      
      // 出错时使用硬编码的菜单项
      const hardcodedItems = [
        { 
          id: 'party-news-item',
          title: '党建动态',
          link: '/party/news',
          parent_id: null,
          has_submenu: false,
          display_order: 0
        },
        { 
          id: 'party-study-item',
          title: '理论学习',
          link: '/party/study',
          parent_id: null,
          has_submenu: false,
          display_order: 1
        },
        { 
          id: 'party-organization-item',
          title: '组织建设',
          link: '/party/organization',
          parent_id: null,
          has_submenu: false,
          display_order: 2
        },
        { 
          id: 'party-education-item',
          title: '党史教育',
          link: '/party/education',
          parent_id: null,
          has_submenu: false,
          display_order: 3
        },
        { 
          id: 'party-discipline-item',
          title: '廉政建设',
          link: '/party/discipline',
          parent_id: null,
          has_submenu: false,
          display_order: 4
        }
      ];
      setMenuItems(hardcodedItems);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current path's last segment
      const pathSegments = location.pathname.split('/');
      const currentPath = pathSegments[pathSegments.length - 1];

      // Map paths to categories
      const pathToCategory: { [key: string]: string } = {
        'news': '党建动态',
        'study': '理论学习', 
        'organization': '组织建设',
        'education': '党史教育',
        'discipline': '廉政建设'
      };

      const category = pathToCategory[currentPath];
      if (!category) {
        throw new Error('未找到对应的内容分类');
      }

      console.log(`正在加载分类: ${category}的内容，路径: ${currentPath}`);
      
      const { data, error } = await supabase
        .from('party_content')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .single();

      if (error) {
        console.error('获取内容错误:', error);
        
        // 特殊处理党建动态，如果找不到内容，使用默认内容
        if (category === '党建动态') {
          console.log('找不到党建动态内容，使用默认内容');
          setContent({
            id: 'default-party-news',
            title: '党建动态',
            content: '<h2>中国科协创新战略研究院党建动态</h2><p>中国科协创新战略研究院党委坚持以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，认真落实新时代党的建设总要求，把政治建设摆在首位，深入推进全面从严治党，持续提升组织力和战斗力。</p><p>研究院党委定期组织开展党员干部学习教育、党性锻炼、组织生活等活动，推动学习贯彻习近平新时代中国特色社会主义思想走深走实。</p>',
            category: '党建动态'
          });
          return;
        }
        
        throw error;
      }
      
      setContent(data);
      console.log('内容加载成功:', data?.title);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('内容加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    let currentPath = '';

    breadcrumbs.push({ title: '首页', path: '/' });

    for (const path of paths) {
      currentPath += `/${path}`;
      if (path === 'party') {
        breadcrumbs.push({ title: '党建工作', path: currentPath });
      } else {
        const menuItem = menuItems.find(item => item.link === currentPath);
        if (menuItem) {
          breadcrumbs.push({ title: menuItem.title, path: currentPath });
        }
      }
    }

    return breadcrumbs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse mt-[132px] container mx-auto px-4">
          <div className="h-[300px] bg-gray-200 rounded mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
            <div className="col-span-3">
              <div className="h-[600px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Banner Image */}
      <div className="w-full h-[300px] relative mt-[132px] mb-8">
        <img 
          src="https://img.freepik.com/free-photo/red-flag-with-stars-hammer-sickle-symbolizing-communist-party_587448-4661.jpg?w=2000&t=st=1715073147~exp=1715073747~hmac=5aac96e31c4da49b98f03ecefd44babaae61e0bff32c1b3e4ded9edf3d1a71d1"
          alt="党建工作 Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">党建工作</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <PartySidebar 
              menuItems={menuItems} 
              currentPath={location.pathname}
            />
          </div>
          <div className="col-span-3">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center space-x-2 text-base font-medium text-gray-700">
              {getBreadcrumbs().map((crumb, index, array) => (
                <React.Fragment key={crumb.path}>
                  <Link 
                    to={crumb.path}
                    className="hover:text-red-600 transition-colors"
                  >
                    {crumb.title}
                  </Link>
                  {index < array.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </nav>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              {error ? (
                <div className="text-center text-red-500">
                  {error}
                </div>
              ) : content ? (
                <>
                  <h1 className="text-3xl font-bold text-red-600 mb-6">
                    {content.title}
                  </h1>
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-red-600 prose-a:text-red-600"
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                </>
              ) : (
                <div className="text-center text-gray-500">
                  暂无内容
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PartyPage; 