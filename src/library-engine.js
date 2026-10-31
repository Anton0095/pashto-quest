/* Pure vocabulary state and planning. Content identities are editorial, never stems/glosses. */
const LibraryEngine = (() => {
  const presets = [0, 4, 8, 12, 16, 20, 24],
    places = ["residential", "business", "nature", "school"];
  const matchesPlace = (entry, place) =>
    !!entry?.suitableDistricts.includes(scene(place)?.districtId || place);
  const unique = (values) => [...new Set(values)];
  // Descriptions precede lexical actions. Fixed expressions have no component-verb mappings.
  const allowedOnDay = (entry, day) => !!entry && day >= entry.introduction.day;
  function formAllowed(entry, value, day) {
    return allowedOnDay(entry, day) && day >= value.firstAllowedDay;
  }
  function cardAllowed(data, id, day) {
    if ((data.cardDays?.[id] || 0) > day && data.cardTypes?.[id] === "sentence")
      return false;
    return (data.sourceMappings[id] || []).every((ref) => {
      const e = data.entries.find((e) => e.lemmaId === ref.lemmaId),
        f = e?.forms.find((f) => f.formId === ref.formId);
      return e && f && formAllowed(e, f, day);
    });
  }
  function state() {
    return {
      units: {},
      dayExposure: {},
      requestedDailyTarget: 24,
      seed: 2401024,
      plans: {},
      acquired: {},
      phrases: {},
      grammar: {},
      events: {},
      attemptSequence: 0,
      retiredAttemptSequence: 0,
      protectedAttemptIds: [],
      deliveries: {},
      deficits: {},
    };
  }
  function encounter(p, data, ref, context) {
    const s = p.library,
      e = data.entries.find((e) => e.lemmaId === ref.lemmaId);
    if (
      !e ||
      !allowedOnDay(e, context.day) ||
      !e.forms.some(
        (f) => f.formId === ref.formId && formAllowed(e, f, context.day),
      )
    )
      return null;
    const r = s.acquired[e.lemmaId] || {
      firstEncounteredDay: context.day,
      firstEncounteredSource: context.source,
      firstEncounteredLocation: context.location,
      encounteredFormIds: [],
      introducedFormIds: [],
      practisedFormIds: [],
      correctAttempts: 0,
      totalAttempts: 0,
      srsDueAt: 0,
      forms: {},
      encounteredSourceIds: [],
    };
    s.acquired[e.lemmaId] = r;
    if (!r.encounteredFormIds.includes(ref.formId)) delete r.masteredAt;
    r.encounteredFormIds = unique([...r.encounteredFormIds, ref.formId]);
    r.encounteredSourceIds = unique(
      [...r.encounteredSourceIds, context.contentId].filter(Boolean),
    );
    if (context.introduce) {
      r.introducedFormIds = unique([...r.introducedFormIds, ref.formId]);
      r.formallyIntroducedDay ??= context.day;
    }
    if (context.day > 0) {
      const ledger = (s.dayExposure[context.day] ||= {
        incidentalStoryLemmas: [],
        reviewedExistingLemmas: [],
      });
      const scheduled = Object.values(
        s.plans[context.day]?.locationAssignments || {},
      ).flat();
      if (
        r.firstEncounteredDay === context.day &&
        e.countsTowardDailyQuota &&
        !scheduled.includes(e.lemmaId) &&
        ["lesson", "challenge", "grammar-model"].includes(context.source)
      )
        ledger.incidentalStoryLemmas = unique([
          ...ledger.incidentalStoryLemmas,
          e.lemmaId,
        ]);
      if (r.firstEncounteredDay < context.day || context.source === "review")
        ledger.reviewedExistingLemmas = unique([
          ...ledger.reviewedExistingLemmas,
          e.lemmaId,
        ]);
    }
    r.forms[ref.formId] ||= {
      correctAttempts: 0,
      totalAttempts: 0,
      stage: 0,
      srsDueAt: 0,
    };
    r.srsDueAt = Math.min(...Object.values(r.forms).map((f) => f.srsDueAt));
    return r;
  }
  function expose(p, data, id, context) {
    if (data.phrases.some((f) => f.id === id)) {
      p.library.phrases[id] ||= {
        day: context.day,
        source: context.source,
        location: context.location,
      };
      // Encountered but unpractised expressions are due too; optional recognition
      // can be skipped without removing the expression from later review.
      p.library.units[id] ||= {
        stage: 0,
        srsDueAt: 0,
        totalAttempts: 0,
        correctAttempts: 0,
      };
      return;
    }
    for (const ref of data.sourceMappings[id] || [])
      encounter(p, data, ref, {
        ...context,
        contentId: id,
        introduce:
          lexicalCard(data, id) &&
          ["lesson", "review", "library", "tutorial"].includes(context.source),
      });
  }
  function schedule(record, correct, now) {
    const f = {
        totalAttempts: 0,
        correctAttempts: 0,
        stage: 0,
        srsDueAt: 0,
        ...record,
      },
      due = !f.srsDueAt || f.srsDueAt <= now;
    f.totalAttempts++;
    if (correct) {
      f.correctAttempts++;
      if (due) {
        f.stage = Math.min(5, f.stage + 1);
        f.srsDueAt = now + [0, 1, 3, 7, 14, 30][f.stage] * 86400000;
      }
    } else {
      f.stage = 0;
      f.srsDueAt = now;
    }
    return f;
  }
  function lexicalCard(data, id) {
    return (
      data.cardTypes?.[id] &&
      !["sentence", "greeting"].includes(data.cardTypes[id]) &&
      data.sourceMappings[id]?.length === 1
    );
  }
  function identity(data, id) {
    return lexicalCard(data, id)
      ? data.sourceMappings[id][0].formId
      : data.sentenceOrigins?.[id] || id;
  }
  function cardStat(p, data, id) {
    if (lexicalCard(data, id)) {
      const ref = data.sourceMappings[id][0];
      return p.library.acquired[ref.lemmaId]?.forms[ref.formId] || {};
    }
    return p.library.units[data.sentenceOrigins?.[id] || id] || {};
  }
  function eventAttempt(event) {
    const match = /^(?:(?:lesson|challenge|tutorial):([1-9]\d*):(?:0|[1-9]\d*)|(?:phrase|library-practice):([1-9]\d*))$/.exec(event);
    const id = match && Number(match[1] || match[2]);
    return Number.isSafeInteger(id) ? id : null;
  }
  // Monotonic attempt IDs make closed practice events rejectable without an
  // unbounded event set. Preserve both the current UI session (even finished)
  // and paused assessment, whose exact per-attempt deduplication still matters.
  // Unknown event namespaces are retained. Delivery counts/identity survive;
  // acquisition, SRS, rewards and frozen compiler proofs are never compacted.
  function compactHistory(p, sessions) {
    const l = p.library;
    const protectedIds = [...new Set(sessions.filter(Boolean).map(s => s.attemptId).filter(id => Number.isSafeInteger(id) && id > 0 && id <= l.attemptSequence))].sort((a,b) => a-b);
    if (l.retiredAttemptSequence === l.attemptSequence && JSON.stringify(l.protectedAttemptIds) === JSON.stringify(protectedIds)) return;
    l.retiredAttemptSequence = l.attemptSequence;
    l.protectedAttemptIds = protectedIds;
    for (const key of Object.keys(l.events)) {
      const id = eventAttempt(key);
      if (id !== null && id <= l.retiredAttemptSequence && !protectedIds.includes(id)) delete l.events[key];
    }
    for (const [key, row] of Object.entries(l.deliveries)) {
      const match = /^([1-9]\d*):/.exec(key), id = match && Number(match[1]);
      if (!Number.isSafeInteger(id) || id > l.retiredAttemptSequence || protectedIds.includes(id)) continue;
      let hash = 2166136261;
      const identity = JSON.stringify([row.id, row.mode, row.surface]);
      for (let i=0; i<identity.length; i++) hash = Math.imul(hash ^ identity.charCodeAt(i), 16777619);
      let summaryKey = `h:${hash >>> 0}`;
      const same = r => r.id === row.id && r.mode === row.mode && r.surface === row.surface;
      while (l.deliveries[summaryKey] && !same(l.deliveries[summaryKey])) summaryKey += ":";
      const prior = l.deliveries[summaryKey];
      if (prior) {
        prior.count = (prior.count || 1) + (row.count || 1);
        const lastDay = Math.max(prior.lastDay || prior.day, row.lastDay || row.day);
        prior.day = Math.min(prior.day, row.day);
        if (lastDay !== prior.day) prior.lastDay = lastDay;
      } else l.deliveries[summaryKey] = {...row};
      delete l.deliveries[key];
    }
  }
  function practise(p, data, id, correct, context) {
    if (!cardAllowed(data, id, context.day)) return false;
    const event = context.eventId;
    const attempt = eventAttempt(event);
    if (attempt !== null && attempt <= (p.library.retiredAttemptSequence || 0) && !(p.library.protectedAttemptIds || []).includes(attempt)) return false;
    if (p.library.events[event]) return false;
    p.library.events[event] = true;
    expose(p, data, id, context);
    const now = context.now ?? Date.now();
    if (data.cardTypes?.[id] && !lexicalCard(data, id))
      p.library.units[data.sentenceOrigins?.[id] || id] = schedule(
        p.library.units[data.sentenceOrigins?.[id] || id],
        correct,
        now,
      );
    for (const ref of data.sourceMappings[id] || []) {
      const r = p.library.acquired[ref.lemmaId];
      if (!r) continue;
      r.forms[ref.formId] = schedule(r.forms[ref.formId], correct, now);
      r.totalAttempts++;
      if (correct) r.correctAttempts++;
      r.practisedFormIds = unique([...r.practisedFormIds, ref.formId]);
      r.srsDueAt = Math.min(...Object.values(r.forms).map((f) => f.srsDueAt));
      if (
        Object.values(r.forms).every((f) => f.stage >= 3) &&
        r.correctAttempts >= 3
      )
        r.masteredAt ||= now;
      else delete r.masteredAt;
    }
    return true;
  }
  function status(r) {
    return !r
      ? "unencountered"
      : r.masteredAt
        ? "mastered"
        : r.practisedFormIds.length
          ? "practised"
          : r.introducedFormIds.length
            ? "introduced"
            : "encountered";
  }
  function summary(p, data) {
    const counts = { encountered: 0, practised: 0, mastered: 0 };
    for (const e of data.entries) {
      const r = p.library.acquired[e.lemmaId];
      if (!r || !e.countsTowardDailyQuota) continue;
      counts.encountered++;
      if (r.practisedFormIds.length) counts.practised++;
      if (r.masteredAt) counts.mastered++;
    }
    return counts;
  }
  function available(p, data, day) {
    const reserved = new Set(
      Object.values(p.library.plans)
        .filter((x) => x.day !== day)
        .flatMap((x) => Object.values(x.locationAssignments).flat()),
    );
    return data.entries
      .filter(
        (e) =>
          e.countsTowardDailyQuota &&
          allowedOnDay(e, day) &&
          !p.library.acquired[e.lemmaId]?.formallyIntroducedDay &&
          !reserved.has(e.lemmaId),
      )
      .sort(
        (a, b) =>
          Number(b.introduction.day === day) -
            Number(a.introduction.day === day) ||
          a.introduction.day - b.introduction.day ||
          a.introduction.teachingOrder - b.introduction.teachingOrder ||
          a.lemmaId.localeCompare(b.lemmaId),
      );
  }
  function allocation(p, data, day, target) {
    const assignments = Object.fromEntries(places.map((place) => [place, []]));
    if (day !== 14)
      for (const e of available(p, data, day)) {
        const place = e.introduction.district;
        if (assignments[place]?.length < target / places.length)
          assignments[place].push(e.lemmaId);
      }
    return {
      assignments,
      supported: places.every(
        (place) => assignments[place].length === target / places.length,
      ),
    };
  }
  function ensurePlan(p, data, day) {
    if (p.library.plans[day]) return p.library.plans[day];
    const target = day === 14 ? 0 : p.library.requestedDailyTarget,
      a = allocation(p, data, day, target);
    const plan = {
      day,
      requestedDailyTarget: target,
      effectiveDailyTarget: a.supported ? target : null,
      locationAssignments: a.assignments,
      seed: p.library.seed,
      shortfalls: Object.fromEntries(
        places.map((place) => [
          place,
          target / places.length - a.assignments[place].length,
        ]),
      ),
      contentGap: !a.supported,
      notice: a.supported
        ? "Draft content: native review pending."
        : "Content gap: insufficient distinct activated vocabulary for the requested quota. Counts show actual exposures; no repeat counts as new.",
    };
    p.library.plans[day] = plan;
    return plan;
  }
  function nextUnstartedDay(p, day) {
    let next = day;
    while (next <= 14 && p.library.plans[next]) next++;
    return next;
  }
  function setPace(p, target, day) {
    if (!presets.includes(target))
      return { ok: false, reason: "Choose a listed pace." };
    // Existing plans stay frozen; the setting applies to the first unstarted day.
    const next = nextUnstartedDay(p, day);
    if (next > 14)
      return {
        ok: false,
        reason:
          "All current day plans have begun. More curated content is needed for future days.",
      };
    p.library.requestedDailyTarget = target;
    return { ok: true, day: next };
  }
  const scenes = {
    residential: {
      sceneId: "residential",
      districtId: "residential",
      displayName: "Home",
      participants: ["Muhammad Jan"],
    },
    nature: {
      sceneId: "nature",
      districtId: "nature",
      displayName: "Lake",
      participants: ["Saleha"],
    },
    business: {
      sceneId: "business",
      districtId: "business",
      displayName: "Market",
      participants: ["Edris"],
    },
    school: {
      sceneId: "school",
      districtId: "school",
      displayName: "School",
      participants: ["Ms Hameed"],
    },
    library: {
      sceneId: "library",
      districtId: "school",
      displayName: "Library",
      participants: ["Muhammad Jan"],
    },
    hills: {
      sceneId: "hills",
      districtId: "nature",
      displayName: "Hills",
      participants: ["Saleha", "Mina"],
    },
    bakery: {
      sceneId: "bakery",
      districtId: "business",
      displayName: "Bakery",
      participants: [],
    },
    neighbourHome: {
      sceneId: "neighbourHome",
      districtId: "residential",
      displayName: "Neighbour home",
      participants: [],
    },
  };
  function scene(id) {
    return scenes[id] || null;
  }
  function dueForms(p, data) {
    return data.entries
      .flatMap((e) => {
        const r = p.library.acquired[e.lemmaId];
        return r
          ? e.forms
              .filter(
                (f) =>
                  (r.introducedFormIds.includes(f.formId) ||
                    r.forms[f.formId]?.totalAttempts > 0) &&
                  r.forms[f.formId]?.srsDueAt <= Date.now(),
              )
              .map((f) => ({
                entry: e,
                form: f,
                dueAt: r.forms[f.formId].srsDueAt,
              }))
          : [];
      })
      .sort(
        (a, b) =>
          a.dueAt - b.dueAt || a.form.formId.localeCompare(b.form.formId),
      );
  }
  function tallies(p, data, day) {
    const scheduledNewLemmas = unique(
      Object.values(p.library.plans[day]?.locationAssignments || {}).flat(),
    );
    const ledger = p.library.dayExposure[day] || {};
    return {
      scheduledNewLemmas,
      actuallyEncounteredScheduledLemmas: scheduledNewLemmas.filter(
        (id) => p.library.acquired[id],
      ),
      incidentalStoryLemmas: (ledger.incidentalStoryLemmas || []).filter((id) =>
        data.entries.some((e) => e.lemmaId === id && e.countsTowardDailyQuota),
      ),
      reviewedExistingLemmas: ledger.reviewedExistingLemmas || [],
      masteredLemmas: data.entries
        .filter(
          (e) =>
            e.countsTowardDailyQuota &&
            p.library.acquired[e.lemmaId]?.masteredAt,
        )
        .map((e) => e.lemmaId),
    };
  }
  function unlock(p, day, source) {
    if (day >= 1 && day <= 14)
      p.library.grammar["grammar-day-" + day] ||= { day, source };
  }
  return {
    formAllowed,
    schedule,
    allowedOnDay,
    cardAllowed,
    identity,
    cardStat,
    scene,
    dueForms,
    tallies,
    presets,
    places,
    matchesPlace,
    state,
    encounter,
    expose,
    practise,
    compactHistory,
    status,
    summary,
    available,
    allocation,
    ensurePlan,
    setPace,
    nextUnstartedDay,
    unlock,
  };
})();
