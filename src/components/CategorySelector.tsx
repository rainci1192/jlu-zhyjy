import React, { useEffect, useState } from 'react';
import { Select, SelectProps, Spin, message } from 'antd';
import { supabase } from '../lib/supabase';

interface CategorySelectorProps extends Omit<SelectProps, 'options'> {
  /** 是否包含非激活分类 */
  includeInactive?: boolean;
  /** 加载后自动触发onChange */
  triggerChangeOnLoad?: boolean;
  /** 预先选择的分类名称 */
  defaultCategoryName?: string;
  /** 模块名称 */
  moduleName?: string;
  /** 表单ID，避免警告 */
  formId?: string;
  /** 返回值类型 - id(默认) 或 name */
  valueType?: 'id' | 'display_name';
}

interface CategoryOption {
  label: string;
  value: string;
  /** 原始分类数据，用于保存额外信息如名称 */
  raw?: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  includeInactive = false,
  triggerChangeOnLoad = false,
  defaultCategoryName,
  moduleName = 'news',
  formId = 'categoryForm',
  valueType = 'id',
  onChange,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // 先获取模块ID
        const { data: moduleData, error: moduleError } = await supabase
          .from('category_modules')
          .select('id')
          .eq('name', moduleName)
          .single();
        
        if (moduleError) {
          console.error('获取模块失败:', moduleError);
          setError(`获取模块数据失败: ${moduleError.message}`);
          setLoading(false);
          return;
        }

        // 获取该模块下的分类
        const { data: categories, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, display_name')
          .eq('module_id', moduleData.id)
          .eq(includeInactive ? '' : 'is_active', includeInactive ? '' : true)
          .order('display_order', { ascending: true });
        
        if (categoryError) {
          console.error('获取分类失败:', categoryError);
          setError(`获取分类数据失败: ${categoryError.message}`);
          setLoading(false);
          return;
        }

        const categoryOptions = (categories || []).map(category => ({
          label: category.display_name,
          value: valueType === 'id' ? category.id : category.display_name,
          raw: category
        }));

        setOptions(categoryOptions);

        // 如果有默认分类名称，则查找对应的ID并设置
        if (defaultCategoryName && categories && categories.length > 0) {
          const defaultCategory = categories.find(c => c.name === defaultCategoryName);
          if (defaultCategory) {
            const value = valueType === 'id' ? defaultCategory.id : defaultCategory.display_name;
            setSelectedValue(value);
            if (triggerChangeOnLoad && onChange) {
              onChange(value, { 
                label: defaultCategory.display_name, 
                value: value,
                raw: defaultCategory
              });
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        console.error('加载分类选项出错:', errorMessage);
        setError(`加载分类选项失败: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [defaultCategoryName, includeInactive, triggerChangeOnLoad, onChange, moduleName, valueType]);

  const handleChange = (value: string, option: CategoryOption | CategoryOption[] | undefined) => {
    setSelectedValue(value);
    if (onChange) {
      onChange(value, option);
    }
  };

  // 显示错误消息
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  return (
    <Select
      placeholder="请选择分类"
      loading={loading}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      status={error ? "error" : undefined}
      notFoundContent={loading ? <Spin size="small" /> : error ? "加载失败" : "暂无数据"}
      id={`${formId}_category_selector`}
      {...props}
    />
  );
};

export default CategorySelector; 