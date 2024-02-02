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

// Global variable for search & paging
let gKeyword;
let gColumn;
let gTotalRcp;
let gLastPage;
let gRange = 1;
let gPageNum = 1;

/**
 * When loading a search_result page from another page, first set (gKeyword) and search
 */
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    gKeyword = urlParams.get('keyword');
    gColumn = urlParams.get('column');
    $('#keyword').val(gKeyword);

    requestSearch(gKeyword, gColumn, 1);
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
    if (searchResult.length == 0) {
        alert('No results were found for your search.');

    } else if (searchResult != 'error') {
        displaySearchResult(searchResult.resultTable); // Display received search results.
        gTotalRcp = searchResult.resultTotal[0].total;

    } else { 
        alert('Error');
    }

    gLastPage = Math.ceil(gTotalRcp / 10);
    displayPagination(gPageNum); // After calculating the last page, display 'pagination' immediately.

});

/**
 * A function that displays the received search results in HTML on the page.
 * @param {*} searchResult 
 * @returns 
 */
function displaySearchResult(searchResult) {
    $('#list').empty(); //init
    if (gTotalRcp == 0) {
        return;
    }
    try {
        searchResult.forEach((value, index) => {
            let child =
                `<li>
                    <div>
                        <img src="" class="link_img" id="img_${value.id}" />
                    </div>                
                    <div>
                        <div>
                            <!--
                            <div>
                                <strong>Recipe ID</strong>
                                <p>${value.id}</p>
                            </div>
                            -->
                            <div>
                                <strong>Title</strong>
                                <p>${value.title}</p>
                            </div>
                            <div>
                                <strong>Ingredients</strong>
                                <!--<p>${value.ingredients}</p>-->
                `;

            // Convert 'ingredients' value in string format to array
            let ingredients = value.ingredients.replace(/""/g, '"');
            let matchArray = ingredients.match(/'[^']*'|"[^"]*"/g);
            let ingredientsArray = matchArray.map(match => match.slice(1, -1));

            ingredientsArray.forEach(function (ingredient) {
                child += `<p>* ${ingredient}</p>`;
            });

            child +=
                `           </div>            
                            <div>
                                <strong>Instructions</strong>
                                <p>${value.instructions}</p>
                            </div>
                        </div>
                        <div>
                            <a href="javascript:void(0)" class="download_btn" id="download_${value.id}">Download Recipe File</a>
                            <a href="javascript:void(0)" class="view_btn" id="view_${value.id}">View Recipe</a>
                        </div>                        
                    </div>
                </li>`;

            $('#list').append(child);
        });
        /**
         * After displaying the search results, add additional functions 
         * (Because the work to encode the buffer needs to be done in 'Main')
         */
        displayRcpImage();
        setDownloadButton();
        setRcpViewButton();
    } catch (e) {
        /**
         * Catch errors when there is no search result 
         * so that only empty() is executed when there is no search result.
         */
        console.log('displaySearchResult: catch' + e);
    }
}

/**
 * A function that requests images based on search results
 */
function displayRcpImage() {
    let idList = $('.link_img');
    $.each(idList, (key, value) => {
        let rcpId = value.id.substring(4, value.id.length);
        window.apis.req_rcpImageSrc(rcpId); // Request images to the main process
    });
}

/**
 * A listener that receives a response to images request 
 * and displays the images.
 */
window.apis.resp_rcpImageSrc((event, imageResult) =>  {
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
        value.onclick= () => {
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
        value.onclick= () => {
            let rcpId = value.id.substring(5, value.id.length);
            // Request decompressed zip data from the main process.
            window.apis.req_rcpViewByDecompress(rcpId); 
        }
    });        
}

/**
 * A function that calculate the number of pages and display page buttons
 * @param {*} pageNum 
 */
function displayPagination(pageNum) {
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
            $("#pg_" + idToken).css("color", "red");

        } else {
            $("#pg_" + idToken).show();
            $('#pg_' + idToken).html(i);
            $("#pg_" + idToken).css("color", "black");

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


// paging envent
$('.pg_list').on('click', function () {
    requestSearch(gKeyword, gColumn, $(this).html());
});

$('#pg_first').on('click', function () {
    requestSearch(gKeyword, gColumn, 1);
});

$('#pg_next').on('click', function () {
    requestSearch(gKeyword, gColumn, 1 + (gRange * 10));
});

$('#pg_prev').on('click', function () {
    requestSearch(gKeyword, gColumn, (gRange - 1) * 10);
});

$('#pg_last').on('click', function () {
    requestSearch(gKeyword, gColumn, gLastPage);
});