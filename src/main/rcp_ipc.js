const {ipcMain, nativeImage} = require('electron');

export default class RcpIPC {
    mainWindow;
    db;

    constructor(_mainWindow, _db) {
        console.log('RcpIPC constructor');

        this.mainWindow = _mainWindow;
        this.db = _db;
    }
   
    addSearchRcpList() {
        ipcMain.on('req_searchRcpListAll', (event, keyword, pageNum) => {
            try {
                keyword = keyword.trim();
                let offset = (pageNum > 1) ?  (pageNum-1)*10 : 0;

                let searchResult = this.db.selectAllByKeyword(keyword,offset);
                event.reply('resp_searchRcpListAll', searchResult);

            } catch (e) {
                console.log(e);
                event.reply('resp_searchRcpListAll', 'error');
            }

        });

    }

    addRcpimageBuffer() {
        ipcMain.on('req_rcpImageBuffer', (event, id) => {
            try {
                let imageResult = this.db.selectImageFileById(id)[0];
                imageResult.image_file = nativeImage.createFromBuffer(imageResult.image_file).toDataURL();
                event.reply('resp_rcpImageBuffer', imageResult);

            } catch (e) {
                console.log(e);
                event.reply('resp_rcpImageBuffer', 'error');
            }

        });

    }    

    registerIPC() {
        this.addSearchRcpList();     
        this.addRcpimageBuffer();
    }

}