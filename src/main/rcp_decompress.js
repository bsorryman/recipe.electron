import { app, nativeImage } from 'electron';

const path = require('path');
const fs = require('fs');
const extract = require('extract-zip');

export default class RcpDecompress {
  constructor() {

  }

  /**
   * A functions that decompress a compressed file into a target path.
   * @param {*} compressedFilePath 
   * @param {*} outputDirectoryPath 
   * @param {*} onComplete 
   */
  extractZip(compressedFilePath, outputDirectoryPath, onComplete) {
    extract(compressedFilePath, { dir: outputDirectoryPath })
      .then(() => {
        console.log('Finished decompressing the file');

        onComplete();
      })
      .catch((err) => {
        console.error('Error decompressing a compressed file:', err);
      });;
  }

  /**
   * Aunctions that write the compressed file buffer data to a file and call the decompress function
   * @param {*} zipFileResult 
   * @param {*} viewRcpDetail 
   * @param {*} modalWindow 
   * @returns 
   */
  decompressRecipeZipFile(zipFileResult, viewRcpDetail, modalWindow) {
    // zip file reuslt
    let title = zipFileResult.title;
    let imageName = zipFileResult.image_name;
    let zipBuffer = zipFileResult.recipe_zip_file;

    // temp file path
    const tempPath = app.getPath('temp');
    let zipFilePath = path.join(tempPath, title + '.zip');
    let txtFilePath = path.join(tempPath, title + '_recipe.txt');
    let jpgFilePath = path.join(tempPath, imageName + '.jpg');

    // create zip file from buffer
    fs.writeFileSync(zipFilePath, zipBuffer);

    this.extractZip(zipFilePath, tempPath, () => {
      let rcpString = fs.readFileSync(txtFilePath);
      let rcpImageSrc = nativeImage.createFromPath(jpgFilePath).toDataURL();

      viewRcpDetail(title, rcpImageSrc, rcpString, modalWindow);

      // delete temp file
      fs.unlink(zipFilePath, (err) => {

      });

      fs.unlink(txtFilePath, (err) => {

      });

      fs.unlink(jpgFilePath, (err) => {

      });
    });

    return true;
  }
}