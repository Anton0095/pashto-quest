// @GAME_DATA
// @AUDIO_IDS
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  // @WEEK2_DATA
  const week2Days = Object.fromEntries(WEEK2_DATA.days.map((d) => [d.day, d]));
  const { words, courses, loops, zones } = GAME_DATA;
  const wordById = Object.fromEntries(words.map((w) => [w.id, w]));
  const KEY = "pashto-town-days-v1";
  let saveProblem = null;
  const DAY = 86400000;
  const greeting = words.filter((w) => w.loop === 0).map((w) => w.id);
  const zoneKeys = ["residential", "nature", "business", "school"];
  const dayTwoScenes = {
    school:
      "Ms Hameed: “Good morning! Watch me read, write and open this book. Before we practise, I will show you how a Pashto action sentence puts its verb at the end.”",
    business:
      "Edris: “Salaam again! Look at my customers. One buys an apple, another carries a bag, and I sell bread. What actions can you describe?”",
    nature:
      "Saleha: “Look! There are fish and birds by the water. Let us describe what people see, drink, catch and throw.”",
    residential:
      "Muhammad Jan: “You are home! Tell me what people do here: open and close the door, drink tea, and clean the room. Then we will see what you remember.”",
  };
  const villagePeople = {
    residential: {
      name: "Muhammad Jan",
      face: "👴",
      description: "An older village leader, patient and wise.",
      welcome:
        "Welcome back, my friend! A home is the best place to start learning about the village.",
      words:
        "Look around our home. The door, rooms and other familiar things are a fine place to begin.",
    },
    business: {
      name: "Edris",
      face: "🧑‍🌾",
      description: "The grocer who loves a good chat.",
      welcome:
        "Salaam! Come closer. There is always something interesting to see at my shop!",
      words:
        "A market is full of useful words. Look at the food, the shop and everything around you.",
    },
    nature: {
      name: "Saleha",
      face: "👩‍🎓",
      description: "A fellow student from your school.",
      welcome:
        "You are new here too? I am Saleha! I often come to the lake after school.",
      words:
        "It is peaceful beside the lake. We can describe the water and the river together.",
    },
    school: {
      name: "Ms Hameed",
      face: "👩‍🏫",
      description: "Your Pashto teacher at the village school.",
      welcome:
        "Welcome to class. We will build your Pashto one clear step at a time.",
      words:
        "We will study these words carefully, then use them in complete sentences.",
    },
  };
  const roamingTeachers = {
    5: {
      residential: "Muhammad Jan",
      business: "Edris",
      nature: "Saleha",
      school: "Ms Hameed",
    },
    6: {
      residential: "Saleha",
      business: "Muhammad Jan",
      nature: "Saleha",
      school: "Ms Hameed",
    },
    7: {
      residential: "Muhammad Jan",
      business: "Edris",
      nature: "Ms Hameed",
      school: "Saleha",
    },
  };
  const peopleByName = Object.fromEntries(
    [
      ...Object.values(villagePeople),
      {
        name: "Mina",
        face: "👧",
        description: "Saleha’s sister",
        role: "Saleha’s sister",
      },
    ].map((p) => [p.name, p]),
  );
  const peopleAt = {
    5: {
      residential: ["Muhammad Jan", "Edris"],
      business: ["Edris", "Saleha"],
      nature: ["Saleha", "Muhammad Jan", "Ms Hameed", "Edris"],
      school: ["Ms Hameed", "Saleha"],
    },
    6: {
      residential: ["Saleha", "Muhammad Jan"],
      business: ["Muhammad Jan", "Edris"],
      nature: ["Saleha", "Mina"],
      school: ["Ms Hameed", "Mina"],
    },
    7: {
      residential: ["Muhammad Jan", "Saleha"],
      business: ["Edris", "Muhammad Jan"],
      nature: ["Ms Hameed", "Saleha", "Mina"],
      school: ["Saleha", "Ms Hameed"],
    },
  };
  const advancedScenes = {
    4: {
      residential:
        "Muhammad Jan: “You have learnt to speak about yourself. Now we will use ته when talking to a familiar person, and join two meaningful thoughts with او — and.”",
      business:
        "Edris: “Imagine you are speaking to a friend who buys bread while you carry a bag. Describe what you each do!”",
      nature:
        "Saleha: “Look at the fish and birds. You see the bird and I see the fish. Let us say both ideas together.”",
      school:
        "Ms Hameed: “Two clauses can each have their own subject and verb. Try saying what your classmate does, then what you do.”",
    },
    5: {
      residential:
        "Muhammad Jan: “Our neighbours are coming together near the lake. With elders, the polite تاسې is usually the respectful choice.”",
      business:
        "Edris: “Saleha is helping at the shop today! You can use ته with a friend like her, and تاسې to speak to me politely.”",
      nature:
        "Saleha: “Everyone is gathering at the lake! Muhammad Jan and Ms Hameed will be here too. Practise speaking to a group with تاسې.”",
      school:
        "Ms Hameed: “Today you will learn how to use تاسې for elders, teachers, and groups, and how it changes the verb endings.”",
    },
    6: {
      residential:
        "Saleha: “I came to visit Muhammad Jan. Let us talk about what WE do together.”",
      nature:
        "Saleha: “Meet my sister Mina! Join us beside the lake. I run; Mina and I run together; WE run together. You both means the people I address, not my own group.”",
      business:
        "Muhammad Jan: “I stopped by Edris’s shop. We can talk about what WE buy and sell.”",
      school:
        "Ms Hameed: “Now we will practise first-person plural forms: موږ, we.”",
    },
    7: {
      residential:
        "Muhammad Jan: “Our village is busy with visitors. Let us describe what THEY do.”",
      nature:
        "Ms Hameed: “We came here with Saleha. Can you describe what the people and birds around us do?”",
      business:
        "Edris: “Look at the customers by the fruit stall. They buy apples and carry baskets. The sellers at the bread stall are another group: they sell bread. Neither group includes you or me.”",
      school:
        "Saleha: “I am visiting our classroom. Practise telling me what the other students do.”",
    },
  };
  function teacherFor(loop, loc, mode) {
    if (mode === "tutorial") return villagePeople.residential;
    if (loop >= 8) {
      const day = week2Days[loop];
      return (
        peopleByName[
          mode === "challenge"
            ? loop === 14
              ? "Ms Hameed"
              : day.lessons.find((l) => l.location === day.opening).teacher
            : day.lessons.find((l) => l.location === loc)?.teacher
        ] || villagePeople.school
      );
    }
    if (mode === "challenge") {
      if (loop === 7) return villagePeople.school;
      if (loop === 6) return villagePeople.nature;
      if (loop === 3) return villagePeople.business;
      if (loop === 5) return villagePeople.nature;
      return villagePeople.residential;
    }
    if (loop <= 4 && villagePeople[loc]) return villagePeople[loc];
    return peopleByName[roamingTeachers[loop]?.[loc]] || villagePeople.school;
  }
  for (const day of WEEK2_DATA.days) {
    const d = day.day;
    peopleAt[d] = {};
    roamingTeachers[d] = {};
    for (const [i, lesson] of day.lessons.entries()) {
      const visitor = ["Mina", "Saleha", "Muhammad Jan", "Edris", "Ms Hameed"][
        (d + i) % 5
      ];
      peopleAt[d][lesson.location] = [
        ...new Set([
          ...lesson.participants,
          visitor,
          ...(d === 14 && lesson.location === "residential"
            ? ["Ms Hameed"]
            : []),
        ]),
      ];
      roamingTeachers[d][lesson.location] = lesson.teacher;
    }
  }
  function displayPlace(loop, loc) {
    return loc === "library"
      ? "Library"
      : loc === "residential"
        ? progress.homeGranted
          ? "Your Home"
          : "Muhammad Jan’s Home"
        : loc === "nature"
          ? "The Lake"
          : zones[loc].name;
  }
  function dayCheckInReady(day) {
    return day <= 5 && completeRound(day) && !passedChallenge(day);
  }
  function placeAccessible(day, place) {
    if (place === "library") return true;
    if (!allowed(day)) return false;
    if (day >= 8)
      return (
        place === week2Days[day].opening ||
        !!progress.complete[`${day}-${week2Days[day].opening}`]
      );
    if (day === 2) {
      if (!progress.complete["2-school"]) return place === "school";
      if (place === "residential")
        return (
          !!progress.complete["2-business"] && !!progress.complete["2-nature"]
        );
    }
    if (day === 3) return !!progress.complete["3-nature"] || place === "nature";
    if (day === 4)
      return !!progress.complete["4-residential"] || place === "residential";
    if (day === 5) return !!progress.complete["5-school"] || place === "school";
    if (day === 6) return !!progress.complete["6-nature"] || place === "nature";
    if (day === 7)
      return !!progress.complete["7-business"] || place === "business";
    return true;
  }
  function navigatePlace(day, place) {
    if (place === "library") {
      openLibrary();
      return;
    }
    if (!allowed(day)) return;
    const finalLoc =
      day === 3 ? "business" : day === 5 ? "nature" : "residential";
    if (day !== 1 && dayCheckInReady(day) && place === finalLoc) {
      startChallenge(day);
      return;
    }
    if (placeAccessible(day, place)) begin(`${day}-${place}`);
  }
  function dayGuidance(day) {
    if (day >= 8) {
      const d = week2Days[day];
      return !progress.complete[`${day}-${d.opening}`]
        ? `Normal route: meet ${teacherFor(day, d.opening, "standard").name} at ${displayPlace(day, d.opening)} first, or skip directly to the final challenge.`
        : completeRound(day)
          ? `All four visits complete. ${d.challenge}`
          : "Visit the other three locations in any order, or take the final challenge now.";
    }
    if (day === 1)
      return completeRound(1)
        ? "🏡 All four visits complete. Muhammad Jan is ready for your check-in."
        : "🌿 Free roam: explore any location, or choose the Day 1 challenge now.";
    if (day === 2) {
      if (!progress.complete["2-school"])
        return "🏫 Normal route: start at school with Ms Hameed for S–O–V, or skip directly to the challenge.";
      if (!progress.complete["2-business"] || !progress.complete["2-nature"])
        return "🏪 🏞️ Visit Edris at the market and Saleha at the lake in either order.";
      return "🏡 Return home to Muhammad Jan for practice and the final check-in.";
    }
    if (day === 3) {
      if (!progress.complete["3-nature"])
        return "🏞️ Normal route: meet Saleha at the lake to learn زه (I), or skip to Edris’s dinner challenge.";
      return completeRound(3)
        ? "🏪 Edris is ready for the final dinner conversation."
        : "🌿 Practise “I” at home, school and market. Then return to Edris.";
    }
    if (day === 4) {
      if (!progress.complete["4-residential"])
        return "🏡 Normal route: start at home with Muhammad Jan to learn informal ته (you) and combine clauses with او (and). Or skip to his challenge immediately.";
      return completeRound(4)
        ? "🏡 Come home and have an informal end-of-day conversation with Muhammad Jan."
        : "🌿 Practise with Edris, Saleha and Ms Hameed in any order; use both “I” and informal “you” in compound sentences.";
    }
    if (day === 5) {
      if (!progress.complete["5-school"])
        return "🏫 Normal route: meet Ms Hameed at school first to learn respectful/plural تاسې. The lake gathering challenge is available immediately as a skip.";
      return completeRound(5)
        ? "🏞️ Everyone has gathered at the lake. Join the 15-part community conversation."
        : "🌿 Explore the village; familiar people are moving between locations. Practise addressing friends, elders and groups.";
    }
    if (day === 6)
      return !progress.complete["6-nature"]
        ? "Normal route: meet Saleha and Mina at the lake first, or skip straight to the Hills."
        : completeRound(6)
          ? "Your four visits are complete. Join Saleha and Mina in the Hills using the challenge button."
          : "Explore Home, Market and School in any order, then take the Hills challenge.";
    return !progress.complete["7-business"]
      ? "Normal route: meet Edris at the market first, or skip to Ms Hameed’s weekly exam."
      : completeRound(7)
        ? "All four visits complete. Take Ms Hameed’s separate weekly examination at School using the challenge button."
        : "Visit Home, Lake and School in any order; then take the weekly examination.";
  }
  function showParticipants(names, recipient = "") {
    const root = $("participants");
    root.replaceChildren();
    for (const name of [...new Set(names)]) {
      const person = peopleByName[name] || { name, face: "🧑" };
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
        (name === "Saleha"
          ? "Fellow student"
          : name === "Muhammad Jan"
            ? "Village elder"
            : name === "Ms Hameed"
              ? "Pashto teacher"
              : name === "Mina"
                ? "Saleha’s sister"
                : "Grocer") +
        (name === recipient ? " · Person you address" : "");
      body.append(strong, role);
      el.append(icon, body);
      root.append(el);
    }
  }
  function setDialogueSpeaker(name) {
    const person = peopleByName[name] || { name, face: "🧑" };
    $("speakerName").textContent = person.name + " · speaking";
    $("speakerIcon").textContent = person.face;
  }
  function setSpeaker(loop, loc, mode) {
    const person = teacherFor(loop, loc, mode);
    setDialogueSpeaker(person.name);
    showParticipants(
      mode === "challenge" && loop === 6
        ? ["Saleha", "Mina"]
        : mode === "challenge" && loop === 7
          ? ["Ms Hameed"]
          : mode === "challenge" && loop === 5
            ? ["Saleha", "Muhammad Jan", "Ms Hameed", "Edris"]
            : mode === "standard" && loop >= 5
              ? peopleAt[loop]?.[loc] || [person.name]
              : [person.name],
    );
    return person;
  }

  // @LIBRARY
  // @PROGRESSION
  function currentSave(p) {
    const object = (value) =>
      value && typeof value === "object" && !Array.isArray(value);
    if (
      !object(p) ||
      p.saveSchemaVersion !== SAVE_VERSION ||
      !Number.isFinite(p.xp) ||
      p.xp < 0
    )
      return false;
    if (
      !["rewards", "complete", "challenges", "personIntros"].every((key) =>
        object(p[key]),
      )
    )
      return false;
    if (
      !object(p.library) ||
      ![
        "units",
        "dayExposure",
        "plans",
        "acquired",
        "phrases",
        "grammar",
        "events",
      ].every((key) => object(p.library[key]))
    )
      return false;
    for (const [day, record] of Object.entries(p.challenges)) {
      if (
        !Number.isInteger(Number(day)) ||
        day < 1 ||
        day > 14 ||
        !object(record)
      )
        return false;
      const spec = getChallengeSpec(Number(day));
      if (
        !Number.isInteger(record.best) ||
        record.best < 0 ||
        record.best > spec.questionCount ||
        !Number.isInteger(record.attempts) ||
        record.attempts < 1 ||
        record.passed !== record.best >= spec.passCount
      )
        return false;
    }
    for (const [id, record] of Object.entries(p.library.acquired)) {
      const entry = libraryEntries[id];
      if (
        !entry ||
        !object(record.forms) ||
        !Array.isArray(record.encounteredFormIds) ||
        !Array.isArray(record.practisedFormIds)
      )
        return false;
      if (
        record.encounteredFormIds.some(
          (formId) => !entry.forms.some((f) => f.formId === formId),
        )
      )
        return false;
    }
    for (const plan of Object.values(p.library.plans)) {
      if (!object(plan.locationAssignments)) return false;
      if (
        Object.entries(plan.locationAssignments).some(
          ([district, ids]) =>
            !zoneKeys.includes(district) ||
            !Array.isArray(ids) ||
            ids.some((id) => !libraryEntries[id]),
        )
      )
        return false;
    }
    if (
      p.activeChallenge &&
      (!Array.isArray(p.activeChallenge.questions) ||
        p.activeChallenge.questions.some(
          (q) =>
            !["choice", "dialogue", "address"].includes(q.kind) &&
            !wordById[q.id],
        ))
    )
      return false;
    return true;
  }

  function load() {
    let raw;
    try {
      raw = localStorage.getItem(KEY);
    } catch (error) {
      return fresh();
    }
    if (!raw) return fresh();
    try {
      const p = JSON.parse(raw);
      if (!currentSave(p)) throw Error("Unsupported or invalid save schema");
      return p;
    } catch (error) {
      saveProblem =
        "This save belongs to an older or incompatible version. This release uses save format 4 and does not convert old saves. Your stored data has not been changed. Reset it explicitly to start this version.";
      return fresh();
    }
  }
  let progress = load(),
    session = null,
    selectedLoop = 1;
  function save() {
    if (saveProblem) return;
    captureLibraryChallenge();
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch (e) {}
  }
  function stat(id) {
    const f = LibraryEngine.cardStat(progress, LIBRARY_DATA, id);
    return {
      seen: f.totalAttempts || 0,
      correct: f.correctAttempts || 0,
      wrong: (f.totalAttempts || 0) - (f.correctAttempts || 0),
      stage: f.stage || 0,
      dueAt: f.srsDueAt || 0,
    };
  }

  function isDue(id) {
    let s = stat(id);
    return s.seen > 0 && (s.stage === 0 || s.dueAt <= Date.now());
  }
  function learned(id) {
    return stat(id).correct > 0;
  }
  function completeRound(number) {
    return zoneKeys.every((z) => progress.complete[`${number}-${z}`]);
  }
  function passedChallenge(day) {
    const record = progress.challenges[day];
    return (
      record?.passed === true && record.best >= getChallengeSpec(day).passCount
    );
  }
  function allowed(number) {
    return (
      Number.isInteger(number) &&
      number >= 1 &&
      number <= loops.length &&
      progress.tutorialDone &&
      (number === 1 || passedChallenge(number - 1)) &&
      (number < 8 ||
        (highestClearedDay(progress) === 7 &&
          characterStatus(progress).level === 10))
    );
  }
  function currentAvailable(w) {
    return w.loop === 0 ? progress.tutorialDone : allowed(w.loop);
  }
  function duePool() {
    const ids = [
      ...LibraryEngine.dueForms(progress, LIBRARY_DATA).map(
        (x) => "library-form:" + x.form.formId,
      ),
      ...Object.keys(progress.library.units).filter(
        (id) => isDue(id) && wordById[id] && currentAvailable(wordById[id]),
      ),
    ];
    return [...new Set(ids)].map((id) => wordById[id]);
  }
  let curriculumRandom = null;
  function shuffle(list) {
    let a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(
        (curriculumRandom ? curriculumRandom() : Math.random()) * (i + 1),
      );
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function hud() {
    const status = characterStatus(progress),
      within = status.xp % XP_STEP,
      percent = status.capped ? 100 : (within / XP_STEP) * 100;
    $("xpPill").textContent = `✦ ${status.xp} XP`;
    $("characterLevel").textContent = `Level ${status.level} · ${status.title}`;
    $("xpAmount").textContent =
      status.level === 10
        ? "Week 1 complete · extra XP banked"
        : status.capped
          ? `XP banked · pass Day ${status.cleared + 1}${status.cleared === 6 ? " weekly examination" : " challenge"} to advance`
          : `${within} / ${XP_STEP} XP`;
    $("xpFill").style.width = percent + "%";
    $("xpBar").setAttribute("aria-valuenow", String(percent));
    $("xpBar").setAttribute("aria-valuetext", $("xpAmount").textContent);
    const bankCount = LibraryEngine.summary(progress, LIBRARY_DATA);
    $("knownPill").textContent =
      `${bankCount.encountered} content lemmas encountered`;
    $("characterSubtitle").textContent =
      status.level === 10
        ? "Week 1 complete · New Resident"
        : progress.tutorialDone
          ? "Living in town · Day-by-day Pashto · Present tense."
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
      !progress.tutorialDone ||
        name === "worldScreen" ||
        name === "introScreen",
    );
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }
  function startWorld() {
    stopAudio();
    $("addressTarget").classList.add("hidden");
    if (!progress.tutorialDone) {
      hud();
      view("introScreen");
      return;
    }
    session = null;
    if (!allowed(selectedLoop))
      selectedLoop = loops.find((l) => allowed(l.id))?.id || 1;
    hud();
    renderWorld();
    view("worldScreen");
  }
  function renderSkipDayAction(day) {
    const passed = passedChallenge(day),
      done = completeRound(day);
    $("skipDayArea").classList.toggle("hidden", passed);
    if (passed) return;
    const who =
      day >= 8
        ? teacherFor(day, null, "challenge").name
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
    $("skipDayHeading").textContent = done
      ? `${who} is ready for the final challenge`
      : `Skip the Day ${day} location visits?`;
    $("skipDayHint").textContent =
      `${done ? "You completed the visits." : "You can skip the opening lesson and all visits."} Take the ${getChallengeSpec(day).questionCount}-question assessment now; ${getChallengeSpec(day).passCount} correct to pass. The normal story route remains available.`;
    $("skipDayBtn").textContent =
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
    const selected = loops.find((l) => l.id === selectedLoop);
    $("chapterButtons").replaceChildren();
    for (const l of loops) {
      const n = zoneKeys.filter(
        (z) => progress.complete[`${l.id}-${z}`],
      ).length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chapter" + (l.id === selectedLoop ? " selected" : "");
      b.disabled = !allowed(l.id);
      b.setAttribute("aria-pressed", String(l.id === selectedLoop));
      const heading = document.createElement("b");
      heading.textContent = `${allowed(l.id) ? l.icon : "🔒"} Day ${l.id}: ${l.label}`;
      const sub = document.createElement("small");
      sub.textContent = passedChallenge(l.id)
        ? "✓ Challenge passed"
        : allowed(l.id)
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
        selectedLoop = l.id;
        renderWorld();
      });
      $("chapterButtons").append(b);
    }
    let done = zoneKeys.filter(
      (z) => progress.complete[`${selectedLoop}-${z}`],
    ).length;
    $("chapterProgress").textContent = `Day ${selectedLoop} · ${done}/4 places`;
    $("chapterHint").textContent = selected.description;
    $("dayRoute").textContent = dayGuidance(selectedLoop);
    renderSkipDayAction(selectedLoop);
    $("roundInsight").textContent =
      selectedLoop <= 2
        ? `${selected.subtitle} · Pattern: ${selected.person}. Each visit has a local teacher, and Muhammad Jan checks your learning at the end of the day.`
        : selectedLoop === 3
          ? "Saleha introduces the first-person verb patterns at the lake. Use new and familiar words around the village; finish by shopping for dinner with Edris."
          : selectedLoop === 4
            ? "Muhammad Jan begins with informal ته and compound sentences. Practise around town, then have a familiar conversation with him at home."
            : selectedLoop === 5
              ? "Ms Hameed teaches the choice between ته and polite/plural تاسې. People gather at the lake for a multi-speaker challenge."
              : `${selected.subtitle} · Pattern: ${selected.person}. Optional visits teach new vocabulary and revisit older words. You can attempt the 15-question challenge immediately to ${selectedLoop === loops.length ? "complete your first week in town" : `begin Day ${selectedLoop + 1}`}.`;
    if (selectedLoop >= 6)
      $("roundInsight").textContent =
        selectedLoop === 6
          ? "Saleha introduces Mina and speaker-included موږ at the lake. Practise in town, then join the sisters in the Hills. Skip is available now."
          : "Edris introduces هغوی among market shoppers. The separate School exam revisits all seven days: 25 questions, 20 to pass.";
    if (selectedLoop >= 8) {
      $("chapterHint").textContent = week2Days[selectedLoop].intro;
      $("roundInsight").textContent =
        "Week 2 draft · Native Laghman review pending. Practise the new topic or skip to the dialogue challenge. Level 10 · New Resident is retained; further level milestones are not assigned.";
    }
    renderDayChallenge();
    $("placeCards").replaceChildren();
    for (const place of zoneKeys) {
      const zone = zones[place],
        id = `${selectedLoop}-${place}`,
        itemIds = courses[id] || [],
        n = itemIds.filter(learned).length,
        full = !!progress.complete[id];
      const accessible = placeAccessible(selectedLoop, place),
        checkin =
          selectedLoop !== 1 &&
          dayCheckInReady(selectedLoop) &&
          place ===
            (selectedLoop === 3
              ? "business"
              : selectedLoop === 5
                ? "nature"
                : "residential");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "place" + (checkin ? " checkin" : "");
      b.disabled = !accessible;
      const a = document.createElement("strong");
      a.textContent = `${zone.icon} ${displayPlace(selectedLoop, place)}`;
      const sub = document.createElement("small");
      sub.textContent =
        selectedLoop <= 4 ? villagePeople[place].description : zone.intro;
      const teacher = document.createElement("span");
      teacher.className = "teacher";
      {
        const who = teacherFor(selectedLoop, place, "standard");
        teacher.textContent = `${who.face} ${who.name}`;
        if (selectedLoop >= 5 && peopleAt[selectedLoop]?.[place]?.length > 1)
          teacher.textContent +=
            " · with " +
            peopleAt[selectedLoop][place]
              .filter((x) => x !== who.name)
              .join(", ");
      }
      const foot = document.createElement("span");
      foot.className = "progress";
      const lockedReason =
        selectedLoop === 2 && !accessible
          ? place === "residential"
            ? "After market and lake"
            : "Begin at school first"
          : selectedLoop === 3 && !accessible
            ? "Meet Saleha at the lake first"
            : selectedLoop === 4 && !accessible
              ? "Begin at home with Muhammad Jan"
              : selectedLoop === 5 && !accessible
                ? "Begin at school with Ms Hameed"
                : selectedLoop === 6 && !accessible
                  ? "Meet Saleha and Mina at the lake first"
                  : selectedLoop === 7 && !accessible
                    ? "Meet Edris at the market first"
                    : selectedLoop >= 8 && !accessible
                      ? `Begin at ${displayPlace(selectedLoop, week2Days[selectedLoop].opening)} first`
                      : "";
      foot.textContent = checkin
        ? selectedLoop === 3
          ? "🧺 Dinner with Edris · 15 questions"
          : selectedLoop === 5
            ? "🏞️ Town gathering · 15 questions"
            : "🏆 Final conversation · 15 questions"
        : lockedReason ||
          `${full ? "✓ Complete · " : ""}${n}/${itemIds.length} items`;
      b.append(a, sub, teacher, foot);
      b.addEventListener("click", () => navigatePlace(selectedLoop, place));
      $("placeCards").append(b);
      const marker = document.querySelector(".map-point." + place);
      marker.disabled = !accessible;
      marker.classList.toggle("done", full);
      marker.classList.toggle("checkin", checkin);
      marker.querySelector("b").textContent = displayPlace(selectedLoop, place);
      $("map-" + place).textContent = checkin
        ? selectedLoop === 3
          ? "🧺 Dinner quiz"
          : selectedLoop === 5
            ? "🏞️ Gathering"
            : "🏆 Conversation"
        : lockedReason || `${full ? "✓ " : ""}${n}/${itemIds.length}`;
    }
    const due = duePool().length;
    $("reviewBtn").disabled = due === 0;
    $("reviewBtn").textContent = `Memory Trail (${due} due)`;
    libraryUpdateWorld();
  }
  const townStories = {
    1: "Muhammad Jan welcomes you. Edris is at the market, Saleha is by the lake, and Ms Hameed is at school.",
    2: "Ms Hameed introduces S–O–V. Visit the market and lake before returning home to Muhammad Jan.",
    3: "Saleha shows you how to talk about yourself. Practise around town, then shop for dinner with Edris.",
    4: "Muhammad Jan welcomes you home to learn informal ته and link actions using او. Return for a friendly conversation at the end of the day.",
    5: "Ms Hameed teaches respectful/plural تاسې. The whole village is preparing to gather beside the lake. Characters can now visit different locations.",
    6: "Saleha introduces her sister Mina beside the lake. Practise shared actions around town, then walk together in the Hills.",
    7: "Edris describes groups of shoppers. Ms Hameed welcomes you to the separate 25-question Week 1 examination at School.",
  };
  function renderDayChallenge() {
    const day = selectedLoop,
      done = completeRound(day),
      passed = passedChallenge(day),
      record = progress.challenges[String(day)],
      spec = getChallengeSpec(day);
    const titles = {
      ...Object.fromEntries(WEEK2_DATA.days.map((d) => [d.day, d.title])),
      1: "Muhammad Jan’s Library home handover",
      2: "Muhammad Jan’s check-in",
      3: "Dinner shopping with Edris",
      4: "Conversation at home with Muhammad Jan",
      5: "Community at the lake",
      6: spec.title,
      7: spec.title,
    };
    $("challengeEyebrow").textContent =
      `DAY ${day} · ${day === 1 ? "LIBRARY · HOME HANDOVER" : day === 6 ? "HILLS STORY SCENE" : day === 7 ? "SCHOOL · WEEKLY EXAMINATION" : "DAILY CHECK-IN"}`;
    $("challengeTitle").textContent =
      `${passed ? "✓ " : ""}${titles[day]}${passed ? " · passed" : ""}`;
    $("challengeDescription").textContent =
      `${townStories[day] || week2Days[day]?.challenge} ${spec.questionCount} turns; ${spec.passCount} correct to pass. ${done ? "All four visits complete. Take the final assessment." : "Follow the normal route or skip straight to this assessment without completing visits."}`;
    $("startChallenge").disabled = !allowed(day);
    $("startChallenge").textContent = passed
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
    $("challengeRecord").textContent = record
      ? `Best: ${record.best}/${spec.questionCount} · ${passed ? "PASSED" : `Need ${spec.passCount} to pass`}`
      : `Pass mark: ${spec.passCount}/${spec.questionCount} · 80%`;
    $("townStory").querySelector("span").textContent =
      day === 3
        ? "🧑‍🌾"
        : day === 5
          ? "🏞️"
          : day === 6
            ? "⛰️"
            : day === 7
              ? "👩‍🏫"
              : "👴";
    $("townStory").querySelector("p").textContent =
      `Day ${day} — ${townStories[day] || week2Days[day]?.intro} ${passed ? "Challenge passed." : "The final challenge is available from the beginning of the day."}`;
  }
  function sampleUnique(items, count, used = new Set()) {
    const pool = shuffle(items.filter((x) => !used.has(x)));
    const taken = pool.slice(0, count);
    taken.forEach((id) => used.add(id));
    return taken;
  }
  function makeContextQuestion(
    id,
    kind,
    direction,
    speaker,
    recipient,
    comment,
  ) {
    return { id, kind, direction, speaker, recipient, comment };
  }
  function choiceQuestion(
    id,
    prompt,
    correct,
    options,
    speaker = "Saleha",
    recipient = "Player",
    extra = {},
  ) {
    return {
      id,
      kind: "choice",
      direction: "en-ps",
      prompt,
      correct,
      options,
      speaker,
      recipient,
      ...extra,
    };
  }
  function authoredQuestion(id, kind, speaker, recipient, comment, section) {
    return {
      ...makeContextQuestion(
        id,
        kind,
        kind === "construct" ? "en-ps" : "ps-en",
        speaker,
        recipient,
        comment,
      ),
      section,
    };
  }
  function week1Questions(day) {
    const people = ["Saleha", "Mina"];
    if (day === 6)
      return [
        choiceQuestion(
          "hills-we",
          "Saleha asks you: Which pronoun describes a group including the person speaking?",
          "موږ",
          ["موږ", "تاسې", "زه", "ته"],
        ),
        choiceQuestion(
          "hills-together",
          "Mina asks you: What does یو ځای mean?",
          "Together",
          ["Together", "Alone", "A book", "Water"],
          "Mina",
        ),
        choiceQuestion(
          "hills-river",
          "Saleha points to the river: choose سیند in English.",
          "River",
          ["River", "School", "Bread", "Room"],
        ),
        choiceQuestion(
          "hills-you",
          "Mina asks you: Which pronoun addresses both sisters without including you?",
          "تاسې",
          ["تاسې", "موږ", "زه", "ته"],
          "Mina",
        ),
        choiceQuestion(
          "hills-run",
          "Saleha asks you: What does منډې وهل mean?",
          "To run",
          ["To run", "To read", "To buy", "To write"],
        ),
        choiceQuestion(
          "hills-transform",
          "Saleha models زه منډې وهم (I run). Choose “We run together”.",
          "موږ یو ځای منډې وهو.",
          [
            "موږ یو ځای منډې وهو.",
            "زه منډې وهم.",
            "تاسې منډې وهئ.",
            "ته منډې وهې.",
          ],
        ),
        choiceQuestion(
          "hills-subject",
          "Mina invites you to describe yourself: “Mina and I walk together.” Who is included?",
          "The player and Mina",
          [
            "The player and Mina",
            "Only Mina",
            "Only Saleha",
            "The two sisters without the player",
          ],
          "Mina",
        ),
        choiceQuestion(
          "hills-birds",
          "Saleha asks you: Choose “We see two birds” (speaker included).",
          "موږ دوه مرغان وینو.",
          [
            "موږ دوه مرغان وینو.",
            "تاسې دوه مرغان وینئ.",
            "زه دوه مرغان وینم.",
            "ته دوه مرغان وینې.",
          ],
        ),
        authoredQuestion(
          "w6-river-water",
          "sentence",
          "Mina",
          "Player",
          "Mina asks you to recognise a shared action. “We” includes the person speaking.",
          "meaning",
        ),
        choiceQuestion(
          "hills-carry",
          "You tell Saleha and Mina: تاسې دواړه اوبه وړئ. Who carries the water?",
          "Saleha and Mina, whom you address",
          [
            "Saleha and Mina, whom you address",
            "You alone",
            "You and Mina",
            "Muhammad Jan",
          ],
          "Saleha",
          "Saleha and Mina",
        ),
        authoredQuestion(
          "w6-walk",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks you to describe walking with both sisters.",
          "build",
        ),
        authoredQuestion(
          "w6-mina-village",
          "construct",
          "Mina",
          "Saleha",
          "Mina asks for your response about yourself and Mina; “I” is the player, not Mina.",
          "build",
        ),
        authoredQuestion(
          "w6-you-water",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks you to address both sisters, excluding yourself.",
          "build",
        ),
        authoredQuestion(
          "w6-bag",
          "construct",
          "Mina",
          "Mina",
          "Mina asks you to describe your shared task.",
          "build",
        ),
        authoredQuestion(
          "w6-compound",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks for two clauses. Vocabulary help: غونډۍ means hills.",
          "build",
        ),
      ].map((q) => ({
        ...q,
        audioId: {
          "hills-we": "w6-we",
          "hills-together": "w6-together",
          "hills-you": "w6-you-all",
          "hills-run": "w6-run",
          "hills-transform": "w6-we-run",
          "hills-birds": "w6-river-birds",
          "hills-carry": "w6-you-carry",
        }[q.id],
        participants: people,
        day: 6,
        location: "hills",
      }));
    const pronouns = [
      [
        "we",
        "You describe yourself and Mina. Choose the pronoun for your group.",
        "موږ",
        "Mina",
      ],
      ["friend", "You address Saleha, one familiar friend.", "ته", "Saleha"],
      ["respect", "You address Ms Hameed respectfully.", "تاسې", "Ms Hameed"],
      [
        "group",
        "You address Saleha and Mina together.",
        "تاسې",
        "Saleha and Mina",
      ],
      [
        "they",
        "You describe customers elsewhere in the market, excluding yourself.",
        "هغوی",
        "Edris",
      ],
    ].map(([id, prompt, correct, recipient]) =>
      choiceQuestion(
        "exam-pronoun-" + id,
        prompt,
        correct,
        ["موږ", "ته", "تاسې", "هغوی"],
        "Ms Hameed",
        recipient,
        { section: "pronouns" },
      ),
    );
    const verbs = [
      [
        "i",
        "I read a book: زه کتاب ___.",
        "لولم",
        ["لولم", "لولې", "لولو", "لولي"],
        "Player",
      ],
      [
        "you",
        "You, Saleha, read a book: ته کتاب ___.",
        "لولې",
        ["لولې", "لولم", "لولو", "لولي"],
        "Saleha",
      ],
      [
        "we",
        "We read books: موږ کتابونه ___.",
        "لولو",
        ["لولو", "لولم", "لولي", "لولئ"],
        "Ms Hameed",
      ],
      [
        "all",
        "You all read books: تاسې کتابونه ___.",
        "لولئ",
        ["لولئ", "لولو", "لولم", "لولي"],
        "Saleha and Mina",
      ],
      [
        "they",
        "They, the other students, read books: هغوی کتابونه ___.",
        "لولي",
        ["لولي", "لولو", "لولم", "لولئ"],
        "Player",
      ],
    ].map(([id, prompt, correct, options, recipient]) =>
      choiceQuestion(
        "exam-verb-" + id,
        prompt,
        correct,
        options,
        "Ms Hameed",
        recipient,
        { section: "verbs" },
      ),
    );
    const sov = [
      "w7-he-bread",
      "s1-water",
      "w6-river-birds",
      "w7-market-baskets",
      "w7-you-open",
    ].map((id, i) =>
      authoredQuestion(
        id,
        "construct",
        "Ms Hameed",
        i === 4 ? "Saleha" : "Ms Hameed",
        "Ms Hameed asks you to build a subject–object–verb sentence. The response is yours.",
        "sov",
      ),
    );
    const compound = [
      "w7-compound-room",
      "w7-compound-read",
      "w7-compound-buy",
      "w7-compound-books",
      "w7-compound-door",
    ].map((id, i) =>
      authoredQuestion(
        id,
        "construct",
        "Ms Hameed",
        i < 2 ? "Saleha" : i === 3 ? "Saleha and Mina" : "Ms Hameed",
        "Ms Hameed asks you to join two present-tense clauses with او.",
        "compounds",
      ),
    );
    const dialogue = [
      [
        "w6-we-run",
        "Mina invites you to join the group. Reply “We run together”.",
        "Mina",
      ],
      [
        "w7-you-bird",
        "You address Saleha alone: “You see the bird”.",
        "Saleha",
      ],
      [
        "w7-polite-tea",
        "You respectfully address Muhammad Jan: “You drink tea”.",
        "Muhammad Jan",
      ],
      [
        "w6-river-you-walk",
        "You address both sisters: “You both walk beside the river”.",
        "Saleha and Mina",
      ],
      [
        "w7-market-apples",
        "Edris points to the fruit customers. Tell him “They buy apples”.",
        "Edris",
      ],
    ].map(([id, prompt, recipient]) => {
      const w = wordById[id];
      return choiceQuestion(
        "exam-dialogue-" + id,
        prompt,
        w.ps,
        makeAuthoredOptions(id),
        "Ms Hameed",
        recipient,
        {
          section: "dialogue",
          audioId: id,
          comment:
            "Ms Hameed presents this scenario; the player supplies the quoted response.",
        },
      );
    });
    return [...pronouns, ...verbs, ...sov, ...compound, ...dialogue].map(
      (q) => ({
        ...q,
        day: 7,
        location: "school",
        participants: [
          "Ms Hameed",
          ...(peopleByName[q.recipient] ? [q.recipient] : []),
        ],
      }),
    );
  }
  function makeAuthoredOptions(id) {
    const alternatives = {
      "w6-we-run": ["زه منډې وهم.", "تاسې منډې وهئ.", "هغوی منډې وهي."],
      "w7-you-bird": ["زه مرغۍ وینم.", "موږ مرغۍ وینو.", "هغوی مرغۍ ویني."],
      "w7-polite-tea": ["ته چای څښې.", "زه چای څښم.", "موږ چای څښو."],
      "w6-river-you-walk": [
        "موږ د سیند تر څنګ ګرځو.",
        "زه د سیند تر څنګ ګرځم.",
        "هغوی د سیند تر څنګ ګرځي.",
      ],
      "w7-market-apples": ["موږ مڼې اخلو.", "زه مڼې اخلم.", "تاسې مڼې اخلئ."],
    };
    return [wordById[id].ps, ...alternatives[id]];
  }
  function showChallengeScene(day) {
    let panel = $("challengeScene");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "challengeScene";
      $("lessonScreen").insertBefore(panel, $("participants"));
    }
    panel.replaceChildren();
    panel.classList.toggle("hidden", day < 6 && day !== 1);
    if (day === 1) {
      panel.append(
        libraryNode("p", "LIBRARY · MUHAMMAD JAN’S HOME HANDOVER", "eyebrow"),
        libraryNode(
          "p",
          progress.homeGranted
            ? "Your home award is already recorded. Replays do not award it again."
            : "Muhammad Jan → Player: Show me what you remember. Twelve correct answers out of fifteen, and I will give you the key to your own home.",
        ),
      );
      return;
    }
    if (day < 6) return;
    if (day >= 8) {
      const intro = document.createElement("p");
      intro.className = "tiny";
      intro.textContent = `Week 2 draft · Native Laghman review pending. ${week2Days[day].challenge}`;
      panel.append(intro);
      return;
    }
    const title = document.createElement("p");
    title.className = "eyebrow";
    title.textContent =
      day === 6
        ? "HILLS · WALK WITH SALEHA AND MINA"
        : "SCHOOL · WEEK 1 EXAMINATION";
    panel.append(title);
    if (day === 6) {
      const art = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      art.setAttribute("viewBox", "0 0 600 120");
      art.setAttribute("role", "img");
      art.setAttribute(
        "aria-label",
        "Saleha, Mina and the player walk in the hills above the village",
      );
      art.style.width = "100%";
      art.style.maxHeight = "120px";
      art.innerHTML =
        '<rect width="600" height="120" fill="#294358"/><path d="M0 110 L140 15 L300 110 L440 20 L600 110Z" fill="#62856c"/><path d="M0 120 L220 35 L400 120 L550 60 L600 120Z" fill="#405b47"/><text x="230" y="100" font-size="28">🧑 👩‍🎓 👧</text>';
      panel.append(art);
    }
    const text = document.createElement("p");
    text.textContent =
      day === 6
        ? "Saleha → Player: “Mina and I welcome you on our walk. When you join our group, say موږ — we.” Mina → Player: “Address Saleha and me as تاسې — you both.”"
        : "Ms Hameed → Player: “This examination checks your first seven days: descriptions, pronouns, verb forms, sentence order, compounds and respectful conversations. Twenty correct answers out of twenty-five completes Week 1.”";
    panel.append(text);
  }

  function specialDayChallenge(day) {
    if (day === 4) {
      // Muhammad Jan is an elder; informal "you" prompts address a friend, not Muhammad Jan.
      return [
        ...[
          "n-chair4",
          "n-basket4",
          "n-sentence4",
          "v-give",
          "n-question4",
        ].map((id, i) =>
          makeContextQuestion(
            id,
            "word",
            i % 2 ? "en-ps" : "ps-en",
            "Muhammad Jan",
            "Muhammad Jan",
            "Muhammad Jan reviews objects and actions you have met today.",
          ),
        ),
        ...[
          "s4-house-room",
          "s4-market-mixed",
          "s4-river-bird",
          "s4-school-words",
          "s4-house-tea",
        ].map((id, i) =>
          makeContextQuestion(
            id,
            "sentence",
            i % 2 ? "en-ps" : "ps-en",
            "Muhammad Jan",
            "Saleha",
            "Describe what you and your friend Saleha do, using informal “you” for Saleha.",
          ),
        ),
        ...[
          "s4-house-compound",
          "s4-house-window",
          "s4-market-mixed2",
          "s4-river-water",
          "s4-school-learn",
        ].map((id) =>
          makeContextQuestion(
            id,
            "construct",
            "en-ps",
            "Muhammad Jan",
            "Saleha",
            "Build both clauses. The “you” in the example addresses your familiar friend, not Muhammad Jan.",
          ),
        ),
      ];
    }
    if (day === 5) {
      const address = [
        {
          speaker: "Saleha",
          recipient: "Saleha",
          scope: "friend",
          correct: "ته",
          comment:
            "You are speaking to Saleha, a familiar student. Choose the informal singular pronoun.",
        },
        {
          speaker: "Saleha",
          recipient: "Muhammad Jan",
          scope: "elder",
          correct: "تاسې",
          comment:
            "Saleha invites you to greet Muhammad Jan, an older respected village leader.",
        },
        {
          speaker: "Ms Hameed",
          recipient: "a familiar classmate",
          scope: "friend",
          correct: "ته",
          comment:
            "Ms Hameed invites you to speak to another young classmate you know well. Choose informal singular.",
        },
        {
          speaker: "Muhammad Jan",
          recipient: "Edris",
          scope: "adult",
          correct: "تاسې",
          comment: "Muhammad Jan asks you to address Edris respectfully.",
        },
        {
          speaker: "Ms Hameed",
          recipient: "Saleha and Edris together",
          scope: "group",
          correct: "تاسې",
          comment:
            "Ms Hameed asks you to address two people together: plural “you”.",
        },
      ].map((a, i) => ({
        id: "address5-" + i,
        kind: "address",
        direction: "en-ps",
        ...a,
      }));
      const meanings = [
        makeContextQuestion(
          "s2-read",
          "sentence",
          "ps-en",
          "Saleha",
          "Saleha",
          "Recall how friends use informal ته.",
        ),
        makeContextQuestion(
          "s5-read",
          "sentence",
          "en-ps",
          "Ms Hameed",
          "Ms Hameed",
          "Show respect when addressing your teacher.",
        ),
        makeContextQuestion(
          "s5-home-tea",
          "sentence",
          "ps-en",
          "Saleha",
          "Muhammad Jan",
          "Speak politely about tea with an elder.",
        ),
        makeContextQuestion(
          "s5-market-bread",
          "sentence",
          "en-ps",
          "Saleha",
          "Edris",
          "Use polite “you” when talking to the grocer.",
        ),
        makeContextQuestion(
          "s5-lake-fish",
          "sentence",
          "ps-en",
          "Muhammad Jan",
          "Saleha and Edris together",
          "Address the two people together, using plural “you”.",
        ),
      ];
      const builds = [
        makeContextQuestion(
          "s4-river-fish",
          "construct",
          "en-ps",
          "Saleha",
          "Saleha",
          "Speak informally with your friend Saleha.",
        ),
        makeContextQuestion(
          "s5-school-pashto",
          "construct",
          "en-ps",
          "Ms Hameed",
          "Ms Hameed and other teachers",
          "Use plural “you” for a group.",
        ),
        makeContextQuestion(
          "s5-market-fruit",
          "construct",
          "en-ps",
          "Saleha",
          "Edris",
          "Politely address the shopkeeper.",
        ),
        makeContextQuestion(
          "s5-lake-water",
          "construct",
          "en-ps",
          "Edris",
          "the gathered villagers",
          "Speak to everyone together in the plural.",
        ),
        makeContextQuestion(
          "s5-home-compare",
          "construct",
          "en-ps",
          "Muhammad Jan",
          "Muhammad Jan",
          "Speak respectfully to the village elder and use “I” in the second clause.",
        ),
      ];
      return [...address, ...meanings, ...builds];
    }
    return null;
  }
  function selectWeek2Challenge(day) {
    const plan = week2Days[day],
      spec = getChallengeSpec(day),
      questions = plan.dialogues.map((q) => ({
        ...q,
        comment: q.context,
        location: spec.scene,
      }));
    const usedPs = new Set(
        questions.map((q) => normalizePashtoResponse(q.answerPs)),
      ),
      usedIds = new Set(questions.map((q) => q.id));
    const cards = Array.from({ length: 5 }, (_, i) =>
      plan.lessons.map((l) => l.cards[i]),
    ).flat();
    let wordIndex = 0,
      cardIndex = 0,
      kindIndex = 0;
    while (questions.length < spec.questionCount) {
      const kind = ["word", "sentence", "construct"][kindIndex++ % 3];
      if (kind === "word" && wordIndex < plan.vocabulary.length) {
        const w = plan.vocabulary[wordIndex++];
        questions.push({
          id: w.id,
          kind: "word",
          direction: wordIndex % 2 ? "ps-en" : "en-ps",
          speaker: teacherFor(day, null, "challenge").name,
          recipient: teacherFor(day, null, "challenge").name,
          comment: "Recall this word from the week’s topic.",
          participants: [teacherFor(day, null, "challenge").name],
        });
        continue;
      }
      let card;
      while (cardIndex < cards.length) {
        const candidate = cards[cardIndex++];
        if (
          !usedPs.has(normalizePashtoResponse(candidate.pashto)) &&
          !usedIds.has(candidate.id)
        ) {
          card = candidate;
          break;
        }
      }
      if (!card)
        throw Error("Insufficient distinct Week 2 content for Day " + day);
      usedIds.add(card.id);
      usedPs.add(normalizePashtoResponse(card.pashto));
      questions.push({
        id: card.id,
        kind: kind === "construct" ? "construct" : "sentence",
        direction: kind === "construct" ? "en-ps" : "ps-en",
        duds: kind === "construct" ? card.duds : undefined,
        speaker: teacherFor(day, null, "challenge").name,
        recipient: teacherFor(day, null, "challenge").name,
        participants: [teacherFor(day, null, "challenge").name],
        comment: `Study example spoken by ${card.speaker}, addressed to ${card.recipient}. ${card.note}`,
      });
    }
    if (
      questions.length !== spec.questionCount ||
      new Set(questions.map((q) => q.id)).size !== questions.length
    )
      throw Error("Invalid Week 2 challenge");
    for (const q of questions)
      if (questionUsesDudsForDay(q, day))
        getAnswerTiles(
          q.kind === "dialogue" ? q.answerPs : wordById[q.id].ps,
          q.duds,
        );
    return questions;
  }
  function questionUsesDudsForDay(q, day) {
    return (
      q.kind === "dialogue" ||
      (q.kind === "construct" && day >= 8 && Array.isArray(q.duds))
    );
  }
  function showWeek2Grammar() {
    const plan = week2Days[session.loop],
      teacher = teacherFor(session.loop, session.loc, "standard");
    $("sovPanel").classList.remove("hidden");
    $("sovDiagram").classList.add("hidden");
    if ($("openingPractice")) $("openingPractice").classList.add("hidden");
    setDialogueSpeaker(teacher.name);
    showParticipants(peopleAt[session.loop][session.loc]);
    $("sovStep").textContent = `DAY ${session.loop} · ${teacher.name} → Player`;
    $("sovTitle").textContent = plan.topic;
    const root = $("sovExplanation");
    root.replaceChildren();
    for (const text of [
      plan.intro,
      ...plan.grammar,
      "Model phrases (draft; local review pending):",
    ]) {
      const row = document.createElement("span");
      row.style.display = "block";
      renderMixedPashto(row, text);
      root.append(row);
    }
    for (const [ps, en] of plan.models) {
      const row = document.createElement("span");
      row.style.display = "block";
      renderMixedPashto(row, `${ps} — ${en}`);
      root.append(row);
    }
    $("guideMessage").textContent = `${teacher.name} → Player: ${plan.intro}`;
    $("addressTarget").textContent =
      `${teacher.name} → Player · Normal-route opening and practice`;
    $("addressTarget").classList.remove("hidden");
    $("sovNext").disabled = false;
    $("sovNext").textContent = "Continue to vocabulary and sentences →";
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

  function selectAuthoredChallenge(day) {
    if (day >= 8) return selectWeek2Challenge(day);
    if (day >= 6) {
      const q = week1Questions(day);
      if (
        q.length !== getChallengeSpec(day).questionCount ||
        q.some(
          (x) =>
            !x.speaker ||
            !x.recipient ||
            (x.kind !== "choice" && !wordById[x.id]),
        )
      )
        throw Error("Invalid authored Week 1 assessment");
      return q;
    }
    if (day === 4 || day === 5) {
      const questions = specialDayChallenge(day);
      if (
        questions.length !== getChallengeSpec(day).questionCount ||
        questions.some((q) => q.kind !== "address" && !wordById[q.id])
      )
        throw Error("Invalid Day " + day + " narrative questions");
      return questions;
    }
    if (day === 3) {
      const wordIds = ["n-apple", "n-potato3", "n-onion3", "v-buy", "v-want3"];
      const meaningIds = [
        "s1-buy",
        "s1-onions",
        "s1-price",
        "s3-fresh",
        "s3-eat",
      ];
      const buildIds = [
        "s1-potatoes",
        "s1-bread-buy",
        "s1-eat",
        "s1-bag",
        "s1-water",
      ];
      const qs = [
        ...wordIds.map((id, i) => ({
          id,
          kind: "word",
          direction: i % 2 ? "en-ps" : "ps-en",
        })),
        ...meaningIds.map((id, i) => ({
          id,
          kind: "sentence",
          direction: i % 2 ? "en-ps" : "ps-en",
        })),
        ...buildIds.map((id) => ({
          id,
          kind: "construct",
          direction: "en-ps",
        })),
      ];
      if (
        qs.length !== getChallengeSpec(day).questionCount ||
        qs.some((q) => !wordById[q.id] || wordById[q.id].loop > day)
      )
        throw Error("Invalid dinner conversation questions");
      return qs;
    }
    const current = zoneKeys.flatMap((z) => courses[`${day}-${z}`] || []);
    const historical = zoneKeys.flatMap((z) =>
      Array.from(
        { length: day - 1 },
        (_, i) => courses[`${i + 1}-${z}`] || [],
      ).flat(),
    );
    const lexical = (id) => wordById[id]?.type !== "sentence",
      sentence = (id) => wordById[id]?.type === "sentence";
    const questionSet = [];
    // A guaranteed visit to each location, and an earlier-day recall as soon as one is available.
    const pickFour = (filter, used) =>
      zoneKeys
        .map(
          (z) =>
            sampleUnique(
              (courses[`${day}-${z}`] || []).filter(filter),
              1,
              used,
            )[0],
        )
        .filter(Boolean);
    const wordUsed = new Set(),
      sentenceUsed = new Set();
    let vocab = pickFour(lexical, wordUsed);
    let extras =
      day > 1 ? sampleUnique(historical.filter(lexical), 1, wordUsed) : [];
    if (!extras.length)
      extras = sampleUnique(current.filter(lexical), 1, wordUsed);
    vocab.push(...extras);
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: vocab[i],
        kind: "word",
        direction: i % 2 === 0 ? "ps-en" : "en-ps",
      });
    let meanings = pickFour(sentence, sentenceUsed);
    let extraMeaning =
      day > 1 ? sampleUnique(historical.filter(sentence), 1, sentenceUsed) : [];
    if (!extraMeaning.length)
      extraMeaning = sampleUnique(current.filter(sentence), 1, sentenceUsed);
    meanings.push(...extraMeaning);
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: meanings[i],
        kind: "sentence",
        direction: i % 2 === 0 ? "ps-en" : "en-ps",
      });
    const buildUsed = new Set();
    let builds = pickFour(sentence, buildUsed);
    let extraBuild =
      day > 1 ? sampleUnique(historical.filter(sentence), 1, buildUsed) : [];
    if (!extraBuild.length)
      extraBuild = sampleUnique(current.filter(sentence), 1, buildUsed);
    builds.push(...extraBuild);
    // Day 1 can repeat a meaning prompt as a construction prompt: the tasks are different.
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: builds[i],
        kind: "construct",
        direction: "en-ps",
      });
    if (
      questionSet.length !== getChallengeSpec(day).questionCount ||
      questionSet.some((x) => !wordById[x.id])
    )
      throw Error("Unexpected number of available questions for Day " + day);
    return shuffle(questionSet);
  }
  function selectChallenge(day) {
    const saved = progress.library?.plans[day]?.challengeQuestions;
    if (saved) return saved.map((q) => ({ ...q }));
    const plan = LibraryEngine.ensurePlan(progress, LIBRARY_DATA, day),
      previousRandom = curriculumRandom;
    let seed = plan.seed + day * 7919;
    curriculumRandom = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    let result;
    try {
      result = libraryChallengeQuestions(day, selectAuthoredChallenge(day));
    } finally {
      curriculumRandom = previousRandom;
    }
    progress.library.plans[day].challengeQuestions = result.map((q) => ({
      ...q,
    }));
    save();
    return result;
  }
  function startChallenge(day, restoring = false) {
    if (!allowed(day)) return;
    stopAudio();
    const questions = selectChallenge(day),
      spec = getChallengeSpec(day);
    session = {
      id: `challenge-${day}`,
      mode: "challenge",
      loc: null,
      loop: day,
      questions,
      index: 0,
      correctCount: 0,
      answered: 0,
      earned: 0,
      built: [],
      locked: false,
      initialLevel: characterStatus(progress).level,
    };
    session.attemptId = restoring
      ? progress.activeChallenge?.attemptId
      : ++progress.library.attemptSequence;
    $("lessonEyebrow").textContent =
      day === 3
        ? "DAY 3 · DINNER AT MARKET"
        : day === 4
          ? "DAY 4 · CONVERSATION AT HOME"
          : day === 5
            ? "DAY 5 · COMMUNITY GATHERING AT LAKE"
            : `DAY ${day} · CHALLENGE`;
    $("lessonName").textContent =
      day <= 2
        ? `Muhammad Jan's check-in`
        : day === 3
          ? "Dinner with Edris"
          : day === 4
            ? "An evening with Muhammad Jan"
            : day === 5
              ? "A lakeside community gathering"
              : "Town Challenge";
    $("lessonDescription").textContent =
      `${questions.length} turns · ${day === 5 ? "5 address choices" : "5 words"} · 5 sentence recalls · 5 sentence builds · ${spec.passCount}/${questions.length} to pass`;
    $("lessonIcon").textContent =
      day === 3 ? "🧺" : day === 4 ? "🏡" : day === 5 ? "🏞️" : "🏆";
    setSpeaker(
      day,
      day === 3 ? "business" : day === 5 ? "nature" : "residential",
      "challenge",
    );
    $("guideMessage").textContent =
      day <= 2
        ? "Welcome home! Let us check what you know. You may take the challenge without visiting the other locations. Twelve correct answers unlock tomorrow."
        : day === 3
          ? "Salaam! It is nearly dinnertime. Let us shop for dinner and practise fifteen useful sentences."
          : day === 4
            ? "Come in and sit down. We have talked as friends all day. Let us practise what YOU and I do, and join two clauses using او. When I say “you” informally, I am addressing you; when you do, you are addressing a familiar friend, not an elder."
            : day === 5
              ? "Welcome to our gathering near the lake! Saleha, Edris, Ms Hameed and Muhammad Jan are all here. Listen to the speaker, look carefully at whom you are addressing, and choose informal ته or polite/plural تاسې."
              : `Welcome to Day ${day}! You need twelve correct answers to advance.`;
    if (day >= 6) {
      session.challengeScene = spec.scene;
      $("lessonEyebrow").textContent =
        day === 6 ? "DAY 6 · HILLS" : "DAY 7 · SCHOOL · WEEKLY EXAMINATION";
      $("lessonName").textContent = spec.title;
      $("lessonDescription").textContent =
        `${questions.length} turns · ${spec.passCount}/${questions.length} to pass${day === 7 ? " · 5 pronouns · 5 verb forms · 5 SOV · 5 compounds · 5 dialogues" : ""}`;
      $("lessonIcon").textContent = day === 6 ? "⛰️" : "🏫";
    }
    if (day >= 8) {
      $("lessonIcon").textContent = zones[spec.scene].icon;
      $("lessonEyebrow").textContent = `DAY ${day} · WEEK 2 DRAFT`;
      $("lessonDescription").textContent =
        `${questions.length} turns · ${spec.passCount}/${questions.length} to pass · Reply to questions and leave dud tiles unused`;
      setSpeaker(day, spec.scene, "challenge");
    }
    if (day === 1) {
      session.challengeScene = "library";
      $("lessonEyebrow").textContent = "DAY 1 · LIBRARY · HOME HANDOVER";
      $("lessonName").textContent = "Muhammad Jan’s Library conversation";
      $("guideMessage").textContent = progress.homeGranted
        ? "Welcome back to the Library. Your home award is already recorded."
        : "Muhammad Jan → Player: Welcome to the Library. Twelve correct answers and I will give you the key to your home. You can take this challenge without any teaching visits.";
    }
    $("lessonScreen").dataset.week = day >= 8 ? "2" : "1";
    $("lessonScreen").dataset.day = String(day);
    showChallengeScene(day);
    hud();
    view("lessonScreen");
    renderPhase();
  }
  function makeChallengeChoices(w, direction) {
    const current = direction === "ps-en" ? w.en : w.ps;
    let peers = [
      ...words,
      ...Object.values(wordById).filter((x) =>
        x.id.startsWith("library-card:"),
      ),
    ].filter(
      (x) =>
        x.id !== w.id &&
        x.type === w.type &&
        x.loop <= session.loop &&
        x[direction === "ps-en" ? "en" : "ps"] !== current,
    );
    if (w.type === "sentence")
      peers.sort(
        (a, b) => Number(b.loop === w.loop) - Number(a.loop === w.loop),
      );
    else peers = shuffle(peers);
    const options = [
      ...new Set(peers.map((x) => (direction === "ps-en" ? x.en : x.ps))),
    ].slice(0, 3);
    while (options.length < 3)
      options.push(
        "— " +
          ["None of these", "A different answer", "Another expression"][
            options.length
          ] +
          " —",
      );
    return shuffle([current, ...options]);
  }
  // These two written variants preserve person/number; do not normalize verb endings.
  function normalizeAnswer(value) {
    return value
      .normalize("NFC")
      .replace(/[.!؟،]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (w === "مونږ" ? "موږ" : w === "تاسو" ? "تاسې" : w))
      .join(" ");
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
  function normalizePashtoResponse(value) {
    return String(value || "")
      .normalize("NFC")
      .replace(/[.!؟،\u200c]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function getAnswerTiles(answerPs, duds) {
    const answer = normalizePashtoResponse(answerPs).split(" ").filter(Boolean);
    const extras = (duds || []).map((x) => String(x).trim()).filter(Boolean);
    if (!answer.length) throw Error("Empty dialogue answer");
    if (extras.length < 2)
      throw Error("Week 2 tile puzzle requires at least two dud tiles");
    if (
      extras.some((x) => x.includes(" ") || answer.includes(x)) ||
      new Set(extras).size !== extras.length
    )
      throw Error(
        "Dud tiles must be unique single words not present in the target answer",
      );
    return [...answer, ...extras].map((word, index) => ({
      word,
      index,
      dud: index >= answer.length,
    }));
  }
  function getDialogueTiles(q) {
    if (!q || q.kind !== "dialogue")
      throw Error("A dialogue question is required");
    if (!q.answerPs || !q.promptPs)
      throw Error("Dialogue requires promptPs and answerPs");
    return getAnswerTiles(q.answerPs, q.duds);
  }
  function questionUsesDuds(q) {
    return (
      q?.kind === "dialogue" ||
      (q?.kind === "construct" &&
        session?.loop >= 8 &&
        Array.isArray(q.duds) &&
        q.duds.length > 0)
    );
  }
  function isDialogueAnswerCorrect(q, value) {
    const valid = [q.answerPs, ...(q.acceptedPs || [])];
    return valid.some(
      (v) => normalizePashtoResponse(v) === normalizePashtoResponse(value),
    );
  }

  function buildTiles(w, q = session?.questions?.[session.index]) {
    if (q?.kind === "dialogue") return getDialogueTiles(q);
    if (questionUsesDuds(q)) return getAnswerTiles(w.ps, q.duds);
    return w.ps
      .replace(/[.!؟،]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word, i) => ({ word, index: i }));
  }
  function renderBuiltSentence() {
    if (session?.mode !== "challenge") return;
    const q = session.questions[session.index];
    if (!q || !["construct", "dialogue"].includes(q.kind)) return;
    const target = buildTiles(wordById[q.id] || null, q);
    const area = $("builtSentence"),
      bank = $("wordTiles");
    area.replaceChildren();
    bank.replaceChildren();
    if (!session.built.length) {
      const hint = document.createElement("span");
      hint.className = "build-placeholder";
      hint.textContent = "Tap the Pashto tiles below…";
      area.append(hint);
    }
    session.built.forEach((idx, pos) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "built-token";
      b.lang = "ps";
      b.textContent = target[idx].word;
      b.disabled = session.locked;
      b.setAttribute("aria-label", `Remove word ${target[idx].word}`);
      b.addEventListener("click", () => {
        session.built.splice(pos, 1);
        renderBuiltSentence();
      });
      area.append(b);
    });
    const tileSequence = session.tileSequence || [];
    for (const index of tileSequence) {
      const used = session.built.includes(index),
        b = document.createElement("button");
      b.type = "button";
      b.className = "word-tile";
      b.lang = "ps";
      b.textContent = target[index].word;
      b.disabled = used || session.locked;
      b.addEventListener("click", () => {
        session.built.push(index);
        renderBuiltSentence();
      });
      bank.append(b);
    }
    $("undoTile").disabled = session.locked || !session.built.length;
    $("clearTiles").disabled = session.locked || !session.built.length;
    $("checkBuild").disabled =
      session.locked ||
      (questionUsesDuds(q)
        ? session.built.length === 0
        : session.built.length !== target.length);
  }
  function showChallengeQuestion() {
    queueMicrotask(readableQuizSurfaces);
    stopAudio();
    $("quizPanel").classList.remove("hidden");
    $("constructionPanel").classList.add("hidden");
    $("choices").replaceChildren();
    const q = session.questions[session.index];
    if (!q) {
      finishChallenge();
      return;
    }
    if (q.kind !== "dialogue") libraryExpose(q.id, "challenge");
    queueMicrotask(() => {
      const hint = q.scaffold || q.comment;
      if (hint && q.vocabularyOrigin === "scheduled-scaffold")
        $("quizRoman").textContent =
          "Not previously studied · " + (wordById[q.id]?.en || "");
      save();
    });
    const w =
      q.kind === "address" || q.kind === "choice" || q.kind === "dialogue"
        ? null
        : wordById[q.id];
    session.locked = false;
    session.built = [];
    $("builtSentence").classList.remove("build-success", "build-error");
    $("quizCounter").textContent =
      session.loop === 3
        ? `EDRIS · DINNER CONVERSATION ${session.index + 1}/${session.questions.length} · SCORE ${session.correctCount}/${session.questions.length}`
        : `DAY ${session.loop} · QUESTION ${session.index + 1}/${session.questions.length} · SCORE ${session.correctCount}/${session.questions.length}`;
    if (session.loop === 3) {
      const lines = [
        "Salaam! Welcome to my market. Let’s get ready for dinner.",
        "This is a common ingredient. Can you name it?",
        "Now for another ingredient to take home.",
        "What action do you do when you pay for food?",
        "Tell me how to say that you want something.",
        "Good. Tell me what you are buying.",
        "Suppose you ask for onions. What would you say?",
        "Sometimes fruit costs too much. What does this mean?",
        "I have baked some bread. What do you understand?",
        "A customer is eating bread. What is happening?",
        "Now speak to me directly: say you are buying potatoes.",
        "Do not forget the bread. Tell me you are buying it.",
        "Imagine dinner is ready. Say that you eat bread.",
        "You need a way to carry everything home. Tell me.",
        "And what will you drink with dinner? One last sentence!",
      ];
      $("guideMessage").textContent = `Edris: “${lines[session.index]}”`;
    }
    const target = $("addressTarget");
    const host = teacherFor(session.loop, null, "challenge");
    setDialogueSpeaker(host.name);
    target.classList.remove("hidden");
    target.textContent = `${host.name} → Player · YOUR ANSWER → ${host.name}`;
    if (session.loop === 4 || session.loop === 5) {
      const speaker = q.speaker || "Muhammad Jan";
      setDialogueSpeaker(speaker);
      const recipient = q.recipient || "player";
      const contextual =
        q.comment || "Listen carefully and respond using the appropriate form.";
      $("guideMessage").textContent =
        `${contextual} ${q.kind === "address" ? `You are now addressing ${recipient}.` : "What can you understand or say?"}`;
      target.textContent =
        session.loop === 4
          ? recipient === "Muhammad Jan"
            ? "Muhammad Jan is speaking · YOUR TURN → Reply to Muhammad Jan"
            : `Muhammad Jan is speaking · IMAGINE INFORMAL “YOU” → ${recipient} (not Muhammad Jan)`
          : `${speaker} is speaking to you · YOUR TURN → ${recipient}`;
      target.classList.remove("hidden");
      showParticipants(
        session.loop === 5
          ? ["Saleha", "Muhammad Jan", "Ms Hameed", "Edris"]
          : ["Muhammad Jan"],
        session.loop === 5 && peopleByName[recipient] ? recipient : "",
      );
    }
    if (session.loop >= 6) {
      const responseRecipient =
        q.recipient === "Player" ? q.speaker : q.recipient;
      setDialogueSpeaker(q.speaker);
      showParticipants(q.participants || [q.speaker], responseRecipient);
      target.textContent = `${q.speaker} → Player · YOUR RESPONSE → ${responseRecipient}`;
      target.classList.remove("hidden");
      renderMixedPashto($("guideMessage"), q.comment || q.prompt);
    }

    if (q.kind === "dialogue") {
      $("quizType").textContent = "🗣️ REPLY IN PASHTO";
      $("quizPashto").classList.remove("english-question");
      $("quizPashto").textContent = q.promptPs;
      $("quizPashto").lang = "ps";
      $("quizPashto").dir = "rtl";
      $("quizRoman").textContent =
        q.promptEnglish || "Listen to the question and answer in Pashto.";
      $("quizPrompt").textContent =
        `${q.speaker || "Your neighbour"} asks you a question. Build YOUR reply, not a translation of the prompt.`;
      $("quizPanel").querySelector(".quizword h3").textContent =
        "Choose only the tiles you need. Some tiles are distractions.";
      $("quizSpeak").classList.toggle("hidden", !q.audioId);
      $("constructionPanel").classList.remove("hidden");
      session.tileSequence = shuffle(buildTiles(null, q).map((t) => t.index));
      renderBuiltSentence();
      $("quizFeedback").textContent =
        "Your first submitted answer counts. Leave unused tiles in the bank.";
      $("quizNext").disabled = true;
      $("quizNext").textContent =
        session.index === session.questions.length - 1
          ? "See results →"
          : "Next question →";
      return;
    }
    if (q.kind === "choice") {
      $("quizType").textContent = (
        q.section || "Hills conversation"
      ).toUpperCase();
      renderMixedPashto($("quizPrompt"), q.prompt);
      $("quizPashto").textContent = "";
      renderMixedPashto(
        $("quizRoman"),
        q.comment || "Choose one response. Your first answer counts.",
      );
      $("quizPanel").querySelector(".quizword h3").textContent =
        "Choose your answer";
      $("quizSpeak").classList.toggle("hidden", !q.audioId);
      for (const value of shuffle(q.options)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = value;
        b.dataset.answer = value;
        if (/[\u0600-\u06ff]/.test(value)) {
          b.lang = "ps";
          b.dir = "rtl";
          b.classList.add("pashto-option");
        }
        b.addEventListener("click", () => answerChallenge(value));
        $("choices").append(b);
      }
      $("quizFeedback").textContent =
        "Consider who is speaking, who is included and whom you address.";
      $("quizNext").disabled = true;
      $("quizNext").textContent =
        session.index === session.questions.length - 1
          ? "See results →"
          : "Next question →";
      return;
    }
    if (q.kind === "address") {
      $("quizType").textContent = "🗣️ WHO ARE YOU ADDRESSING?";
      $("quizPashto").textContent = q.recipient;
      $("quizPashto").setAttribute("dir", "ltr");
      $("quizPashto").setAttribute("lang", "en");
      $("quizPashto").classList.add("english-question");
      $("quizRoman").textContent =
        "Choose the socially appropriate second-person pronoun";
      $("quizPrompt").textContent = q.comment;
      $("quizSpeak").classList.add("hidden");
      $("quizPanel").querySelector(".quizword h3").textContent =
        "How should you say “you” to this person or group?";
      for (const [label, value] of [
        ["ته · informal singular", "ته"],
        ["تاسې · respectful singular or plural", "تاسې"],
      ]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice address-choice";
        b.textContent = label;
        b.dataset.answer = value;
        b.addEventListener("click", () => answerChallenge(value));
        $("choices").append(b);
      }
      $("quizFeedback").textContent =
        "Consider who you are speaking to, not only the verb.";
      $("quizNext").disabled = true;
      $("quizNext").textContent =
        session.index === session.questions.length - 1
          ? "See results →"
          : "Next conversation turn →";
      return;
    }
    $("quizType").textContent =
      q.kind === "construct"
        ? "🧩 BUILD A SENTENCE"
        : q.kind === "word"
          ? "🧠 WORD RECALL"
          : "📖 SENTENCE RECALL";
    const reverse = q.direction === "en-ps";
    const isBuild = q.kind === "construct";
    $("quizPashto").textContent = reverse ? w.en : w.ps;
    $("quizPashto").setAttribute("dir", reverse ? "ltr" : "rtl");
    $("quizPashto").setAttribute("lang", reverse ? "en" : "ps");
    $("quizPashto").classList.toggle("english-question", reverse);
    $("quizRoman").textContent = isBuild
      ? "Arrange the Pashto tiles below"
      : reverse
        ? "Recall the Pashto expression"
        : w.roman;
    $("quizPrompt").textContent = isBuild
      ? "Build the Pashto sentence for this meaning"
      : reverse
        ? "Which Pashto expression means this?"
        : q.kind === "word"
          ? "What does this word mean?"
          : "What does this sentence mean?";
    $("quizSpeak").classList.toggle("hidden", reverse);
    $("quizPanel").querySelector(".quizword h3").textContent = isBuild
      ? "Put the tiles into natural Pashto order"
      : reverse
        ? "Choose the correct Pashto"
        : "Choose the correct English meaning";
    if (isBuild) {
      $("constructionPanel").classList.remove("hidden");
      session.tileSequence = shuffle(buildTiles(w).map((x) => x.index));
      renderBuiltSentence();
    } else
      for (const value of makeChallengeChoices(w, q.direction)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = value;
        if (reverse) {
          b.lang = "ps";
          b.dir = "rtl";
          b.classList.add("pashto-option");
        }
        b.addEventListener("click", () => answerChallenge(value));
        $("choices").append(b);
      }
    $("quizFeedback").textContent =
      session.loop === 3
        ? "Choose or build your reply to Edris. The first answer counts."
        : session.loop === 4 || session.loop === 5
          ? "Listen to the named speaker, then choose or build your answer. The first answer counts."
          : "Your first answer counts toward today’s score.";
    $("quizNext").disabled = true;
    $("quizNext").textContent =
      session.index === session.questions.length - 1
        ? "See results →"
        : "Next question →";
    $("audioStatus").textContent =
      "🔊 Listen to Pashto for recognition questions, if an Afghan Pashto voice is available.";
  }
  function answerChallenge(value) {
    queueMicrotask(readableQuizSurfaces);
    if (session?.mode !== "challenge" || session.locked) return;
    const q = session.questions[session.index],
      w =
        q.kind === "address" || q.kind === "choice" || q.kind === "dialogue"
          ? null
          : wordById[q.id];
    const correct =
      q.kind === "dialogue"
        ? isDialogueAnswerCorrect(q, value)
        : q.kind === "address" || q.kind === "choice"
          ? normalizeAnswer(value) === normalizeAnswer(q.correct)
          : q.kind === "construct"
            ? normalizeAnswer(value) === normalizeAnswer(w.ps)
            : value === (q.direction === "ps-en" ? w.en : w.ps);
    if (session.restoring) {
      session.locked = true;
      for (const b of $("choices").children) b.disabled = true;
      if (["construct", "dialogue"].includes(q.kind)) renderBuiltSentence();
      $("quizFeedback").textContent =
        "Saved response: " +
        (q.answerPs || q.correct || w?.ps || "") +
        ". Your first submitted answer is already recorded.";
      $("quizNext").disabled = false;
      return;
    }
    session.submittedAnswer = value;
    libraryPractice(
      q.id,
      correct,
      `challenge:${session.attemptId}:${session.index}`,
      "challenge",
    );
    if (correct)
      for (const day of LIBRARY_DATA.challengeGrammarMappings[q.id] || [])
        LibraryEngine.unlock(progress, day, "challenge");
    session.locked = true;
    session.answered++;
    if (correct) session.correctCount++;

    if (q.kind === "dialogue") {
      const key = `week2-dialogue:${session.loop}:${q.id}`;
      const gain = correct ? awardXP(progress, key, 5) : 0;
      session.earned += gain;
      save();
      hud();
      renderBuiltSentence();
      $("builtSentence").classList.add(
        correct ? "build-success" : "build-error",
      );
      const f = $("quizFeedback");
      f.replaceChildren();
      const heading = document.createElement("strong");
      heading.className = correct ? "good" : "bad";
      heading.textContent = correct
        ? `✓ Your reply makes sense. ${gain ? `+${gain} XP` : "Already rewarded"}`
        : "✗ Try building the reply from the meaning of the question.";
      const expected = document.createElement("div");
      expected.lang = "ps";
      expected.dir = "rtl";
      expected.className = "inline-pashto";
      expected.textContent = q.answerPs;
      const gloss = document.createElement("div");
      gloss.textContent = q.answerEnglish || "";
      f.append(heading, expected, gloss);
      $("quizNext").disabled = false;
      return;
    }
    if (q.kind === "choice") {
      const rewardKey = `${session.loop}:choice:${q.id}`;
      const gain = correct ? awardXP(progress, rewardKey, 5) : 0;
      session.earned += gain;
      save();
      hud();
      for (const b of $("choices").children) {
        b.disabled = true;
        if (b.dataset.answer === q.correct) b.classList.add("correct");
        else if (b.dataset.answer === value) b.classList.add("wrong");
      }
      $("quizFeedback").textContent =
        (correct ? "✓ Correct. " : "✗ Review this response: ") +
        q.correct +
        (gain ? ` · +${gain} XP` : "");
      $("quizNext").disabled = false;
      return;
    }
    if (q.kind === "address") {
      save();
      hud();
      for (const b of $("choices").children) {
        b.disabled = true;
        if (b.dataset.answer === q.correct) b.classList.add("correct");
        else if (b.dataset.answer === value) b.classList.add("wrong");
      }
      $("quizFeedback").replaceChildren();
      const line = document.createElement("strong");
      line.className = correct ? "good" : "bad";
      line.textContent = correct
        ? "✓ Correct form for this listener."
        : "✗ Use a different form for this listener.";
      const info = document.createElement("div");
      info.textContent = `${q.correct} — ${q.scope === "group" ? "plural you for more than one listener" : q.correct === "ته" ? "informal singular for a familiar friend" : "respectful singular for an elder, teacher or adult"}.`;
      $("quizFeedback").append(line, info);
      $("quizNext").disabled = false;
      return;
    }
    const rewardKey = `${session.loop}:${q.kind}:${q.direction}:${q.id}`;
    const gain = correct ? awardXP(progress, rewardKey, 5) : 0;
    session.earned += gain;
    save();
    hud();
    if (q.kind !== "construct")
      for (const b of $("choices").children) {
        b.disabled = true;
        if (b.textContent === (q.direction === "ps-en" ? w.en : w.ps))
          b.classList.add("correct");
        else if (b.textContent === value) b.classList.add("wrong");
      }
    else {
      renderBuiltSentence();
      $("builtSentence").classList.add(
        correct ? "build-success" : "build-error",
      );
    }
    const feedback = $("quizFeedback");
    feedback.replaceChildren();
    const headline = document.createElement("strong");
    headline.className = correct ? "good" : "bad";
    headline.textContent =
      session.loop === 3
        ? correct
          ? `✓ Edris: “Excellent! ${gain ? `+${gain} XP` : "You remember!"}”`
          : "✗ Edris: “Nearly! Let me show you the right way.”"
        : correct
          ? `✓ Correct! ${gain ? `+${gain} XP` : "Well remembered!"}`
          : "✗ Not quite — this word is now due for review";
    const detail = document.createElement("div");
    detail.textContent = `${w.ps} (${w.roman}) — ${w.en}`;
    feedback.append(headline, detail);
    $("quizSpeak").classList.remove("hidden");
    $("quizNext").disabled = false;
  }
  function finishChallenge() {
    if (session?.mode !== "challenge" || session.finished) return;
    const s = session,
      day = s.loop,
      spec = getChallengeSpec(day);
    s.finished = true;
    const reward = completeChallengeOnce(progress, day, s.correctCount),
      { passed, firstPass, base, topUp } = reward;
    s.earned += base + topUp;
    const graduation = day === 7 && firstPass;
    if (firstPass && day < loops.length) selectedLoop = day + 1;
    save();
    hud();
    const names = {
      ...Object.fromEntries(WEEK2_DATA.days.map((d) => [d.day, d.title])),
      1: "Muhammad Jan’s Library home handover",
      2: "Muhammad Jan’s check-in",
      3: "Dinner shopping",
      4: "An evening with Muhammad Jan",
      5: "The lakeside gathering",
      6: "Together in the Hills",
      7: "Week 1 examination",
    };
    $("resultHeading").textContent = graduation
      ? "Week 1 complete · Level 10 · New Resident"
      : `${names[day]}: ${passed ? "passed!" : "practise and retry"}`;
    $("resultDescription").textContent = graduation
      ? "Ms Hameed → Player: “When you arrived, you were a Newcomer. Now you can introduce yourself, speak respectfully to your neighbours and describe the people around you. Welcome as a New Resident of our village!”"
      : day === 7
        ? passed
          ? "Ms Hameed: “Well remembered! Your Week 1 graduation is already recorded.”"
          : "Ms Hameed: “Keep practising. Twenty correct answers are needed; you can try again.”"
        : day === 6
          ? passed
            ? "Saleha and Mina → Player: “We enjoy walking with you! Your next day is open.”"
            : "Saleha → Player: “Let us practise we and you both again.”"
          : passed
            ? `You passed ${names[day]}. Day ${day + 1} is open!`
            : `You scored ${s.correctCount}/${s.questions.length}; ${spec.passCount} correct are needed. Practise in town or retry.`;
    if (day === 1) {
      $("resultDescription").textContent = passed
        ? firstPass
          ? "Muhammad Jan → Player: Here is the key to your own home. Welcome to the village! Your home is now yours, and I will still visit to help you learn."
          : "Your home award is already saved. No second key or milestone reward is granted."
        : "Muhammad Jan → Player: Let us practise and try again. Your home will be awarded after twelve correct answers.";
    }
    if (day >= 8) {
      $("resultDescription").textContent = passed
        ? day === 14
          ? "Ms Hameed → Player: “Your village review is complete. You remain a New Resident; keep practising with your neighbours.”"
          : `${teacherFor(day, null, "challenge").name} → Player: “Well done! Day ${day + 1} is available.”`
        : `Practise and retry: ${spec.passCount}/${s.questions.length} correct required. Your New Resident milestone is retained.`;
    }
    $("resultAccuracy").textContent = `${s.correctCount}/${s.questions.length}`;
    $("resultXP").textContent = `+${s.earned}`;
    $("resultKnowledge").textContent = passed ? "PASSED" : "NOT YET";
    $("resultNext").textContent =
      `Total: ${progress.xp} XP · Answer rewards: +${s.earned - base - topUp} XP. ${base ? `First-pass bonus: +${base} XP. ` : ""}${topUp ? `Checkpoint catch-up: +${topUp} XP. ` : ""}${graduation ? "Newcomer → New Resident. Week 1 is complete." : passed ? "Progress saved. Replays do not repeat milestone rewards." : "No milestone or title awarded. Retry when ready."}`;
    $("resultReplay").textContent =
      `Retry ${s.questions.length}-question assessment`;
    $("resultWorld").textContent = "Return to town →";
    view("resultScreen");
  }
  function begin(id) {
    $("lessonScreen").dataset.week = Number(id.split("-")[0]) >= 8 ? "2" : "1";
    stopAudio();
    showChallengeScene(0);
    $("addressTarget").classList.add("hidden");
    let pool,
      loc = null,
      loop = 0,
      mode = "standard";
    if (id === "tutorial") {
      pool = [...greeting];
      mode = "tutorial";
      loc = "library";
    } else if (id === "review") {
      if (!progress.tutorialDone) return;
      pool = duePool().map((w) => w.id);
      mode = "review";
    } else {
      loc = id.split("-")[1];
      loop = Number(id.split("-")[0]);
      if (!allowed(loop) || !courses[id] || !placeAccessible(loop, loc)) return;
      pool = libraryLessonPool(loop, loc);
      save();
    }
    if (!pool.length) {
      startWorld();
      return;
    }
    const recall = [];
    const lexical = pool.filter((x) => wordById[x].type !== "sentence"),
      sentences = pool.filter((x) => wordById[x].type === "sentence");
    const ordered =
      mode === "standard" ? [...lexical, ...sentences, ...recall] : pool;
    session = {
      id,
      mode,
      loc,
      loop,
      required: pool,
      recall,
      studyWords: mode === "tutorial" ? pool : lexical,
      studySentences: sentences,
      phase:
        mode === "review"
          ? lexical.length
            ? "lexical"
            : "sentence"
          : needsOpening(loop, loc) ||
              (loop === 2 &&
                loc === "school" &&
                !progress.complete["2-school"]) ||
              (loop === 3 &&
                loc === "nature" &&
                !progress.complete["3-nature"] &&
                !progress.personIntros[3]) ||
              (loop === 4 &&
                loc === "residential" &&
                !progress.complete["4-residential"] &&
                !progress.personIntros[4]) ||
              (loop === 5 &&
                loc === "school" &&
                !progress.complete["5-school"] &&
                !progress.personIntros[5])
            ? "grammar"
            : "lexical",
      preLessonGrammar:
        needsOpening(loop, loc) ||
        (loop === 2 && loc === "school" && !progress.complete["2-school"]) ||
        (loop === 3 &&
          loc === "nature" &&
          !progress.complete["3-nature"] &&
          !progress.personIntros[3]) ||
        (loop === 4 &&
          loc === "residential" &&
          !progress.complete["4-residential"] &&
          !progress.personIntros[4]) ||
        (loop === 5 &&
          loc === "school" &&
          !progress.complete["5-school"] &&
          !progress.personIntros[5]),
      cardIndex: 0,
      queue: ordered.map((x) => ({ id: x, retries: 0 })),
      answered: 0,
      firstAsked: new Set(),
      firstCorrect: 0,
      passed: new Set(),
      earned: 0,
      initialLevel: characterStatus(progress).level,
    };
    session.attemptId = ++progress.library.attemptSequence;
    let title, desc, emoji, guide;
    if (mode === "tutorial") {
      title = "Muhammad Jan · Library welcome";
      desc = "Library · Four easy greetings";
      emoji = "👴";
      guide =
        "Salaam! I am Muhammad Jan. Learn these four greetings with me, then choose their meanings. I will make sure you are ready to meet your neighbours.";
    } else if (mode === "review") {
      title = "Memory Trail";
      desc = `${pool.length} spaced-repetition review items`;
      emoji = "🧠";
      guide =
        "These words are due for recall. Successful reviews push the next test farther into the future.";
    } else {
      const z = zones[loc],
        l = loops.find((x) => x.id === loop);
      title = displayPlace(loop, loc);
      desc = `Day ${loop}: ${l.label} · ${lexical.length} vocabulary cards · ${sentences.length} sentences · ${recall.length} recall`;
      emoji = z.icon;
      guide = advancedScenes[loop]
        ? advancedScenes[loop][loc]
        : loop === 2
          ? dayTwoScenes[loc]
          : loop <= 3
            ? `${villagePeople[loc].welcome} ${loop === 1 ? "Today we describe things with “is”." : loc === "nature" ? "Today I will show you how to say what YOU do. Listen for the endings of the verbs." : "Let us practise saying what you do using “I” sentences."}`
            : loop === 1
              ? `First learn ${lexical.length} nouns and adjectives. Then describe ${sentences.length} things using present-tense “is.” Finally, recall ${recall.length} earlier words.`
              : `First meet ${lexical.length} new words. Then practise ${sentences.length} present-tense sentences with ${l.person}. Finally, answer a mixed quiz including ${recall.length} earlier items.`;
    }

    $("lessonEyebrow").textContent =
      mode === "tutorial"
        ? "FORCED FIRST LEVEL"
        : mode === "review"
          ? "SPACED REPETITION"
          : `DAY ${loop} · PRESENT TENSE`;
    $("lessonName").textContent = title;
    $("lessonDescription").textContent = desc;
    $("lessonIcon").textContent = emoji;
    setSpeaker(loop, loc, mode);
    $("guideMessage").textContent = guide;
    hud();
    view("lessonScreen");
    renderPhase();
  }
  function renderPhase() {
    if (!session) return;
    queueMicrotask(readableQuizSurfaces);
    stopAudio();
    for (const id of ["teachPanel", "sovPanel", "quizPanel"])
      $(id).classList.add("hidden");
    if (session.phase === "lexical" || session.phase === "sentence") {
      teachCard();
    } else if (session.phase === "grammar") {
      showGrammar();
    } else if (session.mode === "challenge") showChallengeQuestion();
    else showQuestion();
  }
  function studyList() {
    return session.phase === "sentence"
      ? session.studySentences
      : session.studyWords;
  }
  function teachCard() {
    const items = studyList(),
      w = wordById[items[session.cardIndex]];
    if (!w) {
      session.phase =
        session.phase === "lexical" && session.studySentences.length
          ? session.preLessonGrammar || session.mode === "review"
            ? "sentence"
            : "grammar"
          : "quiz";
      renderPhase();
      return;
    }
    libraryExpose(
      w.id,
      session.mode === "tutorial"
        ? "tutorial"
        : session.mode === "review"
          ? "review"
          : "lesson",
    );
    if (w.type === "sentence")
      LibraryEngine.unlock(progress, session.loop, "lesson");
    save();
    $("teachPanel").classList.remove("hidden");
    $("lessonStages").classList.toggle("hidden", session.mode === "tutorial");
    $("teachCount").textContent =
      `${session.phase === "lexical" ? "VOCABULARY" : "BUILDING SENTENCES"} · CARD ${session.cardIndex + 1}/${items.length}`;
    $("teachType").textContent =
      session.phase === "sentence" ? "Present-tense sentence" : w.type;
    $("teachPashto").textContent = w.ps;
    $("teachRoman").textContent = w.roman;
    $("teachEnglish").textContent = w.en;
    $("teachNote").textContent = w.note;
    $("dialectVariant").textContent = w.dialect
      ? "Regional note: " + w.dialect
      : "";
    $("dialectVariant").classList.toggle("hidden", !w.dialect);
    $("guideMessage").textContent =
      session.mode === "tutorial"
        ? "Read the greeting and its transliteration. There are only four phrases in our first level."
        : session.mode === "review"
          ? "Study this previously encountered item before recalling it. Review uses the same spaced-repetition schedule as your vocabulary bank."
          : session.loop <= 3 && session.phase === "lexical"
            ? villagePeople[session.loc].words
            : session.loop >= 4 && session.phase === "lexical"
              ? `${teacherFor(session.loop, session.loc, session.mode).name}: These words belong to today's ${displayPlace(session.loop, session.loc).toLowerCase()} conversation.`
              : session.phase === "lexical"
                ? `These are the new ${w.type}s for this location. You will see older words again in the quiz.`
                : session.loop === 1
                  ? `Let us describe a thing using a noun, an adjective and the correct form of “is”. We do not need a separate word for “it”.`
                  : session.loop === 2
                    ? `Notice how the action comes at the end of the Pashto sentence.`
                    : session.loop === 3
                      ? `${villagePeople[session.loc].name}: Say this sentence as “I”. Watch how the verb changes with the person speaking.`
                      : session.loop === 4
                        ? `${teacherFor(4, session.loc, "standard").name}: Practise informal “you” (ته) and then link two complete actions using او.`
                        : session.loop === 5
                          ? `${teacherFor(5, session.loc, "standard").name}: Practise polite/plural “you” (تاسې); decide whom you are addressing.`
                          : `Read the present-tense sentence and notice the speaker.`;
    if (session.loop >= 6) {
      setDialogueSpeaker(
        teacherFor(session.loop, session.loc, session.mode).name,
      );
      const listener =
        session.loop === 6
          ? w.en.startsWith("You")
            ? "Saleha and Mina"
            : "your group, including you"
          : "the observed group (not you or the teacher)";
      $("guideMessage").textContent =
        session.loop === 7
          ? `${teacherFor(session.loop, session.loc, session.mode).name} → Player: Describe ${session.loc === "business" ? (w.id.endsWith("-bread") ? "the bread sellers" : "the fruit customers") : session.loc === "residential" ? "the visiting relatives" : session.loc === "nature" ? "the children by the water" : "the other students"}. They are outside our conversation.`
          : `${teacherFor(session.loop, session.loc, session.mode).name} → Player: This is your model response; “I” is the player. Group: ${listener}.`;
    }
    if (session.loop >= 8) {
      const day = week2Days[session.loop],
        card = day.lessons.flatMap((l) => l.cards).find((c) => c.id === w.id);
      if (card) {
        $("guideMessage").textContent =
          `${teacherFor(session.loop, session.loc, session.mode).name} → Player: Study model spoken by ${card.speaker}, addressed to ${card.recipient}. ${day.topic}. Local language review pending.`;
      }
    }
    if (session.loop === 1 && session.phase === "sentence")
      $("guideMessage").textContent =
        LIBRARY_DATA.lessonContexts[1][session.loc];
    $("addressTarget").textContent =
      `${teacherFor(session.loop, session.loc, session.mode).name} → Player · study example${session.loop >= 6 ? " · Player practises the displayed sentence" : ""}`;
    $("addressTarget").classList.remove("hidden");
    $("teachNext").textContent =
      session.cardIndex === items.length - 1
        ? session.phase === "lexical" && session.studySentences.length
          ? "Time for sentences →"
          : "Start the quiz →"
        : "Next study card →";
    const stages = $("lessonStages").children;
    for (let i = 0; i < stages.length; i++) {
      stages[i].classList.toggle(
        "done",
        session.phase === "sentence" && i === 0,
      );
      stages[i].classList.toggle(
        "active",
        session.phase === "lexical"
          ? i === 0
          : session.phase === "sentence"
            ? i === 1
            : i === 2,
      );
    }
  }
  function afterStudy() {
    stopAudio();
    if (!session || !["lexical", "sentence"].includes(session.phase)) return;
    session.cardIndex++;
    if (session.cardIndex < studyList().length) {
      teachCard();
      return;
    }
    if (session.phase === "lexical" && session.studySentences.length) {
      session.phase =
        session.preLessonGrammar || session.mode === "review"
          ? "sentence"
          : "grammar";
      session.cardIndex = 0;
      renderPhase();
    } else {
      session.phase = "quiz";
      $("guideMessage").textContent =
        `${teacherFor(session.loop, session.loc, session.mode).name}: Let’s see what you remember. Mistakes help you learn.`;
      renderPhase();
    }
  }
  function needsOpening(loop, loc) {
    return loop >= 8
      ? loc === week2Days[loop].opening && !progress.complete[`${loop}-${loc}`]
      : (loop === 6 && loc === "nature" && !progress.complete["6-nature"]) ||
          (loop === 7 &&
            loc === "business" &&
            !progress.complete["7-business"]);
  }
  function showWeekOpening() {
    const day = session.loop,
      step = session.openingStep || 0;
    $("sovPanel").classList.remove("hidden");
    $("sovDiagram").classList.add("hidden");
    let practice = $("openingPractice");
    if (!practice) {
      practice = document.createElement("div");
      practice.id = "openingPractice";
      $("sovExplanation").after(practice);
    }
    practice.replaceChildren();
    practice.classList.remove("hidden");
    const steps =
      day === 6
        ? [
            [
              "Saleha",
              "Meet my sister, Mina",
              "Salaam! This is my sister Mina. We often run together beside the lake. Join us!",
            ],
            [
              "Mina",
              "Join our group",
              "Salaam! Saleha and I like to run. If you join us, your group includes you too.",
            ],
            [
              "Saleha",
              "I → Mina and I → we",
              "زه منډې وهم — I run. مینا او زه یو ځای منډې وهو — Mina and I run together. موږ یو ځای منډې وهو — We run together. A subject containing the speaker takes a first-person plural verb. Notice وهم → وهو.",
            ],
            [
              "Saleha",
              "موږ includes the speaker",
              "موږ ښوونځي ته ځو — We go to school. تاسې ښوونځي ته ځئ — You all go to school. ځو and ځئ differ; learn whole verb forms rather than adding one ending to every stem. The pronoun can sometimes be omitted because the verb marks person.",
            ],
            [
              "Mina",
              "Which group is we?",
              "I ask you to describe yourself with Mina: “Mina and I run together.” Choose who belongs to your group, then build “We run together”.",
            ],
          ]
        : [
            [
              "Edris",
              "Look at the groups in the market",
              "The fruit customers buy apples and carry baskets. The bread sellers are a different group. Both groups are outside our conversation.",
            ],
            [
              "Edris",
              "He buys → they buy",
              "هغه ډوډۍ اخلي — He buys bread. هغوی ډوډۍ اخلي — They buy bread. The present verb اخلي can be shared by third-person singular and plural; هغوی and context identify the group.",
            ],
            [
              "Edris",
              "We, you all, they",
              "موږ سابه اخلو — We buy vegetables (you and me included). تاسې سابه اخلئ — You all buy vegetables (I address customers). هغوی سابه اخلي — They buy vegetables (I describe other customers).",
            ],
            [
              "Edris",
              "Describe two groups",
              "Describe the fruit customers and then the bread sellers. Neither group includes you or me.",
            ],
          ];
    const [speaker, title, text] = steps[step];
    setDialogueSpeaker(speaker);
    showParticipants(day === 6 ? ["Saleha", "Mina"] : ["Edris"], "Player");
    $("sovStep").textContent =
      `${speaker.toUpperCase()} → PLAYER · DAY ${day} · ${step + 1}/${steps.length}`;
    $("sovTitle").textContent = title;
    $("sovExplanation").textContent = text;
    $("guideMessage").textContent = `${speaker} → Player: ${text}`;
    $("sovNext").disabled = false;
    $("sovNext").textContent =
      step === steps.length - 1
        ? "Continue to location vocabulary →"
        : "Continue conversation →";
    $("addressTarget").textContent =
      `${speaker} → Player · YOUR PRACTICE RESPONSE → ${day === 6 ? "Saleha and Mina" : "Edris"}`;
    $("addressTarget").classList.remove("hidden");
    if (step !== steps.length - 1) return;
    $("sovNext").disabled = true;
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    practice.append(message);
    if (day === 6) {
      const choices = document.createElement("div");
      choices.className = "buttons";
      practice.append(choices);
      let group = false,
        built = [];
      const build = document.createElement("div");
      build.className = "buttons";
      const output = document.createElement("p");
      output.dir = "rtl";
      output.lang = "ps";
      function check() {
        const correct = group && built.join(" ") === "موږ یو ځای منډې وهو";
        $("sovNext").disabled = !correct;
        message.textContent = correct
          ? "✓ We includes you. First-person plural: وهو. Continue when ready."
          : group
            ? "Build the first-person plural sentence."
            : "Choose the speaker-included group first.";
      }
      for (const label of ["The player and Mina", "Only Saleha and Mina"]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "secondary";
        b.textContent = label;
        b.onclick = () => {
          group = label === "The player and Mina";
          check();
        };
        choices.append(b);
      }
      for (const word of ["وهو", "منډې", "موږ", "ځای", "یو"]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "secondary";
        b.lang = "ps";
        b.textContent = word;
        b.onclick = () => {
          built.push(word);
          b.disabled = true;
          output.textContent = built.join(" ");
          check();
        };
        build.append(b);
      }
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "primary";
      reset.className = "ghost";
      reset.textContent = "Clear practice sentence";
      reset.onclick = () => {
        built = [];
        for (const b of build.children) b.disabled = false;
        output.textContent = "";
        check();
      };
      practice.append(output, build, reset);
      check();
    } else {
      let answered = new Set();
      for (const [i, prompt, correct, wrong] of [
        [0, "Fruit customers", "هغوی مڼې اخلي.", "موږ مڼې اخلو."],
        [1, "Bread sellers", "هغوی ډوډۍ پلوري.", "تاسې ډوډۍ پلورئ."],
      ]) {
        const line = document.createElement("p");
        line.textContent = prompt;
        practice.append(line);
        for (const text of [correct, wrong]) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "secondary";
          b.lang = "ps";
          b.dir = "rtl";
          b.textContent = text;
          b.onclick = () => {
            if (text === correct) {
              answered.add(i);
              message.textContent = "✓ " + prompt + ": " + correct;
            } else {
              answered.delete(i);
              message.textContent =
                "These people are outside your conversation: use هغوی.";
            }
            $("sovNext").disabled = answered.size !== 2;
          };
          practice.append(b);
        }
      }
    }
  }

  function showGrammar() {
    const loop = session.loop;
    LibraryEngine.unlock(progress, loop, "lesson");
    save();
    if (loop >= 8) {
      showWeek2Grammar();
      return;
    }
    const host = teacherFor(loop, session.loc, session.mode);
    $("addressTarget").textContent = `${host.name} → Player · Grammar workshop`;
    $("addressTarget").classList.remove("hidden");
    if (needsOpening(loop, session.loc) && session.preLessonGrammar) {
      showWeekOpening();
      return;
    }
    if ($("openingPractice")) $("openingPractice").classList.add("hidden");
    $("sovNext").disabled = false;
    if (
      loop === 4 &&
      session.loc === "residential" &&
      session.preLessonGrammar
    ) {
      $("sovPanel").classList.remove("hidden");
      $("sovDiagram").classList.add("hidden");
      $("sovStep").textContent = "MUHAMMAD JAN · DAY 4 · AT HOME";
      $("sovTitle").textContent =
        "ته — informal “you”; linking two actions with او";
      $("sovExplanation").textContent =
        "Muhammad Jan: “Yesterday you said زه اوبه څښم — I drink water. Today, when speaking to a familiar friend, say ته اوبه څښې — you drink water. The ending changes from ـم to ـې. We can join two complete clauses: ته کوټه پاکوې او زه پر څوکۍ کښېنم — You clean the room, and I sit on the chair. Each clause has its own subject and verb. Use informal ته with peers; when addressing respected elders, a different polite form will be taught tomorrow.”";
      $("sovNext").textContent = "Practise “you” and compound sentences →";
      $("guideMessage").textContent =
        "Muhammad Jan: “I may address you as ته. When you practise your own sentences, imagine speaking to a friend such as Saleha, not to me.”";
      return;
    }
    if (loop === 5 && session.loc === "school" && session.preLessonGrammar) {
      $("sovPanel").classList.remove("hidden");
      $("sovDiagram").classList.add("hidden");
      $("sovStep").textContent = "MS HAMEED · DAY 5 · AT SCHOOL";
      $("sovTitle").textContent = "ته or تاسې? Choose by whom you address";
      $("sovExplanation").textContent =
        "Ms Hameed: “You have learned ته کتاب لولې — you read a book (speaking to one familiar friend). When addressing an elder, a teacher, an unfamiliar adult or several people, use تاسې کتاب لولئ. The polite/plural verb generally ends in ـئ instead of the informal ـې. The same تاسې form can refer to one respected person or a group. Look at the listener and the context. In some speech you will also hear تاسو; we use تاسې for consistency in these lessons.”";
      $("sovNext").textContent = "Practise respectful and plural “you” →";
      $("guideMessage").textContent =
        "Ms Hameed: “I can speak to you with ته, but you should usually use تاسې when speaking politely to me or Muhammad Jan.”";
      return;
    }
    if (loop === 3 && session.loc === "nature" && session.preLessonGrammar) {
      $("sovPanel").classList.remove("hidden");
      $("sovDiagram").classList.add("hidden");
      $("sovStep").textContent = "SALEHA · MORNING BY THE LAKE";
      $("sovTitle").textContent = "Today, YOU are the subject: زه means “I”.";
      $("sovExplanation").textContent =
        "Saleha points to the water: “Yesterday you learned هغه اوبه څښي — he/she drinks water. Now say زه اوبه څښم — I drink water.” Compare څښي (he/she drinks) with څښم (I drink). Many present-tense first-person verbs end in ـم. Verb endings communicate who is doing the action, so Pashto can sometimes omit the pronoun when context is clear. The verb still usually comes after the object. Some verbs change their stems too: learn the complete form, not just an ending.";
      $("sovNext").textContent = "Practise speaking as “I” →";
      $("guideMessage").textContent =
        "Saleha: “When I say زه اوبه څښم, the ending of څښم tells you it is ME drinking. Watch how the verbs change, then try describing what you do by the lake.”";
      return;
    }
    if (loop === 1) {
      if (!progress.personIntros[1]) {
        $("sovPanel").classList.remove("hidden");
        $("sovDiagram").classList.add("hidden");
        $("sovStep").textContent =
          `${villagePeople[session.loc].name.toUpperCase()} · DAY 1 DESCRIPTION WORKSHOP`;
        $("sovTitle").textContent = "Start with things: “The door is open.”";
        $("sovExplanation").textContent =
          "Our first sentences describe things, not actions. English says “The door is open”. Pashto says دروازه خلاصه ده. The noun comes first, then the description, then the present form of “is”. Use دی with masculine singular nouns, ده with feminine singular nouns, and دي with plural nouns such as اوبه (water). You do not need a separate word for English “it” here. On Day 2 we will learn actions and the S–O–V rule.";
        $("sovNext").textContent = "I understand descriptions →";
        $("guideMessage").textContent =
          "Look at the object, the describing word and the final “is” word.";
        return;
      }
      session.phase = "sentence";
      renderPhase();
      return;
    }
    // The story-route sentence workshop opens at School, but the optional day challenge can bypass it.
    if (!progress.sovSeen || session.preLessonGrammar) {
      $("sovPanel").classList.remove("hidden");
      $("sovDiagram").classList.remove("hidden");
      const demos = {
        residential: {
          object: "the door",
          verb: "opens",
          psObject: "دروازه",
          psVerb: "خلاصوي",
          romanObject: "darwaaza",
          romanVerb: "khlaasawi",
        },
        nature: {
          object: "water",
          verb: "drinks",
          psObject: "اوبه",
          psVerb: "څښي",
          romanObject: "oba",
          romanVerb: "ts-khee",
        },
        business: {
          object: "bread",
          verb: "eats",
          psObject: "ډوډۍ",
          psVerb: "خوري",
          romanObject: "ḍoḍay",
          romanVerb: "khoree",
        },
        school: {
          object: "a book",
          verb: "reads",
          psObject: "کتاب",
          psVerb: "لولي",
          romanObject: "kitaab",
          romanVerb: "lolee",
        },
      };
      const d = demos[session.loc] || demos.nature;
      const diagram = $("sovDiagram");
      const eng = diagram.querySelectorAll(
        ".sov-flow:first-of-type .sov-word span",
      );
      const pts = diagram.querySelectorAll(
        ".sov-flow:nth-of-type(2) .sov-word .ps",
      );
      const romans = diagram.querySelectorAll(
        ".sov-flow:nth-of-type(2) .sov-word span:last-child",
      );
      eng[1].textContent = d.verb;
      eng[2].textContent = d.object;
      pts[1].textContent = d.psObject;
      pts[2].textContent = d.psVerb;
      romans[1].textContent = d.romanObject;
      romans[2].textContent = d.romanVerb;
      diagram.querySelector(".sov-small").textContent =
        `هغه ${d.psObject} ${d.psVerb}. — He/she ${d.verb} ${d.object}. The verb comes at the end.`;
      $("sovStep").textContent = session.preLessonGrammar
        ? "MS HAMEED · DAY 2 SCHOOL LESSON"
        : "THE FRIENDLY GUIDE · FIRST SENTENCE WORKSHOP";
      $("sovTitle").textContent =
        "English uses S–V–O. Pashto usually uses S–O–V.";
      $("sovExplanation").textContent =
        `${session.preLessonGrammar ? "Ms Hameed starts your school day with a new rule. " : ""}English says “He/she ${d.verb} ${d.object}”: Subject → Verb → Object. In a simple Pashto action sentence, the object usually comes before the verb: Subject → Object → Verb. The boxes present grammatical order; Pashto script itself is read from right to left.`;
      $("sovNext").textContent = session.preLessonGrammar
        ? "Let’s learn the school vocabulary →"
        : "I understand S–O–V →";
      $("guideMessage").textContent = session.preLessonGrammar
        ? "Welcome to school! Before our first lesson about actions, learn where Pashto places the verb."
        : "Before building your first sentences, we need one special rule. Watch where the verb goes!";
      return;
    }
    if (!progress.personIntros[loop]) {
      $("sovPanel").classList.remove("hidden");
      $("sovDiagram").classList.add("hidden");
      const samples = {
        2: [
          "هغه",
          "He / she",
          "څښي",
          "He/she drinks",
          "Third-person singular often uses a present verb ending written ـي. هغه can mean he or she.",
        ],
        3: [
          "زه",
          "I",
          "څښم",
          "I drink",
          "First-person singular often uses ـم. Compare څښي with څښم.",
        ],
        4: [
          "ته",
          "You (informal singular)",
          "څښې",
          "You drink",
          "Second-person singular often uses ـې. Compare څښم with څښې.",
        ],
        5: [
          "تاسې",
          "You (polite/plural)",
          "څښئ",
          "You drink",
          "Polite or plural you commonly takes ـئ in the present tense.",
        ],
        6: [
          "موږ",
          "We",
          "څښو",
          "We drink",
          "First-person plural often uses ـو. Same action, new subject.",
        ],
        7: [
          "هغوی",
          "They",
          "څښي",
          "They drink",
          "Third-person plural often shares the ـي ending with third-person singular.",
        ],
      };
      const p = samples[loop];
      $("sovStep").textContent =
        `${loop === 3 ? "SALEHA" : loop === 4 ? "MUHAMMAD JAN" : loop === 5 ? "MS HAMEED" : "VILLAGE LEARNING"} · DAY ${loop}`;
      $("sovTitle").textContent = `Now speak as “${p[1]}”`;
      $("sovExplanation").textContent =
        `${p[0]} means “${p[1]}”. In the present tense, ${p[2]} can mean “${p[3]}”. ${p[4]} Keep the verb near the end of the sentence, even when the person changes.`;
      $("sovNext").textContent = "Continue to sentences →";
      $("guideMessage").textContent =
        "You already know how sentences are ordered. Now change the verb to match the person who does the action.";
      return;
    }
    session.phase = "sentence";
    renderPhase();
  }
  function afterGrammar() {
    stopAudio();
    if (!session || session.phase !== "grammar" || $("sovNext").disabled)
      return;
    if (needsOpening(session.loop, session.loc) && session.preLessonGrammar) {
      const last = session.loop >= 8 ? 0 : session.loop === 6 ? 4 : 3;
      if ((session.openingStep || 0) < last) {
        session.openingStep = (session.openingStep || 0) + 1;
        showWeekOpening();
        return;
      }
      if ($("openingPractice")) $("openingPractice").classList.add("hidden");
    }
    if (session.loop > 1 && (!progress.sovSeen || session.preLessonGrammar))
      progress.sovSeen = true;
    if (session.loop) progress.personIntros[session.loop] = true;
    save();
    session.phase = session.preLessonGrammar ? "lexical" : "sentence";
    session.cardIndex = 0;
    renderPhase();
  }
  function distractors(w) {
    let peers = [
      ...words,
      ...Object.values(wordById).filter((x) =>
        x.id.startsWith("library-card:"),
      ),
    ].filter((x) => x.id !== w.id && x.en !== w.en && x.type === w.type);
    if (w.type === "sentence") {
      const same = peers.filter((x) => x.loop === w.loop),
        prior = peers.filter((x) => x.loop < w.loop);
      peers = [
        ...shuffle(same),
        ...shuffle(prior),
        ...shuffle(peers.filter((x) => x.loop > w.loop)),
      ];
    } else peers = shuffle(peers);
    const distract = Array.from(new Set(peers.map((x) => x.en))).slice(0, 3);
    // All learning types have enough options; optional fallback just in case.
    while (distract.length < 3)
      distract.push(
        ["A different meaning", "None of these", "Another expression"][
          distract.length
        ],
      );
    return shuffle([w.en, ...distract]);
  }
  function showQuestion() {
    if (!session) return;
    queueMicrotask(readableQuizSurfaces);
    stopAudio();
    if (!session.queue.length) {
      finish();
      return;
    }
    $("quizPanel").classList.remove("hidden");
    $("constructionPanel").classList.add("hidden");
    $("addressTarget").textContent =
      `${teacherFor(session.loop, session.loc, session.mode).name} → Player · YOUR ANSWER → ${teacherFor(session.loop, session.loc, session.mode).name}`;
    $("addressTarget").classList.remove("hidden");
    $("quizPashto").classList.remove("english-question");
    $("quizPashto").setAttribute("dir", "rtl");
    $("quizPashto").setAttribute("lang", "ps");
    $("quizSpeak").classList.remove("hidden");
    const w = wordById[session.queue[0].id],
      retry = session.queue[0].retries,
      recalled = session.recall.includes(w.id);
    libraryExpose(
      w.id,
      session.mode === "review"
        ? "review"
        : session.mode === "tutorial"
          ? "tutorial"
          : "lesson",
    );
    save();
    $("quizCounter").textContent =
      `QUESTION ${session.answered + 1} · ${session.queue.length} REMAINING`;
    $("quizType").textContent = retry
      ? "↻ RETRY"
      : recalled
        ? "🧠 RECALL"
        : stat(w.id).seen > 0
          ? "✧ PRACTICE"
          : "★ NEW";
    $("quizPashto").textContent = w.ps;
    $("quizRoman").textContent = w.roman;
    $("quizPrompt").textContent =
      w.type === "sentence"
        ? "What does this whole sentence mean?"
        : w.type === "greeting"
          ? "What does this greeting mean?"
          : `What does this ${w.type} mean?`;
    $("choices").replaceChildren();
    for (const choice of distractors(w)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = choice;
      b.addEventListener("click", () => answer(choice));
      $("choices").append(b);
    }
    $("quizFeedback").textContent = "Choose one answer to continue.";
    $("quizNext").disabled = true;
    $("quizNext").textContent = "Next →";
  }
  function answer(choice) {
    queueMicrotask(readableQuizSurfaces);
    if (!session || !$("quizNext").disabled || !session.queue.length) return;
    const item = session.queue.shift(),
      w = wordById[item.id],
      previous = stat(w.id),
      correct = choice === w.en,
      first = !session.firstAsked.has(w.id);
    libraryPractice(
      w.id,
      correct,
      `lesson:${session.attemptId}:${session.answered}`,
      session.mode === "tutorial"
        ? "tutorial"
        : session.mode === "review"
          ? "review"
          : "lesson",
    );
    if (first) {
      session.firstAsked.add(w.id);
      if (correct) session.firstCorrect++;
    }
    let gain = 0;
    if (correct) {
      session.passed.add(w.id);
      const identity = LibraryEngine.identity(LIBRARY_DATA, w.id);
      if (previous.correct === 0)
        gain = awardXP(progress, "practice:" + identity, 10);
      else if (previous.dueAt <= Date.now())
        gain = awardXP(
          progress,
          "review:" + identity + ":" + Math.floor(Date.now() / DAY),
          7,
        );
      session.earned += gain;
    } else
      session.queue.splice(Math.min(2, session.queue.length), 0, {
        id: w.id,
        retries: item.retries + 1,
      });
    session.answered++;
    save();
    hud();
    for (const b of $("choices").children) {
      b.disabled = true;
      if (b.textContent === w.en) b.classList.add("correct");
      else if (b.textContent === choice) b.classList.add("wrong");
    }
    $("quizFeedback").replaceChildren();
    const strong = document.createElement("strong");
    strong.className = correct ? "good" : "bad";
    strong.textContent = correct
      ? `✓ Correct! +${gain} XP`
      : "✗ Not yet — you will see this again";
    const detail = document.createElement("div");
    detail.textContent = `${w.ps} (${w.roman}) — “${w.en}”. ${w.note}`;
    $("quizFeedback").append(strong, detail);
    $("quizNext").disabled = false;
    $("quizNext").textContent = session.queue.length
      ? "Next →"
      : "Finish lesson →";
  }
  function nextQuestion() {
    if (!session || $("quizNext").disabled) return;
    if (session.mode === "challenge") {
      session.index++;
      if (session.index < session.questions.length) showChallengeQuestion();
      else finishChallenge();
      return;
    }
    if (session.queue.length) showQuestion();
    else finish();
  }
  function finish() {
    if (!session) return;
    const s = session;
    const passedRequired = s.required.every((id) => s.passed.has(id));
    const bonus = completeLessonOnce(progress, s.id, s.mode, passedRequired);
    s.earned += bonus;
    save();
    hud();
    let title, desc, follow;
    if (s.mode === "tutorial") {
      title = "Muhammad Jan welcomes you!";
      desc =
        "You practised four friendly greetings at the Library. Day 1 is open for exploration, or go straight to Muhammad Jan’s Library home-award challenge.";
      follow =
        "Explore home, market, lake and school in any order, or use “Skip to Muhammad Jan’s check-in” on the town screen. His 15-question Library home-award challenge is available now.";
    } else if (s.mode === "review") {
      title = "Your memory is getting stronger!";
      desc =
        "These words will come back at longer intervals if you recall them successfully.";
      follow = "Return to the world map and continue learning.";
    } else {
      title = `${displayPlace(s.loop, s.loc)} — Day ${s.loop} visit complete!`;
      desc = `You practised ${s.required.length} lesson items and practised ${s.recall.length} earlier ones.${bonus ? " First-time bonus: +25 XP!" : ""}`;
      follow =
        s.loop === 1
          ? completeRound(1)
            ? "Your four visits are complete. Muhammad Jan is ready for your 15-question check-in."
            : "Explore the remaining locations, or try Muhammad Jan’s check-in now."
          : s.loop === 2
            ? completeRound(2)
              ? "Your village visits are complete. Muhammad Jan is ready for your check-in."
              : "In the regular story path, visit the market and lake after school, then go home. You can also try Muhammad Jan’s challenge now."
            : s.loop === 3
              ? completeRound(3)
                ? "Your Day 3 visits are complete. Speak with Edris about dinner in your final challenge."
                : "Keep practising “I” sentences, or skip straight to Edris’s dinner-shopping conversation."
              : completeRound(s.loop)
                ? `All four Day ${s.loop} visits completed! The 15-question Town Challenge is ready. Pass with 12/15 to unlock the next day.`
                : "Visit the other locations to practise, or take the 15-question Town Challenge now.";
    }
    if (s.loop >= 6)
      follow =
        s.loop === 6
          ? "Practise the other town locations, or join Saleha and Mina in the Hills: 15 turns, 12 correct to pass."
          : "Practise the other locations, or take Ms Hameed’s separate School examination: 25 turns, 20 correct to pass.";
    if (s.loop >= 8)
      follow = `Practise the other locations, or take the ${getChallengeSpec(s.loop).questionCount}-question final challenge. Week 2 remains draft content for native review.`;
    if (characterStatus(progress).level > s.initialLevel)
      desc += ` ✨ Level ${characterStatus(progress).level} reached!`;
    $("resultHeading").textContent = title;
    $("resultDescription").textContent = desc;
    $("resultAccuracy").textContent = `${s.firstCorrect}/${s.firstAsked.size}`;
    $("resultXP").textContent = `+${s.earned}`;
    $("resultKnowledge").textContent =
      `${s.passed.size}/${new Set([...s.required, ...s.recall]).size}`;
    $("resultNext").textContent = follow;
    $("resultReplay").textContent =
      s.mode === "tutorial"
        ? "Repeat greetings tutorial"
        : s.mode === "review"
          ? "Review again"
          : "Practise this location again";
    $("resultWorld").textContent = "Return to town →";
    view("resultScreen");
  }

  // Pronunciation: bundled Pashto MP3 first, then the browser's available Pashto speech service.
  // Browsers may populate their voice list asynchronously, so never treat the first empty list as final.
  let playback = null;
  let currentSpoken = null;
  let activeUtterance = null;
  let audioRequest = 0;
  const bundledAudioIds = new Set(BUNDLED_AUDIO_IDS);
  function audioStatus(message) {
    $("audioStatus").textContent = message;
  }
  function stopAudio() {
    audioRequest++;
    try {
      if (playback) {
        playback.pause();
        playback.currentTime = 0;
      }
    } catch (e) {}
    playback = null;
    activeUtterance = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  function speechVoices() {
    if (!("speechSynthesis" in window)) return [];
    try {
      return window.speechSynthesis.getVoices();
    } catch (e) {
      return [];
    }
  }
  function pashtoVoice() {
    const voices = speechVoices();
    const matches = voices.filter(
      (voice) =>
        /^ps(?:[-_]|$)/i.test(voice.lang || "") ||
        /pashto|pakhto|pukhto/i.test(voice.name || ""),
    );
    return (
      matches.find((voice) => /^ps[-_]AF$/i.test(voice.lang || "")) ||
      matches.find((voice) => /neural|natural|online/i.test(voice.name || "")) ||
      matches[0] ||
      null
    );
  }
  function waitForPashtoVoice() {
    const voice = pashtoVoice();
    if (voice || speechVoices().length) return Promise.resolve(voice);
    if (!("speechSynthesis" in window)) return Promise.resolve(null);
    return new Promise((resolve) => {
      let settled = false;
      const synth = window.speechSynthesis;
      const finish = () => {
        if (settled) return;
        settled = true;
        synth.removeEventListener?.("voiceschanged", changed);
        clearTimeout(timer);
        resolve(pashtoVoice());
      };
      const changed = () => {
        if (pashtoVoice() || speechVoices().length) finish();
      };
      synth.addEventListener?.("voiceschanged", changed);
      const timer = setTimeout(finish, 700);
      changed();
    });
  }
  async function speakWithBrowserVoice(w, request) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      audioStatus("⚠️ This browser has no speech synthesis. A Pashto MP3 pack is needed.");
      return;
    }
    const voice = await waitForPashtoVoice();
    if (request !== audioRequest || currentSpoken !== w.id) return;
    const utterance = new SpeechSynthesisUtterance(w.ps);
    activeUtterance = utterance; // Keep the utterance alive until playback finishes.
    utterance.lang = "ps-AF";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.82;
    utterance.onerror = (event) => {
      if (request !== audioRequest) return;
      audioStatus(
        "⚠️ Browser speech failed (" +
          (event.error || "unknown error") +
          "). Try a compatible Pashto voice or a recorded audio pack.",
      );
      activeUtterance = null;
    };
    utterance.onstart = () => {
      if (request !== audioRequest) return;
      audioStatus(
        voice
          ? "🔊 Speaking with " + voice.name + " (Laghman pronunciation not verified)."
          : "🔊 Using the browser's ps-AF speech fallback. Check pronunciation carefully; a Pashto voice was not identified.",
      );
    };
    utterance.onend = () => {
      if (request === audioRequest) activeUtterance = null;
    };
    try {
      if (!voice)
        audioStatus(
          "🔊 Requesting Pashto (ps-AF) speech from this browser. No Pashto voice was identified; pronunciation may be incorrect.",
        );
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      if (request === audioRequest) {
        activeUtterance = null;
        audioStatus("⚠️ Browser speech could not start. A compatible Pashto voice or MP3 is needed.");
      }
    }
  }
  function speak(id) {
    const w = wordById[id];
    if (!w?.ps) return;
    stopAudio();
    const request = audioRequest;
    currentSpoken = w.id;
    if (!bundledAudioIds.has(w.id)) {
      void speakWithBrowserVoice(w, request);
      return;
    }
    const player = new Audio("audio/" + encodeURIComponent(w.id) + ".mp3");
    playback = player;
    const fallback = () => {
      if (request !== audioRequest || playback !== player) return;
      playback = null;
      void speakWithBrowserVoice(w, request);
    };
    player.onplay = () => {
      if (request === audioRequest)
        audioStatus("🔊 Playing " + w.ps + " (Pashto recording).");
    };
    player.onerror = fallback;
    player.play().catch(fallback);
  }
  $("teachSpeak").addEventListener("click", () => {
    if (session) speak(studyList()[session.cardIndex]);
  });
  $("quizSpeak").addEventListener("click", () => {
    if (session?.mode === "challenge") {
      const q = session.questions[session.index];
      if (q) speak(q.audioId || q.id);
    } else if (session?.queue.length) speak(session.queue[0].id);
  });
  $("grammarSpeak").addEventListener("click", () => {
    if (!session) return;
    const firstExample = {
      residential: "s-it-door",
      nature: "s-it-river",
      business: "s-it-market",
      school: "s-it-school",
    };
    const id =
      session.loop === 3 && session.loc === "nature"
        ? "s1-water"
        : session.loop === 1
          ? firstExample[session.loc]
          : (courses[session.loop + "-" + session.loc] || []).find(
              (x) => wordById[x]?.type === "sentence",
            );
    if (session?.loop === 6 && session.loc === "nature") speak("w6-we-run");
    else if (session?.loop === 7 && session.loc === "business")
      speak("w7-market-apples");
    else if (id) speak(id);
  });
  $("startTutorial").addEventListener("click", () => begin("tutorial"));
  $("replayGuide").addEventListener("click", () => begin("tutorial"));
  $("teachNext").addEventListener("click", afterStudy);
  $("sovNext").addEventListener("click", afterGrammar);
  $("quizNext").addEventListener("click", nextQuestion);
  $("navWorld").addEventListener("click", startWorld);
  $("resultWorld").addEventListener("click", startWorld);
  $("resultReplay").addEventListener("click", () => {
    if (session) {
      if (session.mode === "challenge") startChallenge(session.loop);
      else begin(session.id);
    }
  });
  $("reviewBtn").addEventListener("click", () => begin("review"));
  $("startChallenge").addEventListener("click", () =>
    startChallenge(selectedLoop),
  );
  $("skipDayBtn").addEventListener("click", () => startChallenge(selectedLoop));
  $("undoTile").addEventListener("click", () => {
    if (
      session?.mode === "challenge" &&
      session.built.length &&
      !session.locked
    ) {
      session.built.pop();
      renderBuiltSentence();
    }
  });
  $("clearTiles").addEventListener("click", () => {
    if (session?.mode === "challenge" && !session.locked) {
      session.built = [];
      renderBuiltSentence();
    }
  });
  $("checkBuild").addEventListener("click", () => {
    if (session?.mode === "challenge" && !session.locked) {
      const q = session.questions[session.index],
        w = wordById[q.id] || null,
        tiles = buildTiles(w, q);
      if (
        questionUsesDuds(q)
          ? session.built.length > 0
          : session.built.length === tiles.length
      ) {
        answerChallenge(session.built.map((i) => tiles[i].word).join(" "));
      }
    }
  });
  for (const b of document.querySelectorAll(".map-point:not(.library)"))
    b.addEventListener("click", () =>
      navigatePlace(selectedLoop, b.dataset.place),
    );
  $("resetProgress").addEventListener("click", () => {
    stopAudio();
    if (
      confirm("Reset all XP, unlocked locations and spaced-repetition history?")
    ) {
      progress = fresh();
      session = null;
      selectedLoop = 1;
      $("introScreen").append(document.querySelector(".worldmap"));
      save();
      hud();
      view("introScreen");
    }
  });
  if (progress.tutorialDone)
    selectedLoop = loops.filter((l) => allowed(l.id)).at(-1)?.id || 1;
  libraryInit();
  document.addEventListener("click", () => {
    queueMicrotask(() => {
      if (session?.mode === "challenge" && !session.restoring) save();
    });
  });
  // @TEST_HOOK
  $("lessonScreen").insertBefore($("addressTarget"), $("teachPanel"));
  save();
  hud();
  if (progress.tutorialDone) startWorld();
  else view("introScreen");
  if (progress.activeChallenge) restoreLibraryChallenge();
  if (saveProblem) {
    const dialog = document.createElement("dialog");
    dialog.id = "saveCompatibility";
    dialog.setAttribute("aria-label", "Incompatible saved progress");
    const message = document.createElement("p");
    message.textContent = saveProblem;
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "primary";
    reset.textContent = "Reset incompatible save and start";
    reset.addEventListener("click", () => {
      saveProblem = null;
      progress = fresh();
      save();
      location.reload();
    });
    dialog.addEventListener("cancel", (e) => e.preventDefault());
    dialog.append(message, reset);
    document.body.append(dialog);
    dialog.showModal();
  }
})();
