import { DAY_NAMES } from './data.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const $ = (sel, root = document) => root.querySelector(sel);

export const fmtNum = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export const formatPrice = (s) => `${s.from ? 'от ' : ''}${fmtNum(s.price)}\u00a0BYN`;
export const formatDuration = (min) => (min >= 60 ? `${Math.floor(min / 60)} ч${min % 60 ? ` ${min % 60} мин` : ''}` : `${min} мин`);
export const pluralize = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10;
  return a > 10 && a < 20 ? many : b > 1 && b < 5 ? few : b === 1 ? one : many;
};
export const yearsText = (n) => `${n} ${pluralize(n, ['год', 'года', 'лет'])}`;

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
export const formatDate = (d, withWeekday = false) => `${d.getDate()} ${MONTHS[d.getMonth()]}${withWeekday ? `, ${WEEKDAYS_FULL[d.getDay()]}` : ''}`;
export const monthName = (d) => ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][d.getMonth()] + ' ' + d.getFullYear();

export const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

// Плавная смена числа; при reduced-motion — сразу итог
export function animateNumber(el, to, ms = 500) {
  const from = Number(el.dataset.value || 0);
  el.dataset.value = to;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || from === to) { el.textContent = fmtNum(to); return; }
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
    el.textContent = fmtNum(Math.round(v * 100) / 100);
    if (k < 1 && Number(el.dataset.value) === to) requestAnimationFrame(tick);
    else el.textContent = fmtNum(to);
  };
  requestAnimationFrame(tick);
}

// Расписание врача: «Пн, Ср, Пт 09:00–18:00»
export function scheduleLines(doctor) {
  const groups = new Map();
  for (const day of [1, 2, 3, 4, 5, 6, 0]) {
    const r = doctor.schedule[day];
    if (!r) continue;
    const key = r.map(([a, b]) => `${a}–${b}`).join(', ');
    groups.set(key, [...(groups.get(key) || []), DAY_NAMES[day]]);
  }
  return [...groups].map(([time, days]) => ({ days: days.join(', '), time }));
}

const initials = (name) => name.split(' ').slice(0, 2).map((w) => w[0]).join('');
const fallbackSvg = (label) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="560" viewBox="0 0 480 560"><rect width="480" height="560" fill="#dff1f2"/><circle cx="240" cy="220" r="86" fill="#b9dfe2"/><path d="M80 560c0-110 70-190 160-190s160 80 160 190z" fill="#b9dfe2"/><text x="240" y="500" font-family="Arial" font-size="72" text-anchor="middle" fill="#0e7c86">${label}</text></svg>`);

export const doctorPhoto = (d, cls = '', loading = 'lazy') =>
  `<img class="${cls}" src="${esc(d.photo)}" alt="${esc(d.name)}, ${esc(d.specialty.toLowerCase())}" width="480" height="560" loading="${loading}" data-fallback="${esc(initials(d.name))}">`;

// Если фото не загрузилось, подставляем аккуратную заглушку с инициалами
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.fallback && !img.dataset.failed) { img.dataset.failed = '1'; img.src = fallbackSvg(img.dataset.fallback); }
}, true);

const ICONS = {
  tooth: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.5 1.3 5.3.6 2.3.7 7.2 2.2 7.2 1.2 0 1.1-4.5 2.6-4.5h.1c1.200 0 1.400 4.500 2.700 4.500 1.500 0 1.600-4.900 2.200-7.200C16.700 11 17.500 9.500 17.500 7.500 17.500 5 16 3 13.500 3 12.200 3 11.500 3.600 10.300 3.600 9 3.600 8.300 3 7 3z"/>',
  implant: '<path d="M8 3h8M9 3v3h6V3M10 6l.5 3M14 6l-.5 3M9.500 9h5M10 12h4M10.500 15h3M11 18h2M12 18v3"/>',
  braces: '<rect x="3" y="9" width="5" height="6" rx="1"/><rect x="9.500" y="9" width="5" height="6" rx="1"/><rect x="16" y="9" width="5" height="6" rx="1"/><path d="M2 12h20"/>',
  sparkle: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800zM19 17l.7 1.800L21.500 19.500l-1.800.7L19 22l-.7-1.800-1.800-.7 1.800-.7z"/>',
  kid: '<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7M9.500 8h.01M14.500 8h.01"/>',
  surgery: '<path d="M4 20L14 10M14 10l3-3 3 3-3 3M10 14l-2-2"/><path d="M15 4l5 5"/>',
  phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
};
export const icon = (name, size = 24) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export const stars = (n) => `<span class="stars" role="img" aria-label="Оценка ${n} из 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;

export const bookingUrl = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  return `booking.html${q.toString() ? `?${q}` : ''}`;
};

export const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* приватный режим */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* приватный режим */ } },
};
