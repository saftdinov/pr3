// Данные
let kolonki = {
    col1: [],
    col2: [],
    col3: [],
    col4: []
};

// Загрузка
zagruzit();

// Добавить карточку
function addCard() {
    document.getElementById('modalTitle').textContent = 'Новая задача';
    document.getElementById('editId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('modal').style.display = 'flex';
}

// Сохранить карточку
function saveCard() {
    let id = document.getElementById('editId').value;
    let title = document.getElementById('title').value.trim();
    let desc = document.getElementById('desc').value.trim();
    let deadline = document.getElementById('deadline').value;

    if (!title || !desc || !deadline) {
        alert('Заполните все поля');
        return;
    }

    let now = new Date();

    if (id) {
        // Редактирование
        for (let col in kolonki) {
            let idx = kolonki[col].findIndex(c => c.id == id);
            if (idx !== -1) {
                kolonki[col][idx].title = title;
                kolonki[col][idx].desc = desc;
                kolonki[col][idx].deadline = deadline;
                kolonki[col][idx].edited = now.toISOString();
                break;
            }
        }
    } else {
        // Новая карточка в первой колонке
        kolonki.col1.push({
            id: Date.now(),
            title: title,
            desc: desc,
            deadline: deadline,
            created: now.toISOString(),
            edited: now.toISOString()
        });
    }

    sohranit();
    pokazat();
    closeModal();
}

// Закрыть модалку
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function closeReturnModal() {
    document.getElementById('returnModal').style.display = 'none';
}

// Удалить карточку
function deleteCard(id) {
    for (let col in kolonki) {
        let idx = kolonki[col].findIndex(c => c.id == id);
        if (idx !== -1) {
            kolonki[col].splice(idx, 1);
            break;
        }
    }
    sohranit();
    pokazat();
}

// Переместить карточку
function moveCard(id, from, to) {
    let idx = kolonki[from].findIndex(c => c.id == id);
    if (idx === -1) return;

    let card = kolonki[from][idx];
    kolonki[from].splice(idx, 1);

    if (to === 'col4') {
        // Проверка дедлайна
        let deadlineDate = new Date(card.deadline);
        let now = new Date();
        card.overdue = now > deadlineDate;
    }

    kolonki[to].push(card);
    sohranit();
    pokazat();
}

// Вернуть в работу
function returnCard(id) {
    document.getElementById('returnId').value = id;
    document.getElementById('reason').value = '';
    document.getElementById('returnModal').style.display = 'flex';
}

function returnToWork() {
    let id = document.getElementById('returnId').value;
    let reason = document.getElementById('reason').value.trim();

    if (!reason) {
        alert('Укажите причину');
        return;
    }

    moveCard(id, 'col3', 'col2');
    closeReturnModal();
}

// Редактировать карточку
function editCard(id) {
    let card = null;
    for (let col in kolonki) {
        let c = kolonki[col].find(c => c.id == id);
        if (c) {
            card = c;
            break;
        }
    }

    if (card) {
        document.getElementById('modalTitle').textContent = 'Редактировать задачу';
        document.getElementById('editId').value = card.id;
        document.getElementById('title').value = card.title;
        document.getElementById('desc').value = card.desc;
        document.getElementById('deadline').value = card.deadline;
        document.getElementById('modal').style.display = 'flex';
    }
}

// Показать карточки
function pokazat() {
    document.getElementById('col1').innerHTML = '';
    document.getElementById('col2').innerHTML = '';
    document.getElementById('col3').innerHTML = '';
    document.getElementById('col4').innerHTML = '';

    // Колонка 1
    kolonki.col1.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <strong>${c.title}</strong>
            <div class="card-info">
                Создано: ${formatDate(c.created)}<br>
                Дедлайн: ${formatLocalDate(c.deadline)}
            </div>
            <div class="card-actions">
                <button onclick="editCard(${c.id})">✏️</button>
                <button onclick="deleteCard(${c.id})">🗑️</button>
                <button onclick="moveCard(${c.id}, 'col1', 'col2')">➡️</button>
            </div>
        `;
        document.getElementById('col1').appendChild(div);
    });

    // Колонка 2
    kolonki.col2.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <strong>${c.title}</strong>
            <div>${c.desc}</div>
            <div class="card-info">
                Дедлайн: ${formatLocalDate(c.deadline)}<br>
                Редакт: ${formatDate(c.edited)}
            </div>
            <div class="card-actions">
                <button onclick="editCard(${c.id})">✏️</button>
                <button onclick="moveCard(${c.id}, 'col2', 'col3')">➡️</button>
            </div>
        `;
        document.getElementById('col2').appendChild(div);
    });

    // Колонка 3
    kolonki.col3.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <strong>${c.title}</strong>
            <div>${c.desc}</div>
            <div class="card-info">
                Дедлайн: ${formatLocalDate(c.deadline)}
            </div>
            <div class="card-actions">
                <button onclick="editCard(${c.id})">✏️</button>
                <button onclick="moveCard(${c.id}, 'col3', 'col4')">✅</button>
                <button onclick="returnCard(${c.id})">↩️</button>
            </div>
        `;
        document.getElementById('col3').appendChild(div);
    });

    // Колонка 4
    kolonki.col4.forEach(c => {
        let div = document.createElement('div');
        div.className = c.overdue ? 'card overdue' : 'card ontime';
        let status = c.overdue ? 'ПРОСРОЧЕНО!' : 'Выполнено в срок';
        div.innerHTML = `
            <strong>${c.title}</strong>
            <div>${c.desc}</div>
            <div class="card-info">
                Дедлайн: ${formatLocalDate(c.deadline)}<br>
                ${status}
            </div>
        `;
        document.getElementById('col4').appendChild(div);
    });
}

// Формат даты
function formatDate(dateStr) {
    if (!dateStr) return '';
    let d = new Date(dateStr);
    return d.toLocaleString('ru-RU');
}

function formatLocalDate(dateStr) {
    if (!dateStr) return '';
    let d = new Date(dateStr);
    return d.toLocaleString('ru-RU');
}

// Сохранение
function sohranit() {
    localStorage.setItem('kanban', JSON.stringify(kolonki));
}

function zagruzit() {
    let saved = localStorage.getItem('kanban');
    if (saved) {
        kolonki = JSON.parse(saved);
    }
    pokazat();
}

// Закрыть модалку по клику вне
window.onclick = function(e) {
    if (e.target.id === 'modal' || e.target.id === 'returnModal') {
        closeModal();
        closeReturnModal();
    }
};