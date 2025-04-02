INSERT INTO news (
  id,
  title,
  content,
  category,
  images,
  published,
  published_at,
  created_at,
  created_by
) VALUES 
(
  gen_random_uuid(),
  '国家卓越工程师学院举行2024年度"宁波未来之星"、"苑山湖"奖学金评审会',
  '为进一步推进国家卓越工程师学院人才培养工作，激励学生勤奋学习、积极进取，3月15日上午，国家卓越工程师学院在工程训练中心第一会议室举行2024年度"宁波未来之星"、"苑山湖"奖学金评审会。',
  '学院新闻',
  '[{"url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920", "name": "scholarship"}]'::jsonb,
  true,
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
),
(
  gen_random_uuid(),
  '国家卓越工程师学院组织专项师生赴中交流深开展交流',
  '为深入推进产教融合、校企合作，加强学生工程实践能力培养，国家卓越工程师学院组织专项师生赴中交流深开展交流访问，深入了解企业需求，推进校企合作项目落地。',
  '学院新闻',
  '[{"url": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1920", "name": "exchange"}]'::jsonb,
  true,
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
),
(
  gen_random_uuid(),
  '国家卓越工程师学院接待中国电子集团来访并举行校企联培座谈会',
  '3月12日上午，中国电子集团人力资源部一行来访国家卓越工程师学院，双方就深化校企合作、推进人才联合培养等方面进行深入交流。',
  '合作交流',
  '[{"url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920", "name": "meeting"}]'::jsonb,
  true,
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
),
(
  gen_random_uuid(),
  '国家卓越工程师学院2024级卓工班级积极开展主题班会',
  '为加强班级建设，增进同学间交流，提升班级凝聚力，国家卓越工程师学院2024级卓工班级开展了以"追求卓越，砥砺前行"为主题的班会活动。',
  '学生活动',
  '[{"url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920", "name": "class-meeting"}]'::jsonb,
  true,
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@jlu.edu.cn' LIMIT 1)
);