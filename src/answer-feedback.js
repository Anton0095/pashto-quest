/* Shared choice feedback; intentional retry/score policies stay with consumers. */
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
