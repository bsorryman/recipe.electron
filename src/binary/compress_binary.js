const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

export default class CompressBinary {
    db = null;

    constructor(db) {
        this.db = db;
    }
    
    async InsertBinaryToSqliteDB() {
        const maxId = this.db.selectMaxId()[0].max_id;
        console.log('maxId: ' + maxId);

        let id = 0;
        while(id <= maxId) {
            let recipe = this.db.selectRecipeById(id)[0];

            if (recipe === undefined) {
                console.log('This is undefined.');
                id++;
                continue;
            }

            let title = recipe.title;
            
            let ingredients = recipe.ingredients.replace(/""/g, '"');
            let matchArray = ingredients.match(/'[^']*'|"[^"]*"/g);
            let ingredientsArray = matchArray.map(match => match.slice(1, -1));  

            let instructions = recipe.instructions;
            let imageName = recipe.image_name;
    
            let txtString = `Title: ${title} `;
            txtString += `\n\nIngredients: `;
    
            ingredientsArray.forEach(function(ingredient) {
                txtString += `\n* ${ingredient}`;
            });
    
            txtString += `\n\nInstrunctions: \n${instructions}`;
    
            let txtData = Buffer.from(txtString, 'utf-8');
    
            let imagePath = 'D://db/recipe db/Food Images/' + imageName + '.jpg';
            let zipBuffer;
    
            let archive = archiver('zip', { zlib: { level: 9 } });
            
            archive.append(txtData, { name: title + '_recipe.txt' });            
            archive.file(imagePath, { name: imageName + '.jpg' });
            await this.finalizeArchive(archive);
            zipBuffer = archive.read();
    
            this.db.updateRecipeZipFileById(zipBuffer, id);
            console.log(title + ' is completed.');
            
            /*
            let zipPath = 'D://db/recipe db/recipe zip/'+title+'.zip';
            fs.writeFile(zipPath, zipBuffer, 'binary', function(err) {
                if (err) {
                    console.log('Fail !! ');
                } else {
                    console.log('File written successfully: ' + zipPath);
                }
            });
            */

            id++;
        }
    }

    async finalizeArchive(archive) {
        return new Promise((resolve, reject) => {
            archive.on('finish', resolve);
            archive.on('error', reject);
            archive.finalize();
        });
    }
}