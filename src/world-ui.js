/* World map, route guidance and daily assessment entry points. */
function createWorld({
  state,
  content,
  progression,
  learning,
  ui,
  audio,
  storage,
  narrative,
  onLesson,
  onChallenge,
  onLibrary,
  onResume,
}) {
  function dayCheckInReady(day) {
    return (
      day <= 5 && learning.completeRound(day) && !learning.passedChallenge(day)
    );
  }
  function navigatePlace(day, place) {
    if (place === "library") {
      onLibrary();
      return;
    }
    if (!learning.allowed(day)) return;
    const finalLoc =
      day === 3 ? "business" : day === 5 ? "nature" : "residential";
    if (day !== 1 && dayCheckInReady(day) && place === finalLoc) {
      onChallenge(day);
      return;
    }
    if (learning.placeAccessible(day, place)) onLesson(`${day}-${place}`);
  }
  function dayGuidance(day) {
    if (day >= 8) {
      const d = content.week2Days[day];
      return !state.progress.complete[`${day}-${d.opening}`]
        ? `Normal route: meet ${content.teacherFor(day, d.opening, "standard").name} at ${ui.displayPlace(day, d.opening)} first, or skip directly to the final challenge.`
        : learning.completeRound(day)
          ? `All four visits complete. ${d.challenge}`
          : "Visit the other three locations in any order, or take the final challenge now.";
    }
    if (day === 1)
      return learning.completeRound(1)
        ? "🏡 All four visits complete. Muhammad Jan is ready for your check-in."
        : "🌿 Free roam: explore any location, or choose the Day 1 challenge now.";
    if (day === 2) {
      if (!state.progress.complete["2-school"])
        return "🏫 Normal route: start at school with Ms Hameed for S–O–V, or skip directly to the challenge.";
      if (
        !state.progress.complete["2-business"] ||
        !state.progress.complete["2-nature"]
      )
        return "🏪 🏞️ Visit Edris at the market and Saleha at the lake in either order.";
      return "🏡 Return home to Muhammad Jan for practice and the final check-in.";
    }
    if (day === 3) {
      if (!state.progress.complete["3-nature"])
        return "🏞️ Normal route: meet Saleha at the lake to learn زه (I), or skip to Edris’s dinner challenge.";
      return learning.completeRound(3)
        ? "🏪 Edris is ready for the final dinner conversation."
        : "🌿 Practise “I” at home, school and market. Then return to Edris.";
    }
    if (day === 4) {
      if (!state.progress.complete["4-residential"])
        return "🏡 Normal route: start at home with Muhammad Jan to learn informal ته (you) and combine clauses with او (and). Or skip to his challenge immediately.";
      return learning.completeRound(4)
        ? "🏡 Come home and have an informal end-of-day conversation with Muhammad Jan."
        : "🌿 Practise with Edris, Saleha and Ms Hameed in any order; use both “I” and informal “you” in compound sentences.";
    }
    if (day === 5) {
      if (!state.progress.complete["5-school"])
        return "🏫 Normal route: meet Ms Hameed at school first to learn respectful/plural تاسې. The lake gathering challenge is available immediately as a skip.";
      return learning.completeRound(5)
        ? "🏞️ Everyone has gathered at the lake. Join the 15-part community conversation."
        : "🌿 Explore the village; familiar people are moving between locations. Practise addressing friends, elders and groups.";
    }
    if (day === 6)
      return !state.progress.complete["6-nature"]
        ? "Normal route: meet Saleha and Mina at the lake first, or skip straight to the Hills."
        : learning.completeRound(6)
          ? "Your four visits are complete. Join Saleha and Mina in the Hills using the challenge button."
          : "Explore Home, Market and School in any order, then take the Hills challenge.";
    return !state.progress.complete["7-business"]
      ? "Normal route: meet Edris at the market first, or skip to Ms Hameed’s weekly exam."
      : learning.completeRound(7)
        ? "All four visits complete. Take Ms Hameed’s separate weekly examination at School using the challenge button."
        : "Visit Home, Lake and School in any order; then take the weekly examination.";
  }
  function startWorld() {
    audio.stopAudio();
    ui.$("addressTarget").classList.add("hidden");
    if (!state.progress.tutorialDone) {
      ui.hud();
      ui.view("introScreen");
      return;
    }
    state.session = null;
    if (!learning.allowed(state.day))
      state.day = content.loops.find((l) => learning.allowed(l.id))?.id || 1;
    ui.hud();
    renderWorld();
    ui.view("worldScreen");
  }
  function renderSkipDayAction(day) {
    const passed = learning.passedChallenge(day),
      done = learning.completeRound(day);
    ui.$("skipDayArea").classList.toggle("hidden", passed);
    if (passed) return;
    const who =
      day >= 8
        ? content.teacherFor(day, null, "challenge").name
        : day === 6
          ? "Saleha and Mina in the Hills"
          : day === 7
            ? "Ms Hameed at School"
            : day === 3
              ? "Edris"
              : day === 5
                ? "the villagers at the lake"
                : day <= 2 || day === 4
                  ? "Muhammad Jan"
                  : "the Friendly Guide";
    ui.$("skipDayHeading").textContent = done
      ? `${who} is ready for the final challenge`
      : `Skip the Day ${day} location visits?`;
    ui.$("skipDayHint").textContent =
      `${done ? "You completed the visits." : "You can skip the opening lesson and all visits."} Take the ${progression.getChallengeSpec(day).questionCount}-question assessment now; ${progression.getChallengeSpec(day).passCount} correct to pass. The normal story route remains available.`;
    ui.$("skipDayBtn").textContent =
      day >= 8
        ? `Skip to Day ${day} final challenge →`
        : day === 6
          ? "⛰️ Join Saleha and Mina in the Hills →"
          : day === 7
            ? "🏫 Take Ms Hameed’s 25-question exam →"
            : day === 3
              ? "🧺 Go to Edris’s dinner challenge →"
              : day === 4
                ? "🏡 Talk with Muhammad Jan now →"
                : day === 5
                  ? "🏞️ Join the lakeside gathering →"
                  : day <= 2
                    ? "🏡 Go to Muhammad Jan’s check-in →"
                    : `Skip to Day ${day} challenge →`;
  }
  function renderWorld() {
    audio.stopAudio();
    narrative.renderDayExpression(state.day);
    const selected = content.loops.find((l) => l.id === state.day);
    ui.$("chapterButtons").replaceChildren();
    for (const l of content.loops) {
      const n = content.zoneKeys.filter(
        (z) => state.progress.complete[`${l.id}-${z}`],
      ).length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chapter" + (l.id === state.day ? " selected" : "");
      b.disabled = !learning.allowed(l.id);
      b.setAttribute("aria-pressed", String(l.id === state.day));
      const heading = document.createElement("b");
      heading.textContent = `${learning.allowed(l.id) ? l.icon : "🔒"} Day ${l.id}: ${l.label}`;
      const sub = document.createElement("small");
      sub.textContent = learning.passedChallenge(l.id)
        ? "✓ Challenge passed"
        : learning.allowed(l.id)
          ? l.id === 1
            ? "Free roam · skip optional"
            : l.id === 2
              ? `${n}/4 · school → roam → home`
              : l.id === 3
                ? `${n}/4 · lake → roam → market`
                : l.id === 4
                  ? `${n}/4 · home → roam → home`
                  : l.id === 5
                    ? `${n}/4 · school → roam → lake`
                    : `${n}/4 places · ${l.person}`
          : `Pass Day ${l.id - 1} challenge`;
      b.append(heading, sub);
      b.addEventListener("click", () => {
        state.day = l.id;
        renderWorld();
      });
      ui.$("chapterButtons").append(b);
    }
    let done = content.zoneKeys.filter(
      (z) => state.progress.complete[`${state.day}-${z}`],
    ).length;
    ui.$("chapterProgress").textContent = `Day ${state.day} · ${done}/4 places`;
    ui.$("chapterHint").textContent = selected.description;
    ui.$("dayRoute").textContent = dayGuidance(state.day);
    renderSkipDayAction(state.day);
    ui.$("roundInsight").textContent =
      state.day <= 2
        ? `${selected.subtitle} · Pattern: ${selected.person}. Each visit has a local teacher, and Muhammad Jan checks your learning at the end of the day.`
        : state.day === 3
          ? "Saleha introduces the first-person verb patterns at the lake. Use new and familiar words around the village; finish by shopping for dinner with Edris."
          : state.day === 4
            ? "Muhammad Jan begins with informal ته and compound sentences. Practise around town, then have a familiar conversation with him at home."
            : state.day === 5
              ? "Ms Hameed teaches the choice between ته and polite/plural تاسې. People gather at the lake for a multi-speaker challenge."
              : `${selected.subtitle} · Pattern: ${selected.person}. Optional visits teach new vocabulary and revisit older words. You can attempt the 15-question challenge immediately to ${state.day === content.loops.length ? "complete your first week in town" : `begin Day ${state.day + 1}`}.`;
    if (state.day >= 6)
      ui.$("roundInsight").textContent =
        state.day === 6
          ? "Saleha introduces Mina and speaker-included موږ at the lake. Practise in town, then join the sisters in the Hills. Skip is available now."
          : "Edris introduces هغوی among market shoppers. The separate School exam revisits all seven days: 25 questions, 20 to pass.";
    if (state.day >= 8) {
      ui.$("chapterHint").textContent = content.week2Days[state.day].intro;
      ui.$("roundInsight").textContent =
        "Week 2 draft · Native Laghman review pending. Practise the new topic or skip to the dialogue challenge. Level 10 · New Resident is retained; further level milestones are not assigned.";
    }
    renderDayChallenge();
    ui.$("placeCards").replaceChildren();
    for (const place of content.zoneKeys) {
      const zone = content.zones[place],
        id = `${state.day}-${place}`,
        itemIds = content.courses[id] || [],
        n = itemIds.filter(learning.learned).length,
        full = !!state.progress.complete[id];
      const accessible = learning.placeAccessible(state.day, place),
        checkin =
          state.day !== 1 &&
          dayCheckInReady(state.day) &&
          place ===
            (state.day === 3
              ? "business"
              : state.day === 5
                ? "nature"
                : "residential");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "place" + (checkin ? " checkin" : "");
      b.disabled = !accessible;
      const a = document.createElement("strong");
      a.textContent = `${zone.icon} ${ui.displayPlace(state.day, place)}`;
      const sub = document.createElement("small");
      sub.textContent =
        state.day <= 4 ? content.villagePeople[place].description : zone.intro;
      const teacher = document.createElement("span");
      teacher.className = "teacher";
      {
        const who = content.teacherFor(state.day, place, "standard");
        teacher.textContent = `${who.face} ${who.name}`;
        if (state.day >= 5 && content.peopleAt[state.day]?.[place]?.length > 1)
          teacher.textContent +=
            " · with " +
            content.peopleAt[state.day][place]
              .filter((x) => x !== who.name)
              .join(", ");
      }
      const foot = document.createElement("span");
      foot.className = "progress";
      const lockedReason =
        state.day === 2 && !accessible
          ? place === "residential"
            ? "After market and lake"
            : "Begin at school first"
          : state.day === 3 && !accessible
            ? "Meet Saleha at the lake first"
            : state.day === 4 && !accessible
              ? "Begin at home with Muhammad Jan"
              : state.day === 5 && !accessible
                ? "Begin at school with Ms Hameed"
                : state.day === 6 && !accessible
                  ? "Meet Saleha and Mina at the lake first"
                  : state.day === 7 && !accessible
                    ? "Meet Edris at the market first"
                    : state.day >= 8 && !accessible
                      ? `Begin at ${ui.displayPlace(state.day, content.week2Days[state.day].opening)} first`
                      : "";
      foot.textContent = checkin
        ? state.day === 3
          ? "🧺 Dinner with Edris · 15 questions"
          : state.day === 5
            ? "🏞️ Town gathering · 15 questions"
            : "🏆 Final conversation · 15 questions"
        : lockedReason ||
          `${full ? "✓ Complete · " : ""}${n}/${itemIds.length} items`;
      b.append(a, sub, teacher, foot);
      b.addEventListener("click", () => navigatePlace(state.day, place));
      ui.$("placeCards").append(b);
      const marker = document.querySelector(".map-point." + place);
      marker.disabled = !accessible;
      marker.classList.toggle("done", full);
      marker.classList.toggle("checkin", checkin);
      marker.querySelector("b").textContent = ui.displayPlace(state.day, place);
      ui.$("map-" + place).textContent = checkin
        ? state.day === 3
          ? "🧺 Dinner quiz"
          : state.day === 5
            ? "🏞️ Gathering"
            : "🏆 Conversation"
        : lockedReason || `${full ? "✓ " : ""}${n}/${itemIds.length}`;
    }
    const due = learning.duePool().length;
    ui.$("reviewBtn").disabled = due === 0;
    ui.$("reviewBtn").textContent = `Memory Trail (${due} due)`;
    libraryUpdateWorld();
  }
  function renderDayChallenge() {
    const day = state.day,
      done = learning.completeRound(day),
      passed = learning.passedChallenge(day),
      record = state.progress.challenges[String(day)],
      spec = progression.getChallengeSpec(day);
    const titles = {
      ...Object.fromEntries(
        content.WEEK2_DATA.days.map((d) => [d.day, d.title]),
      ),
      1: "Muhammad Jan’s Library home handover",
      2: "Muhammad Jan’s check-in",
      3: "Dinner shopping with Edris",
      4: "Conversation at home with Muhammad Jan",
      5: "Community at the lake",
      6: spec.title,
      7: spec.title,
    };
    ui.$("challengeEyebrow").textContent =
      `DAY ${day} · ${day === 1 ? "LIBRARY · HOME HANDOVER" : day === 6 ? "HILLS STORY SCENE" : day === 7 ? "SCHOOL · WEEKLY EXAMINATION" : "DAILY CHECK-IN"}`;
    ui.$("challengeTitle").textContent =
      `${passed ? "✓ " : ""}${titles[day]}${passed ? " · passed" : ""}`;
    ui.$("challengeDescription").textContent =
      `${content.townStories[day] || content.week2Days[day]?.challenge} ${spec.questionCount} turns; ${spec.passCount} correct to pass. ${done ? "All four visits complete. Take the final assessment." : "Follow the normal route or skip straight to this assessment without completing visits."}`;
    ui.$("startChallenge").disabled = !learning.allowed(day);
    ui.$("startChallenge").textContent = passed
      ? `Replay ${spec.questionCount}-question assessment ↻`
      : day === 1
        ? "📚 Begin Library home handover →"
        : day >= 8
          ? `Begin ${spec.questionCount}-question final challenge →`
          : day === 3
            ? "🧺 Shop with Edris →"
            : day === 4
              ? "🏡 Talk with Muhammad Jan →"
              : day === 5
                ? "🏞️ Join the village gathering →"
                : day === 6
                  ? "⛰️ Begin Hills challenge →"
                  : day === 7
                    ? "🏫 Begin 25-question weekly exam →"
                    : "🏡 Talk with Muhammad Jan →";
    ui.$("challengeRecord").textContent = record
      ? `Best: ${record.best}/${spec.questionCount} · ${passed ? "PASSED" : `Need ${spec.passCount} to pass`}`
      : `Pass mark: ${spec.passCount}/${spec.questionCount} · 80%`;
    ui.$("townStory").querySelector("span").textContent =
      day === 3
        ? "🧑‍🌾"
        : day === 5
          ? "🏞️"
          : day === 6
            ? "⛰️"
            : day === 7
              ? "👩‍🏫"
              : "👴";
    ui.$("townStory").querySelector("p").textContent =
      `Day ${day} — ${content.townStories[day] || content.week2Days[day]?.intro} ${passed ? "Challenge passed." : "The final challenge is available from the beginning of the day."}`;
  }
  function libraryUpdateWorld() {
    const map = document.querySelector(".worldmap");
    ui.$("worldScreen").prepend(map);
    const plan = LibraryEngine.ensurePlan(
      state.progress,
      content.LIBRARY_DATA,
      state.day,
    );
    storage.save();
    for (const [index, place] of content.zoneKeys.entries()) {
      const placeCard = ui.$("placeCards").children[index],
        ids = plan.locationAssignments[place] || [],
        seen = ids.filter((id) => state.progress.library.acquired[id]).length;
      const quota = ui.node(
        "span",
        `${seen}/${ids.length} scheduled content lemmas encountered`,
        "tiny",
      );
      placeCard.append(quota);
    }
    const card = ui.button(
      "📚 Library · Vocabulary, Grammar & Learning Pace",
      () => onLibrary(),
    );
    card.className = "place library-place";
    ui.$("placeCards").append(card);
    if (state.day === 1) {
      ui.$("townStory").querySelector("p").textContent = state.progress
        .homeGranted
        ? "Muhammad Jan has welcomed you as the owner of your home. He can still visit and teach there."
        : "Muhammad Jan welcomes you at the Library. Explore his home, then meet him at the Library for your home handover challenge.";
      ui.$("skipDayBtn").textContent = "📚 Meet Muhammad Jan at the Library →";
    }
    ui.$("characterSubtitle").textContent =
      progression.characterStatus(state.progress).level === 10
        ? "Week 1 complete · New Resident"
        : state.progress.homeGranted
          ? "Your home · Day-by-day Pashto"
          : "Muhammad Jan welcomes you at the Library";
    if (plan.contentGap)
      ui.$("roundInsight").append(ui.node("p", plan.notice, "notice"));
    if (state.progress.activeChallenge) {
      const resume = ui.button(
        "Resume paused Day " +
          state.progress.activeChallenge.loop +
          " challenge",
        onResume,
      );
      ui.$("placeCards").append(resume);
    }
  }

  return {
    dayCheckInReady,
    navigatePlace,
    dayGuidance,
    startWorld,
    renderSkipDayAction,
    renderWorld,
    renderDayChallenge,
    libraryUpdateWorld,
  };
}
