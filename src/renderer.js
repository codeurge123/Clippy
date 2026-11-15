import './index.css';

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const isMac = /Mac|iPhone|iPad/i.test(
  navigator.platform || navigator.userAgent,
);
const shortcut = (key) => (isMac ? `⌘${key}` : `Ctrl+${key}`);

const esc = (value = '') =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: fine, it's only a convenience */
    }
  },
};

const KEYS = {
  collections: 'clippy:collections',
  favorites: 'clippy:favorites',
  prefs: 'clippy:prefs',
  onboarded: 'clippy:onboarded',
};

const DAY = 86_400_000;
const RECENT_DAYS = 14;

/* ═══════════════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════════════ */

const svg = (paths) =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICON = {
  home: svg(
    '<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v8.5a1 1 0 0 0 1 1h3v-5h3v5h3a1 1 0 0 0 1-1V10"/>',
  ),
  all: svg(
    '<path d="M4 8.5 12 4.5l8 4-8 4z"/><path d="m4 12.5 8 4 8-4"/><path d="m4 16.5 8 4 8-4"/>',
  ),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  heart: svg(
    '<path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z"/>',
  ),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  copy: svg(
    '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
  ),
  trash: svg(
    '<path d="M5 7h14"/><path d="M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7"/><path d="m6.5 7 .8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7"/>',
  ),
  x: svg('<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>'),
  grid: svg(
    '<rect x="4.5" y="4.5" width="6" height="6" rx="1.6"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.6"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.6"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.6"/>',
  ),
  list: svg(
    '<path d="M9.5 7H20M9.5 12H20M9.5 17H20M4.5 7h1M4.5 12h1M4.5 17h1"/>',
  ),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  sidebar: svg(
    '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>',
  ),
  // kinds
  link: svg(
    '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  ),
  repo: svg(
    '<circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="8" r="2.2"/><path d="M7 8.2v7.6"/><path d="M17 10.2c0 3.6-4.2 3.4-8.6 6.2"/>',
  ),
  article: svg(
    '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  ),
  pdf: svg(
    '<path d="M14 3.5H8A2.5 2.5 0 0 0 5.5 6v12A2.5 2.5 0 0 0 8 20.5h8a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M9 13.5h6M9 16.5h4"/>',
  ),
  design: svg(
    '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.6 0-.8.6-1.4 1.6-1.4H16a4.5 4.5 0 0 0 4.5-4.5c0-3.9-3.8-6.8-8.5-6.8z"/><circle cx="8" cy="11.5" r="1" fill="currentColor"/><circle cx="11" cy="7.8" r="1" fill="currentColor"/><circle cx="15.4" cy="8.6" r="1" fill="currentColor"/>',
  ),
  ai: svg(
    '<path d="m11 3.5 1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2L4 10.5l5.2-1.8z"/><path d="M18.5 15.5v5M16 18h5"/>',
  ),
  video: svg(
    '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M10.5 9.5v5l4.2-2.5z"/>',
  ),
  note: svg(
    '<path d="M5.5 4.5h13v9l-5.5 6h-7.5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z"/><path d="M13 19.5v-5a1 1 0 0 1 1-1h4.5"/>',
  ),
};

/* ═══════════════════════════════════════════════════════════
   The mascot: a little paperclip friend
   ═══════════════════════════════════════════════════════════ */

const CLIP_PATH =
  'M18 32V68a12 12 0 0 0 24 0V24a16 16 0 0 0-32 0V72a20 20 0 0 0 40 0V36';

function mascot(mood = 'happy', size = 48) {
  const width = Math.round(size * 0.72);
  const openEyes = (lx = 25, rx = 35, y = 47) => `
    <g class="m-eyes">
      <circle class="m-face" cx="${lx}" cy="${y}" r="3.2"/>
      <circle class="m-face" cx="${rx}" cy="${y}" r="3.2"/>
      <circle class="m-glint" cx="${lx + 1.1}" cy="${y - 1.1}" r="1.05"/>
      <circle class="m-glint" cx="${rx + 1.1}" cy="${y - 1.1}" r="1.05"/>
    </g>`;
  const smile = '<path class="m-line" d="M27 53.6q3 3.2 6 0"/>';

  let face;
  switch (mood) {
    case 'joy':
      face = `<path class="m-line" d="M21.8 48q3.2-4 6.4 0M31.8 48q3.2-4 6.4 0"/>
              <path class="m-face" d="M26.6 53h6.8a3.4 3.4 0 0 1-6.8 0z"/>`;
      break;
    case 'sleepy':
      face = `<path class="m-line" d="M21.8 47q3.2 3 6.4 0M31.8 47q3.2 3 6.4 0"/>
              <path class="m-line" d="M28.4 55h3.2"/>`;
      break;
    case 'worried':
      face = `${openEyes()}
              <path class="m-line" d="m22 41.6 5-1.6M38 41.6l-5-1.6"/>
              <path class="m-line" d="M27.4 56q2.6-2.4 5.2 0"/>`;
      break;
    case 'curious':
      face = `${openEyes(25.8, 35.4, 46.2)}
              <circle class="m-face" cx="30.4" cy="54.8" r="1.7"/>`;
      break;
    default:
      face = `${openEyes()}${smile}`;
  }

  const rightArm =
    mood === 'wave' || mood === 'joy'
      ? '<path class="m-arm m-arm-r" d="M52 54q6-2 8-10"/>'
      : '<path class="m-arm m-arm-r" d="M52 58q6 1 9 7"/>';

  return `<svg class="mascot is-${mood}" viewBox="-6 0 72 100" width="${width}" height="${size}" aria-hidden="true">
    <path class="m-arm" d="M8 58q-6 1-9 7"/>
    ${rightArm}
    <path class="m-clip" d="${CLIP_PATH}"/>
    <path class="m-shine" d="M9.2 30v26M17.2 34v10"/>
    <ellipse class="m-cheek" cx="23.8" cy="53.4" rx="2" ry="1.3"/>
    <ellipse class="m-cheek" cx="36.2" cy="53.4" rx="2" ry="1.3"/>
    ${face}
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   Kinds
   ═══════════════════════════════════════════════════════════ */

const KINDS = {
  link: { label: 'Link' },
  repo: { label: 'Repo' },
  article: { label: 'Article' },
  pdf: { label: 'PDF' },
  design: { label: 'Design' },
  ai: { label: 'AI' },
  video: { label: 'Video' },
  note: { label: 'Note' },
};
const KIND_ORDER = Object.keys(KINDS);

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function detectKind(url) {
  if (!url) return 'note';
  let host = '';
  let path = '';
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, '').toLowerCase();
    path = u.pathname.toLowerCase();
  } catch {
    return 'link';
  }
  if (
    path.endsWith('.pdf') ||
    (host === 'arxiv.org' && path.startsWith('/pdf'))
  )
    return 'pdf';
  if (
    /(^|\.)(github\.com|gitlab\.com|codeberg\.org|bitbucket\.org|sourcehut\.org)$/.test(
      host,
    )
  )
    return 'repo';
  if (/(youtube\.com|youtu\.be|vimeo\.com|loom\.com|twitch\.tv)$/.test(host))
    return 'video';
  if (
    /(dribbble\.com|behance\.net|figma\.com|pinterest\.|awwwards\.com|mobbin\.com|savee\.it|are\.na|godly\.website|siteinspire\.com|fonts\.google\.com|coolors\.co|unsplash\.com)/.test(
      host,
    )
  )
    return 'design';
  if (
    /(openai\.com|anthropic\.com|claude\.ai|huggingface\.co|replicate\.com|perplexity\.ai|midjourney\.com|ollama\.com|langchain|kaggle\.com|deepmind)/.test(
      host,
    ) ||
    host.endsWith('.ai')
  )
    return 'ai';
  if (
    /(medium\.com|substack\.com|dev\.to|hashnode|news\.ycombinator\.com|wikipedia\.org|nytimes\.com|theverge\.com|smashingmagazine\.com|css-tricks\.com)/.test(
      host,
    ) ||
    /\/(blog|posts?|articles?|essays?|writing)\//.test(path) ||
    host.startsWith('blog.')
  )
    return 'article';
  return 'link';
}

function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function guessTitle(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);
    if (
      /github\.com|gitlab\.com|codeberg\.org/.test(host) &&
      parts.length >= 2
    ) {
      return `${parts[0]}/${parts[1]}`;
    }
    const last = parts.length
      ? decodeURIComponent(parts[parts.length - 1])
      : '';
    const cleaned = last
      .replace(/\.(html?|php|aspx?|pdf)$/i, '')
      .replace(/[-_+]+/g, ' ')
      .trim();
    if (cleaned && !/^\d+$/.test(cleaned) && cleaned.length > 2)
      return titleCase(cleaned);
    return host;
  } catch {
    return '';
  }
}

function looksLikeUrl(text) {
  const s = (text || '').trim();
  if (!s || /\s/.test(s) || s.length > 2048) return false;
  if (/^https?:\/\//i.test(s)) return true;
  return /^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(s);
}

function normalizeUrl(raw) {
  const s = (raw || '').trim();
  if (!s) return '';
  const withScheme = /^[a-z][\w+.-]*:\/\//i.test(s) ? s : `https://${s}`;
  try {
    return new URL(withScheme).href;
  } catch {
    return s;
  }
}

function safeHref(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    const s =
      u.hostname.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname);
    return s.length > 46 ? `${s.slice(0, 44)}…` : s;
  } catch {
    return url;
  }
}

/* ═══════════════════════════════════════════════════════════
   Data layer: everything goes through window.api (SQLite via IPC).
   There is no fallback store.
   ═══════════════════════════════════════════════════════════ */

const backend = window.api;

function requireBackend() {
  if (!backend) {
    throw new Error('window.api is missing: the database bridge did not load.');
  }
  return backend;
}

// Clean up anything an older build stored in browser storage.
try {
  localStorage.removeItem('clippy:local-clippings');
} catch {
  /* storage unavailable */
}

function parseDate(value) {
  if (!value) return new Date();
  let s = String(value);
  // SQLite CURRENT_TIMESTAMP is UTC without a zone: "YYYY-MM-DD HH:MM:SS"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s))
    s = `${s.replace(' ', 'T')}Z`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function encodeDescription({ url, note, kind }) {
  return JSON.stringify({ v: 1, url, note, kind });
}

function fromRow(row) {
  let meta;
  try {
    const parsed = JSON.parse(row.description);
    meta =
      parsed && typeof parsed === 'object' && parsed.v === 1
        ? parsed
        : { note: row.description };
  } catch {
    meta = { note: row.description || '' };
  }
  const url = meta.url || '';
  return {
    id: row.id,
    collection: row.Category ?? row.category ?? '',
    title: row.title || guessTitle(url) || 'Untitled',
    url,
    note: meta.note || '',
    kind: KINDS[meta.kind] ? meta.kind : detectKind(url),
    description: row.description,
    createdAt: parseDate(row.created_at),
  };
}

const COLORS = ['sage', 'butter', 'peach', 'rose', 'sky', 'lilac', 'sand'];
const EMOJIS = [
  '📚',
  '🌿',
  '🛠️',
  '✨',
  '🎨',
  '💡',
  '🧠',
  '🍵',
  '🎧',
  '📌',
  '🪴',
  '🧶',
  '🔖',
  '🚀',
  '🍰',
  '🌙',
];

const DEFAULT_COLLECTIONS = [
  { name: 'Reading list', emoji: '📚', color: 'butter' },
  { name: 'Inspiration', emoji: '🎨', color: 'peach' },
  { name: 'Dev tools', emoji: '🛠️', color: 'sky' },
  { name: 'AI corner', emoji: '✨', color: 'lilac' },
];

const state = {
  clips: [],
  collections:
    storage.get(KEYS.collections, null) ??
    DEFAULT_COLLECTIONS.map((c) => ({ ...c })),
  favorites: new Set(storage.get(KEYS.favorites, [])),
  prefs: {
    layout: 'grid',
    sort: 'newest',
    lastCollection: null,
    ...storage.get(KEYS.prefs, {}),
  },
  view: { type: 'home' },
  query: '',
  kind: 'all',
  loaded: false,
};

const saveCollections = () => storage.set(KEYS.collections, state.collections);
const saveFavorites = () => storage.set(KEYS.favorites, [...state.favorites]);
const savePrefs = () => storage.set(KEYS.prefs, state.prefs);
saveCollections();

const collectionByName = (name) =>
  state.collections.find((c) => c.name === name);

async function loadClips() {
  if (!backend) {
    state.loaded = true;
    console.error('[clippy] window.api is missing: clips cannot be loaded.');
    toast("Hmm, I couldn't reach your saved clips.", { mood: 'worried' });
    return;
  }
  const results = await Promise.allSettled(
    state.collections.map((c) => backend.getAllClippings(c.name)),
  );
  const rows = [];
  let failed = false;
  for (const r of results) {
    if (r.status === 'fulfilled') rows.push(...(r.value || []));
    else {
      failed = true;
      console.error('[clippy] could not load clippings:', r.reason);
    }
  }
  state.clips = rows.map(fromRow);
  state.loaded = true;

  if (!failed) {
    const ids = new Set(state.clips.map((c) => c.id));
    let changed = false;
    for (const id of state.favorites) {
      if (!ids.has(id)) {
        state.favorites.delete(id);
        changed = true;
      }
    }
    if (changed) saveFavorites();
  } else {
    toast("Hmm, I couldn't reach your saved clips.", { mood: 'worried' });
  }
}

function newestMatch(collection, title, description) {
  return state.clips
    .filter(
      (c) =>
        c.collection === collection &&
        c.title === title &&
        c.description === description,
    )
    .sort((a, b) => b.id - a.id)[0];
}

async function addClip({ collection, title, url, note, kind, favorite }) {
  const description = encodeDescription({ url, note, kind });
  await requireBackend().addDataToClippings(collection, title, description);
  await loadClips();
  if (favorite) {
    const created = newestMatch(collection, title, description);
    if (created) {
      state.favorites.add(created.id);
      saveFavorites();
    }
  }
}

async function removeClip(id) {
  await requireBackend().deleteDataFromClippings(id);
  state.clips = state.clips.filter((c) => c.id !== id);
  if (state.favorites.delete(id)) saveFavorites();
}

/* ═══════════════════════════════════════════════════════════
   Formatting
   ═══════════════════════════════════════════════════════════ */

function timeAgo(date) {
  const s = (Date.now() - date.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Escape text and wrap matches of the current search in <mark>. */
function hl(text = '') {
  const q = state.query;
  if (!q) return esc(text);
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  let out = '';
  let i = 0;
  let j;
  while ((j = lower.indexOf(ql, i)) !== -1) {
    out += `${esc(text.slice(i, j))}<mark>${esc(text.slice(j, j + q.length))}</mark>`;
    i = j + q.length;
  }
  return out + esc(text.slice(i));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Hello, night owl';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Hello, night owl';
}

/* ═══════════════════════════════════════════════════════════
   Selectors
   ═══════════════════════════════════════════════════════════ */

const isRecent = (c) => Date.now() - c.createdAt.getTime() < RECENT_DAYS * DAY;
const byNewest = (a, b) => b.createdAt - a.createdAt || b.id - a.id;

function matchesQuery(clip, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = [
    clip.title,
    clip.note,
    clip.url,
    clip.collection,
    KINDS[clip.kind]?.label,
  ]
    .join(' ')
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

function baseClipsForView() {
  if (state.query)
    return state.clips.filter((c) => matchesQuery(c, state.query));
  switch (state.view.type) {
    case 'recent':
      return state.clips.filter(isRecent);
    case 'favorites':
      return state.clips.filter((c) => state.favorites.has(c.id));
    case 'collection':
      return state.clips.filter((c) => c.collection === state.view.name);
    default:
      return state.clips;
  }
}

function sortClips(list) {
  const sorted = [...list];
  if (state.prefs.sort === 'oldest')
    sorted.sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
  else if (state.prefs.sort === 'az')
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  else sorted.sort(byNewest);
  return sorted;
}

/* ═══════════════════════════════════════════════════════════
   Rendering: sidebar
   ═══════════════════════════════════════════════════════════ */

const els = {
  nav: $('#nav'),
  collectionList: $('#collectionList'),
  view: $('#view'),
  search: $('#search'),
  toasts: $('#toasts'),
  app: $('#app'),
  brand: $('#brand'),
  sidebarToggle: $('#sidebarToggle'),
  buddyBubble: $('#buddyBubble'),
};

function renderSidebar() {
  const active = (type, name) =>
    !state.query &&
    state.view.type === type &&
    (name === undefined || state.view.name === name);

  const items = [
    { type: 'home', label: 'Home', icon: ICON.home },
    {
      type: 'all',
      label: 'All clips',
      icon: ICON.all,
      count: state.clips.length,
    },
    {
      type: 'recent',
      label: 'Recently added',
      icon: ICON.clock,
      count: state.clips.filter(isRecent).length,
    },
    {
      type: 'favorites',
      label: 'Favorites',
      icon: ICON.heart,
      count: state.clips.filter((c) => state.favorites.has(c.id)).length,
    },
  ];

  els.nav.innerHTML = items
    .map(
      (it) => `
      <button class="nav-item ${active(it.type) ? 'is-active' : ''}" type="button"
        data-action="nav" data-view="${it.type}" title="${it.label}"
        ${active(it.type) ? 'aria-current="page"' : ''}>
        ${it.icon}
        <span class="label">${it.label}</span>
        ${it.count ? `<span class="count">${it.count}</span>` : ''}
      </button>`,
    )
    .join('');

  els.collectionList.innerHTML = state.collections.length
    ? state.collections
        .map((c) => {
          const count = state.clips.filter(
            (x) => x.collection === c.name,
          ).length;
          const on = active('collection', c.name);
          return `<li>
            <button class="nav-item collection-item ${on ? 'is-active' : ''}" type="button"
              data-action="open-collection" data-name="${esc(c.name)}" title="${esc(c.name)}"
              ${on ? 'aria-current="page"' : ''}>
              <span class="coll-dot" style="--cc: var(--c-${c.color})">${c.emoji}</span>
              <span class="label">${esc(c.name)}</span>
              ${count ? `<span class="count">${count}</span>` : ''}
            </button>
          </li>`;
        })
        .join('')
    : `<li class="collection-empty">No collections yet.</li>`;
}

/* ═══════════════════════════════════════════════════════════
   Rendering: pieces
   ═══════════════════════════════════════════════════════════ */

function clipCard(clip, index = 0, { showCollection = true } = {}) {
  const kind = KINDS[clip.kind] ? clip.kind : 'link';
  const coll = collectionByName(clip.collection);
  const fav = state.favorites.has(clip.id);
  const href = safeHref(clip.url);
  const titleHtml = hl(clip.title);
  const domain = clip.url ? hostOf(clip.url) || clip.url : '';

  return `
    <article class="card" data-id="${clip.id}" style="--i:${index}">
      <div class="card-head">
        <span class="kind-tile" style="--kc: var(--k-${kind})">${ICON[kind]}</span>
        <span class="kind-label">${KINDS[kind].label}</span>
        <span class="card-time" data-ts="${clip.createdAt.getTime()}" title="${esc(clip.createdAt.toLocaleString())}">${timeAgo(clip.createdAt)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${
          href
            ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(href)}">${titleHtml}</a>`
            : titleHtml
        }</h3>
        ${clip.note ? `<p class="card-note">${hl(clip.note)}</p>` : ''}
        <div class="card-foot">
          ${domain ? `<span class="card-domain">${hl(domain)}</span>` : ''}
          ${
            showCollection && coll
              ? `<button class="coll-pill" type="button" data-action="open-collection" data-name="${esc(coll.name)}"
                   style="--cc: var(--c-${coll.color})" title="Open ${esc(coll.name)}">${coll.emoji} ${esc(coll.name)}</button>`
              : ''
          }
        </div>
      </div>
      <div class="card-side">
        <div class="card-actions">
          ${
            href
              ? `<button class="icon-btn sm" type="button" data-action="copy" data-id="${clip.id}" title="Copy link" aria-label="Copy link">${ICON.copy}</button>`
              : ''
          }
          <button class="icon-btn sm danger" type="button" data-action="delete" data-id="${clip.id}" title="Delete" aria-label="Delete">${ICON.trash}</button>
        </div>
        <button class="fav-btn ${fav ? 'is-on' : ''}" type="button" data-action="toggle-fav" data-id="${clip.id}"
          aria-pressed="${fav}" aria-label="${fav ? 'Remove from favorites' : 'Add to favorites'}"
          title="${fav ? 'Unfavorite' : 'Favorite'}">${ICON.heart}</button>
      </div>
    </article>`;
}

function clipGrid(list, opts) {
  return `<div class="clips ${state.prefs.layout === 'list' ? 'is-list' : ''}">
    ${list.map((c, i) => clipCard(c, i, opts)).join('')}
  </div>`;
}

function emptyState({ title, text, action = true, compact = false }) {
  return `
    <div class="empty ${compact ? 'compact' : ''}">
      <h2>${title}</h2>
      <p>${text}</p>
      ${
        action
          ? `<button class="btn btn-primary" type="button" data-action="quick-add">${ICON.plus} Clip something</button>`
          : ''
      }
    </div>`;
}

function collectionTile(c) {
  const count = state.clips.filter((x) => x.collection === c.name).length;
  return `
    <button class="coll-tile" type="button" data-action="open-collection" data-name="${esc(c.name)}"
      style="--cc: var(--c-${c.color})">
      <span class="coll-tile-emoji">${c.emoji}</span>
      <span class="coll-tile-name">${esc(c.name)}</span>
      <span class="coll-tile-count">${count ? plural(count, 'clip') : 'empty, for now'}</span>
    </button>`;
}

/* ═══════════════════════════════════════════════════════════
   Rendering: views
   ═══════════════════════════════════════════════════════════ */

function viewHome() {
  const total = state.clips.length;
  const thisWeek = state.clips.filter(
    (c) => Date.now() - c.createdAt.getTime() < 7 * DAY,
  ).length;
  const favCount = state.clips.filter((c) => state.favorites.has(c.id)).length;
  const usedCollections = new Set(state.clips.map((c) => c.collection)).size;

  const hero = `
    <section class="hero">
      <div class="hero-text">
        <h1>${greeting()}.</h1>
        <p>${
          total
            ? `You've tucked away ${plural(total, 'little find')} across ${plural(usedCollections, 'collection')}.`
            : `Welcome to your little digital home. Let's keep something nice.`
        }</p>
        ${
          total
            ? `<div class="hero-stats">
                 <span class="stat-chip">🌱 <b>${thisWeek}</b> this week</span>
                 <span class="stat-chip">💛 <b>${favCount}</b> favorite${favCount === 1 ? '' : 's'}</span>
               </div>`
            : ''
        }
      </div>
    </section>`;

  if (!total) {
    return `${hero}
      ${emptyState({
        title: 'Your nook is empty, for now',
        text: `Paste a link anywhere, drag one onto the window, or press <kbd>${shortcut('N')}</kbd> to clip your first find.`,
      })}
      <section class="section" style="margin-top: 32px">
        <div class="section-head"><h2>Your collections</h2></div>
        <div class="coll-tiles">${state.collections.map(collectionTile).join('')}${newCollectionTile()}</div>
      </section>`;
  }

  const recent = [...state.clips].sort(byNewest).slice(0, 4);
  const favs = state.clips
    .filter((c) => state.favorites.has(c.id))
    .sort(byNewest)
    .slice(0, 5);

  return `
    ${hero}
    <section class="section">
      <div class="section-head">
        <h2>Freshly clipped</h2>
        <button class="link-btn" type="button" data-action="nav" data-view="recent">See all ${ICON.arrow}</button>
      </div>
      ${clipGrid(recent)}
    </section>

    <section class="section">
      <div class="section-head"><h2>Your collections</h2></div>
      <div class="coll-tiles">${state.collections.map(collectionTile).join('')}${newCollectionTile()}</div>
    </section>

    ${
      favs.length
        ? `<section class="section">
            <div class="section-head">
              <h2>Little favorites</h2>
              <button class="link-btn" type="button" data-action="nav" data-view="favorites">See all ${ICON.arrow}</button>
            </div>
            <div class="fav-rows">
              ${favs
                .map((c) => {
                  const href = safeHref(c.url);
                  const kind = KINDS[c.kind] ? c.kind : 'link';
                  const inner = `
                    <span class="kind-tile" style="--kc: var(--k-${kind})">${ICON[kind]}</span>
                    <span class="fav-row-title">${esc(c.title)}</span>
                    <span class="fav-row-meta">${c.url ? esc(hostOf(c.url)) : esc(c.collection)}</span>
                    <span class="heart-mini">${ICON.heart}</span>`;
                  return href
                    ? `<a class="fav-row" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
                    : `<div class="fav-row">${inner}</div>`;
                })
                .join('')}
            </div>
          </section>`
        : ''
    }`;
}

function newCollectionTile() {
  return `<button class="coll-tile is-new" type="button" data-action="new-collection">${ICON.plus} New collection</button>`;
}

function viewLibrary() {
  const base = baseClipsForView();
  const kindsPresent = KIND_ORDER.filter((k) => base.some((c) => c.kind === k));
  if (state.kind !== 'all' && !kindsPresent.includes(state.kind))
    state.kind = 'all';
  const filtered =
    state.kind === 'all' ? base : base.filter((c) => c.kind === state.kind);
  const list = sortClips(filtered);

  /* header */
  let head;
  const v = state.view;
  if (state.query) {
    head = libHead({
      icon: ICON.search,
      title: `Results for “${esc(state.query)}”`,
      sub: base.length
        ? `Found ${plural(base.length, 'clip')}.`
        : 'Nothing yet.',
    });
  } else if (v.type === 'collection') {
    const c = collectionByName(v.name);
    head = libHead({
      emoji: c?.emoji ?? '📁',
      color: c?.color,
      title: esc(v.name),
      sub: base.length
        ? `${plural(base.length, 'clip')} on this shelf.`
        : 'A fresh, empty shelf.',
      actions: `
        <button class="btn btn-soft" type="button" data-action="quick-add" data-collection="${esc(v.name)}">${ICON.plus} Clip here</button>
        <button class="icon-btn danger" type="button" data-action="delete-collection" data-name="${esc(v.name)}"
          title="Delete collection" aria-label="Delete collection">${ICON.trash}</button>`,
    });
  } else {
    const meta = {
      all: {
        icon: ICON.all,
        title: 'All clips',
        sub: "Everything you've kept, in one cozy pile.",
      },
      recent: {
        icon: ICON.clock,
        title: 'Recently added',
        sub: `What you've clipped over the last ${RECENT_DAYS} days.`,
      },
      favorites: {
        icon: ICON.heart,
        title: 'Favorites',
        sub: 'The ones that made you go “oh, nice.”',
      },
    }[v.type];
    head = libHead(meta);
  }

  /* empty */
  if (!base.length) {
    let empty;
    if (state.query)
      empty = emptyState({
        title: 'I looked everywhere…',
        text: `No clips match “${esc(state.query)}”. Maybe try a different word?`,
        action: false,
      });
    else if (v.type === 'collection')
      empty = emptyState({
        title: 'Nothing here yet',
        text: 'This shelf is waiting for its very first treasure.',
      });
    else if (v.type === 'favorites')
      empty = emptyState({
        title: 'No favorites yet',
        text: 'Tap the little heart on any clip and it will come live here.',
        action: false,
      });
    else if (v.type === 'recent')
      empty = emptyState({
        title: 'Quiet couple of weeks',
        text: "You haven't clipped anything lately. Found something lovely?",
      });
    else
      empty = emptyState({
        title: 'Your nook is empty, for now',
        text: `Paste a link anywhere or press <kbd>${shortcut('N')}</kbd> to clip your first find.`,
      });
    return head + empty;
  }

  /* toolbar */
  const chips =
    kindsPresent.length > 1
      ? [
          `<button class="filter-chip ${state.kind === 'all' ? 'is-active' : ''}" type="button" data-action="filter" data-kind="all">All <span class="n">${base.length}</span></button>`,
          ...kindsPresent.map((k) => {
            const n = base.filter((c) => c.kind === k).length;
            return `<button class="filter-chip ${state.kind === k ? 'is-active' : ''}" type="button" data-action="filter" data-kind="${k}">${ICON[k]} ${KINDS[k].label} <span class="n">${n}</span></button>`;
          }),
        ].join('')
      : '';

  const toolbar = `
    <div class="toolbar">
      <div class="filter-chips">${chips}</div>
      <div class="toolbar-right">
        ${
          v.type === 'recent' && !state.query
            ? ''
            : `<select class="select" data-action="sort" aria-label="Sort clips">
                 <option value="newest" ${state.prefs.sort === 'newest' ? 'selected' : ''}>Newest first</option>
                 <option value="oldest" ${state.prefs.sort === 'oldest' ? 'selected' : ''}>Oldest first</option>
                 <option value="az" ${state.prefs.sort === 'az' ? 'selected' : ''}>A → Z</option>
               </select>`
        }
        <div class="seg" role="group" aria-label="Layout">
          <button type="button" class="${state.prefs.layout === 'grid' ? 'is-active' : ''}" data-action="layout" data-layout="grid" title="Grid" aria-label="Grid layout">${ICON.grid}</button>
          <button type="button" class="${state.prefs.layout === 'list' ? 'is-active' : ''}" data-action="layout" data-layout="list" title="List" aria-label="List layout">${ICON.list}</button>
        </div>
      </div>
    </div>`;

  const showCollection = v.type !== 'collection' || Boolean(state.query);

  /* recent view: grouped by day */
  if (v.type === 'recent' && !state.query) {
    const groups = [
      ['Today', (d) => d < 1],
      ['Yesterday', (d) => d >= 1 && d < 2],
      ['Earlier this week', (d) => d >= 2 && d < 7],
      ['Last week', (d) => d >= 7],
    ];
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const daysAgo = (c) =>
      Math.ceil((startOfToday - c.createdAt.getTime()) / DAY);
    const sorted = [...filtered].sort(byNewest);
    const body = groups
      .map(([label, test]) => {
        const items = sorted.filter((c) => test(Math.max(0, daysAgo(c))));
        return items.length
          ? `<div class="group-label">${label}</div>${clipGrid(items, { showCollection })}`
          : '';
      })
      .join('');
    return head + toolbar + body;
  }

  return head + toolbar + clipGrid(list, { showCollection });
}

function libHead({ icon, emoji, color, title, sub, actions = '' }) {
  return `
    <header class="lib-head">
      <span class="lib-head-icon" ${color ? `style="--cc: var(--c-${color})"` : ''}>${emoji ?? icon}</span>
      <div class="lib-head-text">
        <h1>${title}</h1>
        <p>${sub}</p>
      </div>
      ${actions ? `<div class="lib-head-actions">${actions}</div>` : ''}
    </header>`;
}

function renderView() {
  if (!state.loaded) {
    els.view.innerHTML = '';
    return;
  }
  const html =
    !state.query && state.view.type === 'home' ? viewHome() : viewLibrary();
  els.view.innerHTML = `<div class="view-inner">${html}</div>`;
}

function render() {
  renderSidebar();
  renderView();
}

function navigate(view) {
  state.view = view;
  state.query = '';
  state.kind = 'all';
  els.search.value = '';
  render();
  els.view.scrollTop = 0;
}

/* ═══════════════════════════════════════════════════════════
   Toasts
   ═══════════════════════════════════════════════════════════ */

function toast(
  message,
  { mood = 'joy', actionLabel, onAction, duration = 3200 } = {},
) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${mascot(mood, 26)}<span class="toast-msg">${esc(message)}</span>`;
  if (actionLabel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => {
      dismiss();
      onAction?.();
    });
    el.append(btn);
  }
  els.toasts.append(el);
  while (els.toasts.children.length > 3) els.toasts.firstElementChild.remove();

  let timer = setTimeout(dismiss, duration);
  el.addEventListener('mouseenter', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => (timer = setTimeout(dismiss, 1500)));

  function dismiss() {
    clearTimeout(timer);
    if (!el.isConnected) return;
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

function celebrate() {
  const buddy = $('.buddy-mascot');
  buddy.classList.remove('is-wiggling');
  void buddy.offsetWidth;
  buddy.classList.add('is-wiggling');
}

/* ═══════════════════════════════════════════════════════════
   Sidebar open / close
   ═══════════════════════════════════════════════════════════ */

// Closed = a slim icon rail that still works. Narrow windows always use the rail.
const narrowWindow = window.matchMedia('(max-width: 760px)');

function applySidebar() {
  const narrow = narrowWindow.matches;
  const open = !narrow && state.prefs.sidebar !== 'closed';
  els.app.classList.toggle('is-rail', !open);
  els.sidebarToggle.hidden = narrow;
  els.sidebarToggle.setAttribute('aria-expanded', String(open));
  const label = `${open ? 'Collapse' : 'Expand'} sidebar (${shortcut('\\')})`;
  els.sidebarToggle.setAttribute('aria-label', label);
  els.sidebarToggle.title = label;
}

function toggleSidebar() {
  if (narrowWindow.matches) return;
  state.prefs.sidebar = state.prefs.sidebar === 'closed' ? 'open' : 'closed';
  savePrefs();
  applySidebar();
}

narrowWindow.addEventListener('change', applySidebar);

/* ═══════════════════════════════════════════════════════════
   Quick add
   ═══════════════════════════════════════════════════════════ */

const qa = {
  dialog: $('#quickAdd'),
  form: $('#quickAddForm'),
  url: $('#qaUrl'),
  title: $('#qaTitle'),
  note: $('#qaNote'),
  fav: $('#qaFav'),
  collections: $('#qaCollections'),
  kinds: $('#qaKinds'),
  kindHint: $('#qaKindHint'),
  error: $('#qaError'),
  submit: $('#qaSubmit'),
  hint: $('#clipboardHint'),
  hintText: $('#clipboardHintText'),
  mascot: $('#qaMascot'),
  draft: null,
  clipboardUrl: '',
};

function defaultCollection(preferred) {
  const names = state.collections.map((c) => c.name);
  if (preferred && names.includes(preferred)) return preferred;
  if (state.view.type === 'collection' && names.includes(state.view.name))
    return state.view.name;
  if (names.includes(state.prefs.lastCollection))
    return state.prefs.lastCollection;
  return names[0];
}

function openQuickAdd(prefill = {}) {
  if (anyDialogOpen()) return;
  if (!state.collections.length) {
    openCollectionDialog({ onCreate: () => openQuickAdd(prefill) });
    return;
  }

  qa.draft = {
    collection: defaultCollection(prefill.collection),
    kind: 'note',
    titleTouched: false,
    kindTouched: false,
  };
  qa.url.value = '';
  qa.title.value = '';
  qa.note.value = prefill.note || '';
  qa.fav.checked = false;
  qa.error.textContent = '';
  qa.hint.hidden = true;
  qa.clipboardUrl = '';
  qa.submit.disabled = false;
  $$('.is-invalid', qa.form).forEach((el) => el.classList.remove('is-invalid'));
  qa.mascot.innerHTML = mascot('happy', 70);
  qa.mascot.classList.remove('is-happy');

  if (prefill.url) applyUrl(prefill.url, true);
  renderQaCollections();
  renderQaKinds();

  qa.dialog.showModal();
  (prefill.url ? qa.title : qa.url).focus();
  if (prefill.url) qa.title.select();
  else offerClipboard();
}

function applyUrl(raw, setField = false) {
  if (setField) qa.url.value = raw;
  const url = normalizeUrl(raw);
  if (!qa.draft.kindTouched) qa.draft.kind = detectKind(url);
  if (!qa.draft.titleTouched) qa.title.value = guessTitle(url);
  qa.url.classList.remove('is-invalid');
  renderQaKinds();
}

async function offerClipboard() {
  try {
    const text = (await navigator.clipboard.readText())?.trim();
    if (!qa.dialog.open || qa.url.value || !looksLikeUrl(text)) return;
    qa.clipboardUrl = text;
    qa.hintText.textContent = shortUrl(normalizeUrl(text));
    qa.hint.hidden = false;
  } catch {
    /* clipboard access not granted: that's fine */
  }
}

function renderQaCollections() {
  qa.collections.innerHTML =
    state.collections
      .map((c) => {
        const on = c.name === qa.draft.collection;
        return `<button type="button" class="chip" role="radio" aria-checked="${on}"
          data-action="qa-collection" data-name="${esc(c.name)}" style="--cc: var(--c-${c.color})">
          ${c.emoji} ${esc(c.name)}</button>`;
      })
      .join('') +
    `<button type="button" class="chip is-add" data-action="qa-new-collection">${ICON.plus} New</button>`;
}

function renderQaKinds() {
  qa.kinds.innerHTML = KIND_ORDER.map((k) => {
    const on = k === qa.draft.kind;
    return `<button type="button" class="chip" role="radio" aria-checked="${on}"
      data-action="qa-kind" data-kind="${k}" style="--cc: var(--k-${k})">${ICON[k]} ${KINDS[k].label}</button>`;
  }).join('');
  qa.kindHint.textContent = qa.draft.kindTouched
    ? 'picked by you'
    : 'auto-detected';
}

async function submitQuickAdd(e) {
  e.preventDefault();
  const url = normalizeUrl(qa.url.value);
  let title = qa.title.value.trim();
  const note = qa.note.value.trim();
  qa.error.textContent = '';

  if (url && !safeHref(url)) {
    qa.url.classList.add('is-invalid');
    qa.error.textContent =
      'That link looks a little off. Try one starting with https://';
    qa.url.focus();
    return;
  }
  if (!title) title = guessTitle(url);
  if (!title && !note) {
    const target = url ? qa.title : qa.url;
    target.classList.remove('is-invalid');
    void target.offsetWidth;
    target.classList.add('is-invalid');
    qa.error.textContent = 'Give me a link or a title to hold on to.';
    target.focus();
    return;
  }
  if (!title) title = note.split('\n')[0].slice(0, 80);

  const collection = qa.draft.collection;
  const kind = url ? qa.draft.kind : 'note';
  qa.submit.disabled = true;

  try {
    await addClip({
      collection,
      title,
      url,
      note,
      kind,
      favorite: qa.fav.checked,
    });
  } catch (err) {
    console.error('[clippy] save failed:', err);
    qa.submit.disabled = false;
    qa.error.textContent = "Oh no, I couldn't save that. Mind trying again?";
    return;
  }

  state.prefs.lastCollection = collection;
  savePrefs();

  qa.mascot.innerHTML = mascot('joy', 70);
  qa.mascot.classList.add('is-happy');
  setTimeout(() => {
    qa.dialog.close();
    render();
    celebrate();
    const c = collectionByName(collection);
    toast(`Clipped to ${c?.emoji ?? ''} ${collection}!`, { mood: 'joy' });
  }, 380);
}

qa.form.addEventListener('submit', submitQuickAdd);
qa.url.addEventListener('input', () => {
  qa.hint.hidden = Boolean(qa.url.value) || !qa.clipboardUrl;
  applyUrl(qa.url.value);
});
qa.title.addEventListener('input', () => {
  qa.draft.titleTouched = qa.title.value.trim() !== '';
  qa.title.classList.remove('is-invalid');
  qa.error.textContent = '';
});

/* ═══════════════════════════════════════════════════════════
   New collection
   ═══════════════════════════════════════════════════════════ */

const nc = {
  dialog: $('#collectionDialog'),
  form: $('#collectionForm'),
  name: $('#ncName'),
  emojis: $('#ncEmojis'),
  colors: $('#ncColors'),
  preview: $('#ncPreview'),
  previewEmoji: $('#ncPreviewEmoji'),
  previewName: $('#ncPreviewName'),
  error: $('#ncError'),
  draft: null,
  onCreate: null,
};

function openCollectionDialog({ onCreate } = {}) {
  const used = new Set(state.collections.map((c) => c.emoji));
  nc.draft = {
    emoji: EMOJIS.find((e) => !used.has(e)) ?? EMOJIS[0],
    color: COLORS[state.collections.length % COLORS.length],
  };
  nc.onCreate = onCreate ?? null;
  nc.name.value = '';
  nc.error.textContent = '';
  nc.name.classList.remove('is-invalid');
  renderNc();
  nc.dialog.showModal();
  nc.name.focus();
}

function renderNc() {
  nc.emojis.innerHTML = EMOJIS.map(
    (e) =>
      `<button type="button" role="radio" aria-checked="${e === nc.draft.emoji}" data-action="nc-emoji" data-emoji="${e}" aria-label="${e}">${e}</button>`,
  ).join('');
  nc.colors.innerHTML = COLORS.map(
    (c) =>
      `<button type="button" class="swatch" role="radio" aria-checked="${c === nc.draft.color}" data-action="nc-color" data-color="${c}" style="--cc: var(--c-${c})" aria-label="${c}" title="${c}"></button>`,
  ).join('');
  updateNcPreview();
}

function updateNcPreview() {
  nc.preview.style.setProperty('--cc', `var(--c-${nc.draft.color})`);
  if (nc.previewEmoji.textContent !== nc.draft.emoji) {
    nc.previewEmoji.textContent = nc.draft.emoji;
    nc.previewEmoji.style.animation = 'none';
    void nc.previewEmoji.offsetWidth;
    nc.previewEmoji.style.animation = '';
  }
  nc.previewName.textContent = nc.name.value.trim() || 'Untitled shelf';
}

nc.name.addEventListener('input', () => {
  nc.error.textContent = '';
  nc.name.classList.remove('is-invalid');
  updateNcPreview();
});

nc.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nc.name.value.trim().replace(/\s+/g, ' ');
  const invalid = (msg) => {
    nc.error.textContent = msg;
    nc.name.classList.remove('is-invalid');
    void nc.name.offsetWidth;
    nc.name.classList.add('is-invalid');
    nc.name.focus();
  };
  if (!name) return invalid('Every shelf needs a name.');
  if (
    state.collections.some((c) => c.name.toLowerCase() === name.toLowerCase())
  )
    return invalid('You already have a collection called that.');

  const collection = { name, emoji: nc.draft.emoji, color: nc.draft.color };
  state.collections.push(collection);
  saveCollections();
  nc.dialog.close();
  renderSidebar();
  const cb = nc.onCreate;
  nc.onCreate = null;
  if (cb) cb(collection);
  else navigate({ type: 'collection', name });
  toast(`Made a new shelf: ${collection.emoji} ${name}`, { mood: 'joy' });
});

/* ═══════════════════════════════════════════════════════════
   Confirm
   ═══════════════════════════════════════════════════════════ */

function confirmDialog({ title, message, okLabel = 'Delete' }) {
  const dialog = $('#confirmDialog');
  $('#cfHeading').textContent = title;
  $('#cfMessage').textContent = message;
  $('#cfOk').textContent = okLabel;
  dialog.showModal();
  $('#cfCancel').focus();
  return new Promise((resolve) => {
    const done = (value) => {
      dialog.removeEventListener('close', onClose);
      $('#cfOk').onclick = null;
      $('#cfCancel').onclick = null;
      if (dialog.open) dialog.close();
      resolve(value);
    };
    const onClose = () => done(false);
    dialog.addEventListener('close', onClose);
    $('#cfOk').onclick = () => done(true);
    $('#cfCancel').onclick = () => done(false);
  });
}

/* ═══════════════════════════════════════════════════════════
   Actions
   ═══════════════════════════════════════════════════════════ */

function anyDialogOpen() {
  return $$('dialog').some((d) => d.open);
}

function toggleFavorite(id, button) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  saveFavorites();
  const on = state.favorites.has(id);

  if (state.view.type === 'favorites' && !on && !state.query) {
    const card = button.closest('.card');
    card?.classList.add('is-leaving');
    setTimeout(render, 220);
    return;
  }
  button.classList.toggle('is-on', on);
  button.setAttribute('aria-pressed', String(on));
  button.title = on ? 'Unfavorite' : 'Favorite';
  button.classList.remove('pop');
  void button.offsetWidth;
  button.classList.add('pop');
  renderSidebar();
  if (state.view.type === 'home' && !state.query) setTimeout(renderView, 450);
  if (on) toast('Added to favorites', { mood: 'joy', duration: 1800 });
}

async function deleteClip(id, button) {
  const clip = state.clips.find((c) => c.id === id);
  if (!clip) return;
  const wasFav = state.favorites.has(id);
  const card = button?.closest('.card');
  card?.classList.add('is-leaving');

  try {
    await removeClip(id);
  } catch (err) {
    console.error('[clippy] delete failed:', err);
    card?.classList.remove('is-leaving');
    toast("I couldn't delete that one.", { mood: 'worried' });
    return;
  }
  setTimeout(render, card ? 200 : 0);

  toast(
    `Let go of “${clip.title.length > 28 ? `${clip.title.slice(0, 26)}…` : clip.title}”`,
    {
      mood: 'sleepy',
      actionLabel: 'Undo',
      duration: 6000,
      onAction: async () => {
        try {
          await requireBackend().addDataToClippings(
            clip.collection,
            clip.title,
            clip.description,
          );
          await loadClips();
          if (wasFav) {
            const restored = newestMatch(
              clip.collection,
              clip.title,
              clip.description,
            );
            if (restored) {
              state.favorites.add(restored.id);
              saveFavorites();
            }
          }
          render();
          toast('Back where it belongs', { mood: 'joy', duration: 1800 });
        } catch (err) {
          console.error('[clippy] undo failed:', err);
          toast("Couldn't bring it back, sorry.", { mood: 'worried' });
        }
      },
    },
  );
}

async function deleteCollection(name) {
  const items = state.clips.filter((c) => c.collection === name);
  const ok = await confirmDialog({
    title: `Let go of “${name}”?`,
    message: items.length
      ? `Its ${plural(items.length, 'clip')} will be deleted too. This can't be undone.`
      : 'This shelf is empty, so nothing else will be lost.',
    okLabel: 'Delete collection',
  });
  if (!ok) return;
  try {
    for (const item of items) await removeClip(item.id);
  } catch (err) {
    console.error('[clippy] delete collection failed:', err);
    toast('Something went wrong deleting that shelf.', { mood: 'worried' });
    await loadClips();
    render();
    return;
  }
  state.collections = state.collections.filter((c) => c.name !== name);
  saveCollections();
  if (state.prefs.lastCollection === name) {
    state.prefs.lastCollection = null;
    savePrefs();
  }
  navigate({ type: 'home' });
  toast('Collection deleted', { mood: 'sleepy' });
}

async function copyLink(id) {
  const clip = state.clips.find((c) => c.id === id);
  if (!clip?.url) return;
  try {
    await navigator.clipboard.writeText(clip.url);
    toast('Link copied. Off you go!', { mood: 'joy', duration: 1800 });
  } catch {
    toast("Couldn't reach the clipboard.", { mood: 'worried' });
  }
}

/* Buddy tips in the sidebar */
const TIPS = [
  'Psst, paste a link anywhere and I’ll catch it.',
  `Press ${shortcut('K')} to find anything in a blink.`,
  'Drag a link from your browser right onto the window.',
  'Hearts make the good stuff easy to find later. ♥',
  'A little note helps future-you remember why.',
  'Collections can be anything: moods, projects, rabbit holes.',
  `${shortcut('N')} opens the clip box from anywhere.`,
];
let tipIndex = Math.floor(Math.random() * TIPS.length);

function showTip(next = false) {
  if (next) tipIndex = (tipIndex + 1) % TIPS.length;
  els.buddyBubble.textContent = TIPS[tipIndex];
  els.buddyBubble.style.animation = 'none';
  void els.buddyBubble.offsetWidth;
  els.buddyBubble.style.animation = '';
}

/* ═══════════════════════════════════════════════════════════
   Event wiring
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action } = el.dataset;
  const id = el.dataset.id ? Number(el.dataset.id) : null;

  switch (action) {
    case 'nav':
      navigate({ type: el.dataset.view });
      break;
    case 'open-collection':
      navigate({ type: 'collection', name: el.dataset.name });
      break;
    case 'quick-add':
      openQuickAdd({ collection: el.dataset.collection });
      break;
    case 'new-collection':
      openCollectionDialog();
      break;
    case 'delete-collection':
      deleteCollection(el.dataset.name);
      break;
    case 'toggle-fav':
      toggleFavorite(id, el);
      break;
    case 'delete':
      deleteClip(id, el);
      break;
    case 'copy':
      copyLink(id);
      break;
    case 'filter':
      state.kind = el.dataset.kind;
      renderView();
      break;
    case 'layout':
      state.prefs.layout = el.dataset.layout;
      savePrefs();
      renderView();
      break;
    case 'close-dialog':
      el.closest('dialog')?.close();
      break;
    case 'use-clipboard':
      applyUrl(qa.clipboardUrl, true);
      qa.hint.hidden = true;
      qa.title.focus();
      qa.title.select();
      break;
    case 'qa-collection':
      qa.draft.collection = el.dataset.name;
      renderQaCollections();
      break;
    case 'qa-kind':
      qa.draft.kind = el.dataset.kind;
      qa.draft.kindTouched = true;
      renderQaKinds();
      break;
    case 'qa-new-collection':
      openCollectionDialog({
        onCreate: (c) => {
          qa.draft.collection = c.name;
          renderQaCollections();
        },
      });
      break;
    case 'nc-emoji':
      nc.draft.emoji = el.dataset.emoji;
      renderNc();
      break;
    case 'nc-color':
      nc.draft.color = el.dataset.color;
      renderNc();
      break;
    case 'toggle-sidebar':
      toggleSidebar();
      break;
    case 'buddy': {
      showTip(true);
      el.classList.remove('is-wiggling');
      void el.offsetWidth;
      el.classList.add('is-wiggling');
      break;
    }
  }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-action="sort"]')) {
    state.prefs.sort = e.target.value;
    savePrefs();
    renderView();
  }
});

/* Close dialogs by clicking the backdrop */
$$('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog && dialog.id !== 'onboarding') dialog.close();
  });
});

/* Search */
let searchTimer;
els.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = els.search.value.trim();
    state.kind = 'all';
    render();
  }, 120);
});
els.search.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    els.search.value = '';
    state.query = '';
    render();
    els.search.blur();
  }
});

/* Keyboard shortcuts */
const isTyping = (el) =>
  el.closest('input, textarea, select, [contenteditable="true"]');

document.addEventListener('keydown', (e) => {
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const key = e.key.toLowerCase();

  if (mod && key === 'enter' && qa.dialog.open && !nc.dialog.open) {
    e.preventDefault();
    qa.form.requestSubmit();
    return;
  }
  if (mod && key === 'n') {
    e.preventDefault();
    openQuickAdd();
    return;
  }
  if (mod && e.key === '\\' && !anyDialogOpen()) {
    e.preventDefault();
    toggleSidebar();
    return;
  }
  if (
    (mod && key === 'k') ||
    (e.key === '/' && !isTyping(e.target) && !anyDialogOpen())
  ) {
    if (anyDialogOpen()) return;
    e.preventDefault();
    els.search.focus();
    els.search.select();
  }
});

/* Paste a link anywhere to clip it */
document.addEventListener('paste', (e) => {
  if (isTyping(e.target) || anyDialogOpen()) return;
  const text = e.clipboardData?.getData('text/plain')?.trim();
  if (looksLikeUrl(text)) {
    e.preventDefault();
    openQuickAdd({ url: text });
  }
});

/* Drag & drop links onto the window */
const dropOverlay = $('#dropOverlay');
let dragDepth = 0;
const draggingText = (e) =>
  [...(e.dataTransfer?.types || [])].some(
    (t) => t === 'text/uri-list' || t === 'text/plain',
  );

document.addEventListener('dragenter', (e) => {
  if (!draggingText(e) || anyDialogOpen()) return;
  dragDepth++;
  dropOverlay.classList.add('is-on');
});
document.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) dropOverlay.classList.remove('is-on');
});
document.addEventListener('dragover', (e) => {
  // Always prevent default so Electron never navigates away to a dropped link or file.
  if (!isTyping(e.target)) e.preventDefault();
});
document.addEventListener('drop', (e) => {
  if (isTyping(e.target)) return;
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.classList.remove('is-on');
  if (anyDialogOpen()) return;
  const uriList = e.dataTransfer.getData('text/uri-list');
  const text =
    uriList
      .split(/\r?\n/)
      .find((l) => l && !l.startsWith('#'))
      ?.trim() || e.dataTransfer.getData('text/plain').trim();
  if (looksLikeUrl(text)) openQuickAdd({ url: text });
  else if (text) openQuickAdd({ note: text });
});

/* ═══════════════════════════════════════════════════════════
   Onboarding
   ═══════════════════════════════════════════════════════════ */

const ob = {
  dialog: $('#onboarding'),
  track: $('#onboardTrack'),
  dots: $$('#onboardDots .dot'),
  back: $('#onboardBack'),
  next: $('#onboardNext'),
  step: 0,
};
const OB_STEPS = 3;

function renderOnboarding() {
  ob.track.style.transform = `translateX(-${ob.step * 100}%)`;
  ob.dots.forEach((d, i) => d.classList.toggle('is-active', i === ob.step));
  ob.back.classList.toggle('is-invisible', ob.step === 0);
  ob.next.textContent = ob.step === OB_STEPS - 1 ? "Let's go!" : 'Next';
  $$('.onboard-slide', ob.track).forEach((s, i) =>
    s.toggleAttribute('inert', i !== ob.step),
  );
}

function openOnboarding() {
  if (anyDialogOpen()) return;
  ob.step = 0;
  renderOnboarding();
  ob.dialog.showModal();
  ob.next.focus();
}

function finishOnboarding() {
  storage.set(KEYS.onboarded, true);
  ob.dialog.close();
  render();
  celebrate();
  toast('Welcome home!', { mood: 'joy' });
}

ob.next.addEventListener('click', () => {
  if (ob.step < OB_STEPS - 1) {
    ob.step++;
    renderOnboarding();
  } else finishOnboarding();
});
ob.back.addEventListener('click', () => {
  ob.step = Math.max(0, ob.step - 1);
  renderOnboarding();
});
ob.dialog.addEventListener('cancel', () => storage.set(KEYS.onboarded, true));
ob.dialog.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') ob.next.click();
  if (e.key === 'ArrowLeft' && ob.step > 0) ob.back.click();
});

els.brand.addEventListener('dblclick', openOnboarding);

/* ═══════════════════════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════════════════════ */

function hydrateStatic() {
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = ICON[el.dataset.icon] ?? '';
  });
  $$('[data-mascot]').forEach((el) => {
    el.innerHTML = mascot(el.dataset.mascot, Number(el.dataset.size) || 48);
  });
  $$('[data-kbd]').forEach((el) => {
    el.textContent = shortcut(el.dataset.kbd);
  });
}

async function boot() {
  hydrateStatic();
  applySidebar();
  showTip();
  render();
  try {
    await loadClips();
  } catch (err) {
    console.error('[clippy] boot failed:', err);
    state.loaded = true;
  }
  render();
  if (!storage.get(KEYS.onboarded, false)) setTimeout(openOnboarding, 250);

  // keep "2m ago" labels fresh
  setInterval(() => {
    $$('.card-time[data-ts]').forEach((el) => {
      el.textContent = timeAgo(new Date(Number(el.dataset.ts)));
    });
  }, 60_000);
}

boot();
