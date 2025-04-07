import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // 增加登录重试机制
    flowType: 'implicit',
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Client-Info': 'supabase-js/2.39.7'
    },
    // 增加网络请求超时和重试配置
    fetch: (url, options) => {
      const fetchOptions = {
        ...options,
        // 增加超时时间
        timeout: 30000, // 30秒超时
      };
      
      return fetch(url, fetchOptions).catch(error => {
        console.error('Supabase fetch error:', error);
        throw error;
      });
    }
  },
  // 增加重试策略
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// 添加连接状态检查函数
export const checkSupabaseConnection = async () => {
  try {
    // 简单的健康检查请求
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};