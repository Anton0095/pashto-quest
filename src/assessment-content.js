/* Assessment blueprints prescribe task kinds and English scenarios, never sentences. */
function createAssessmentContent({ content, progression }) {
  function blueprint(day) {
    const count = progression.getChallengeSpec(day).questionCount;
    const kinds = Array.from({ length: count }, (_, i) =>
      i < 5 ? "word" : ["construct", "dialogue", "sentence"][(i - 5) % 3],
    );
    return {
      count,
      kinds,
      scenario: content.curriculum.days[day - 1].challenge,
    };
  }
  return { blueprint };
}
