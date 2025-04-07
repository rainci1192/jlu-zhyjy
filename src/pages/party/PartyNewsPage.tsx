import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import PartyPage from '../PartyPage';

/**
 * 党建动态页面
 * 这个组件主要是为了强制加载党建动态内容
 */
const PartyNewsPage: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 确保数据库中有党建动态的内容
    const ensurePartyNewsContent = async () => {
      try {
        // 检查是否存在党建动态内容
        const { data, error } = await supabase
          .from('party_content')
          .select('id')
          .eq('category', '党建动态')
          .single();

        if (error || !data) {
          console.log('党建动态内容不存在，创建默认内容');
          
          // 添加默认的党建动态内容
          await supabase.from('party_content').insert([{
            title: '党建动态',
            content: '<h2>中国科协创新战略研究院党建动态</h2><p>中国科协创新战略研究院党委坚持以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，认真落实新时代党的建设总要求，把政治建设摆在首位，深入推进全面从严治党，持续提升组织力和战斗力。</p><p>研究院党委定期组织开展党员干部学习教育、党性锻炼、组织生活等活动，推动学习贯彻习近平新时代中国特色社会主义思想走深走实。</p><h3>近期活动</h3><ul><li>开展"学习贯彻习近平新时代中国特色社会主义思想主题教育"</li><li>举办党委理论学习中心组学习扩大会议</li><li>组织党员参观中国共产党历史展览馆</li></ul>',
            category: '党建动态',
            published: true
          }]);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('确保党建动态内容时出错:', error);
        setIsReady(true);
      }
    };

    ensurePartyNewsContent();
  }, []);

  if (!isReady) {
    return <div>加载中...</div>;
  }

  // 直接使用PartyPage组件，它会根据当前路径加载内容
  return <PartyPage />;
};

export default PartyNewsPage; 