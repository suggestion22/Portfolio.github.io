(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  // CSS 변수에서 헤더 높이 읽기(단일 소스)
  const getHeaderH = () =>
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 72;

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

  // ===== Nav anchor scroll fix (avoid previous section showing) =====
  document.querySelectorAll('.nav-menu a[href^="#"], .logo[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // ✅ 헤더 높이 보정 제거
      const y = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });

      history.pushState(null, '', href);
    });
  });
  


  // ===== Header transform: ON after HERO =====
  const header = document.querySelector('.header');
  const hero = document.querySelector('#hero'); // 실제 HERO id로 맞추기

  if (header && hero) {
    const headerH = getHeaderH();

    const io = new IntersectionObserver(
     ([entry]) => {
       // HERO가 보이면 기본(OFF), HERO가 안 보이면 compact(ON)
       header.classList.toggle('is-compact', !entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: `-${headerH}px 0px -70% 0px`,
      }
   );

    io.observe(hero);
  }


  // ===== Scroll Spy (highlight current section) =====
  const sections = document.querySelectorAll('main .section');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  const setActiveNav = (id) => {
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  };

  const spyObserver = new IntersectionObserver(
    (entries) => {
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (best?.target?.id) setActiveNav(best.target.id);
    },
    {
      rootMargin: `-${getHeaderH()}px 0px -50% 0px`,
      threshold: [0.15, 0.25, 0.35, 0.5, 0.65],
    }
  );

  sections.forEach((sec) => {
    if (sec.id) spyObserver.observe(sec);
  });
})();
