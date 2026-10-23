#!/usr/bin/env python3
"""Apply Week 2 dialogue-response/distractor/rendering framework to Pashto Quest index.html.

This intentionally DOES NOT unlock Days 8-14 without native-reviewed course content.
Use against Codex Week 1 branch version (e.g. codex/complete-week1-23850c7).
Never overwrites original without explicit --in-place.
"""
from pathlib import Path
import argparse, hashlib, sys

CSS = r'''
/* Week 2: keep Pashto genuinely legible in embedded prompts and all answer options. */
.inline-pashto{font-family:'Noto Naskh Arabic','Noto Sans Arabic','Segoe UI',serif;
  font-size:clamp(27px,2.4vw,36px);font-weight:700;line-height:1.85;
  unicode-bidi:isolate;direction:rtl;display:inline-block;vertical-align:middle;
  margin-inline:.10em;overflow-wrap:anywhere}
.choice.pashto-option{font-family:'Noto Naskh Arabic','Noto Sans Arabic','Segoe UI',serif;
  font-size:clamp(30px,3.8vw,42px);line-height:1.85;min-height:86px;text-align:center;
  overflow-wrap:anywhere;direction:rtl}
.built-sentence,.word-tiles{direction:rtl}
.word-tile,.built-token{font-size:clamp(29px,3.7vw,39px);line-height:1.65;min-height:66px;
  overflow-wrap:anywhere;white-space:normal}
.quizword .pashto:empty{display:none}
.quizword .pashto[lang="ps"]{font-size:clamp(44px,7vw,70px);line-height:1.7}
@media(max-width:480px){.inline-pashto{font-size:clamp(25px,6vw,34px)}
.choice.pashto-option{font-size:clamp(29px,7vw,38px)}
.word-tile,.built-token{min-height:55px;padding:5px 9px;font-size:clamp(26px,7vw,35px)}}
'''

HELPERS = r'''
/* Only the display text changes. Never embed markup from lesson/question data. */
function renderMixedPashto(element,text){
 const pattern=/([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/gu;
 const source=String(text??'');element.replaceChildren();let last=0;
 for(const match of source.matchAll(pattern)){
  const i=match.index;if(i>last)element.append(document.createTextNode(source.slice(last,i)));
  const span=document.createElement('span');span.className='inline-pashto';span.lang='ps';span.dir='rtl';span.textContent=match[0];
  element.append(span);last=i+match[0].length;
 }
 if(last<source.length)element.append(document.createTextNode(source.slice(last)));
}
function normalizePashtoResponse(value){
 return String(value||'').normalize('NFC').replace(/[.!؟،\u200c]/g,' ').replace(/\s+/g,' ').trim();
}
function getAnswerTiles(answerPs,duds){
 const answer=normalizePashtoResponse(answerPs).split(' ').filter(Boolean);
 const extras=(duds||[]).map(x=>String(x).trim()).filter(Boolean);
 if(!answer.length)throw Error('Empty dialogue answer');
 if(extras.length<2)throw Error('Week 2 tile puzzle requires at least two dud tiles');
 if(extras.some(x=>x.includes(' ')||answer.includes(x))||new Set(extras).size!==extras.length)
  throw Error('Dud tiles must be unique single words not present in the target answer');
 return [...answer,...extras].map((word,index)=>({word,index,dud:index>=answer.length}));
}
function getDialogueTiles(q){
 if(!q||q.kind!=='dialogue')throw Error('A dialogue question is required');
 if(!q.answerPs||!q.promptPs)throw Error('Dialogue requires promptPs and answerPs');
 return getAnswerTiles(q.answerPs,q.duds);
}
function questionUsesDuds(q){return q?.kind==='dialogue'||(q?.kind==='construct'&&session?.loop>=8&&Array.isArray(q.duds)&&q.duds.length>0);}
function isDialogueAnswerCorrect(q,value){
 const valid=[q.answerPs,...(q.acceptedPs||[])];
 return valid.some(v=>normalizePashtoResponse(v)===normalizePashtoResponse(value));
}
'''

DIALOGUE_RENDER = r'''
  if(q.kind==='dialogue'){
   $('quizType').textContent='🗣️ REPLY IN PASHTO';
   $('quizPashto').classList.remove('english-question');
   $('quizPashto').textContent=q.promptPs;$('quizPashto').lang='ps';$('quizPashto').dir='rtl';
   $('quizRoman').textContent=q.promptEnglish||'Listen to the question and answer in Pashto.';
   $('quizPrompt').textContent=`${q.speaker||'Your neighbour'} asks you a question. Build YOUR reply, not a translation of the prompt.`;
   $('quizPanel').querySelector('.quizword h3').textContent='Choose only the tiles you need. Some tiles are distractions.';
   $('quizSpeak').classList.toggle('hidden',!q.audioId);
   $('constructionPanel').classList.remove('hidden');
   session.tileSequence=shuffle(buildTiles(null,q).map(t=>t.index));renderBuiltSentence();
   $('quizFeedback').textContent='Your first submitted answer counts. Leave unused tiles in the bank.';
   $('quizNext').disabled=true;$('quizNext').textContent=session.index===session.questions.length-1?'See results →':'Next question →';
   return;
  }
'''

DIALOGUE_GRADE = r'''
  if(q.kind==='dialogue'){
   const key=`week2-dialogue:${session.loop}:${q.id}`;
   let gain=0;
   if(correct&&!progress.challengeRewards[key]){gain=5;progress.challengeRewards[key]=true;progress.xp+=gain;session.earned+=gain;}
   save();hud();renderBuiltSentence();$('builtSentence').classList.add(correct?'build-success':'build-error');
   const f=$('quizFeedback');f.replaceChildren();
   const heading=document.createElement('strong');heading.className=correct?'good':'bad';
   heading.textContent=correct?`✓ Your reply makes sense. ${gain?`+${gain} XP`:'Already rewarded'}`:'✗ Try building the reply from the meaning of the question.';
   const expected=document.createElement('div');expected.lang='ps';expected.dir='rtl';expected.className='inline-pashto';
   expected.textContent=q.answerPs;const gloss=document.createElement('div');gloss.textContent=q.answerEnglish||'';
   f.append(heading,expected,gloss);$('quizNext').disabled=false;return;
  }
'''

def once(s, old, new, label):
    n=s.count(old)
    if n!=1: raise RuntimeError(f'{label}: expected exactly one matching anchor, found {n}. Keep source unchanged; rebase patch on the current Codex branch.')
    return s.replace(old,new,1)

def apply(s):
    if 'function getDialogueTiles(q)' in s: raise RuntimeError('Week 2 response feature already appears installed; refusing double patch')
    if 'function buildTiles(w)' not in s or "if(q.kind==='choice'){" not in s:
        raise RuntimeError('Expected the completed Week 1 Codex build, not the older main branch; no changes applied.')
    s=once(s,'</style>',CSS+'\n</style>','CSS')
    s=once(s,'function buildTiles(w){',HELPERS+'\nfunction buildTiles(w,q=session?.questions?.[session.index]){','helper functions')
    s=once(s,"return w.ps.replace(/[.!؟،]/g,'').split(/\\s+/).filter(Boolean).map((word,i)=>({word,index:i}));",
       "if(q?.kind==='dialogue')return getDialogueTiles(q);\n  if(questionUsesDuds(q))return getAnswerTiles(w.ps,q.duds);\n  return w.ps.replace(/[.!؟،]/g,'').split(/\\s+/).filter(Boolean).map((word,i)=>({word,index:i}));",'token builder')
    s=once(s,'const target=buildTiles(wordById[q.id]);','const target=buildTiles(wordById[q.id]||null,q);','tile render target')
    s=once(s,"$('checkBuild').disabled=session.locked||session.built.length!==target.length;",
        "$('checkBuild').disabled=session.locked||(questionUsesDuds(q)?session.built.length===0:session.built.length!==target.length);",'submit enabled with unused tiles')
    # Both question display and response grading must allow a dialogue without a wordById record.
    s=s.replace("q.kind==='address'||q.kind==='choice'?null:wordById[q.id]",
                "q.kind==='address'||q.kind==='choice'||q.kind==='dialogue'?null:wordById[q.id]")
    if s.count("q.kind==='address'||q.kind==='choice'||q.kind==='dialogue'?null:wordById[q.id]")!=2:
        raise RuntimeError('question/grade expected to have exactly two special-question guards')
    s=once(s," if(q.kind==='choice'){\n  $('quizType')",DIALOGUE_RENDER+" if(q.kind==='choice'){\n  $('quizType')",'dialogue render')
    s=once(s,'const correct=q.kind===\'address\'||q.kind===\'choice\'?normalizeAnswer(value)===normalizeAnswer(q.correct):',
        "const correct=q.kind==='dialogue'?isDialogueAnswerCorrect(q,value):q.kind==='address'||q.kind==='choice'?normalizeAnswer(value)===normalizeAnswer(q.correct):",'dialogue grading')
    s=once(s," if(q.kind==='choice'){\n  const rewardKey=",DIALOGUE_GRADE+" if(q.kind==='choice'){\n  const rewardKey=",'dialogue feedback')
    s=once(s,"$('quizPrompt').textContent=q.prompt;","renderMixedPashto($('quizPrompt'),q.prompt);",'mixed-language question')
    # The speaker prompts contain Pashto and English, e.g. منډې وهل, and should be readable.
    s=once(s,"$('guideMessage').textContent=q.comment||q.prompt;","renderMixedPashto($('guideMessage'),q.comment||q.prompt);",'mixed-language speaker')
    s=once(s,"$('quizRoman').textContent=q.comment||'Choose one response. Your first answer counts.';",
        "renderMixedPashto($('quizRoman'),q.comment||'Choose one response. Your first answer counts.');",'mixed-language guidance')
    if "if(q)speak(q.id);" in s:
        s=once(s,"if(q)speak(q.id);","if(q)speak(q.audioId||q.id);",'dialogue audio ID')
    elif "if(q)speak(q.audioId||q.id);" not in s:
        raise RuntimeError("Unrecognised challenge pronunciation handler")
    old="const w=wordById[session.questions[session.index].id];const tiles=buildTiles(w);if(session.built.length===tiles.length){answerChallenge(session.built.map(i=>tiles[i].word).join(' '));}"
    new="const q=session.questions[session.index],w=wordById[q.id]||null,tiles=buildTiles(w,q);if(questionUsesDuds(q)?session.built.length>0:session.built.length===tiles.length){answerChallenge(session.built.map(i=>tiles[i].word).join(' '));}"
    s=once(s,old,new,'submit build with dud tiles')
    return s


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('source',type=Path,help='Current index.html from Week 1 Codex branch')
    parser.add_argument('--output',type=Path,help='Write patched HTML here; leave source untouched')
    parser.add_argument('--in-place',action='store_true',help='Explicitly overwrite original after backup')
    args=parser.parse_args()
    if args.in_place and args.output: parser.error('Choose --in-place or --output, not both')
    src=args.source
    if not src.is_file(): parser.error(f'File not found: {src}')
    original=src.read_text(encoding='utf-8')
    patched=apply(original)
    if args.in_place:
        backup=src.with_suffix(src.suffix+'.before-week2.bak')
        backup.write_text(original,encoding='utf-8')
        destination=src
    else: destination=args.output or src.with_name(src.stem+'.week2-preview'+src.suffix)
    destination.write_text(patched,encoding='utf-8')
    print(f'Patched {destination} ({len(original):,} → {len(patched):,} characters).')
    print(f'Source SHA256: {hashlib.sha256(original.encode()).hexdigest()}')
    print('Note: Week 2 day navigation/content must be integrated by Codex before Days 8–14 become playable.')

if __name__=='__main__':
    try: main()
    except RuntimeError as e: print('PATCH ABORTED:',e,file=sys.stderr);sys.exit(2)
