import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { setup } from "./browser-fixture.mjs";
const releaseSha256 = createHash("sha256")
  .update(readFileSync("index.html"))
  .digest("hex");
const b = await setup();
const profiles = [];
try {
  for (const pace of [8, 12, 16, 20, 24])
    for (const skip of [false, true]) {
      const result = await b.page.evaluate(
        async ({ pace, skip }) => {
          const t = __test;
          t.reset(pace);
          const click = (root, label) => {
            const button = [...root.querySelectorAll("button")].find(
              (b) => b.textContent === label && !b.disabled,
            );
            if (!button) throw Error("Missing button " + label);
            button.click();
          };
          t.lessons.begin("tutorial");
          for (let step = 0; step < 4; step++) {
            const area = document.querySelector("#tutorialInteraction");
            if (step === 0) click(area, "Hello");
            else if (step === 1) {
              click(area, "How are you?");
            } else if (step === 2) click(area, "پښتو");
            else {
              if(document.querySelector("#tutorialName")){document.querySelector("#tutorialName").value="Muhammad Jan";click(area,"Check answer");}else click(area,"Muhammad Jan");
            }
            t.lessons.afterStudy();
            await Promise.resolve();
          }
          if (!t.state.progress.tutorialDone) throw Error("Onboarding failed");
          const trace = [],
            seenStudy = new Set();
          let visits = 0,
            assessments = 0,
            observedSentences = 0,
            generatedObserved = 0;
          const observe = (card) => {
            if (card.type !== "sentence") return;
            observedSentences++;
            if (card.generated?.origin !== "productive_engine")
              throw Error("Authored instructional sentence");
            const proof = t.S.restoreCard(
              t.content.LIBRARY_DATA,
              t.content.LIBRARY_DATA.sentenceFrames,
              card,
            );
            if (
              !proof ||
              proof.ps !== card.ps ||
              proof.en !== card.en ||
              proof.roman !== card.roman
            )
              throw Error("A generated label does not match compiler output");
            if (
              !card.generated.requiredGrammarIds.every(
                (g) => t.state.progress.library.grammar[g],
              )
            )
              throw Error("Untaught grammar");
            if (
              !Object.values(card.generated.slots).every((r) =>
                t.state.progress.library.acquired[
                  r.lemmaId
                ]?.availableFormIds.includes(r.formId),
              )
            )
              throw Error("Unstudied form");
            if(t.state.session?.mode==='standard'){
              const s=t.state.session,targets=t.state.progress.library.plans[s.loop]?.lessonNewLexemes?.[s.loc]||[];
              if(targets.length&&!Object.values(card.generated.slots).some(r=>targets.includes(r.lemmaId))&&s.generationDeficit?.fallback!=='cumulative-practice')throw Error('Unexplained cumulative sentence fallback');
            }
            generatedObserved++;
          };
          const taughtCount = () =>
            Object.values(t.state.progress.library.acquired).reduce(
              (n, r) => n + r.availableFormIds.length,
              0,
            );
          for (let day = 1; day <= 14; day++) {
            t.day(day);
            const oldCount = taughtCount();
            {
              const opening = t.content.curriculum.days[day - 1].opening;
              const route = skip ? ["school"] :
                day === 2
                  ? ["school", "nature", "business", "residential"]
                  : [
                      opening,
                      ...t.content.zoneKeys.filter((p) => p !== opening),
                    ];
              for (const place of route) {
                t.lessons.begin(day + "-" + place);
                if (t.state.session?.id !== day + "-" + place)
                  throw Error("Inaccessible visit " + day + place);
                let guard = 0;
                while (
                  !document
                    .querySelector("#lessonScreen")
                    .classList.contains("hidden")
                ) {
                  if (++guard > 500)
                    throw Error("Lesson stalled " + day + place);
                  const s = t.state.session;
                  if (["greeting", "lexical", "sentence"].includes(s.phase)) {
                    const id = t.lessons.studyList()[s.cardIndex],
                      card = t.content.wordById[id];
                    if (card) {
                      if (
                        document.querySelector("#teachPashto").textContent !==
                        t.names.text(card.ps)
                      )
                        throw Error("Study surface mismatch");
                      observe(card);
                      if (card.type === "sentence") {
                        if (seenStudy.has(card.ps))
                          throw Error(
                            "Unscheduled repeated sentence across visits",
                          );
                        seenStudy.add(card.ps);
                      }
                      if (
                        card.type === "greeting" &&
                        !t.content.LIBRARY_DATA.phrases.some((p) => p.id === id)
                      )
                        throw Error("Undesignated exception");
                    }
                    t.lessons.afterStudy();
                  } else if (s.phase === "grammar") {
                    const explanation=document.querySelector('#grammarExplanation').cloneNode(true);
                    explanation.querySelectorAll('.sov-demo').forEach(e=>e.remove());
                    if(/[\u0600-\u06ff]/.test(explanation.textContent))throw Error('A stored Pashto model leaked into grammar rules');
                    const demo=document.querySelector('#grammarExplanation .sov-demo[data-example-id]');
                    if(demo){
                      const example=t.content.wordById[demo.dataset.exampleId];observe(example);
                      if(!demo.dataset.complete){
                        for(const token of example.ps.replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean)){
                          const tile=[...demo.querySelectorAll('.word-tiles button')].find(b=>!b.disabled&&b.textContent===token);
                          if(!tile)throw Error('Missing guided SOV tile '+token);tile.click();
                        }
                        const check=[...demo.querySelectorAll('button')].find(b=>b.textContent==='Check sentence');check.click();
                        if(!demo.dataset.complete)throw Error('Guided SOV example failed');
                      }
                    }
                    t.lessons.afterGrammar();
                  } else {
                    const item = s.queue[0],
                      card = t.content.wordById[item.id];
                    observe(card);
                    if (
                      document.querySelector("#quizPashto").textContent !==
                      t.names.text(item.kind === "construct" ? card.en : card.ps)
                    )
                      throw Error("Practice surface mismatch");
                    t.lessons.answer(
                      item.kind === "construct" ? card.ps : card.en,
                    );
                    t.nextQuestion();
                  }
                  await Promise.resolve();
                }
                visits++;
                await new Promise((r) => setTimeout(r, 0));
              }
            }
            const beforeChallenge = taughtCount();
            t.challenge.startChallenge(day);
            const s = t.state.session;
            if (s.questions.length !== (day === 7 || day === 14 ? 25 : 15))
              throw Error("Wrong question count");
            const pass = day === 7 || day === 14 ? 20 : 12,
              answerTexts = new Set();
            const families = new Set(),
              dialogueFamilies = new Set();
            for (let i = 0; i < s.questions.length; i++) {
              await Promise.resolve();
              const q = s.questions[i],
                card = t.content.wordById[q.id];
              if (card?.type === "sentence") {
                observe(card);
                families.add(card.generated.family);
                if (!q.generated || q.generated.ps !== card.ps)
                  throw Error("Missing frozen compiler snapshot");
                if (answerTexts.has(card.ps))
                  throw Error("Repeated complete sentence in one assessment");
                answerTexts.add(card.ps);
              }
              if (q.kind === "dialogue") {
                dialogueFamilies.add(q.dialogueFamily);
                if (q.answerPs !== card.ps)
                  throw Error("Uncompiled dialogue response");
              }
              if (["construct","dialogue"].includes(q.kind) && document.querySelector("#quizPashto").textContent !== t.names.text(q.answerEnglish || card.en))
                throw Error("Construction must display the direct English target");
              if (q.kind === "word") {
                const answerField=q.direction === "en-ps" ? "ps" : "en";
                const studied = new Set(Object.values(t.content.wordById).filter((c) => {
                  const refs = t.content.LIBRARY_DATA.sourceMappings[c.id] || [];
                  return t.state.progress.library.phrases[c.id] || (refs.length && refs.every((r) =>
                    t.state.progress.library.acquired[r.lemmaId]?.availableFormIds.includes(r.formId)));
                }).map((c) => c[answerField]));
                const backup = new Set(t.content.LIBRARY_DATA.entries
                  .filter(e => e.introduction.day === 1 && e.forms[0].firstAllowedDay === 1)
                  .map(e => t.content.wordById["library-card:"+e.lemmaId][answerField]));
                for (const text of q.choiceOrder)
                  if (!studied.has(text) && !backup.has(text) && !(card.type==='greeting'&&t.content.LIBRARY_DATA.phrases.some(p=>(answerField==="en"?p.english:p.pashto)===text)) && !["A different meaning", "Another response", "None of these"].includes(text))
                    throw Error("Distractor is neither studied nor Day-1 backup: " + text);
                if (q.unstudied && !q.recognition && [...document.querySelectorAll("#choices button")].some((b) => b.textContent.trim() === t.names.text(card.en)))
                  throw Error("Unstudied target meaning offered as a clue");
              }
              if (["choice", "address"].includes(q.kind) || q.grammarConcept)
                throw Error("Retired grammar-rule question generated in a practical assessment");
              if (q.kind === "word" && q.unstudied && !q.recognition && q.direction === "ps-en") {
                if (
                  q.direction !== "ps-en" ||
                  document.querySelector("#quizPashto").textContent !==
                    t.names.text(card.ps) ||
                  document.querySelector("#quizRoman").textContent !==
                    t.names.text(card.roman) + " · Not previously studied"
                )
                  throw Error("Unstudied word disclosed before answer");
              }
              if (q.choiceIds)
                for (const id of q.choiceIds) {
                  const choice = t.content.wordById[id];
                  observe(choice);
                  if (
                    !q.choiceOrder.includes(
                      q.direction === "en-ps" ? choice.ps : choice.en,
                    )
                  )
                    throw Error("Unproven sentence option");
                }
              const correct =
                q.answerPs ||
                q.correct ||
                (q.kind === "construct"
                  ? card.ps
                  : q.direction === "en-ps"
                    ? card.ps
                    : card.en);
              t.challenge.answerChallenge(i < pass ? correct : "wrong fixture");
              if (
                card?.type === "sentence" &&
                !document
                  .querySelector("#quizFeedback")
                  .textContent.includes(t.names.text(card.ps))
              )
                throw Error("Unproven sentence feedback");
              const xp = t.state.progress.xp,
                ledger = JSON.stringify(t.state.progress.library.events);
              t.challenge.answerChallenge(correct);
              if (
                t.state.progress.xp !== xp ||
                JSON.stringify(t.state.progress.library.events) !== ledger
              )
                throw Error("First answer was not locked");
              t.nextQuestion();
              if (i % 5 === 4) await new Promise((r) => setTimeout(r, 0));
            }
            if (!t.state.progress.challenges[day]?.passed)
              throw Error("Failed day " + day);
            if (day === 1 && !t.state.progress.homeGranted)
              throw Error("Home award lost");
            if (
              day === 6 &&
              !document.querySelector("#challengeScene svg[aria-label*=Medina]")
            )
              throw Error("Hills scene or Medina introduction lost");
            if (!t.content.zoneKeys.every(loc=>t.state.progress.complete[day+'-'+loc]))
              throw Error("Passed challenge failed to complete locations");
            if (day === 14 && taughtCount() !== oldCount)
              throw Error("Day 14 introduced compulsory vocabulary/forms");
            if (skip && day === 1 && pace === 24 && !families.size)
              throw Error("Challenge activation failed to generate current-day sentences");
            trace.push({
              day,
              generatedFamilies: [...families].sort(),
              dialogueFamilies: [...dialogueFamilies].sort(),
              adapted:
                t.state.progress.library.plans[day].assessmentDeficit
                  .adaptedTasks,
              introducedForms: taughtCount(),
            });
            assessments++;
          }
          if (t.progression.characterStatus(t.state.progress).level !== 10)
            throw Error("Graduation failed");
          const summary = t.learning.deliverySummary();
          return {
            pace,
            skip,
            visits,
            assessments,
            observedSentences,
            generatedObserved,
            summary,
            trace,
            deliveryBySurface: Object.values(
              t.state.progress.library.deliveries,
            ).reduce((out, d) => {
              const k = d.surface;
              out[k] ||= { generated: 0, phrases: 0, lexical: 0 };
              out[k][
                d.kind === "generated_sentence"
                  ? "generated"
                  : d.kind === "fixed_phrase"
                    ? "phrases"
                    : "lexical"
              ]++;
              return out;
            }, {}),
          };
        },
        { pace, skip },
      );
      assert.equal(result.visits, skip ? 14 : 56);
      assert.equal(result.assessments, 14);
      assert.equal(result.observedSentences, result.generatedObserved);
      assert.equal(
        result.summary.generatedPercent,
        result.observedSentences ? 100 : null,
      );
      profiles.push(result);
      console.log(
        `PASS matrix pace ${pace} ${skip ? "skip" : "normal"}: ${result.observedSentences} observed sentence surfaces, all generated`,
      );
    }
  assert.deepEqual(b.errors, []);
  const observed = profiles.reduce((n, p) => n + p.observedSentences, 0),
    generated = profiles.reduce((n, p) => n + p.generatedObserved, 0);
  assert.equal(
    createHash("sha256").update(readFileSync("index.html")).digest("hex"),
    releaseSha256,
    "Release changed during observation; results must be rerun",
  );
  const report = {
    schemaVersion: 1,
    releaseSha256,
    basis:
      "Actual rendered browser surfaces across ten complete profiles; compiler provenance and actual form/grammar unlocks checked independently at each sentence surface.",
    instructionalSentenceObservations: observed,
    genuinelyGeneratedObservations: generated,
    generatedPercentage: observed ? 100 : null,
    fixedAuthoredSentenceObservations: 0,
    designatedPhraseExceptions: JSON.parse(readFileSync("content/FIXED_PHRASES.json","utf8")).phrases.length,
    totalVisits: 350,
    totalAssessments: 140,
    profiles,
  };
  writeFileSync(
    "work/instructional-delivery-matrix.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `PASS actual delivery: ${generated}/${observed} = 100%; 350 visits, 140 assessments, five paces, normal/skip, no authored sentence surfaces`,
  );
} finally {
  await b.close();
}
