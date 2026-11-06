/* Common pronunciation player; recordings, device voices, delayed discovery and cancellation. */
function createAudio({
  wordById,
  onSpeak = () => {},
  BUNDLED_AUDIO_IDS,
  $,
  document,
  window,
  Audio,
  SpeechSynthesisUtterance = window.SpeechSynthesisUtterance,
}) {
  // Pronunciation: bundled Pashto MP3 first, then the browser's available Pashto speech service.
  // Browsers may populate their voice list asynchronously, so never treat the first empty list as final.
  let playback = null;
  let currentSpoken = null;
  let activeUtterance = null;
  let audioRequest = 0;
  const bundledAudioIds = new Set(BUNDLED_AUDIO_IDS);
  function audioStatus(message) {
    $("audioStatus").textContent = message;
    for (const node of document.querySelectorAll(
      "[data-expression-audio-status]",
    ))
      node.textContent = message;
  }
  function stopAudio() {
    audioRequest++;
    try {
      if (playback) {
        playback.pause();
        playback.currentTime = 0;
      }
    } catch (e) {}
    playback = null;
    activeUtterance = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  function speechVoices() {
    if (!("speechSynthesis" in window)) return [];
    try {
      return window.speechSynthesis.getVoices();
    } catch (e) {
      return [];
    }
  }
  function pashtoVoice() {
    const voices = speechVoices();
    const matches = voices.filter(
      (voice) =>
        /^ps(?:[-_]|$)/i.test(voice.lang || "") ||
        ((!voice.lang || /^und$/i.test(voice.lang)) &&
          /pashto|pakhto|pukhto/i.test(voice.name || "")),
    );
    return (
      matches.find(
        (voice) =>
          /^ps[-_]AF$/i.test(voice.lang || "") &&
          /neural|natural|online/i.test(voice.name || ""),
      ) ||
      matches.find((voice) => /^ps[-_]AF$/i.test(voice.lang || "")) ||
      matches.find((voice) =>
        /neural|natural|online/i.test(voice.name || ""),
      ) ||
      matches[0] ||
      null
    );
  }
  function waitForPashtoVoice() {
    const voice = pashtoVoice();
    if (voice) return Promise.resolve(voice);
    if (!("speechSynthesis" in window)) return Promise.resolve(null);
    return new Promise((resolve) => {
      let settled = false;
      const synth = window.speechSynthesis;
      const finish = () => {
        if (settled) return;
        settled = true;
        synth.removeEventListener?.("voiceschanged", changed);
        clearTimeout(timer);
        resolve(pashtoVoice());
      };
      const changed = () => {
        if (pashtoVoice()) finish();
      };
      synth.addEventListener?.("voiceschanged", changed);
      const timer = setTimeout(finish, 700);
      changed();
    });
  }
  async function speakWithBrowserVoice(w, request) {
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      audioStatus(
        "⚠️ This browser has no speech synthesis. A Pashto MP3 pack is needed.",
      );
      return;
    }
    const voice = await waitForPashtoVoice();
    if (request !== audioRequest || currentSpoken !== w.id) return;
    const utterance = new SpeechSynthesisUtterance(w.ps);
    activeUtterance = utterance; // Keep the utterance alive until playback finishes.
    utterance.lang = "ps-AF";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.82;
    utterance.onerror = (event) => {
      if (request !== audioRequest) return;
      audioStatus(
        "⚠️ Browser speech failed (" +
          (event.error || "unknown error") +
          "). Try a compatible Pashto voice or a recorded audio pack.",
      );
      activeUtterance = null;
    };
    utterance.onstart = () => {
      if (request !== audioRequest) return;
      audioStatus(
        voice
          ? "🔊 Speaking with " +
              voice.name +
              " (Laghman pronunciation not verified)."
          : "⚠️ The browser started its ps-AF fallback, but no Pashto voice was identified. Pronunciation may be incorrect. Other-language voices are intentionally not selected.",
      );
    };
    utterance.onend = () => {
      if (request === audioRequest) activeUtterance = null;
    };
    try {
      if (!voice)
        audioStatus(
          "⚠️ No Pashto audio available from an identified voice. Requesting the browser's explicit ps-AF fallback; pronunciation may be incorrect. Other-language voices are intentionally not used.",
        );
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      if (request === audioRequest) {
        activeUtterance = null;
        audioStatus(
          "⚠️ Browser speech could not start. A compatible Pashto voice or MP3 is needed.",
        );
      }
    }
  }
  function speak(id) {
    const w = wordById[id];
    if (!w?.ps) return;
    onSpeak(id);
    stopAudio();
    const request = audioRequest;
    currentSpoken = w.id;
    audioStatus("Preparing Pashto pronunciation… Playback has not started.");
    if (!bundledAudioIds.has(w.audioContentId || w.id)) {
      void speakWithBrowserVoice(w, request);
      return;
    }
    const player = new Audio(
      "audio/" + encodeURIComponent(w.audioContentId || w.id) + ".mp3",
    );
    playback = player;
    const fallback = () => {
      if (request !== audioRequest || playback !== player) return;
      playback = null;
      void speakWithBrowserVoice(w, request);
    };
    player.onplay = () => {
      if (request === audioRequest)
        audioStatus("🔊 Playing " + w.ps + " (Pashto recording).");
    };
    player.onerror = fallback;
    player.play().catch(fallback);
  }
  return { speak, stopAudio, pashtoVoice };
}
