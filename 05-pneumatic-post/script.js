// PNEUMATIC POST — capsule transit between origin and reception.

const SYSTEM_PROMPT = `You are a clerk at the Bureau of Technical Assistance, replying to telegrams
delivered by pneumatic tube. You have received a technical complaint and you compose a brief reply
on a sepia receipt.

Voice & form:
- Tone of an 1880s telegraph clerk — formal, terse, slightly weary, but competent and helpful.
- Sentences are short. Use "STOP" at the end of sentences as in real telegrams. Words may be
  separated by " — " for emphasis.
- All CAPITAL telegraph style is fine for emphasised terms. The rest in normal sentence case.
- 3–6 short lines. No long paragraphs. No emoji. No markdown.
- The diagnosis must be technically real and useful: a plausible cause and one or two practical
  remedies. Reference port numbers, protocols, devices, OS commands where appropriate.
- Sign off with "— BUREAU OF TECHNICAL ASSISTANCE, CLERK No. " followed by a random 1-2 digit number.
- Output ONLY the message text, no preamble.`;

const $send = document.getElementById('send');
const $msg = document.getElementById('msg');
const $from = document.getElementById('from');
const $status = document.getElementById('status');
const $receipts = document.getElementById('receipts');
const $capsule = document.getElementById('capsule');
const $needle = document.getElementById('needle');
const $newkey = document.getElementById('newkey');
$newkey.addEventListener('click', (e) => { e.preventDefault(); window.ApiKey.resetApiKey(); });

let capCounter = 17;
const history = [];

function setPressure(deg) { $needle.style.transform = `translateX(-50%) rotate(${deg}deg)`; }
setPressure(-50);

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function launchCapsule(originRect, going = true) {
  return new Promise((resolve) => {
    $capsule.hidden = false;
    document.getElementById('capNum').textContent = String(capCounter).padStart(4, '0');

    const startX = originRect.left + originRect.width / 2 - 18;
    const startY = originRect.top + originRect.height / 2 - 43;

    $capsule.style.transition = 'none';
    $capsule.style.transform = `translate(${startX}px, ${startY}px)`;
    $capsule.style.opacity = '0';

    // force reflow
    void $capsule.offsetWidth;

    $capsule.style.transition = 'transform 0.9s cubic-bezier(.45,.0,.3,1), opacity 0.6s ease';
    $capsule.style.opacity = '1';

    if (going) {
      // travel up into the top pipe and off the right
      $capsule.style.transform = `translate(${startX}px, 30px)`;
      setTimeout(() => {
        $capsule.style.transform = `translate(${window.innerWidth + 60}px, 0px) rotate(90deg)`;
      }, 380);
      setTimeout(() => {
        $capsule.style.opacity = '0';
        resolve();
      }, 1100);
    } else {
      // arrive from the left of the reception panel
      const recvPanel = document.querySelector('.recv-panel');
      const recvRect = recvPanel.getBoundingClientRect();
      const tx = recvRect.left + 30;
      const ty = recvRect.top + 60;
      $capsule.style.transition = 'none';
      $capsule.style.transform = `translate(${-80}px, ${ty}px) rotate(90deg)`;
      $capsule.style.opacity = '0';
      void $capsule.offsetWidth;
      $capsule.style.transition = 'transform 0.95s cubic-bezier(.45,.0,.3,1), opacity 0.4s ease';
      $capsule.style.opacity = '1';
      $capsule.style.transform = `translate(${tx}px, ${ty}px) rotate(0deg)`;
      setTimeout(resolve, 1000);
    }
  });
}

function makeReceiptPlaceholder(num) {
  // remove "empty" if present
  const empty = $receipts.querySelector('.receipt.empty');
  if (empty) empty.remove();

  const wrap = document.createElement('div');
  wrap.className = 'receipt thinking';
  wrap.innerHTML = `
    <div class="receipt-head">
      <span>CAPSULE INWARDS · TUBE 7</span>
      <span class="receipt-num">№ ${String(num).padStart(4, '0')} · ${new Date().toLocaleTimeString('en-GB')}</span>
    </div>
    <div class="receipt-body">…transcribing reply…</div>
  `;
  $receipts.insertBefore(wrap, $receipts.firstChild);
  return wrap;
}

function formatReceipt(wrap, full) {
  wrap.classList.remove('thinking');
  // Split signature line if present
  const lines = full.trim().split(/\n+/);
  let body = full.trim();
  let sig = '';
  const lastLine = lines[lines.length - 1] || '';
  if (lastLine.startsWith('—') || /^[-—]/.test(lastLine)) {
    sig = lastLine;
    body = lines.slice(0, -1).join('\n').trim();
  }
  wrap.querySelector('.receipt-body').textContent = body;
  if (sig) {
    let s = wrap.querySelector('.receipt-sig');
    if (!s) {
      s = document.createElement('div'); s.className = 'receipt-sig';
      wrap.appendChild(s);
    }
    s.textContent = sig;
  }
}

async function despatch() {
  const text = $msg.value.trim();
  const from = $from.value.trim();
  if (!text) { $msg.focus(); return; }

  $send.disabled = true;
  $status.textContent = 'PRESSURISING…';
  setPressure(0);

  const originRect = $send.getBoundingClientRect();
  capCounter++;
  await launchCapsule(originRect, true);

  $msg.value = '';
  $from.value = '';
  $status.textContent = 'IN TRANSIT';
  setPressure(35);

  const wrap = makeReceiptPlaceholder(capCounter);

  // call LLM
  try {
    let full = '';
    const promise = window.LLM.chat({
      system: SYSTEM_PROMPT,
      user: text + (from ? `\n\n[from: ${from}]` : ''),
      history,
      onToken: (_, total) => {
        full = total;
        wrap.classList.remove('thinking');
        wrap.querySelector('.receipt-body').textContent = total;
      },
    });

    // give the capsule animation a moment to land
    await delay(300);
    $status.textContent = 'AWAITING REPLY';
    await promise;

    formatReceipt(wrap, full);
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: full });
    while (history.length > 10) history.shift();
  } catch (err) {
    wrap.classList.remove('thinking');
    wrap.querySelector('.receipt-body').textContent =
      'CAPSULE LOST EN ROUTE — STOP\n' + err.message + ' — STOP';
  }

  // return capsule animation
  $status.textContent = 'INCOMING…';
  await launchCapsule(originRect, false);

  setPressure(-50);
  $status.textContent = 'IDLE';
  $send.disabled = false;
}

$send.addEventListener('click', despatch);
$msg.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') despatch();
});

// Subtle ambient pressure jitter on dial
setInterval(() => {
  if (!$send.disabled) {
    const j = -50 + (Math.random() - .5) * 4;
    setPressure(j);
  }
}, 1400);
