import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, GraduationCap, School, Globe2, Handshake } from 'lucide-react';

const TalentPage = () => {
  const programs = [
    {
      title: "卓越工程师培养",
      icon: <GraduationCap className="w-12 h-12 text-[#014c85]" />,
      description: "培养具有创新能力和国际视野的高素质工程技术人才，实施个性化培养方案。",
      features: ["校企联合培养", "创新实践", "国际交流"]
    },
    {
      title: "硕士联合培养",
      icon: <School className="w-12 h-12 text-[#014c85]" />,
      description: "与知名企业合作，打造产学研一体化培养模式，培养应用型高级人才。",
      features: ["双导师制", "企业实践", "项目研究"]
    },
    {
      title: "中外合作办学",
      icon: <Globe2 className="w-12 h-12 text-[#014c85]" />,
      description: "引进国际优质教育资源，开展多层次合作交流，培养国际化人才。",
      features: ["国际课程", "语言培训", "海外交流"]
    },
    {
      title: "培训合作",
      icon: <Handshake className="w-12 h-12 text-[#014c85]" />,
      description: "开展专业技能培训，促进产业人才发展，提供终身学习机会。",
      features: ["专业培训", "技能认证", "继续教育"]
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
          <h2 className="section-title">人才培养</h2>
          <p className="section-subtitle">Talent Development</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {programs.map((program, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  {program.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#014c85]">{program.title}</h3>
              </div>
              
              <p className="text-gray-600 text-lg mb-6">{program.description}</p>
              
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-[#014c85]">特色项目</h4>
                <ul className="grid grid-cols-2 gap-4">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-[#014c85] rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="mt-8 bg-[#014c85] text-white px-6 py-3 rounded-full hover:bg-[#0066b3] transition-colors w-full">
                了解更多
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentPage;