/* One character-identity portrait renderer for educational and RPG dialogue. */
function renderCharacterPortrait(identity, expression = "neutral") {
  const entries = Object.entries(CHARACTER_PORTRAITS.characters);
  const [id, character] = entries.find(([id, p]) => id === identity || p.name === identity) || [identity, {name: identity, expressions: {}}];
  const frame = document.createElement("span");
  frame.className = "character-portrait";
  // Objects such as Library signs are not missing character artwork.
  if (!entries.some(([id, p]) => id === identity || p.name === identity)) frame.classList.add("hidden");
  frame.dataset.characterId = id;
  frame.setAttribute("role", "img");
  const unavailable = () => {
    frame.replaceChildren();
    frame.dataset.portraitStatus = "missing";
    frame.setAttribute("aria-label", character.name + ": approved portrait unavailable");
    const initials = document.createElement("b"), label = document.createElement("small");
    initials.textContent = character.name.split(/\s+/).map(n => n[0]).join("");
    label.textContent = "Portrait unavailable";
    frame.append(initials, label);
  };
  const source = character.expressions[expression] || character.expressions.neutral;
  if (source) {
    const img = document.createElement("img");
    img.width = img.height = CHARACTER_PORTRAITS.resolution;
    img.alt = "";
    img.src = source;
    img.addEventListener("error", unavailable, {once: true});
    frame.dataset.portraitStatus = "available";
    frame.setAttribute("aria-label", character.name);
    frame.append(img);
  } else unavailable();
  return frame;
}

/* Display formatting never changes IDs, stored answers, senses or evaluation. */
function formatEnglishChoice(value) {
  return String(value).replace(/^(\s*["“'‘(\[]*)([a-z][A-Za-z]*)/, (_, prefix, word) => prefix + (/[A-Z]/.test(word) ? word : word[0].toUpperCase() + word.slice(1)));
}
function playerVocabularyText(value) {
  return String(value).replace(/\b(content )?lemmas?\b/gi, match => /^[A-Z]/.test(match) ? (match.toLowerCase().endsWith("s") ? "Words" : "Word") : (match.endsWith("s") ? "words" : "word"));
}
