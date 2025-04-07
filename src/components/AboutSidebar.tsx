import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  title: string;
  link: string;
  children?: MenuItem[];
}

interface AboutSidebarProps {
  menuItems: MenuItem[];
  currentPath: string;
}

const AboutSidebar: React.FC<AboutSidebarProps> = ({ menuItems, currentPath }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // 调试当前路径
  useEffect(() => {
    console.log('当前路径:', currentPath);
    console.log('菜单项:', menuItems);
  }, [currentPath, menuItems]);
  
  // 检查当前路径是否与菜单项匹配
  const isActive = (link: string) => {
    // 处理/about/school路径特殊情况
    if (link === '/about/school' && currentPath === '/about/school') {
      console.log('学校概况匹配成功!');
      return true;
    }
    
    // 常规路径匹配
    console.log(`比较路径: ${currentPath} === ${link} => ${currentPath === link}`);
    return currentPath === link;
  };
  
  // 检查当前路径是否匹配菜单项或其子项
  const isParentActive = (item: MenuItem) => {
    if (isActive(item.link)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.link));
    }
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-[#014c85] py-6 px-8">
        <h2 className="text-2xl font-bold text-white">研究院介绍</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id} className="text-xl">
              <Link
                to={item.link}
                className={`block py-4 px-6 rounded-lg transition-all duration-300 ${
                  isActive(item.link)
                    ? 'bg-[#0a7cc2] text-white font-bold shadow-md'
                    : hoveredItem === item.id
                    ? 'bg-[#e8f1f8] text-[#014c85] font-semibold'
                    : 'text-gray-700 hover:bg-[#e8f1f8] hover:text-[#014c85]'
                }`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.title}
              </Link>
              {item.children && item.children.length > 0 && (
                <ul className={`ml-6 mt-2 space-y-2 border-l-2 ${isParentActive(item) ? 'border-[#0a7cc2]' : 'border-gray-200'}`}>
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to={child.link}
                        className={`block py-3 px-6 rounded-lg transition-all duration-300 ${
                          isActive(child.link)
                            ? 'bg-[#0a7cc2] text-white font-bold shadow-md'
                            : hoveredItem === child.id
                            ? 'bg-[#e8f1f8] text-[#014c85] font-semibold'
                            : 'text-gray-700 hover:bg-[#e8f1f8] hover:text-[#014c85]'
                        }`}
                        onMouseEnter={() => setHoveredItem(child.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AboutSidebar;