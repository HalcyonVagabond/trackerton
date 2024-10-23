// src/db/timeEntryDb.js
const db = require('./database');

function initTimeEntryTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      duration INTEGER,
      timestamp TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);
}

module.exports = {
  initTimeEntryTable,
  // Add any raw queries if needed
};
