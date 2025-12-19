import { timeToString } from '../utils/helpers.js';
import { loadAggregatedData } from './dataLoader.js';

let timerInterval;
let startTime;
let elapsedTime = 0;
let previousElapsedTime = 0;
let currentTaskId = null;
let timerStatus = 'idle';
let lastBroadcastAt = 0;
const BROADCAST_INTERVAL = 500;
let timerState = {
  status: 'idle',
  elapsedTime: 0,
  display: timeToString(0),
  task: null,
  updatedAt: Date.now(),
  source: 'renderer',
};

// Use getters to always get fresh DOM references
const buttons = {
  get start() { return document.getElementById('startButton'); },
  get stop() { return document.getElementById('stopButton'); },
  get resume() { return document.getElementById('resumeButton'); },
};
const getTimerDisplay = () => document.getElementById('timerDisplay');
const selects = {
  get task() { return document.getElementById('task'); },
  get project() { return document.getElementById('project'); },
  get organization() { return document.getElementById('organization'); },
};

function getOptionLabel(select) {
  if (!select) return '';
  const option = select.options[select.selectedIndex];
  return option ? option.textContent.trim() : '';
}

function refreshTaskInfo() {
  const taskId = selects.task?.value;
  if (!taskId) {
    timerState.task = null;
    currentTaskId = null;
    return;
  }

  timerState.task = {
    id: taskId,
    name: getOptionLabel(selects.task),
    projectId: selects.project?.value || null,
    projectName: getOptionLabel(selects.project),
    organizationId: selects.organization?.value || null,
    organizationName: getOptionLabel(selects.organization),
  };
  currentTaskId = taskId;
}

function setTimerStatus(status) {
  timerStatus = status;
  timerState.status = status;
}

function applyStatusButtons() {
  if (timerStatus === 'running') {
    updateButtonVisibility({ start: false, stop: true, resume: false });
  } else if (elapsedTime > 0) {
    updateButtonVisibility({ start: false, stop: false, resume: true });
  } else {
    updateButtonVisibility({ start: true, stop: false, resume: false });
  }
}

function broadcastTimerState(force = false) {
  if (!window?.electronAPI?.updateTimerState) return;
  const now = Date.now();
  if (!force && now - lastBroadcastAt < BROADCAST_INTERVAL) return;

  refreshTaskInfo();

  timerState = {
    ...timerState,
    status: timerStatus,
    elapsedTime,
    display: timeToString(elapsedTime),
    updatedAt: now,
    source: 'renderer',
  };

  lastBroadcastAt = now;
  window.electronAPI.updateTimerState(timerState);
}

function applyExternalState(state = {}) {
  if (!state) return;
  const incomingUpdatedAt = state.updatedAt ?? 0;
  if (incomingUpdatedAt <= timerState.updatedAt) return;

  timerState = {
    ...timerState,
    ...state,
    source: 'renderer',
  };

  timerStatus = timerState.status || 'idle';
  elapsedTime = timerState.elapsedTime || 0;
  previousElapsedTime = elapsedTime;
  refreshTaskInfo();

  getTimerDisplay().textContent = timerState.display || timeToString(elapsedTime);

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (timerStatus === 'running') {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  applyStatusButtons();
}

export function startTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  updateButtonVisibility({ start: false, stop: true, resume: false });
  setTimerStatus('running');
  broadcastTimerState(true);
}

export function stopTimer() {
  clearInterval(timerInterval);
  saveTimeEntry();
  resetTimer();

  updateButtonVisibility({ start: false, stop: false, resume: true });
  setTimerStatus(elapsedTime > 0 ? 'paused' : 'idle');
  broadcastTimerState(true);
}

export function resumeTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  updateButtonVisibility({ start: false, stop: true, resume: false });
  setTimerStatus('running');
  broadcastTimerState(true);
}

export function updateButtonVisibility({ start, stop, resume }) {
  buttons.start.classList.toggle('hidden', !start);
  buttons.start.disabled = !start;
  buttons.stop.classList.toggle('hidden', !stop);
  buttons.stop.disabled = !stop;
  buttons.resume.classList.toggle('hidden', !resume);
  buttons.resume.disabled = !resume;
}

function updateTimerDisplay() {
  elapsedTime = Date.now() - startTime;
  getTimerDisplay().textContent = timeToString(elapsedTime);
  broadcastTimerState();
}

function resetTimer() {
  clearInterval(timerInterval);
  const hasElapsedTime = elapsedTime > 0;
  updateButtonVisibility({ start: !hasElapsedTime, stop: false, resume: hasElapsedTime });
  getTimerDisplay().textContent = timeToString(elapsedTime);
  setTimerStatus(hasElapsedTime ? 'paused' : 'idle');
  broadcastTimerState(true);
}

export async function saveTimeEntry() {
  if (!currentTaskId || elapsedTime === previousElapsedTime) return;

  const timeEntry = {
    taskId: currentTaskId,
    duration: elapsedTime - previousElapsedTime,
    timestamp: new Date().toISOString(),
  };

  await window.electronAPI.saveTimeEntry(timeEntry);
  previousElapsedTime = elapsedTime;
  loadAggregatedData();
  broadcastTimerState(true);
}

function validateSelections() {
  if (!selects.organization.value) {
    alert('Please select an organization.');
    return false;
  }
  if (!selects.project.value) {
    alert('Please select a project.');
    return false;
  }
  if (!selects.task.value) {
    alert('Please select a task.');
    return false;
  }
  currentTaskId = selects.task.value;
  refreshTaskInfo();
  broadcastTimerState(true);
  return true;
}

async function handleSelectionChange() {
  await saveTimeEntry();
  elapsedTime = 0;
  previousElapsedTime = 0;
  resetTimer();
  hideAllButtons();
  refreshTaskInfo();
  broadcastTimerState(true);
}

function hideAllButtons() {
  updateButtonVisibility({ start: false, stop: false, resume: false });
}

selects.project.addEventListener('change', handleSelectionChange);
selects.organization.addEventListener('change', handleSelectionChange);

export async function handleTaskSelection() {
  await handleSelectionChange();
  refreshTaskInfo();
  currentTaskId = selects.task.value;
  if (currentTaskId) {
    const totalDuration = await window.electronAPI.getTotalDurationByTask(currentTaskId);
    elapsedTime = totalDuration || 0;
    previousElapsedTime = elapsedTime;
    getTimerDisplay().textContent = timeToString(elapsedTime);
    updateButtonVisibility({ start: elapsedTime === 0, stop: false, resume: elapsedTime > 0 });
    setTimerStatus(elapsedTime > 0 ? 'paused' : 'idle');
    broadcastTimerState(true);
  } else {
    resetTimer();
  }
}

export function initializeTimerSync() {
  refreshTaskInfo();
  broadcastTimerState(true);

  if (!window?.electronAPI) return;

  window.electronAPI.onTimerCommand?.((command) => {
    switch (command) {
      case 'start':
        if (!currentTaskId) {
          window.electronAPI.openMainWindow?.();
          return;
        }
        if (timerStatus === 'running') return;
        if (elapsedTime > 0) {
          resumeTimer();
        } else {
          startTimer();
        }
        break;
      case 'stop':
        if (timerStatus === 'running') {
          stopTimer();
        }
        break;
      default:
        break;
    }
  });

  window.electronAPI.onTimerState?.((state) => {
    if (!state || state.source === 'renderer') return;
    applyExternalState(state);
  });

  window.electronAPI.requestTimerState?.().then((state) => {
    if (state && state.source !== 'renderer' && (state.updatedAt ?? 0) > (timerState.updatedAt ?? 0)) {
      applyExternalState(state);
    } else {
      broadcastTimerState(true);
    }
  });
}
