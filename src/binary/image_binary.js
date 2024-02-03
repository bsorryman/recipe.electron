const path = require('path');
const fs = require('fs');

export default class ImageBinary {
  db = null;

  constructor(db) {
    this.db = db;
  }

  InsertBinaryToSqliteDB() {
    const maxId = this.db.selectMaxId()[0].max_id;
    console.log('maxId: ' + maxId);

    let id = 0;
    while (id <= maxId) {
      let imageName = this.db.selectImageNameById(id)[0];

      if (imageName === undefined) {
        console.log('This is undefined.');
        id++;
        continue;
      }

      imageName = imageName.image_name;

      let imagePath = path.resolve('D://db/recipe db/Food Images/' + imageName + '.jpg');
      let existImage = fs.existsSync(imagePath);

      if (existImage) {
        let imageBuffer = fs.readFileSync(imagePath);

        this.db.updateImageFileByImageName(imageBuffer, imageName);
        console.log('update completed: ' + id);
        console.log(imageName + 'is completed: ' + imagePath);

      } else {
        console.log('There is not this image: ' + imageName);
      }
      id++;

    }
  }

}