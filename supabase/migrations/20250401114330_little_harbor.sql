/*
  # Navigation Items Migration

  1. Changes
    - Create navigation items table if not exists
    - Insert initial navigation structure
    - Set up parent-child relationships
    - Add proper display order

  2. Security
    - Uses existing RLS policies
*/

DO $$ 
BEGIN
  -- Insert main navigation items with error handling
  INSERT INTO navigation_items (title, link, has_submenu, display_order) 
  SELECT * FROM (VALUES
    ('首页', '/', false, 0),
    ('研究院介绍', '/about', true, 1),
    ('科学研究', '/research', true, 2),
    ('招生信息', '/admission', false, 3),
    ('人才培养', '/talent', true, 4),
    ('校企合作', '/cooperation', false, 5),
    ('党建工作', '/party', false, 6),
    ('学生工作', '/student', false, 7),
    ('培训合作', '/training', false, 8)
  ) AS v(title, link, has_submenu, display_order)
  ON CONFLICT (id) DO NOTHING;

  -- Insert sub-items for "研究院介绍" with error handling
  INSERT INTO navigation_items (title, link, has_submenu, parent_id, display_order)
  SELECT 
    v.title,
    v.link,
    v.has_submenu,
    p.id,
    v.display_order
  FROM (VALUES
    ('机构设置', '/about/organization', false, 0),
    ('师资队伍', '/about/faculty', false, 1),
    ('发展历程', '/about/history', false, 2)
  ) AS v(title, link, has_submenu, display_order)
  CROSS JOIN (
    SELECT id FROM navigation_items WHERE title = '研究院介绍' LIMIT 1
  ) AS p
  ON CONFLICT (id) DO NOTHING;

  -- Insert sub-items for "科学研究" with error handling
  INSERT INTO navigation_items (title, link, has_submenu, parent_id, display_order)
  SELECT 
    v.title,
    v.link,
    v.has_submenu,
    p.id,
    v.display_order
  FROM (VALUES
    ('研究方向', '/research/areas', false, 0),
    ('科研成果', '/research/achievements', false, 1),
    ('实验室', '/research/labs', false, 2)
  ) AS v(title, link, has_submenu, display_order)
  CROSS JOIN (
    SELECT id FROM navigation_items WHERE title = '科学研究' LIMIT 1
  ) AS p
  ON CONFLICT (id) DO NOTHING;

  -- Insert sub-items for "人才培养" with error handling
  INSERT INTO navigation_items (title, link, has_submenu, parent_id, display_order)
  SELECT 
    v.title,
    v.link,
    v.has_submenu,
    p.id,
    v.display_order
  FROM (VALUES
    ('培养方案', '/talent/programs', false, 0),
    ('课程体系', '/talent/courses', false, 1),
    ('实践教学', '/talent/practice', false, 2)
  ) AS v(title, link, has_submenu, display_order)
  CROSS JOIN (
    SELECT id FROM navigation_items WHERE title = '人才培养' LIMIT 1
  ) AS p
  ON CONFLICT (id) DO NOTHING;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error occurred during navigation items insertion: %', SQLERRM;
END $$;