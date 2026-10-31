/* Publish actual browser-observed delivery, with a release fingerprint and explicit exceptions. */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const read = (p) => readFileSync(p, "utf8"),
  hash = createHash("sha256").update(readFileSync("index.html")).digest("hex");
const phrases = JSON.parse(read("content/FIXED_PHRASES.json")).phrases;
const source = process.argv.includes("--write")
  ? "work/instructional-delivery-matrix.json"
  : "content/INSTRUCTIONAL_DELIVERY_AUDIT.json";
const report = JSON.parse(read(source));
if (report.releaseSha256 !== hash)
  throw Error(
    "Delivery results do not match this release; rerun the full browser-inclusive verification.",
  );
if (
  report.totalVisits !== 392 ||
  report.totalAssessments !== 196 ||
  report.profiles.length !== 14 ||
  report.instructionalSentenceObservations < 1 ||
  report.genuinelyGeneratedObservations !==
    report.instructionalSentenceObservations ||
  report.generatedPercentage !== 100 ||
  report.fixedAuthoredSentenceObservations !== 0
)
  throw Error("Generated-only delivery acceptance failed");
const normal = report.profiles.find((p) => p.pace === 24 && !p.skip);
const after = process.argv.includes("--write")
  ? JSON.parse(read("work/day1-after.json"))
  : null;
const home = after
  ? after.transcript.filter((t) => t.phase === "sentence")
  : report.day1Home.sentences;
if (
  home.length < 2 ||
  new Set(home.map((t) => t.pashto)).size !== home.length ||
  home.some((t) => t.origin !== "productive_engine")
)
  throw Error("Day 1 default Home failed");
if (after)
  report.day1Home = {
    assignedLemmaIds: after.summary.assigned,
    grammarAfterWordStudy:
      after.transcript.findIndex((t) => t.phase === "grammar") >
      after.transcript.map((t) => t.phase).lastIndexOf("lexical"),
    sentences: home,
    variants: after.variants,
  };
report.fixedPhraseExceptions = phrases.map((p) => ({
  id: p.id,
  pashto: p.pashto,
  english: p.english,
  reason: p.exceptionReason,
}));
const lines = [
  "# Measured instructional sentence delivery",
  "",
  `**${report.genuinelyGeneratedObservations} / ${report.instructionalSentenceObservations} independently observed sentence surfaces were generated: 100%.** Zero authored sentence surfaces were delivered. The ${phrases.length} designated fixed expressions are excluded from this denominator; profiles that delivered no sentences are marked N/A rather than assigned a fictitious percentage.`,
  "",
  report.basis,
  "",
  `Release SHA-256: \`${report.releaseSha256}\`. The complete browser matrix covered 392 normal district visits and 196 assessments, all fourteen days, seven paces and normal/skip paths. Observer assertions compare rendered text and compiler reconstruction and check actual introduced forms and grammar.`,
  ``,
  "## Day 1 Home: before and after",
  "",
  "Before this revision, the default Home visit taught two stored cards, then displayed the same two texts again as generated cards: four sentence-study cards, two unique propositions. Grammar came before word study. The archived sources remain proof/fixtures, not runtime language content.",
  "",
  "| Before: sentence-study order | Pashto | Source |",
  "|---:|---|---|",
  "| 1 | کور لوی دی. | Stored authored card s3-house |",
  "| 2 | دروازه خلاصه ده. | Stored authored card s-it-door |",
  "| 3–4 | Same two texts | Duplicate generated cards |",
  "",
  "After this revision: Library onboarding is separate (two fixed greetings and two English profile settings). At Home, the player studies exactly six assigned district lemmas plus the required feminine adjective form, reads the agreement rule, then receives these engine-composed descriptions and practises them with shuffled indexed word tiles:",
  "",
  "| Pashto | English | Origin |",
  "|---|---|---|",
  ...home.map((t) => `| ${t.pashto} | ${t.english} | productive engine |`),
  "",
  "Default Home needs no other district visit and introduces no action verb. The window/open pairing is composed from independently licensed noun and adjective features; the complete output is not an authored target. At paces 0 and 4, fewer than two compositions are available from the prescribed district words. Visits and assessments adapt with explicit word/English-grammar tasks, without extra district lemmas or a fixed-sentence substitution.",
  "",
  "![Generated Home study on mobile](demonstration/day1-generated-study.png)",
  "",
  "![Actual Home tile construction on mobile](demonstration/day1-construction.png)",
  "",
  "## Actual generated assessment families by day, default pace",
  "",
  "| Day | Generated question/answer families | Dialogue families | Adapted tasks |",
  "|---|---|---|---:|",
  ...normal.trace.map(
    (d) =>
      `| ${d.day} | ${d.generatedFamilies.join(", ") || "None: insufficient studied forms"} | ${d.dialogueFamilies.join(", ") || "None"} | ${d.adapted} |`,
  ),
  "",
  "## All tested profiles",
  "",
  "| District pace | Route | Observed sentence surfaces | Generated |",
  "|---:|---|---:|---:|",
  ...report.profiles.map(
    (p) =>
      `| ${p.pace} | ${p.skip ? "Skip" : "Normal"} | ${p.observedSentences} | ${p.observedSentences ? "100%" : "N/A (no sentences)"} |`,
  ),
  "",
  "## Fixed expression inventory",
  "",
  "| ID | Pashto | English |",
  "|---|---|---|",
  ...phrases.map((p) => `| ${p.id} | ${p.pashto} | ${p.english} |`),
  "",
  "No ordinary descriptions, actions, questions, possession or spatial sentences are phrase exceptions. Individual inflected words and licensed grammatical chunks are studied as forms; when used in a clause, they must pass the sentence compiler. Profile name/gender questions are English interface settings and are not Pashto exceptions.",
  "",
  "## Architecture and limits",
  "",
  "The runtime contains no authored sentence cards, lesson sentence targets or fixed grammar models; only explicitly registered conventional expressions have fixed conversational responses. It builds no sentence catalogue before study. Templates compile against the current introduced forms and actual grammar; typed dialogues join compatible generated questions and responses. Frozen attempts retain complete text/gloss, indices, choices, scene, speaker/recipient, source forms and ASTs. A generated label alone is insufficient: bodies are recomposed and checked. Standard visits exclude earlier studied sentence texts; explicit revision/replay handles repetition.",
  "",
  "[Capacity and exact missing forms/features](GENERATION_COVERAGE.md) are separate diagnostics. Unattested inflections, missing counted numeral constructions and unlicensed obliques remain excluded. Base entries and conventional expressions are user-approved; inflections, grammar and composed language remain provisional; automated consistency, Chromium/mobile layouts and mocked audio are not native Laghman review or physical iPhone/Windows testing.",
  "",
];
const exceptionLines = [
  "# Fixed phrase exceptions",
  "",
  "This is the complete exception register. Exact wording is checked against content/USER_LANGUAGE_APPROVALS.json and active expression identities; ordinary sentence targets cannot be added as exceptions.",
  "",
  "| ID | Pashto | English | Introduction | Reason |",
  "|---|---|---|---:|---|",
  ...phrases.map(
    (p) =>
      `| ${p.id} | ${p.pashto} | ${p.english} | ${p.day} | ${p.exceptionReason} |`,
  ),
  "",
  "English profile settings are not language teaching. Phonological letters, lexical headwords, individual finite/inflected forms and licensed non-clausal chunks are vocabulary/form references, not hidden fixed-sentence exceptions. Every instructional clause is generated. All registered expressions are user-approved, without independent native certification.",
  "",
];
exceptionLines.push(
  "## Expanding the register", "",
  "The inventory is not a permanent cap. Additional conventional formulas require stable identity, exact wording/sense/transliteration, context and documented approval under [language review](../../LANGUAGE_REVIEW.md), with reviewer, date and reference. Update canonical phrase/expression data, the register, validators and tests together under the [validation policy](../../tests/README.md#choose-validation-by-change-and-risk). Unapproved proposals remain inactive; ordinary sentences cannot be relabelled as phrases to bypass generation.", "",
  "The Day-7 peace response is introduced on Day 5 and reused conversationally. Three Day-1 phrases and two Pashto tutorial questions remain [inactive proposals](LANGUAGE_PROPOSALS.md). Profile controls remain English until those questions are approved.", ""
);
const outputs = [
  [
    "content/INSTRUCTIONAL_DELIVERY_AUDIT.json",
    JSON.stringify(report, null, 2) + "\n",
  ],
  ["docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md", lines.join("\n")],
  ["docs/grammar/FIXED_PHRASE_EXCEPTIONS.md", exceptionLines.join("\n")],
];
for (const [p, s] of outputs) {
  if (process.argv.includes("--write")) writeFileSync(p, s);
  else if (read(p) !== s) throw Error("Stale delivery report: " + p);
}
console.log(
  `Measured delivery: ${report.genuinelyGeneratedObservations}/${report.instructionalSentenceObservations} = 100%, zero authored sentences, ${phrases.length} explicit phrase exceptions, ${home.length} distinct default Home sentences.`,
);
