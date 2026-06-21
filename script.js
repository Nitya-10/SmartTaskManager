// State Management
let tasks = [];

// Default Seed Tasks if LocalStorage is empty
const seedTasks = [
  { id: 1, text: "Mark this task as completed to see the smooth animation 🌟", completed: false },
  { id: 2, text: "Delete a task by clicking the trash icon on the right 🗑️", completed: false },
  { id: 3, text: "Try adding a new task using the input field above ✍️", completed: false },
  { id: 4, text: "Welcome to Smart Task Manager! 👋", completed: true }
];

// Load tasks from LocalStorage
function init() {
  try {
    const storedTasks = localStorage.getItem('smart_tasks');
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
      if (!Array.isArray(tasks)) {
        throw new Error('Stored tasks is not an array');
      }
    } else {
      tasks = [...seedTasks];
      saveTasks();
    }
  } catch (e) {
    console.error('Failed to load tasks from localStorage, falling back to seed tasks:', e);
    tasks = [...seedTasks];
    try {
      saveTasks();
    } catch (saveErr) {
      console.error('Failed to save fallback tasks to localStorage:', saveErr);
    }
  }
  render();
}

// Save tasks to LocalStorage
function saveTasks() {
  try {
    localStorage.setItem('smart_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

// Cache DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const pendingBadge = document.getElementById('pending-badge');
const completedBadge = document.getElementById('completed-badge');

// Create HTML Empty State Node
function createEmptyState(message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
    <span class="empty-state-text">${message}</span>
  `;
  return div;
}

// Toggle Task Complete State with Animation Delay
function toggleTask(id, element) {
  if (element.classList.contains('removing')) return;
  // Add animation class before state update
  element.classList.add('removing');
  
  setTimeout(() => {
    tasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTasks();
    render();
  }, 280); // matches style.css transition time
}

// Delete Task with Animation Delay
function deleteTask(id, element) {
  if (element.classList.contains('removing')) return;
  element.classList.add('removing');
  
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }, 280); // matches style.css transition time
}

// Render Lists and Counters
function render() {
  // Clear current lists
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Render Pending Tasks
  if (pendingTasks.length === 0) {
    pendingList.appendChild(createEmptyState('No pending tasks. You\'re all caught up!'));
  } else {
    pendingTasks.forEach(task => {
      pendingList.appendChild(createTaskElement(task));
    });
  }

  // Render Completed Tasks
  if (completedTasks.length === 0) {
    completedList.appendChild(createEmptyState('No completed tasks yet. Finish a task!'));
  } else {
    completedTasks.forEach(task => {
      completedList.appendChild(createTaskElement(task));
    });
  }

  // Update Dashboard & Badges
  const totalCount = tasks.length;
  const pendingCount = pendingTasks.length;
  const completedCount = completedTasks.length;

  totalCountEl.textContent = totalCount;
  pendingCountEl.textContent = pendingCount;
  completedCountEl.textContent = completedCount;

  pendingBadge.textContent = pendingCount;
  completedBadge.textContent = completedCount;
}

// Create a DOM Element for a Task Card
function createTaskElement(task) {
  const item = document.createElement('div');
  item.className = 'task-item';
  item.id = `task-${task.id}`;

  // Card Left Content (checkbox + text)
  const left = document.createElement('div');
  left.className = 'task-left';

  const label = document.createElement('label');
  label.className = 'checkbox-container';
  label.setAttribute('aria-label', `Mark task "${task.text}" as ${task.completed ? 'pending' : 'completed'}`);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `checkbox-${task.id}`;
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id, item));

  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';

  label.appendChild(checkbox);
  label.appendChild(checkmark);

  const spanText = document.createElement('label');
  spanText.className = 'task-text';
  spanText.htmlFor = `checkbox-${task.id}`;
  spanText.textContent = task.text;

  left.appendChild(label);
  left.appendChild(spanText);

  // Card Right Content (delete button)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;
  deleteBtn.addEventListener('click', () => deleteTask(task.id, item));

  item.appendChild(left);
  item.appendChild(deleteBtn);

  return item;
}

// Handle Form Submit Event
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    text: text,
    completed: false
  };

  tasks.unshift(newTask); // Add new task to the top
  saveTasks();
  render();

  // Clear input and refocus
  taskInput.value = '';
  taskInput.focus();
});

// Initialize Application
window.addEventListener('DOMContentLoaded', init);
