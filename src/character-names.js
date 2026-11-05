/* Names are a presentation of stable people, not new lexical/reward identities.
 * Current-format proofs, indexed answer values and archival evidence stay exact.
 * Only whole named tokens from the explicit owner-approved register are replaced. */
const CharacterNames = (() => {
  const display = new Map(), answers = new Map();
  for (const {previous, current} of CHARACTER_NAMES.characters) {
    display.set(previous.english, current.english);
    for (const word of previous.pashto) display.set(word, current.pashto);
    for (const word of previous.romanisation) display.set(word, current.romanisation);
    answers.set(current.english.toLocaleLowerCase(), previous.english);
  }
  const tokens = /[\p{L}\p{M}]+/gu;
  return {
    text: value => String(value ?? '').replace(tokens, word => display.get(word) ?? word),
    // Typed English recall accepts the current visible name through its existing
    // identity; choices and construction already submit stored values/tile indices.
    storedAnswer: value => String(value ?? '').replace(tokens, word => answers.get(word.toLocaleLowerCase()) ?? word),
  };
})();
