const columns = {
    new: document.querySelector(".tasksNew"),
    process: document.querySelector(".tasksProcess"),
    completed: document.querySelector(".tasksCompleted")
};

// Загрузка задач из localStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTasks);

// Функция для сохранения задач в localStorage
function saveTasks() {
    const tasks = {
        new: [],
        process: [],
        completed: []
    };

    // Сохраняем задачи из каждой колонки
    Object.keys(columns).forEach(columnType => {
        const taskItems = columns[columnType].querySelectorAll('.task-item');
        taskItems.forEach(taskItem => {
            const taskText = taskItem.querySelector('.editable-task').innerText;
            tasks[columnType].push(taskText);
        });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks)); // Сохраняем задачи как JSON
}

// Функция для загрузки задач из localStorage
function loadTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    if (tasksJSON) {
        const tasks = JSON.parse(tasksJSON);
        Object.keys(tasks).forEach(columnType => {
            tasks[columnType].forEach(taskText => {
                let taskHTML = `<div class="task-item p-3" draggable="true">
                                    <span class="delete-task"></span>
                                    <span class="task box is-size-10 editable-task">${taskText}</span>
                                </div>`;
                columns[columnType].insertAdjacentHTML('beforeend', taskHTML);
            });
        });
    }
}



// Добавление задач
document.querySelectorAll('.custom-input').forEach(input => {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addTask(event, input);
        }
    });
});

function addTask(event, input) {
    event.preventDefault();

    let taskText = input.value.trim();

    if (taskText) {
        let taskHTML = `<div class="task-item p-3" draggable="true">
                            <span class="delete-task"></span>
                            <span class="task box is-size-10 editable-task">${taskText}</span>
                        </div>`;
        
        let columnType = input.closest('.column').dataset.column;
        columns[columnType].insertAdjacentHTML('beforeend', taskHTML);
        
        input.value = ''; // Очищаем поле ввода

        // Сохранение задачи в localStorage
        saveTasks();
    }
}

// Удаление задач
document.addEventListener("click", deleteTask);

function deleteTask(event) {
    if (event.target.classList.contains('delete-task')) {
        let taskItem = event.target.closest('.task-item');
        taskItem.remove();
        saveTasks(); // Обновляем localStorage после удаления задачи
    }
}

// Редактирование задач
document.addEventListener("click", editTask);

function editTask(event) {
    event.preventDefault();

    if (event.target.classList.contains("editable-task")) {
        let taskTextElement = event.target;
        let originalText = taskTextElement.innerText;

        // Создаем поле ввода и заполняем его текущим текстом
        let input = document.createElement("input");
        input.type = "text";
        input.className = "input is-medium"; // className вместо classname
        input.value = originalText;

        // Заменяем оригинальный текст задачи на созданный редактируемый input
        taskTextElement.replaceWith(input);
        input.focus(); // Не забудь скобки для вызова метода

        // Обработчик для завершения редактирования по Enter
        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                finishEdit(input, taskTextElement);
            }
        });

        // Обработчик для завершения редактирования при потере фокуса
        input.addEventListener("blur", function() {
            finishEdit(input, taskTextElement);
        });
    }
}

function finishEdit(input, taskTextElement) {
    let newText = input.value.trim();

    if (newText) {
        // Если введён текст, заменяем обратно на span с новым текстом
        taskTextElement.innerText = newText;
    } else {
        // Если поле пустое, восстанавливаем старый текст
        taskTextElement.innerText = input.defaultValue;
    }

    // Заменяем input обратно на span
    input.replaceWith(taskTextElement);
    saveTasks(); // Обновляем localStorage после редактирования
}

// Драг-н-дроп
document.addEventListener("dragstart", handleDragStart);
document.addEventListener("dragover", handleDragOver);
document.addEventListener("drop", handleDrop);
document.addEventListener("dragend", handleDragEnd);  // Добавляем событие завершения перетаскивания

let dragTask = null; // Переменная для перетаскиваемой задачи

function handleDragStart(event) {
    if (event.target.classList.contains("task-item")) {
        dragTask = event.target; // Сохраняем перетаскиваемую задачу
        event.target.classList.add('dragging'); // Добавляем класс для визуального эффекта
    }
}

function handleDragOver(event) {
    event.preventDefault(); // Разрешаем перетаскивание над целями дропа
}

function handleDrop(event) {
    event.preventDefault();

    // Проверяем, что дропнули в колонку
    let targetColumn = event.target.closest('.column'); // Проверяем ближайшую колонку
    if (targetColumn) {
        let newColumnType = targetColumn.dataset.column;

        // Добавляем задачу в новую колонку
        columns[newColumnType].appendChild(dragTask);
        dragTask.classList.remove("dragging"); // Убираем визуальный эффект
        dragTask = null; // Сбрасываем переменную

        saveTasks(); // Обновляем localStorage после перетаскивания
    }
}

function handleDragEnd(event) {
    // Очистка перетаскиваемой задачи после завершения драг-н-дропа
    if (dragTask) {
        dragTask.classList.remove('dragging'); // Убираем класс, если был установлен
        dragTask = null;
    }
}

