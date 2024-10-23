const { initOrganizationTable } = require('./organizationDb');
const { initProjectTable } = require('./projectDb');
const { initTaskTable } = require('./taskDb');
const { initTimeEntryTable } = require('./timeEntryDb');

function initializeDatabase() {
  initOrganizationTable();
  initProjectTable();
  initTaskTable();
  initTimeEntryTable();
}

module.exports = initializeDatabase;
