const { app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
import RcpSetting from '../rcp_setting';
//import ImageBinary from "../binary/image_binary";
//import CompressBinary from "../binary/compress_binary";
import RcpIPC from './rcp_ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let rcpIPC;
let rcpWorker;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    minWidth: 900,
    minHeight: 600,    
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegrationInWorker: true
    },
  });

  const modalWindow = new BrowserWindow({
    modal: true,
    parent: mainWindow,
    width: 823,
    height: 600,
    minWidth: 823,
    minHeight: 600,    
    show: false,
    opacity: 0,
    hasShadow: false,    
    titleBarStyle: 'hidden',
    webPreferences: {
        preload: RCP_MODAL_PRELOAD_WEBPACK_ENTRY,
        nodeIntegrationInWorker: true
    },            
  });

  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show');
    mainWindow.show();

    let dbPath;
    if (process.env.NODE_ENV == 'production') {
      dbPath = path.resolve('D://db/recipe db/recipe.db');
    } else {
      dbPath = path.resolve('D://db/recipe db/recipe.db');
    }
    RcpSetting.setDatabasePath(dbPath);

    dbPath = RcpSetting.getDatabasePath();

    let existDb = fs.existsSync(dbPath);

    if (!existDb) {
      let timer = setInterval(() => {
        dialog.showMessageBox(mainWindow, {type:'error',title:'Error', message:'DB file not found.'})
        .then(() => {
          mainWindow.close();
        }); 
        clearInterval(timer);
      }, 500);
    }

    //db open
    // it is move to worker process
    /*
    let db = new RcpSqliteDB(dbPath);
    db.open();
    */
    //Run only once for the first time (due to image file updates)
    /*
    let imageBinary = new ImageBinary(db);
    imageBinary.InsertBinaryToSqliteDB();
    */
    /*
    let compressBinary = new CompressBinary(db);
    compressBinary.InsertBinaryToSqliteDB();
    */
    rcpIPC = new RcpIPC(mainWindow, modalWindow);
    rcpIPC.registerIPC();
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('viewMaximizeBtn', 'unmaximize');
  });
  
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('viewMaximizeBtn', 'maximize');
  });
  
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  modalWindow.loadURL(RCP_MODAL_WEBPACK_ENTRY);

  modalWindow.on('show', () => {
    modalWindow.setSize(700, 560);
    //modalWindow.webContents.openDevTools();
  });
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
