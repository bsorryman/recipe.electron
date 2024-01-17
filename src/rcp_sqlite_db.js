import DatabaseConstructor, {Database} from 'better-sqlite3';
const log = require('electron-log');
const fs = require('fs');
import RcpSetting from './setting';

export default class RcpSqliteDB {
    db = null;
    dbPath = '';
    is_open = false;

    constructor() {
    }

    open() {
        console.log('Node env: ' + process.env.NODE_ENV);

        if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'stage') {
            this.dbPath = RcpSetting.getDatabasePath();
        } else {
            this.dbPath = RcpSetting.getDatabasePath();
        }
       
        if (process.env.NODE_ENV == 'stage') {
            log.debug(dbPath);
        }
        
        let existDb = fs.existsSync(this.dbPath);

        if (existDb) {
            this.db = new DatabaseConstructor(this.dbPath);

            this.db.prepare("SELECT * FROM tb_recipe LIMIT 1").all();

            this.is_open = true;
        }

        console.log('db is open: ' + this.dbPath);

        return this.is_open;
    }

    isOpen() {
        return this.is_open;
    }

    close() {
        if (this.db != null)
           this.db.close();
    }

    selectTotalRecipe() {
        if (this.db == null)
            return '';

        const result = this.db.prepare(
            `
            SELECT COUNT(*) AS total
            FROM tb_recipe
            `
        ).all();

        return result;            
    }

    selectImageNameById(id) {
        if (this.db == null)
            return '';

        const result = this.db.prepare(
            `
            SELECT image_name
            FROM tb_recipe
            WHERE id = ${id} 
            `
        ).all();

        return result;        
    }

    updateImageFileByImageName(imageBuffer, imageName) {
        if (this.db == null)
            return '';

        const stmt = this.db.prepare(
            `
            UPDATE tb_recipe SET image_file = ?
            WHERE image_name = ?
            `
        );

        stmt.run(imageBuffer, imageName);
    }

    selectRecipeById(id) {
        if (this.db == null)
            return '';

        const result = this.db.prepare(
            `
            SELECT id, title, ingredients, instructions, image_name, image_file
            FROM tb_recipe
            WHERE id = ${id} 
            `
        ).all();

        return result;             
    }

    updateRecipeZipFileById(zipBuffer, id) {
        if (this.db == null)
            return '';

        const stmt = this.db.prepare(
            `
            UPDATE tb_recipe SET recipe_zip_file = ?
            WHERE id = ?
            `
        );

        stmt.run(zipBuffer, id);
        console.log('update completed: ' + id);
    }
}