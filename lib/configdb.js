const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
});

// SAVE config
function setConfig(key, value) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO config (key, value)
             VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [key, JSON.stringify(value)],
            err => {
                if (err) reject(err);
                else resolve(true);
            }
        );
    });
}

// READ config
function getConfig(key, defaultValue = null) {
    return new Promise(resolve => {
        db.get(
            `SELECT value FROM config WHERE key = ?`,
            [key],
            (err, row) => {
                if (row) resolve(JSON.parse(row.value));
                else resolve(defaultValue);
            }
        );
    });
}

module.exports = { setConfig, getConfig };
