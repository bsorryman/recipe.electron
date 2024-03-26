const { ipcMain, dialog} = require('electron');
import RcpWorker from './rcp_worker';

export default class RcpIPC {
  mainWindow;
  modalWindow;
  rcpWorker;

  constructor(_mainWindow, _modalWindow) {
    this.mainWindow = _mainWindow;
    this.modalWindow = _modalWindow;
    this.rcpWorker = new RcpWorker(_mainWindow, _modalWindow);
  }

  addTitleBar() {
    ipcMain.handle('minimize', (event, thisWindow) => {
      if (thisWindow == 'main') {
        this.mainWindow.minimize();
      } else {
        this.modalWindow.minimize();
      }
    });

    ipcMain.handle('maximize', (event, thisWindow) => {
      if (thisWindow == 'main') {
        this.mainWindow.maximize();
      } else {
        this.modalWindow.maximize();
      }
    });

    ipcMain.handle('unmaximize', (event, thisWindow) => {
      if (thisWindow == 'main') {
        this.mainWindow.unmaximize();
      } else {
        this.modalWindow.unmaximize();
      }
    });

    ipcMain.handle('close', (event, thisWindow) => {
      if (thisWindow == 'main') {
        this.mainWindow.close();
      } else {
        // fade out effect
        /*
        * If you close modalWindow, 
        * it cannot be reused again, so hide it.
        */

        let opacity = 1;
        const interval = setInterval(() => {
          opacity -= 0.25;
          this.modalWindow.setOpacity(opacity);

          if (opacity <= 0) {
            clearInterval(interval);
            this.modalWindow.setHasShadow(false);
            this.modalWindow.hide();
            this.modalWindow.unmaximize();
            this.mainWindow.focus();
          }
        }, 25);
      }
    });
  }

  addSearchRcpList() {
    ipcMain.on('req_searchRcpList', (event, keyword, column, pageNum) => {
      try {
        keyword = keyword.trim();
        let offset = (pageNum > 1) ? (pageNum - 1) * 10 : 0;

        let data = {
          keyword: keyword,
          column: column,
          offset: offset
        };

        this.rcpWorker.postMessageToWorker('selectRcpByKeyword', data);

      } catch (error) {
        console.log(error);
        event.reply('resp_searchRcpList', 'error');
      }

    });

  }

  addRcpimageSrc() {
    ipcMain.on('req_rcpImageSrc', (event, id) => {
      try {
        this.rcpWorker.postMessageToWorker('selectRcpImageFileById', id);

      } catch (error) {
        console.log(error);
        event.reply('resp_rcpImageSrc', 'error');
      }

    });

  }

  addRcpZipFile() {
    ipcMain.on('req_rcpZipFile', (event, id) => {
      try {
        let data = {
          id: id,
          type: 'download'
        };        
        this.rcpWorker.postMessageToWorker('selectRcpZipFileById', data);

      } catch (error) {
        console.log(error);
      }
    });
  }

  addRcpViewByDecompress() {
    ipcMain.on('req_rcpViewByDecompress', (event, id) => {
      let data = {
        id: id,
        type: 'view'
      };    
            
      this.rcpWorker.postMessageToWorker('selectRcpZipFileById', data);

    });
  }

  addShowMessage() {
    ipcMain.on('req_showMessage', (event, type, title, message)=>{
      dialog.showMessageBox(this.mainWindow, {type: type, title: title, message: message});
    });
  }

  addRcpView() {
    ipcMain.on('req_rcpView', (event, keyword, id) => {
      let data = {
        keyword: keyword,
        id: id
      };    
      this.rcpWorker.postMessageToWorker('selectRecipeByIdAndKeyword', data);

    });
  }  

  registerIPC() {
    this.addTitleBar();
    this.addSearchRcpList();
    this.addRcpimageSrc();
    this.addRcpZipFile();
    this.addRcpViewByDecompress();
    this.addShowMessage();
    this.addRcpView();
  }

}