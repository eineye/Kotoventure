# Translations (ja / zh / es)

English is the source language; Korean is written in the content itself (`src/i18n/ko-text.ts`).
Japanese, Simplified Chinese and Spanish are looked up at runtime from `src/i18n/dict/*.ts`.

- `content.tsv`, `ui.tsv` – every English string to translate: `<key>\t<English>`
  (key = fnv32 of the text with numbers replaced by `#`, see `src/i18n/translate.ts`).
- `tl/<lang>-NN.tsv` – translations: `<key>\t<translation>`. Keep numbers in the same order as in English.
- Rebuild the dictionaries: `python3 scripts/build-dict.py i18n/content.tsv i18n/ui.tsv --tl i18n/tl`
