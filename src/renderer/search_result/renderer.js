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

import '../../index.css';
window.$ = window.jQuery = require('jquery');

//Global variable for search & paging
let gKeyword;
let gTotalRecipe;
let gLastPage;
let gRange = 1;
let gPageNum = 1;

window.onload = () => {
  //keyword setting for search & paging
  const urlParams = new URLSearchParams(window.location.search);
  gKeyword = urlParams.get('keyword');
  $('#keyword').val(gKeyword);

  getData(gKeyword, 1);
}

function getData(keyword, pageNum) {
  console.log('curPage: ' + pageNum);
  gPageNum = pageNum;
  window.apis.req_searchRcpListAll(keyword, pageNum);
}

window.apis.resp_searchRcpListAll((event, searchResult) => {

  if (searchResult.length == 0) {
    alert('No results were found for your search.');

  } else if (searchResult != 'error') { // search success
    setSearchResult(searchResult.resultTable);
    gTotalRecipe = searchResult.resultTotal[0].total;

  } else { // error or no results
    alert('else error');
  }

  gLastPage = Math.ceil(gTotalRecipe/10);
  setPagination(gPageNum);

});

function setSearchResult(searchResult) {
  $('#list').empty();
  if (gTotalRecipe == 0) {
    return;
  }
  try {
    searchResult.forEach((value, index) => {
      let child =
        `<li>
          <div>
            <div>
              <div>
                <strong>Recipe ID</strong>
                <p>${value.id}</p>
              </div>
              <div>
                <strong>Title</strong>
                <p>${value.title}</p>
              </div>
              <div>
                <strong>Ingredients</strong>
                <!--<p>${value.ingredients}</p>-->
        `;

      let recipeVal = value;
      let ingredients = recipeVal.ingredients;
      let matchArray = ingredients.match(/'[^']*'/g);
      let ingredientsArray = matchArray.map(match => match.slice(1, -1));
      ingredientsArray.forEach(function (ingredient) {
        child += `<p>* ${ingredient}</p>`;
      });

      child +=
        `     </div>            
              <div>
                <strong>Instructions</strong>
                <p>${value.instructions}</p>
              </div>
            </div>
          </div>
        </li>`;

      $('#list').append(child);
    });
  } catch (e) {
    /**
     * Catch errors when there is no search result 
     * so that only empty() is executed when there is no search result.
     */
    console.log('setSearchResult: catch' + e);
  }
}

function setPagination(pageNum) {
  const RANGE_SIZE = 10;
  let lastRange = (gLastPage / RANGE_SIZE <= 1) ? 1 : Math.ceil(gLastPage / RANGE_SIZE);

  gRange = (pageNum <= 10) ? 1 : Math.ceil(pageNum / 10);

  let startPageInRange = (gRange == 1) ? 1 : gRange * 10 - 9;

  let idToken = 1;

  for (let i = startPageInRange; i < startPageInRange + 10; i++) {
    if (i > gLastPage) {
      $("#pg_" + idToken).hide();

    } else if (i == pageNum) {
      $("#pg_" + idToken).show();
      $('#pg_' + idToken).html(i);
      $("#pg_" + idToken).css("color" ,"red");

    } else {
      $("#pg_" + idToken).show();
      $('#pg_' + idToken).html(i);
      $("#pg_" + idToken).css("color" ,"black");

    }
    idToken++;
  }

  if (gRange == 1) {
    $("#pg_prev").hide();
    $("#pg_first").hide();

    if (lastRange == 1) {
      $("#pg_next").hide();
      $("#pg_last").hide();
    } else {
      $("#pg_next").show();
      $("#pg_last").show();
    }


  } else if (gRange > 1 && gRange < lastRange) {
    $("#pg_prev").show();
    $("#pg_first").show();
    $("#pg_next").show();
    $("#pg_last").show();

  } else {
    $("#pg_prev").show();
    $("#pg_first").show();
    $("#pg_next").hide();
    $("#pg_last").hide();

  }

  $('.result').scrollTop(0);
}


//paging envent
$('.pg_list').on('click', function () {
  getData(gKeyword, $(this).html());
});

$('#pg_first').on('click', function () {
  getData(gKeyword, 1);
});

$('#pg_next').on('click', function () {
  getData(gKeyword, 1 + (gRange * 10));
});

$('#pg_prev').on('click', function () {
  getData(gKeyword, (gRange - 1) * 10);
});

$('#pg_last').on('click', function () {
  getData(gKeyword, gLastPage);
});