// src/db/organizationDb.js
const db = require('./database');

function initOrganizationTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      created_at TEXT,
      updated_at TEXT
    )
  `);
}

module.exports = {
  initOrganizationTable,
  // Add any raw queries if needed
};
