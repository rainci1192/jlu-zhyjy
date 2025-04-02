import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  image: string;
  summary: string;
  category: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    title: '国家卓越工程师学院举行2024年度"宁波未来之星"、"苑山湖"奖学金评审会',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920',
    summary: '为进一步推进国家卓越工程师学院人才培养工作，激励学生勤奋学习、积极进取，3月15日上午，国家卓越工程师学院在工程训练中心第一会议室举行2024年度"宁波未来之星"、"苑山湖"奖学金评审会。',
    category: '学院新闻'
  },
  {
    id: '2',
    title: '国家卓越工程师学院组织专项师生赴中交流深开展交流',
    date: '2024-03-14',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1920',
    summary: '为深入推进产教融合、校企合作，加强学生工程实践能力培养，国家卓越工程师学院组织专项师生赴中交流深开展交流访问，深入了解企业需求，推进校企合作项目落地。',
    category: '学院新闻'
  },
  {
    id: '3',
    title: '国家卓越工程师学院接待中国电子集团来访并举行校企联培座谈会',
    date: '2024-03-12',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920',
    summary: '3月12日上午，中国电子集团人力资源部一行来访国家卓越工程师学院，双方就深化校企合作、推进人才联合培养等方面进行深入交流。',
    category: '合作交流'
  },
  {
    id: '4',
    title: '国家卓越工程师学院2024级卓工班级积极开展主题班会',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920',
    summary: '为加强班级建设，增进同学间交流，提升班级凝聚力，国家卓越工程师学院2024级卓工班级开展了以"追求卓越，砥砺前行"为主题的班会活动。',
    category: '学生活动'
  }
];

const categories = ['全部', '学院新闻', '合作交流', '学生活动'];

function NewsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('全部');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const filteredNews = selectedCategory === '全部'
    ? newsData
    : newsData.filter(news => news.category === selectedCategory);

  const pageCount = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-300 hover:text-blue-400 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回首页
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">新闻动态</h1>
        <p className="text-xl text-gray-300 mb-8">News Updates</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {currentNews.map(news => (
            <div
              key={news.id}
              className="bg-gray-800/50 rounded-lg overflow-hidden group hover:bg-gray-800/70 transition-colors"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {news.category}
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 mb-2">{news.date}</p>
                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                  {news.title}
                </h3>
                <p className="text-gray-300 line-clamp-3">{news.summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`w-10 h-10 rounded-full ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } transition-colors`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsPage;