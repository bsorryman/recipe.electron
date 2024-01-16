const path = require('path');
const fs = require('fs');

export default class ImageBinary {
    db = null;

    constructor(db) {
        this.db = db;
    }

    InsertBinaryToSqliteDB() {
        const totalRecipe = this.db.selectTotalRecipe()[0].total;
        console.log('totalRecipe: ' + totalRecipe);

        let id = 0;
        while(true) {
            if (id==totalRecipe) {
                break;
            }
            let imageName = this.db.selectImageNameById(id)[0].image_name;
            console.log(id+' image: ' + imageName);
            let imagePath = path.resolve('D://db/recipe db/Food Images/' + imageName + '.jpg');
            console.log('image path: ' + imagePath);
            let existImage = fs.existsSync(imagePath);
            console.log('Exist Image: ' + existImage);

            if (existImage) {
                let imageBuffer = fs.readFileSync(imagePath);

                this.db.updateImageFileByImageName(imageBuffer, imageName);
                console.log('makeImageToBinary complete');
            
            } else {
                console.log('There is not this image: ' + imageName);
            }
            id++;

        }
    }
    
}