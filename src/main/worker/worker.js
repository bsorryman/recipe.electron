const { parentPort, workerData } = require('worker_threads');

import RcpSqliteDB from '../rcp_sqlite_db';

const { dbPath } = workerData;
let db = null;

function dbOpen() {
  try {
    console.log('worker db open');
    db = new RcpSqliteDB(dbPath);
    db.open();

  } catch (error) {
    console.log('db open in worker: ' + error);
  }

}

function chooseQuery(msgId, data) {
  let dbResult;
  let replyId;

  switch (msgId) {
    case 'selectRcpByKeyword':
      let keyword = data.keyword;
      let column = data.column;
      let offset = data.offset;

      dbResult = db.selectRcpByKeyword(keyword, column, offset);
      replyId = 'resp_searchRcpList'
      break;

    case 'selectRcpImageFileById':
      //data == id
      dbResult = db.selectRcpImageFileById(data);
      replyId = 'resp_rcpImageSrc'
      break;

    case 'selectRcpZipFileById':
      let id = data.id;
      let type = data.type;
      dbResult = db.selectRcpZipFileById(id);

      if (type=='download') {
        replyId = 'resp_rcpZipFile'
      } else {
        replyId = 'resp_rcpViewByDecompress';
      }

      break;

    case 'selectRecipeByIdAndKeyword':
      let viewKeyword = data.keyword;
      let viewId = data.id;
      dbResult = db.selectRecipeByIdAndKeyword(viewKeyword, viewId);
      replyId = 'resp_rcpView';

      break;
  }

  let result = {
    replyId: replyId,
    dbResult: dbResult
  }

  return result;
}

parentPort.on('message', (_workerData) => {
  const { msgId, data } = _workerData;

  try {
    if (data.keyword == 'worker_error') {
      if (process.env.NODE_ENV != 'production') {
        parentPort.error(); // forced error. (test)
      }
    }

    if (msgId == 'close') {
      db.close();
      parentPort.close();

      return;
    }

    let workerResult = chooseQuery(msgId, data);

    parentPort.postMessage(workerResult);

  } catch (e) {
    console.log('[worker] Catch Error in Worker: ');
    console.log(e);
    parentPort.close();
  }
});

dbOpen();

process.on('exit', (code) => {
  console.log(`[worker] Exit event in worker.`);
  db.close();
});

