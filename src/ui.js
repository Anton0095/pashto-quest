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

  // Store values separately from decorated/translated button labels.
  function showAnswerFeedback(root, expected, submitted) {
    for (const b of root.querySelectorAll("button[data-answer], button.choice")) {
      const value = b.dataset.answer ?? b.textContent;
      b.disabled = true;
      b.classList.add("choice");
      b.classList.toggle("correct", value === expected);
      b.classList.toggle("wrong", value === submitted && value !== expected);
      if (value === expected) b.setAttribute("aria-label", value + " · Correct answer");
      else if (value === submitted) b.setAttribute("aria-label", value + " · Incorrect answer");
    }
  }

  function clearSentenceScene() {
    for (const el of document.querySelectorAll(".sentence-scene")) el.remove();
  }

  // Presentation is derived from the actual compiled clause, never its day number.
  // Recognition tasks call this only after submission so pictures cannot disclose
  // an unseen target's meaning. Construction already supplies the English target.
  function sentenceContext(w, host, panel, purpose = "study") {
    const reference = purpose === "reference";
    if (!reference) clearSentenceScene();
    if (!w?.generated) return;
    if (!reference) {
      setDialogueSpeaker(host);
      $("addressTarget").textContent = `${host} → Player · YOUR WORDS → ${host}`;
      $("addressTarget").classList.remove("hidden");
      $("guideMessage").textContent = purpose === "study"
        ? `${host}: “Look at the scene with me. Here is how you can say ‘${w.en}’ in Pashto.”`
        : `${host}: “Look at the scene. How would you say ‘${w.en}’ in Pashto?”`;
    }
    const scene = node("figure", undefined, "sentence-scene");
    scene.setAttribute("role", "img");
    scene.setAttribute("aria-label", w.en);
    const args = w.generated.semanticArguments || {};
    const noun = String(args.noun || "").toLowerCase();
    const adjective = String(args.adjective || "").toLowerCase();
    const opening = /^(window|door)$/.test(noun) && ["open", "closed"].includes(adjective);
    if (opening) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 320 180");
      svg.setAttribute("aria-hidden", "true");
      const shape = (tag, attrs) => {
        const el = document.createElementNS(svg.namespaceURI, tag);
        for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
        svg.append(el);
      };
      shape("rect", {x:0,y:0,width:320,height:180,rx:14,fill:"#ead6b3"});
      const isOpen = adjective === "open", isDoor = noun.startsWith("door");
      scene.dataset.object = isDoor ? "door" : "window";
      scene.dataset.state = adjective;
      const bottom = isDoor ? 174 : 146;
      shape("rect", {x:94,y:20,width:132,height:bottom-20,fill:isOpen?"#8ed3df":"#a9cbd4",stroke:"#68452e","stroke-width":8});
      if (isOpen) {
        shape("path", {d:`M98 24 L56 44 L56 ${bottom+8} L98 ${bottom-4} Z`,fill:"#b67849",stroke:"#68452e","stroke-width":5});
        if (!isDoor) shape("path", {d:`M222 24 L264 44 L264 ${bottom+8} L222 ${bottom-4} Z`,fill:"#b67849",stroke:"#68452e","stroke-width":5});
        shape("circle", {cx:185,cy:51,r:14,fill:"#ffe29a"});
        shape("path", {d:`M102 ${bottom-4} L146 95 L181 130 L212 91 L222 ${bottom-4} Z`,fill:"#719b62"});
      } else if (isDoor) {
        shape("rect", {x:100,y:26,width:120,height:bottom-30,fill:"#b67849"});
        shape("circle", {cx:202,cy:104,r:5,fill:"#ffe29a"});
      } else {
        shape("path", {d:`M160 24 V${bottom-4} M98 83 H222`,stroke:"#68452e","stroke-width":6});
      }
      scene.append(svg);
    } else {
      // A labelled scene board keeps abstract, plural, action and coordinated
      // meanings exact rather than substituting an unrelated stock picture.
      const props = node("div", undefined, "scene-props");
      const symbols = {house:"🏠",home:"🏠",book:"📖",market:"🏪",school:"🏫",water:"💧",bread:"🫓",tea:"🫖",apple:"🍎",tree:"🌳",flower:"🌸",lake:"🏞️",river:"🏞️",mountain:"⛰️",bird:"🐦",child:"🧒",children:"🧒🧒",car:"🚗",chair:"🪑",table:"🪑",pen:"🖊️",bag:"🎒",food:"🍲",milk:"🥛",rice:"🍚",fish:"🐟",dog:"🐕",cat:"🐈"};
      for (const [role, value] of Object.entries(args)) {
        const prop = node("div", undefined, "scene-prop");
        prop.dataset.role = role;
        const icon = node("span", symbols[String(value).toLowerCase()] || (role === "verb" ? "💬" : role === "subject" ? "🧑" : "◆"), "scene-symbol");
        icon.setAttribute("aria-hidden", "true");
        prop.append(icon, node("span", String(value)));
        props.append(prop);
      }
      if (!props.children.length && w.generated.ast?.kind === "clause_coordination") {
        for (const id of [w.generated.ast.left, w.generated.ast.right]) {
          const clause = SentenceEngine.restoreId(content.LIBRARY_DATA, content.LIBRARY_DATA.sentenceFrames, id);
          if (clause) props.append(node("div", clause.en, "scene-prop"));
        }
      }
      if (!props.children.length) props.append(node("span", "💬", "scene-symbol"));
      scene.append(props);
    }
    scene.append(node("figcaption", w.en));
    panel.prepend(scene);
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
    showAnswerFeedback,
    clearSentenceScene,
    sentenceContext,
    $,
  };
}

