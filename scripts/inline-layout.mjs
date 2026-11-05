// Вписывает шапку и футер из js/layout.js прямо в каждый *.html (между маркерами),
// чтобы они были в разметке до загрузки JS и не сдвигали страницу (CLS).
// Запуск: node scripts/inline-layout.mjs        — обновить файлы
//         node scripts/inline-layout.mjs --check — только проверить, что разметка актуальна (код 1, если нет)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// js/ui.js при импорте вешает обработчик на document; в Node хватает пустой заглушки
globalThis.document ??= { addEventListener() {} };
const { header, footer } = await import(pathToFileURL(path.join(root, 'js/layout.js')));

const check = process.argv.includes('--check');
const slot = (id, html) => {
  const start = `<!-- layout:${id} -->`, end = `<!-- /layout:${id} -->`;
  const filled = new RegExp(`(<div id="site-${id}">)${start}[\\s\\S]*?${end}(</div>)`);
  const empty = new RegExp(`(<div id="site-${id}">)(</div>)`);
  return (src, file) => {
    const re = filled.test(src) ? filled : empty;
    if (!re.test(src)) throw new Error(`${file}: нет <div id="site-${id}"></div> или маркеров ${start}`);
    return src.replace(re, (_, open, close) => `${open}${start}${html.trim()}\n${end}${close}`);
  };
};

let stale = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.html'))) {
  const full = path.join(root, file);
  const src = fs.readFileSync(full, 'utf8');
  const out = slot('footer', footer)(slot('header', header(file))(src, file), file);
  for (const id of ['header', 'footer']) {
    if (out.split(`<!-- layout:${id} -->`).length !== 2) throw new Error(`${file}: маркер ${id} должен быть ровно один`);
  }
  if (out === src) continue;
  stale++;
  if (check) console.log('устарело:', file);
  else { fs.writeFileSync(full, out); console.log('обновлено:', file); }
}
if (check && stale) process.exit(1);
console.log(stale ? `готово, файлов: ${stale}` : 'всё актуально');
