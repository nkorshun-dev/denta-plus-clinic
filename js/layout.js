// Общие шапка и футер: один шаблон на все страницы.
// scripts/inline-layout.mjs вписывает эту разметку в каждый *.html (без сдвига макета при загрузке).
// После правок шаблонов здесь перезапустите: node scripts/inline-layout.mjs
import { clinic } from './data.js';
import { icon } from './ui.js';

const NAV = [
  ['index.html#directions', 'Услуги'],
  ['doctors.html', 'Врачи'],
  ['services.html', 'Цены'],
  ['index.html#promo', 'Акции'],
  ['index.html#contacts', 'Контакты'],
];
const tel = (p) => p.replace(/[^\d+]/g, '');

// Текущий раздел: страница врача относится к «Врачам», ссылки с # не подсвечиваются
export const pageOf = (pathname) => pathname.split('/').pop() || 'index.html';
const isCurrent = (href, page) => {
  const [file, hash] = href.split('#');
  return !hash && (file === page || (page === 'doctor.html' && file === 'doctors.html'));
};

export const header = (page) => `
<a class="skip" href="#main">К содержимому</a>
<header class="header">
  <div class="container header__row">
    <a class="logo" href="index.html" aria-label="Дента Плюс, на главную">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0e7c86"/><path d="M16 8v16M8 16h16" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>
      <span>Дента Плюс</span>
    </a>
    <nav class="nav" id="nav" aria-label="Основная навигация">
      ${NAV.map(([href, label]) => `<a href="${href}"${isCurrent(href, page) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    <span class="header__phone demo-link" aria-label="Телефон ${clinic.phones[0]} (в демо не активно)" title="Демо-проект: ссылка не активна">${icon('phone', 18)}<span>${clinic.phones[0]}</span></span>
    <a class="btn btn--primary btn--sm header__cta" href="booking.html">Записаться</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Открыть меню"><span></span><span></span><span></span></button>
  </div>
</header>`;

export const footer = `
<footer class="footer">
  <div class="container footer__grid">
    <div>
      <p class="footer__title">Дента Плюс</p>
      <p>${clinic.address}</p>
      <p>${clinic.phones.map((p) => `<span class="demo-link" aria-label="Телефон ${p} (в демо не активно)" title="Демо-проект: ссылка не активна">${p}</span>`).join('<br>')}</p>
    </div>
    <div>
      <p class="footer__title">Разделы</p>
      <p>${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('<br>')}<br><a href="booking.html">Онлайн-запись</a></p>
    </div>
    <div class="footer__legal">
      <p>${clinic.legal}.<br>${clinic.license}.</p>
      <p><button type="button" class="link-btn" data-privacy>Политика конфиденциальности</button></p>
    </div>
  </div>
  <div class="container footer__demo"><p>Демо-проект для портфолио. Бизнес вымышленный, данные никуда не отправляются.</p></div>
</footer>
<dialog class="modal" id="privacy" aria-labelledby="privacy-title">
  <h2 id="privacy-title">Политика конфиденциальности</h2>
  <p>Это демонстрационный сайт. Данные, введённые в форму записи, обрабатываются только в вашем браузере и никуда не передаются. Черновик записи хранится в localStorage вашего устройства до завершения записи.</p>
  <p>В реальной клинике здесь были бы перечень обрабатываемых данных, цели обработки, срок хранения и способ отзыва согласия.</p>
  <form method="dialog"><button class="btn btn--primary">Понятно</button></form>
</dialog>`;

if (typeof window !== 'undefined') initLayout(); // в Node (inline-layout.mjs) нужны только шаблоны

function initLayout() {
  // Разметка уже в HTML — только обработчики; если её нет (не перезапустили скрипт), рисуем как раньше
  const page = pageOf(location.pathname);
  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (!headerSlot.querySelector('.header')) headerSlot.innerHTML = header(page);
  if (!footerSlot.querySelector('.footer')) footerSlot.innerHTML = footer;

  // Подсветка текущего раздела: в готовой разметке она уже есть, здесь — по фактическому адресу
  document.querySelectorAll('.nav a').forEach((a) => {
    if (isCurrent(a.getAttribute('href'), page)) a.setAttribute('aria-current', 'page');
  });

  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => { setMenu(!nav.classList.contains('is-open')); if (nav.classList.contains('is-open')) nav.querySelector('a').focus(); }); // бургер в DOM после меню: переводим фокус в меню
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  const dlg = document.getElementById('privacy');
  document.querySelector('[data-privacy]').addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
