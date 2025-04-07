import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, ChevronDown, Menu, FlaskRound as Flask, Globe2, Users, Building2, FileText } from 'lucide-react';

const navItems = [
  { 
    title: '首页', 
    link: '/', 
    icon: <GraduationCap className="w-5 h-5" /> 
  },
  { 
    title: '研究院介绍', 
    link: '/about',
    icon: <Building2 className="w-5 h-5" />,
    subItems: [
      { title: '学校概况', link: '/about/school' },
      { title: '研究院概况', link: '/about/overview' },
      { title: '机构设置', link: '/about/organization' },
      { title: '师资队伍', link: '/about/faculty' },
      { title: '发展历程', link: '/about/history' }
    ]
  },
  { 
    title: '科学研究', 
    link: '/research',
    icon: <Flask className="w-5 h-5" />,
    subItems: [
      { title: '研究方向', link: '/research/areas' },
      { title: '科研成果', link: '/research/achievements' },
      { title: '实验室', link: '/research/labs' }
    ]
  },
  { 
    title: '招生信息', 
    link: '/admission', 
    icon: <Users className="w-5 h-5" /> 
  },
  { 
    title: '人才培养', 
    link: '/talent',
    icon: <GraduationCap className="w-5 h-5" />,
    subItems: [
      { title: '培养方案', link: '/talent/programs' },
      { title: '课程体系', link: '/talent/courses' },
      { title: '实践教学', link: '/talent/practice' }
    ]
  },
  { 
    title: '校企合作', 
    link: '/cooperation', 
    icon: <Building2 className="w-5 h-5" /> 
  },
  { 
    title: '党建工作', 
    link: '/party', 
    icon: <FileText className="w-5 h-5" /> 
  },
  { 
    title: '学生工作', 
    link: '/student', 
    icon: <Users className="w-5 h-5" /> 
  },
  { 
    title: '培训合作', 
    link: '/training', 
    icon: <Globe2 className="w-5 h-5" /> 
  }
];

export default navItems;