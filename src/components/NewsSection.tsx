import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  images: Array<{
    url: string;
    name: string;
  }>;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

function NewsSection() {
  const [carouselNews, setCarouselNews] = useState<NewsItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (carouselNews.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselNews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselNews]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5);

      if (newsError) throw newsError;

      if (data && data.length > 0) {
        const processedData = data.map(item => ({
          ...item,
          images: Array.isArray(item.images) ? item.images : []
        }));
        
        setCarouselNews(processedData.slice(0, 3));
        setNewsList(processedData);
      } else {
        setCarouselNews([]);
        setNewsList([]);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('获取新闻数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Preload images for better performance
  useEffect(() => {
    carouselNews.forEach(news => {
      if (news.images?.[0]?.url) {
        const img = new Image();
        img.src = getImageUrl(news);
      }
    });
  }, [carouselNews]);

  const getImageUrl = (news: NewsItem) => {
    if (news.images && news.images.length > 0 && news.images[0].url) {
      const url = news.images[0].url;
      if (url.includes('unsplash.com')) {
        return `${url}?auto=format&w=800&q=75&fit=crop`;
      }
      return url;
    }
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&w=800&q=75&fit=crop';
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselNews.length) % carouselNews.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselNews.length);
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#fbfbf8]">
        <div className="container mx-auto px-4">
          <div className="section-title-container">
            <div className="section-title-content">
              <h2 className="section-title">新闻动态</h2>
              <p className="section-subtitle">News updates</p>
            </div>
            <Link to="/news" className="section-arrow-button group">
              <ArrowRight className="section-arrow-icon group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              <div className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="md:col-span-5 space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-[#fbfbf8]">
        <div className="container mx-auto px-4">
          <div className="section-title-container">
            <div className="section-title-content">
              <h2 className="section-title">新闻动态</h2>
              <p className="section-subtitle">News updates</p>
            </div>
            <Link to="/news" className="section-arrow-button group">
              <ArrowRight className="section-arrow-icon group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchNews}
              className="px-4 py-2 bg-[#014c85] text-white rounded-lg hover:bg-[#0066b3] transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (carouselNews.length === 0) {
    return (
      <section className="py-20 bg-[#fbfbf8]">
        <div className="container mx-auto px-4">
          <div className="section-title-container">
            <div className="section-title-content">
              <h2 className="section-title">新闻动态</h2>
              <p className="section-subtitle">News updates</p>
            </div>
            <Link to="/news" className="section-arrow-button group">
              <ArrowRight className="section-arrow-icon group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="text-center text-gray-600">暂无新闻</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#fbfbf8]">
      <div className="container mx-auto px-4">
        <div className="section-title-container">
          <div className="section-title-content">
            <h2 className="section-title">新闻动态</h2>
            <p className="section-subtitle">News updates</p>
          </div>
          <Link to="/news" className="section-arrow-button group">
            <ArrowRight className="section-arrow-icon group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7">
            <div className="relative">
              {carouselNews.map((news, index) => (
                <Link
                  key={news.id}
                  to={`/news/${news.id}`}
                  className={`block transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <div className="relative overflow-hidden rounded-lg aspect-video group">
                    <img 
                      src={getImageUrl(news)}
                      alt={news.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchpriority={index === 0 ? "high" : "auto"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4 mb-3">
                        <p className="text-gray-300 text-xl">
                          {dayjs(news.published_at || news.created_at).format('YYYY-MM-DD')}
                        </p>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                          {news.category}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                        {news.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Carousel Controls */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {carouselNews.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-6">
            {newsList.map((news) => (
              <Link 
                key={news.id}
                to={`/news/${news.id}`}
                className="group cursor-pointer block transform transition-all duration-300 hover:-translate-x-2"
              >
                <div className="border-l-4 border-transparent group-hover:border-[#014c85] pl-4 transition-colors">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-gray-400 text-xl">
                      {dayjs(news.published_at || news.created_at).format('YYYY-MM-DD')}
                    </p>
                    <span className="px-3 py-1 bg-gray-100 text-[#014c85] rounded-full text-sm">
                      {news.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#014c85] group-hover:text-[#0066b3] transition-colors line-clamp-2 text-xl">
                    {news.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsSection;