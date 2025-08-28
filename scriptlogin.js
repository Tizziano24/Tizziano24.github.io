// Función para volver al inicio
    function goHome() {
      window.location.href = 'index.html';
    }

    // Manejo del tema
    const themeBtn = document.getElementById('themeBtn');
    const body = document.body;

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') body.classList.add('dark');

    // Actualizar icono
    function updateThemeButton() {
      themeBtn.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
    }
    updateThemeButton();

    // Alternar tema
    themeBtn.addEventListener('click', () => {
      body.classList.toggle('dark');
      localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
      updateThemeButton();
    });

    // Alternar entre login y registro
    function toggleForm() {
      const login = document.getElementById('login-form');
      const register = document.getElementById('register-form');
      const title = document.getElementById('form-title');

      if (login.style.display === 'none') {
        login.style.display = 'block';
        register.style.display = 'none';
        title.textContent = 'Iniciar Sesión';
      } else {
        login.style.display = 'none';
        register.style.display = 'block';
        title.textContent = 'Registrarse';
      }
    }

    // Inicio con OAuth (demo)
    function oauth(provider) {
      alert(`Inicio con ${provider} (demo).`);
    }

    // Validación y login
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPass').value.trim();
      const phone = document.getElementById('loginPhone').value.trim();

      if (!email.includes('@')) {
        alert('Por favor, ingresa un correo válido.');
        return;
      }
      if (pass.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (phone.length < 6) {
        alert('Número de teléfono inválido.');
        return;
      }

      // Guardar estado de sesión
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userAvatar', 'https://i.pravatar.cc/120?img=12');
      localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');

      // Redirigir
      window.location.href = 'index.html';
    });

    // Registro
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = ['regName', 'regDoc', 'regEmail', 'regPhone', 'regTrack', 'regPass'];
      const values = fields.map(id => document.getElementById(id).value.trim());
      if (values.some(v => !v)) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      alert('✅ Cuenta creada. Ahora puedes iniciar sesión.');
      toggleForm();
    });
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // ===== Funciones LocalStorage =====
  const storage = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  };

  // ===== Leer preferencias guardadas =====
  const savedUITheme = storage.get('ui-theme', 'base');
  const isDark = storage.get('theme', 'light') === 'dark';
  const savedBg = storage.get('bg-img', '');

  // ===== Aplicar Tema Base / EICO =====
  body.classList.remove('theme-mosconi', 'theme-base');
  body.classList.add(savedUITheme === 'mosconi' ? 'theme-mosconi' : 'theme-base');

  // ===== Aplicar Modo Claro / Oscuro =====
  if (isDark) body.classList.add('dark');
});