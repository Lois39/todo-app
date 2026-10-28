export const addTask = (tasks, newTask) => {
    return [...tasks, newTask];
};

export const toggleTask = (tasks, id) => {
    return tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );
};

export const removeTask = (tasks, id) => {
    return tasks.filter(task => task.id !== id);
};