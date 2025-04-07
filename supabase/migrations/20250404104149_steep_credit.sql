/*
  # Update navigation items and about content

  1. Changes
    - Update navigation items with correct links
    - Add initial about content
    
  2. Content
    - Add navigation items for About section
    - Add content for each section
*/

-- Update navigation items
DO $$
DECLARE
  about_id uuid;
BEGIN
  -- Delete existing about section items
  DELETE FROM navigation_items WHERE title = '研究院介绍' OR parent_id IN (
    SELECT id FROM navigation_items WHERE title = '研究院介绍'
  );

  -- Insert main About menu item
  INSERT INTO navigation_items (
    id,
    title,
    link,
    has_submenu,
    display_order,
    icon
  ) VALUES (
    gen_random_uuid(),
    '研究院介绍',
    '/about',
    true,
    1,
    null
  )
  RETURNING id INTO about_id;

  -- Insert sub-menu items
  INSERT INTO navigation_items (
    title,
    link,
    has_submenu,
    parent_id,
    display_order,
    icon
  ) VALUES 
  (
    '研究院概况',
    '/about/overview',
    false,
    about_id,
    0,
    null
  ),
  (
    '机构设置',
    '/about/organization',
    false,
    about_id,
    1,
    null
  ),
  (
    '发展历程',
    '/about/history',
    false,
    about_id,
    2,
    null
  );
END $$;

-- Update about content
DO $$
BEGIN
  -- Delete existing about content
  DELETE FROM about_content;

  -- Insert new about content
  INSERT INTO about_content (
    id,
    title,
    content,
    category,
    published,
    created_at,
    created_by
  ) VALUES 
  (
    gen_random_uuid(),
    '研究院概况',
    '<h2>吉林大学珠海研究院简介</h2>
    <p>吉林大学珠海研究院成立于2022年8月，是吉林大学在粤港澳大湾区设立的科研机构和人才培养基地。研究院立足珠海，面向大湾区，以服务国家战略需求和区域经济社会发展为己任。</p>
    <p>研究院现有5个科技创新平台，1个人文科研机构，分别为无机功能材料国家重点实验室珠海分实验室、超级材料国家重点实验室珠海分实验室、部分子材料研究所、电化学实验室、仿生材料实验室、国家中国特色社会主义研究院珠海分院。</p>
    <p>研究院现有学术带头人1人，"千人计划"专家1人，"青年千人计划"1人，国家杰出青年科学基金获得者1人，国家重点研发计划项目首席科学家1人，珠江学者1人，珠海特聘专家1人。从2011年至今招收各类研究生120项，累计科研经费突破2000万元，发表高水平论文353篇（SCI 345篇），其中影响因子大于10的论文30余篇；专利申请45项，获专利授权14件，获得授权一等奖2项，有全日制博士、硕士213人，取得博士学位350人。</p>
    <p>研究院现有学校产权土地2217亩，其中山地1879亩，建设用地338亩。</p>
    <p>研究院将结合珠海市南产业发展布局，充分发挥吉林大学的学科、人才、科技优势，以科技合作与成果转化为主的创新人才培养为辅，建成以科技创新为引领的高水平科学研究平台和成果转移转化基地，以"硕士-博士"为主线的高水平人才培养中心，打造区域创新高地和人才中心。</p>',
    '研究院概况',
    true,
    now(),
    (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
  ),
  (
    gen_random_uuid(),
    '机构设置',
    '<h2>组织机构</h2>
    <p>研究院下设多个研究所和职能部门，形成了完善的科研管理体系：</p>
    <h3>研究机构</h3>
    <ul>
      <li>无机功能材料国家重点实验室珠海分实验室</li>
      <li>超级材料国家重点实验室珠海分实验室</li>
      <li>部分子材料研究所</li>
      <li>电化学实验室</li>
      <li>仿生材料实验室</li>
      <li>国家中国特色社会主义研究院珠海分院</li>
    </ul>
    <h3>管理部门</h3>
    <ul>
      <li>院长办公室</li>
      <li>科研管理部</li>
      <li>人事管理部</li>
      <li>财务管理部</li>
      <li>学生工作部</li>
      <li>对外合作部</li>
    </ul>',
    '机构设置',
    true,
    now(),
    (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
  ),
  (
    gen_random_uuid(),
    '发展历程',
    '<h2>发展历程</h2>
    <div class="timeline">
      <div class="timeline-item">
        <h3>2022年</h3>
        <ul>
          <li>8月：吉林大学珠海研究院正式成立</li>
          <li>9月：首批研究生入学</li>
          <li>12月：无机功能材料国家重点实验室珠海分实验室获批建设</li>
        </ul>
      </div>
      <div class="timeline-item">
        <h3>2023年</h3>
        <ul>
          <li>3月：超级材料国家重点实验室珠海分实验室建成</li>
          <li>6月：与珠海市政府签署战略合作协议</li>
          <li>9月：获批多项国家重点研发计划项目</li>
          <li>12月：完成首批科技成果转化项目</li>
        </ul>
      </div>
      <div class="timeline-item">
        <h3>2024年</h3>
        <ul>
          <li>1月：新增3个省部级重点实验室</li>
          <li>3月：建成产学研示范基地</li>
        </ul>
      </div>
    </div>',
    '发展历程',
    true,
    now(),
    (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
  );
END $$;