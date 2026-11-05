/* Shared choice feedback; intentional retry/score policies stay with consumers. */
// Store values separately from decorated/translated button labels.
  function showAnswerFeedback(root, expected, submitted, { lock = true, accepts = value => value === expected } = {}) {
    for (const b of root.querySelectorAll("button[data-answer], button.choice")) {
      const value = b.dataset.answer ?? b.textContent;
      b.disabled = lock;
      b.classList.add("choice");
      const correct = accepts(value);
      b.classList.toggle("correct", correct);
      b.classList.toggle("wrong", value === submitted && !correct);
      b.removeAttribute("aria-label");
      if (correct) b.setAttribute("aria-label", CharacterNames.text(value) + " · Correct answer");
      else if (value === submitted) b.setAttribute("aria-label", CharacterNames.text(value) + " · Incorrect answer");
    }
  }

/* Presentation only; answer acceptance and rewards remain in their owners. */
function renderAnswerFeedback(root, card, question, correct, onSpeak) {
  root.replaceChildren();
  root.classList.add('answer-feedback');
  const status=document.createElement('strong');status.className=correct?'good':'bad';status.textContent=correct?'✓ Correct':'✗ Incorrect';
  const translation=document.createElement('div');translation.className='answer-translation';
  const pashto=document.createElement('bdi');pashto.lang='ps';pashto.dir='rtl';pashto.textContent=CharacterNames.text(question.answerPs||card.ps);
  const meaning=document.createElement('bdi');meaning.dir='ltr';meaning.textContent=CharacterNames.text(` (${card.roman}) — ${question.answerEnglish||card.en}`);
  translation.append(pashto,meaning);root.append(status,translation);
  if(correct&&onSpeak){const button=document.createElement('button');button.type='button';button.className='speaker';button.textContent='Hear the correct sentence';button.addEventListener('click',onSpeak);root.append(button);}
}
