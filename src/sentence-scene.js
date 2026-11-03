/* Semantic previews are retired. Keep dialogue context without rendering boards. */
function createSentenceScene({setConversation}) {
  function clearSentenceScene(){ for(const el of document.querySelectorAll('.sentence-scene'))el.remove(); }
  function sentenceContext(w,host,panel,purpose='study',context={}) {
    clearSentenceScene();
    if(purpose==='reference'||!w?.generated)return;
    const partner=context.dialogueContext?.responseAddressee || (context.recipient&&context.recipient!=='Player'?context.recipient:host);
    setConversation({instructorId:host,speakerId:context.speaker||host,partnerId:partner});
  }
  return {clearSentenceScene,sentenceContext};
}
