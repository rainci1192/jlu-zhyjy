import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavItem {
  id: string;
  title: string;
  link: string;
  has_submenu: boolean;
  parent_id: string | null;
  children?: NavItem[];
}

interface Logo {
  id: string;
  url: string;
  name: string;
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [logo, setLogo] = useState<Logo | null>(null);

  useEffect(() => {
    fetchNavItems();
    fetchLogo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedData = formatNavData(data || []);
      setNavItems(formattedData);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
    }
  };

  const fetchLogo = async () => {
    try {
      // 直接从数据库获取激活的Logo
      const { data } = await supabase
        .from('site_logo')
        .select('id, name, url')
        .eq('active', true)
        .maybeSingle();
      
      // 只在有有效数据时设置Logo
      if (data && data.url) {
        setLogo({
          id: data.id,
          name: data.name || '学校Logo',
          url: data.url
        });
      } else {
        console.log('未找到活跃的Logo');
        setLogo(null);
      }
    } catch (error) {
      console.error('获取Logo出错:', error);
      setLogo(null);
    }
  };

  const formatNavData = (data: NavItem[]): NavItem[] => {
    const parentItems = data.filter(item => !item.parent_id);
    return parentItems.map(item => ({
      ...item,
      children: data.filter(child => child.parent_id === item.id)
    }));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#014c85]">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {logo ? (
                <div className="h-16 flex items-center justify-center">
                  <img 
                    src={logo.url} 
                    alt={logo.name} 
                    className="h-16 object-contain" 
                    onError={() => setLogo(null)}
                  />
                </div>
              ) : (
                <GraduationCap className="h-16 w-16 text-white" />
              )}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">学校主页</a>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="bg-white/10 rounded-full px-4 py-1 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`w-full transition-all duration-300 ${
        scrolled ? 'bg-[#014c85]/95 backdrop-blur-sm' : 'bg-[#014c85]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex justify-between w-full">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.link}
                    className="nav-link"
                  >
                    <span className="flex items-center">
                      <span>{item.title}</span>
                      {item.has_submenu && item.children && item.children.length > 0 && (
                        <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.id ? 'rotate-180' : ''
                        }`} />
                      )}
                    </span>
                  </Link>
                  
                  {item.has_submenu && item.children && item.children.length > 0 && (
                    <div 
                      className={`nav-dropdown ${
                        activeDropdown === item.id ? 'nav-dropdown-active' : ''
                      }`}
                      style={{ pointerEvents: activeDropdown === item.id ? 'auto' : 'none' }}
                    >
                      {item.children.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.link}
                          className="nav-dropdown-item"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;