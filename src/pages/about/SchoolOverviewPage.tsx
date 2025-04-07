import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AboutPage from '../AboutPage';

/**
 * 学校概况页面
 * 这个组件主要是为了强制加载学校概况内容
 */
const SchoolOverviewPage: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 确保数据库中有学校概况的内容
    const ensureSchoolContent = async () => {
      try {
        // 检查是否存在学校概况内容
        const { data, error } = await supabase
          .from('about_content')
          .select('id')
          .eq('category', '学校概况')
          .single();

        if (error || !data) {
          console.log('学校概况内容不存在，创建默认内容');
          
          // 添加默认的学校概况内容
          await supabase.from('about_content').insert([{
            title: '学校概况',
            content: '<h2>吉林大学学校概况</h2><p>吉林大学是教育部直属的全国重点综合性大学，坐落在吉林省长春市，是国家"211工程"和"985工程"重点建设的高水平研究型大学。</p><p>学校拥有高水平的师资队伍和优质的教学资源，致力于培养具有国际视野和创新能力的高素质人才。</p>',
            category: '学校概况',
            published: true
          }]);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('确保学校概况内容时出错:', error);
        setIsReady(true);
      }
    };

    ensureSchoolContent();
  }, []);

  if (!isReady) {
    return <div>加载中...</div>;
  }

  // 直接使用AboutPage组件，它会根据当前路径加载内容
  return <AboutPage />;
};

export default SchoolOverviewPage; 