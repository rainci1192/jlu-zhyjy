import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Tag, Share2, GraduationCap, Search, ChevronDown, Menu, ChevronRight, Home, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import navItems from '../components/Navigation';

interface NewsDetail {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  images: Array<{
    url: string;
    name: string;
  }>;
  attachments: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNewsData();
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNewsData = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setNews({
          id: data.id,
          title: data.title,
          date: new Date(data.created_at).toLocaleDateString('zh-CN'),
          category: data.category,
          content: data.content,
          images: data.images || [],
          attachments: data.attachments || []
        });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到相关新闻</h2>
          <Link 
            to="/news" 
            className="text-[#014c85] hover:text-[#0066b3] transition-colors"
          >
            返回新闻列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#014c85] to-[#0066b3]">
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
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 bg-[#014c85] shadow-lg ${
        scrolled ? 'bg-opacity-95 backdrop-blur-sm' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div className="hidden md:flex">
              {navItems.map((item) => (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.link}
                    className="flex items-center px-4 py-4 text-white hover:text-gray-300 transition-colors font-bold text-lg"
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                      {item.subItems && (
                        <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.title ? 'rotate-180' : ''
                        }`} />
                      )}
                    </span>
                  </Link>
                  
                  {item.subItems && (
                    <div 
                      className={`absolute top-full left-0 w-48 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 ${
                        activeDropdown === item.title ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                      }`}
                      style={{ pointerEvents: activeDropdown === item.title ? 'auto' : 'none' }}
                    >
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.title}
                          to={subItem.link}
                          className="block px-4 py-2 text-gray-800 hover:bg-[#014c85] hover:text-white transition-colors font-bold text-base"
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
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#014c85] z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="text-xl text-white hover:text-gray-300 transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 mb-8 text-sm md:text-base">
          <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center">
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            <span className="ml-1">首页</span>
          </Link>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Link to="/news" className="text-white hover:text-gray-300 transition-colors">
            新闻动态
          </Link>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Link to={`/news/${news.category}`} className="text-white hover:text-gray-300 transition-colors">
            {news.category}
          </Link>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <span className="text-gray-300 truncate max-w-[200px] md:max-w-[300px]" title={news.title}>
            {news.title}
          </span>
        </nav>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {news.title}
            </h1>
            
            <div className="flex items-center gap-6 mb-8 text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {news.date}
              </div>
              <div className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                {news.category}
              </div>
              <button className="flex items-center text-[#014c85] hover:text-[#0066b3] transition-colors">
                <Share2 className="w-5 h-5 mr-2" />
                分享
              </button>
            </div>

            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {news.images && news.images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">相关图片</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {news.images.map((image, index) => (
                    <div key={index} className="relative aspect-video">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {news.attachments && news.attachments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">附件下载</h3>
                <div className="space-y-2">
                  {news.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      download={file.name}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-5 h-5 mr-2 text-[#014c85]" />
                      <span className="text-[#014c85]">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="bg-[#014c85] py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">联系我们</h3>
              <p className="text-gray-300">地址：珠海市香洲区唐家湾</p>
              <p className="text-gray-300">电话：0756-12345678</p>
              <p className="text-gray-300">邮箱：info@jlu.edu.cn</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">快速链接</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">研究院概况</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">招生信息</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">科研动态</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">关注我们</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">微信公众号</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">新浪微博</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">抖音号</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">友情链接</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">教育部</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">吉林大学</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">珠海市教育局</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 吉林大学珠海研究院 版权所有</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsDetailPage;