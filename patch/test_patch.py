from pathlib import Path
import importlib.util,re,subprocess,json,sys,tempfile
m=Path(__file__).with_name('apply_week2_interactions.py')
spec=importlib.util.spec_from_file_location('feature_patch',m);p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
# The real Week 1 Codex build contains these exact anchors; verify selectors against a synthetic fixture.
html='''<!doctype html><html><head><style></style></head><body><script>
const $=()=>({});const session={};const wordById={};const progress={};
function showChallengeQuestion(){
 const q=session.questions[session.index],w=q.kind==='address'||q.kind==='choice'?null:wordById[q.id];
 if(q.kind==='choice'){
  $('quizType').textContent=(q.section||'Hills conversation').toUpperCase();$('quizPrompt').textContent=q.prompt;
   $('quizPashto').textContent='';$('quizRoman').textContent=q.comment||'Choose one response. Your first answer counts.';
  }
  if(session.loop>=6){$('guideMessage').textContent=q.comment||q.prompt;}
}
function answerChallenge(value){
 const q=session.questions[session.index],w=q.kind==='address'||q.kind==='choice'?null:wordById[q.id];
 const correct=q.kind==='address'||q.kind==='choice'?normalizeAnswer(value)===normalizeAnswer(q.correct):q.kind==='construct'?normalizeAnswer(value)===normalizeAnswer(w.ps):(value===(q.direction==='ps-en'?w.en:w.ps));
 if(q.kind==='choice'){
  const rewardKey=`exam-v${EXAM_VERSION}:${session.loop}:${q.id}`;let gain=0;
  }
}
function buildTiles(w){
  return w.ps.replace(/[.!؟،]/g,'').split(/\\s+/).filter(Boolean).map((word,i)=>({word,index:i}));
}
function renderBuiltSentence(){const q=session.questions[session.index];const target=buildTiles(wordById[q.id]);
 $('checkBuild').disabled=session.locked||session.built.length!==target.length;
}
$('quizSpeak').addEventListener('click',()=>{if(session?.mode==='challenge'){const q=session.questions[session.index];if(q)speak(q.audioId||q.id);}else if(session?.queue.length)speak(session.queue[0].id);});
$('checkBuild').addEventListener('click',()=>{if(session?.mode==='challenge'&&!session.locked){const w=wordById[session.questions[session.index].id];const tiles=buildTiles(w);if(session.built.length===tiles.length){answerChallenge(session.built.map(i=>tiles[i].word).join(' '));}}});
</script></body></html>'''
patched=p.apply(html)
assert "function getDialogueTiles(q)" in patched
assert "q.kind==='dialogue'" in patched
assert "renderMixedPashto($('quizPrompt'),q.prompt)" in patched
with tempfile.TemporaryDirectory() as d:
 f=Path(d)/'fixture.js';f.write_text(patched.split('<script>')[1].split('</script>')[0]);v=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 print('JS syntax:',v.returncode,v.stderr)
 if v.returncode:sys.exit(1)
 test=Path(d)/'runtime.cjs'
 test.write_text(p.HELPERS+'''\nconst assert=require('assert');
const a={kind:'dialogue',promptPs:'ته څه څښې؟',answerPs:'زه اوبه څښم.',duds:['کتاب','څښې']};
const t=getDialogueTiles(a);assert.deepStrictEqual(t.map(x=>x.word),['زه','اوبه','څښم','کتاب','څښې']);
assert.strictEqual(normalizePashtoResponse(' زه   اوبه څښم. '), 'زه اوبه څښم');
assert.strictEqual(normalizePashtoResponse('زه اوبه څښم.'),normalizePashtoResponse('زه  اوبه  څښم'));
assert.notStrictEqual(normalizePashtoResponse('زه اوبه څښم.'),normalizePashtoResponse('زه کتاب څښم'));
assert.throws(()=>getDialogueTiles({...a,duds:['زه','څښې']}));
assert.throws(()=>getDialogueTiles({...a,duds:['کتاب','کتاب']}));
assert.throws(()=>getDialogueTiles({...a,duds:['کتاب']}));
assert.strictEqual(isDialogueAnswerCorrect(a,'زه  اوبه څښم'),true);
assert.strictEqual(isDialogueAnswerCorrect(a,'زه کتاب څښم'),false);
assert.strictEqual(isDialogueAnswerCorrect({...a,acceptedPs:['اوبه څښم.']},'اوبه څښم'),true);
global.session={loop:8};
assert.strictEqual(questionUsesDuds({kind:'construct',duds:['کتاب','څښې']}),true);
assert.strictEqual(getAnswerTiles('زه اوبه څښم.', ['کتاب','څښې']).length,5);
global.session={loop:7};
assert.strictEqual(questionUsesDuds({kind:'construct',duds:['کتاب','څښې']}),false);
console.log('dialogue tiles and normalization passed');
''')
 v=subprocess.run(['node',str(test)],capture_output=True,text=True)
 print(v.stdout,v.stderr)
 if v.returncode:sys.exit(1)
print('Patch-injection and feature tests passed')
