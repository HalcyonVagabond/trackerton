const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'trackerton.db');
const db = new sqlite3.Database(dbPath);

// Initialize the database schema
db.serialize(() => {
  // Organizations Table
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  // Projects Table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    organization_id INTEGER,
    FOREIGN KEY (organization_id) REFERENCES organizations (id)
  )`);

  // Tasks Table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    project_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects (id)
  )`);

  // Time Entries Table
  db.run(`CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    duration INTEGER,
    timestamp TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks (id)
  )`);
});

// Export database functions
module.exports = {
  db,
  // Organization functions
  getOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  // Project functions
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  // Task functions
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  // Time Entry functions
  addTimeEntry,
  getTimeEntries,
};

// Organization functions
function getOrganizations(callback) {
  db.all(`SELECT * FROM organizations`, [], (err, rows) => {
    callback(err, rows);
  });
}

function addOrganization(name, callback) {
  db.run(`INSERT INTO organizations (name) VALUES (?)`, [name], function (err) {
    callback(err, { id: this.lastID, name });
  });
}

function updateOrganization(id, name, callback) {
  db.run(`UPDATE organizations SET name = ? WHERE id = ?`, [name, id], (err) => {
    callback(err);
  });
}

function deleteOrganization(id, callback) {
  db.run(`DELETE FROM organizations WHERE id = ?`, [id], (err) => {
    callback(err);
  });
}

// Project functions
function getProjects(organizationId, callback) {
  db.all(
    `SELECT * FROM projects WHERE organization_id = ?`,
    [organizationId],
    (err, rows) => {
      callback(err, rows);
    }
  );
}

function addProject(name, organizationId, callback) {
  db.run(
    `INSERT INTO projects (name, organization_id) VALUES (?, ?)`,
    [name, organizationId],
    function (err) {
      callback(err, { id: this.lastID, name, organization_id: organizationId });
    }
  );
}

function updateProject(id, name, callback) {
  db.run(`UPDATE projects SET name = ? WHERE id = ?`, [name, id], (err) => {
    callback(err);
  });
}

function deleteProject(id, callback) {
  db.run(`DELETE FROM projects WHERE id = ?`, [id], (err) => {
    callback(err);
  });
}

// Task functions
function getTasks(projectId, callback) {
  db.all(
    `SELECT * FROM tasks WHERE project_id = ?`,
    [projectId],
    (err, rows) => {
      callback(err, rows);
    }
  );
}

function addTask(name, projectId, callback) {
  db.run(
    `INSERT INTO tasks (name, project_id) VALUES (?, ?)`,
    [name, projectId],
    function (err) {
      callback(err, { id: this.lastID, name, project_id: projectId });
    }
  );
}

function updateTask(id, name, callback) {
  db.run(`UPDATE tasks SET name = ? WHERE id = ?`, [name, id], (err) => {
    callback(err);
  });
}

function deleteTask(id, callback) {
  db.run(`DELETE FROM tasks WHERE id = ?`, [id], (err) => {
    callback(err);
  });
}

// Time Entry functions
function addTimeEntry(taskId, duration, timestamp, callback) {
  db.run(
    `INSERT INTO time_entries (task_id, duration, timestamp) VALUES (?, ?, ?)`,
    [taskId, duration, timestamp],
    function (err) {
      callback(err, { id: this.lastID, task_id: taskId, duration, timestamp });
    }
  );
}

function getTimeEntries(callback) {
  const query = `
    SELECT te.*, t.name AS task_name, p.name AS project_name, o.name AS organization_name
    FROM time_entries te
    JOIN tasks t ON te.task_id = t.id
    JOIN projects p ON t.project_id = p.id
    JOIN organizations o ON p.organization_id = o.id
  `;
  db.all(query, [], (err, rows) => {
    callback(err, rows);
  });
}
