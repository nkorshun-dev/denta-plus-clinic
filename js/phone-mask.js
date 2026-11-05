// Маска +375 (XX) XXX-XX-XX. Принимает ввод с 375, 80 или без кода страны.
// «+375» маски (или его стёртая часть) — не номер; затем снимаем набранный пользователем 375/80:
// кодов оператора на 37 и 80 нет, поэтому «+375 (375…» и «+375 (80…» — это префикс, а не номер.
const localDigits = (raw) => raw.replace(/^\s*\+(375|37|3)?/, '').replace(/\D/g, '').replace(/^375/, '').replace(/^80/, '').slice(0, 9);

export function formatPhone(raw) {
  const d = localDigits(raw);
  let out = '+375';
  if (d.length) out += ` (${d.slice(0, 2)}`;
  if (d.length >= 2) out += ')';
  if (d.length > 2) out += ` ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

export function attachPhoneMask(input) {
  input.addEventListener('input', (e) => {
    // при удалении не навязываем маску, если остался только префикс
    if (e.inputType && e.inputType.startsWith('delete') && !localDigits(input.value)) { input.value = ''; return; }
    // сохраняем позицию курсора по числу цифр номера слева (+3 цифры префикса 375), чтобы правка в середине не прыгала в конец
    const digitsLeft = 3 + localDigits(input.value.slice(0, input.selectionStart)).length;
    input.value = formatPhone(input.value);
    let pos = 0, seen = 0;
    while (pos < input.value.length && seen < digitsLeft) if (/\d/.test(input.value[pos++])) seen++;
    input.setSelectionRange(pos, pos);
  });
  input.addEventListener('focus', () => { if (!input.value) input.value = '+375 ('; });
  input.addEventListener('blur', () => { if (input.value.replace(/\D/g, '').length <= 3) input.value = ''; });
}
