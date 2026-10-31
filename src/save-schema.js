/* Schema-7 shape and compiler-proof validation. No persistence or DOM. */
function createSaveValidator({ content, progression }) {
  function validOrder(order, size) {
    return (
      Array.isArray(order) &&
      order.length === size &&
      new Set(order).size === size &&
      order.every(
        (index) => Number.isInteger(index) && index >= 0 && index < size,
      )
    );
  }
  function currentSave(p) {
    try { return nestedSave(p) && validateSave(p); } catch { return false; }
  }
  function nestedSave(p) {
    const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
    const integer = v => Number.isSafeInteger(v) && v >= 0;
    const time = v => Number.isFinite(v) && v >= 0;
    const strings = v => Array.isArray(v) && v.every(x => typeof x === "string") && new Set(v).size === v.length;
    const stats = v => object(v) && integer(v.totalAttempts) && integer(v.correctAttempts) && v.correctAttempts <= v.totalAttempts && integer(v.stage) && v.stage <= 5 && time(v.srsDueAt);
    if (!object(p) || !object(p.library)) return false;
    const l = p.library;
    if (!integer(l.seed) || !["units","acquired","plans","dayExposure","grammar","phrases","events","deliveries","deficits"].every(k=>object(l[k]))) return false;
    if (l.retiredAttemptSequence !== undefined && (!integer(l.retiredAttemptSequence) || l.retiredAttemptSequence > l.attemptSequence)) return false;
    if (l.protectedAttemptIds !== undefined && (!Array.isArray(l.protectedAttemptIds) || l.protectedAttemptIds.length > 2 || new Set(l.protectedAttemptIds).size !== l.protectedAttemptIds.length || l.protectedAttemptIds.some(id => !integer(id) || id < 1 || id > l.attemptSequence))) return false;
    if (p.activeChallenge && p.activeChallenge.attemptId <= (l.retiredAttemptSequence || 0) && !l.protectedAttemptIds?.includes(p.activeChallenge.attemptId)) return false;
    if (!Object.values(l.units).every(stats)) return false;
    if (![p.rewards,p.complete].every(v=>object(v) && Object.values(v).every(x=>x===true))) return false;
    if (p.homeGranted !== undefined && typeof p.homeGranted !== "boolean") return false;
    for (const r of Object.values(l.acquired)) {
      if (!object(r) || !object(r.forms) || !Object.values(r.forms).every(stats) ||
          !integer(r.totalAttempts) || !integer(r.correctAttempts) || r.correctAttempts>r.totalAttempts || !time(r.srsDueAt) ||
          !Number.isInteger(r.firstEncounteredDay) || r.firstEncounteredDay<1 || r.firstEncounteredDay>14 ||
          typeof r.firstEncounteredSource!=="string" || !strings(r.encounteredSourceIds) ||
          ![r.encounteredFormIds,r.introducedFormIds,r.practisedFormIds].every(strings) ||
          [...r.introducedFormIds,...r.practisedFormIds,...Object.keys(r.forms)].some(id=>!r.encounteredFormIds.includes(id))) return false;
      if (r.formallyIntroducedDay!==undefined && (!integer(r.formallyIntroducedDay)||r.formallyIntroducedDay<1||r.formallyIntroducedDay>14)) return false;
      if (r.masteredAt!==undefined && !time(r.masteredAt)) return false;
    }
    for (const [day,r] of Object.entries(l.dayExposure)) {
      if (!/^(?:[1-9]|1[0-4])$/.test(day) || !object(r) || ![r.incidentalStoryLemmas,r.reviewedExistingLemmas].every(a=>strings(a)&&a.every(id=>content.libraryEntries[id]))) return false;
    }
    for (const [id,r] of Object.entries(l.grammar)) {
      if (!object(r)||!Number.isInteger(r.day)||r.day<1||r.day>14||id!=="grammar-day-"+r.day||typeof r.source!=="string") return false;
    }
    for (const [id,r] of Object.entries(l.phrases)) {
      if (!content.LIBRARY_DATA.phrases.some(p=>p.id===id)||!object(r)||!integer(r.day)||r.day>14||typeof r.source!=="string") return false;
    }
    if (!Object.values(l.events).every(v=>v===true)) return false;
    for (const r of Object.values(l.deficits)) if (!object(r)||![r.requested,r.available,r.missing].every(integer)||(r.reason!==null&&typeof r.reason!=="string")) return false;
    for (const r of Object.values(l.deliveries)) if (!object(r)||typeof r.id!=="string"||!integer(r.day)||r.day>14||typeof r.surface!=="string"||typeof r.mode!=="string"||(r.count!==undefined&&(!integer(r.count)||r.count<1))||(r.lastDay!==undefined&&(!integer(r.lastDay)||r.lastDay<r.day||r.lastDay>14))) return false;
    for (const plan of Object.values(l.plans)) {
      if (!object(plan)||!integer(plan.seed)||!object(plan.shortfalls)||typeof plan.notice!=="string"||typeof plan.contentGap!=="boolean"||
          !(plan.effectiveDailyTarget===null||LibraryEngine.presets.includes(plan.effectiveDailyTarget))||
          !content.zoneKeys.every(k=>integer(plan.shortfalls[k])&&plan.shortfalls[k]<=6)) return false;
      if (plan.generatedPracticeCards!==undefined && (!object(plan.generatedPracticeCards)||Object.values(plan.generatedPracticeCards).some(a=>!Array.isArray(a)))) return false;
      if (plan.challengeQuestions!==undefined && (!Array.isArray(plan.challengeQuestions)||plan.challengeQuestions.length!==progression.getChallengeSpec(plan.day).questionCount)) return false;
    }
    return true;
  }
  function validateSave(p) {
    const object = (value) =>
      value && typeof value === "object" && !Array.isArray(value);
    if (
      !object(p) ||
      p.saveSchemaVersion !== progression.SAVE_VERSION ||
      !Number.isFinite(p.xp) ||
      p.xp < 0
    )
      return false;
    if (!["rewards", "complete", "challenges"].every((key) => object(p[key])))
      return false;
    if (
      !object(p.playerProfile) ||
      typeof p.playerProfile.name !== "string" ||
      p.playerProfile.name.length > 40 ||
      !["male", "female", "unspecified"].includes(p.playerProfile.gender) ||
      typeof p.tutorialDone !== "boolean" ||
      !object(p.library) ||
      !Number.isSafeInteger(p.library.attemptSequence) ||
      p.library.attemptSequence < 0 ||
      !LibraryEngine.presets.includes(p.library.requestedDailyTarget) ||
      ![
        "units",
        "dayExposure",
        "plans",
        "acquired",
        "phrases",
        "grammar",
        "events",
        "deliveries",
        "deficits",
      ].every((key) => object(p.library[key]))
    )
      return false;
    if (p.retiredRuleAssessmentJSON !== undefined && typeof p.retiredRuleAssessmentJSON !== "string") return false;
    if (!content.restoreGenerated(p)) return false;
    const questionValid = (q, day) => {
      if (!object(q) || typeof q.id!=="string" || !["word","sentence","construct","dialogue","choice","address"].includes(q.kind)) return false;
      for (const key of ["speaker","recipient","comment","section","audioId","promptPs","promptEnglish","sceneEnglish"])
        if (q[key]!==undefined && q[key]!==null && typeof q[key]!=="string") return false;
      if (q.grammarDays!==undefined && (!Array.isArray(q.grammarDays)||q.grammarDays.some(n=>!Number.isInteger(n)||n<1||n>14))) return false;
      const w=content.wordById[q.id];
      if (q.phrasePromptId !== undefined && (q.phrasePromptId !== w?.phrasePromptId || !content.LIBRARY_DATA.phrases.some(p=>p.id===q.phrasePromptId))) return false;
      if (!["choice","address"].includes(q.kind) && (!w || !LibraryEngine.cardAllowed(content.LIBRARY_DATA,q.id,day))) return false;
      if (["word","sentence","construct"].includes(q.kind) && !["ps-en","en-ps"].includes(q.direction)) return false;
      if (q.kind==="word" && (typeof q.unstudied!=="boolean" || (q.unstudied && q.direction!=="ps-en"))) return false;
      if (["choice","address"].includes(q.kind) && typeof q.correct!=="string") return false;
      if (q.kind==="choice" && (typeof q.prompt!=="string" || !Array.isArray(q.options) || q.options.some(v=>typeof v!=="string") || !q.options.includes(q.correct))) return false;
      if (q.kind==="address" && (!Array.isArray(q.addressOptions)||q.addressOptions.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>typeof v!=="string"))||!q.addressOptions.some(a=>a[1]===q.correct))) return false;
      if (q.duds!==undefined && (!Array.isArray(q.duds)||q.duds.some(v=>typeof v!=="string"))) return false;
      if (["construct","dialogue"].includes(q.kind)) {
        try { if (!validOrder(q.tileSequence,QuestionEngine.buildTiles(w,q,day).length)) return false; } catch { return false; }
      } else if (!Array.isArray(q.choiceOrder)||!q.choiceOrder.length||q.choiceOrder.some(v=>typeof v!=="string")||new Set(q.choiceOrder).size!==q.choiceOrder.length) return false;
      if (["choice","address"].includes(q.kind) && !q.choiceOrder.includes(q.correct)) return false;
      if (["sentence","construct","dialogue"].includes(q.kind) && w?.type==="sentence" && !q.generated) return false;
      for (const card of [q.generated,q.promptGenerated].filter(Boolean)) {
        if (!card.generated?.requiredGrammarIds?.every(g=>p.library.grammar[g]) ||
            !Object.values(card.generated.slots).every(r=>p.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId))) return false;
      }
      return true;
    };
    for (const plan of Object.values(p.library.plans))
      if (plan.challengeQuestions?.some(q=>!questionValid(q,plan.day))) return false;
    if (p.activeChallenge && (!Array.isArray(p.activeChallenge.questions)||p.activeChallenge.questions.some(q=>!questionValid(q,p.activeChallenge.loop)))) return false;
    for (const delivery of Object.values(p.library.deliveries)) {
      const card = content.wordById[delivery.id];
      if (
        !card ||
        ![
          "generated_sentence",
          "fixed_phrase",
          "lexical_or_interface",
        ].includes(delivery.kind)
      )
        return false;
      if (
        delivery.kind === "generated_sentence" &&
        card.generated?.origin !== "productive_engine"
      )
        return false;
      if (
        delivery.kind === "fixed_phrase" &&
        !content.LIBRARY_DATA.phrases.some((x) => x.id === card.id)
      )
        return false;
    }
    for (const [day, record] of Object.entries(p.challenges)) {
      if (
        !Number.isInteger(Number(day)) ||
        day < 1 ||
        day > 14 ||
        !object(record)
      )
        return false;
      const spec = progression.getChallengeSpec(Number(day));
      if (
        !Number.isInteger(record.best) ||
        record.best < 0 ||
        record.best > spec.questionCount ||
        !Number.isInteger(record.attempts) ||
        record.attempts < 1 ||
        record.passed !== record.best >= spec.passCount
      )
        return false;
    }
    for (const [id, record] of Object.entries(p.library.acquired)) {
      const entry = content.libraryEntries[id];
      if (
        !entry ||
        !object(record) ||
        !object(record.forms) ||
        !Array.isArray(record.encounteredFormIds) ||
        !Array.isArray(record.practisedFormIds) ||
        !Array.isArray(record.introducedFormIds)
      )
        return false;
      if (
        record.introducedFormIds.some(
          (id) => !record.encounteredFormIds.includes(id),
        )
      )
        return false;
      if (
        record.encounteredFormIds.some(
          (formId) => !entry.forms.some((f) => f.formId === formId),
        )
      )
        return false;
    }
    for (const [key, plan] of Object.entries(p.library.plans)) {
      if (
        !object(plan) ||
        plan.day !== Number(key) ||
        plan.day < 1 ||
        plan.day > 14 ||
        !object(plan.locationAssignments) ||
        !LibraryEngine.presets.includes(plan.requestedDailyTarget)
      )
        return false;
      if (
        plan.generatedPractice &&
        (!object(plan.generatedPractice) ||
          Object.entries(plan.generatedPractice).some(
            ([district, ids]) =>
              !content.zoneKeys.includes(district) ||
              !Array.isArray(ids) ||
              new Set(ids).size !== ids.length ||
              ids.some(
                (id) =>
                  !content.wordById[id]?.generated ||
                  !LibraryEngine.cardAllowed(
                    content.LIBRARY_DATA,
                    id,
                    plan.day,
                  ),
              ),
          ))
      )
        return false;
      const assignments = plan.locationAssignments;
      if (
        Object.keys(assignments).length !== content.zoneKeys.length ||
        !content.zoneKeys.every((district) =>
          Array.isArray(assignments[district]),
        )
      )
        return false;
      const ids = Object.values(assignments).flat();
      if (new Set(ids).size !== ids.length || (plan.day === 14 && ids.length))
        return false;
      for (const [district, assigned] of Object.entries(assignments)) {
        if (
          assigned.length > plan.requestedDailyTarget / 4 ||
          assigned.some((id) => {
            const e = content.libraryEntries[id];
            return (
              !e?.countsTowardDailyQuota ||
              !LibraryEngine.allowedOnDay(e, plan.day) ||
              !LibraryEngine.matchesPlace(e, district)
            );
          })
        )
          return false;
      }
    }
    if (p.activeChallenge) {
      const a = p.activeChallenge;
      if (
        !object(a) ||
        a.mode !== "challenge" ||
        a.finished ||
        !progression.allowed(p, a.loop) ||
        !Array.isArray(a.questions) ||
        a.questions.length !==
          progression.getChallengeSpec(a.loop).questionCount ||
        !Number.isInteger(a.index) ||
        a.index < 0 ||
        a.index >= a.questions.length ||
        typeof a.locked !== "boolean" ||
        a.answered !== a.index + Number(a.locked) ||
        !Number.isInteger(a.correctCount) ||
        a.correctCount < 0 ||
        a.correctCount > a.answered ||
        !Number.isInteger(a.attemptId) ||
        a.attemptId < 1 ||
        !Number.isFinite(a.earned) ||
        a.earned < 0 ||
        !Array.isArray(a.built) ||
        (a.recallDraft !== undefined && (typeof a.recallDraft !== "string" || a.recallDraft.length > 160))
      )
        return false;
      if (
        a.questions.some(
          (q) =>
            !object(q) ||
            ![
              "word",
              "sentence",
              "construct",
              "choice",
              "dialogue",
              "address",
            ].includes(q.kind) ||
            (!["choice", "dialogue", "address"].includes(q.kind) &&
              !content.wordById[q.id]) ||
            !LibraryEngine.cardAllowed(content.LIBRARY_DATA, q.id, a.loop),
        )
      )
        return false;
      for (const item of a.questions) {
        // Current attempts always freeze presentation at creation. Missing choices
        // or tile order are corrupt data, never a request to draw another exam.
        if (
          item.kind === "word" &&
          (typeof item.unstudied !== "boolean" ||
            (item.unstudied && item.direction !== "ps-en"))
        )
          return false;
        if (["construct", "dialogue"].includes(item.kind)) {
          let size;
          try {
            size = QuestionEngine.buildTiles(
              content.wordById[item.id],
              item,
              a.loop,
            ).length;
          } catch {
            return false;
          }
          if (!validOrder(item.tileSequence, size)) return false;
        } else if (
          !Array.isArray(item.choiceOrder) ||
          !item.choiceOrder.length ||
          item.choiceOrder.some((value) => typeof value !== "string") ||
          new Set(item.choiceOrder).size !== item.choiceOrder.length
        )
          return false;
        if (
          ["sentence", "construct", "dialogue"].includes(item.kind) &&
          content.wordById[item.id]?.type === "sentence" &&
          !item.generated
        )
          return false;
        if (
          item.promptPs &&
          (!item.promptGenerated || item.promptPs !== item.promptGenerated.ps)
        )
          return false;
        if (item.promptGenerated) {
          const prompt = content.wordById[item.promptGenerated.id];
          if (
            !prompt?.generated ||
            JSON.stringify(prompt) !== JSON.stringify(item.promptGenerated)
          )
            return false;
        }
        if (
          item.kind === "dialogue" &&
          (!item.generated || item.answerPs !== content.wordById[item.id]?.ps)
        )
          return false;
        if (item.generated) {
          if (
            !item.generated.generated.requiredGrammarIds.every(
              (g) => p.library.grammar[g],
            ) ||
            !Object.values(item.generated.generated.slots).every((r) =>
              p.library.acquired[r.lemmaId]?.introducedFormIds.includes(
                r.formId,
              ),
            )
          )
            return false;
          const card = content.wordById[item.id];
          if (
            !card?.generated ||
            item.generated.ps !== card.ps ||
            item.generated.en !== card.en ||
            item.generated.roman !== card.roman ||
            JSON.stringify(item.generated.generated) !==
              JSON.stringify(card.generated)
          )
            return false;
        }
      }
      const q = a.questions[a.index];
      if (["construct", "dialogue"].includes(q.kind)) {
        let tiles;
        try {
          tiles = QuestionEngine.buildTiles(content.wordById[q.id], q, a.loop);
        } catch {
          return false;
        }
        if (
          !validOrder(a.tileSequence, tiles.length) ||
          JSON.stringify(a.tileSequence) !== JSON.stringify(q.tileSequence) ||
          new Set(a.built).size !== a.built.length ||
          [...a.tileSequence, ...a.built].some(
            (i) => !Number.isInteger(i) || i < 0 || i >= tiles.length,
          )
        )
          return false;
      }
      if (a.locked && typeof a.submittedAnswer !== "string") return false;
    }
    return true;
  }

  return currentSave;
}
