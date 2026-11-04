// Маска +375 (XX) XXX-XX-XX. Принимает ввод с 375, 80 или без кода страны.
export function formatPhone(raw) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('375')) d = d.slice(3);
  if (d.startsWith('80')) d = d.slice(2); // кода 80 у операторов нет: это набранная «8 0» после префикса
  d = d.slice(0, 9);
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
    if (e.inputType && e.inputType.startsWith('delete') && input.value.replace(/\D/g, '').length <= 3) { input.value = ''; return; }
    // сохраняем позицию курсора по числу цифр слева, чтобы правка в середине не прыгала в конец
    const digitsLeft = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    input.value = formatPhone(input.value);
    let pos = 0, seen = 0;
    while (pos < input.value.length && seen < digitsLeft) if (/\d/.test(input.value[pos++])) seen++;
    input.setSelectionRange(pos, pos);
  });
  input.addEventListener('focus', () => { if (!input.value) input.value = '+375 ('; });
  input.addEventListener('blur', () => { if (input.value.replace(/\D/g, '').length <= 3) input.value = ''; });
}
