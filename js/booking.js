import './layout.js';
import { categories, doctors, services, getDoctor, getService } from './data.js';
import { esc, $, doctorPhoto, formatPrice, formatDuration, formatDate, monthName, debounce, storage, yearsText } from './ui.js';
import { mergedDaySlots, nextSlots, earliestSlot, addDays, dateKey, parseKey, DAYS_AHEAD, fromMin, toMin, minskNow } from './slots.js';
import { filterServices, highlight } from './price.js';
import { attachPhoneMask } from './phone-mask.js';
import { validateName, validatePhone, validateBirth, validateComment, validateConsent } from './validation.js';

const DRAFT_KEY = 'denta-plus:booking-draft';
const STEPS = ['Услуга', 'Врач', 'Дата и время', 'Контакты'];
const root = $('#booking-app');
const params = new URLSearchParams(location.search);

const blank = () => ({ service: '', doctor: '', date: '', time: '', slotDoctor: '', name: '', phone: '', birth: '', first: 'yes', comment: '', remind: 'sms', consent: false });
let state = blank();
let step = 1;
let view = 'form'; // form | confirm | success
let lockDoctor = false; // пришли со страницы врача: показываем только его услуги
let success = null;
let search = '';
let notice = ''; // пояснение, если параметры URL не сочетаются

// ---------- производные данные ----------
const svc = () => getService(state.service);
const eligible = () => {
  if (!state.service) return [];
  if (state.doctor && state.doctor !== 'any') return [getDoctor(state.doctor)];
  return doctors.filter((d) => d.services.includes(state.service));
};
const resolvedDoctor = () => getDoctor(state.doctor === 'any' ? state.slotDoctor : state.doctor);

function saveDraft() { if (view !== 'success') storage.set(DRAFT_KEY, { state, step }); }

function resetSlot() { state.date = ''; state.time = ''; state.slotDoctor = ''; }

function slotStillFree() {
  if (!state.date || !state.time || !svc()) return false;
  const d = parseKey(state.date);
  const today = minskNow(); today.setHours(0, 0, 0, 0);
  if (d < today || d > addDays(today, DAYS_AHEAD - 1)) return false;
  return mergedDaySlots(eligible(), d, svc().duration).some((s) => s.time === state.time && s.free);
}

// ---------- инициализация: черновик + параметры URL ----------
function init() {
  const draft = storage.get(DRAFT_KEY);
  if (draft && draft.state) { state = { ...blank(), ...draft.state }; step = draft.step || 1; }
  const qs = params.get('service'), qd = params.get('doctor');
  if (qd && getDoctor(qd)) { if (state.doctor !== qd) resetSlot(); state.doctor = qd; lockDoctor = true; }
  if (qs && getService(qs)) { if (state.service !== qs) resetSlot(); state.service = qs; }
  if (state.service && !getService(state.service)) state.service = '';
  if (state.doctor && state.doctor !== 'any' && !getDoctor(state.doctor)) state.doctor = '';
  if (state.service && state.doctor && state.doctor !== 'any' && !getDoctor(state.doctor).services.includes(state.service)) {
    if (qs && qd) notice = `${getDoctor(state.doctor).name} не выполняет услугу «${getService(state.service).name}». Выберите другую услугу этого врача или нажмите «Показать все услуги».`;
    state.service = ''; resetSlot();
  }
  if (lockDoctor && !state.service) step = 1;
  else if (qs && !state.doctor) step = 2;
  else if (qs && state.doctor) step = 3;
  const plan = params.get('plan');
  if (plan && !state.comment) {
    const text = plan.split(',').map((p) => { const [id, n] = p.split(':'); const s = getService(id); return s ? `${s.name}${n > 1 ? ` ×${n}` : ''}` : ''; }).filter(Boolean).join('; ');
    if (text) state.comment = `Расчёт на сайте: ${text}`.slice(0, 300);
  }
  if (state.time && !slotStillFree()) resetSlot();
  else if (state.time) state.slotDoctor = mergedDaySlots(eligible(), parseKey(state.date), svc().duration).find((x) => x.time === state.time).doctorId;
  if (step > 1 && !state.service) step = 1;
  if (step > 2 && !state.doctor) step = 2;
  if (step > 3 && !state.time) step = 3;
}

// ---------- отрисовка ----------
function stepper() {
  return `<ol class="stepper" aria-label="Шаги записи">${STEPS.map((t, i) => {
    const n = i + 1;
    const cls = view !== 'form' || n < step ? 'is-done' : n === step ? 'is-current' : '';
    return `<li class="${cls}" ${n === step && view === 'form' ? 'aria-current="step"' : ''}><span class="stepper__n">${n}</span><span class="stepper__t">${t}</span></li>`;
  }).join('')}</ol>`;
}

function nav(canNext, nextLabel = 'Далее') {
  return `<div class="actions">${step > 1 ? '<button type="button" class="btn btn--outline" data-back>Назад</button>' : '<span></span>'}
    <button type="button" class="btn btn--primary" data-next ${canNext ? '' : 'disabled'}>${nextLabel}</button></div>`;
}

function summaryHtml() {
  const s = svc(), d = resolvedDoctor();
  const date = parseKey(state.date);
  return `<dl class="summary">
    <div><dt>Услуга</dt><dd>${esc(s.name)}</dd></div>
    <div><dt>Врач</dt><dd>${esc(d.name)}, ${esc(d.specialty.toLowerCase())}</dd></div>
    <div><dt>Дата</dt><dd>${formatDate(date, true)}</dd></div>
    <div><dt>Время</dt><dd>${state.time}–${fromMin(toMin(state.time) + s.duration)} (${formatDuration(s.duration)})</dd></div>
    <div><dt>Стоимость</dt><dd>${formatPrice(s)}</dd></div>
  </dl>`;
}

function step1() {
  const doc = lockDoctor && state.doctor !== 'any' ? getDoctor(state.doctor) : null;
  return `<h2 tabindex="-1" id="panel-title">Выберите услугу</h2>
    ${notice ? `<p class="note" role="alert">${esc(notice)}</p>` : ''}${doc ? `<p class="note">Показаны услуги врача: ${esc(doc.name)}. <button type="button" class="link-btn" data-unlock>Показать все услуги</button></p>` : ''}
    <div class="field"><label for="svc-q">Поиск по услугам</label><input id="svc-q" type="search" autocomplete="off" value="${esc(search)}" placeholder="Например, кариес"></div>
    <div id="svc-list">${serviceList()}</div>${nav(!!state.service)}`;
}

function serviceList() {
  const pool = lockDoctor && state.doctor !== 'any' ? services.filter((s) => getDoctor(state.doctor).services.includes(s.id)) : services;
  const found = filterServices(search, '', pool);
  if (!found.length) return '<p class="empty-inline">Такой услуги нет. Попробуйте другое слово.</p>';
  return categories.map((c) => {
    const items = found.filter((s) => s.category === c.id);
    return items.length ? `<fieldset class="opt-group"><legend>${esc(c.name)}</legend>${items.map((s) => `
      <button type="button" class="opt" data-service="${s.id}" aria-pressed="${state.service === s.id}">
        <span class="opt__main">${highlight(s.name, search)}<small>${formatDuration(s.duration)}</small></span><span class="opt__price">${formatPrice(s)}</span>
      </button>`).join('')}</fieldset>` : '';
  }).join('');
}

function step2() {
  const s = svc();
  const list = doctors.filter((d) => d.services.includes(s.id));
  const any = earliestSlot(list, s.duration);
  const slotText = (x) => (x ? `Ближайшее окно: ${formatDate(parseKey(x.date))}, ${x.time}` : 'Нет окон на 3 недели');
  return `<h2 tabindex="-1" id="panel-title">Выберите врача</h2>
    <p class="muted">Услуга: ${esc(s.name)}</p>
    <div class="doc-opts">
      ${list.length > 1 ? `<button type="button" class="opt opt--doc" data-doctor="any" aria-pressed="${state.doctor === 'any'}"><span class="avatar">?</span><span class="opt__main">Любой врач<small>${slotText(any)}</small></span></button>` : ''}
      ${list.map((d) => `<button type="button" class="opt opt--doc" data-doctor="${d.id}" aria-pressed="${state.doctor === d.id}">
        ${doctorPhoto(d, 'avatar')}<span class="opt__main">${esc(d.name)}<small>${esc(d.specialty)}, стаж ${yearsText(d.experience)}<br>${slotText(nextSlots(d, s.duration, minskNow(), 1)[0])}</small></span></button>`).join('')}
    </div>${nav(!!state.doctor)}`;
}

function step3() {
  const s = svc(), list = eligible();
  const today = minskNow(); today.setHours(0, 0, 0, 0);
  const offset = (today.getDay() + 6) % 7; // сетка с понедельника
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push('<span class="cal__empty"></span>');
  let lastMonth = -1;
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = addDays(today, i);
    const key = dateKey(d);
    const ok = mergedDaySlots(list, d, s.duration).some((x) => x.free);
    const label = d.getMonth() !== lastMonth ? `<small>${monthName(d).split(' ')[0].slice(0, 3).toLowerCase()}</small>` : '';
    lastMonth = d.getMonth();
    cells.push(`<button type="button" class="cal__day" data-date="${key}" ${ok ? '' : 'disabled'} aria-pressed="${state.date === key}" aria-label="${formatDate(d, true)}${ok ? '' : ', нет свободного времени'}">${d.getDate()}${label}</button>`);
  }
  return `<h2 tabindex="-1" id="panel-title">Дата и время</h2>
    <p class="muted">${esc(s.name)} · ${formatDuration(s.duration)} · ${state.doctor === 'any' ? 'любой врач' : esc(getDoctor(state.doctor).name)}</p>
    <div class="cal" role="group" aria-label="Выбор даты на 3 недели вперёд">
      ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((n) => `<span class="cal__h">${n}</span>`).join('')}${cells.join('')}
    </div>
    <div id="slots" aria-live="polite">${slotsHtml()}</div>${nav(!!state.time)}`;
}

function slotsHtml() {
  if (!state.date) return '<p class="muted">Выберите день в календаре.</p>';
  const slots = mergedDaySlots(eligible(), parseKey(state.date), svc().duration);
  return `<h3 class="h4">${formatDate(parseKey(state.date), true)}</h3><div class="slots">${slots.map((x) =>
    `<button type="button" class="slot" data-time="${x.time}" data-sd="${x.doctorId || ''}" ${x.free ? '' : 'disabled'} aria-pressed="${state.time === x.time}">${x.time}</button>`).join('')}</div>`;
}

function step4() {
  return `<h2 tabindex="-1" id="panel-title">Ваши контакты</h2>
    <form id="contact-form" novalidate>
      ${field('name', 'ФИО', `<input id="f-name" name="name" autocomplete="name" required value="${esc(state.name)}" placeholder="Иванова Мария">`)}
      ${field('phone', 'Телефон', `<input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required value="${esc(state.phone)}" placeholder="+375 (29) 123-45-67">`)}
      ${field('birth', 'Дата рождения (необязательно)', `<input id="f-birth" name="birth" type="date" autocomplete="bday" value="${esc(state.birth)}">`)}
      <fieldset class="field"><legend>Первичный визит в клинику?</legend>
        <label class="radio"><input type="radio" name="first" value="yes" ${state.first === 'yes' ? 'checked' : ''}> Да</label>
        <label class="radio"><input type="radio" name="first" value="no" ${state.first === 'no' ? 'checked' : ''}> Нет, уже лечился</label></fieldset>
      ${field('comment', 'Комментарий (необязательно)', `<textarea id="f-comment" name="comment" rows="3" maxlength="300">${esc(state.comment)}</textarea><span class="counter" id="comment-count">${state.comment.length}/300</span>`)}
      <fieldset class="field"><legend>Напомнить о визите</legend>
        ${[['sms', 'SMS'], ['telegram', 'Telegram'], ['viber', 'Viber']].map(([v, l]) => `<label class="radio"><input type="radio" name="remind" value="${v}" ${state.remind === v ? 'checked' : ''}> ${l}</label>`).join('')}</fieldset>
      <div class="field"><label class="check"><input type="checkbox" id="f-consent" name="consent" ${state.consent ? 'checked' : ''}><span>Согласен на обработку персональных данных (демо: данные никуда не отправляются)</span></label><p class="error" id="e-consent" role="alert"></p></div>
      <div class="actions"><button type="button" class="btn btn--outline" data-back>Назад</button><button type="submit" class="btn btn--primary">Проверить запись</button></div>
    </form>`;
}

const field = (name, label, control) => `<div class="field"><label for="f-${name}">${label}</label>${control}<p class="error" id="e-${name}" role="alert"></p></div>`;

function confirmView() {
  return `<h2 tabindex="-1" id="panel-title">Проверьте запись</h2>${summaryHtml()}
    <dl class="summary"><div><dt>Пациент</dt><dd>${esc(state.name)}, ${esc(state.phone)}</dd></div><div><dt>Напоминание</dt><dd>${{ sms: 'SMS', telegram: 'Telegram', viber: 'Viber' }[state.remind]}</dd></div></dl>
    <div class="actions"><button type="button" class="btn btn--outline" data-edit>Изменить</button><button type="button" class="btn btn--primary" data-submit>Записаться</button></div>
    <p class="demo-note">Демо-режим: данные никуда не отправляются.</p>`;
}

function successView() {
  return `<div class="success"><span class="success__icon" aria-hidden="true">✓</span>
    <h2 tabindex="-1" id="panel-title">Вы записаны</h2><p class="lead">Номер записи: <strong>${success.number}</strong></p>${summaryHtml()}
    <div class="actions actions--wrap"><button type="button" class="btn btn--primary" data-ics>Добавить в календарь</button><button type="button" class="btn btn--outline" data-again>Записаться ещё</button></div>
    <p class="demo-note">Демо-режим: данные никуда не отправляются.</p></div>`;
}

function render(focusSel, skipFocus) {
  if (view === 'success') root.innerHTML = stepper() + `<div class="panel">${successView()}</div>`;
  else root.innerHTML = stepper() + `<div class="panel">${view === 'confirm' ? confirmView() : [step1, step2, step3, step4][step - 1]()}</div>`;
  if (step === 4 && view === 'form') attachPhoneMask($('#f-phone'));
  if (!skipFocus) (focusSel ? $(focusSel) : $('#panel-title'))?.focus({ preventScroll: !!focusSel });
}

// ---------- действия ----------
function pickService(id) {
  if (state.service !== id) resetSlot();
  state.service = id;
  const d = state.doctor && state.doctor !== 'any' ? getDoctor(state.doctor) : null;
  if (d && !d.services.includes(id)) state.doctor = '';
}

function readForm() {
  const f = $('#contact-form');
  Object.assign(state, {
    name: f.name.value, phone: f.phone.value, birth: f.birth.value, comment: f.comment.value, first: f.first.value, remind: f.remind.value, consent: f.consent.checked,
  });
}

function validateForm() {
  const errs = {
    name: validateName(state.name), phone: validatePhone(state.phone), birth: validateBirth(state.birth),
    comment: validateComment(state.comment), consent: validateConsent(state.consent),
  };
  for (const [k, msg] of Object.entries(errs)) {
    const el = $(`#e-${k}`); if (el) el.textContent = msg;
    const input = $(`#f-${k}`); if (input) { input.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) input.setAttribute('aria-describedby', `e-${k}`); else input.removeAttribute('aria-describedby'); }
  }
  const first = Object.keys(errs).find((k) => errs[k]);
  if (first) $(`#f-${first}`)?.focus();
  return !first;
}

const icsEscape = (t) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function icsStamp(dateStr, time) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const mins = toMin(time);
  // Минск = UTC+3 круглый год; переводим в UTC, чтобы не описывать часовой пояс в файле
  const dt = new Date(Date.UTC(y, m - 1, d, 0, mins - 180));
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
export function buildIcs({ number, service, doctor, date, time, duration, address }) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Denta Plus//Demo//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${number}@nkorshun-dental.netlify.app`, `DTSTAMP:${icsStamp(dateKey(minskNow()), '12:00')}`,
    `DTSTART:${icsStamp(date, time)}`, `DTEND:${icsStamp(date, fromMin(toMin(time) + duration))}`,
    `SUMMARY:${icsEscape(`Дента Плюс: ${service}`)}`, `DESCRIPTION:${icsEscape(`Врач: ${doctor}. Запись ${number}. Демо-проект.`)}`,
    `LOCATION:${icsEscape(address)}`, 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Приём в клинике через 2 часа', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

async function downloadIcs() {
  const { clinic } = await import('./data.js');
  const s = svc();
  const text = buildIcs({ number: success.number, service: s.name, doctor: resolvedDoctor().name, date: state.date, time: state.time, duration: s.duration, address: clinic.address });
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `denta-plus-${success.number}.ics` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

root.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const d = t.dataset;
  if (d.service) { pickService(d.service); saveDraft(); render(`[data-service="${d.service}"]`); }
  else if (d.doctor) { if (state.doctor !== d.doctor) resetSlot(); state.doctor = d.doctor; saveDraft(); render(`[data-doctor="${d.doctor}"]`); }
  else if (d.date) { state.date = d.date; state.time = ''; state.slotDoctor = ''; saveDraft(); render(`[data-date="${d.date}"]`); $('#slots')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  else if (d.time) {
    state.time = d.time;
    // «Любой врач»: берём первого врача, у которого это окно свободно
    state.slotDoctor = d.sd;
    saveDraft(); render(`[data-time="${d.time}"]`);
  }
  else if (d.unlock !== undefined) { lockDoctor = false; notice = ''; render('#svc-q'); }
  else if (d.next !== undefined) { step = Math.min(4, step + 1); saveDraft(); render(); }
  else if (d.back !== undefined) { step = Math.max(1, step - 1); saveDraft(); render(); }
  else if (d.edit !== undefined) { view = 'form'; render(); }
  else if (d.submit !== undefined) {
    t.disabled = true; t.textContent = 'Отправляем…';
    setTimeout(() => {
      const n = minskNow();
      success = { number: `DP-${String(n.getFullYear()).slice(2)}${String(n.getMonth() + 1).padStart(2, '0')}${String(n.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}` };
      view = 'success'; storage.remove(DRAFT_KEY); render();
    }, 1000);
  }
  else if (d.ics !== undefined) downloadIcs();
  else if (d.again !== undefined) { state = blank(); step = 1; view = 'form'; lockDoctor = false; search = ''; success = null; history.replaceState(null, '', 'booking.html'); render(); }
});

root.addEventListener('input', (e) => {
  if (e.target.id === 'svc-q') { search = e.target.value; debouncedList(); }
  else if (e.target.closest('#contact-form')) {
    readForm(); saveDraft();
    const c = $('#comment-count'); if (c) c.textContent = `${state.comment.length}/300`;
  }
});
const debouncedList = debounce(() => { $('#svc-list').innerHTML = serviceList(); }, 150);

root.addEventListener('submit', (e) => {
  if (e.target.id !== 'contact-form') return;
  e.preventDefault();
  readForm(); saveDraft();
  if (!validateForm()) return;
  view = 'confirm'; render();
});

init();
render(null, true);
