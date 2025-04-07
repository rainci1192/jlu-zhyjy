// Froala Editor工具栏修复脚本
(function() {
  // 在页面加载后执行
  window.addEventListener('DOMContentLoaded', function() {
    // 添加样式以确保工具栏可见
    const style = document.createElement('style');
    style.textContent = `
      .fr-box {
        position: relative !important;
        z-index: 10000 !important;
      }
      .fr-toolbar {
        z-index: 10001 !important;
        visibility: visible !important;
        display: block !important;
        opacity: 1 !important;
        position: sticky !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        border-radius: 4px 4px 0 0 !important;
      }
      .fr-wrapper {
        z-index: 9999 !important;
      }
      .fr-popup {
        z-index: 10002 !important;
      }
      .fr-second-toolbar {
        z-index: 10000 !important;
      }
      .fr-element {
        min-height: 500px !important;
      }
      
      /* 确保按钮可见 */
      .fr-toolbar .fr-command.fr-btn,
      .fr-popup .fr-command.fr-btn {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* 确保弹出菜单可见 */
      .fr-popup {
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* 修复工具栏按钮组 */
      .fr-btn-grp {
        display: inline-block !important;
        visibility: visible !important;
      }
      
      /* 修复更多工具按钮 */
      .fr-more-toolbar {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 10003 !important;
      }
      
      /* 确保模态框中的编辑器正常显示 */
      .ant-modal-body {
        overflow: visible !important;
      }
      .ant-modal-content {
        overflow: visible !important;
        max-height: none !important;
      }
      .ant-modal {
        max-height: 90vh !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);
    
    // 定期检查并修复工具栏
    function fixToolbar() {
      const toolbars = document.querySelectorAll('.fr-toolbar');
      if (toolbars.length > 0) {
        toolbars.forEach(toolbar => {
          toolbar.style.display = 'block';
          toolbar.style.visibility = 'visible';
          toolbar.style.opacity = '1';
          toolbar.style.position = 'sticky';
          toolbar.style.top = '0';
          toolbar.style.zIndex = '10001';
        });
      }
      
      const btnGroups = document.querySelectorAll('.fr-btn-grp');
      if (btnGroups.length > 0) {
        btnGroups.forEach(group => {
          group.style.display = 'inline-block';
          group.style.visibility = 'visible';
        });
      }
      
      const buttons = document.querySelectorAll('.fr-command.fr-btn');
      if (buttons.length > 0) {
        buttons.forEach(btn => {
          btn.style.display = 'inline-block';
          btn.style.visibility = 'visible';
          btn.style.opacity = '1';
        });
      }
    }
    
    // 初始修复
    setTimeout(fixToolbar, 1000);
    
    // 监听模态框打开事件
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 检查是否有新的模态框添加
          const modalAdded = Array.from(mutation.addedNodes).some(node => {
            return node.nodeType === 1 && 
                  (node.classList.contains('ant-modal') || 
                   node.querySelector('.ant-modal') !== null);
          });
          
          if (modalAdded) {
            // 模态框打开后修复工具栏
            setTimeout(fixToolbar, 500);
            setTimeout(fixToolbar, 1000);
            setTimeout(fixToolbar, 2000);
          }
        }
      });
    });
    
    // 观察DOM变化
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 每秒检查一次工具栏
    setInterval(fixToolbar, 1000);
  });
})(); 