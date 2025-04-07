import React from 'react';
import SubPageLayout from '../components/SubPageLayout';

const ResearchPage = () => {
  return (
    <SubPageLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-[#014c85]">科学研究</h1>
        
        <div className="grid gap-6">
          {/* Research News */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#014c85]">科研动态</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${1580000000000 + index}?auto=format&fit=crop&w=800&q=60`}
                      alt="Research"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-[#014c85] mb-2">
                      重要科研项目取得突破性进展
                    </h3>
                    <p className="text-gray-600 mb-4">
                      我院研究团队在新材料领域取得重要突破，相关研究成果发表于国际顶级期刊。
                    </p>
                    <div className="text-gray-500 text-sm">
                      2024-03-21
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Platforms */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#014c85]">科研平台</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200">
                    <img
                      src={`https://images.unsplash.com/photo-${1580000000000 + index + 10}?auto=format&fit=crop&w=800&q=60`}
                      alt="Platform"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#014c85] mb-2">
                      先进材料研究中心
                    </h3>
                    <p className="text-gray-600">
                      专注于新型材料的研发与应用，拥有完善的实验设施和优秀的研究团队。
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Teams */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#014c85]">科研团队</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-[#014c85] mb-4">
                    材料科学研究组
                  </h3>
                  <p className="text-gray-600 mb-4">
                    致力于新型材料的基础研究和应用开发，在国际顶级期刊发表多篇重要论文。
                  </p>
                  <div className="text-[#014c85] font-bold">
                    负责人：张教授
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default ResearchPage;