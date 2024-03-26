/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { Titlebar } from '../title_bar'

window.$ = window.jQuery = require('jquery');

// Global variable for search & paging
let gKeyword;
let gColumn;
let gTotalRcp;
//let gLastPage;
//let gRange = 1;
let gPageNum = 1;
let gPageNomore = false;
let gAllRecipe;

/**
 * When loading a search_result page from another page, first set (gKeyword) and search
 */
window.onload = () => {
  new Titlebar('main');

  const urlParams = new URLSearchParams(window.location.search);
  gKeyword = urlParams.get('keyword');
  gColumn = urlParams.get('column');
  gAllRecipe = urlParams.get('all');

  if (gAllRecipe == 'y') {
    requestSearch('', 'all', 1);

  } else {
    $('#keyword').val(gKeyword);
    $('#column').val(gColumn);
    requestSearch(gKeyword, gColumn, 1);
  }

}

/**
 * A function that requests search results from all columns.
 * @param {*} keyword 
 * @param {*} pageNum 
 */
function requestSearch(keyword, column, pageNum) {
  gPageNum = pageNum;
  window.apis.req_searchRcpList(keyword, column, pageNum); // A search request to the main process.
}

/**
 * A listener that receives responses to all column search requests.
 */
window.apis.resp_searchRcpList((event, searchResult) => {
  if (searchResult.resultTable.length == 0) {
    if (gPageNum>1 && gPageNomore == false) {
      window.apis.req_showMessage('info', 'Info', 'There are no more results to display.');
      gPageNomore = true;
    } else if (gPageNum==1 && gPageNomore == false) {
      window.apis.req_showMessage('info', 'Info', 'No results were found for your search.');
      $('#keyword').trigger('focus');
  
      $('#list').empty(); //search result hide
      //$('#pg_div').hide(); //pagination hide
      //gTotalRcp = 0;
    }

  } else if (searchResult != 'error') {
    displaySearchResult(searchResult.resultTable); // Display received search results.
    gTotalRcp = searchResult.resultTotal[0].total;

  } else {
    window.apis.req_showMessage('error', 'Error', 'Error');
  }

  //gLastPage = Math.ceil(gTotalRcp / 10);
  //displayPagination(gPageNum); // After calculating the last page, display 'pagination' immediately.
});

/**
 * A function that displays the received search results in HTML on the page.
 * @param {*} searchResult 
 * @returns 
 */
function displaySearchResult(searchResult) {
  if (gTotalRcp == 0) {
    return;
  }
  let idList = [];
  try {
    searchResult.forEach((value, index) => {
      let child = 
        `
        <li class="item">
          <div class="img_wrap"><img src="/assets/img/result_loader64.gif" alt="" id="img_${value.id}" class="item_img"></div>
          <h3 class="item_tit">${value.title}</h3>
          <div class="btn_wrap">
          <a href="javascript:void(0)" id="download_${value.id}" class="download download_btn">Download</a>
          <a href="javascript:void(0)" id="view_${value.id}" class="poput view_btn">View</a>
          </div>
        </li>         
        `;

      $('#list').append(child);
      idList.push(`${value.id}`);
    });
    /**
     * After displaying the search results, add additional functions 
     * (Because the work to encode the buffer needs to be done in 'Main')
     */
    displayRcpImage(idList);
    setDownloadButton();
    setRcpViewButton();
  } catch (e) {
    /**
     * Catch errors when there is no search result 
     * so that only empty() is executed when there is no search result.
     */
    console.log('displaySearchResult: catch' + e);
    displaySearchResult
  }
}

/**
 * A function that requests images based on search results
 */
function displayRcpImage(idList) {
  //let idList = $('.link_img');
  $.each(idList, (key, value) => {
    //let rcpId = value.id.substring(4, value.id.length);
    window.apis.req_rcpImageSrc(value); // Request images to the main process
  });
}

/**
 * A listener that receives a response to images request 
 * and displays the images.
 */
window.apis.resp_rcpImageSrc((event, imageResult) => {
  let id = imageResult.id;
  let imageSrc = imageResult.image_file;
  $(`#img_${id}`).attr('src', imageSrc); //display
});

/**
 * A function that sets the button for downloading the zip file.
 */
function setDownloadButton() {
  let idList = $('.download_btn');
  $.each(idList, (key, value) => {
    value.onclick = () => {
      let rcpId = value.id.substring(9, value.id.length);
      window.apis.req_rcpZipFile(rcpId); // Request images to the main process
    }
  });
}

/**
 * A function that sets the button that displays all the information in the recipe
 */
function setRcpViewButton() {
  let idList = $('.view_btn');
  $.each(idList, (key, value) => {
    value.onclick = () => {
      let rcpId = value.id.substring(5, value.id.length);
      // Request decompressed zip data from the main process.
      window.apis.req_rcpView(gKeyword, rcpId);
    }
  });
}

// Infinite Scroll (pagination)
window.addEventListener('scroll', function() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    if (gAllRecipe == 'y') {
      requestSearch('', 'all', gPageNum+1);
    } else {
      requestSearch(gKeyword, gColumn, gPageNum+1); 
    }    
  }
});