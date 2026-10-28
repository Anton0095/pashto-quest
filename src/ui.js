/* Shared DOM/RTL helpers, character display, HUD and screen switching. */
function createUI({ state, content, progression }) {
  const $ = (id) => document.getElementById(id);
  function displayPlace(loc) {
    return loc === "library"
      ? "Library"
      : loc === "residential"
        ? state.progress.homeGranted
          ? "Your Home"
          : "Muhammad Jan’s Home"
        : loc === "nature"
          ? "The Lake"
          : content.zones[loc].name;
  }
  function showParticipants(names, recipient = "") {
    const root = $("participants");
    root.replaceChildren();
    for (const name of [...new Set(names)]) {
      const person = content.peopleByName[name] || { name, face: "🧑" };
      const el = document.createElement("div");
      el.className = "interlocutor" + (name === recipient ? " respondent" : "");
      const icon = document.createElement("span");
      icon.className = "portrait";
      icon.textContent = person.face;
      const body = document.createElement("span");
      const strong = document.createElement("b");
      strong.textContent = name;
      const role = document.createElement("span");
      role.textContent =
        (person.role || "Visitor") +
        (name === recipient ? " · Person you address" : "");
      body.append(strong, role);
      el.append(icon, body);
      root.append(el);
    }
  }
  function setDialogueSpeaker(name) {
    const person = content.peopleByName[name] || { name, face: "🧑" };
    $("speakerName").textContent = person.name + " · speaking";
    $("speakerIcon").textContent = person.face;
  }
  function setSpeaker(loop, loc, mode) {
    const person = content.teacherFor(loop, loc, mode);
    setDialogueSpeaker(person.name);
    showParticipants(
      mode === "challenge" && loop === 6
        ? ["Saleha", "Mina"]
        : mode === "challenge" && loop === 7
          ? ["Ms Hameed"]
          : mode === "challenge" && loop === 5
            ? ["Saleha", "Muhammad Jan", "Ms Hameed", "Edris"]
            : mode === "standard" && loop >= 5
              ? content.peopleAt[loop]?.[loc] || [person.name]
              : [person.name],
    );
    return person;
  }
  function hud() {
    const status = progression.characterStatus(state.progress),
      within = status.xp % progression.XP_STEP,
      percent = status.capped ? 100 : (within / progression.XP_STEP) * 100;
    $("xpPill").textContent = `✦ ${status.xp} XP`;
    $("characterLevel").textContent = `Level ${status.level} · ${status.title}`;
    $("xpAmount").textContent =
      status.level === 10
        ? "Week 1 complete · extra XP banked"
        : status.capped
          ? `XP banked · pass Day ${status.cleared + 1}${status.cleared === 6 ? " weekly examination" : " challenge"} to advance`
          : `${within} / ${progression.XP_STEP} XP`;
    $("xpFill").style.width = percent + "%";
    $("xpBar").setAttribute("aria-valuenow", String(percent));
    $("xpBar").setAttribute("aria-valuetext", $("xpAmount").textContent);
    const bankCount = LibraryEngine.summary(
      state.progress,
      content.LIBRARY_DATA,
    );
    $("knownPill").textContent =
      `${bankCount.encountered} content lemmas encountered`;
    $("characterSubtitle").textContent =
      status.level === 10
        ? "Week 1 complete · New Resident"
        : state.progress.tutorialDone
          ? `${state.progress.playerProfile?.name ? "Welcome, " + state.progress.playerProfile.name + " · " : ""}Living in town · Day-by-day Pashto · Present tense.`
          : "Muhammad Jan is waiting at the Library.";
  }
  function view(name) {
    for (const id of [
      "introScreen",
      "worldScreen",
      "lessonScreen",
      "resultScreen",
    ])
      $(id).classList.toggle("hidden", id !== name);
    $("navWorld").classList.toggle(
      "hidden",
      !state.progress.tutorialDone ||
        name === "worldScreen" ||
        name === "introScreen",
    );
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }
  /* Only the display text changes. Never embed markup from lesson/question data. */
  function renderMixedPashto(element, text) {
    const pattern = /([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/gu;
    const source = String(text ?? "");
    element.replaceChildren();
    let last = 0;
    for (const match of source.matchAll(pattern)) {
      const i = match.index;
      if (i > last)
        element.append(document.createTextNode(source.slice(last, i)));
      const span = document.createElement("span");
      span.className = "inline-pashto";
      span.lang = "ps";
      span.dir = "rtl";
      span.textContent = match[0];
      element.append(span);
      last = i + match[0].length;
    }
    if (last < source.length)
      element.append(document.createTextNode(source.slice(last)));
  }
  function readableQuizSurfaces() {
    for (const el of document.querySelectorAll(
      "#quizPrompt,#guideMessage,#quizRoman,#quizFeedback strong,#quizFeedback>div,#quizFeedback:not(:has(*)),#quizFeedback>span",
    )) {
      // Preserve feedback control structure; only decorate leaf text nodes.
      if (!el.querySelector("button") && !el.querySelector(".inline-pashto"))
        renderMixedPashto(el, el.textContent);
    }
    for (const b of document.querySelectorAll("#choices .choice")) {
      const text = b.textContent;
      if (/[\u0600-\u06ff]/u.test(text) && !/[A-Za-z]/.test(text)) {
        b.lang = "ps";
        b.dir = "rtl";
        b.classList.add("pashto-option");
      } else {
        b.classList.remove("pashto-option");
        b.removeAttribute("lang");
        b.dir = "ltr";
        if (!b.querySelector(".inline-pashto")) renderMixedPashto(b, text);
      }
    }
  }
  function node(tag, text, cls) {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function button(text, fn) {
    const b = node("button", text, "secondary");
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }

  return {
    displayPlace,
    showParticipants,
    setDialogueSpeaker,
    setSpeaker,
    hud,
    view,
    renderMixedPashto,
    readableQuizSurfaces,
    node,
    button,
    $,
  };
}
