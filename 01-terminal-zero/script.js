// TERMINAL ZERO — phosphor service desk console.

const SYSTEM_PROMPT = `You are SYSOP, the sole operator of a 1983 VAX-9000 mainframe at Bell Labs.
You run an IT help desk for whoever happens to dial in. You answer in clipped, lowercase,
terminal-style English. No emoji. No markdown. No long paragraphs.

Voice:
- Terse. 1–4 short lines per reply, unless explicitly asked for more.
- Lowercase by default. Code, paths, error codes in UPPERCASE.
- Occasional dry humour about the age of the equipment. Never break character.
- When you don't know, ask one short clarifying question.
- If the user describes a problem, hand back: (1) one likely cause, (2) one thing to try.

You may invent plausible-sounding diagnostic codes (e.g. ERR/0x42, SIGHUP-7).`;

const $term = document.getElementById('term');
const $log = document.getElementById('log');
const $boot = document.getElementById('boot');
const $promptRow = document.getElementById('promptRow');
const $cmd = document.getElementById('cmd');
const $ftrR = document.getElementById('ftrR');
const $clock = document.getElementById('clock');
const $kern = document.getElementById('kern');

// ---------- clock ----------
function tickClock() {
  const d = new Date();
  $clock.textContent = d.toTimeString().slice(0, 8) + ' UTC' + (d.getTimezoneOffset() ? '' : '');
}
setInterval(tickClock, 1000); tickClock();

// ---------- boot sequence ----------
const BOOT_LINES = [
  ['dim',  'BELL LABS 9000-SERIES VAX, ALT-FIRMWARE.'],
  ['dim',  'COPYRIGHT (C) 1983 BELL TELEPHONE LABORATORIES, INC.'],
  ['dim',  '   '],
  ['sys',  'memory check ............. 16384 KB OK'],
  ['sys',  'serial console ........... TTYA OK'],
  ['warn', 'CRT phosphor degradation: 7.4% — within tolerance'],
  ['sys',  'loading SVCDESK.EXE ....... OK'],
  ['sys',  'connecting to TICKETDB .... OK'],
  ['err',  'DNS LOOKUP FAILED — falling back to /etc/hosts'],
  ['warn', 'tcp/443 ACK timeout (cosmetic, ignored)'],
  ['sys',  'service desk online.'],
  ['dim',  '   '],
  ['sys',  'hello, operator. type HELP, or just describe what is wrong.'],
];

function appendLine(cls, text, parent = $boot) {
  const d = document.createElement('div');
  d.className = 'line ' + cls;
  d.textContent = text;
  parent.appendChild(d);
  $log.scrollTop = $log.scrollHeight;
  return d;
}

async function runBoot() {
  for (const [cls, text] of BOOT_LINES) {
    appendLine(cls, text);
    await delay(70 + Math.random() * 90);
  }
  await delay(220);
  $promptRow.hidden = false;
  $ftrR.textContent = '~ READY ~';
  $cmd.focus();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- kernel log stream ----------
const KERN_MSGS = [
  ['ok',   'systemd[1]: Started service desk daemon (PID 1138).'],
  ['ok',   'kernel: eth0: link up, 10 Mb/s half-duplex'],
  ['warn', 'kernel: tcp port 443 ACK timeout (cosmetic)'],
  ['ok',   'ntpd[202]: time slewed +0.0042s — fine.'],
  ['ok',   'sshd[2218]: Accepted publickey for root from 10.0.0.42'],
  ['warn', 'modprobe: module FLOPPY8IN not found, using FLOPPY5_25'],
  ['err',  'CRON[3017]: backup tape /dev/rmt0 reports EOL — replace'],
  ['ok',   'kernel: USB 0.3 host controller initialised (?)'],
  ['ok',   'mailq: 0 messages, 7 ghosts'],
  ['warn', 'kernel: CPU0 ECC scrubbed 1 bit at 0xDEADBEEF'],
  ['ok',   'cron: running /usr/local/bin/check-printers.sh'],
  ['err',  'lpd: printer LASERWRITER-II says "INTERVENTION".'],
  ['ok',   'kernel: cooling fan RPM 2200 — nominal'],
  ['warn', 'kernel: temperature sensor disagrees with itself (avg used)'],
  ['ok',   'gettyd: reset on TTY3'],
  ['ok',   'syslogd: rotated /var/log/messages → .1'],
  ['err',  'PANIC: kfree: double free in module SPELLCHECK (suppressed)'],
  ['ok',   'kernel: PCI: probing slot 0x0e — empty'],
  ['warn', 'kernel: clock skew on TTY5 ≈ 23 ms'],
  ['ok',   'rpcbind: registered MOUNT v3'],
];

function kernPush() {
  const [cls, text] = KERN_MSGS[Math.floor(Math.random() * KERN_MSGS.length)];
  const ts = new Date().toTimeString().slice(0, 8);
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = `[${ts}] ${text}`;
  $kern.appendChild(d);
  while ($kern.childElementCount > 40) $kern.removeChild($kern.firstChild);
  $kern.parentElement.scrollTop = $kern.parentElement.scrollHeight;
}
setInterval(kernPush, 1800 + Math.random() * 1200);

// ---------- conversation ----------
const history = [];

function userLine(text) {
  const d = document.createElement('div');
  d.className = 'line usr';
  d.textContent = text;
  $boot.appendChild(d);
  $log.scrollTop = $log.scrollHeight;
}

function newAssistantLine() {
  const d = document.createElement('div');
  d.className = 'line sys';
  d.textContent = '';
  $boot.appendChild(d);
  return d;
}

const CMDS = {
  HELP: () => `commands: HELP · STATUS · NEW <description> · CLEAR · KEY\n         (or just type a question. lowercase fine.)`,
  STATUS: () => `tickets open: ${Math.floor(Math.random()*7)+1}.\nsystem temperature: nominal.\nmorale: questionable.`,
  CLEAR: () => {
    [...$boot.querySelectorAll('.line.usr, .line.sys')].forEach(n => n.remove());
    return null;
  },
  KEY: () => { window.ApiKey.resetApiKey(); return 'key cleared. next request will prompt.'; },
};

async function handle(raw) {
  const text = raw.trim();
  if (!text) return;
  userLine(text);

  const upper = text.toUpperCase();
  // builtin command?
  for (const k of Object.keys(CMDS)) {
    if (upper === k || upper.startsWith(k + ' ')) {
      const out = CMDS[k](text.slice(k.length).trim());
      if (out !== null) appendLine('sys', out, $boot);
      return;
    }
  }
  if (upper.startsWith('NEW ')) {
    const desc = text.slice(4);
    const id = 'TKT-' + String(Math.floor(Math.random() * 9000) + 1000);
    appendLine('warn', `ticket ${id} opened: ${desc}`, $boot);
    // continue to ask Qwen for triage advice
  }

  // LLM
  $ftrR.textContent = '~ TRANSMITTING ~';
  const line = newAssistantLine();
  try {
    const full = await window.LLM.chat({
      system: SYSTEM_PROMPT,
      user: text,
      history,
      onToken: (_, total) => {
        line.textContent = total;
        $log.scrollTop = $log.scrollHeight;
      },
    });
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: full });
    while (history.length > 12) history.shift();
  } catch (err) {
    line.className = 'line err';
    line.textContent = `link error: ${err.message}`;
  } finally {
    $ftrR.textContent = '~ READY ~';
  }
}

$cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const v = $cmd.value;
    $cmd.value = '';
    handle(v);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') { e.preventDefault(); window.ApiKey.resetApiKey(); appendLine('sys', 'key cleared.', $boot); }
});

// keep focus on the prompt
document.addEventListener('click', () => { if (!$promptRow.hidden) $cmd.focus(); });

runBoot();
