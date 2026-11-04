import { services } from './data.js';
import { esc } from './ui.js';

// Нормализация для поиска: регистр и «ё» не важны
export const normalize = (s) => s.toLowerCase().replace(/ё/g, 'е').trim();

export function filterServices(query = '', categoryId = '', list = services) {
  const q = normalize(query);
  return list.filter((s) => (!categoryId || s.category === categoryId) && (!q || normalize(s.name).includes(q)));
}

// Подсветка совпадения в экранированном тексте. normalize не меняет длину строки (ё→е), индексы совпадают.
export function highlight(text, query) {
  const q = normalize(query);
  if (!q) return esc(text);
  const i = normalize(text).indexOf(q);
  if (i < 0) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
}
