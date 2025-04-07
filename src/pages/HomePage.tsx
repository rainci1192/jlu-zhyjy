import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import NewsSection from '../components/NewsSection';
import NotificationsAndEvents from '../components/NotificationsAndEvents';
import ResearchPlatform from '../components/ResearchPlatform';
import TalentTraining from '../components/TalentTraining';
import CampusScenery from '../components/CampusScenery';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#014c85] to-[#0066b3]">
      <Header />
      <div className="pt-[132px]">
        <main>
          <Carousel />
          <div className="bg-white">
            <NewsSection />
            <NotificationsAndEvents />
            <ResearchPlatform />
            <TalentTraining />
            <CampusScenery />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;