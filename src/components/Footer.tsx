import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#014c85] py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">联系我们</h3>
            <p className="text-gray-300">地址：珠海市香洲区唐家湾</p>
            <p className="text-gray-300">电话：0756-12345678</p>
            <p className="text-gray-300">邮箱：info@jlu.edu.cn</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">快速链接</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">研究院概况</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">招生信息</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">科研动态</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">关注我们</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">微信公众号</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">新浪微博</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">抖音号</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">友情链接</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">教育部</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">吉林大学</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">珠海市教育局</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">© 2024 吉林大学珠海研究院 版权所有</p>
          <Link 
            to="/admin/login" 
            className="text-gray-400 hover:text-white transition-colors mt-2 inline-block"
          >
            管理入口
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;