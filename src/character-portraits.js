let phaserPortraitMode = false;
const portraitTextures = new Map(), pendingPortraits = new Map();
function usePhaserPortraits(enabled = true) { phaserPortraitMode = enabled; }
function registerPortraitTexture(key, source) {
  portraitTextures.set(key, source);
  for (const render of pendingPortraits.get(key) || []) render(source);
  pendingPortraits.delete(key);
}
/* One character-identity portrait renderer for educational and RPG dialogue. */
function renderCharacterPortrait(identity, expression = "neutral") {
  identity = currentCharacterName(identity);
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
  const variant = character.expressions[expression] ? expression : "neutral";
  const key = id + ":" + variant;
  const render = source => {
  if (source) {
    const img = document.createElement("img");
    img.width = img.height = CHARACTER_PORTRAITS.resolution;
    img.alt = "";
    img.src = source;
    img.addEventListener("error", unavailable, {once: true});
    frame.dataset.portraitStatus = "available";
    frame.setAttribute("aria-label", character.name);
    frame.replaceChildren(img);
  } else unavailable();
  };
  if (phaserPortraitMode && character.expressions[variant] && !portraitTextures.has(key)) {
    frame.dataset.portraitStatus = "loading";
    frame.textContent = "Loading portrait…";
    if (!pendingPortraits.has(key)) pendingPortraits.set(key, new Set());
    pendingPortraits.get(key).add(render);
  } else render(phaserPortraitMode ? portraitTextures.get(key) : character.expressions[variant]);
  return frame;
}

/* Display formatting never changes IDs, stored answers, senses or evaluation. */
function formatEnglishChoice(value) {
  return (typeof CharacterNames!=="undefined"?CharacterNames.text(value):String(value)).replace(/^(\s*["“'‘(\[]*)([a-z][A-Za-z]*)/, (_, prefix, word) => prefix + (/[A-Z]/.test(word) ? word : word[0].toUpperCase() + word.slice(1)));
}
function playerVocabularyText(value) {
  return String(value).replace(/\b(content )?lemmas?\b/gi, match => /^[A-Z]/.test(match) ? (match.toLowerCase().endsWith("s") ? "Words" : "Word") : (match.endsWith("s") ? "words" : "word"));
}

// Presentation aliases for supported frozen attempts; stored questions/proofs stay exact.
function currentCharacterName(value) {
  return String(value ?? "").replace(/\bSaleha\b/g,"Deena").replace(/\bMina\b/g,"Medina");
}
