import { SEED_BUNDLE, validateBundle, PROP_IDS, BACKGROUND_IDS, courseTopics, CARDS, UNTRANSLATED, hasTranslation, DICT_LANGS } from '../src';

const issues = validateBundle(SEED_BUNDLE, { props: new Set(PROP_IDS), bgs: new Set(BACKGROUND_IDS) });
for (const c of SEED_BUNDLE.courses) {
  const all = c.scenes.flatMap((s) => s.steps);
  const choices = all.filter((s) => s.type === 'choice').length;
  const sims = all.filter((s) => s.type === 'sim').map((s) => (s as any).sim).join('+') || '-';
  console.log(`✔ ${c.id.padEnd(22)} scenes=${c.scenes.length} choices=${choices} sims=${sims} topics=${[...courseTopics(c, CARDS)].length}/8 entry=${c.entry.kind}:${c.entry.code}`);
}
for (const i of issues) console.log(`${i.level === 'error' ? '✖' : '⚠'} [${i.where}] ${i.msg}`);
if (UNTRANSLATED.length) console.log(`⚠ ${UNTRANSLATED.length} course sentences have no Korean yet (add them to src/i18n/ko-text.ts):\n  ` + UNTRANSLATED.slice(0, 10).join('\n  '));
// ja / zh / es: every English content text should resolve through the dictionaries
{
  const texts = new Set<string>();
  const walk = (o: unknown, seen = new Set<unknown>()): void => {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) return o.forEach((x) => walk(x, seen));
    const r = o as Record<string, unknown>;
    if (typeof r.en === 'string' && Object.keys(r).every((k) => k.length <= 3)) { texts.add(r.en); return; }
    Object.values(r).forEach((v) => walk(v, seen));
  };
  walk(SEED_BUNDLE);
  for (const lang of DICT_LANGS) {
    const miss = [...texts].filter((t) => !hasTranslation(t, lang));
    if (miss.length) console.log(`⚠ ${lang}: ${miss.length} texts may be untranslated (add them to i18n/content.tsv + i18n/tl): ${miss.slice(0, 5).join(' | ')}`);
  }
}
const errors = issues.filter((i) => i.level === 'error').length;
console.log(`\n${SEED_BUNDLE.cards.length} cards, ${errors} errors, ${issues.length - errors} warnings`);
process.exit(errors ? 1 : 0);
