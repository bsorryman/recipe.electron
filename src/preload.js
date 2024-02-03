// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apis', {
    minimize: (thisWindow) => ipcRenderer.invoke('minimize', thisWindow),
    maximize: (thisWindow) => ipcRenderer.invoke('maximize', thisWindow),
    unmaximize: (thisWindow) => ipcRenderer.invoke('unmaximize', thisWindow),
    close: (thisWindow) => ipcRenderer.invoke('close', thisWindow),

    onTitlebar: (callback) => ipcRenderer.on('viewMaximizeBtn', callback),

    req_searchRcpList: (keyword, column, pageNum) => ipcRenderer.send('req_searchRcpList', keyword, column, pageNum),
    resp_searchRcpList: (searchResult) => ipcRenderer.on('resp_searchRcpList', searchResult),

    req_rcpImageSrc: (id) => ipcRenderer.send('req_rcpImageSrc', id),
    resp_rcpImageSrc: (imageResult) => ipcRenderer.on('resp_rcpImageSrc', imageResult),

    req_rcpZipFile: (id) => ipcRenderer.send('req_rcpZipFile', id),

    req_rcpViewByDecompress: (id) => ipcRenderer.send("req_rcpViewByDecompress", id),
    resp_rcpViewByDecompress: (viewResult) => ipcRenderer.on("resp_rcpViewByDecompress", viewResult),

    
  });