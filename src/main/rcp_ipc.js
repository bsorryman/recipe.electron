const {ipcMain} = require('electron');

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
            console.log('main: req_searchRcpListAll');
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

    registerIPC() {
        this.addSearchRcpList();     
    }

}