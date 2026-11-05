/* One indexed-tile interaction and success feedback for every construction surface. */
function createConstructionUI({ ui, audio }) {
  const instructions = hasDuds => hasDuds
    ? "Choose only the tiles you need. Leave the distractor tiles unused."
    : "Use every tile once. Put the Pashto words in order.";
  const ready = (tiles, built) => tiles.some(t => t.dud) ? built.length > 0 : built.length === tiles.length;
  function draw({area, bank, undo, clear, check}, model, tiles, order, change) {
    area.replaceChildren();bank.replaceChildren();
    if (!model.built.length) area.append(ui.node("span", "Tap the Pashto tiles below…", "build-placeholder"));
    for (const [pos, index] of model.built.entries()) {
      const b = ui.button(tiles[index].word, () => {
        if (model.locked) return;
        model.built.splice(pos, 1);change();
      });
      b.className="built-token";b.lang="ps";b.dir="rtl";
      b.disabled=model.locked;
      b.setAttribute("aria-label", CharacterNames.text(`Remove word ${tiles[index].word}`));
      area.append(b);
    }
    for (const index of order) {
      const b = ui.button(tiles[index].word, () => {
        if (model.locked || model.built.includes(index)) return;
        model.built.push(index);change();
      });
      b.className="word-tile";b.lang="ps";b.dir="rtl";
      b.dataset.tileIndex=String(index);
      b.disabled=model.locked || model.built.includes(index);
      bank.append(b);
    }
    undo.disabled=clear.disabled=model.locked || !model.built.length;
    check.disabled=model.locked || !ready(tiles, model.built);
  }
  function globalControls() {
    return {area:ui.$("builtSentence"),bank:ui.$("wordTiles"),undo:ui.$("undoTile"),clear:ui.$("clearTiles"),check:ui.$("checkBuild")};
  }
  function present(card, q, day) {
    ui.$("lessonScreen").classList.add("construction-active");
    ui.$("quizType").textContent="BUILD A SENTENCE";
    ui.$("quizPashto").textContent=CharacterNames.text(q.answerEnglish || card.en);
    ui.$("quizPashto").lang="en";ui.$("quizPashto").dir="ltr";
    ui.$("quizPashto").classList.add("english-question");
    ui.$("quizRoman").textContent="";
    ui.$("quizPrompt").textContent="Construct this meaning in Pashto.";
    ui.$("quizPanel").querySelector(".quizword h3").textContent=instructions(QuestionEngine.questionUsesDuds(q,day));
    ui.$("quizSpeak").classList.add("hidden");
    ui.$("constructionPanel").classList.remove("hidden");
  }
  function feedback(root, card, q, correct) {
    ui.renderAnswerFeedback(root,card,q,correct,()=>audio.speak(card.id));
  }
  // Standalone instances share rendering/feedback but keep their own answer locks.
  function mount(root, card, q, {onAnswer = () => {}, retry = false, tiles: suppliedTiles, draft, onChange = () => {}} = {}) {
    const model=draft || {built:[],locked:false}, tiles=suppliedTiles || QuestionEngine.buildTiles(card,q);
    const order=draft?.order || QuestionEngine.shuffle(tiles.map(t => t.index));
    if (!draft?.order && order.length>1 && order.every((n,i)=>n===i)) [order[0],order[1]]=[order[1],order[0]];
    if (draft) draft.order=order;
    root.classList.add("construction-practice");
    root.append(ui.node("h4", card.en), ui.node("p", instructions(tiles.some(t=>t.dud))));
    const area=ui.node("div",undefined,"built-sentence"),bank=ui.node("div",undefined,"word-tiles"), row=ui.node("div",undefined,"buttons build-actions"), result=ui.node("div",undefined,"feedback");
    for (const el of [area,bank]) {el.lang="ps";el.dir="rtl";}
    area.setAttribute("aria-live","polite");result.setAttribute("role","status");
    const undo=ui.button("↶ Undo",()=>{model.built.pop();render();}),clear=ui.button("Clear",()=>{model.built=[];render();}),check=ui.button("Check sentence",()=>{
      if (model.locked || !ready(tiles,model.built)) return;
      const value=model.built.map(i=>tiles[i].word).join(" "), correct=QuestionEngine.evaluate(q,card,value);
      model.locked=correct || !retry;
      onAnswer(correct,value);
      render();area.classList.add(correct?"build-success":"build-error");
      feedback(result,card,q,correct);
    });
    check.className="primary";
    const render=()=>{area.classList.remove("build-success","build-error");draw({area,bank,undo,clear,check},model,tiles,order,render);onChange();};
    row.append(undo,clear,check);root.append(area,bank,row,result);render();
  }
  return {instructions, ready, draw, globalControls, present, feedback, mount};
}
