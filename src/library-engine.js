/* Pure vocabulary state and planning. Content identities are editorial, never stems/glosses. */
const LibraryEngine = (() => {
  const presets = [0, 4, 8, 12, 16, 20, 24],
    places = ["residential", "business", "nature", "school"];
  const matchesPlace = (entry, place) =>
    !!entry?.suitableDistricts.includes(scene(place)?.districtId || place);
  const unique = (values) => [...new Set(values)];
  // Descriptions precede lexical actions. Fixed expressions have no component-verb mappings.
  const allowedOnDay = (entry, day) => day !== 1 || entry?.partOfSpeech !== "verb";
  function cardAllowed(data, id, day) {
    return (data.sourceMappings[id] || []).every((ref) =>
      allowedOnDay(data.entries.find((e) => e.lemmaId === ref.lemmaId), day),
    );
  }
  function state() {
    return {
      units: {},
      dayExposure: {},
      requestedDailyTarget: 20,
      seed: 2401024,
      plans: {},
      acquired: {},
      phrases: {},
      grammar: {},
      events: {},
      attemptSequence: 0,
    };
  }
  function encounter(p, data, ref, context) {
    const s = p.library || (p.library = state()),
      e = data.entries.find((e) => e.lemmaId === ref.lemmaId);
    if (!e || !allowedOnDay(e, context.day) || !e.forms.some((f) => f.formId === ref.formId)) return null;
    const r = s.acquired[e.lemmaId] || {
      firstEncounteredDay: context.day,
      firstEncounteredSource: context.source,
      firstEncounteredLocation: context.location,
      encounteredFormIds: [],
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
      [...(r.encounteredSourceIds || []), context.contentId].filter(Boolean),
    );
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
        ["lesson", "challenge"].includes(context.source)
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
        day: context.day, source: context.source, location: context.location,
      };
      // Encountered but unpractised expressions are due too; optional recognition
      // can be skipped without removing the expression from later review.
      p.library.units[id] ||= {stage: 0, srsDueAt: 0, totalAttempts: 0, correctAttempts: 0};
      return;
    }
    for (const ref of data.sourceMappings[id] || [])
      encounter(p, data, ref, { ...context, contentId: id });
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
    return lexicalCard(data, id) ? data.sourceMappings[id][0].formId : id;
  }
  function cardStat(p, data, id) {
    if (lexicalCard(data, id)) {
      const ref = data.sourceMappings[id][0];
      return p.library.acquired[ref.lemmaId]?.forms[ref.formId] || {};
    }
    return p.library.units[id] || {};
  }
  function practise(p, data, id, correct, context) {
    if (!cardAllowed(data, id, context.day)) return false;
    const event = context.eventId;
    if (p.library.events[event]) return false;
    p.library.events[event] = true;
    expose(p, data, id, context);
    const now = context.now ?? Date.now();
    if (data.cardTypes?.[id] && !lexicalCard(data, id))
      p.library.units[id] = schedule(p.library.units[id], correct, now);
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
          : "introduced";
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
  function hash(text) {
    let h = 2166136261;
    for (const ch of text) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function available(p, data, day) {
    const reserved = new Set(
      Object.values(p.library.plans)
        .filter((x) => x.day !== day)
        .flatMap((x) => Object.values(x.locationAssignments).flat().filter((id) => {
          const e = data.entries.find((e) => e.lemmaId === id);
          return x.day !== 14 && e?.countsTowardDailyQuota && allowedOnDay(e, x.day);
        })),
    );
    return data.entries.filter(
      (e) =>
        e.countsTowardDailyQuota &&
        allowedOnDay(e, day) &&
        !p.library.acquired[e.lemmaId] &&
        !reserved.has(e.lemmaId),
    );
  }
  function allocation(p, data, day, target) {
    const pool = available(p, data, day),
      byId = Object.fromEntries(pool.map((e) => [e.lemmaId, e])),
      quota = target / 4;
    const assignments = Object.fromEntries(places.map((place) => [place, []]));
    function assign(id, visited = new Set()) {
      for (const place of places.filter((place) =>
        matchesPlace(byId[id], place),
      )) {
        if (visited.has(place)) continue;
        visited.add(place);
        if (assignments[place].length < quota) {
          assignments[place].push(id);
          return true;
        }
        for (let i = 0; i < assignments[place].length; i++) {
          const prior = assignments[place][i];
          if (assign(prior, visited)) {
            assignments[place][i] = id;
            return true;
          }
        }
      }
      return false;
    }
    const optional = pool.sort(
      (a, b) =>
        hash(p.library.seed + ":" + day + ":" + a.lemmaId) -
          hash(p.library.seed + ":" + day + ":" + b.lemmaId) ||
        a.lemmaId.localeCompare(b.lemmaId),
    );
    for (const e of optional) {
      if (Object.values(assignments).flat().length >= target) break;
      assign(e.lemmaId);
    }
    return {
      assignments,
      supported: places.every((place) => assignments[place].length === quota),
    };
  }
  function supported(p, data, day) {
    if (day < 1 || day > 14) return [];
    if (day === 14) return [...presets];
    return presets.filter(
      (target) => allocation(p, data, day, target).supported,
    );
  }
  function ensurePlan(p, data, day) {
    if (p.library.plans[day]) {
      const plan = p.library.plans[day];
      // A current-schema save may contain a reclassified universal or Day 1 action.
      // Retain identities/history and safe frozen assignments; remove unsafe teaching only.
      {
        let removed = false;
        for (const place of places) {
          const ids = plan.locationAssignments[place] || [];
          plan.locationAssignments[place] = ids.filter((id) => {
            const entry = data.entries.find((e) => e.lemmaId === id);
            const keep = day !== 14 && entry?.countsTowardDailyQuota && allowedOnDay(entry, day);
            if (!keep) removed = true;
            return keep;
          });
        }
        if (removed) {
          plan.contentGap = true;
          plan.effectiveDailyTarget = null;
          plan.notice = "Curriculum update: earlier universal/Day 1 action assignments are retained in your learning history but excluded from district teaching quotas. Safe frozen assignments remain; choose a new pace on an unstarted day.";
        }
      }
      return plan;
    }
    const target = day === 14 ? 0 : p.library.requestedDailyTarget,
      a = allocation(p, data, day, target);
    const plan = {
      day,
      requestedDailyTarget: target,
      effectiveDailyTarget: a.supported ? target : null,
      locationAssignments: a.assignments,
      planVersion: 2,
      sourceContentVersion: data.sourceContentVersion,
      seed: p.library.seed,
      contentGap: !a.supported,
      notice: a.supported
        ? "Draft content: native review pending."
        : "Content gap: insufficient distinct activated vocabulary for the requested quota. Counts show actual exposures; no repeat counts as new.",
    };
    p.library.plans[day] = plan;
    return plan;
  }
  function setPace(p, data, target, day) {
    if (!presets.includes(target))
      return { ok: false, reason: "Choose a listed pace." };
    // Never alter an existing plan. Validate the next unstarted day against the remaining pool.
    let next = day;
    while (p.library.plans[next] && next <= 14) next++;
    if (next > 14)
      return {
        ok: false,
        reason:
          "All current day plans have begun. More curated content is needed for future days.",
      };
    if (!supported(p, data, next).includes(target))
      return {
        ok: false,
        reason:
          "Content gap: too few distinct activated lemmas remain. Select an available pace; no words will be invented.",
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
  function lexicalSelection(p, data, day, count) {
    const scheduled = new Set(
      Object.values(p.library.plans[day]?.locationAssignments || {}).flat().filter((id) =>
        data.entries.some((e) => e.lemmaId === id && e.countsTowardDailyQuota && allowedOnDay(e, day))),
    );
    const acquired = Object.keys(p.library.acquired).filter((id) =>
      data.entries.some((e) => e.lemmaId === id && e.countsTowardDailyQuota && allowedOnDay(e, day)),
    );
    const due = acquired
      .filter((id) => p.library.acquired[id].srsDueAt <= Date.now())
      .sort(
        (a, b) =>
          p.library.acquired[a].srsDueAt - p.library.acquired[b].srsDueAt ||
          a.localeCompare(b),
      );
    const encountered = acquired.filter((id) => !due.includes(id)).sort();
    // Due recall and genuinely encountered words precedes unstudied scheduled scaffolds.
    const lists = [due, encountered, [...scheduled]],
      seen = new Set(),
      out = [];
    for (const [i, list] of lists.entries())
      for (const id of list) {
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          lemmaId: id,
          origin: ["due-review", "encountered", "scheduled-scaffold"][i],
        });
        if (out.length === count) return out;
      }
    return out;
  }
  function dueForms(p, data) {
    return data.entries
      .flatMap((e) => {
        const r = p.library.acquired[e.lemmaId];
        return r
          ? e.forms
              .filter(
                (f) =>
                  r.encounteredFormIds.includes(f.formId) &&
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
        data.entries.some((e) => e.lemmaId === id && e.countsTowardDailyQuota)),
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
    schedule,
    allowedOnDay,
    cardAllowed,
    identity,
    cardStat,
    scene,
    lexicalSelection,
    dueForms,
    tallies,
    presets,
    places,
    matchesPlace,
    state,
    encounter,
    expose,
    practise,
    status,
    summary,
    available,
    allocation,
    supported,
    ensurePlan,
    setPace,
    unlock,
  };
})();
