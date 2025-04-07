import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, School, Globe2, Handshake, ArrowRight } from 'lucide-react';

const TalentTraining = () => {
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
    <section className="py-20 bg-[#fbfbf8]">
      <div className="container mx-auto px-4">
        <div className="section-title-container">
          <div className="section-title-content">
            <h2 className="section-title">人才培养</h2>
            <p className="section-subtitle">Talent Development</p>
          </div>
          <Link to="/talent" className="section-arrow-button group">
            <ArrowRight className="section-arrow-icon group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  {program.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#014c85]">{program.title}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">{program.description}</p>
                <div className="space-y-2">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center text-[#014c85]">
                      <span className="w-1.5 h-1.5 bg-[#014c85] rounded-full mr-2"></span>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TalentTraining;