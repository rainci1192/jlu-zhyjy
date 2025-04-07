import React, { useState, useEffect } from 'react';
import { Button, Space, message, Modal, Form, Input, Select, InputNumber, Switch, Tree, Spin, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, LinkOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import type { DataNode, TreeProps } from 'antd/es/tree';

interface NavigationItem {
  id: string;
  title: string;
  link: string;
  has_submenu: boolean;
  parent_id: string | null;
  display_order: number;
  icon: string | null;
}

// 为Tree组件定义树节点接口
interface TreeNavigationItem extends DataNode {
  key: string;
  title: string;
  link?: string;
  children?: TreeNavigationItem[];
  isLeaf?: boolean;
  display_order: number;
  has_submenu: boolean;
  parent_id: string | null;
  icon?: string | null;
}

const { Option } = Select;
const { DirectoryTree } = Tree;

const NavigationSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NavigationItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [form] = Form.useForm();
  const [parentItems, setParentItems] = useState<NavigationItem[]>([]);
  const [treeData, setTreeData] = useState<TreeNavigationItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      setLoading(true);
      const { data: navData, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setData(navData || []);
      setParentItems(navData?.filter(item => !item.parent_id) || []);
      
      // 构建树形结构数据
      const treeItems = buildTreeData(navData || []);
      setTreeData(treeItems);
      
      // 设置默认展开所有父节点
      const parentKeys = navData?.filter(item => item.has_submenu).map(item => item.id) || [];
      setExpandedKeys(parentKeys);
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '加载导航数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建树形结构数据
  const buildTreeData = (items: NavigationItem[]): TreeNavigationItem[] => {
    // 递归构建树
    const buildTree = (parentId: string | null): TreeNavigationItem[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .sort((a, b) => a.display_order - b.display_order)
        .map(item => ({
          key: item.id,
          title: item.title,
          link: item.link,
          display_order: item.display_order,
          has_submenu: item.has_submenu,
          parent_id: item.parent_id,
          icon: item.icon,
          isLeaf: !item.has_submenu,
          children: item.has_submenu ? buildTree(item.id) : []
        }));
    };
    
    return buildTree(null);
  };

  const handleDelete = async (id: string) => {
    try {
      // 检查是否有子菜单
      const hasChildren = data.some(item => item.parent_id === id);
      if (hasChildren) {
        message.error('请先删除子菜单项');
        return;
      }

      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      setSelectedKey(null);
      fetchNavigation();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleEdit = (id: string) => {
    const record = data.find(item => item.id === id);
    if (!record) return;
    
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title,
      link: record.link,
      has_submenu: record.has_submenu,
      parent_id: record.parent_id,
      display_order: record.display_order
    });
    setModalVisible(true);
  };

  const handleAdd = (parentId: string | null = null) => {
    setEditingItem(null);
    form.resetFields();
    
    if (parentId) {
      form.setFieldsValue({
        parent_id: parentId,
        has_submenu: false
      });
    }
    
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 如果选择了父菜单，确保has_submenu为false
      if (values.parent_id) {
        values.has_submenu = false;
      }

      // 计算display_order，默认放到同级菜单的最后
      if (!values.display_order && values.display_order !== 0) {
        const siblings = data.filter(item => item.parent_id === values.parent_id);
        values.display_order = siblings.length > 0 
          ? Math.max(...siblings.map(item => item.display_order)) + 1 
          : 0;
      }

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('navigation_items')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('navigation_items')
          .insert([{
            ...values,
            created_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      message.success(`${editingItem ? '更新' : '创建'}成功`);
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchNavigation();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  // 移动菜单项的位置
  const handleMove = async (dragKey: string, dropKey: string, dropPosition: number) => {
    try {
      // 从数据中找到相应的项
      const dragItem = data.find(item => item.id === dragKey);
      const dropItem = data.find(item => item.id === dropKey);
      
      if (!dragItem || !dropItem) return;
      
      let newParentId: string | null = null;
      let siblings: NavigationItem[] = [];
      
      // dropPosition为-1表示放在dropKey之前，1表示之后，0表示成为子节点
      if (dropPosition === 0) {
        // 成为dropKey的子节点
        newParentId = dropKey;
        siblings = data.filter(item => item.parent_id === dropKey);
      } else {
        // 放在dropKey的同级
        newParentId = dropItem.parent_id;
        siblings = data.filter(item => item.parent_id === dropItem.parent_id && item.id !== dragKey);
      }
      
      // 重新计算display_order
      siblings.sort((a, b) => a.display_order - b.display_order);
      
      let newOrder = 0;
      if (dropPosition === -1) {
        // 放在dropKey之前
        newOrder = dropItem.display_order;
      } else if (dropPosition === 1) {
        // 放在dropKey之后
        newOrder = dropItem.display_order + 1;
      } else {
        // 成为子节点，放在最后
        newOrder = siblings.length > 0 
          ? Math.max(...siblings.map(item => item.display_order)) + 1 
          : 0;
      }
      
      // 更新dragItem的parent_id和display_order
      const { error } = await supabase
        .from('navigation_items')
        .update({
          parent_id: newParentId,
          display_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', dragKey);
        
      if (error) throw error;
      
      message.success('移动成功');
      fetchNavigation();
    } catch (error: unknown) {
      message.error('移动失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const renderTreeItemTitle = (node: TreeNavigationItem) => {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {node.has_submenu ? <MenuOutlined className="mr-2" /> : <LinkOutlined className="mr-2" />}
          <span>{node.title}</span>
        </div>
        {selectedKey === node.key && (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(node.key)}
            />
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(node.key)}
            />
            {!node.parent_id && (
              <Button 
                type="text" 
                icon={<PlusOutlined />} 
                size="small" 
                onClick={() => handleAdd(node.key)}
              />
            )}
          </Space>
        )}
      </div>
    );
  };

  // 处理树节点拖动事件
  const onDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    
    handleMove(dragKey, dropKey, dropPosition);
  };

  // 处理展开/收起节点
  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys.map(key => key.toString()));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">导航栏设置</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleAdd()}
        >
          新增顶级菜单
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Spin spinning={loading}>
          <Card title="导航结构" extra={<span className="text-gray-500">拖拽节点可调整结构和顺序</span>}>
            {treeData.length > 0 ? (
              <DirectoryTree
                className="w-full"
                draggable
                blockNode
                showLine
                expandedKeys={expandedKeys}
                selectedKeys={selectedKey ? [selectedKey] : []}
                onSelect={(selectedKeys) => setSelectedKey(selectedKeys[0]?.toString() || null)}
                onExpand={handleExpand}
                onDrop={onDrop}
                treeData={treeData.map(node => ({
                  ...node, 
                  title: renderTreeItemTitle(node),
                  selectable: true
                }))}
              />
            ) : (
              <div className="py-8 text-center text-gray-500">
                暂无导航数据，请添加顶级菜单
              </div>
            )}
          </Card>
        </Spin>
      </div>

      <Modal
        title={editingItem ? '编辑菜单项' : '新增菜单项'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            has_submenu: false,
            display_order: null
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="显示在导航栏的名称" />
          </Form.Item>

          <Form.Item
            name="link"
            label="链接"
            rules={[{ required: true, message: '请输入链接' }]}
          >
            <Input placeholder="如：/about 或 https://example.com" />
          </Form.Item>

          <Form.Item
            name="parent_id"
            label="父菜单"
          >
            <Select 
              allowClear 
              placeholder="留空表示顶级菜单"
              disabled={editingItem?.has_submenu}
            >
              {parentItems.map(item => (
                <Option key={item.id} value={item.id}>{item.title}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="has_submenu"
            label="是否包含子菜单"
            valuePropName="checked"
            tooltip="启用后，此菜单将可以包含子菜单项"
          >
            <Switch disabled={form.getFieldValue('parent_id')} />
          </Form.Item>

          <Form.Item
            name="display_order"
            label="显示顺序"
            tooltip="数字越小排序越靠前，留空则自动添加到末尾"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="自动计算" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NavigationSettingsPage;