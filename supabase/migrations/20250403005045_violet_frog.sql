/*
  # Add initial about content

  1. Changes
    - Insert initial content for about sections
    - Set published status to true
    - Add admin user as creator
*/

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
  '<h2>吉林大学珠海研究院简介</h2><p>吉林大学珠海研究院是吉林大学在珠海设立的科研机构，致力于开展高水平科学研究和人才培养。研究院立足珠海，面向粤港澳大湾区，以服务国家战略需求和区域经济社会发展为己任。</p><p>研究院拥有一支高水平的研究团队，包括院士、长江学者、国家杰出青年科学基金获得者等高层次人才。研究方向涵盖人工智能、新材料、生物医药等前沿领域。</p>',
  '研究院概况',
  true,
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
),
(
  gen_random_uuid(),
  '机构设置',
  '<h2>组织架构</h2><p>研究院下设多个研究所和职能部门，形成了完善的科研管理体系：</p><ul><li>人工智能研究所</li><li>新材料研究所</li><li>生物医药研究所</li><li>科研管理部</li><li>行政办公室</li></ul>',
  '机构设置',
  true,
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
),
(
  gen_random_uuid(),
  '发展历程',
  '<h2>发展历程</h2><p>研究院自成立以来，始终秉持"创新引领、服务发展"的理念，在科研创新和人才培养方面取得了显著成就：</p><ul><li>2020年：研究院正式成立</li><li>2021年：首批重点实验室建成</li><li>2022年：获批多项国家级科研项目</li><li>2023年：建成产学研示范基地</li></ul>',
  '发展历程',
  true,
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
);