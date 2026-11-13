/* Shared typed controls. Callers own evaluation, preferences, saving and advancement. */
function createTypedAnswerUI({ ui }) {
  function mount({ host, id, label, value = "", lang = "en", maxLength = 160,
    inputClass = "recall-input", formClass = "", placeholder = "",
    submitLabel = "Submit answer", submitClass = "secondary", submitId,
    onInput, onSubmit, onSkip, reveal }) {
    const form = document.createElement("form"), input = document.createElement("input");
    form.className = formClass;
    Object.assign(input, { id, type: "text", className: inputClass, value, lang,
      dir: lang === "ps" ? "rtl" : "ltr", maxLength, autocomplete: "off", placeholder });
    input.setAttribute("aria-label", label);
    if (onInput) input.addEventListener("input", () => onInput(input.value));
    const submit = ui.button(submitLabel, () => {});
    submit.type = "submit";
    submit.className = submitClass;
    if (submitId) submit.id = submitId;
    form.addEventListener("submit", event => { event.preventDefault(); onSubmit(input.value); });
    form.append(input, submit);
    if (reveal) {
      const button = ui.button(reveal.label, reveal.onClick);
      button.className = "speaker";
      form.append(button);
    }
    const skip = ui.button(lang === "ps" ? "Turn off Pashto typing" : "Turn off English typing", onSkip);
    skip.className = "secondary";
    form.append(skip);
    host.append(form);
  }
  return { mount };
}
