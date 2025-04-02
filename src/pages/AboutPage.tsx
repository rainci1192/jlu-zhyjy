import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Building2, Users, History } from 'lucide-react';

const AboutPage = () => {
  const sections = [
    {
      title: "机构设置",
      icon: <Building2 className="w-12 h-12 text-[#014c85]" />,
      description: "研究院下设教学部、科研部、行政部等多个职能部门，形成了完善的管理体系。",
      link: "/about/organization"
    },
    {
      title: "师资队伍",
      icon: <Users className="w-12 h-12 text-[#014c85]" />,
      description: "拥有一支由院士、长江学者、国家杰青等组成的高水平师资队伍。",
      link: "/about/faculty"
    },
    {
      title: "发展历程",
      icon: <History className="w-12 h-12 text-[#014c85]" />,
      description: "自成立以来，研究院不断发展壮大，在人才培养和科研创新方面取得显著成就。",
      link: "/about/history"
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
          <h2 className="section-title">研究院介绍</h2>
          <p className="section-subtitle">About Us</p>
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

export default AboutPage;