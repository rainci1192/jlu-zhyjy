import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, FlaskRound as Flask, Award, Microscope } from 'lucide-react';

const ResearchPage = () => {
  const sections = [
    {
      title: "研究方向",
      icon: <Flask className="w-12 h-12 text-[#014c85]" />,
      description: "重点开展人工智能、新能源、集成电路等领域的前沿研究。",
      link: "/research/areas"
    },
    {
      title: "科研成果",
      icon: <Award className="w-12 h-12 text-[#014c85]" />,
      description: "在国际顶级期刊发表论文数百篇，获得国家级科技奖励多项。",
      link: "/research/achievements"
    },
    {
      title: "实验室",
      icon: <Microscope className="w-12 h-12 text-[#014c85]" />,
      description: "建有多个国家级重点实验室，为科研创新提供强大支撑。",
      link: "/research/labs"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-[#014c85] hover:text-[#0066b3] transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回首页
          </Link>
        </div>

        <div className="section-title-container">
          <h2 className="section-title">科学研究</h2>
          <p className="section-subtitle">Research</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.link}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#014c85]">{section.title}</h3>
                <p className="text-gray-600 text-lg">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;