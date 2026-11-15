import Database  from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

class AppDatabase {

    constructor() {

        const dbPath = path.join(app.getPath('userData'), 'clippy.db');

        this.db = new Database(dbPath);

        this.db.pragma('journal_mode = WAL');

        this.setupDatabase();

    }


    setupDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS clippings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                Category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database setup complete.');
    }

    addDataToClippings(category, title, description) {
        const stmt = this.db.prepare(`
            INSERT INTO clippings (Category, title, description)
            VALUES (?, ?, ?)
        `);
        stmt.run(category, title, description);
        console.log('Data added to clippings.');
    }


    deleteDataFromClippings(id) {
        const stmt = this.db.prepare(`
            DELETE FROM clippings WHERE id = ?
            `);
        stmt.run(id);
        console.log('Data deleted from clippings.');

    }


    getAllClippings(category) {
        const stmt = this.db.prepare(`
            SELECT * FROM clippings WHERE Category = ?
        `);
        return stmt.all(category);
    }

    close() {
        this.db.close();
        console.log('Database connection closed.');
    }

}

export default AppDatabase;