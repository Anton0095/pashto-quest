/* Save factory, XP, assessment outcomes and access rules. No DOM or storage. */
function createProgression({ curriculum, zoneKeys }, libraryEngine) {
  const SAVE_VERSION = 7;
  const XP_STEP = 200;
  const XP_FLOORS = {
    1: 200,
    2: 400,
    3: 600,
    4: 800,
    5: 1200,
    6: 1600,
    7: 1800,
  };
  const LEVEL_CAPS = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 9, 7: 10 };
  const fresh = () => ({
    saveSchemaVersion: SAVE_VERSION,
    xp: 0,
    library: libraryEngine.state(),
    rewards: {},
    complete: {},
    challenges: {},
    tutorialDone: false,
    playerProfile: { name: "", gender: "unspecified" },
  });
  function highestClearedDay(p) {
    let day = 0;
    for (let next = 1; next <= 7; next++) {
      const record = p.challenges[next];
      if (!record?.passed || record.best < getChallengeSpec(next).passCount)
        break;
      day = next;
    }
    return day;
  }
  function characterStatus(p) {
    const cleared = highestClearedDay(p),
      xp = Number.isFinite(Number(p.xp))
        ? Math.max(0, Math.floor(Number(p.xp)))
        : 0,
      earned = 1 + Math.floor(xp / XP_STEP),
      level = Math.min(earned, LEVEL_CAPS[cleared]);
    return {
      level,
      title: cleared === 7 && level === 10 ? "New Resident" : "Newcomer",
      xp,
      cleared,
      capped: earned > LEVEL_CAPS[cleared] || level === 10,
    };
  }
  function completeChallengeOnce(p, day, score) {
    const spec = getChallengeSpec(day);
    if (!Number.isInteger(score) || score < 0 || score > spec.questionCount)
      throw new RangeError("Invalid assessment score");
    const previous = p.challenges[day] || {
      best: 0,
      attempts: 0,
      passed: false,
    };
    const passed = score >= spec.passCount,
      firstPass = passed && !previous.passed;
    p.challenges[day] = {
      best: Math.max(previous.best, score),
      attempts: previous.attempts + 1,
      passed: previous.passed || passed,
    };
    let base = 0,
      topUp = 0;
    if (firstPass && day <= 7) {
      base = 75;
      p.xp += base;
      topUp = Math.max(0, XP_FLOORS[day] - p.xp);
      p.xp += topUp;
    }
    if (day === 1 && passed) p.homeGranted = true;
    return { passed, firstPass, base, topUp };
  }
  function getChallengeSpec(day) {
    return {
      questionCount: day === 7 || day === 14 ? 25 : 15,
      passCount: day === 7 || day === 14 ? 20 : 12,
      scene: curriculum.days[day - 1].assessment.scene,
      title: curriculum.days[day - 1].assessment.title,
      resultTitle:
        curriculum.days[day - 1].assessment.resultTitle ||
        curriculum.days[day - 1].assessment.title,
    };
  }

  function awardXP(p, key, amount) {
    if (p.rewards[key]) return 0;
    p.rewards[key] = true;
    p.xp += amount;
    return amount;
  }
  function completeLessonOnce(p, id, mode, passed, itemCount) {
    if (!passed) return 0;
    if (mode === "tutorial" && !p.tutorialDone) p.tutorialDone = true;
    else if (mode === "standard" && !p.complete[id]) p.complete[id] = true;
    else return 0;
    const bonus = itemCount > 0 ? 25 : 0;
    p.xp += bonus;
    return bonus;
  }

  function completeRound(progress, number) {
    return zoneKeys.every((z) => progress.complete[`${number}-${z}`]);
  }

  function passedChallenge(progress, day) {
    const record = progress.challenges[day];
    return (
      record?.passed === true && record.best >= getChallengeSpec(day).passCount
    );
  }

  function allowed(progress, number) {
    return (
      Number.isInteger(number) &&
      number >= 1 &&
      number <= curriculum.days.length &&
      progress.tutorialDone &&
      (number === 1 || passedChallenge(progress, number - 1)) &&
      (number < 8 ||
        (highestClearedDay(progress) === 7 &&
          characterStatus(progress).level === 10))
    );
  }

  function placeAccessible(progress, day, place) {
    if (place === "library") return true;
    if (!allowed(progress, day)) return false;
    if (day === 2) {
      if (!progress.complete["2-school"]) return place === "school";
      if (place === "residential")
        return (
          !!progress.complete["2-business"] && !!progress.complete["2-nature"]
        );
    }
    if (day === 1 || day === 2) return true;
    const opening = curriculum.days[day - 1].opening;
    return place === opening || !!progress.complete[`${day}-${opening}`];
  }

  return {
    SAVE_VERSION,
    XP_STEP,
    fresh,
    highestClearedDay,
    characterStatus,
    completeChallengeOnce,
    getChallengeSpec,
    awardXP,
    completeLessonOnce,
    completeRound,
    passedChallenge,
    allowed,
    placeAccessible,
  };
}
