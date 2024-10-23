// src/db/projectDb.js
const db = require('./database');

function initProjectTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      organization_id INTEGER,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (organization_id) REFERENCES organizations (id)
    )
  `);
}

module.exports = {
  initProjectTable,
  // Add any raw queries if needed
};
