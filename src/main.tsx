import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 导入 Froala 编辑器的样式
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/plugins/code_view.min.css';
import 'froala-editor/css/plugins/image.min.css';
import 'froala-editor/css/plugins/image_manager.min.css';
import 'froala-editor/css/plugins/table.min.css';
import 'froala-editor/css/plugins/colors.min.css';
import 'froala-editor/css/plugins/file.min.css';
import 'froala-editor/css/plugins/char_counter.min.css';
import 'froala-editor/css/plugins/fullscreen.min.css';
import 'froala-editor/css/plugins/emoticons.min.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);