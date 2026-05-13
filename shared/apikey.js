// OpenRouter API key handling.
// - First call awaits a key (from localStorage, or via a modal).
// - getApiKey() returns Promise<string>.
// - resetApiKey() clears storage; useful for "change key" UI.
// The user must provide their own key. No demo/default key is bundled.

(function () {
  const STORAGE_KEY = 'openrouter_key_v1';

  function getStoredKey() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (_) { return ''; }
  }
  function storeKey(k) {
    try { localStorage.setItem(STORAGE_KEY, k); } catch (_) {}
  }
  function clearKey() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function injectStyles() {
    if (document.getElementById('apikey-modal-styles')) return;
    const s = document.createElement('style');
    s.id = 'apikey-modal-styles';
    s.textContent = `
      .apikey-backdrop {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(8,10,14,0.78);
        backdrop-filter: blur(6px) saturate(140%);
        display: flex; align-items: center; justify-content: center;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        animation: apikey-fade .25s ease;
      }
      @keyframes apikey-fade { from { opacity: 0 } to { opacity: 1 } }
      .apikey-card {
        background: #faf8f3;
        color: #1c1a17;
        max-width: 460px; width: calc(100% - 32px);
        padding: 28px 28px 22px;
        border-radius: 14px;
        box-shadow: 0 30px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.04);
        position: relative;
      }
      .apikey-card h2 {
        font: 600 19px/1.2 ui-sans-serif, system-ui;
        margin: 0 0 6px;
        letter-spacing: -0.01em;
      }
      .apikey-card p {
        font-size: 13.5px; line-height: 1.5; color: #4a463e;
        margin: 0 0 16px;
      }
      .apikey-card p a { color: #1c1a17; text-decoration: underline; text-underline-offset: 2px; }
      .apikey-card input {
        width: 100%; box-sizing: border-box;
        font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
        padding: 11px 12px;
        border: 1px solid #d6d0c2;
        border-radius: 8px;
        background: #fff;
        margin-bottom: 12px;
        outline: none;
      }
      .apikey-card input:focus { border-color: #1c1a17; box-shadow: 0 0 0 2px rgba(28,26,23,.08); }
      .apikey-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .apikey-btn {
        flex: 1; min-width: 130px;
        font: 600 13px/1 ui-sans-serif, system-ui;
        padding: 11px 14px;
        border-radius: 8px; border: 1px solid #1c1a17;
        cursor: pointer; background: #1c1a17; color: #faf8f3;
        transition: transform .08s ease;
      }
      .apikey-btn:hover { transform: translateY(-1px); }
      .apikey-btn.ghost { background: transparent; color: #1c1a17; }
      .apikey-note { font-size: 11.5px; color: #6e6759; margin-top: 12px; line-height: 1.5; }
      .apikey-err { color: #a03126; font-size: 12px; margin-top: 8px; min-height: 1em; }
    `;
    document.head.appendChild(s);
  }

  function promptForKey() {
    injectStyles();
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'apikey-backdrop';
      backdrop.innerHTML = `
        <div class="apikey-card" role="dialog" aria-modal="true" aria-labelledby="apikey-title">
          <h2 id="apikey-title">An OpenRouter API key, please.</h2>
          <p>This prototype calls a cheap Qwen model directly from your browser. Paste your own
             <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">OpenRouter key</a>
             — it's stored in <em>your</em> browser only.</p>
          <input id="apikey-input" type="password" autocomplete="off" spellcheck="false"
                 placeholder="sk-or-v1-..." />
          <div class="apikey-row">
            <button class="apikey-btn" id="apikey-save">Save & continue</button>
          </div>
          <div class="apikey-err" id="apikey-err"></div>
          <div class="apikey-note">
            The key never leaves your browser except to call openrouter.ai. Clear it any time
            via the "key" button in the corner of each prototype.
          </div>
        </div>`;
      document.body.appendChild(backdrop);

      const input = backdrop.querySelector('#apikey-input');
      const err = backdrop.querySelector('#apikey-err');
      const save = backdrop.querySelector('#apikey-save');

      setTimeout(() => input.focus(), 60);

      function done(k) {
        storeKey(k);
        backdrop.remove();
        resolve(k);
      }
      function trySave() {
        const v = input.value.trim();
        if (!v.startsWith('sk-or-')) {
          err.textContent = "That doesn't look like an OpenRouter key (should start sk-or-).";
          return;
        }
        done(v);
      }
      save.addEventListener('click', trySave);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') trySave(); });
    });
  }

  let _pending = null;
  async function getApiKey() {
    const existing = getStoredKey();
    if (existing) return existing;
    if (!_pending) _pending = promptForKey().finally(() => { _pending = null; });
    return _pending;
  }

  function resetApiKey() { clearKey(); }

  // Tiny "change key" button you can place in any prototype.
  function mountKeyButton(parent, opts = {}) {
    const btn = document.createElement('button');
    btn.textContent = opts.label || 'key';
    btn.className = 'apikey-mini-btn';
    btn.title = 'Clear stored OpenRouter key';
    btn.addEventListener('click', () => {
      clearKey();
      getApiKey();
    });
    (parent || document.body).appendChild(btn);
    return btn;
  }

  window.ApiKey = { getApiKey, resetApiKey, mountKeyButton };
})();
