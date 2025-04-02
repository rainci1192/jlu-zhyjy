import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SceneryImage {
  id: string;
  title: string;
  image: string;
  display_order: number;
}

function CampusScenery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sceneryImages, setSceneryImages] = useState<SceneryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSceneryImages();
  }, []);

  useEffect(() => {
    if (isPaused || sceneryImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (sceneryImages.length - 2));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, sceneryImages]);

  const fetchSceneryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('campus_scenery')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSceneryImages(data || []);
    } catch (error) {
      console.error('Error fetching scenery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + (sceneryImages.length - 2)) % (sceneryImages.length - 2));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % (sceneryImages.length - 2));
  };

  if (loading || sceneryImages.length === 0) {
    return (
      <section className="py-20 bg-[#fbfbf8]">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-12"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#fbfbf8]">
      <div className="container mx-auto px-4">
        <div className="section-title-container">
          <div className="section-title-content">
            <h2 className="section-title">园区风光</h2>
            <p className="section-subtitle">Campus Scenery</p>
          </div>
          <button className="section-arrow-button">
            <ArrowRight className="section-arrow-icon" />
          </button>
        </div>
        
        <div 
          className="relative overflow-hidden rounded-lg" 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#014c85]" />
          </button>
          
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((offset) => {
              const index = (currentIndex + offset) % sceneryImages.length;
              const image = sceneryImages[index];
              return (
                <div
                  key={`${image.title}-${index}`}
                  className="relative aspect-video group overflow-hidden rounded-lg"
                >
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">{image.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#014c85]" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: sceneryImages.length - 2 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#014c85]' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CampusScenery;