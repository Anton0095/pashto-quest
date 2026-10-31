/* Capacity is a grammar diagnostic, not evidence of actual instructional delivery. */
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
const read = (p) => readFileSync(p, "utf8"),
  data = JSON.parse(read("content/LIBRARY_LEXICON.json")),
  frames = JSON.parse(read("content/SENTENCE_FRAMES.json"));
const S = vm.runInNewContext(
  read("src/sentence-engine.js") + ";SentenceEngine",
);
const catalog = S.catalog(data, frames),
  refs = new Map(
    data.entries.flatMap((e) => e.forms.map((f) => [f.formId, { e, f }])),
  );
const unique = (xs) => [...new Set(xs)],
  families = unique(
    [...frames.frames, ...frames.compositeFrames].map((f) => f.family),
  );
const archivedTexts = new Set(data.generationAttestations.map((a) => a.pashto));
const days = [];
for (let day = 1; day <= 14; day++) {
  const cards = catalog.filter((c) => c.loop <= day),
    byFamily = Object.fromEntries(
      families.map((f) => [
        f,
        unique(cards.filter((c) => c.generated.family === f).map((c) => c.ps))
          .length,
      ]),
    );
  const clauses = cards.filter(
    (c) =>
      c.generated.family === "present_transitive" &&
      c.generated.subjects.some(
        (s) => [1, 2].includes(s.person) && s.number === "singular",
      ),
  );
  const clauseCount = unique(clauses.map((c) => c.ps)).length;
  byFamily.coordinated_present = day < 4 ? 0 : clauseCount * (clauseCount - 1);
  days.push({
    day,
    baseBindings: cards.length,
    baseUniquePashto: unique(cards.map((c) => c.ps)).length,
    byFamily,
    orderedClausePairs: byFamily.coordinated_present,
    baseNovelPashto: unique(
      cards.filter((c) => !archivedTexts.has(c.ps)).map((c) => c.ps),
    ).length,
    baseArchivalTextMatches: unique(
      cards.filter((c) => archivedTexts.has(c.ps)).map((c) => c.ps),
    ).length,
    byFamilyDetails: Object.fromEntries(
      families.map((family) => {
        const subset = cards.filter((c) => c.generated.family === family);
        return [
          family,
          {
            eligibleUniquePashto: byFamily[family],
            newlyComposedTexts:
              family === "coordinated_present"
                ? null
                : unique(
                    subset
                      .filter((c) => !archivedTexts.has(c.ps))
                      .map((c) => c.ps),
                  ).length,
            archivalTextMatches:
              family === "coordinated_present"
                ? null
                : unique(
                    subset
                      .filter((c) => archivedTexts.has(c.ps))
                      .map((c) => c.ps),
                  ).length,
            fixedAuthoredFallbacks: 0,
            note:
              family === "coordinated_present"
                ? "Algebraic capacity; novelty against archive is not claimed without enumerating pairs."
                : "Archival text matches are independently compiled, never fetched as targets.",
          },
        ];
      }),
    ),
  });
}
const formGaps = [];
for (const e of data.entries)
  for (const f of e.forms) {
    const missing = [];
    if (!f.romanisation) missing.push("own form romanisation");
    const mandatory =
      e.partOfSpeech === "noun"
        ? ["gender", "number", "case"]
        : e.partOfSpeech === "adjective"
          ? ["gender", "number", "case"]
          : e.partOfSpeech === "verb"
            ? ["person", "number", "tense", "aspect", "mood", "transitivity"]
            : [];
    for (const k of mandatory) if (f.morphology[k] == null) missing.push(k);
    if (!f.composition.enabled)
      missing.push("form-specific compositional role and contextual evidence");
    if (["noun", "verb"].includes(e.partOfSpeech) && !e.generationSemantics)
      missing.push("sense-specific semantic/English argument metadata");
    if (missing.length)
      formGaps.push({
        lemmaId: e.lemmaId,
        formId: f.formId,
        pashto: f.pashto,
        compositionEligible: f.composition.enabled,
        licensedRoles: f.composition.roles || [],
        missing,
        reason: f.composition.reason,
      });
  }
const verbGaps = data.entries
  .filter((e) => e.partOfSpeech === "verb")
  .map((e) => ({
    lemmaId: e.lemmaId,
    pashto: e.displayLemmaPs,
    missingPresentCells: [
      [3, "singular"],
      [1, "singular"],
      [2, "singular"],
      [2, "plural"],
      [1, "plural"],
      [3, "plural"],
    ]
      .filter(
        ([p, n]) =>
          !e.forms.some(
            (f) =>
              f.composition.roles?.includes("verb") &&
              f.morphology.person === p &&
              f.morphology.number === n,
          ),
      )
      .map(([p, n]) => ({
        person: p,
        number: n,
        needed:
          "Exact present imperfective indicative surface and own pronunciation span, with valency and sense evidence; not a guessed stem",
      })),
  }))
  .filter((e) => e.missingPresentCells.length);
const nounGaps = data.entries
  .filter((e) => e.partOfSpeech === "noun")
  .map((e) => ({
    lemmaId: e.lemmaId,
    pashto: e.displayLemmaPs,
    missingDirectPlural:
      e.generationSemantics?.countability === "count" &&
      !e.forms.some(
        (f) =>
          f.composition.roles?.includes("noun") &&
          f.morphology.number === "plural" &&
          f.morphology.case === "direct",
      ),
    bareObliqueLicensed: e.forms.some(
      (f) =>
        f.composition.roles?.includes("noun") &&
        f.morphology.case === "oblique",
    ),
    required:
      "An attested spelling, own pronunciation aid and explicit gender/number/case features are required before another nominal cell can be used. A whole location/possession chunk does not license arbitrary obliques.",
  }))
  .filter((g) => g.missingDirectPlural || !g.bareObliqueLicensed);
const adjectiveGaps = data.entries
  .filter((e) => e.partOfSpeech === "adjective")
  .map((e) => ({
    lemmaId: e.lemmaId,
    pashto: e.displayLemmaPs,
    missingDirectAgreementCells: ["masculine", "feminine"].flatMap((gender) =>
      ["singular", "plural"]
        .filter(
          (number) =>
            !e.forms.some(
              (f) =>
                f.composition.roles?.includes("adjective") &&
                f.morphology.gender === gender &&
                f.morphology.number === number &&
                f.morphology.case === "direct",
            ),
        )
        .map((number) => ({
          gender,
          number,
          case: "direct",
          needed:
            "Attested adjective surface and own pronunciation span; no generic inflection rule is licensed.",
        })),
    ),
  }))
  .filter((g) => g.missingDirectAgreementCells.length);
const report = {
  schemaVersion: 2,
  notice:
    "Diagnostic capacity under provisional form licenses. Runtime builds no sentence catalogue at startup: it compiles after actual study/grammar unlocks. See INSTRUCTIONAL_DELIVERY_AUDIT.json for measured delivery. An exact match to an archived text is still dynamically composed from forms, never retrieved as a teaching target. Clause-pair capacity is algebraic, not an enumerated list or a native-language approval.",
  lemmaCount: data.entries.length,
  formCount: refs.size,
  eligibleFormCount: [...refs.values()].filter((x) => x.f.composition.enabled)
    .length,
  frameCount: frames.frames.length + frames.compositeFrames.length,
  familyCount: families.length,
  potentialByDay: days,
  playableAuthoredFallbacks: 0,
  fixedPhraseExceptionCount: JSON.parse(read("content/FIXED_PHRASES.json"))
    .phrases.length,
  blockedConstructions: frames.blockedConstructions,
  formGaps,
  verbGaps,
  nounGaps,
  adjectiveGaps,
};
const lines = [
  "# Generation capacity and evidence gaps",
  "",
  report.notice,
  "",
  `Inventory: ${report.lemmaCount} lemmas / ${report.formCount} forms; ${report.eligibleFormCount} composition-eligible forms. ${report.frameCount} typed templates across ${report.familyCount} families.`,
  "",
  "**This is not the delivery percentage.** [The measured delivery report](INSTRUCTIONAL_DELIVERY_REPORT.md) checks actual lessons and assessments. There are zero playable authored sentence fallbacks; the [registered fixed expressions](FIXED_PHRASE_EXCEPTIONS.md) are the only whole-phrase exceptions.",
  "",
  "## Potential by grammar family and day",
  "",
  `| Family | ${days.map((d) => "D" + d.day).join(" | ")} |`,
  `|---|${days.map(() => "---:").join("|")}|`,
  ...families.map(
    (f) => `| ${f} | ${days.map((d) => d.byFamily[f]).join(" | ")} |`,
  ),
  "",
  "Coordinated-present counts are ordered pairs of distinct independently licensed singular first/second-person SOV clauses, joined by the studied conjunction. They are compiled on request and restored from an AST; no complete clause-pair list is embedded.",
  "",
  "## New texts versus archival matches",
  "",
  "The JSON also separates new texts and exact archival-text matches for every base family/day. Both are generated from form bindings; neither is a fixed fallback. Coordinated-clause novelty is left unclaimed because its capacity is algebraic.",
  "",
  "| Day | Base distinct Pashto | New texts | Archival text matches | Fixed authored fallbacks |",
  "|---:|---:|---:|---:|---:|",
  ...days.map(
    (d) =>
      `| ${d.day} | ${d.baseUniquePashto} | ${d.baseNovelPashto} | ${d.baseArchivalTextMatches} | 0 |`,
  ),
  "",
  "## Blocked combinations",
  "",
  ...frames.blockedConstructions.map(
    (b) =>
      `- **${b.family}**: ${b.missing}${b.formIds ? " Exact IDs: " + b.formIds.join(", ") : ""}`,
  ),
  "",
  "`content/GENERATION_AUDIT.json` lists every unlicensed/partially usable form by stable ID, every missing present-person conjugation cell and nominal plurality/oblique and adjective agreement gaps. Unknown features are never wildcards. A missing feature can exclude a particular role while other evidenced roles remain eligible. No stem, inflection, native review or recording is invented.",
  "",
];
for (const [p, s] of [
  ["content/GENERATION_AUDIT.json", JSON.stringify(report, null, 2) + "\n"],
  ["docs/grammar/GENERATION_COVERAGE.md", lines.join("\n")],
]) {
  if (process.argv.includes("--check")) {
    if (read(p) !== s) throw Error("Stale capacity/gap audit: " + p);
  } else writeFileSync(p, s);
}
console.log(
  `Grammar capacity/gaps: ${report.frameCount} templates / ${report.familyCount} families; ${formGaps.length} exact form gap records; zero authored fallbacks. Delivery is measured separately.`,
);
