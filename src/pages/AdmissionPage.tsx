import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, GraduationCap, BookOpen, Users } from 'lucide-react';

const AdmissionPage = () => {
  const admissionInfo = [
    {
      title: "本科生招生",
      description: "面向全国招收优秀高中毕业生，培养具有创新能力和国际视野的高素质人才。",
      requirements: ["统招分数线", "自主招生", "高校专项计划"],
      deadline: "2024年6月30日"
    },
    {
      title: "研究生招生",
      description: "招收学术型硕士、专业型硕士研究生，开展高水平科研训练。",
      requirements: ["考试科目", "报考条件", "奖学金政策"],
      deadline: "2024年12月25日"
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
          <h2 className="section-title">招生信息</h2>
          <p className="section-subtitle">Admission</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {admissionInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#014c85] mb-4">{info.title}</h3>
              <p className="text-gray-600 text-lg mb-6">{info.description}</p>
              
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-[#014c85]">招生要求</h4>
                <ul className="list-disc list-inside space-y-2">
                  {info.requirements.map((req, idx) => (
                    <li key={idx} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <p className="text-[#014c85]">
                  <span className="font-semibold">报名截止：</span>
                  {info.deadline}
                </p>
              </div>
              
              <button className="mt-8 bg-[#014c85] text-white px-6 py-3 rounded-full hover:bg-[#0066b3] transition-colors">
                查看详情
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmissionPage;