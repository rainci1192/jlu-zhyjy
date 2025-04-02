import React, { useState, useEffect } from 'react';
import { Tree, Button, Switch, Input, Form, message, Modal, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

interface NavItem {
  key: string;
  title: string;
  children?: NavItem[];
  hasSubMenu: boolean;
  link: string;
  icon?: string;
}

const NavigationSettingsPage = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<NavItem | null>(null);

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedData = formatNavData(data || []);
      setNavItems(formattedData);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNavData = (data: any[]): NavItem[] => {
    const parentItems = data.filter(item => !item.parent_id);
    return parentItems.map(item => ({
      key: item.id,
      title: item.title,
      hasSubMenu: item.has_submenu,
      link: item.link,
      icon: item.icon,
      children: data
        .filter(child => child.parent_id === item.id)
        .map(child => ({
          key: child.id,
          title: child.title,
          link: child.link,
          hasSubMenu: false
        }))
    }));
  };

  const handleDrop = async (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: NavItem[],
      key: string,
      callback: (item: NavItem, index: number, arr: NavItem[]) => void
    ) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };

    const data = [...navItems];
    let dragObj: NavItem;

    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.children || []).length > 0 && 
      info.node.expanded && 
      dropPosition === 1
    ) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar: NavItem[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj);
      } else {
        ar.splice(i! + 1, 0, dragObj);
      }
    }

    setNavItems(data);
    await saveNavItems(data);
  };

  const saveNavItems = async (items: NavItem[]) => {
    try {
      setLoading(true);
      const flattenedItems = flattenNavItems(items);
      
      const { error } = await supabase
        .from('navigation_items')
        .upsert(
          flattenedItems.map((item, index) => ({
            id: item.key,
            title: item.title,
            link: item.link,
            has_submenu: item.hasSubMenu,
            parent_id: item.parentId,
            display_order: index,
            icon: item.icon
          }))
        );

      if (error) throw error;
      message.success('导航设置已保存');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const flattenNavItems = (items: NavItem[], parentId: string | null = null): any[] => {
    return items.reduce((acc: any[], item) => {
      const flatItem = {
        key: item.key,
        title: item.title,
        link: item.link,
        hasSubMenu: item.hasSubMenu,
        parentId,
        icon: item.icon
      };
      
      if (item.children && item.children.length > 0) {
        return [...acc, flatItem, ...flattenNavItems(item.children, item.key)];
      }
      
      return [...acc, flatItem];
    }, []);
  };

  const handleAdd = () => {
    const newItem: NavItem = {
      key: uuidv4(),
      title: '新导航项',
      hasSubMenu: false,
      link: '/',
    };
    setNavItems([...navItems, newItem]);
    setCurrentItem(newItem);
    setModalVisible(true);
  };

  const handleAddSubItem = (parentKey: string) => {
    const newItem: NavItem = {
      key: uuidv4(),
      title: '新子菜单项',
      hasSubMenu: false,
      link: '/',
    };

    const updateItems = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.key === parentKey) {
          return {
            ...item,
            children: [...(item.children || []), newItem],
            hasSubMenu: true
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children)
          };
        }
        return item;
      });
    };

    setNavItems(updateItems(navItems));
  };

  const handleDelete = (key: string) => {
    const removeItem = (items: NavItem[]): NavItem[] => {
      return items.filter(item => {
        if (item.key === key) return false;
        if (item.children) {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };

    setNavItems(removeItem(navItems));
  };

  const handleEdit = (item: NavItem) => {
    setCurrentItem(item);
    editForm.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleSave = async (values: any) => {
    if (!currentItem) return;

    const updateItems = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.key === currentItem.key) {
          return {
            ...item,
            ...values
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children)
          };
        }
        return item;
      });
    };

    const updatedItems = updateItems(navItems);
    setNavItems(updatedItems);
    await saveNavItems(updatedItems);
    setModalVisible(false);
  };

  const renderTreeNodes = (items: NavItem[]) => {
    return items.map(item => ({
      key: item.key,
      title: (
        <div className="flex items-center justify-between group">
          <span>{item.title}</span>
          <Space className="opacity-0 group-hover:opacity-100 transition-opacity">
            {item.hasSubMenu && (
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubItem(item.key);
                }}
              />
            )}
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.key);
              }}
            />
            <Switch
              size="small"
              checked={item.hasSubMenu}
              onChange={(checked) => {
                const updateItems = (items: NavItem[]): NavItem[] => {
                  return items.map(i => {
                    if (i.key === item.key) {
                      return { ...i, hasSubMenu: checked };
                    }
                    if (i.children) {
                      return { ...i, children: updateItems(i.children) };
                    }
                    return i;
                  });
                };
                setNavItems(updateItems(navItems));
              }}
            />
          </Space>
        </div>
      ),
      children: item.children && renderTreeNodes(item.children)
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">导航栏设置</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加导航项
        </Button>
      </div>

      <Tree
        className="draggable-tree"
        draggable
        blockNode
        onDrop={handleDrop}
        treeData={renderTreeNodes(navItems)}
      />

      <Modal
        title={currentItem?.key ? "编辑导航项" : "新增导航项"}
        open={modalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="link"
            label="链接"
            rules={[{ required: true, message: '请输入链接' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="icon"
            label="图标"
          >
            <Input placeholder="输入图标名称" />
          </Form.Item>

          <Form.Item
            name="hasSubMenu"
            label="启用子菜单"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NavigationSettingsPage;