/* Bounded feature unification. Only explicit semantic tuples with vetted form features are licensed. */
const SentenceEngine = (() => {
  const form = (data, ref) => {
    const entry = data.entries.find((e) => e.lemmaId === ref.lemmaId);
    return { entry, value: entry?.forms.find((f) => f.formId === ref.formId) };
  };
  function compose(data, frame, binding) {
    if (
      frame.scope !== "feature_vetted_draft" ||
      !frame.bindings.some(
        (b) =>
          b.id === binding.id && JSON.stringify(b) === JSON.stringify(binding),
      )
    )
      return null;
    const slots = {};
    for (const [name, spec] of Object.entries(frame.slots)) {
      const ref = binding.slots[name];
      if (!ref) return null;
      const { entry, value } = form(data, ref);
      if (
        !entry ||
        !value?.composition?.enabled ||
        !value.romanisation ||
        entry.partOfSpeech !== spec.partOfSpeech
      )
        return null;
      if (
        Object.entries(spec.features).some(
          ([k, v]) => value.morphology[k] !== v,
        )
      )
        return null;
      slots[name] = value.pashto;
    }
    if (
      frame.terminals.some((t) =>
        Object.entries(t.features).some(
          ([k, v]) => frame.slots.noun.features[k] !== v,
        ),
      )
    )
      return null;
    const render = (pattern, values) =>
      pattern.replace(/\{([a-z]+)\}/g, (_, k) => values[k]);
    const ps = render(frame.pashtoPattern, slots),
      en = render(frame.englishPattern, binding.englishSlots);
    if (ps !== binding.output.pashto || en !== binding.output.english)
      return null;
    return {
      id: `generated:${frame.id}:${binding.id}`,
      type: "sentence",
      ps,
      en,
      roman: binding.output.romanisation,
      note:
        binding.output.kind === "composed_draft"
          ? "Generated draft practice from attested forms; native review pending."
          : "Controlled practice from an authored attestation; native review pending.",
      dialect: "",
      generated: {
        frameId: frame.id,
        bindingId: binding.id,
        slots: binding.slots,
        requiredGrammarIds: frame.requiredGrammarIds,
        terminals: frame.terminals,
        sourceId: binding.output.sourceId,
        outputKind: binding.output.kind,
        formEvidenceSourceIds: binding.output.formEvidenceSourceIds || [],
        reviewStatus: "needs_native_review",
      },
    };
  }
  function eligible(p, data, frames, day) {
    const out = [];
    for (const frame of frames.frames) {
      if (!frame.requiredGrammarIds.every((id) => p.library.grammar[id]))
        continue;
      for (const binding of frame.bindings) {
        const refs = Object.values(binding.slots);
        if (
          !refs.every((ref) => {
            const { entry, value } = form(data, ref);
            return (
              entry &&
              value &&
              entry.introduction.day <= day &&
              value.firstAllowedDay <= day &&
              value.prerequisiteGrammarIds.every(
                (id) => p.library.grammar[id],
              ) &&
              p.library.acquired[ref.lemmaId]?.introducedFormIds.includes(
                ref.formId,
              )
            );
          })
        )
          continue;
        const card = compose(data, frame, binding);
        if (card) out.push(card);
      }
    }
    return out;
  }
  function select(p, data, frames, day, count, seed, recent = []) {
    // Seeded rotation across a stable pool gives repeatable variety without rerolling attempts.
    const pool = eligible(p, data, frames, day).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const fresh = pool.filter((c) => !recent.includes(c.id));
    const ordered = [...fresh, ...pool.filter((c) => recent.includes(c.id))];
    if (!ordered.length) return [];
    const offset = (seed >>> 0) % Math.max(1, fresh.length || ordered.length);
    return [...ordered.slice(offset), ...ordered.slice(0, offset)].slice(
      0,
      count,
    );
  }
  return { compose, eligible, select };
})();
