(() => {
  // State
  let todos = [];
  let selectedId = null;
  let filter = 'all';

  // DOM Selectors
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const filterBtns = document.querySelectorAll('.filters button');

  const editModal = document.getElementById('edit-modal');
  const editInput = document.getElementById('edit-input');
  const saveEdit = document.getElementById('save-edit');
  const cancelEdit = document.getElementById('cancel-edit');

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadTodos();
    bindEvents();
    renderTodos();
  }

  // Event Bindings
  function bindEvents() {
    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keypress', e => e.key === 'Enter' && addTodo());
    editBtn.addEventListener('click', openEditModal);
    deleteBtn.addEventListener('click', deleteSelected);
    saveEdit.addEventListener('click', saveEdited);
    cancelEdit.addEventListener('click', closeEditModal);

    filterBtns.forEach(btn =>
      btn.addEventListener('click', () => setFilter(btn.id))
    );

    window.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleOutsideClick);
  }

  // Core Logic
  function addTodo() {
    const task = input.value.trim();
    if (!task || isDuplicate(task)) return;

    todos.push({ id: Date.now(), task, completed: false });
    input.value = '';
    persist();
    renderTodos();
  }

  function toggleCompleted(id) {
    const todo = findTodo(id);
    if (!todo) return;

    todo.completed = !todo.completed;
    persist();
    renderTodos();
  }

  function selectTodo(id) {
    selectedId = selectedId === id ? null : id;
    renderTodos();
  }

  function saveEdited() {
    const todo = findTodo(selectedId);
    if (!todo) return;

    todo.task = editInput.value.trim();
    closeEditModal();
    persist();
    renderTodos();
  }

  function deleteSelected() {
    todos = todos.filter(t => t.id !== selectedId);
    selectedId = null;
    persist();
    renderTodos();
  }

  // Modal Handling
  function openEditModal() {
    if (!selectedId) return;

    editInput.value = findTodo(selectedId)?.task || '';
    editModal.classList.add('show');
    editModal.classList.remove('hide');
  }

  function closeEditModal() {
    editModal.classList.remove('show');
    editModal.classList.add('hide');
  }

  // Render Todos
  function renderTodos() {
    todoList.innerHTML = '';

    getFilteredTodos().forEach(todo => {
      const li = document.createElement('li');
      li.classList.toggle('selected', selectedId === todo.id);
      li.classList.toggle('completed', todo.completed);

      const span = document.createElement('span');
      span.textContent = todo.task;

      const tickBtn = document.createElement('button');
      tickBtn.className = 'tick-btn';
      tickBtn.innerHTML = todo.completed ? '✔' : '';
      tickBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleCompleted(todo.id);
      });

      li.append(span, tickBtn);

      // Click on item → select
      li.addEventListener('click', () => selectTodo(todo.id));

      todoList.appendChild(li);
    });

    editBtn.disabled = !selectedId;
    deleteBtn.disabled = !selectedId;
  }

  // Helpers
  function findTodo(id) {
    return todos.find(t => t.id === id);
  }

  function isDuplicate(task) {
    return todos.some(t => t.task.toLowerCase() === task.toLowerCase());
  }

  function setFilter(value) {
    filter = value;
    filterBtns.forEach(b => b.classList.remove('active'));
    document.getElementById(value).classList.add('active');
    renderTodos();
  }

  function getFilteredTodos() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function persist() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function loadTodos() {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      selectedId = null;
      closeEditModal();
      renderTodos();
    }
  }

  // Handle click outside to deselect
  function handleOutsideClick(e) {
    if (
      e.target.closest('.container') ||
      e.target.closest('.modal-content') ||
      e.target.closest('li') ||
      e.target.closest('.tick-btn')
    ) return;

    selectedId = null;
    renderTodos();
  }
})();
