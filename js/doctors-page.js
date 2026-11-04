import './layout.js';
import { clinic, doctors, reviews, getDoctor, getService, getCategory } from './data.js';
import { esc, $, doctorPhoto, yearsText, formatPrice, formatDuration, scheduleLines, stars, formatDate, bookingUrl } from './ui.js';
import { nextSlots, parseKey, minskNow } from './slots.js';

const card = (d) => `
  <article class="card doc">
    ${doctorPhoto(d, 'doc__photo')}
    <h2 class="h3"><a href="doctor.html?id=${d.id}">${esc(d.name)}</a></h2>
    <p class="muted">${esc(d.specialty)}${d.chief ? ' · главный врач' : ''} · стаж ${yearsText(d.experience)}</p>
    <a class="btn btn--outline btn--block" href="${bookingUrl({ doctor: d.id })}">Записаться к врачу</a>
  </article>`;

function listPage() {
  const specs = [...new Set(doctors.map((d) => d.specialty))];
  const filter = $('#doc-spec');
  filter.innerHTML = '<option value="">Все специальности</option>' + specs.map((s) => `<option>${esc(s)}</option>`).join('');
  const render = () => {
    const items = doctors.filter((d) => !filter.value || d.specialty === filter.value);
    $('#doc-list').innerHTML = items.map(card).join('');
    $('#doc-status').textContent = `Врачей: ${items.length}`;
  };
  filter.addEventListener('change', render);
  render();
}

function setMeta(d) {
  document.title = `${d.name}, ${d.specialty.toLowerCase()} в Минске | Дента Плюс`;
  const desc = `${d.name}, ${d.specialty.toLowerCase()}, стаж ${yearsText(d.experience)}. Услуги, цены и свободное время для записи в клинике «Дента Плюс».`;
  document.querySelector('meta[name="description"]').content = desc;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = desc;
  document.querySelector('link[rel="canonical"]').href = `https://nkorshun.dev/denta-plus/doctor.html?id=${d.id}`;
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Physician', name: d.name, medicalSpecialty: 'Dentistry', description: d.about,
    image: d.photo, worksFor: { '@type': 'Dentist', name: clinic.name, address: clinic.address, telephone: clinic.phones[0] },
  });
  document.head.append(ld);
}

function doctorPage() {
  const root = $('#doctor');
  const d = getDoctor(new URLSearchParams(location.search).get('id'));
  if (!d) {
    document.title = 'Врач не найден | Дента Плюс';
    root.innerHTML = '<div class="empty"><h1>Врач не найден</h1><p>Возможно, ссылка устарела.</p><a class="btn btn--primary" href="doctors.html">Все врачи</a></div>';
    return;
  }
  setMeta(d);
  const own = d.services.map(getService);
  const consult = own.reduce((m, s) => Math.min(m, s.duration), 60);
  const slots = nextSlots(d, consult, minskNow(), 3);
  const docReviews = reviews.filter((r) => r.doctorId === d.id);
  root.innerHTML = `
    <div class="doc-page">
      <div>${doctorPhoto(d, 'doc__photo doc__photo--big', 'eager')}</div>
      <div>
        <h1>${esc(d.name)}</h1>
        <p class="lead">${esc(d.specialty)}${d.chief ? ', главный врач' : ''}. Стаж ${yearsText(d.experience)}.</p>
        <p>${esc(d.about)}</p>
        <a class="btn btn--primary" href="${bookingUrl({ doctor: d.id })}">Записаться к этому врачу</a>
        <h2 class="h3">График приёма</h2>
        <ul class="plain">${scheduleLines(d).map((l) => `<li><strong>${l.days}</strong>: ${l.time}</li>`).join('')}</ul>
        <h2 class="h3">Ближайшие свободные окна</h2>
        ${slots.length ? `<ul class="chips">${slots.map((s) => `<li><a class="chip" href="${bookingUrl({ doctor: d.id })}">${formatDate(parseKey(s.date))}, ${s.time}</a></li>`).join('')}</ul>` : '<p class="muted">В ближайшие 3 недели свободных окон нет. Позвоните: ' + esc(clinic.phones[0]) + '</p>'}
        <h2 class="h3">Образование и курсы</h2>
        <ul class="plain">${d.education.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <ul class="plain plain--muted">${d.courses.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      </div>
    </div>
    <section class="section section--tight" aria-labelledby="ds">
      <h2 id="ds">Услуги и цены</h2>
      <ul class="prices">${own.map((s) => `
        <li class="price-row"><div><p class="price-row__name">${esc(s.name)}</p><p class="muted">${esc(getCategory(s.category).name)} · ${formatDuration(s.duration)}</p></div>
        <p class="price-row__price">${formatPrice(s)}</p>
        <a class="btn btn--outline btn--sm" href="${bookingUrl({ doctor: d.id, service: s.id })}" aria-label="Записаться: ${esc(s.name)}">Записаться</a></li>`).join('')}</ul>
    </section>
    <section class="section section--tight" aria-labelledby="dr"><h2 id="dr">Отзывы о враче</h2>
      ${docReviews.length ? `<ul class="reviews-grid">${docReviews.map((r) => `<li class="review"><div>${stars(r.rating)} <span class="muted">${formatDate(parseKey(r.date))}</span></div><p>${esc(r.text)}</p><p class="review__who"><strong>${esc(r.name)}</strong></p>${r.reply ? `<p class="review__reply"><strong>Ответ клиники.</strong> ${esc(r.reply)}</p>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Отзывов о враче пока нет.</p>'}
    </section>`;
}

if ($('#doc-list')) listPage(); else doctorPage();
