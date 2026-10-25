import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const start = source.indexOf('  // Pronunciation:');
const end = source.indexOf('  $("teachSpeak").addEventListener', start);
assert(start >= 0 && end > start, 'audio implementation not found');
const audioSource = source.slice(start, end);
const phrases = JSON.parse(readFileSync('content/NARRATIVE_EXPRESSIONS.json', 'utf8')).expressions.filter((p) => p.active);

const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture(audioIds = [], initialVoices = [], startSpeech = true) {
  let voices = initialVoices;
  const spoken = [];
  const statuses = [];
  const players = [];
  const listeners = new Map();
  const speech = {
    getVoices: () => voices,
    cancel() {},
    speak(utterance) {
      spoken.push({ text: utterance.text, lang: utterance.lang, voice: utterance.voice?.name ?? null });
      if (startSpeech) utterance.onstart?.();
    },
    addEventListener(event, callback) { listeners.set(event, callback); },
    removeEventListener(event) { listeners.delete(event); },
  };
  class Utterance {
    constructor(text) { this.text = text; }
  }
  class Audio {
    constructor(path) { this.path = path; players.push(this); }
    play() { this.onplay?.(); return Promise.resolve(); }
    pause() {}
  }
  const window = { speechSynthesis: speech, SpeechSynthesisUtterance: Utterance };
  const $ = () => ({ set textContent(value) { statuses.push(value); } });
  const sandbox = {
    BUNDLED_AUDIO_IDS: audioIds,
    wordById: { a: { id: 'a', ps: 'سلام' }, b: { id: 'b', ps: 'مننه' }, ...Object.fromEntries(phrases.map((p) => [p.id, {id:p.audioContentId, ps:p.pashto}])) },
    $, document: { querySelectorAll: () => [] }, window, SpeechSynthesisUtterance: Utterance, Audio,
    setTimeout, clearTimeout,
  };
  runInNewContext(audioSource + '\nthis.audioApi = { speak, pashtoVoice, stopAudio };', sandbox);
  return {
    api: sandbox.audioApi, spoken, statuses, players,
    setVoices(next) { voices = next; listeners.get('voiceschanged')?.(); },
  };
}

{
  const t = fixture([], [{ lang: 'ps-AF', name: 'Microsoft Pashto Neural' }]);
  t.api.speak('a');
  await tick();
  assert.equal(t.spoken.length, 1);
  assert.equal(t.spoken[0].voice, 'Microsoft Pashto Neural');
  assert.equal(t.spoken[0].lang, 'ps-AF');
  assert.equal(t.players.length, 0, 'missing MP3 must not cause a fetch attempt');
}
{
  const t = fixture([], [{ lang: 'en-US', name: 'English' }]);
  t.api.speak('a');
  await new Promise((r) => setTimeout(r, 750));
  assert.equal(t.spoken.length, 1);
  assert.equal(t.spoken[0].voice, null, 'do not explicitly select an unrelated language voice');
  assert(t.statuses.some((status) => status.includes('pronunciation')));
}
{
  const t = fixture([], []);
  t.api.speak('a');
  t.setVoices([{ lang: 'ps-AF', name: 'Late Pashto Voice' }]);
  await tick();
  assert.equal(t.spoken[0]?.voice, 'Late Pashto Voice', 'late voiceschanged must be honoured');
}
{
  const t = fixture([], [{ lang: 'ps-AF', name: 'Pashto' }]);
  t.api.speak('a');
  t.api.speak('b');
  await tick();
  assert.deepEqual(t.spoken.map((x) => x.text), ['مننه'], 'stale requests must not play');
}
{
  const t = fixture(['a'], [{ lang: 'ps-AF', name: 'Pashto' }]);
  t.api.speak('a');
  await tick();
  assert.equal(t.players.length, 1);
  assert.equal(t.players[0].path, 'audio/a.mp3');
  assert.equal(t.spoken.length, 0, 'a bundled recording takes priority');
}
{
  const t = fixture([], [{ lang: 'ps-AF', name: 'Pashto Basic' }, { lang: 'ps-AF', name: 'Microsoft Pashto Neural' }, { lang: 'ur-PK', name: 'Urdu Neural' }]);
  assert.equal(t.api.pashtoVoice().name, 'Microsoft Pashto Neural', 'prefer neural within Afghan Pashto voices');
}
{
  const t = fixture([], [{lang: 'en-US', name: 'English'}, {lang: 'fa-IR', name: 'Persian'}, {lang: 'ur-PK', name: 'Urdu'}]);
  t.api.speak('a');
  t.setVoices([{lang: 'ps-AF', name: 'Delayed Windows Pashto Neural'}]);
  await tick();
  assert.equal(t.spoken[0].voice, 'Delayed Windows Pashto Neural', 'late Pashto must work even when other languages loaded first');
}
for (const phrase of phrases) {
  const bundled = fixture([phrase.audioContentId], [{lang:'ps-AF',name:'Pashto Neural'}]);
  bundled.api.speak(phrase.id); await tick();
  assert.equal(bundled.players[0].path, `audio/${phrase.audioContentId}.mp3`);
  assert.equal(bundled.spoken.length,0);
  const device = fixture([], [{lang:'ps-AF',name:'Windows Pashto Neural'}]);
  device.api.speak(phrase.id); await tick();
  assert.equal(device.spoken[0].text,phrase.pashto);
  assert.equal(device.spoken[0].voice,'Windows Pashto Neural');
  const failed = fixture([phrase.audioContentId], [{lang:'ps-AF',name:'Pashto'}]);
  failed.api.speak(phrase.id);
  failed.players[0].onerror();await tick();
  assert.equal(failed.spoken[0].text,phrase.pashto,'unavailable recording falls back through the same browser engine');
}
{
  const t=fixture([],[]);t.api.speak(phrases[0].id);t.api.stopAudio();
  t.setVoices([{lang:'ps-AF',name:'Late voice'}]);await tick();
  assert.equal(t.spoken.length,0,'navigation cancels pending expression pronunciation');
}
{
  const t=fixture([], [{lang:'en-US',name:'Pashto course narration (English)'},{lang:'fa-IR',name:'Persian'},{lang:'ur-PK',name:'Urdu'}]);
  assert.equal(t.api.pashtoVoice(),null,'declared unrelated languages are not Pashto voices');
  const pending=fixture([], [{lang:'ps-AF',name:'Pashto Neural'}],false);
  pending.api.speak(phrases[0].id);await tick();
  assert(pending.statuses.at(-1).includes('Playback has not started'));
  assert(!pending.statuses.some(s=>s.includes('Speaking with')),'an attempted request is not playback success');
}
console.log('Audio: 7 restoration groups + both active expression IDs (MP3 priority, device voice, failed MP3 fallback) + cancellation passed. Mocked APIs; physical devices unverified.');
