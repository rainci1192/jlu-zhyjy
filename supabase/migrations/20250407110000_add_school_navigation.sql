/*
  # Add school overview navigation item

  1. Changes
    - Add 'school' to about section navigation items
    - Update display order of other items
*/

-- Add school navigation item
DO $$
DECLARE
  about_id uuid;
BEGIN
  -- Get the about section ID
  SELECT id INTO about_id FROM navigation_items WHERE title = '研究院介绍' LIMIT 1;
  
  -- Check if the 'school' item already exists
  IF NOT EXISTS (SELECT 1 FROM navigation_items WHERE title = '学校概况' AND parent_id = about_id) THEN
    -- Insert school item with display_order 0
    INSERT INTO navigation_items (
      title,
      link,
      has_submenu,
      parent_id,
      display_order,
      icon
    ) VALUES (
      '学校概况',
      '/about/school',
      false,
      about_id,
      0,
      null
    );
    
    -- Update display order for other items
    UPDATE navigation_items 
    SET display_order = display_order + 1
    WHERE parent_id = about_id 
    AND title != '学校概况';
  END IF;
END $$; 