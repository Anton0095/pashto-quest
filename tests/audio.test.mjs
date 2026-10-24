import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const start = source.indexOf('  // Pronunciation:');
const end = source.indexOf('  $("teachSpeak").addEventListener', start);
assert(start >= 0 && end > start, 'audio implementation not found');
const audioSource = source.slice(start, end);

const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture(audioIds = [], initialVoices = []) {
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
      utterance.onstart?.();
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
    wordById: { a: { id: 'a', ps: 'سلام' }, b: { id: 'b', ps: 'مننه' } },
    $, window, SpeechSynthesisUtterance: Utterance, Audio,
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
  await tick();
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
console.log('Audio voice and bundled-file fallbacks: 5 groups passed.');
