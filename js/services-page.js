import './layout.js';
import { categories } from './data.js';
import { esc, $, formatPrice, formatDuration, debounce, bookingUrl } from './ui.js';
import { filterServices, highlight } from './price.js';

const list = $('#price-list');
const input = $('#price-q');
const select = $('#price-cat');
const status = $('#price-status');
const urlCat = new URLSearchParams(location.search).get('category');
const validCat = categories.some((c) => c.id === urlCat) ? urlCat : '';

select.innerHTML = '<option value="">Все категории</option>' + categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
select.value = validCat;

function render() {
  const q = input.value;
  const cat = select.value;
  const found = filterServices(q, cat);
  const searching = q.trim() !== '';
  status.textContent = found.length ? `Найдено услуг: ${found.length}` : '';
  if (!found.length) {
    list.innerHTML = `<div class="empty"><h2>Ничего не найдено</h2><p>Попробуйте другое слово или сбросьте фильтр. Консультация врача — 18 BYN, подскажет, что нужно.</p><button type="button" class="btn btn--outline" id="price-reset">Сбросить поиск</button></div>`;
    return;
  }
  list.innerHTML = categories.map((c) => {
    const items = found.filter((s) => s.category === c.id);
    if (!items.length) return '';
    // открыта: выбранная в URL/фильтре категория, при поиске — все с совпадениями
    const open = searching || cat === c.id || (validCat === c.id && !cat);
    return `<details class="cat" id="cat-${c.id}" ${open ? 'open' : ''}>
      <summary><span>${esc(c.name)}</span><span class="muted">${items.length}</span></summary>
      <ul class="prices">${items.map((s) => `
        <li class="price-row">
          <div><p class="price-row__name">${highlight(s.name, q)}</p><p class="muted">${formatDuration(s.duration)}</p></div>
          <p class="price-row__price">${formatPrice(s)}</p>
          <a class="btn btn--outline btn--sm" href="${bookingUrl({ service: s.id })}" aria-label="Записаться: ${esc(s.name)}">Записаться</a>
        </li>`).join('')}
      </ul></details>`;
  }).join('');
}

input.addEventListener('input', debounce(render, 200));
select.addEventListener('change', render);
list.addEventListener('click', (e) => { if (e.target.id === 'price-reset') { input.value = ''; select.value = ''; render(); input.focus(); } });
$('#price-form').addEventListener('submit', (e) => e.preventDefault());
render();
if (validCat) $(`#cat-${validCat}`)?.scrollIntoView({ block: 'start' });
