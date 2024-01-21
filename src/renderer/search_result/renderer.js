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

window.onload = () => {  
    //keyword setting for search & paging
    const urlParams = new URLSearchParams(window.location.search);
    let keyword = urlParams.get('keyword');
    window.apis.req_searchRcpListAll(keyword, 1);
}

window.apis.resp_searchRcpListAll((event, searchResult)=>{  
    console.log('renderer: resp_searchRcpListAll');
    if (searchResult.length == 0) {
      alert('No results were found for your search.');
  
    } else if (searchResult != 'error') { // search success
      setSearchResult(searchResult);
      console.log(searchResult);
    } else { // error or no results
        alert('else error');
    }
});

function setSearchResult(searchResult) {
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
            ingredientsArray.forEach(function(ingredient) {
                child += `<p>* ${ingredient}</p>`;
            });

            child +=
              `</div>            
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
