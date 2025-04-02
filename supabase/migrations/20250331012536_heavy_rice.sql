/*
  # Add admin user

  1. Changes
    - Insert initial admin user into auth.users table
    - Set user role as 'admin'
    - Add user to public.users table
*/

-- Create admin user in auth.users
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert into auth.users and return the id
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@jlu.edu.cn',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO user_id;

  -- Only insert into public.users if we have a user_id
  IF user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      role,
      created_at,
      last_login
    ) VALUES (
      user_id,
      'admin@jlu.edu.cn',
      'admin',
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;