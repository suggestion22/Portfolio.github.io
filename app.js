/* ========= Colors dropdown (show current theme variables + copy) ========= */
(() => {
  const btn = document.getElementById('colorToggleBtn');
  const menu = document.getElementById('colorDropdown');
  if (!btn || !menu) return;

  const root = document.documentElement;

  const rgbToHex = (rgb) => {
    const m = rgb && rgb.match(/\d+/g);
    if (!m || m.length < 3) return (rgb || '').trim();
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    const [r, g, b] = m.slice(0, 3).map((v) => Math.max(0, Math.min(255, parseInt(v, 10))));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getVar = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    if (!v) return '';
    if (v.startsWith('#')) return v.toUpperCase();
    if (v.startsWith('rgb')) return rgbToHex(v);
    return v;
  };

  const sync = () => {
    menu.querySelectorAll('.color-item[data-var]').forEach((item) => {
      const name = item.getAttribute('data-var');
      const hex = getVar(name) || '#------';
      const label = item.querySelector('.color-label');
      if (label) label.textContent = hex;
      const box = item.querySelector('.color-box');
      if (box) box.style.background = hex === '#------' ? '#eee' : hex;
    });
  };

  const close = () => {
    if (!menu.classList.contains('active')) return;
    menu.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('active');
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) sync();
  });

  window.addEventListener('click', close);
  menu.addEventListener('click', (e) => e.stopPropagation());

  menu.querySelectorAll('.color-item[data-var]').forEach((item) => {
    item.addEventListener('click', async () => {
      const hex = item.querySelector('.color-label')?.textContent?.trim();
      if (!hex || hex === '#------') return;

      try {
        await navigator.clipboard.writeText(hex);
        item.classList.add('copied');
        setTimeout(() => item.classList.remove('copied'), 850);
      } catch { /* ignore */ }
    });
  });

  sync();
})();

/* ========= Back to top (footer link + floating button) ========= */
(() => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const floatBtn = document.createElement('button');
  floatBtn.className = 'back-to-top';
  floatBtn.textContent = '↑';
  floatBtn.type = 'button';
  floatBtn.setAttribute('aria-label', '맨 위로 이동');
  floatBtn.addEventListener('click', scrollTop);
  document.body.appendChild(floatBtn);

  const topLink = document.getElementById('backToTop');
  if (topLink) {
    topLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTop();
    });
  }

  window.addEventListener('scroll', () => {
    floatBtn.classList.toggle('show', window.scrollY > 300);
  });
})();
