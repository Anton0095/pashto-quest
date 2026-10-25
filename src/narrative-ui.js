/* Character dialogue uses the same expression units, scheduler and audio as the tutorial. */
function appendPhrasePractice(container, phrase, source, day = selectedLoop) {
  const box = libraryNode("div", undefined, "phrase-practice");
  const record = LibraryEngine.cardStat(progress, LIBRARY_DATA, phrase.id);
  box.append(libraryNode("p", record.totalAttempts
    ? `Recognition: ${record.correctAttempts}/${record.totalAttempts} · ${record.srsDueAt <= Date.now() ? "due for review" : "review scheduled"}`
    : "Practise recognising this fixed expression (optional):"));
  const options = [...new Set([phrase.english, ...LIBRARY_DATA.phrases
    .filter((p) => p.id !== phrase.id).slice(0, 2).map((p) => p.english)])];
  // Allocate an attempt only on actual response, not each time a surface is rendered.
  let answered = false;
  for (const option of shuffle(options)) {
    box.append(libraryButton(option, () => {
      if (answered) return;
      answered = true;
      for (const button of box.querySelectorAll("button")) button.disabled = true;
      const correct = option === phrase.english;
      LibraryEngine.practise(progress, LIBRARY_DATA, phrase.id, correct, {
        day, location: phrase.location || "library", source,
        eventId: "phrase:" + ++progress.library.attemptSequence,
      });
      // Expressions grant no XP. Repeated display preserves the first encounter.
      save();
      box.append(libraryNode("p", correct ? "Correct. Recognition saved; no XP awarded." : "Meaning: " + phrase.english, "notice"));
    }));
  }
  container.append(box);
}
function expressionDialogue(phrase, source) {
  const card = libraryNode("article", undefined, "narrative-expression");
  card.dataset.expression = phrase.id;
  card.setAttribute("aria-label", `${phrase.speaker}'s ${phrase.optional ? "optional cultural expression" : "greeting"}`);
  const place = LibraryEngine.scene(phrase.location).displayName;
  card.append(libraryNode("p", `${phrase.speaker} → Player · ${place}${phrase.optional ? " · Optional cultural content" : ""}`, "eyebrow"));
  if (!phrase.active) {
    card.append(libraryNode("p", `${phrase.speaker}: “${phrase.english}”`));
    card.append(libraryNode("p", "Pashto teaching for this expression is pending translation and grammatical review. It is not acquired, assessed or counted as a new word.", "tiny"));
    return card;
  }
  const ps = libraryNode("p", phrase.pashto, "library-pashto");
  ps.lang = "ps";
  ps.dir = "rtl";
  card.append(ps,
    libraryNode("p", `${phrase.romanisation} — ${phrase.english}`),
    libraryNode("p", "Fixed expression · approximate romanisation; native Laghman review pending.", "tiny"),
    libraryButton("🔊 Hear " + phrase.english, () => speak(phrase.audioContentId)));
  const audio = libraryNode("p", "Pronunciation depends on a bundled recording or available Pashto voice.", "tiny");
  audio.dataset.expressionAudioStatus = "";
  audio.setAttribute("role", "status");
  card.append(audio);
  LibraryEngine.expose(progress, LIBRARY_DATA, phrase.id, {
    day: phrase.day, source, location: phrase.location,
  });
  appendPhrasePractice(card, phrase, source, phrase.day);
  save();
  return card;
}
function renderDayExpression(day) {
  let root = $("dayExpression");
  if (!root) {
    root = libraryNode("div");
    root.id = "dayExpression";
    $("skipDayArea").before(root);
  }
  root.replaceChildren();
  const phrase = NARRATIVE_DATA.expressions.find((p) => p.day === day && day > 1);
  if (phrase) root.append(expressionDialogue(phrase, "day-opening"));
}
function renderLessonExpression(day, location, mode) {
  let root = $("lessonExpression");
  if (!root) {
    root = libraryNode("div");
    root.id = "lessonExpression";
    $("teachPanel").before(root);
  }
  root.replaceChildren();
  if (mode !== "standard") return;
  const phrase = NARRATIVE_DATA.expressions.find((p) => p.day === day && p.location === location);
  // The opening character repeats their greeting naturally. It is the same persistent
  // identity/first encounter, never a second acquisition or an XP award.
  if (phrase) root.append(expressionDialogue(phrase, "lesson"));
}
