const SAVE_VERSION = 4;
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
  library: LibraryEngine.state(),
  rewards: {},
  complete: {},
  challenges: {},
  tutorialDone: false,
  sovSeen: false,
  personIntros: {},
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
    scene:
      day === 1
        ? "library"
        : day >= 8
          ? day === 14
            ? "school"
            : week2Days[day].opening
          : day === 6
            ? "hills"
            : day === 7
              ? "school"
              : day === 3
                ? "business"
                : day === 5
                  ? "nature"
                  : "residential",
    title:
      day >= 8
        ? week2Days[day].title
        : day === 6
          ? "Together in the Hills"
          : day === 7
            ? "Ms Hameed’s Week 1 examination"
            : null,
  };
}

function awardXP(p, key, amount) {
  if (p.rewards[key]) return 0;
  p.rewards[key] = true;
  p.xp += amount;
  return amount;
}
function completeLessonOnce(p, id, mode, passed) {
  if (!passed) return 0;
  if (mode === "tutorial" && !p.tutorialDone) p.tutorialDone = true;
  else if (mode === "standard" && !p.complete[id]) p.complete[id] = true;
  else return 0;
  p.xp += 25;
  return 25;
}
