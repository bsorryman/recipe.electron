import DatabaseConstructor, { Database } from 'better-sqlite3';
const log = require('electron-log');
const fs = require('fs');

export default class RcpSqliteDB {
  db = null;
  dbPath;
  is_open = false;

  constructor(_dbPath) {
    this.dbPath = _dbPath;
  }

  open() {
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

  selectMaxId() {
    if (this.db == null)
      return '';

    const result = this.db.prepare(
      `
      SELECT MAX(id) AS max_id
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

  selectRcpByKeyword(keyword, column, offset) {
    if (this.db == null)
      return '';

    if (column == 'all') {
      column = 'tb_fts_recipe'
    }

    let searchQuery;
    let totalQuery;

    if (keyword == null || keyword == '') {
      searchQuery =       
        `
        SELECT id, title, ingredients, instructions
        FROM tb_fts_recipe
        LIMIT ${offset}, 10
        `;      

      totalQuery = 
        `
        SELECT COUNT(*) AS total
        FROM tb_fts_recipe
        `;      
    } else {
      searchQuery =       
        `
        SELECT id, title
        FROM tb_fts_recipe
        WHERE ${column} MATCH '${keyword}'
        ORDER BY bm25(tb_fts_recipe, 10.0, 3.0)
        LIMIT ${offset}, 10
        `;

      totalQuery = 
        `
        SELECT COUNT(*) AS total
        FROM tb_fts_recipe
        WHERE ${column} MATCH '${keyword}'
        `;

    }

    const resultTable = this.db.prepare(searchQuery).all();
    const resultTotal = this.db.prepare(totalQuery).all();

    const result = { resultTable, resultTotal }

    return result;
  }

  selectRcpImageFileById(id) {
    if (this.db == null)
      return '';

    const result = this.db.prepare(
      `
      SELECT id, image_file
      FROM tb_recipe
      WHERE id = ${id} 
      `
    ).all();

    return result;
  }

  selectRcpZipFileById(id) {
    if (this.db == null)
      return '';

    const result = this.db.prepare(
      `
      SELECT id, title, ingredients, instructions, image_name, recipe_zip_file
      FROM tb_recipe
      WHERE id = ${id} 
      `
    ).all();

    return result;
  }

  selectRecipeByIdAndKeyword(keyword, id) {
    if (this.db == null)
      return '';

    const result = this.db.prepare(
      `
      SELECT a.id, b.title as title_no_mark, a.title, a.ingredients, a.instructions, b.image_name, b.image_file
      FROM (
        SELECT id,
          highlight(tb_fts_recipe, 0, '<mark>', '</mark>') AS title,
          highlight(tb_fts_recipe, 1, '<mark>', '</mark>') AS ingredients,
          highlight(tb_fts_recipe, 2, '<mark>', '</mark>') AS instructions
        FROM tb_fts_recipe
        WHERE tb_fts_recipe MATCH '${keyword}'
          AND id = ${id}
      ) a INNER JOIN (
        SELECT id, title, image_name, image_file
        FROM tb_recipe
        WHERE id = ${id}
      ) b ON a.id = b.id;
      `
    ).all();

    return result;
  }  
}