/* Typed surface-form composition. See docs/grammar/PASHTO_GENERATION_RULES.md.
 * No stems, suffixes, transliteration or English supplied by a binding.
 * Grammar evidence never confers native approval. */
const SentenceEngine = (() => {
  const unique = (xs) => [...new Set(xs)];
  const lexicalIndexes = new WeakMap();
  const index = (data) => {
    // Only immutable lexical data is cached. Mutable editorial/test catalogs
    // rebuild normally, so evidence edits can never leave a stale index.
    const cached = lexicalIndexes.get(data.entries);
    if (cached && cached.evidence === data.generationEvidence &&
        cached.attestations === data.generationAttestations) return cached.lookup;
    const immutable = Object.isFrozen(data.entries) &&
      data.entries.every((e) => Object.isFrozen(e) && Object.isFrozen(e.forms) &&
        e.forms.every((f) => Object.isFrozen(f) && Object.isFrozen(f.featureEvidence))) &&
      (!data.generationEvidence || Object.isFrozen(data.generationEvidence)) &&
      (!data.generationAttestations || (Object.isFrozen(data.generationAttestations) &&
        data.generationAttestations.every(Object.isFrozen)));
    const sources = new Map(
      (data.generationAttestations || []).map((a) => [a.sourceId, a]),
    );
    const lookup = new Map(
      data.entries.flatMap((entry) =>
        entry.forms.map((value) => [
          value.formId,
          {
            entry,
            value,
            attestation:
              data.generationEvidence?.[value.formId] ||
              sources.get(value.featureEvidence?.sourceId),
          },
        ]),
      ),
    );
    if (immutable) lexicalIndexes.set(data.entries, {
      evidence: data.generationEvidence, attestations: data.generationAttestations, lookup,
    });
    return lookup;
  };
  const feature = (item, key) =>
    key === "person" && item?.entry.partOfSpeech === "noun"
      ? item.value.composition.subjectPerson
      : (item?.value.morphology[key] ??
        (key === "person" ? item?.value.composition.subjectPerson : null));
  const intersects = (a, b) =>
    Array.isArray(a) && Array.isArray(b) && a.some((x) => b.includes(x));
  function licensed(item, spec) {
    if (!item) return false;
    const { entry: e, value: f, attestation } = item,
      c = f.composition,
      evidence = f.featureEvidence;
    return !!(
      c?.enabled &&
      c.roles?.includes(spec.role) &&
      (!spec.partOfSpeech || e.partOfSpeech === spec.partOfSpeech) &&
      (!spec.grammaticalFunction ||
        c.functions?.includes(spec.grammaticalFunction)) &&
      f.pashto &&
      !/[a-zA-Z]/.test(f.pashto) &&
      f.romanisation &&
      evidence?.sourceId &&
      attestation?.pashto.includes(f.pashto) &&
      attestation?.romanisation.includes(f.romanisation) &&
      evidence.pashtoSpan === f.pashto &&
      evidence.romanisationSpan === f.romanisation &&
      evidence.features &&
      Object.entries(evidence.features).every(
        ([k, v]) => JSON.stringify(f.morphology[k]) === JSON.stringify(v),
      ) &&
      Object.entries(spec.features).every(([k, v]) => feature(item, k) === v) &&
      spec.requiredFeatures.every((k) => feature(item, k) != null)
    );
  }
  function compatible(frame, slots) {
    const v = slots.verb?.entry.generationSemantics;
    if (
      v &&
      ((frame.valency && frame.valency !== v.valency) ||
        (frame.predicateType && frame.predicateType !== v.predicateType) ||
        (frame.verbSenses && !frame.verbSenses.includes(v.base)))
    )
      return false;
    for (const rule of frame.constraints) {
      const a = slots[rule.left],
        b = slots[rule.right];
      if (!a || (rule.right && !b)) continue;
      const sem = a.entry.generationSemantics,
        c = b?.value.composition;
      if (
        rule.type === "agree" &&
        rule.features.some(
          (k) => feature(a, k) == null || feature(a, k) !== feature(b, k),
        )
      )
        return false;
      if (rule.type === "adjective" && !intersects(sem?.classes, c.appliesTo))
        return false;
      if (
        rule.type === "object" &&
        !intersects(sem?.classes, b.entry.generationSemantics?.objectClasses)
      )
        return false;
      if (
        rule.type === "location" &&
        (a.entry.lemmaId === b.entry.lemmaId ||
          !intersects(sem?.classes, c.appliesTo) ||
          c.chunkSchema !== "attested_indivisible")
      )
        return false;
      if (rule.type === "ownable" && !sem?.classes.includes("ownable"))
        return false;
      if (rule.type === "countable" && sem?.countability !== "count")
        return false;
      if (
        rule.type === "numeral" &&
        (sem?.countability !== "count" ||
          !c.countGenders?.includes(feature(a, "gender")) ||
          feature(a, "number") !== (c.value === 1 ? "singular" : "plural"))
      )
        return false;
      if (rule.type === "adverb") {
        const cls = a.value.composition.adverbClass;
        if (
          !b.entry.generationSemantics?.adverbs?.includes(cls) ||
          (frame.adverbClasses && !frame.adverbClasses.includes(cls)) ||
          (cls === "together" &&
            slots.subject &&
            feature(slots.subject, "number") !== "plural")
        )
          return false;
      }
    }
    return true;
  }
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const mass = (s) => ["mass", "proper"].includes(s.countability);
  const plural = (item) =>
    feature(item, "number") === "plural" &&
    !mass(item.entry.generationSemantics);
  function english(frame, s) {
    const n = s.noun,
      sem = n?.entry.generationSemantics,
      bare = n && (plural(n) ? sem.plural : sem.singular),
      adjective = s.adjective?.value.composition.english,
      possessive = s.possessive?.value.composition.english,
      numeral =
        s.numeral &&
        { 1: "one", 2: "two", 3: "three" }[s.numeral.value.composition.value],
      near = s.demonstrative?.value.composition.deixis === "proximal",
      demonstrative =
        n &&
        (near ? (plural(n) ? "these" : "this") : plural(n) ? "those" : "that"),
      be = n && (plural(n) ? "are" : "is"),
      article = (text) => (/^[aeiou]/i.test(text) ? "an" : "a"),
      head = [numeral, adjective, bare]
        .filter((x) => x != null && x !== "")
        .join(" "),
      np = possessive
        ? `${possessive} ${head}`
        : s.demonstrative
          ? `${demonstrative} ${head}`
          : `the ${head}`,
      subjectNP = possessive
        ? `${possessive} ${bare}`
        : s.demonstrative
          ? `${demonstrative} ${bare}`
          : `the ${bare}`,
      adv = s.adverb?.value.composition.english,
      cls = s.adverb?.value.composition.adverbClass,
      location = s.location?.value.composition.english;
    if (frame.englishRealiser === "description")
      return `${cap(subjectNP)} ${be} ${adjective}.`;
    if (["attributive", "identification"].includes(frame.englishRealiser)) {
      const predicate = possessive
        ? `${possessive} ${head}`
        : numeral || mass(sem) || plural(n)
          ? head
          : `${article(head)} ${head}`;
      return `${cap(demonstrative)} ${be} ${predicate}.`;
    }
    if (frame.englishRealiser === "spatial")
      return `${cap(np)} ${be} ${location}.`;
    if (frame.englishRealiser === "where") return `Where ${be} ${np}?`;
    if (frame.englishRealiser === "which")
      return `Which ${bare} ${be} ${adjective}?`;
    if (frame.englishRealiser === "whose")
      return `Whose ${bare} ${be} ${demonstrative}?`;
    if (frame.englishRealiser === "how_many")
      return `How many ${bare} are ${location}?`;
    const subject = s.subject.value.composition.english,
      person = feature(s.subject, "person"),
      number = feature(s.subject, "number"),
      v = s.verb.entry.generationSemantics,
      finite = person === 3 && number === "singular" ? v.third : v.base,
      polite =
        s.subject.value.composition.register === "polite_or_plural"
          ? " (polite/plural)"
          : "";
    if (frame.englishRealiser === "what")
      return `What ${person === 3 && number === "singular" ? "does" : "do"} ${subject === "I" || s.subject.entry.partOfSpeech === "noun" ? subject : subject.toLowerCase()} ${v.base}?${polite}`;
    const object = !n
      ? ""
      : possessive || s.demonstrative || numeral
        ? possessive
          ? `${possessive} ${head}`
          : s.demonstrative
            ? `${demonstrative} ${head}`
            : head
        : mass(sem) || plural(n)
          ? head
          : `${sem.objectArticle === "the" ? "the" : article(head)} ${head}`;
    const core = [
      subject,
      cls === "frequency" ? adv : null,
      finite,
      object,
      adv && cls !== "frequency" && cls !== "time" ? adv : null,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      (cls === "time"
        ? `${cap(adv)} ${subject === "I" || s.subject.entry.partOfSpeech === "noun" ? core : core[0].toLowerCase() + core.slice(1)}`
        : cap(core)) +
      (frame.answerType === "person" ? "?" : ".") +
      polite
    );
  }
  function resolve(data, frame, binding, lookup = index(data)) {
    if (
      !frame ||
      frame.scope !== "feature_vetted_draft" ||
      !binding?.slots ||
      Object.keys(binding.slots).length !== Object.keys(frame.slots).length
    )
      return null;
    const slots = {};
    for (const [name, spec] of Object.entries(frame.slots)) {
      const ref = binding.slots[name],
        item = lookup.get(ref?.formId);
      if (!item || item.entry.lemmaId !== ref.lemmaId || !licensed(item, spec))
        return null;
      slots[name] = item;
    }
    return resolveSlots(frame, slots);
  }
  function resolveSlots(frame, slots) {
    if (!compatible(frame, slots)) return null;
    const n = slots[frame.copulaFrom];
    const copula = n
      ? frame.terminals.find(
          (c) =>
            c.number === feature(n, "number") &&
            (c.number === "plural" || c.gender === feature(n, "gender")),
        )
      : null;
    if (n && !copula) return null;
    return { slots, copula };
  }
  function compose(data, frame, binding, lookup, attestations) {
    const resolved = resolve(data, frame, binding, lookup);
    if (!resolved) return null;
    return renderResolved(data, frame, resolved, attestations);
  }
  function renderResolved(data, frame, resolved, attestations, lazy = false, lookup = null) {
    const { slots, copula } = resolved;
    const render = (key) =>
      frame.pashtoPattern.replace(/\{([a-z]+)\}/g, (_, name) =>
        name === "copula" ? copula[key] : slots[name].value[key],
      );
    const ps = render("pashto"),
      en = english(frame, slots);
    if (!en || /undefined|null/.test(en)) return null;
    const source = (attestations?.get(ps) ||
      data.generationAttestations?.filter((a) => a.pashto === ps) ||
      [])[0];
    const refs = Object.fromEntries(
      Object.entries(slots).map(([k, { entry, value }]) => [
        k,
        { lemmaId: entry.lemmaId, formId: value.formId },
      ]),
    );
    const bindingId = Object.values(refs)
      .map((r) => r.formId)
      .join("|");
    const requiredGrammarIds = unique([
      ...frame.requiredGrammarIds,
      ...Object.values(slots).flatMap(({ entry, value }) => [
        ...entry.introduction.requiredGrammarIds,
        ...value.prerequisiteGrammarIds,
      ]),
      ...(copula ? [copula.grammarId] : []),
    ]);
    const addressee =
      slots.subject?.value.composition.register === "informal"
        ? "Saleha"
        : "Ms Hameed";
    const details = lazy ? null : detailValues(frame, slots, copula);
    const generated = {
      origin: "productive_engine",
      frameId: frame.id,
      family: frame.family,
      bindingId,
      slots: refs,
      requiredGrammarIds,
    };
    setDetail(generated, "terminals", details);
    generated.sourceId = source?.sourceId || null;
    generated.outputKind = source ? "authored_attestation" : "composed_draft";
    setDetail(generated, "formEvidenceSourceIds", details);
    generated.answerType = frame.answerType || null;
    setDetail(generated, "subjects", details);
    setDetail(generated, "semanticArguments", details);
    generated.speaker = "Player";
    generated.addressee = addressee;
    generated.register = slots.subject?.value.composition.register || null;
    generated.reviewStatus = "needs_native_review";
    generated.userVerified = false;
    generated.pronunciationStatus = "provisional_authored_span";
    const card = {id: `generated:${frame.id}:${bindingId}`, type: "sentence", ps, en};
    setDetail(card, "roman", details);
    card.loop = Math.max(frame.earliestDay, ...Object.values(slots).map(({entry, value}) => Math.max(entry.introduction.day, value.firstAllowedDay)));
    card.place = (slots.noun || slots.verb || slots.subject).entry.primaryDistrict;
    card.speaker = "Player";
    card.recipient = addressee;
    card.note = "Practice with studied forms; language and pronunciation remain provisional.";
    card.dialect = "";
    card.generated = generated;
    if (lazy) {
      const context = {card, frame, lookup, copula};
      Object.defineProperty(card, detailContext, {value: context, configurable: true});
      Object.defineProperty(generated, detailContext, {value: context, configurable: true});
    }
    return card;
  }
  // Only immutable compiler inputs use deferred display/provenance allocation.
  // Selection still sees every candidate, in its original order, with exact text,
  // grammar and stable bindings. Public compose/restore remain eager proofs.
  const immutableInputs = new WeakSet();
  function immutableTree(value) {
    if (!value || typeof value !== "object") return true;
    if (immutableInputs.has(value)) return true;
    if (!Object.isFrozen(value) || !Object.values(value).every(immutableTree)) return false;
    immutableInputs.add(value);
    return true;
  }
  // Context belongs to the candidate graph, not a global ephemeron table.
  // The private non-enumerable symbol never enters canonical JSON/proofs.
  const detailContext = Symbol("compiler candidate details");
  const deferredKeys = ["roman", "terminals", "formEvidenceSourceIds", "subjects", "semanticArguments"];
  function detailValues(frame, slots, copula) {
    return {
        roman: frame.pashtoPattern.replace(/\{([a-z]+)\}/g, (_, name) => name === "copula" ? copula.romanisation : slots[name].value.romanisation),
        terminals: copula ? [copula] : [],
        formEvidenceSourceIds: unique(Object.values(slots).map(s => s.value.featureEvidence.sourceId)),
        subjects: slots.subject ? [{person: feature(slots.subject, "person"), number: feature(slots.subject, "number"), formId: slots.subject.value.formId}] : [],
        semanticArguments: Object.fromEntries(Object.entries(slots).map(([k,s]) => [k, s.value.composition.english || s.entry.generationSemantics?.base || s.entry.generationSemantics?.singular || s.value.pashto])),
      };
  }
  function materialize(owner, key) {
    const context = owner[detailContext];
    if (!context.values) {
      const {frame, lookup, copula, card} = context;
      const slots = Object.fromEntries(Object.entries(card.generated.slots).map(([name, ref]) => [name, lookup.get(ref.formId)]));
      context.values = detailValues(frame, slots, copula);
      for (const name of deferredKeys) {
        const target = name === "roman" ? card : card.generated;
        if (Object.getOwnPropertyDescriptor(target, name).configurable)
          Object.defineProperty(target, name, {value: context.values[name], enumerable: true, configurable: true, writable: true});
      }
      if (deferredKeys.every(name => "value" in Object.getOwnPropertyDescriptor(name === "roman" ? card : card.generated, name))) {
        delete card[detailContext]; delete card.generated[detailContext];
      }
      context.frame = context.lookup = context.copula = context.card = null;
    }
    return context.values[key];
  }
  const deferredDescriptors = Object.fromEntries(deferredKeys.map(key => [key, {get: function() {return materialize(this, key)}, enumerable: true, configurable: true}]));
  function setDetail(owner, key, values) {
    // Initialise each field once in canonical order. Replacing an existing
    // value with an accessor forces dictionary storage in Chromium; rebuilding
    // intermediate card objects instead adds avoidable GC pressure.
    if (values) owner[key] = values[key];
    else Object.defineProperty(owner, key, deferredDescriptors[key]);
  }
  function formAvailable(p, item, day) {
    if (!item) return false;
    const { entry: e, value: f } = item;
    return (
      e.introduction.day <= day &&
      f.firstAllowedDay <= day &&
      [...e.introduction.requiredGrammarIds, ...f.prerequisiteGrammarIds].every(
        (id) => p.library.grammar[id],
      ) &&
      !!p.library.acquired[e.lemmaId]?.introducedFormIds.includes(f.formId)
    );
  }
  function catalog(data, frames, p = null, day = 14) {
    const lookup = index(data),
      out = [],
      attestations = new Map();
    const lazy = immutableTree(frames) && immutableTree(data.entries) && immutableTree(data.generationEvidence) && immutableTree(data.generationAttestations);
    for (const a of data.generationAttestations || [])
      attestations.set(a.pashto, [...(attestations.get(a.pashto) || []), a]);
    const items = [...lookup.values()].filter(
      (item) => !p || formAvailable(p, item, day),
    );
    for (const frame of frames.frames) {
      if (
        frame.scope !== "feature_vetted_draft" || frame.earliestDay > day ||
        (p && !frame.requiredGrammarIds.every((id) => p.library.grammar[id]))
      )
        continue;
      const candidates = Object.entries(frame.slots).map(([name, spec]) => [
        name,
        items.filter((item) => licensed(item, spec)),
      ]);
      const slots = {};
      function visit(i) {
        if (i === candidates.length) {
          // Candidate lists already establish slot licensing and exact references.
          const resolved = resolveSlots(frame, slots);
          const card = resolved && renderResolved(data, frame, resolved, attestations, lazy, lookup);
          if (
            card &&
            card.loop <= day &&
            (!p ||
              card.generated.requiredGrammarIds.every(
                (id) => p.library.grammar[id],
              ))
          )
            out.push(card);
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
  function coordinate(data, frames, left, right, connectorRef) {
    const frame = frames.compositeFrames?.find(
      (f) => f.id === "coordinate-present",
    );
    const lookup = index(data),
      connector = lookup.get(connectorRef.formId);
    if (
      !frame ||
      !licensed(connector, {
        role: "conjunction",
        features: {},
        requiredFeatures: [],
      }) ||
      connector.entry.lemmaId !== connectorRef.lemmaId ||
      connector.entry.lemmaId !== "lemma:universal:connectors-0" ||
      left.ps === right.ps
    )
      return null;
    for (const card of [left, right]) {
      if (card.generated.family !== "present_transitive") return null;
      const f = frames.frames.find((f) => f.id === card.generated.frameId);
      if (!resolve(data, f, card.generated, lookup)) return null;
      const subject = lookup.get(card.generated.slots.subject.formId);
      if (
        subject.entry.partOfSpeech !== "pronoun" ||
        feature(subject, "number") !== "singular" ||
        ![1, 2].includes(feature(subject, "person"))
      )
        return null;
    }
    const slots = {};
    for (const [prefix, card] of [
      ["left", left],
      ["right", right],
    ])
      for (const [name, ref] of Object.entries(card.generated.slots))
        slots[prefix + "_" + name] = ref;
    slots.connector = connectorRef;
    const ps =
      left.ps.replace(/\.$/, "") +
      " " +
      connector.value.pashto +
      " " +
      right.ps;
    const roman =
      left.roman.replace(/\.$/, "") +
      " " +
      connector.value.romanisation +
      " " +
      right.roman;
    const rightEnglish = right.en.startsWith("I ")
      ? right.en
      : right.en[0].toLowerCase() + right.en.slice(1);
    const en = left.en.replace(/\.$/, "") + ", and " + rightEnglish;
    return {
      id: "generated:coordinate-present:" + left.id + "&" + right.id,
      type: "sentence",
      ps,
      en,
      roman,
      loop: Math.max(4, left.loop, right.loop, connector.value.firstAllowedDay),
      place: left.place,
      speaker: "Player",
      recipient: right.recipient,
      note: "Two independently licensed clauses joined by a studied coordinator. Native review pending.",
      dialect: "",
      generated: {
        origin: "productive_engine",
        frameId: frame.id,
        family: frame.family,
        bindingId: left.generated.bindingId + "&" + right.generated.bindingId,
        slots,
        requiredGrammarIds: unique([
          ...frame.requiredGrammarIds,
          ...left.generated.requiredGrammarIds,
          ...right.generated.requiredGrammarIds,
          ...connector.value.prerequisiteGrammarIds,
        ]),
        terminals: [],
        sourceId: null,
        outputKind: "composed_draft",
        reviewStatus: "needs_native_review",
        userVerified: false,
        subjects: [...left.generated.subjects, ...right.generated.subjects],
        ast: {
          kind: "clause_coordination",
          left: left.id,
          right: right.id,
          connector: connectorRef,
        },
        formEvidenceSourceIds: unique([
          ...left.generated.formEvidenceSourceIds,
          ...right.generated.formEvidenceSourceIds,
          connector.value.featureEvidence.sourceId,
        ]),
      },
    };
  }
  function available(p, data, frames, day) {
    const lookup = index(data);
    const signature =
      day +
      ";" +
      Object.keys(p.library.grammar).sort().join(",") +
      ";" +
      Object.values(p.library.acquired)
        .flatMap((r) => r.introducedFormIds)
        .sort()
        .join(",");
    if (!data.generatedCatalog && data.eligibleCache?.signature !== signature)
      data.eligibleCache = { signature, cards: catalog(data, frames, p, day) };
    const base = data.generatedCatalog
      ? data.generatedCatalog.filter(
          (card) =>
            card.loop <= day &&
            card.generated.requiredGrammarIds.every(
              (id) => p.library.grammar[id],
            ) &&
            Object.values(card.generated.slots).every((r) =>
              formAvailable(p, lookup.get(r.formId), day),
            ),
        )
      : data.eligibleCache.cards;
    if (!data.generatedCatalog && data.eligibleCache.available) return data.eligibleCache.available;
    if (day < 4 || !p.library.grammar["grammar-day-4"]) return base;
    const connector = [...lookup.values()].find(
      (x) =>
        x.value.composition.roles?.includes("conjunction") &&
        formAvailable(p, x, day),
    );
    if (!connector) return base;
    const clauses = base.filter(
      (c) =>
        c.generated.family === "present_transitive" &&
        [1, 2].includes(
          feature(lookup.get(c.generated.slots.subject.formId), "person"),
        ) &&
        feature(lookup.get(c.generated.slots.subject.formId), "number") ===
          "singular",
    );
    const extra = [],
      seen = new Set();
    for (let i = 0; i < Math.min(32, clauses.length); i++) {
      const left = clauses[(i * 17) % clauses.length],
        right = clauses[(i * 29 + 1) % clauses.length];
      const c = coordinate(data, frames, left, right, {
        lemmaId: connector.entry.lemmaId,
        formId: connector.value.formId,
      });
      if (c && !seen.has(c.id)) {
        extra.push(c);
        seen.add(c.id);
      }
    }
    const result = [...base, ...extra];
    if (!data.generatedCatalog) data.eligibleCache.available = result;
    return result;
  }
  function restoreCard(data, frames, snapshot) {
    if (!snapshot?.generated) return null;
    if (snapshot.generated.ast?.kind === "clause_coordination") {
      const a = snapshot.generated.ast,
        left = restoreId(data, frames, a.left),
        right = restoreId(data, frames, a.right);
      if (!left || !right) return null;
      return coordinate(data, frames, left, right, a.connector);
    }
    const f = frames.frames.find((f) => f.id === snapshot.generated.frameId);
    return f ? compose(data, f, { slots: snapshot.generated.slots }) : null;
  }
  function select(p, data, frames, day, count, seed, recent = []) {
    const lookup = index(data),
      frameById = new Map(frames.frames.map((f) => [f.id, f]));
    const pool = data.generatedCatalog
      ? data.generatedCatalog.filter(
          (card) =>
            card.loop <= day &&
            card.generated.requiredGrammarIds.every(
              (id) => p.library.grammar[id],
            ) &&
            Object.values(card.generated.slots).every((r) =>
              formAvailable(p, lookup.get(r.formId), day),
            ),
        )
      : available(p, data, frames, day);
    // Draw licensed cards directly, cycling families before repeating one.
    // Hashing/sorting every long binding ID made seeded practice unnecessarily slow.
    let randomState = seed >>> 0 || 0x9e3779b9;
    const draw = (length) => {
      randomState ^= randomState << 13;
      randomState ^= randomState >>> 17;
      randomState ^= randomState << 5;
      return (randomState >>> 0) % length;
    };
    const recentIds = new Set(recent),
      groups = new Map();
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
    const result = [],
      seenText = new Set();
    while (
      result.length < count &&
      families.some((k) => {
        const group = groups.get(k);
        return group.fresh.length || group.recent.length;
      })
    )
      for (const k of families) {
        const group = groups.get(k),
          values = group.fresh.length ? group.fresh : group.recent;
        if (!values.length) continue;
        const c = values.splice(draw(values.length), 1)[0];
        if (
          !seenText.has(c.ps) &&
          (c.generated.ast
            ? restoreCard(data, frames, c)
            : resolve(
                data,
                frameById.get(c.generated.frameId),
                c.generated,
                lookup,
              ))
        ) {
          result.push(c);
          seenText.add(c.ps);
        }
        if (result.length === count) break;
      }
    return result;
  }
  function restoreId(data, frames, id) {
    if (typeof id !== "string") return null;
    const prefix = "generated:coordinate-present:";
    if (id.startsWith(prefix)) {
      const parts = id.slice(prefix.length).split("&");
      if (parts.length !== 2 || parts.some((p) => p.startsWith(prefix)))
        return null;
      const left = restoreId(data, frames, parts[0]),
        right = restoreId(data, frames, parts[1]);
      const connector = data.entries
        .find((e) => e.lemmaId === "lemma:universal:connectors-0")
        ?.forms.find((f) => f.composition.roles?.includes("conjunction"));
      if (!left || !right || !connector) return null;
      const card = coordinate(data, frames, left, right, {
        lemmaId: "lemma:universal:connectors-0",
        formId: connector.formId,
      });
      return card?.id === id ? card : null;
    }
    const frame = frames.frames.find((f) =>
      id.startsWith("generated:" + f.id + ":"),
    );
    if (!frame) return null;
    const ids = id.slice(("generated:" + frame.id + ":").length).split("|"),
      names = Object.keys(frame.slots),
      lookup = index(data);
    if (ids.length !== names.length) return null;
    const slots = {};
    for (let i = 0; i < names.length; i++) {
      const item = lookup.get(ids[i]);
      if (!item) return null;
      slots[names[i]] = { lemmaId: item.entry.lemmaId, formId: ids[i] };
    }
    const card = compose(data, frame, { slots });
    return card?.id === id ? card : null;
  }
  // Typed dialogue joins compiled questions to compiled answers by exact slots.
  // Early lessons use an English situation/request; no untaught Pashto question is fabricated.
  function dialogues(pool, data, seed = 0) {
    const refs = new Map(
      data.entries.flatMap((e) => e.forms.map((f) => [f.formId, { e, f }])),
    );
    const result = [];
    const answerFamilies = {
      where_question: ["spatial_equative", "location_adverb_equative"],
      which_question: ["demonstrative_descriptor"],
      whose_question: ["possessive_equative"],
      how_many_question: ["count_location"],
      what_object_question: ["present_transitive"],
      who_subject_question: ["present_transitive"],
    };
    const key = (c, fields) =>
      fields.map((k) => c.generated.slots[k]?.formId || "").join("|");
    const patterns = {
      where_question: ["noun"],
      which_question: ["noun", "adjective"],
      whose_question: ["noun", "demonstrative"],
      how_many_question: ["noun", "location"],
      what_object_question: ["subject", "verb"],
      who_subject_question: ["noun", "verb"],
    };
    const joins = new Map();
    for (const [questionFamily, allowed] of Object.entries(answerFamilies)) {
      const map = new Map();
      for (const a of pool)
        if (allowed.includes(a.generated.family)) {
          if (
            questionFamily === "who_subject_question" &&
            refs.get(a.generated.slots.subject.formId).e.partOfSpeech !== "noun"
          )
            continue;
          const k = key(a, patterns[questionFamily]);
          if (!map.has(k)) map.set(k, []);
          map.get(k).push(a);
        }
      joins.set(questionFamily, map);
    }
    for (const q of pool) {
      const family = q.generated.family;
      if (!patterns[family]) continue;
      if (family === "what_object_question") {
        const subject = refs.get(q.generated.slots.subject.formId);
        if (
          (subject.f.morphology.person ??
            subject.f.composition.subjectPerson) !== 3
        )
          continue;
      }
      const matches = joins.get(family).get(key(q, patterns[family])) || [];
      const answer = matches[(seed >>> 0) % Math.max(1, matches.length)];
      if (answer)
        result.push({
          family,
          prompt: q,
          answer,
          scene: "Scene: " + answer.en,
          recipient: "Teacher",
        });
    }
    const seen = new Set();
    for (let i = 0; i < Math.min(pool.length, 512) && seen.size < 128; i++) {
      const answer = pool[((seed >>> 0) + i * 31) % pool.length];
      if (answer.generated.answerType || seen.has(answer.ps)) continue;
      seen.add(answer.ps);
      result.push({
        family: "guided_scene",
        prompt: null,
        answer,
        scene: "Reply meaning: " + answer.en,
        request: "Describe this scene in Pashto using the forms you studied.",
        recipient:
          answer.generated.register === "informal" ? "Saleha" : "Teacher",
      });
    }
    return result;
  }
  return {
    compose,
    eligible,
    available,
    select,
    catalog,
    licensed,
    compatible,
    dialogues,
    coordinate,
    restoreCard,
    restoreId,
  };
})();
