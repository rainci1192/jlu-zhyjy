/*
  # Create party content table

  1. New Tables
    - `party_content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `published` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `party_content` table
    - Add policies for authenticated users to manage party content
    - Add policy for public users to read published party content
*/

CREATE TABLE IF NOT EXISTS party_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE party_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage party content
CREATE POLICY "Admin users can manage party content"
  ON party_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public users to read published party content
CREATE POLICY "Public users can read published party content"
  ON party_content
  FOR SELECT
  TO public
  USING (published = true);

-- Add default content for party pages
INSERT INTO party_content (title, content, category, published)
VALUES 
  ('党建动态', '<h2>中国科协创新战略研究院党建动态</h2><p>中国科协创新战略研究院党委坚持以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，认真落实新时代党的建设总要求，把政治建设摆在首位，深入推进全面从严治党，持续提升组织力和战斗力。</p><p>研究院党委定期组织开展党员干部学习教育、党性锻炼、组织生活等活动，推动学习贯彻习近平新时代中国特色社会主义思想走深走实。</p><h3>近期活动</h3><ul><li>开展"学习贯彻习近平新时代中国特色社会主义思想主题教育"</li><li>举办党委理论学习中心组学习扩大会议</li><li>组织党员参观中国共产党历史展览馆</li></ul>', '党建动态', true),
  
  ('理论学习', '<h2>理论学习</h2><p>研究院党委高度重视理论学习，把学习贯彻习近平新时代中国特色社会主义思想作为首要政治任务，引导全院党员干部不断增强"四个意识"、坚定"四个自信"、做到"两个维护"。</p><h3>学习内容</h3><ul><li>习近平新时代中国特色社会主义思想</li><li>党的二十大精神</li><li>习近平总书记关于科技创新和科协工作的重要论述</li><li>新发展理念和高质量发展要求</li></ul><h3>学习形式</h3><ul><li>党委理论学习中心组学习</li><li>专题辅导报告</li><li>"三会一课"</li><li>主题党日活动</li></ul>', '理论学习', true),
  
  ('组织建设', '<h2>组织建设</h2><p>研究院党委着力抓好党的组织建设，不断提升基层党组织的创造力、凝聚力和战斗力，充分发挥基层党组织战斗堡垒作用和党员先锋模范作用。</p><h3>组织架构</h3><p>研究院设有党委，下设若干党支部，覆盖各个研究部门和管理部门。</p><h3>工作措施</h3><ul><li>严格落实"三会一课"、组织生活会、民主评议党员等制度</li><li>规范发展党员工作，把政治标准放在首位</li><li>抓好党员教育管理，严格组织纪律</li><li>选优配强党支部班子，提升党务工作能力</li></ul>', '组织建设', true),
  
  ('党史教育', '<h2>党史教育</h2><p>研究院党委持续推进党史学习教育常态化长效化，引导党员干部从党的百年奋斗历程中汲取智慧和力量，赓续红色血脉，传承红色基因。</p><h3>主要内容</h3><ul><li>中国共产党百年奋斗的光辉历程和历史贡献</li><li>中国共产党为什么能、马克思主义为什么行、中国特色社会主义为什么好</li><li>党的优良传统和作风</li><li>革命先辈和英模人物的感人事迹</li></ul><h3>活动形式</h3><ul><li>专题学习讨论</li><li>参观红色教育基地</li><li>观看党史题材影片</li><li>举办党史知识竞赛</li></ul>', '党史教育', true),
  
  ('廉政建设', '<h2>廉政建设</h2><p>研究院党委认真落实全面从严治党主体责任，持之以恒正风肃纪，深入推进党风廉政建设和反腐败工作，营造风清气正的良好政治生态。</p><h3>工作重点</h3><ul><li>加强党员干部廉洁自律意识</li><li>严格执行中央八项规定精神</li><li>强化权力运行监督制约</li><li>深化作风建设</li></ul><h3>具体措施</h3><ul><li>定期开展警示教育</li><li>签订党风廉政建设责任书</li><li>健全完善内部管理制度</li><li>加强对重点领域和关键环节的监督</li></ul>', '廉政建设', true)
WHERE NOT EXISTS (
  SELECT 1 FROM party_content
  WHERE category IN ('党建动态', '理论学习', '组织建设', '党史教育', '廉政建设')
); 