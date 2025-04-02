import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  active: boolean;
  show_title: boolean;
  display_order: number;
}

function Carousel() {
  const [slides, setSlides] = useState<CarouselItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides]);

  const fetchCarouselData = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel')
        .select('id, title, subtitle, image, active, show_title, display_order')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Ensure show_title is properly typed as boolean
      const processedData = (data || []).map(slide => ({
        ...slide,
        show_title: Boolean(slide.show_title)
      }));
      
      setSlides(processedData);
    } catch (error) {
      console.error('Error fetching carousel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-screen bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-[#014c85]/70 to-[#014c85]/40" />
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#014c85]/70 to-[#014c85]/40" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {slide.show_title === true && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-5xl md:text-7xl font-bold mb-4 transform translate-y-0 transition-transform duration-700 text-white">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl text-gray-200">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}

export default Carousel;