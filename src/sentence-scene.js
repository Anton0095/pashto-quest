/* Scene presentation consumes compiler meaning and explicit listener context. */
function createSentenceScene({ content, $, node, setDialogueSpeaker }) {
  function clearSentenceScene() {
    for (const el of document.querySelectorAll(".sentence-scene")) el.remove();
  }

  // Presentation is derived from the actual compiled clause, never its day number.
  // Recognition tasks call this only after submission so pictures cannot disclose
  // an unseen target's meaning. Construction already supplies the English target.
  function sentenceContext(w, host, panel, purpose = "study", context = {}) {
    const reference = purpose === "reference";
    if (!reference) clearSentenceScene();
    if (!w?.generated) return;
    if (!reference) {
      setDialogueSpeaker(host);
      $("addressTarget").textContent = `${host} → Player · YOUR WORDS → ${(context.dialogueContext?.responseAddressee || (context.recipient !== "Player" ? context.recipient : null)) || (w.generated.subjects.some(s => s.person === 2) ? w.recipient : host)}`;
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
      const symbols = {house:"🏠",home:"🏠",book:"📖",market:"🏪",school:"🏫",water:"💧",bread:"🫓",tea:"🫖",apple:"🍎",tree:"🌳",flower:"🌸",lake:"🏞️",river:"🏞️",mountain:"⛰️",bird:"🐦",child:"🧒",children:"🧒🧒",car:"🚗",chair:"🪑",table:"▰",pen:"🖊️",bag:"🎒",food:"🍲",milk:"🥛",rice:"🍚",fish:"🐟",dog:"🐕",cat:"🐈"};
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

  return { clearSentenceScene, sentenceContext };
}
