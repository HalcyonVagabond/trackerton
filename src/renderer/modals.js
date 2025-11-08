import { loadOrganizations, loadProjects, loadTasks } from './dataLoader.js';

export function initializeModal() {
  const modal = document.getElementById('genericModal');
  const input = document.getElementById('genericInput');
  const saveBtn = document.getElementById('genericSaveBtn');
  const cancelBtn = document.getElementById('genericCancelBtn');
  const modalTitle = document.getElementById('modalTitle');

  let currentMode = 'add'; // 'add' or 'edit'
  let currentItemId = null;

  function showModal(type, mode = 'add', itemId = null, currentName = '') {
    if (mode === 'add') {
      if (type !== 'organization' && !document.getElementById('organization').value) {
        alert('Please select an organization first.');
        return;
      }
      if (type === 'task' && !document.getElementById('project').value) {
        alert('Please select a project first.');
        return;
      }
    }

    currentMode = mode;
    currentItemId = itemId;
    modal.dataset.type = type;
    
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    modalTitle.textContent = mode === 'add' ? `Add ${typeLabel}` : `Edit ${typeLabel}`;
    input.value = mode === 'edit' ? currentName : '';
    input.placeholder = `${typeLabel} Name`;
    
    modal.classList.remove('hidden');
    input.focus();
  }

  function getSaveFunction(type, mode) {
    if (mode === 'edit') {
      switch (type) {
        case 'organization':
          return (id, name) => window.electronAPI.updateOrganization(id, name);
        case 'project':
          return (id, name) => window.electronAPI.updateProject(id, name);
        case 'task':
          return (id, name) => window.electronAPI.updateTask(id, name);
      }
    } else {
      switch (type) {
        case 'organization':
          return (name) => window.electronAPI.addOrganization(name);
        case 'project':
          return (name, parentId) => window.electronAPI.addProject(name, parentId);
        case 'task':
          return (name, parentId) => window.electronAPI.addTask(name, parentId);
      }
    }
  }

  function getLoadFunction(type) {
    switch (type) {
      case 'organization':
        return loadOrganizations;
      case 'project':
        return loadProjects;
      case 'task':
        return loadTasks;
    }
  }

  saveBtn.addEventListener('click', async () => {
    const name = input.value.trim();
    const type = modal.dataset.type;
    
    if (!name) {
      alert('Please enter a name.');
      return;
    }

    const saveFunction = getSaveFunction(type, currentMode);
    
    if (currentMode === 'edit') {
      await saveFunction(currentItemId, name);
      input.value = '';
      modal.classList.add('hidden');
      
      // Reload the appropriate list
      if (type === 'organization') {
        await loadOrganizations();
        document.getElementById('organization').value = currentItemId;
      } else if (type === 'project') {
        const orgId = document.getElementById('organization').value;
        await loadProjects(orgId);
        document.getElementById('project').value = currentItemId;
      } else if (type === 'task') {
        const projId = document.getElementById('project').value;
        await loadTasks(projId);
        document.getElementById('task').value = currentItemId;
      }
    } else {
      const parentId = type === 'project' ? document.getElementById('organization').value : document.getElementById('project').value;
      if (type === 'organization' || parentId) {
        const newItem = await saveFunction(name, parentId);
        input.value = '';
        modal.classList.add('hidden');
        const loadFunction = getLoadFunction(type);
        await loadFunction(parentId);
        const select = document.getElementById(type);
        select.value = newItem.id;
        select.dispatchEvent(new Event('change'));
      }
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Add button handlers
  document.getElementById('addOrganizationBtn').addEventListener('click', () => showModal('organization', 'add'));
  document.getElementById('addProjectBtn').addEventListener('click', () => showModal('project', 'add'));
  document.getElementById('addTaskBtn').addEventListener('click', () => showModal('task', 'add'));

  // Edit button handlers
  document.getElementById('editOrganizationBtn').addEventListener('click', () => {
    const select = document.getElementById('organization');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      showModal('organization', 'edit', select.value, selectedOption.textContent);
    }
  });

  document.getElementById('editProjectBtn').addEventListener('click', () => {
    const select = document.getElementById('project');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      showModal('project', 'edit', select.value, selectedOption.textContent);
    }
  });

  document.getElementById('editTaskBtn').addEventListener('click', () => {
    const select = document.getElementById('task');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      showModal('task', 'edit', select.value, selectedOption.textContent);
    }
  });

  // Delete button handlers with cascading
  document.getElementById('deleteOrganizationBtn').addEventListener('click', async () => {
    const select = document.getElementById('organization');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      const confirmed = confirm(
        `Delete "${selectedOption.textContent}"?\n\nThis will also delete all projects and tasks within this organization.`
      );
      if (confirmed) {
        await window.electronAPI.deleteOrganization(select.value);
        await loadOrganizations();
        document.getElementById('project').innerHTML = '<option value="">Select Project</option>';
        document.getElementById('task').innerHTML = '<option value="">Select Task</option>';
      }
    }
  });

  document.getElementById('deleteProjectBtn').addEventListener('click', async () => {
    const select = document.getElementById('project');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      const confirmed = confirm(
        `Delete "${selectedOption.textContent}"?\n\nThis will also delete all tasks within this project.`
      );
      if (confirmed) {
        await window.electronAPI.deleteProject(select.value);
        const orgId = document.getElementById('organization').value;
        await loadProjects(orgId);
        document.getElementById('task').innerHTML = '<option value="">Select Task</option>';
      }
    }
  });

  document.getElementById('deleteTaskBtn').addEventListener('click', async () => {
    const select = document.getElementById('task');
    const selectedOption = select.options[select.selectedIndex];
    if (select.value && selectedOption) {
      const confirmed = confirm(`Delete "${selectedOption.textContent}"?`);
      if (confirmed) {
        await window.electronAPI.deleteTask(select.value);
        const projId = document.getElementById('project').value;
        await loadTasks(projId);
      }
    }
  });
}
