/*
  # Add school overview content

  1. Changes
    - Add school overview content to about_content table
*/

-- Insert school overview content if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM about_content WHERE category = '学校概况') THEN
    INSERT INTO about_content (
      id,
      title,
      content,
      category,
      published,
      created_at,
      created_by
    ) VALUES (
      gen_random_uuid(),
      '学校概况',
      '<h2>吉林大学学校概况</h2>
      <p>吉林大学是教育部直属的全国重点综合性大学，坐落在吉林省长春市，是国家"211工程"和"985工程"重点建设的高水平研究型大学，是国家首批"双一流"建设高校。</p>
      <p>吉林大学的前身是1946年成立的东北行政学院，经过多次调整和合并，于2000年6月12日由原吉林大学、吉林工业大学、白求恩医科大学、长春科技大学、长春邮电学院合并组建而成。2004年8月29日，原中国人民解放军军需大学并入。</p>
      <p>吉林大学学科门类齐全，涵盖哲学、经济学、法学、教育学、文学、历史学、理学、工学、农学、医学、军事学、管理学、艺术学等13个学科门类。拥有本科专业124个、一级学科博士学位授权点50个、博士后流动站39个，有国家重点学科17个、国家重点(培育)学科6个。</p>
      <p>吉林大学拥有一支高水平的师资队伍，现有专任教师近7000人，其中院士33人，国家级高层次人才近300人。</p>
      <p>吉林大学面向全国招生，现有全日制在校生近70000人，其中本科生近40000人，硕士研究生近20000人，博士研究生近10000人，国际学生近2000人。</p>
      <p>吉林大学坚持开放办学，积极开展国际交流与合作，已与世界上50多个国家和地区的近200所高等院校和科研机构建立了合作关系。</p>
      <p>珠海研究院是吉林大学在粤港澳大湾区设立的重要科研和人才培养基地，将面向国家和区域重大需求，充分发挥吉林大学的学科优势，为珠海市和粤港澳大湾区的经济社会发展贡献力量。</p>',
      '学校概况',
      true,
      now(),
      (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
    );
  END IF;
END $$; 