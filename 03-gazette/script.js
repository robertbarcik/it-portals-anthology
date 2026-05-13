// GAZETTE OF GLITCHES — letters & replies.

const SYSTEM_PROMPT = `You are THE EDITOR of "The Gazette of Glitches," an irregularly-published
underground newspaper devoted to the misbehaviours of modern computing. A reader has written
in with a technical complaint. You reply, in print, in the voice of a slightly weary but
genuinely helpful Edwardian editor.

Voice & form:
- Address the reader as "Sir or Madam," "Dear Reader," or by their signed name.
- Edwardian / mid-century newsprint register. Mild dry wit. Never modern slang.
- Use occasional sub-headings in BLOCK CAPITALS within the reply.
- Plain prose, 2–4 short paragraphs.
- The diagnosis must be genuinely useful: state the likely cause, suggest one or two practical
  remedies. Use technical terms where appropriate.
- Sign off with "— THE EDITOR" or "— Y.E.D.", "Editorial Desk", etc.
- NO markdown, NO emoji, NO lists with hyphens. Use prose.
- Output ONLY the reply text. Begin with a HEADLINE on its own first line, in Title Case,
  about 4–10 words, summarising the diagnosis. THEN a blank line, THEN the body.`;

const EDITORS = [
  'Mavis Croaker', 'Edmund Hollyoak', 'Beatrice "Bee" Quill', 'Cornelius Strut',
  'Iphigenia D. Marsh', 'Reginald Pintock', 'Hortense Vellum', 'Bartholomew Crisp',
];
const WEATHER = [
  'Weather: a mild outage in the East',
  'Weather: high pressure on the routing table',
  'Weather: scattered packet loss after noon',
  'Weather: fair, with brief disturbances near port 443',
  'Weather: foggy at the gateway, clearing by tea-time',
];
const SIGNATURES = [
  '— Yours faithfully, R. of Bratislava',
  '— Sincerely, A Distressed User',
  '— Faithfully, The One Who Spilled Coffee',
  '— Yours, A. Subscriber',
  '— With diminishing patience, M.',
];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function todayLong() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();
}
function romanish() {
  // CCXLII +/- a bit for fun
  const n = 1972 + new Date().getFullYear() - 1972 + Math.floor(Math.random()*4);
  return 'VOL. ' + toRoman(n).slice(0, 6);
}
function toRoman(n) {
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
               [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let r = '';
  for (const [v, s] of map) { while (n >= v) { r += s; n -= v; } }
  return r;
}

document.getElementById('editor').textContent = pick(EDITORS);
document.getElementById('weather').textContent = pick(WEATHER);
document.getElementById('vol').textContent = romanish() + ' · NO. ' + (Math.floor(Math.random()*40)+1);
document.getElementById('dateline').textContent = todayLong() + ' — TWO PENCE';
document.getElementById('signer').placeholder = pick(SIGNATURES);

const $letters = document.getElementById('letters');
const $letter = document.getElementById('letter');
const $signer = document.getElementById('signer');
const $send = document.getElementById('send');
const $newkey = document.getElementById('newkey');

$newkey.addEventListener('click', (e) => { e.preventDefault(); window.ApiKey.resetApiKey(); });

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function addLetter(text, signedAs) {
  const wrap = el('div', 'letter');
  const sample = text.split(/\s+/).slice(0, 8).join(' ');
  wrap.appendChild(el('div', 'kicker', 'A Letter from the Post'));
  wrap.appendChild(el('div', 'hed', escapeHtml('"' + sample + (text.split(/\s+/).length > 8 ? '…"' : '"'))));
  wrap.appendChild(el('div', 'body', escapeHtml(text) +
    '\n\n' + escapeHtml(signedAs || pick(SIGNATURES))));
  $letters.appendChild(wrap);
  return wrap;
}

function addReplySkeleton() {
  const wrap = el('div', 'reply');
  wrap.appendChild(el('div', 'kicker', 'The Editor Replies'));
  const hed = el('div', 'hed', '');
  const body = el('div', 'body thinking', 'setting type…');
  wrap.appendChild(hed);
  wrap.appendChild(body);
  $letters.appendChild(wrap);
  return { wrap, hed, body };
}

function renderReplyText(hedEl, bodyEl, full) {
  // First line = headline, rest = body.
  const lines = full.split('\n');
  let hed = '';
  let rest = full;
  // Find first non-empty line as headline
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      hed = lines[i].trim().replace(/^["'#*\-]+/, '').trim();
      rest = lines.slice(i + 1).join('\n').trimStart();
      break;
    }
  }
  hedEl.textContent = hed || 'A Reply';
  bodyEl.classList.remove('thinking');
  bodyEl.innerHTML = '';
  // Paragraphs
  rest.split(/\n\s*\n/).forEach(p => {
    if (!p.trim()) return;
    const para = el('p', null, escapeHtml(p.trim()));
    bodyEl.appendChild(para);
  });
  // Add stamp
  const stamp = el('div', 'stamp', '— ' + pick(['THE EDITOR', 'Y.E.D.', 'EDITORIAL DESK', 'CHIEF SUB']));
  bodyEl.appendChild(stamp);
}

const history = [];

async function submitLetter() {
  const text = $letter.value.trim();
  const signedAs = $signer.value.trim();
  if (!text) return;
  $send.disabled = true; $send.textContent = 'To Press…';
  $letter.value = '';
  $signer.value = '';

  addLetter(text, signedAs);
  const { hed, body } = addReplySkeleton();

  try {
    let full = '';
    await window.LLM.chat({
      system: SYSTEM_PROMPT,
      user: text + (signedAs ? `\n\n[signed: ${signedAs}]` : ''),
      history,
      onToken: (_, total) => {
        full = total;
        // Live-render every ~80 chars to feel like typesetting
        if (total.length % 12 < 2) renderReplyText(hed, body, full);
      },
    });
    renderReplyText(hed, body, full);
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: full });
    while (history.length > 10) history.shift();
  } catch (err) {
    body.classList.remove('thinking');
    body.textContent = 'A telegram from the press: ' + err.message;
  } finally {
    $send.disabled = false; $send.textContent = 'Post to the Editor';
    window.scrollTo({ top: $letters.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 200, behavior: 'smooth' });
  }
}

$send.addEventListener('click', submitLetter);
$letter.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitLetter();
});
