(() => {

  const $ = (sel, root = document) => root.querySelector(sel);

   /* =========================
     Layout constants (CSS vars)
  =========================== */
  const headerH = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')
  ) || 0;


  // ===== Colors dropdown (theme vars + copy) =====
  const btn = $('#colorToggleBtn');
  const menu = $('#colorDropdown');

  const rootEl = document.documentElement;
  
  const rgbToHex = (rgb) => {
    const m = rgb && rgb.match(/\d+/g);
    if (!m || m.length < 3) return (rgb || '').trim();
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    const [r, g, b] = m.slice(0, 3).map((v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : 0;
    });
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getVarHex = (name) => {
    const v = getComputedStyle(rootEl).getPropertyValue(name).trim();
    if (!v) return '';
    if (v.startsWith('#')) return v.toUpperCase();
    if (v.startsWith('rgb')) return rgbToHex(v);
    return v;
  };

  const syncColors = () => {
    if (!menu) return;
    menu.querySelectorAll('.color-item[data-var]').forEach((item) => {
      const name = item.getAttribute('data-var');
      const hex = getVarHex(name) || '#------';
      const label = item.querySelector('.color-label');
      const box = item.querySelector('.color-box');
      if (label) label.textContent = hex;
      if (box) box.style.background = hex === '#------' ? '#eee' : hex;
    });
  };

  const openMenu = () => {
    if (!btn || !menu) return;
    menu.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    syncColors();
  };

  const closeMenu = () => {
    if (!btn || !menu) return;
    if (!menu.classList.contains('active')) return;
    menu.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  if (btn && menu) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) syncColors();
    });

    // 이벤트 위임: color-item 클릭 처리
    menu.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = e.target.closest('.color-item[data-var]');
      if (!item) return;

      const hex = item.querySelector('.color-label')?.textContent?.trim();
      if (!hex || hex === '#------') return;

      try {
        await navigator.clipboard.writeText(hex);
        item.classList.add('copied');
        window.setTimeout(() => item.classList.remove('copied'), 850);
      } catch {
        // ignore
      }
    });

    window.addEventListener('click', closeMenu);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    syncColors();
  }



  // ===== Back to top (footer link + floating button) =====
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const floatBtn = document.createElement('button');
  floatBtn.className = 'back-to-top';
  floatBtn.textContent = '↑';
  floatBtn.type = 'button';
  floatBtn.setAttribute('aria-label', '맨 위로 이동');
  floatBtn.addEventListener('click', scrollTop);
  document.body.appendChild(floatBtn);

  const topLink = $('#backToTop');
  if (topLink) {
    topLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTop();
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      floatBtn.classList.toggle('show', window.scrollY > 300);
    },
    { passive: true }
  );


})();
