const { nativeImage, app, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

import RcpDecompress from './rcp_decompress';
import RcpSetting from '../rcp_setting';

export default class RcpWorker {
  mainWindow;
  modalWindow;

  worker;
  workerOnListener;
  workerExitListener;

  constructor(_mainWindow, _modalWindow) {
    this.mainWindow = _mainWindow;
    this.modalWindow = _modalWindow;

    this.setWorker();
    this.setWorkerOnListener();
    this.setWorkerExitListener();
  }

  setWorker() {
    //webpack path
    let workerPath = path.resolve(__dirname, './worker.js');
    let _dbPath = RcpSetting.getDatabasePath();

    console.log('Create new worker');
    const dbPathObj = { dbPath: _dbPath };
    this.worker = new Worker(workerPath, { workerData: dbPathObj });
  }

  setWorkerOnListener() {
    this.workerOnListener = this.worker.on('message', (workerResult) => {

      if (workerResult.replyId == 'resp_rcpImageSrc') {
        let imageResult = workerResult.dbResult[0];
        imageResult.image_file = nativeImage.createFromBuffer(imageResult.image_file).toDataURL();

        this.mainWindow.webContents.postMessage(workerResult.replyId, imageResult);

        return;

      } else if (workerResult.replyId == 'resp_rcpZipFile') {
        let zipFileResult = workerResult.dbResult[0];
        this.showSaveAsRcpZipFile(zipFileResult);

        return;

      } else if (workerResult.replyId == 'resp_rcpViewByDecompress') {
        let zipFileResult = workerResult.dbResult[0];
        let rcpDecompress = new RcpDecompress();
        rcpDecompress.decompressRecipeZipFile(zipFileResult, this.viewRcpDetail, this.modalWindow);

      } else if (workerResult.replyId == 'resp_rcpView') {
        let viewResult = workerResult.dbResult[0];
        let imageFile = nativeImage.createFromBuffer(viewResult.image_file).toDataURL();

        viewResult.image_file = imageFile;
        this.showRcpView(this.modalWindow);
        this.modalWindow.webContents.postMessage('resp_rcpView', viewResult);
      }

      this.mainWindow.webContents.postMessage(workerResult.replyId, workerResult.dbResult);
    });
  }

  setWorkerExitListener() {
    this.exitListener = this.worker.on('exit', (code) => {
      console.log(`IPC: Worker exited with code ${code}`);
      this.worker = null;
      this.onListener = null;
      this.exitListener = null;

      // Code value to determine whether to go to the main page. 
      // 1 : call of terminate()
      // 0 : anything else
      if (code == 1) {
        console.log('terminate!!! create new worker and listener');
        return;
      }

      let timer = setInterval(() => {
        dialog.showMessageBox(this.mainWindow, { type: 'error', title: 'Error', message: 'An unknown error occurred in program. \nReturn to main window. ' })
          .then(() => {
            this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
          });
        clearInterval(timer);
      }, 500);

    });

  }

  postMessageToWorker(msgId, data) {
    if (this.worker == null) {
      console.log('This worker and listenr are null. create new worker and listener');
      this.setWorker();
      this.setWorkerOnListener();
      this.setWorkerExitListener();
    }

    const workerData = {
      msgId: msgId,
      data: data
    }

    this.worker.postMessage(workerData);
  }

  showSaveAsRcpZipFile(zipFileResult) {
    try {
      //result
      let title = zipFileResult.title;
      let zipBuffer = zipFileResult.recipe_zip_file;

      //set default download path
      let documents = app.getPath('documents');
      let defaultPath = path.join(documents, `${title}.zip`);

      dialog.showSaveDialog({
        title: 'Save As',
        defaultPath: defaultPath.toString(),
        filters: [
          {
            name: 'Recipe Files',
            extensions: ['zip']
          },],
        properties: []
      }).then(file => {
        // Stating whether dialog operation was cancelled or not.
        console.log(file.canceled);
        if (!file.canceled) {
          console.log(file.filePath.toString());

          fs.writeFile(file.filePath.toString(), zipBuffer, 'binary', function (err) {
            if (err) {
              console.log('Fail !! ');
            } else {
              console.log('File written successfully: ' + file.filePath.toString());
            }
          });
        }
      }).catch(err => {
        console.log(err)
      });
    } catch (error) {
      console.log(error);
    }
  }  

  viewRcpDetail(rcpDetail, rcpImageSrc, rcpString, modalWindow) {
    // Center the modalWindow in the mainWindow      
    const parentBounds = (modalWindow.getParentWindow()).getBounds();

    const x = parentBounds.x + Math.floor((parentBounds.width - 823) / 2);
    const y = parentBounds.y + Math.floor((parentBounds.height - 600) / 2);

    modalWindow.setPosition(x, y);
    modalWindow.setOpacity(0);
    modalWindow.show();

    // fade in effect
    let opacity = 0;
    const interval = setInterval(() => {
      opacity += 0.25;
      modalWindow.setOpacity(opacity);

      if (opacity >= 1) {
        clearInterval(interval);
      }
    }, 25);

    let viewResult = {
      rcpDetail: rcpDetail,
      rcpImageSrc: rcpImageSrc,
      rcpString: rcpString.toString()
    };

    modalWindow.webContents.postMessage('resp_rcpViewByDecompress', viewResult);

    return;
  }  

  showRcpView(modalWindow) {
    // Center the modalWindow in the mainWindow      
    const parentBounds = (modalWindow.getParentWindow()).getBounds();

    const x = parentBounds.x + Math.floor((parentBounds.width - 823) / 2);
    const y = parentBounds.y + Math.floor((parentBounds.height - 600) / 2);

    modalWindow.setPosition(x, y);
    modalWindow.setOpacity(0);
    modalWindow.show();

    // fade in effect
    let opacity = 0;
    const interval = setInterval(() => {
      opacity += 0.25;
      modalWindow.setOpacity(opacity);

      if (opacity >= 1) {
        clearInterval(interval);
      }
    }, 25);

    return;
  }    
}