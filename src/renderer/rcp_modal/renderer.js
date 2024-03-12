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

window.$ = window.jQuery = require('jquery');

import { Titlebar } from '../title_bar'

window.onload = () => {
  new Titlebar('modal');
}

/**
 * A listener that receives decompressed recipe data (Image, All data) 
 * and displays it in a modal window
 */
window.apis.resp_rcpViewByDecompress((event, viewResult)=>{
  $('#title').html(viewResult.rcpDetail.title);
  $('#titleBar').html(viewResult.rcpDetail.title+" recipe");
  $('#rcp_image').attr('src', viewResult.rcpImageSrc);

  let ingredients = viewResult.rcpDetail.ingredients.replace(/""/g, '"');
  let matchArray = ingredients.match(/'[^']*'|"[^"]*"/g);
  let ingredientsArray = matchArray.map(match => match.slice(1, -1));
  let ingredientsString = '';
  ingredientsArray.forEach(function (ingredient) {
    ingredientsString += `* ${ingredient} <br>`;
  });

  $('#ingredients').html(ingredientsString);

  let instructionsString = viewResult.rcpDetail.instructions.replace(/\n/g, '<br>');;

  $('#instructions').html(instructionsString);

})