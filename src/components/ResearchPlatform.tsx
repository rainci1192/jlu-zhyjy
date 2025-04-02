import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Platform {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  image: string;
  display_order: number;
}

function ResearchPlatform() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (platforms.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % platforms.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [platforms]);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('research_platforms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || platforms.length === 0) {
    return (
      <section className="py-20 bg-[#ffffff]">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-12"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#ffffff]">
      <div className="container mx-auto px-4">
        <div className="section-title-container">
          <div className="section-title-content">
            <h2 className="section-title">科研平台</h2>
            <p className="section-subtitle">Research Platform</p>
          </div>
          <button className="section-arrow-button">
            <ArrowRight className="section-arrow-icon" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#014c85]">
              {platforms[currentSlide].title}
            </h3>
            {platforms[currentSlide].subtitle && (
              <p className="text-gray-600 mb-4">
                {platforms[currentSlide].subtitle}
              </p>
            )}
            <p className="text-gray-700 leading-relaxed">
              {platforms[currentSlide].description}
            </p>
            <div className="flex items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + platforms.length) % platforms.length)}
                className="w-10 h-10 rounded-full border-2 border-[#014c85] flex items-center justify-center hover:bg-[#014c85] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % platforms.length)}
                className="w-10 h-10 rounded-full border-2 border-[#014c85] flex items-center justify-center hover:bg-[#014c85] hover:text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="text-[#014c85]">
                <span className="text-xl font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
                <span className="mx-2">/</span>
                <span>{String(platforms.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] overflow-hidden rounded-lg">
            <img
              src={platforms[currentSlide].image}
              alt={platforms[currentSlide].title}
              className="w-full h-full object-cover transform transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResearchPlatform;