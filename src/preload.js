// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apis', {
    
    req_searchRcpListAll: (keyword, pageNum) => ipcRenderer.send('req_searchRcpListAll', keyword, pageNum),
    resp_searchRcpListAll: (searchResult) => ipcRenderer.on('resp_searchRcpListAll', searchResult),

  });