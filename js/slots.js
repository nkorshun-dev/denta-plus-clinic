// Чистые функции генерации свободных окон. Без DOM и без обращения к текущему времени (now передаётся).
export const STEP = 30; // минут между началами приёма
export const DAYS_AHEAD = 21;
const BUSY_PERCENT = 32;

// «Сейчас» по Минску (UTC+3), независимо от часового пояса браузера: поля Date — это минское время
export function minskNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Minsk', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return new Date(+p.year, p.month - 1, +p.day, +p.hour, +p.minute);
}

export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
// new Date(y, m, d + n) сам переносит через конец месяца и года
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// FNV-1a: одинаковая строка всегда даёт одно число, поэтому «занято» не меняется при перезагрузке
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const isBusy = (doctorId, key, minutes) => hash(`${doctorId}|${key}|${minutes}`) % 100 < BUSY_PERCENT;

// Слоты врача на день. Окно должно целиком поместиться в рабочий диапазон.
// Возвращает [{ time, minutes, free }]; free=false — занято или уже прошло.
export function daySlots(doctor, date, duration, now = minskNow()) {
  const key = dateKey(date);
  const isToday = key === dateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const cells = Math.ceil(duration / STEP);
  const out = [];
  for (const [from, to] of doctor.schedule[date.getDay()] || []) {
    const end = toMin(to);
    for (let t = toMin(from); t + duration <= end; t += STEP) {
      let free = !(isToday && t <= nowMin);
      for (let c = 0; free && c < cells; c++) if (isBusy(doctor.id, key, t + c * STEP)) free = false;
      out.push({ time: fromMin(t), minutes: t, free });
    }
  }
  return out;
}


// Ближайшие свободные окна врача: [{ date: 'YYYY-MM-DD', time }]
export function nextSlots(doctor, duration, now = minskNow(), count = 3, days = DAYS_AHEAD) {
  const out = [];
  for (let i = 0; i < days && out.length < count; i++) {
    const d = addDays(now, i);
    for (const s of daySlots(doctor, d, duration, now)) {
      if (s.free) { out.push({ date: dateKey(d), time: s.time }); if (out.length === count) break; }
    }
  }
  return out;
}

// Первое окно среди нескольких врачей (вариант «Любой врач»)
export function earliestSlot(doctorList, duration, now = minskNow()) {
  let best = null;
  for (const doc of doctorList) {
    const [s] = nextSlots(doc, duration, now, 1);
    if (s && (!best || `${s.date} ${s.time}` < `${best.date} ${best.time}`)) best = { ...s, doctorId: doc.id };
  }
  return best;
}

// Слоты дня для набора врачей: время свободно, если свободен хотя бы один. Возвращает doctorId для первого свободного.
export function mergedDaySlots(doctorList, date, duration, now = minskNow()) {
  const map = new Map();
  for (const doc of doctorList) {
    for (const s of daySlots(doc, date, duration, now)) {
      const cur = map.get(s.time);
      if (!cur) map.set(s.time, { ...s, doctorId: s.free ? doc.id : null });
      else if (!cur.free && s.free) map.set(s.time, { ...s, doctorId: doc.id });
    }
  }
  return [...map.values()].sort((a, b) => a.minutes - b.minutes);
}

