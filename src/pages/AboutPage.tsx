import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSidebar from '../components/AboutSidebar';
import { supabase } from '../lib/supabase';

interface MenuItem {
  id: string;
  title: string;
  link: string;
  parent_id: string | null;
  children?: MenuItem[];
}

interface AboutContent {
  id: string;
  title: string;
  content: string;
  category: string;
}

const AboutPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNavItems();
    fetchContent();
    
    // 如果直接访问/about路径，重定向到/about/school
    if (location.pathname === '/about') {
      console.log('重定向到学校概况页面');
      navigate('/about/school');
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

      // Find the "研究院介绍" section
      const aboutSection = allItems?.find(item => item.title === '研究院介绍');
      
      if (aboutSection) {
        // Get all submenu items for the about section
        const aboutItems = allItems
          .filter(item => item.parent_id === aboutSection.id)
          .map(item => ({
            ...item,
            children: allItems.filter(child => child.parent_id === item.id)
          }));
        
        // 如果数据库中没有学校概况，手动添加一个
        if (!aboutItems.some(item => item.title === '学校概况')) {
          console.log('数据库中未找到学校概况菜单项，使用硬编码的菜单项');
          
          // 使用Navigation.tsx中定义的菜单项
          const hardcodedItems = [
            { 
              id: 'school-item',
              title: '学校概况',
              link: '/about/school',
              parent_id: aboutSection.id,
              has_submenu: false,
              display_order: 0
            },
            ...aboutItems
          ];
          
          setMenuItems(hardcodedItems);
        } else {
          setMenuItems(aboutItems);
        }
      } else {
        // 如果找不到研究院介绍部分，使用硬编码的菜单项
        console.warn('未找到研究院介绍部分，使用硬编码的菜单项');
        const hardcodedItems = [
          { 
            id: 'school-item',
            title: '学校概况',
            link: '/about/school',
            parent_id: null,
            has_submenu: false,
            display_order: 0
          },
          { 
            id: 'overview-item',
            title: '研究院概况',
            link: '/about/overview',
            parent_id: null,
            has_submenu: false,
            display_order: 1
          },
          { 
            id: 'organization-item',
            title: '机构设置',
            link: '/about/organization',
            parent_id: null,
            has_submenu: false,
            display_order: 2
          },
          { 
            id: 'history-item',
            title: '发展历程',
            link: '/about/history',
            parent_id: null,
            has_submenu: false,
            display_order: 3
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
          id: 'school-item',
          title: '学校概况',
          link: '/about/school',
          parent_id: null,
          has_submenu: false,
          display_order: 0
        },
        { 
          id: 'overview-item',
          title: '研究院概况',
          link: '/about/overview',
          parent_id: null,
          has_submenu: false,
          display_order: 1
        },
        { 
          id: 'organization-item',
          title: '机构设置',
          link: '/about/organization',
          parent_id: null,
          has_submenu: false,
          display_order: 2
        },
        { 
          id: 'history-item',
          title: '发展历程',
          link: '/about/history',
          parent_id: null,
          has_submenu: false,
          display_order: 3
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
        'school': '学校概况',
        'overview': '研究院概况', 
        'organization': '机构设置',
        'history': '发展历程',
        'faculty': '师资队伍'
      };

      const category = pathToCategory[currentPath];
      if (!category) {
        throw new Error('未找到对应的内容分类');
      }

      console.log(`正在加载分类: ${category}的内容，路径: ${currentPath}`);
      
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .single();

      if (error) {
        console.error('获取内容错误:', error);
        
        // 特殊处理学校概况，如果找不到内容，使用默认内容
        if (category === '学校概况') {
          console.log('找不到学校概况内容，使用默认内容');
          setContent({
            id: 'default-school',
            title: '学校概况',
            content: '<h2>吉林大学学校概况</h2><p>吉林大学是教育部直属的全国重点综合性大学，坐落在吉林省长春市，是国家"211工程"和"985工程"重点建设的高水平研究型大学。</p><p>学校拥有高水平的师资队伍和优质的教学资源，致力于培养具有国际视野和创新能力的高素质人才。</p>',
            category: '学校概况'
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
      if (path === 'about') {
        breadcrumbs.push({ title: '研究院介绍', path: currentPath });
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
          src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=80"
          alt="Campus Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">研究院介绍</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <AboutSidebar 
              menuItems={menuItems} 
              currentPath={location.pathname}
            />
          </div>
          <div className="col-span-3">
            {/* Breadcrumbs 移到右侧内容上方，增大字体 */}
            <nav className="mb-6 flex items-center space-x-2 text-base font-medium text-gray-700">
              {getBreadcrumbs().map((crumb, index, array) => (
                <React.Fragment key={crumb.path}>
                  <Link 
                    to={crumb.path}
                    className="hover:text-[#014c85] transition-colors"
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
                  <h1 className="text-3xl font-bold text-[#014c85] mb-6">
                    {content.title}
                  </h1>
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-[#014c85] prose-a:text-[#014c85]"
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

export default AboutPage;