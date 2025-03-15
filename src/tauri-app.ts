import { Window } from '@tauri-apps/api/window';

const tauriApp = {
  f7: null as any,

  handleWindowControls: async function () {
    // 不再需要监听窗口关闭事件
  },

  handleBackButton: function () {
    const f7 = tauriApp.f7;
    const $ = f7.$;

    // 创建返回键处理函数
    const handleBack = async () => {
      // 处理各种模态框的关闭
      if ($('.actions-modal.modal-in').length) {
        f7.actions.close('.actions-modal.modal-in');
        return;
      }
      if ($('.dialog.modal-in').length) {
        f7.dialog.close('.dialog.modal-in');
        return;
      }
      if ($('.sheet-modal.modal-in').length) {
        f7.sheet.close('.sheet-modal.modal-in');
        return;
      }
      if ($('.popover.modal-in').length) {
        f7.popover.close('.popover.modal-in');
        return;
      }
      if ($('.popup.modal-in').length) {
        if ($('.popup.modal-in>.view').length) {
          const currentView = f7.views.get('.popup.modal-in>.view');
          if (currentView && currentView.router && currentView.router.history.length > 1) {
            currentView.router.back();
            return;
          }
        }
        f7.popup.close('.popup.modal-in');
        return;
      }
      if ($('.login-screen.modal-in').length) {
        f7.loginScreen.close('.login-screen.modal-in');
        return;
      }

      if ($('.page-current .searchbar-enabled').length) {
        f7.searchbar.disable('.page-current .searchbar-enabled');
        return;
      }

      if ($('.page-current .card-expandable.card-opened').length) {
        f7.card.close('.page-current .card-expandable.card-opened');
        return;
      }

      const currentView = f7.views.current;
      if (currentView && currentView.router && currentView.router.history.length > 1) {
        currentView.router.back();
        return;
      }

      if ($('.panel.panel-in').length) {
        f7.panel.close('.panel.panel-in');
        return;
      }

      // 如果没有可关闭的模态框或返回操作，直接关闭窗口
      const window = Window.getCurrent();
      await window.close();
    };

    // 监听后退键事件（一般在移动端 PWA 中使用）
    window.addEventListener('popstate', handleBack);
  },

  // 初始化函数
  init: function (f7: any) {
    tauriApp.f7 = f7;

    // 设置窗口控制
    tauriApp.handleWindowControls();

    // 设置返回按钮处理
    tauriApp.handleBackButton();
  },
};

export default tauriApp;
