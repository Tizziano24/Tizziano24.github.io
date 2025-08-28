    // ==== Utilidades ====
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

const storage = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: k => localStorage.removeItem(k)
};

// ==== Datos por defecto ====
const defaultClasses = [
  { id: 'cls1', title: 'Programación I', teacher: 'Profe García', cover: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop', room: 'Aula 305' },
  { id: 'cls2', title: 'Historia Contemporánea', teacher: 'Lic. Duarte', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop', room: 'Aula 112' },
  { id: 'cls3', title: 'Inglés Avanzado', teacher: 'Prof. Smith', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop', room: 'Lab 2' },
  { id: 'cls4', title: 'Álgebra', teacher: 'Dra. Ruiz', cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', room: 'Aula 204' }
];

const defaultBoard = [
  { id: 'todo', name: 'Por hacer', cards: [{ id: 'c1', text: 'Armar cronograma parcial' }, { id: 'c2', text: 'Cargar notas TP1' }] },
  { id: 'doing', name: 'En curso', cards: [{ id: 'c3', text: 'Diseñar portada Aula Virtual' }] }
];

let hasNewNotif = true;

// ==== Inicialización ====
document.addEventListener('DOMContentLoaded', () => {
  applyPreferences();
  setupUI();
  renderClasses(storage.get('classes', defaultClasses));
  renderBoard(storage.get('board', defaultBoard));
});

// ==== Aplicar preferencias guardadas ====
function applyPreferences() {
  const body = document.body;
  const savedUITheme = storage.get('ui-theme', 'base');
  const isDark = storage.get('theme', 'light') === 'dark';
  const savedBg = storage.get('bg-img', '');

  body.classList.remove('theme-mosconi', 'theme-base');
  body.classList.add(savedUITheme === 'mosconi' ? 'theme-mosconi' : 'theme-base');
  if (isDark) body.classList.add('dark');

  if (savedBg) {
    body.style.backgroundImage = `url(${savedBg})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
  }

  updateThemeIcon();
}

// ==== Configuración de UI ====
function setupUI() {
  const logged = storage.get('loggedIn', false);
  qs('#loginLink').style.display = logged ? 'none' : 'flex';
  qs('#profileLink').style.display = logged ? 'flex' : 'none';

  if (logged) {
    const avatar = localStorage.getItem('userAvatar') || 'https://i.pravatar.cc/120?img=12';
    qs('#profileLink img').src = avatar;
  }

  qs('#profileLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
      storage.set('loggedIn', false);
      localStorage.removeItem('userAvatar');
      location.reload();
    }
  });

  // Sidebar
  qs('#sbToggle').addEventListener('click', () => {
    qs('#sidebar').classList.toggle('show');
  });

  // Tabs
  qsa('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      qs('#view-classes').style.display = tab.dataset.tab === 'classes' ? 'block' : 'none';
      qs('#view-boards').style.display = tab.dataset.tab === 'boards' ? 'block' : 'none';
    });
  });

  // Búsqueda
  qs('#search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    qsa('.class-card, .card').forEach(el => {
      const text = el.dataset.title || el.textContent;
      el.style.display = text.toLowerCase().includes(term) ? '' : 'none';
    });
  });

  // Añadir columna
  qs('#addColumn').addEventListener('click', () => {
    const name = prompt('Nombre de la nueva columna:');
    if (!name?.trim()) return;
    const board = storage.get('board', defaultBoard);
    const newCol = { id: 'col' + Date.now(), name: name.trim(), cards: [] };
    board.push(newCol);
    storage.set('board', board);
    renderBoard(board);
    showToast('Nueva columna', `"${name}" ha sido creada.`);
  });

  // Tema claro/oscuro
  qs('#themeBtn')?.addEventListener('click', toggleTheme);

  // Notificaciones
  setupNotifications();
}

// ==== Notificaciones ====
function setupNotifications() {
  const notifyPanel = qs('#notifyPanel');
  const bellBtn = qs('#bellBtn');

  function positionPanel() {
    const rect = bellBtn.getBoundingClientRect();
    notifyPanel.style.top = `${rect.bottom + window.scrollY}px`;
    notifyPanel.style.right = `${window.innerWidth - rect.right}px`;
  }

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    positionPanel();

    const isShowing = notifyPanel.classList.contains('show');
    if (isShowing) {
      notifyPanel.classList.remove('show');
      setTimeout(() => { if (!notifyPanel.classList.contains('show')) notifyPanel.style.display = 'none'; }, 300);
    } else {
      notifyPanel.style.display = 'block';
      requestAnimationFrame(() => {
        positionPanel();
        notifyPanel.classList.add('show');
      });
      if (hasNewNotif) {
        qs('.notify-dot')?.remove();
        hasNewNotif = false;
      }
    }
  });

  window.addEventListener('resize', () => {
    if (notifyPanel.classList.contains('show')) positionPanel();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notify-panel') && !e.target.closest('#bellBtn')) {
      if (notifyPanel.classList.contains('show')) {
        notifyPanel.classList.remove('show');
        setTimeout(() => { if (!notifyPanel.classList.contains('show')) notifyPanel.style.display = 'none'; }, 300);
      }
    }
  });
}

// ==== Tema ====
function toggleTheme() {
  document.body.classList.toggle('dark');
  updateThemeIcon();
  storage.set('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark');
  qs('#sun-icon').style.display = isDark ? 'none' : 'block';
  qs('#moon-icon').style.display = isDark ? 'block' : 'none';
}

// ==== Renderizado de Clases ====
function renderClasses(items) {
  const grid = qs('#classesGrid');
  grid.innerHTML = '';
  items.forEach(cls => {
    const el = document.createElement('article');
    el.className = 'class-card';
    el.dataset.title = `${cls.title} ${cls.teacher}`.toLowerCase();
    el.innerHTML = `
      <div class="class-cover" style="background-image:url('${cls.cover}')"></div>
      <div class="class-title">${cls.title}</div>
      <div class="class-meta">${cls.teacher} • ${cls.room}</div>
    `;
    el.addEventListener('click', () => alert(`Entrando a: ${cls.title}`));
    grid.appendChild(el);
  });
}

// ==== Renderizado de Tablero ====
function renderBoard(board) {
  const host = qs('#boards');
  host.innerHTML = '';
  board.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.col = col.id;
    colEl.innerHTML = `
      <button class="delete-col">×</button>
      <h4 contenteditable="true">${col.name}</h4>
      <div class="list" data-col="${col.id}"></div>
      <button class="add-card">+ Agregar tarjeta</button>
    `;

    const list = qs('.list', colEl);
    col.cards.forEach(card => list.appendChild(makeCardEl(card)));

    qs('h4', colEl).addEventListener('blur', function () {
      const board = storage.get('board', defaultBoard);
      const colData = board.find(c => c.id === col.id);
      if (colData) colData.name = this.textContent.trim() || colData.name;
      storage.set('board', board);
    });

    qs('.add-card', colEl).addEventListener('click', () => {
      const text = prompt('Texto de la tarjeta:');
      if (!text?.trim()) return;
      const newCard = { id: 'card' + Date.now(), text: text.trim() };
      col.cards.push(newCard);
      const board = storage.get('board', defaultBoard);
      const colData = board.find(c => c.id === col.id);
      if (colData) colData.cards.push(newCard);
      storage.set('board', board);
      list.appendChild(makeCardEl(newCard));
      enableDnD();
      showToast('Nueva tarjeta', `"${text}" agregada.`);
    });

    qs('.delete-col', colEl).addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('¿Eliminar columna y todas sus tarjetas?')) {
        const updated = board.filter(c => c.id !== col.id);
        storage.set('board', updated);
        renderBoard(updated);
      }
    });

    host.appendChild(colEl);
  });
  enableDnD();
}

// ==== Tarjetas ====
function makeCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.id;
  el.innerHTML = `<span>${card.text}</span><button class="delete-card">×</button>`;
  el.querySelector('.delete-card').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta tarjeta?')) {
      const board = storage.get('board', defaultBoard);
      const col = board.find(c => c.cards.some(ca => ca.id === card.id));
      if (col) {
        col.cards = col.cards.filter(c => c.id !== card.id);
        storage.set('board', board);
        el.remove();
      }
    }
  });
  return el;
}

// ==== Drag & Drop ====
function enableDnD() {
  qsa('.card').forEach(c => {
    c.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', c.dataset.id);
      requestAnimationFrame(() => c.classList.add('dragging'));
    });
    c.addEventListener('dragend', () => c.classList.remove('dragging'));
  });

  qsa('.list').forEach(list => {
    list.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfterElement(list, e.clientY);
      const dragging = qs('.card.dragging');
      if (!dragging) return;
      if (after == null) list.appendChild(dragging);
      else list.insertBefore(dragging, after);
    });
    list.addEventListener('drop', () => persistBoardFromDOM());
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.card:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: -Infinity }).element;
}

function persistBoardFromDOM() {
  const cols = qsa('.column');
  const newBoard = [];
  cols.forEach(col => {
    const id = col.dataset.col;
    const name = qs('h4', col).textContent.trim();
    const cards = qsa('.list .card', col).map(c => ({ id: c.dataset.id, text: c.querySelector('span').textContent }));
    newBoard.push({ id, name, cards });
  });
  storage.set('board', newBoard);
}

// ==== Toast ====
function showToast(title, message) {
  const toast = qs('#toast');
  toast.textContent = `${title}: ${message}`;
  toast.style.display = 'block';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.style.display = 'none', 300);
  }, 3000);
}
// ===== Aplicar fondo guardado =====
function applyBackground(img) {
  if (!img) {
    document.body.style.backgroundImage = '';
    document.querySelectorAll('.tablero, .tablero-clases').forEach(el => {
      el.style.backgroundImage = '';
    });
    return;
  }

  document.body.style.backgroundImage = `url(${img})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";

  // Tableros
  document.querySelectorAll('.tablero, .tablero-clases').forEach(el => {
    el.style.backgroundImage = `url(${img})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";
  });
}