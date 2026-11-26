/* Kopīgie palīgi visām lapām (ielādē <head> sinhroni, lai nebūtu tēmas "mirgošanas"). */
(function () {
  'use strict';

  /* ---------- Drošs localStorage (nemet kļūdu privātajā režīmā / bloķētā krātuvē) ---------- */
  const mem = {};
  const SK = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch (e) {
        return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch (e) { mem[key] = String(value); }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { delete mem[key]; }
    },
    getJSON(key, fallback = null) {
      const raw = SK.get(key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); } catch (e) { return fallback; }
    },
    setJSON(key, value) {
      SK.set(key, JSON.stringify(value));
    },
    formatTime(sec) {
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return m + ':' + s;
    },
    reducedMotion() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  };

  /* ---------- Dienas / nakts režīms (hub + Spēle 15) ---------- */
  const THEME_KEY = 'spelu_kaste_theme';
  SK.isDark = function () {
    const t = SK.get(THEME_KEY);
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  };
  SK.applyDark = function (isDark) {
    document.documentElement.classList.toggle('dark-mode', isDark);
    const meta = document.getElementById('meta-theme');
    if (meta) meta.setAttribute('content', isDark ? '#1C1E26' : '#FFF3B0');
  };
  SK.setDark = function (isDark) {
    SK.set(THEME_KEY, isDark ? 'dark' : 'light');
    SK.applyDark(isDark);
  };
  // Koka Bloki izmanto savas tēmas, tāpēc tas atzīmē lapu ar data-no-dark
  if (!document.documentElement.hasAttribute('data-no-dark')) {
    document.documentElement.classList.toggle('dark-mode', SK.isDark());
  }

  /* ---------- Service worker + "Pieejama jauna versija" ---------- */
  function showUpdateToast(onAccept) {
    if (document.getElementById('sk-update-toast')) return;
    const box = document.createElement('div');
    box.id = 'sk-update-toast';
    box.setAttribute('role', 'status');
    box.style.cssText =
      'position:fixed;left:50%;transform:translateX(-50%);z-index:99999;' +
      'bottom:calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;align-items:center;gap:12px;' +
      'background:#1E1B18;color:#fff;padding:10px 12px 10px 18px;border-radius:999px;' +
      'font:700 14px system-ui,-apple-system,sans-serif;box-shadow:0 6px 16px rgba(0,0,0,.35);max-width:92vw;';
    const txt = document.createElement('span');
    txt.textContent = 'Pieejama jauna versija';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Atjaunināt';
    btn.style.cssText =
      'background:#FFD13B;color:#1E1B18;border:0;border-radius:999px;padding:7px 14px;' +
      'font:800 14px system-ui,-apple-system,sans-serif;cursor:pointer;';
    btn.addEventListener('click', () => { btn.disabled = true; btn.textContent = '…'; onAccept(); });
    box.appendChild(txt);
    box.appendChild(btn);
    document.body.appendChild(box);
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;   // pirmā instalācija — nav jāpārlādē
      reloading = true;
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        const offer = (worker) => showUpdateToast(() => worker.postMessage({ type: 'SKIP_WAITING' }));
        if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
          });
        });
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
  registerSW();

  function syncAppHeight() {
    const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
  }
  syncAppHeight();
  window.addEventListener('resize', syncAppHeight);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', syncAppHeight);

  window.SK = SK;
})();
