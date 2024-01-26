// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apis', {
    
    req_searchRcpList: (keyword, column, pageNum) => ipcRenderer.send('req_searchRcpList', keyword, column, pageNum),
    resp_searchRcpList: (searchResult) => ipcRenderer.on('resp_searchRcpList', searchResult),

    req_rcpImageBuffer: (id) => ipcRenderer.send('req_rcpImageBuffer', id),
    resp_rcpImageBuffer: (imageResult) => ipcRenderer.on('resp_rcpImageBuffer', imageResult)
  });