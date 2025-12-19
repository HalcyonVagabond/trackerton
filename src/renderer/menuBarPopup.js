// Menu bar popup renderer for quick access controls

const timerDisplay = document.getElementById('timerDisplay');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const currentTaskDisplay = document.getElementById('currentTask');
const openMainWindowBtn = document.getElementById('openMainWindow');
const openMainWindowHeaderBtn = document.getElementById('openMainWindowHeader');
const taskContext = document.getElementById('taskContext');
const statusBadge = document.getElementById('statusBadge');
const controlGroup = document.getElementById('controlGroup');
const noTaskPrompt = document.getElementById('noTaskPrompt');
const viewTaskDetailsBtn = document.getElementById('viewTaskDetails');

let currentStatus = 'idle';
let lastKnownState = null;

const STATUS_CLASSES = {
  running: 'status-running',
  paused: 'status-paused',
  idle: 'status-idle',
};

function updateStatusBadge(status = 'idle') {
  if (!statusBadge) return;
  let label = 'Idle';
  if (status === 'running') label = 'Running';
  else if (status === 'paused') label = 'Paused';

  statusBadge.textContent = label;

  Object.values(STATUS_CLASSES).forEach((cls) => {
    statusBadge.classList.remove(cls);
  });

  statusBadge.classList.add(STATUS_CLASSES[status] || STATUS_CLASSES.idle);
}

function applyTimerState(state = {}) {
  lastKnownState = state;
  currentStatus = state.status || 'idle';

  const hasTask = Boolean(state?.task?.id);
  const displayTime = state?.display || '00:00:00';
  const taskLabel = hasTask
    ? state.task.projectName
      ? `${state.task.name} · ${state.task.projectName}`
      : state.task.name
    : 'Select a task in the main window';

  timerDisplay.textContent = displayTime;
  currentTaskDisplay.textContent = taskLabel;
  if (taskContext) {
    const contextParts = [];
    if (hasTask && state.task.organizationName) {
      contextParts.push(state.task.organizationName);
    }
    if (hasTask && state.task.projectName) {
      contextParts.push(state.task.projectName);
    }
    taskContext.textContent = contextParts.join(' • ');
  }

  const badgeStatus = currentStatus === 'running'
    ? 'running'
    : currentStatus === 'paused'
      ? 'paused'
      : elapsedStateToStatus();
  updateStatusBadge(badgeStatus);

  if (controlGroup) {
    if (hasTask) {
      controlGroup.classList.add('is-visible');
      controlGroup.classList.remove('hidden');
    } else {
      controlGroup.classList.remove('is-visible');
      controlGroup.classList.add('hidden');
    }
  }
  if (noTaskPrompt) {
    noTaskPrompt.classList.toggle('hidden', hasTask);
  }

  if (currentStatus === 'running') {
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
  } else {
    stopButton.classList.add('hidden');
    startButton.classList.remove('hidden');
  }

  startButton.textContent = hasTask && state.elapsedTime > 0 ? 'Resume' : 'Start';
  startButton.disabled = !hasTask;
  stopButton.disabled = currentStatus !== 'running';
}

function elapsedStateToStatus() {
  if (!lastKnownState) return 'idle';
  if ((lastKnownState.elapsedTime || 0) > 0) {
    return 'paused';
  }
  return 'idle';
}

function requestStartOrResume() {
  window.electronAPI.sendTimerCommand('start');
}

function requestStop() {
  window.electronAPI.sendTimerCommand('stop');
}

startButton.addEventListener('click', () => {
  if (!lastKnownState?.task) {
    window.electronAPI.openMainWindow();
    return;
  }
  requestStartOrResume();
});

stopButton.addEventListener('click', () => {
  requestStop();
});

if (openMainWindowBtn) {
  openMainWindowBtn.addEventListener('click', () => {
    window.electronAPI.openMainWindow();
  });
}

if (openMainWindowHeaderBtn) {
  openMainWindowHeaderBtn.addEventListener('click', () => {
    window.electronAPI.openMainWindow();
  });
}

if (viewTaskDetailsBtn) {
  viewTaskDetailsBtn.addEventListener('click', () => {
    window.electronAPI.openMainWindow();
  });
}

window.electronAPI.onTimerState((state) => {
  applyTimerState(state);
});

(async () => {
  const initialState = await window.electronAPI.requestTimerState();
  applyTimerState(initialState);
})();
