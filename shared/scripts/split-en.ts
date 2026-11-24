/** i18n/tl5/<name>.tsv (en\tja\tzh\tes) → i18n/ui-<name>.tsv (key\ten) + i18n/tl/<lang>-<name>.tsv */
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { fnv, normalise } from '../src/i18n/translate';
const file = process.argv[2];
const name = basename(file, '.tsv');
const en: string[] = [];
const tl: Record<string, string[]> = { ja: [], zh: [], es: [] };
for (const line of readFileSync(file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const [e, ja, zh, es] = line.split('\t');
  if (es === undefined) throw new Error('bad row: ' + line);
  const k = fnv(normalise(e));
  en.push(`${k}\t${e}`);
  tl.ja.push(`${k}\t${ja}`); tl.zh.push(`${k}\t${zh}`); tl.es.push(`${k}\t${es}`);
}
writeFileSync(`i18n/ui-${name}.tsv`, en.join('\n') + '\n');
for (const l of ['ja', 'zh', 'es']) writeFileSync(`i18n/tl/${l}-${name}.tsv`, tl[l].join('\n') + '\n');
console.log(name, en.length);
