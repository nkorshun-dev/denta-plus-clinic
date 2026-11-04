import { categories, getService } from './data.js';
import { esc, $, fmtNum, formatPrice, animateNumber, bookingUrl, pluralize } from './ui.js';

export const INSTALLMENT = { 3: 0, 6: 0, 12: 7 }; // месяцы -> наценка, %
export const MIN_INSTALLMENT = 300;

// selection: { serviceId: qty }. Цены «от» считаются по нижней границе.
export function calcTotal(selection) {
  let total = 0, visits = 0;
  for (const [id, qty] of Object.entries(selection)) {
    const s = getService(id);
    if (!s || qty < 1) continue;
    total += s.price * qty;
    visits += s.visits * (s.qty ? Math.ceil(qty / 2) : 1); // два однотипных зуба лечат за один визит
  }
  return { total: Math.round(total * 100) / 100, visits };
}

export function installment(total, months) {
  const markup = INSTALLMENT[months] ?? 0;
  const full = total * (1 + markup / 100);
  return { markup, full: Math.round(full * 100) / 100, monthly: Math.round((full / months) * 100) / 100 };
}

const CALC_IDS = ['consult', 'caries', 'caries-deep', 'canal-1', 'canal-multi', 'restore-front', 'hygiene', 'whitening', 'crown-metal', 'crown-zirconia', 'implant-osstem', 'extract-simple', 'extract-complex', 'braces-metal', 'kids-caries'];

export function initCalculator(root) {
  const selection = {};
  let months = 6;
  const groups = categories.map((c) => ({ c, items: CALC_IDS.map(getService).filter((s) => s.category === c.id) })).filter((g) => g.items.length);

  root.innerHTML = `
    <div class="calc__list">${groups.map(({ c, items }) => `
      <fieldset class="calc__group"><legend>${esc(c.name)}</legend>
        ${items.map((s) => `
        <div class="calc__row">
          <label class="check"><input type="checkbox" data-id="${s.id}"><span>${esc(s.name)}</span></label>
          <span class="calc__price">${formatPrice(s)}</span>
          ${s.qty ? `<span class="qty" hidden data-qty-for="${s.id}"><button type="button" data-dec="${s.id}" aria-label="Меньше: ${esc(s.name)}">−</button><output aria-live="polite">1</output><button type="button" data-inc="${s.id}" aria-label="Больше: ${esc(s.name)}">+</button></span>` : ''}
        </div>`).join('')}
      </fieldset>`).join('')}
    </div>
    <aside class="calc__result" aria-label="Итог расчёта">
      <p class="calc__label">Ориентировочная стоимость</p>
      <p class="calc__total"><span id="calc-total" data-value="0">0</span>&nbsp;BYN</p>
      <p class="muted" id="calc-visits" aria-live="polite">Выберите услуги слева</p>
      <div class="calc__months" role="radiogroup" aria-label="Срок рассрочки">
        ${Object.keys(INSTALLMENT).map((m) => `<label class="seg"><input type="radio" name="months" value="${m}" ${+m === months ? 'checked' : ''}><span>${m} мес.</span></label>`).join('')}
      </div>
      <p class="calc__monthly"><span id="calc-monthly" data-value="0">0</span>&nbsp;BYN <small>в месяц</small></p>
      <p class="muted" id="calc-note" aria-live="polite"></p>
      <a class="btn btn--primary btn--block" id="calc-cta" href="booking.html?service=consult">Записаться на консультацию</a>
      <p class="muted calc__hint">Точный план лечения врач составит на консультации.</p>
    </aside>`;

  function update() {
    const { total, visits } = calcTotal(selection);
    const inst = installment(total, months);
    animateNumber($('#calc-total', root), total);
    animateNumber($('#calc-monthly', root), total >= MIN_INSTALLMENT ? inst.monthly : 0);
    $('.calc__monthly', root).hidden = total < MIN_INSTALLMENT;
    $('#calc-visits', root).textContent = total ? `Примерно ${visits} ${pluralize(visits, ['визит', 'визита', 'визитов'])} к врачу` : 'Выберите услуги слева';
    const note = $('#calc-note', root);
    if (!total) note.textContent = '';
    else if (total < MIN_INSTALLMENT) note.textContent = `Рассрочка доступна от ${MIN_INSTALLMENT} BYN. Сейчас: разовый платёж.`;
    else note.textContent = inst.markup ? `Рассрочка на ${months} мес. с наценкой ${inst.markup}%, всего ${fmtNum(inst.full)} BYN.` : `Рассрочка на ${months} мес. без процентов.`;
    const ids = Object.keys(selection);
    $('#calc-cta', root).href = bookingUrl({ service: 'consult', plan: ids.map((id) => `${id}:${selection[id]}`).join(',') });
  }

  root.addEventListener('change', (e) => {
    if (e.target.dataset.id) {
      const id = e.target.dataset.id;
      if (e.target.checked) selection[id] = 1; else delete selection[id];
      const q = $(`[data-qty-for="${id}"]`, root);
      if (q) { q.hidden = !e.target.checked; $('output', q).textContent = 1; }
    } else if (e.target.name === 'months') months = +e.target.value;
    update();
  });
  root.addEventListener('click', (e) => {
    const id = e.target.dataset.inc || e.target.dataset.dec;
    if (!id) return;
    selection[id] = Math.min(10, Math.max(1, selection[id] + (e.target.dataset.inc ? 1 : -1)));
    $(`[data-qty-for="${id}"] output`, root).textContent = selection[id];
    update();
  });
  update();
}
