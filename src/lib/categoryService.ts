import { supabase } from './supabase';
import { message } from 'antd';

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class CategoryService {
  /**
   * 获取所有分类列表
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) {
        message.error(`获取分类列表失败：${error.message}`);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('获取分类列表出错:', error);
      message.error('获取分类列表失败，请稍后重试');
      return [];
    }
  }

  /**
   * 根据父级ID获取子分类
   */
  static async getCategoriesByParent(parentId: number | null): Promise<Category[]> {
    try {
      const query = supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (parentId === null) {
        query.is('parent_id', null);
      } else {
        query.eq('parent_id', parentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        message.error(`获取子分类失败：${error.message}`);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('获取子分类出错:', error);
      message.error('获取子分类失败，请稍后重试');
      return [];
    }
  }

  /**
   * 获取分类树形结构
   */
  static async getCategoryTree(): Promise<Category[]> {
    const allCategories = await this.getAllCategories();
    
    const buildTree = (parentId: number | null): Category[] => {
      return allCategories
        .filter(c => c.parent_id === parentId)
        .map(category => ({
          ...category,
          children: buildTree(category.id)
        }));
    };
    
    return buildTree(null);
  }

  /**
   * 获取分类选项 - 用于下拉菜单
   */
  static async getCategoryOptions(includeInactive = false): Promise<{label: string, value: number}[]> {
    const categories = await this.getAllCategories();
    return categories
      .filter(c => includeInactive || c.is_active)
      .map(c => ({
        label: c.name,
        value: c.id
      }));
  }

  /**
   * 根据代码获取分类
   */
  static async getCategoryByCode(code: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) {
        console.error(`获取分类(${code})失败:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`获取分类(${code})出错:`, error);
      return null;
    }
  }
} 