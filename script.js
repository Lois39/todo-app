import { addTask, toggleTask, removeTask } from './tasks.js';

const loadTasks = () => {
    try {
        const saved = localStorage.getItem('tasks');

        if (saved === null) {
            return [
                {
                    id: 1,
                    text: 'Buy groceries',
                    priority: 2,
                    completed: false
                },
                {
                    id: 2,
                    text: 'Write report',
                    priority: 1,
                    completed: false
                }
            ];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Could not load tasks:', error);
        return [];
    }
};
let tasks = loadTasks();

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const prioritySelect = document.querySelector('#task-priority');
const list = document.querySelector('#task-list');
const counter = document.querySelector('#task-count');
const errorEl = document.querySelector('#form-error');

const createTaskItem = (task) => {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    const text = document.createElement('span');
    text.textContent = task.text;

    if (task.completed) {
        text.classList.add('completed');
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');

    li.append(text, deleteBtn);

    return li;
};

const render = (tasks) => {
    list.replaceChildren(...tasks.map(createTaskItem));

    const remaining = tasks.filter(
        task => !task.completed
    ).length;

    counter.textContent =
        `${remaining} task${remaining === 1 ? '' : 's'} left`;
};

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

const validateTask = (text, existingTasks) => {
    if (text === '') {
        return 'Please enter a task.';
    }

    if (text.length < 3) {
        return 'A task needs at least 3 characters.';
    }

    if (text.length > 100) {
        return 'A task can be at most 100 characters.';
    }

    const duplicate = existingTasks.some(
        task => task.text.toLowerCase() === text.toLowerCase()
    );

    if (duplicate) {
        return 'That task is already on your list.';
    }

    return '';
};

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const text = data.get('text').trim();
    const priority = Number(data.get('priority'));

    const error = validateTask(text, tasks);

    if (error) {
        errorEl.textContent = error;
        input.classList.add('invalid');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
    }

    tasks = addTask(tasks, {
        id: Date.now(),
        text,
        priority,
        completed: false
    });

    errorEl.textContent = '';
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');

    saveTasks();
    render(tasks);
    form.reset();
    input.focus();
});

input.addEventListener('blur', () => {
    const error = validateTask(input.value.trim(), tasks);

    errorEl.textContent = error;

    if (error) {
        input.classList.add('invalid');
        input.setAttribute('aria-invalid', 'true');
    } else {
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
    }
});

list.addEventListener('click', (event) => {
    const li = event.target.closest('li');

    if (!li || !list.contains(li)) return;

    const id = Number(li.dataset.id);

    if (event.target.closest('.delete-btn')) {
        tasks = removeTask(tasks, id);
    } else {
        tasks = toggleTask(tasks, id);
    }

    saveTasks();
    render(tasks);
});

render(tasks);

const validateExpense = ({ label, amount }) => {
    if (label === '') {
        return 'Please describe the expense.';
    }

    if (Number.isNaN(amount)) {
        return 'Please enter a valid amount.';
    }

    if (amount <= 0) {
        return 'The amount must be more than zero.';
    }

    if (amount > 100000) {
        return 'That amount looks too large.';
    }

    return '';
};

const expenseForm = document.querySelector('#expense-form');
const expenseError = document.querySelector('#expense-error');
const expenseList = document.querySelector('#expense-list');
const totalEl = document.querySelector('#expense-total');

const loadExpenses = () => {
    try {
        const saved = localStorage.getItem('expenses');

        if (saved === null) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Could not load expenses:', error);
        return [];
    }
};

let expenses = loadExpenses();

const createExpenseItem = (expense) => {
    const li = document.createElement('li');
    li.dataset.id = expense.id;

    const details = document.createElement('span');

    details.textContent =
        `${expense.label} (${expense.category}): $${expense.amount.toFixed(2)}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');

    li.append(details, deleteBtn);

    return li;
};

const renderExpenses = () => {
    expenseList.replaceChildren(
        ...expenses.map(createExpenseItem)
    );

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    totalEl.textContent = `Total: $${total.toFixed(2)}`;
};

const saveExpenses = () => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
};

expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(expenseForm);

    const expense = {
        id: Date.now(),
        label: data.get('label').trim(),
        amount: Number(data.get('amount')),
        category: data.get('category')
    };

    const error = validateExpense(expense);

    if (error) {
        expenseError.textContent = error;
        return;
    }

    expenses = [...expenses, expense];

    expenseError.textContent = '';

   saveExpenses();
   renderExpenses();
   expenseForm.reset();
});

expenseList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.delete-btn');

    if (!deleteBtn) return;

    const li = deleteBtn.closest('li');
    const id = Number(li.dataset.id);

    expenses = expenses.filter(
        expense => expense.id !== id
    );

    saveExpenses();
    renderExpenses();
});

renderExpenses();

