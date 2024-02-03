const {ipcMain, nativeImage, app, dialog} = require('electron');
const path = require('path');
const fs = require('fs');

import RcpDecompress from './rcp_decompress';

export default class RcpIPC {
    mainWindow;
    modalWindow;
    db;

    constructor(_mainWindow, _modalWindow, _db) {
        console.log('RcpIPC constructor');

        this.mainWindow = _mainWindow;
        this.modalWindow = _modalWindow;
        this.db = _db;
    }

    addTitleBar() {
        ipcMain.handle('minimize', (event, thisWindow) => {
            if (thisWindow=='main') {
                this.mainWindow.minimize();
            } else {
                this.modalWindow.minimize();
            }
        });

        ipcMain.handle('maximize', (event, thisWindow) => {
            if (thisWindow=='main') {
                this.mainWindow.maximize();
            } else {
                this.modalWindow.maximize();
            }
        });

        ipcMain.handle('unmaximize', (event, thisWindow) => {
            if (thisWindow=='main') {
                this.mainWindow.unmaximize();
            } else {
                this.modalWindow.unmaximize();
            }
        });

        ipcMain.handle('close', (event, thisWindow) => {
            if (thisWindow=='main') {
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
                let offset = (pageNum > 1) ?  (pageNum-1)*10 : 0;

                let searchResult = this.db.selectRcpByKeyword(keyword, column, offset);
                event.reply('resp_searchRcpList', searchResult);

            } catch (error) {
                console.log(error);
                event.reply('resp_searchRcpList', 'error');
            }

        });

    }

    addRcpimageSrc() {
        ipcMain.on('req_rcpImageSrc', (event, id) => {
            try {
                let imageResult = this.db.selectRcpImageFileById(id)[0];
                imageResult.image_file = nativeImage.createFromBuffer(imageResult.image_file).toDataURL();
                event.reply('resp_rcpImageSrc', imageResult);

            } catch (error) {
                console.log(error);
                event.reply('resp_rcpImageSrc', 'error');
            }

        });

    }    

    addRcpZipFile() {
        ipcMain.on('req_rcpZipFile', (event, id) => {
            try {
                let zipFileResult = this.db.selectRcpZipFileById(id)[0];

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
                        }, ],
                    properties: []
                }).then(file => {
                    // Stating whether dialog operation was cancelled or not.
                    console.log(file.canceled);
                    if (!file.canceled) {
                        console.log(file.filePath.toString());
                          
                        fs.writeFile(file.filePath.toString(), zipBuffer, 'binary', function(err) {
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
        });
    }

    addRcpViewByDecompress() {
        ipcMain.on('req_rcpViewByDecompress', (event, id) => {
            console.log('req_rcpViewByDecompress: ' + id);
            let zipFileResult = this.db.selectRcpZipFileById(id)[0];
            let rcpDecompress = new RcpDecompress();

            rcpDecompress.decompressRecipeZipFile(zipFileResult, this.viewRcpDetail, this.modalWindow);
            
        });
    }

    viewRcpDetail(title, rcpImageSrc, rcpString, modalWindow) {

        console.log('viewRcpDetail');

        // Center the modalWindow in the mainWindow      
        const parentBounds = (modalWindow.getParentWindow()).getBounds();

        const x = parentBounds.x + Math.floor((parentBounds.width - 700) / 2);
        const y = parentBounds.y + Math.floor((parentBounds.height - 560) / 2);

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
            title: title, 
            rcpImageSrc: rcpImageSrc,
            rcpString: rcpString.toString()
        };

        modalWindow.webContents.postMessage('resp_rcpViewByDecompress', viewResult);

        return;
    }

    registerIPC() {
        this.addTitleBar();
        this.addSearchRcpList();     
        this.addRcpimageSrc();
        this.addRcpZipFile();
        this.addRcpViewByDecompress();
    }

}