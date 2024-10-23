// src/renderer/display.js
import { timeToString } from '../utils/helpers.js';

export function aggregateTime(entries) {
  const aggregation = {};

  entries.forEach((entry) => {
    const key = `${entry.organization_name} - ${entry.project_name} - ${entry.task_name}`;
    if (!aggregation[key]) {
      aggregation[key] = 0;
    }
    aggregation[key] += entry.duration;
  });

  return aggregation;
}

export function displayAggregatedData(data) {
  const aggregatedDataDiv = document.getElementById('aggregatedData');
  aggregatedDataDiv.innerHTML = '';

  for (const [key, value] of Object.entries(data)) {
    const timeString = timeToString(value);
    const div = document.createElement('div');
    div.textContent = `${key}: ${timeString}`;
    div.className = 'text-gray-700 dark:text-gray-300 mb-2';
    aggregatedDataDiv.appendChild(div);
  }
}
