// THE IT ORACLE — three-card spread cartomancy for the network age.

// ---------- The deck ----------
// Each card: roman numeral, title, brief meaning that Qwen will read.
// Glyph is a small SVG drawn inline.

const DECK = [
  {
    n: 'I', name: "The Fool's DHCP",
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <circle cx="50" cy="50" r="32"/>
      <path d="M 50 18 L 50 50 L 76 60" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="2.5" fill="currentColor"/>
      <path d="M 22 78 L 30 70 M 78 78 L 70 70" stroke-linecap="round"/>
    </svg>`,
    meaning: 'New beginnings, blind assignment. An address granted without question. Trust the lease; doubt the resolver.'
  },
  {
    n: 'II', name: 'The Tangled Ethernet',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 20 30 C 50 20, 60 50, 80 35 S 30 60, 50 80" stroke-linecap="round"/>
      <path d="M 18 50 C 40 70, 70 40, 82 65"/>
      <circle cx="20" cy="30" r="3" fill="currentColor"/>
      <circle cx="80" cy="35" r="3" fill="currentColor"/>
      <circle cx="50" cy="80" r="3" fill="currentColor"/>
    </svg>`,
    meaning: 'Knot of cables. Misconnection. What you seek is plugged into the wrong port.'
  },
  {
    n: 'III', name: 'The Nine of DNS',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 50 12 L 50 88"/>
      <path d="M 50 30 L 30 50 M 50 30 L 70 50"/>
      <path d="M 50 50 L 28 70 M 50 50 L 72 70"/>
      <circle cx="50" cy="12" r="3" fill="currentColor"/>
      <circle cx="30" cy="50" r="2.5" fill="currentColor"/>
      <circle cx="70" cy="50" r="2.5" fill="currentColor"/>
      <circle cx="28" cy="70" r="2.5" fill="currentColor"/>
      <circle cx="72" cy="70" r="2.5" fill="currentColor"/>
    </svg>`,
    meaning: 'The tree of names. Resolution comes by descent. Ask the right authority, not the loudest.'
  },
  {
    n: 'IV', name: 'The Blue Screen',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <rect x="18" y="22" width="64" height="42" rx="2"/>
      <path d="M 26 32 L 50 32 M 26 40 L 70 40 M 26 48 L 44 48"/>
      <path d="M 30 70 L 70 70 M 38 70 L 38 78 M 62 70 L 62 78"/>
      <path d="M 22 26 L 78 60" stroke-width="1" opacity=".6"/>
    </svg>`,
    meaning: 'An interruption that is also a teaching. Reset what cannot be repaired. Read the small print before despair.'
  },
  {
    n: 'V', name: 'The Forgotten Password',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <circle cx="40" cy="50" r="14"/>
      <path d="M 54 50 L 82 50 M 70 50 L 70 62 M 78 50 L 78 58"/>
      <circle cx="40" cy="50" r="3" fill="currentColor"/>
    </svg>`,
    meaning: 'A key that no longer fits its lock. Reset, do not lament. The vault still remembers, even if you do not.'
  },
  {
    n: 'VI', name: 'The Infinite Loop',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 50 18 a 28 28 0 1 1 -28 28" stroke-linecap="round"/>
      <path d="M 22 46 L 14 38 M 22 46 L 30 38" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="currentColor"/>
    </svg>`,
    meaning: 'A wheel without a break condition. Step out of the cycle by changing one variable, however small.'
  },
  {
    n: 'VII', name: 'The Silent Fan',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <circle cx="50" cy="50" r="32"/>
      <path d="M 50 50 C 50 30, 70 28, 78 38 S 60 60, 50 50"/>
      <path d="M 50 50 C 70 50, 72 70, 62 78 S 40 60, 50 50"/>
      <path d="M 50 50 C 30 50, 28 30, 38 22 S 60 40, 50 50"/>
      <circle cx="50" cy="50" r="4" fill="currentColor"/>
    </svg>`,
    meaning: 'A heat hidden by stillness. What does not move is not at peace; it is overheating.'
  },
  {
    n: 'VIII', name: 'The Phantom Cursor',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 30 22 L 30 70 L 44 58 L 54 78 L 62 74 L 52 56 L 70 56 Z"/>
      <path d="M 22 30 C 14 28, 10 42, 14 50" opacity=".5"/>
      <path d="M 78 36 C 86 38, 86 50, 80 56" opacity=".5"/>
    </svg>`,
    meaning: 'Movement without hand. A daemon you cannot see. Trust the logs, not your eyes.'
  },
  {
    n: 'IX', name: 'The Tower of Permissions',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <rect x="36" y="18" width="28" height="64"/>
      <path d="M 36 32 L 64 32 M 36 50 L 64 50 M 36 68 L 64 68"/>
      <circle cx="50" cy="25" r="2.5" fill="currentColor"/>
      <circle cx="50" cy="41" r="2.5" fill="currentColor"/>
      <circle cx="50" cy="59" r="2.5" fill="currentColor"/>
      <circle cx="50" cy="76" r="2.5" fill="currentColor"/>
    </svg>`,
    meaning: 'Privilege ascends in tiers. You stand at the third floor; the answer is at the seventh.'
  },
  {
    n: 'X', name: 'The Stuck Spinner',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 50 18 a 32 32 0 1 1 -32 32" stroke-linecap="round"/>
      <path d="M 18 50 a 32 32 0 0 1 22 -30" stroke-linecap="round" opacity=".4"/>
    </svg>`,
    meaning: 'Purgatory. The wheel turns; the task does not. The timeout is your friend.'
  },
  {
    n: 'XI', name: 'The Expired Certificate',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <rect x="20" y="22" width="60" height="50" rx="2"/>
      <path d="M 28 36 L 60 36 M 28 46 L 56 46 M 28 56 L 48 56"/>
      <path d="M 26 76 L 70 28" stroke-width="3"/>
    </svg>`,
    meaning: 'A truth that was once witnessed and is so no longer. Renew the seal, and faith with it.'
  },
  {
    n: 'XII', name: 'The Fork Bomb',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 50 86 L 50 64"/>
      <path d="M 50 64 L 32 48 M 50 64 L 68 48"/>
      <path d="M 32 48 L 22 32 M 32 48 L 40 32"/>
      <path d="M 68 48 L 60 32 M 68 48 L 78 32"/>
      <path d="M 22 32 L 18 22 M 22 32 L 26 22"/>
      <path d="M 78 32 L 74 22 M 78 32 L 82 22"/>
    </svg>`,
    meaning: 'Multiplication without restraint. What replicates also exhausts. Limit it, or it limits you.'
  },
  {
    n: 'XIII', name: 'The 404',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <rect x="22" y="24" width="56" height="52"/>
      <path d="M 22 24 L 78 76 M 78 24 L 22 76" opacity=".5"/>
    </svg>`,
    meaning: 'An absence where a presence is named. The path lies; the file is elsewhere or never was.'
  },
  {
    n: 'XIV', name: 'The Update Pending',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <circle cx="50" cy="50" r="30"/>
      <path d="M 50 30 L 50 50 L 64 56"/>
      <path d="M 50 18 L 50 12 M 50 88 L 50 82" stroke-linecap="round"/>
    </svg>`,
    meaning: 'Time held in suspension. A patch waits. Decline only after you know what you decline.'
  },
  {
    n: 'XV', name: 'The Ghost in the Proxy',
    glyph: `<svg viewBox="0 0 100 100" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M 30 80 L 30 38 C 30 22, 70 22, 70 38 L 70 80 L 62 72 L 54 80 L 46 72 L 38 80 Z"/>
      <circle cx="42" cy="46" r="2.5" fill="currentColor"/>
      <circle cx="58" cy="46" r="2.5" fill="currentColor"/>
    </svg>`,
    meaning: 'Between two networks lives a third, unbidden. Bypass with care; you may be the one redirected.'
  },
];

// ---------- DOM ----------
const $form = document.getElementById('askForm');
const $aff = document.getElementById('affliction');
const $consult = document.getElementById('consult');
const $spread = document.getElementById('spread');
const $reading = document.getElementById('reading');
const $readingText = document.getElementById('readingText');
const $again = document.getElementById('again');
const $resetkey = document.getElementById('resetkey');
$resetkey.addEventListener('click', (e) => { e.preventDefault(); window.ApiKey.resetApiKey(); });

const CARD_BACK_SYM = `<svg class="back-symbol" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
  <circle cx="50" cy="50" r="40"/>
  <circle cx="50" cy="50" r="28" opacity=".7"/>
  <circle cx="50" cy="50" r="16" opacity=".5"/>
  <path d="M 50 6 L 50 94 M 6 50 L 94 50" opacity=".4"/>
  <path d="M 18 18 L 82 82 M 82 18 L 18 82" opacity=".3"/>
  <text x="50" y="56" font-family="Cormorant Garamond" font-size="22" text-anchor="middle" fill="currentColor" stroke="none" font-style="italic">i</text>
</svg>`;

function buildCardDom() {
  const ids = ['card-1', 'card-2', 'card-3'];
  ids.forEach(id => {
    const c = document.getElementById(id);
    c.innerHTML = `
      <div class="face back">${CARD_BACK_SYM}</div>
      <div class="face front">
        <div class="roman">·</div>
        <div class="glyph"></div>
        <div class="name">·</div>
      </div>`;
    c.classList.remove('flipped');
  });
}

function drawThree() {
  // Sample 3 distinct
  const pool = [...DECK];
  const picks = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function revealCards(picks) {
  for (let i = 0; i < 3; i++) {
    const c = document.getElementById('card-' + (i + 1));
    const front = c.querySelector('.front');
    front.querySelector('.roman').textContent = picks[i].n;
    front.querySelector('.glyph').innerHTML = picks[i].glyph;
    front.querySelector('.name').textContent = picks[i].name;
    await delay(650);
    c.classList.add('flipped');
  }
}

const SYSTEM_PROMPT = `You are THE IT ORACLE, a sibyl who reads tarot cards drawn from a deck of
modern IT afflictions. A querent has described their trouble and three cards have been drawn:
one for the past, one for the present, one for what shall pass. You will give them a reading.

Form:
- 3 short paragraphs, one per card, in this order: past, present, future.
- Each paragraph names the card explicitly (italics are not required; just write the name).
- Mystical register, but the diagnosis underneath must be technically real and useful.
  The reading should leave the querent with a concrete next step.
- No bullet points, no markdown, no emoji. Plain flowing prose.
- 110–180 words total. Stop at the third paragraph. Do not include a fourth.
- Address the querent as "you" or "querent."
- Refer to the cards by their full names.`;

const history = [];

async function consult(affliction, picks) {
  $reading.hidden = false;
  $readingText.textContent = 'the smoke gathers…';
  $readingText.classList.add('thinking');

  const cardsBlock = picks.map((c, i) => {
    const pos = ['past', 'present', 'future'][i];
    return `[${pos.toUpperCase()}] ${c.name} — ${c.meaning}`;
  }).join('\n');

  const user = `My affliction: ${affliction}\n\nThe cards drawn:\n${cardsBlock}\n\nRead them.`;

  try {
    let full = '';
    await window.LLM.chat({
      system: SYSTEM_PROMPT,
      user,
      history: [],
      onToken: (_, total) => {
        full = total;
        $readingText.classList.remove('thinking');
        $readingText.textContent = total;
      },
    });
    if (!full) $readingText.textContent = 'the cards are silent. try again.';
  } catch (err) {
    $readingText.classList.remove('thinking');
    $readingText.textContent = 'a veil descends: ' + err.message;
  }
}

async function doRitual(e) {
  if (e) e.preventDefault();
  const aff = $aff.value.trim();
  if (!aff) { $aff.focus(); return; }
  $consult.disabled = true;
  $consult.innerHTML = '<span class="b-glyph">⧗</span> Drawing…';
  $reading.hidden = true;

  buildCardDom();
  $spread.hidden = false;
  await delay(160);

  const picks = drawThree();
  await revealCards(picks);
  await delay(250);
  await consult(aff, picks);

  $consult.disabled = false;
  $consult.innerHTML = '<span class="b-glyph">✶</span> Draw Again';
}

$form.addEventListener('submit', doRitual);
$again.addEventListener('click', () => {
  $aff.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
