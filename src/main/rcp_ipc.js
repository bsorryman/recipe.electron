const {ipcMain, nativeImage, app, dialog} = require('electron');
const path = require('path');
const fs = require('fs');

export default class RcpIPC {
    mainWindow;
    db;

    constructor(_mainWindow, _db) {
        console.log('RcpIPC constructor');

        this.mainWindow = _mainWindow;
        this.db = _db;
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

    registerIPC() {
        this.addSearchRcpList();     
        this.addRcpimageSrc();
        this.addRcpZipFile();
    }

}