import { SEED_BUNDLE, validateBundle, PROP_IDS, BACKGROUND_IDS, courseTopics, CARDS } from '../src';

const issues = validateBundle(SEED_BUNDLE, { props: new Set(PROP_IDS), bgs: new Set(BACKGROUND_IDS) });
for (const c of SEED_BUNDLE.courses) {
  const choices = c.scenes.flatMap((s) => s.steps).filter((s) => s.type === 'choice').length;
  console.log(`✔ ${c.id.padEnd(22)} scenes=${c.scenes.length} choices=${choices} topics=${[...courseTopics(c, CARDS)].length}/8 entry=${c.entry.kind}:${c.entry.code}`);
}
for (const i of issues) console.log(`${i.level === 'error' ? '✖' : '⚠'} [${i.where}] ${i.msg}`);
const errors = issues.filter((i) => i.level === 'error').length;
console.log(`\n${SEED_BUNDLE.cards.length} cards, ${errors} errors, ${issues.length - errors} warnings`);
process.exit(errors ? 1 : 0);
