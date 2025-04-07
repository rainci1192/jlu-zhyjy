import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Upload, message, Select } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, 
        AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
        OrderedListOutlined, UnorderedListOutlined, 
        PictureOutlined, LinkOutlined, TableOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

// 中文字体列表
const fontFamilies = [
  { label: '默认字体', value: '' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '微软雅黑', value: '\'Microsoft YaHei\', sans-serif' },
  { label: '楷体', value: 'KaiTi, serif' },
  { label: '仿宋', value: 'FangSong, serif' },
  { label: '思源黑体', value: '\'Source Han Sans CN\', sans-serif' },
  { label: '思源宋体', value: '\'Source Han Serif CN\', serif' },
  { label: '华文细黑', value: '\'STXihei\', sans-serif' },
  { label: '华文楷体', value: '\'STKaiti\', serif' },
];

// 字号列表
const fontSizes = [
  { label: '默认字号', value: '' },
  { label: '八号', value: '8px' },     // 8pt 约等于 8px
  { label: '七号', value: '9px' },     // 7.5pt 约等于 9px
  { label: '小六', value: '10.5px' },  // 6.5pt 约等于 10.5px
  { label: '六号', value: '12px' },    // 7.5pt 约等于 12px
  { label: '小五', value: '13.5px' },  // 9pt 约等于 13.5px
  { label: '五号', value: '15px' },    // 10.5pt 约等于 15px
  { label: '小四', value: '16.5px' },  // 12pt 约等于 16.5px
  { label: '四号', value: '18px' },    // 14pt 约等于 18px
  { label: '小三', value: '21px' },    // 15pt 约等于 21px
  { label: '三号', value: '24px' },    // 16pt 约等于 24px
  { label: '小二', value: '30px' },    // 18pt 约等于 30px
  { label: '二号', value: '36px' },    // 22pt 约等于 36px
  { label: '小一', value: '42px' },    // 24pt 约等于 42px
  { label: '一号', value: '48px' },    // 26pt 约等于 48px
  { label: '小初', value: '54px' },    // 36pt 约等于 54px
  { label: '初号', value: '60px' },    // 42pt 约等于 60px
];

const TextEditor: React.FC<TextEditorProps> = ({ value = '', onChange }) => {
  const [content, setContent] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const [selectKey, setSelectKey] = useState<number>(0); // 用于强制重新渲染Select组件
  const [isEditorFocused, setIsEditorFocused] = useState(false); // 新增状态跟踪编辑器焦点

  useEffect(() => {
    if (value && editorRef.current) {
      const fixedContent = fixImageSources(value);
      editorRef.current.innerHTML = fixedContent;
      setContent(fixedContent);
    }
  }, [value]);

  // 监听粘贴事件，处理表格粘贴
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (editorRef.current && editorRef.current.contains(e.target as Node)) {
        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        // 检查是否有HTML内容（通常表格会以HTML形式存在于剪贴板）
        const html = clipboardData.getData('text/html');
        
        if (html && (html.includes('<table') || html.includes('<TABLE'))) {
          e.preventDefault();
          
          // 清理HTML，保留表格结构但移除潜在的危险属性
          const cleanedHtml = sanitizeHtml(html);
          
          // 将表格插入编辑器
          document.execCommand('insertHTML', false, cleanedHtml);
          
          // 更新内容
          if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
            onChange?.(editorRef.current.innerHTML);
          }
          
          message.success('表格已粘贴');
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

  // 简单的HTML净化函数，保留表格结构但移除可能的危险属性
  const sanitizeHtml = (html: string): string => {
    // 创建一个临时的div元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 获取所有表格相关元素
    const tables = tempDiv.querySelectorAll('table, tr, td, th, tbody, thead, tfoot');
    
    // 保留这些表格元素的基本属性，但移除可能的脚本和其他危险属性
    tables.forEach(element => {
      // 保留的安全属性
      const safeAttributes = ['border', 'cellpadding', 'cellspacing', 'width', 'height', 'colspan', 'rowspan', 'style'];
      
      // 获取元素上的所有属性
      const attributes = Array.from(element.attributes);
      
      // 移除不在安全列表中的属性
      attributes.forEach(attr => {
        if (!safeAttributes.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
      });
      
      // 为表格添加基本样式
      if (element.tagName.toLowerCase() === 'table') {
        element.setAttribute('border', '1');
        element.setAttribute('style', 'width: 100%; border-collapse: collapse;');
      }
      
      // 为单元格添加基本样式
      if (element.tagName.toLowerCase() === 'td' || element.tagName.toLowerCase() === 'th') {
        element.setAttribute('style', 'padding: 8px; border: 1px solid #ddd;');
      }
    });
    
    return tempDiv.innerHTML;
  };

  // 完善保存选择的方法，确保在各种情况下都能正确保存
  const saveSelection = () => {
    if (!editorRef.current) return false;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // 检查选择范围是否与编辑器有交集
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        selectionRangeRef.current = range.cloneRange();
        return true;
      }
    }
    return false;
  };

  // 增强版的恢复选择方法
  const restoreSelection = () => {
    if (!selectionRangeRef.current || !editorRef.current) return false;
    
    try {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRangeRef.current);
        // 确保编辑器获得焦点
        editorRef.current.focus();
        return true;
      }
    } catch (e) {
      console.error('恢复选择失败:', e);
    }
    return false;
  };

  const handleCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      const updatedContent = editorRef.current.innerHTML;
      setContent(updatedContent);
      onChange?.(updatedContent);
    }
  };

  // 修改字体处理函数，确保在选择后不会丢失选中内容
  const handleFontFamily = (fontFamily: string) => {
    if (!fontFamily) return;
    
    // 强制恢复之前保存的选择
    if (restoreSelection()) {
      try {
        // 获取当前选择
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
          // 有选中文本时，使用insertHTML命令应用字体
          const selectedText = selection.toString();
          document.execCommand('insertHTML', false, 
            `<span style="font-family:${fontFamily}">${selectedText}</span>`);
        } else {
          // 无选中文本时，设置光标处字体
          document.execCommand('insertHTML', false, 
            `<span style="font-family:${fontFamily}">&#8203;</span>`);
        }
        
        if (editorRef.current) {
          // 更新内容并保持焦点
          setContent(editorRef.current.innerHTML);
          onChange?.(editorRef.current.innerHTML);
          // 确保编辑器保持焦点
          setTimeout(() => editorRef.current?.focus(), 0);
        }
      } catch (e) {
        console.error('应用字体失败:', e);
      }
    }
    
    // 重置select状态
    setSelectKey(prev => prev + 1);
  };

  // 修改字号处理函数，强化选中文本的处理
  const handleFontSize = (fontSize: string) => {
    if (!fontSize) return;
    
    // 强制恢复之前保存的选择
    if (restoreSelection()) {
      try {
        // 获取当前选择
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
          // 有选中文本时，使用insertHTML命令应用字号
          const selectedText = selection.toString();
          document.execCommand('insertHTML', false, 
            `<span style="font-size:${fontSize}">${selectedText}</span>`);
        } else {
          // 无选中文本时，设置光标处字号
          document.execCommand('insertHTML', false, 
            `<span style="font-size:${fontSize}">&#8203;</span>`);
        }
        
        if (editorRef.current) {
          // 更新内容并保持焦点
          setContent(editorRef.current.innerHTML);
          onChange?.(editorRef.current.innerHTML);
          // 确保编辑器保持焦点
          setTimeout(() => editorRef.current?.focus(), 0);
        }
      } catch (e) {
        console.error('应用字号失败:', e);
      }
    }
    
    // 重置select状态
    setSelectKey(prev => prev + 1);
  };

  // 修复图片上传处理函数
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // 检查文件格式
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!fileExt || !validExtensions.includes(fileExt)) {
        message.error('不支持的图片格式，请上传jpg、png、gif或webp格式的图片');
        return false;
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过5MB');
        return false;
      }
      
      // 生成唯一文件名
      const fileName = `${uuidv4()}.${fileExt}`;
      
      // 上传到Supabase存储
      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('about-images')
        .getPublicUrl(fileName);

      if (!publicUrl) throw new Error('获取图片URL失败');

      // 确保URL是绝对路径
      const absoluteUrl = publicUrl.startsWith('http') 
        ? publicUrl 
        : `${window.location.origin}${publicUrl}`;

      // 将图片插入编辑器
      if (editorRef.current) {
        // 先聚焦编辑器
        editorRef.current.focus();
        
        // 插入图片HTML，使用data-src存储原始URL以便恢复
        document.execCommand('insertHTML', false, 
          `<img src="${absoluteUrl}" alt="${file.name}" data-src="${absoluteUrl}" style="max-width: 100%" />`);
        
        // 更新编辑器内容
        const updatedContent = editorRef.current.innerHTML;
        setContent(updatedContent);
        onChange?.(updatedContent);
        
        message.success('图片上传成功');
      }
      
      return false; // 阻止Upload组件默认行为
    } catch (error) {
      // 类型安全的错误处理
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      message.error(`图片上传失败: ${errorMessage}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const insertLink = () => {
    // 先保存当前选中文本
    saveSelection();
    
    const url = prompt('请输入链接地址:', 'http://');
    const text = prompt('请输入链接文字:', '');
    
    if (url && text && restoreSelection()) {
      handleCommand('insertHTML', `<a href="${url}" target="_blank">${text}</a>`);
    }
  };

  const insertTable = () => {
    // 先保存当前选中文本
    saveSelection();
    
    const rows = parseInt(prompt('请输入行数:', '3') || '3', 10);
    const cols = parseInt(prompt('请输入列数:', '3') || '3', 10);
    
    if (restoreSelection()) {
      let tableHTML = '<table border="1" style="width:100%; border-collapse: collapse;">';
      for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
          tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">${i},${j}</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table><p></p>';
      
      handleCommand('insertHTML', tableHTML);
    }
  };

  // 修复图片src路径问题的函数
  const fixImageSources = (html: string): string => {
    // 没有内容时直接返回
    if (!html || html.trim() === '') return html;
    
    try {
      // 创建临时DOM元素处理HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 查找所有图片
      const images = tempDiv.querySelectorAll('img');
      if (images.length === 0) return html;
      
      // 修复每个图片的src
      images.forEach(img => {
        // 检查是否有data-src属性（这是我们存储的原始URL）
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc) {
          img.src = dataSrc;
        } else if (img.src) {
          // 原始图片没有data-src属性，添加它
          try {
            // 对于相对URL，转换为绝对URL
            if (!img.src.startsWith('http') && !img.src.startsWith('blob:')) {
              const absoluteUrl = new URL(img.src, window.location.origin).href;
              img.src = absoluteUrl;
              img.setAttribute('data-src', absoluteUrl);
            } else {
              // 已经是绝对URL，直接添加data-src
              img.setAttribute('data-src', img.src);
            }
          } catch (error) {
            console.error('处理图片URL时出错:', error);
          }
        }
      });
      
      return tempDiv.innerHTML;
    } catch (error) {
      console.error('修复图片源时出错:', error);
      return html; // 出错时返回原始HTML
    }
  };
  
  const handleContentChange = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      // 修复图片路径并保存
      const fixedContent = fixImageSources(currentContent);
      
      // 仅当修复后的内容与原内容不同时更新DOM
      if (fixedContent !== currentContent) {
        editorRef.current.innerHTML = fixedContent;
      }
      
      setContent(fixedContent);
      onChange?.(fixedContent);
    }
  };

  // 添加新的焦点处理函数
  const handleEditorFocus = () => {
    setIsEditorFocused(true);
  };

  const handleEditorBlur = () => {
    // 延迟设置失焦状态，给其他操作留出时间
    setTimeout(() => {
      setIsEditorFocused(false);
    }, 100);
  };

  return (
    <div className="simple-text-editor" style={{ border: '1px solid #d9d9d9', borderRadius: '2px' }}>
      <div 
        className="toolbar" 
        style={{ 
          padding: '8px', 
          background: '#f8f8f8', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px'
        }}
      >
        {/* 基本格式化工具 */}
        <Space>
          <Button 
            icon={<BoldOutlined />} 
            onClick={() => handleCommand('bold')}
            title="加粗"
          />
          <Button 
            icon={<ItalicOutlined />} 
            onClick={() => handleCommand('italic')}
            title="斜体"
          />
          <Button 
            icon={<UnderlineOutlined />} 
            onClick={() => handleCommand('underline')}
            title="下划线"
          />
        </Space>
        
        {/* 字体和字号 */}
        <Space style={{ marginLeft: '10px' }}>
          <Select
            key={`font-family-${selectKey}`}
            placeholder="选择字体"
            style={{ width: 120 }}
            onChange={handleFontFamily}
            onClick={(e) => {
              e.stopPropagation();
              saveSelection();
            }}
            onDropdownVisibleChange={(visible) => {
              if (visible) {
                // 打开下拉菜单前先保存选择区域
                saveSelection();
                // 确保编辑器有焦点
                if (!isEditorFocused) {
                  editorRef.current?.focus();
                }
              }
            }}
            dropdownMatchSelectWidth={false}
            popupMatchSelectWidth={false}
            getPopupContainer={node => node.parentNode as HTMLElement}
          >
            {fontFamilies.map(font => (
              <Option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </Option>
            ))}
          </Select>
          
          <Select
            key={`font-size-${selectKey}`}
            placeholder="选择字号"
            style={{ width: 90 }}
            onChange={handleFontSize}
            onClick={(e) => {
              e.stopPropagation();
              saveSelection();
            }}
            onDropdownVisibleChange={(visible) => {
              if (visible) {
                // 打开下拉菜单前先保存选择区域
                saveSelection();
                // 确保编辑器有焦点
                if (!isEditorFocused) {
                  editorRef.current?.focus();
                }
              }
            }}
            dropdownMatchSelectWidth={false}
            popupMatchSelectWidth={false}
            getPopupContainer={node => node.parentNode as HTMLElement}
          >
            {fontSizes.map(size => (
              <Option key={size.value} value={size.value} style={{ fontSize: size.value }}>
                {size.label}
              </Option>
            ))}
          </Select>
        </Space>
        
        {/* 对齐方式 */}
        <Space style={{ marginLeft: '10px' }}>
          <Button 
            icon={<AlignLeftOutlined />} 
            onClick={() => handleCommand('justifyLeft')}
            title="左对齐"
          />
          <Button 
            icon={<AlignCenterOutlined />} 
            onClick={() => handleCommand('justifyCenter')}
            title="居中"
          />
          <Button 
            icon={<AlignRightOutlined />} 
            onClick={() => handleCommand('justifyRight')}
            title="右对齐"
          />
        </Space>
        
        {/* 列表 */}
        <Space style={{ marginLeft: '10px' }}>
          <Button 
            icon={<OrderedListOutlined />} 
            onClick={() => handleCommand('insertOrderedList')}
            title="有序列表"
          />
          <Button 
            icon={<UnorderedListOutlined />} 
            onClick={() => handleCommand('insertUnorderedList')}
            title="无序列表"
          />
        </Space>
        
        {/* 插入元素 */}
        <Space style={{ marginLeft: '10px' }}>
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            showUploadList={false}
          >
            <Button 
              icon={<PictureOutlined />} 
              loading={uploading}
              title="插入图片"
            >
              图片
            </Button>
          </Upload>
          <Button 
            icon={<LinkOutlined />} 
            onClick={insertLink}
            title="插入链接"
          >
            链接
          </Button>
          <Button 
            icon={<TableOutlined />} 
            onClick={insertTable}
            title="插入表格"
          >
            表格
          </Button>
        </Space>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleContentChange}
        onMouseUp={() => saveSelection()}
        onKeyUp={() => saveSelection()}
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        style={{ 
          padding: '16px',
          minHeight: '300px',
          outline: 'none',
          overflowY: 'auto'
        }}
      />
      
      <div style={{ padding: '8px', background: '#f8f8f8', borderTop: '1px solid #ddd', fontSize: '12px', color: '#666' }}>
        提示: 可以直接从Excel或Word中复制表格并粘贴到编辑器中
      </div>
    </div>
  );
};

export default TextEditor; 