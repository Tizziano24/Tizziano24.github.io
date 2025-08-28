(() => {
  // Helpers
  const qs  = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const storage = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    remove: k => localStorage.removeItem(k),
  };
  const BG_KEY = 'bg-image';

  // ===== Cargar tema y fondo guardados =====
  const savedUITheme = storage.get('ui-theme', 'base');
  const isDark       = storage.get('theme', 'light') === 'dark';
  const savedBg      = storage.get(BG_KEY, '');

  if (savedUITheme === 'mosconi') document.body.classList.add('theme-mosconi');
  if (isDark) document.body.classList.add('dark');
  if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;

  // ===== Iconos modo claro/oscuro =====
  const sunIcon  = qs('#sun-icon');
  const moonIcon = qs('#moon-icon');
  const themeBtn = qs('#themeBtn');

  if (sunIcon && moonIcon) {
    sunIcon.style.display = isDark ? 'none'  : 'block';
    moonIcon.style.display = isDark ? 'block' : 'none';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nowDark = !document.body.classList.contains('dark');
      document.body.classList.toggle('dark', nowDark);
      storage.set('theme', nowDark ? 'dark' : 'light');
      if (sunIcon && moonIcon) {
        sunIcon.style.display  = nowDark ? 'none'  : 'block';
        moonIcon.style.display = nowDark ? 'block' : 'none';
      }
    });
  }

  // ===== Selección de tema (Base / EICO) =====
  qsa('.theme-option').forEach(opt => {
    if (opt.dataset.theme === savedUITheme) opt.classList.add('selected');
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      storage.set('ui-theme', theme);
      document.body.classList.toggle('theme-mosconi', theme === 'mosconi');
      qsa('.theme-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // ===== Fondo personalizado =====
  const bgFile       = qs('#bgFile');
  const bgUrl        = qs('#bgUrl');
  const removeBgBtn  = qs('#removeBg');

  const updateRemoveVisibility = () => {
    if (removeBgBtn) removeBgBtn.style.display = storage.get(BG_KEY, '') ? 'inline-block' : 'none';
  };
  updateRemoveVisibility();

  // Subir archivo
  if (bgFile) {
    bgFile.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        storage.set(BG_KEY, dataUrl);
        document.body.style.backgroundImage = `url('${dataUrl}')`;
        updateRemoveVisibility();
        alert('✅ Fondo guardado');
      };
      reader.readAsDataURL(file);
    });
  }

  // Usar URL
  if (bgUrl) {
    bgUrl.addEventListener('change', () => {
      const url = bgUrl.value.trim();
      if (!url) return;
      storage.set(BG_KEY, url);
      document.body.style.backgroundImage = `url('${url}')`;
      updateRemoveVisibility();
      alert('✅ Fondo guardado desde URL');
    });
  }

  // Quitar fondo
  if (removeBgBtn) {
    removeBgBtn.addEventListener('click', () => {
      storage.remove(BG_KEY);
      document.body.style.backgroundImage = '';
      if (bgFile) bgFile.value = '';
      if (bgUrl)  bgUrl.value  = '';
      updateRemoveVisibility();
      alert('❌ Fondo eliminado');
    });
  }

  // Botón volver (lo usa el HTML con onclick)
  window.goBack = function () {
    window.location.href = 'index.html';
  };
})();
