/*
  # Create categories management tables
  
  1. New tables:
    - `category_modules`: 存储可用的内容模块信息
    - `categories`: 存储各模块的分类信息，与模块关联
  
  2. Features:
    - 支持多个内容模块的分类管理
    - 为每个分类提供显示顺序、状态控制
    - 为分类提供图标和描述（可选）
    
  3. Security:
    - 启用行级安全
    - 管理员可完全访问
    - 普通用户可读取
*/

-- 创建模块表
CREATE TABLE IF NOT EXISTS category_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text NOT NULL,
  module_id uuid NOT NULL REFERENCES category_modules(id) ON DELETE CASCADE,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, module_id)
);

-- 添加索引
CREATE INDEX IF NOT EXISTS categories_module_id_idx ON categories(module_id);
CREATE INDEX IF NOT EXISTS categories_is_active_idx ON categories(is_active);

-- 启用行级安全策略
ALTER TABLE category_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 添加安全策略
DO $$
BEGIN
  -- 允许管理员完全访问模块表
  CREATE POLICY "管理员模块管理权限"
    ON category_modules
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  
  -- 允许所有用户读取模块信息
  CREATE POLICY "所有人可读取模块"
    ON category_modules
    FOR SELECT
    TO anon
    USING (true);
  
  -- 允许管理员完全访问分类表
  CREATE POLICY "管理员分类管理权限"
    ON categories
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  
  -- 允许所有用户读取分类信息
  CREATE POLICY "所有人可读取分类"
    ON categories
    FOR SELECT
    TO anon
    USING (true);
END $$;

-- 插入默认模块数据
INSERT INTO category_modules (name, display_name, description) 
VALUES 
  ('news', '新闻管理', '新闻资讯的分类管理'),
  ('admissions', '招生信息', '招生相关信息的分类管理'),
  ('about', '研究院介绍', '研究院介绍内容的分类管理'),
  ('research', '科研平台', '科研平台相关的分类管理'),
  ('notifications', '通知公告', '通知公告的分类管理')
ON CONFLICT (name) DO NOTHING;

-- 插入默认分类数据
DO $$
DECLARE
  news_id uuid;
  admissions_id uuid;
  about_id uuid;
  research_id uuid;
  notification_id uuid;
BEGIN
  -- 获取模块ID
  SELECT id INTO news_id FROM category_modules WHERE name = 'news';
  SELECT id INTO admissions_id FROM category_modules WHERE name = 'admissions';
  SELECT id INTO about_id FROM category_modules WHERE name = 'about';
  SELECT id INTO research_id FROM category_modules WHERE name = 'research';
  SELECT id INTO notification_id FROM category_modules WHERE name = 'notifications';
  
  -- 新闻分类
  INSERT INTO categories (name, display_name, module_id, description, display_order)
  VALUES 
    ('college_news', '学院新闻', news_id, '学院重要新闻和活动', 0),
    ('academic_activities', '学术活动', news_id, '学术讲座、研讨会等学术活动', 1),
    ('cooperation', '合作交流', news_id, '校企合作、国际交流等相关新闻', 2),
    ('student_activities', '学生活动', news_id, '学生组织的各类活动', 3)
  ON CONFLICT (name, module_id) DO NOTHING;
  
  -- 招生信息分类
  INSERT INTO categories (name, display_name, module_id, description, display_order)
  VALUES 
    ('undergraduate', '本科生招生', admissions_id, '本科生招生相关信息', 0),
    ('graduate', '研究生招生', admissions_id, '研究生招生相关信息', 1),
    ('international', '国际学生招生', admissions_id, '国际学生招生信息', 2),
    ('others', '其他', admissions_id, '其他招生相关信息', 3)
  ON CONFLICT (name, module_id) DO NOTHING;
  
  -- 研究院介绍分类
  INSERT INTO categories (name, display_name, module_id, description, display_order)
  VALUES 
    ('overview', '研究院概况', about_id, '研究院基本情况介绍', 0),
    ('organization', '机构设置', about_id, '研究院组织机构设置', 1),
    ('history', '发展历程', about_id, '研究院发展历史与大事记', 2)
  ON CONFLICT (name, module_id) DO NOTHING;
  
  -- 科研平台分类
  INSERT INTO categories (name, display_name, module_id, description, display_order)
  VALUES 
    ('laboratories', '重点实验室', research_id, '各类重点实验室介绍', 0),
    ('research_centers', '研究中心', research_id, '研究中心介绍', 1),
    ('platforms', '科研平台', research_id, '其他科研平台介绍', 2)
  ON CONFLICT (name, module_id) DO NOTHING;
  
  -- 通知公告分类
  INSERT INTO categories (name, display_name, module_id, description, display_order)
  VALUES 
    ('announcement', '公告', notification_id, '重要公告', 0),
    ('notice', '通知', notification_id, '一般通知', 1),
    ('event', '活动通知', notification_id, '活动相关通知', 2)
  ON CONFLICT (name, module_id) DO NOTHING;
END $$;
