const { app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
import RcpSetting from '../setting';
import RcpSqliteDB from "../rcp_sqlite_db";
//import ImageBinary from "./binary/image_binary";
//import CompressBinary from "./binary/compress_binary";
import RcpIPC from './rcp_ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let rcpIPC;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
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
    let db = new RcpSqliteDB();
    db.open();

    //Run only once for the first time (due to image file updates)
    /*
    let imageBinary = new ImageBinary(db);
    imageBinary.InsertBinaryToSqliteDB();
    */
    /*
    let compressBinary = new CompressBinary(db);
    compressBinary.InsertBinaryToSqliteDB();
    */

    rcpIPC = new RcpIPC(mainWindow, db);
    rcpIPC.registerIPC();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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
