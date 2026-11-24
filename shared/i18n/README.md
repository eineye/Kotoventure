# Translations (ja / zh / es)

English is the source language; Korean is written in the content itself (`src/i18n/ko-text.ts`).
Japanese, Simplified Chinese and Spanish are looked up at runtime from `src/i18n/dict/*.ts`.

- `content.tsv`, `ui.tsv`, `ui-1.tsv`, `ui-<name>.tsv` – English strings to translate: `<key>\t<English>`
  (key = fnv32 of the text with numbers replaced by `#`, see `src/i18n/translate.ts`).
- `tl/<lang>-<name>.tsv` – translations: `<key>\t<translation>`. Keep numbers in the same order as in English.
- Adding strings: write `tl5/<name>.tsv` as `<English>\t<ja>\t<zh>\t<es>` and run
  `npx tsx scripts/split-en.ts i18n/tl5/<name>.tsv` (writes `ui-<name>.tsv` and the `tl/` files).
- Sentences built at runtime (day-plan logs, bus/taxi steps, "X → Y"…) are handled by the
  templates and phrases in `src/i18n/translate.ts`; only their parts (place names etc.) need entries.
- Rebuild the dictionaries:
  `python3 scripts/build-dict.py i18n/content.tsv i18n/ui-1.tsv i18n/ui.tsv i18n/ui-*.tsv --tl i18n/tl`
