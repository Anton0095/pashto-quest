/* Typed surface-form composition. See docs/grammar/PASHTO_GENERATION_RULES.md.
 * No stems, suffixes, transliteration or English supplied by a binding.
 * Grammar evidence never confers native approval. */
const SentenceEngine = (() => {
  const unique = (xs) => [...new Set(xs)];
  const index = (data) => {
    const sources = new Map((data.generationAttestations || []).map((a) => [a.sourceId, a]));
    return new Map(data.entries.flatMap((entry) => entry.forms.map((value) =>
      [value.formId, { entry, value, attestation: sources.get(value.featureEvidence?.sourceId) }])));
  };
  const feature = (item, key) => key === "person" && item?.entry.partOfSpeech === "noun"
    ? item.value.composition.subjectPerson
    : item?.value.morphology[key] ?? (key === "person" ? item?.value.composition.subjectPerson : null);
  const intersects = (a, b) => Array.isArray(a) && Array.isArray(b) && a.some((x) => b.includes(x));
  function licensed(item, spec) {
    if (!item) return false;
    const { entry: e, value: f, attestation } = item, c = f.composition, evidence = f.featureEvidence;
    return !!(c?.enabled && c.roles?.includes(spec.role) &&
      (!spec.partOfSpeech || e.partOfSpeech === spec.partOfSpeech) &&
      (!spec.grammaticalFunction || c.functions?.includes(spec.grammaticalFunction)) &&
      f.pashto && !/[a-zA-Z]/.test(f.pashto) && f.romanisation &&
      evidence?.sourceId && attestation?.pashto.includes(f.pashto) && attestation?.romanisation.includes(f.romanisation) && evidence.pashtoSpan === f.pashto &&
      evidence.romanisationSpan === f.romanisation && evidence.features &&
      Object.entries(evidence.features).every(([k, v]) =>
        JSON.stringify(f.morphology[k]) === JSON.stringify(v)) &&
      Object.entries(spec.features).every(([k, v]) => feature(item, k) === v) &&
      spec.requiredFeatures.every((k) => feature(item, k) != null));
  }
  function compatible(frame, slots) {
    const v = slots.verb?.entry.generationSemantics;
    if (v && ((frame.valency && frame.valency !== v.valency) ||
      (frame.predicateType && frame.predicateType !== v.predicateType) ||
      (frame.verbSenses && !frame.verbSenses.includes(v.base)))) return false;
    for (const rule of frame.constraints) {
      const a = slots[rule.left], b = slots[rule.right];
      if (!a || (rule.right && !b)) continue;
      const sem = a.entry.generationSemantics, c = b?.value.composition;
      if (rule.type === "agree" && rule.features.some((k) =>
        feature(a, k) == null || feature(a, k) !== feature(b, k))) return false;
      if (rule.type === "adjective" && !intersects(sem?.classes, c.appliesTo)) return false;
      if (rule.type === "object" && !intersects(sem?.classes, b.entry.generationSemantics?.objectClasses)) return false;
      if (rule.type === "location" && (a.entry.lemmaId === b.entry.lemmaId ||
        !intersects(sem?.classes, c.appliesTo) || c.chunkSchema !== "attested_indivisible")) return false;
      if (rule.type === "ownable" && !sem?.classes.includes("ownable")) return false;
      if (rule.type === "countable" && sem?.countability !== "count") return false;
      if (rule.type === "numeral" && (sem?.countability !== "count" ||
        !c.countGenders?.includes(feature(a, "gender")) ||
        feature(a, "number") !== (c.value === 1 ? "singular" : "plural"))) return false;
      if (rule.type === "adverb") {
        const cls = a.value.composition.adverbClass;
        if (!b.entry.generationSemantics?.adverbs?.includes(cls) ||
          (frame.adverbClasses && !frame.adverbClasses.includes(cls)) ||
          (cls === "together" && slots.subject && feature(slots.subject, "number") !== "plural")) return false;
      }
    }
    return true;
  }
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const mass = (s) => ["mass", "proper"].includes(s.countability);
  const plural = (item) => feature(item, "number") === "plural" && !mass(item.entry.generationSemantics);
  function english(frame, s) {
    const n = s.noun, sem = n?.entry.generationSemantics,
      bare = n && (plural(n) ? sem.plural : sem.singular),
      adjective = s.adjective?.value.composition.english,
      possessive = s.possessive?.value.composition.english,
      numeral = s.numeral && ({1:"one",2:"two",3:"three"})[s.numeral.value.composition.value],
      near = s.demonstrative?.value.composition.deixis === "proximal",
      demonstrative = n && (near ? plural(n) ? "these" : "this" : plural(n) ? "those" : "that"),
      be = n && (plural(n) ? "are" : "is"),
      article = (text) => /^[aeiou]/i.test(text) ? "an" : "a",
      head = [numeral, adjective, bare].filter((x) => x != null && x !== "").join(" "),
      np = possessive ? `${possessive} ${head}` : s.demonstrative ? `${demonstrative} ${head}` : `the ${head}`,
      subjectNP = possessive ? `${possessive} ${bare}` : s.demonstrative ? `${demonstrative} ${bare}` : `the ${bare}`,
      adv = s.adverb?.value.composition.english,
      cls = s.adverb?.value.composition.adverbClass,
      location = s.location?.value.composition.english;
    if (frame.englishRealiser === "description") return `${cap(subjectNP)} ${be} ${adjective}.`;
    if (["attributive", "identification"].includes(frame.englishRealiser)) {
      const predicate = possessive ? `${possessive} ${head}` : numeral || mass(sem) || plural(n) ? head : `${article(head)} ${head}`;
      return `${cap(demonstrative)} ${be} ${predicate}.`;
    }
    if (frame.englishRealiser === "spatial") return `${cap(np)} ${be} ${location}.`;
    if (frame.englishRealiser === "where") return `Where ${be} ${np}?`;
    if (frame.englishRealiser === "which") return `Which ${bare} ${be} ${adjective}?`;
    if (frame.englishRealiser === "whose") return `Whose ${bare} ${be} ${demonstrative}?`;
    if (frame.englishRealiser === "how_many") return `How many ${bare} are ${location}?`;
    const subject = s.subject.value.composition.english,
      person = feature(s.subject, "person"), number = feature(s.subject, "number"),
      v = s.verb.entry.generationSemantics,
      finite = person === 3 && number === "singular" ? v.third : v.base,
      polite = s.subject.value.composition.register === "polite_or_plural" ? " (polite/plural)" : "";
    if (frame.englishRealiser === "what")
      return `What ${person === 3 && number === "singular" ? "does" : "do"} ${subject === "I" || s.subject.entry.partOfSpeech === "noun" ? subject : subject.toLowerCase()} ${v.base}?${polite}`;
    const object = !n ? "" : possessive || s.demonstrative || numeral
      ? possessive ? `${possessive} ${head}` : s.demonstrative ? `${demonstrative} ${head}` : head
      : mass(sem) || plural(n) ? head : `${sem.objectArticle === "the" ? "the" : article(head)} ${head}`;
    const core = [subject, cls === "frequency" ? adv : null, finite, object,
      adv && cls !== "frequency" && cls !== "time" ? adv : null].filter(Boolean).join(" ");
    return (cls === "time" ? `${cap(adv)} ${subject === "I" || s.subject.entry.partOfSpeech === "noun" ? core : core[0].toLowerCase()+core.slice(1)}` : cap(core)) +
      (frame.answerType === "person" ? "?" : ".") + polite;
  }
  function resolve(data, frame, binding, lookup = index(data)) {
    if (!frame || frame.scope !== "feature_vetted_draft" || !binding?.slots ||
      Object.keys(binding.slots).length !== Object.keys(frame.slots).length) return null;
    const slots = {};
    for (const [name, spec] of Object.entries(frame.slots)) {
      const ref = binding.slots[name], item = lookup.get(ref?.formId);
      if (!item || item.entry.lemmaId !== ref.lemmaId || !licensed(item, spec)) return null;
      slots[name] = item;
    }
    if (!compatible(frame, slots)) return null;
    const n = slots[frame.copulaFrom];
    const copula = n ? frame.terminals.find((c) => c.number === feature(n, "number") &&
      (c.number === "plural" || c.gender === feature(n, "gender"))) : null;
    if (n && !copula) return null;
    return { slots, copula };
  }
  function compose(data, frame, binding, lookup, attestations) {
    const resolved = resolve(data, frame, binding, lookup);
    if (!resolved) return null;
    const { slots, copula } = resolved;
    const render = (key) => frame.pashtoPattern.replace(/\{([a-z]+)\}/g, (_, name) =>
      name === "copula" ? copula[key] : slots[name].value[key]);
    const ps = render("pashto"), roman = render("romanisation"), en = english(frame, slots);
    if (!en || /undefined|null/.test(en)) return null;
    const source = (attestations?.get(ps) || data.generationAttestations?.filter((a) => a.pashto === ps) || [])[0];
    const refs = Object.fromEntries(Object.entries(slots).map(([k, { entry, value }]) =>
      [k, { lemmaId: entry.lemmaId, formId: value.formId }]));
    const bindingId = Object.values(refs).map((r) => r.formId).join("|");
    const requiredGrammarIds = unique([...frame.requiredGrammarIds,
      ...Object.values(slots).flatMap(({ entry, value }) => [...entry.introduction.requiredGrammarIds, ...value.prerequisiteGrammarIds]),
      ...(copula ? [copula.grammarId] : [])]);
    const addressee = slots.subject?.value.composition.register === "informal" ? "Saleha" : "Ms Hameed";
    return {
      id: `generated:${frame.id}:${bindingId}`, type: "sentence", ps, en, roman,
      loop: Math.max(frame.earliestDay, ...Object.values(slots).map(({ entry, value }) => Math.max(entry.introduction.day, value.firstAllowedDay))),
      place: (slots.noun || slots.verb || slots.subject).entry.primaryDistrict,
      speaker: "Player", recipient: addressee,
      note: "Generated practice from evidenced forms and typed grammar; provisional pronunciation aid, native review pending.", dialect: "",
      generated: { frameId: frame.id, family: frame.family, bindingId, slots: refs, requiredGrammarIds,
        terminals: copula ? [copula] : [], sourceId: source?.sourceId || null,
        outputKind: source ? "authored_attestation" : "composed_draft",
        formEvidenceSourceIds: unique(Object.values(slots).map((s) => s.value.featureEvidence.sourceId)),
        answerType: frame.answerType || null,
        semanticArguments: Object.fromEntries(Object.entries(slots).map(([k,s]) => [k, s.value.composition.english || s.entry.generationSemantics?.base || s.entry.generationSemantics?.singular || s.value.pashto])),
        speaker: "Player", addressee, register: slots.subject?.value.composition.register || null,
        reviewStatus: "needs_native_review", userVerified: false, pronunciationStatus: "provisional_authored_span" },
    };
  }
  function formAvailable(p, item, day) {
    if (!item) return false;
    const { entry: e, value: f } = item;
    return e.introduction.day <= day && f.firstAllowedDay <= day &&
      [...e.introduction.requiredGrammarIds, ...f.prerequisiteGrammarIds].every((id) => p.library.grammar[id]) &&
      !!p.library.acquired[e.lemmaId]?.introducedFormIds.includes(f.formId);
  }
  function catalog(data, frames, p = null, day = 14) {
    const lookup = index(data), out = [], attestations = new Map();
    for (const a of data.generationAttestations || [])
      attestations.set(a.pashto, [...(attestations.get(a.pashto) || []), a]);
    const items = [...lookup.values()].filter((item) => !p || formAvailable(p, item, day));
    for (const frame of frames.frames) {
      if (frame.earliestDay > day || (p && !frame.requiredGrammarIds.every((id) => p.library.grammar[id]))) continue;
      const candidates = Object.entries(frame.slots).map(([name, spec]) => [name, items.filter((item) => licensed(item, spec))]);
      const slots = {};
      function visit(i) {
        if (i === candidates.length) {
          const binding = { slots: Object.fromEntries(Object.entries(slots).map(([k, s]) =>
            [k, { lemmaId: s.entry.lemmaId, formId: s.value.formId }])) };
          const card = compose(data, frame, binding, lookup, attestations);
          if (card && card.loop <= day && (!p || card.generated.requiredGrammarIds.every((id) => p.library.grammar[id]))) out.push(card);
          return;
        }
        const [name, values] = candidates[i];
        for (const item of values) {
          slots[name] = item;
          if (compatible(frame, slots)) visit(i + 1);
        }
        delete slots[name];
      }
      visit(0);
    }
    return out;
  }
  const eligible = (p, data, frames, day) => catalog(data, frames, p, day);
  function select(p, data, frames, day, count, seed, recent = []) {
    const lookup = index(data), frameById = new Map(frames.frames.map((f) => [f.id, f]));
    const pool = data.generatedCatalog
      ? data.generatedCatalog.filter((card) => card.loop <= day &&
          card.generated.requiredGrammarIds.every((id) => p.library.grammar[id]) &&
          Object.values(card.generated.slots).every((r) => formAvailable(p, lookup.get(r.formId), day)))
      : eligible(p, data, frames, day);
    // Draw licensed cards directly, cycling families before repeating one.
    // Hashing/sorting every long binding ID made seeded practice unnecessarily slow.
    let randomState = (seed >>> 0) || 0x9e3779b9;
    const draw = (length) => {
      randomState ^= randomState << 13;
      randomState ^= randomState >>> 17;
      randomState ^= randomState << 5;
      return (randomState >>> 0) % length;
    };
    const recentIds = new Set(recent), groups = new Map();
    for (const c of pool) {
      const key = c.generated.family;
      if (!groups.has(key)) groups.set(key, { fresh: [], recent: [] });
      groups.get(key)[recentIds.has(c.id) ? "recent" : "fresh"].push(c);
    }
    const families = [...groups.keys()].sort();
    for (let i = families.length - 1; i > 0; i--) {
      const j = draw(i + 1);
      [families[i], families[j]] = [families[j], families[i]];
    }
    const result = [], seenText = new Set();
    while (result.length < count && families.some((k) => {
      const group = groups.get(k); return group.fresh.length || group.recent.length;
    })) for (const k of families) {
      const group = groups.get(k), values = group.fresh.length ? group.fresh : group.recent;
      if (!values.length) continue;
      const c = values.splice(draw(values.length), 1)[0];
      if (!seenText.has(c.ps) && resolve(data, frameById.get(c.generated.frameId), c.generated, lookup)) {
        result.push(c); seenText.add(c.ps);
      }
      if (result.length === count) break;
    }
    return result;
  }
  return { compose, eligible, select, catalog, licensed, compatible };
})();
