import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
export function activationProblems(candidate) {
  const gaps = [];
  if (!/[\u0600-\u06ff]/.test(candidate.pashtoDraft || ""))
    gaps.push("Pashto headword");
  if (!candidate.romanisationDraft) gaps.push("romanisation");
  if (!candidate.partOfSpeech) gaps.push("part of speech");
  if (!candidate.suitableDistricts?.length) gaps.push("districts");
  if (
    !candidate.forms?.length ||
    candidate.forms.some(
      (f) =>
        !f.formId ||
        !/[\u0600-\u06ff]/.test(f.pashto || "") ||
        !f.romanisation ||
        !f.morphology,
    )
  )
    gaps.push("stable forms and morphology");
  if (
    !candidate.examples?.length ||
    candidate.examples.some(
      (e) =>
        !/[\u0600-\u06ff]/.test(e.pashto || "") ||
        !e.romanisation ||
        !e.english ||
        !e.speaker ||
        !e.recipient ||
        !e.constraints,
    )
  )
    gaps.push("contextual examples and constraints");
  if (
    !candidate.sourceMappings ||
    !Object.keys(candidate.sourceMappings).length
  )
    gaps.push("source mappings");
  if (
    candidate.reviewStatus !== "approved" ||
    !candidate.nativeReview?.reviewer ||
    !candidate.nativeReview?.reference
  )
    gaps.push("documented qualified native sign-off");
  if (candidate.aliasOfLemmaId)
    gaps.push("existing lemma alias, not a new entry");
  return gaps;
}
const tally = (values) =>
  values.reduce((o, k) => ((o[k] = (o[k] || 0) + 1), o), {});
export function inventory(data, backlog, engine, includeProjection = true) {
  const E = vm.runInNewContext(engine + ";LibraryEngine");
  const content = data.entries.filter((e) => e.countsTowardDailyQuota);
  const schedules = [];
  for (const reviewExams of [false, true])
    for (const pace of E.presets) {
      const p = { library: E.state() };
      const days = [];
      for (let day = 1; day <= 14; day++) {
        p.library.requestedDailyTarget =
          reviewExams && [7, 14].includes(day) ? 0 : pace;
        const plan = E.ensurePlan(p, data, day);
        days.push({
          day,
          requested: plan.requestedDailyTarget,
          assigned: Object.values(plan.locationAssignments).flat().length,
          feasible: !plan.contentGap,
          shortfalls: plan.shortfalls,
          locationAssignments: plan.locationAssignments,
          perDistrict: Object.fromEntries(
            Object.entries(plan.locationAssignments).map(([key, ids]) => [
              E.scene(key).districtId,
              ids.length,
            ]),
          ),
        });
        // Real chronological exposure includes story words, not just idealised quota arithmetic.
        for (const id of new Set([
          ...Object.values(plan.locationAssignments).flat(),
          ...Object.values(data.storyRequirements[day] || {}).flat(),
        ])) {
          const e = data.entries.find((e) => e.lemmaId === id);
          if (e)
            E.encounter(
              p,
              data,
              { lemmaId: id, formId: e.forms[0].formId },
              { day, source: "lesson", location: "simulation" },
            );
        }
      }
      schedules.push({
        pace,
        reviewExams,
        days,
        encountered: E.summary(p, data).encountered,
      });
    }
  const forms = data.entries.flatMap((e) => e.forms);
  // Identity-only capacity projection. These records have no Pashto and are NEVER
  // supplied to the builder/runtime or reported as active/approved vocabulary.
  let targetProjection = null;
  if (includeProjection) {
    const projected = {
      ...data,
      entries: [
        ...data.entries,
        ...backlog.candidates
          .filter((c) => c.selectedForExpansion)
          .map((c, i) => ({
            lemmaId: c.candidateId,
            primaryDistrict: c.primaryDistrict,
            suitableDistricts: c.suitableDistricts,
            partOfSpeech: c.partOfSpeech,
            countsTowardDailyQuota: true,
            introduction: {
              day: c.partOfSpeech === "verb" ? 2 : 1,
              district: c.primaryDistrict,
              teachingOrder: 1000 + i,
            },
            examples: [],
            forms: [
              {
                formId: "projection-only:" + c.candidateId,
                firstAllowedDay: c.partOfSpeech === "verb" ? 2 : 1,
              },
            ],
          })),
      ],
    };
    const intensive = inventory(
      projected,
      backlog,
      engine,
      false,
    ).schedules.find((s) => s.pace === 24 && !s.reviewExams);
    targetProjection = {
      status:
        "Identity-only projection; every selected target assumed distinct and approved. NOT playable capacity or linguistic verification.",
      scheduled: intensive.days.reduce((sum, d) => sum + d.assigned, 0),
      encounteredIncludingStory: intensive.encountered,
      missingScheduled:
        312 - intensive.days.reduce((sum, d) => sum + d.assigned, 0),
      days: intensive.days,
    };
  }
  return {
    targetProjection,
    candidateDistrictCounts: tally(
      backlog.candidates.map((c) => c.primaryDistrict),
    ),
    selectedInactiveCandidatesByDistrict: tally(
      backlog.candidates
        .filter((c) => c.selectedForExpansion)
        .map((c) => c.primaryDistrict),
    ),
    selectedInactiveCandidates: backlog.candidates.filter(
      (c) => c.selectedForExpansion,
    ).length,
    excludedCandidates: backlog.candidates.filter(
      (c) => !c.selectedForExpansion,
    ).length,
    universalLemmas: data.entries.filter(
      (e) => e.vocabularyClass === "universal",
    ).length,
    targetInventory: {
      perDistrict: 100,
      total: 400,
      currentlyPlayable: content.length,
      missingPlayableToTarget: 400 - content.length,
      intensiveScheduledIntroductions: 13 * 24,
      minimumCurrentShortfall: 13 * 24 - content.length,
      idealTargetIncidentalMarginPerDistrict: 100 - 13 * 6,
      note: "400 is a pending lexical target, not playable capacity. An approved primary district must retain 78 unencountered entries; more than 22 incidental introductions in any district needs additional distinct reviewed content. Cross-district allocation is globally deduplicated.",
    },
    authoredExampleSceneCoverage: Object.fromEntries(
      [
        "residential",
        "nature",
        "business",
        "school",
        "hills",
        "bakery",
        "neighbourHome",
      ].map((scene) => [
        scene,
        content.filter((e) => e.examples.some((ex) => ex.location === scene))
          .length,
      ]),
    ),
    schemaVersion: 1,
    activatedLemmas: data.entries.length,
    activatedContentLemmas: content.length,
    nativeApprovedContentLemmas: content.filter(
      (e) => e.reviewStatus === "approved",
    ).length,
    inactiveCandidates: backlog.candidates.length,
    aliasCandidates: backlog.candidates.filter((c) => c.aliasOfLemmaId).length,
    eligibleForPromotion: backlog.candidates.filter(
      (c) => !activationProblems(c).length,
    ).length,
    byPrimaryDistrict: tally(content.map((e) => e.primaryDistrict)),
    byPartOfSpeech: tally(content.map((e) => e.partOfSpeech)),
    byReviewStatus: tally(data.entries.map((e) => e.reviewStatus)),
    byDifficulty: tally(
      data.entries.map((e) => e.difficulty || "not assessed"),
    ),
    formCount: forms.length,
    duplicateLemmaIds: data.entries
      .map((e) => e.lemmaId)
      .filter((id, i, all) => all.indexOf(id) !== i),
    sameHeadwordForEditorialReview: Object.entries(
      data.entries.reduce(
        (o, e) => ((o[e.displayLemmaPs] ||= []).push(e.lemmaId), o),
        {},
      ),
    ).filter(([, ids]) => ids.length > 1),
    scenes: [
      "residential",
      "nature",
      "business",
      "school",
      "library",
      "hills",
      "bakery",
      "neighbourHome",
    ].map((id) => E.scene(id)),
    candidateGaps: tally(backlog.candidates.flatMap(activationProblems)),
    schedules,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const data = JSON.parse(
      readFileSync("index.html", "utf8").match(
        /const LIBRARY_DATA=(\{.*?\});/s,
      )[1],
    ),
    backlog = JSON.parse(
      readFileSync("content/DISTRICT_VOCABULARY_CANDIDATES.json"),
    ),
    engine = readFileSync("src/library-engine.js", "utf8");
  const report =
      JSON.stringify(inventory(data, backlog, engine), null, 2) + "\n",
    path = "content/DISTRICT_INVENTORY_REPORT.json";
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== report)
      throw Error("Stale district inventory report");
  } else writeFileSync(path, report);
  console.log(
    "District inventory: " +
      data.entries.filter((e) => e.countsTowardDailyQuota).length +
      " activated content lemmas; " +
      backlog.candidates.length +
      " inactive candidates. No untranslated entry promoted.",
  );
}
