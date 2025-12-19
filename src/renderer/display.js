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
  // Clear aggregated data - using Task Management view instead
  aggregatedDataDiv.innerHTML = '';
}
