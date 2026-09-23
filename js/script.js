/*
 * TODO LIST - Aplicação 100% client-side
 * Tecnologias: HTML5 + CSS3 + JavaScript
 * (100% client-side, dados salvos no navegador via localStorage)
 */

const STORAGE_KEY = "todo-list-tasks";
const MAX_TASKS = 10;
const PRIORITIES = ["Alta", "Média", "Baixa"];
const PRIORITY_ORDER = { "Alta": 0, "Média": 1, "Baixa": 2 };

/* ---------- Persistência (equivalente ao SQLite) ---------- */

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getSortedTasks() {
    const tasks = loadTasks();

    tasks.sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;

        if (pa !== pb) return pa - pb;
        return a.position - b.position;
    });

    return tasks;
}

function nextId(tasks) {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

function nextPosition(tasks, priority) {
    const positions = tasks
        .filter((task) => task.priority === priority)
        .map((task) => task.position);

    return positions.length ? Math.max(...positions) + 1 : 1;
}

function capitalizeFirstLetter(text) {
    if (!text) return text;
    if (text.length === 1) return text.toUpperCase();
    return text[0].toUpperCase() + text.slice(1);
}

/* ---------- Ações sobre as tarefas ---------- */

function addTask(title, priority) {
    const tasks = loadTasks();
    title = (title || "").trim();

    if (!title) {
        showToast("Digite uma tarefa antes de adicionar.");
        return;
    }

    if (!PRIORITIES.includes(priority)) {
        priority = "Média";
    }

    if (tasks.length >= MAX_TASKS) {
        showToast("Limite de 10 tarefas atingido.");
        return;
    }

    tasks.push({
        id: nextId(tasks),
        title: capitalizeFirstLetter(title),
        completed: false,
        priority,
        position: nextPosition(tasks, priority)
    });

    saveTasks(tasks);
    showToast("Tarefa adicionada com sucesso!");
    render();
}

function editTask(taskId, title) {
    title = (title || "").trim();

    if (!title) {
        showToast("Digite uma tarefa antes de salvar.");
        return;
    }

    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
        task.title = capitalizeFirstLetter(title);
        saveTasks(tasks);
        showToast("Tarefa atualizada!");
    }

    render();
}

function completeTask(taskId) {
    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
    }

    render();
}

function deleteTask(taskId) {
    let tasks = loadTasks();
    const removedTask = tasks.find((t) => t.id === taskId);

    tasks = tasks.filter((t) => t.id !== taskId);

    if (removedTask) {
        saveTasks(tasks);
        showToast("Tarefa removida com sucesso!", () => restoreTask(removedTask));
    }

    render();
}

function restoreTask(task) {
    const tasks = loadTasks();

    if (tasks.length >= MAX_TASKS) {
        showToast("Limite de 10 tarefas atingido. Não foi possível desfazer.");
        return;
    }

    // Se o id foi reaproveitado por uma tarefa nova, gera outro para evitar conflito.
    if (tasks.some((t) => t.id === task.id)) {
        task.id = nextId(tasks);
    }

    tasks.push(task);
    saveTasks(tasks);
    showToast("Tarefa restaurada!");
    render();
}

function reorderTasks(orderedIds) {
    const tasks = loadTasks();
    const existingIds = new Set(tasks.map((t) => t.id));
    const receivedIds = orderedIds.map((id) => Number(id));

    const sameSet =
        receivedIds.length === existingIds.size &&
        receivedIds.every((id) => existingIds.has(id));

    if (!sameSet) return false;

    // A posição é salva seguindo a ordem visual da lista.
    // A prioridade continua sendo respeitada pela ordenação principal.
    receivedIds.forEach((id, index) => {
        const task = tasks.find((t) => t.id === id);
        if (task) task.position = index + 1;
    });

    saveTasks(tasks);
    return true;
}

/* ---------- Toast (mensagens de feedback) ---------- */

let toastTimeout = null;

function showToast(message, onUndo) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.toggle("has-action", typeof onUndo === "function");

    if (typeof onUndo === "function") {
        const undoButton = document.createElement("button");
        undoButton.type = "button";
        undoButton.className = "toast-undo";
        undoButton.textContent = "Desfazer";
        undoButton.addEventListener("click", onUndo);
        toast.appendChild(undoButton);
    }

    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, onUndo ? 6000 : 3000);
}

/* ---------- Renderização ---------- */

function toggleEdit(taskId) {
    const titleSpan = document.getElementById("title-" + taskId);
    const editForm = document.getElementById("edit-form-" + taskId);

    if (!titleSpan || !editForm) return;

    const isEditing = editForm.style.display === "flex";

    if (isEditing) {
        editForm.style.display = "none";
        titleSpan.style.display = "inline";
    } else {
        editForm.style.display = "flex";
        titleSpan.style.display = "none";

        const input = editForm.querySelector("input");
        if (input) {
            input.focus();
            input.select();
        }
    }
}

function createTaskElement(task) {
    const li = document.createElement("li");

    const priorityClass =
        task.priority === "Alta" ? "priority-alta" :
        task.priority === "Média" ? "priority-media" :
        "priority-baixa";

    li.className = `task-item ${priorityClass}${task.completed ? " completed" : ""}`;
    li.dataset.taskId = task.id;
    li.draggable = true;

    li.innerHTML = `
        <span class="drag-handle" title="Arrastar tarefa" aria-label="Arrastar tarefa">⋮⋮</span>

        <button type="button" class="btn-checkbox" aria-label="Marcar como concluída">
            ${task.completed ? "&#9745;" : "&#9744;"}
        </button>

        <div class="task-content">
            <span class="task-title view-mode" id="title-${task.id}">${escapeHtml(task.title)}</span>

            <form class="edit-form" id="edit-form-${task.id}">
                <input type="text" name="title" value="${escapeHtml(task.title)}" maxlength="200" required>
                <button type="submit" class="btn-save">Salvar</button>
                <button type="button" class="btn-cancel">Cancelar</button>
            </form>

            <span class="task-priority">Prioridade: ${task.priority}</span>
        </div>

        <div class="task-actions">
            <button type="button" class="btn-edit">Editar</button>
            <button type="button" class="btn-delete">Excluir</button>
        </div>
    `;

    // Checkbox (concluir/desmarcar)
    li.querySelector(".btn-checkbox").addEventListener("click", () => {
        completeTask(task.id);
    });

    // Editar / Cancelar
    li.querySelector(".btn-edit").addEventListener("click", () => toggleEdit(task.id));
    li.querySelector(".btn-cancel").addEventListener("click", () => toggleEdit(task.id));

    // Salvar edição
    li.querySelector(".edit-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = event.target.querySelector('input[name="title"]');
        editTask(task.id, input.value);
    });

    // Excluir
    li.querySelector(".btn-delete").addEventListener("click", () => {
        deleteTask(task.id);
    });

    return li;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function render() {
    const tasks = getSortedTasks();

    const list = document.getElementById("task-list");
    const emptyState = document.getElementById("empty-state");
    const limitWarning = document.getElementById("limit-warning");
    const titleInput = document.getElementById("title-input");
    const prioritySelect = document.getElementById("priority-select");
    const btnAdd = document.getElementById("btn-add");

    list.innerHTML = "";

    if (tasks.length === 0) {
        emptyState.hidden = false;
    } else {
        emptyState.hidden = true;
        tasks.forEach((task) => list.appendChild(createTaskElement(task)));
    }

    const limitReached = tasks.length >= MAX_TASKS;
    limitWarning.hidden = !limitReached;
    titleInput.disabled = limitReached;
    prioritySelect.disabled = limitReached;
    btnAdd.disabled = limitReached;

    attachDragAndDrop(list);
}

/* ---------- Drag and drop (reordenar) ---------- */

function attachDragAndDrop(list) {
    let draggedItem = null;

    list.querySelectorAll(".task-item").forEach((item) => {
        item.addEventListener("dragstart", () => {
            draggedItem = item;
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");

            list.querySelectorAll(".task-item").forEach((task) => {
                task.classList.remove("drag-over");
            });

            const ids = [...list.querySelectorAll(".task-item")]
                .map((task) => Number(task.dataset.taskId));

            const success = reorderTasks(ids);
            showToast(success ? "Ordem das tarefas atualizada!" : "Não foi possível salvar a nova ordem.");

            draggedItem = null;
        });

        item.addEventListener("dragover", (event) => {
            event.preventDefault();

            if (!draggedItem || draggedItem === item) return;

            const rect = item.getBoundingClientRect();
            const mouseY = event.clientY;
            const middle = rect.top + rect.height / 2;

            item.classList.add("drag-over");

            if (mouseY < middle) {
                list.insertBefore(draggedItem, item);
            } else {
                list.insertBefore(draggedItem, item.nextSibling);
            }
        });

        item.addEventListener("dragleave", () => {
            item.classList.remove("drag-over");
        });

        item.addEventListener("drop", (event) => {
            event.preventDefault();
            item.classList.remove("drag-over");
        });
    });

    // Evita que clicar nos botões seja interpretado como início de arraste.
    list.querySelectorAll("button, input, form").forEach((element) => {
        element.addEventListener("mousedown", (event) => {
            event.stopPropagation();
        });
    });
}

/* ---------- Inicialização ---------- */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("task-form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const titleInput = document.getElementById("title-input");
        const prioritySelect = document.getElementById("priority-select");

        addTask(titleInput.value, prioritySelect.value);

        titleInput.value = "";
        prioritySelect.value = "Média";
        titleInput.focus();
    });

    render();
});
