import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, ChevronDown, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from './Footer';

interface NavItem {
  id: string;
  title: string;
  link: string;
  has_submenu: boolean;
  icon: string | null;
  children?: NavItem[];
}

interface SubPageLayoutProps {
  children: React.ReactNode;
}

const SubPageLayout: React.FC<SubPageLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    fetchNavItems();
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkMobileView = () => {
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
      const containerWidth = navContainer.getBoundingClientRect().width;
      const itemsWidth = Array.from(navContainer.children).reduce((total, item) => {
        return total + item.getBoundingClientRect().width;
      }, 0);
      setIsMobileView(itemsWidth > containerWidth);
    }
  };

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
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#014c85] shadow-lg">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <div>
              <div className="text-2xl font-bold text-white">吉林大学珠海研究院</div>
              <div className="text-base text-gray-300">Zhuhai Institute of Jilin University</div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
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
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#014c85]/95 backdrop-blur-sm shadow-lg' : 'bg-[#014c85]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <button 
              className={`p-2 ${isMobileView ? 'block' : 'hidden'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div className={`nav-container ${isMobileView ? 'hidden' : 'hidden md:flex justify-between w-full'}`}>
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

      {/* Mobile Menu */}
      <div 
        className={`mobile-nav ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          className="absolute top-4 right-4 text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center w-full px-4">
          {navItems.map((item) => (
            <div key={item.id} className="w-full">
              <div
                className="mobile-nav-link"
                onClick={() => {
                  if (item.has_submenu && item.children && item.children.length > 0) {
                    setMobileDropdown(mobileDropdown === item.id ? null : item.id);
                  } else {
                    setIsMenuOpen(false);
                  }
                }}
              >
                <span>{item.title}</span>
                {item.has_submenu && item.children && item.children.length > 0 && (
                  <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                    mobileDropdown === item.id ? 'rotate-180' : ''
                  }`} />
                )}
              </div>

              {item.has_submenu && item.children && item.children.length > 0 && mobileDropdown === item.id && (
                <div className="mobile-nav-dropdown">
                  {item.children.map((subItem) => (
                    <Link
                      key={subItem.id}
                      to={subItem.link}
                      className="mobile-nav-dropdown-item"
                      onClick={() => setIsMenuOpen(false)}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubPageLayout;