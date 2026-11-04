import './layout.js';
import { clinic, categories, services, reviews, faq, promos, whyUs, getDoctor } from './data.js';
import { esc, $, icon, fmtNum, doctorPhoto, yearsText, stars, formatDate, bookingUrl } from './ui.js';
import { parseKey } from './slots.js';
import { initCalculator } from './calculator.js';

// Направления: цена «от» = минимальная цена в категории (без снимков и консультаций)
$('#directions-list').innerHTML = categories.map((c) => {
  const list = services.filter((s) => s.category === c.id && !/снимок|Консультация|Первичная/.test(s.name));
  const min = Math.min(...list.map((s) => s.price));
  return `<a class="card card--link" href="services.html?category=${c.id}">
    <span class="card__icon">${icon(c.icon, 28)}</span>
    <h3>${esc(c.name)}</h3><p class="muted">${esc(c.description)}</p>
    <p class="card__price">от ${fmtNum(min)}&nbsp;BYN</p></a>`;
}).join('');

$('#doctors-list').innerHTML = ['d1', 'd2', 'd4', 'd3'].map(getDoctor).map((d) => `
  <article class="card doc">
    ${doctorPhoto(d, 'doc__photo')}
    <h3><a href="doctor.html?id=${d.id}">${esc(d.name)}</a></h3>
    <p class="muted">${esc(d.specialty)} · стаж ${yearsText(d.experience)}</p>
    <a class="btn btn--outline btn--block" href="${bookingUrl({ doctor: d.id })}">Записаться к врачу</a>
  </article>`).join('');

initCalculator($('#calc'));

$('#promo-list').innerHTML = promos.map((p) => `
  <article class="card promo">
    <p class="promo__until">${esc(p.untilText)}</p>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.text)}</p>
    <p class="promo__price">${p.newPrice ? `${p.newPrice}&nbsp;BYN` : 'Бесплатно'} <s>${p.oldPrice}&nbsp;BYN</s></p>
    <a class="btn btn--outline btn--sm" href="${bookingUrl({ service: p.serviceId })}">Записаться</a>
  </article>`).join('');

$('#why-list').innerHTML = whyUs.map((w) => `<li class="why"><span class="why__check">${icon('check', 20)}</span><div><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div></li>`).join('');

// Отзывы: нативная прокрутка со scroll-snap даёт свайп; кнопки листают на карточку
$('#reviews-track').innerHTML = reviews.map((r) => {
  const d = getDoctor(r.doctorId);
  return `<li class="review"><div>${stars(r.rating)} <span class="muted">${formatDate(parseKey(r.date))}</span></div>
    <p>${esc(r.text)}</p><p class="review__who"><strong>${esc(r.name)}</strong>, врач ${esc(d.name.split(' ').slice(0, 2).join(' '))}</p>
    ${r.reply ? `<p class="review__reply"><strong>Ответ клиники.</strong> ${esc(r.reply)}</p>` : ''}</li>`;
}).join('');
const track = $('#reviews-track');
document.querySelectorAll('[data-slide]').forEach((b) => b.addEventListener('click', () => {
  const step = track.firstElementChild.getBoundingClientRect().width + 16;
  track.scrollBy({ left: step * Number(b.dataset.slide), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));

$('#faq-list').innerHTML = faq.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');

const tel = (p) => p.replace(/[^\d+]/g, '');
$('#contacts-info').innerHTML = `
  <p>${icon('pin', 20)} <span>${esc(clinic.address)}</span></p>
  <p>${icon('clock', 20)} <span>${clinic.hours.map((h) => `${h.days}: ${h.time}`).join('<br>')}</span></p>
  <p>${icon('phone', 20)} <span>${clinic.phones.map((p) => `<a href="tel:${tel(p)}">${p}</a>`).join('<br>')}</span></p>
  <p><strong>Как добраться.</strong> ${esc(clinic.metro)}</p>
  <p><strong>Парковка.</strong> ${esc(clinic.parking)}</p>`;
const { lat, lon } = clinic.coords;
$('#map').src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.006}%2C${lat - 0.003}%2C${lon + 0.006}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lon}`;
