import { SEED_BUNDLE, validateBundle, PROP_IDS, BACKGROUND_IDS, courseTopics, CARDS, UNTRANSLATED } from '../src';

const issues = validateBundle(SEED_BUNDLE, { props: new Set(PROP_IDS), bgs: new Set(BACKGROUND_IDS) });
for (const c of SEED_BUNDLE.courses) {
  const all = c.scenes.flatMap((s) => s.steps);
  const choices = all.filter((s) => s.type === 'choice').length;
  const sims = all.filter((s) => s.type === 'sim').map((s) => (s as any).sim).join('+') || '-';
  console.log(`✔ ${c.id.padEnd(22)} scenes=${c.scenes.length} choices=${choices} sims=${sims} topics=${[...courseTopics(c, CARDS)].length}/8 entry=${c.entry.kind}:${c.entry.code}`);
}
for (const i of issues) console.log(`${i.level === 'error' ? '✖' : '⚠'} [${i.where}] ${i.msg}`);
if (UNTRANSLATED.length) console.log(`⚠ ${UNTRANSLATED.length} course sentences have no Korean yet (add them to src/i18n/ko-text.ts):\n  ` + UNTRANSLATED.slice(0, 10).join('\n  '));
const errors = issues.filter((i) => i.level === 'error').length;
console.log(`\n${SEED_BUNDLE.cards.length} cards, ${errors} errors, ${issues.length - errors} warnings`);
process.exit(errors ? 1 : 0);
