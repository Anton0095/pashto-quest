/* Current save validation, local storage and live assessment snapshots. No migrations. */
function createStorage({
  state,
  content,
  progression,
  backend,
}) {
  const KEY = "pashto-town-days-v1";
  let saveProblem = null, persistenceProblem = null, readBlocked = false;
  let notifyPersistence = () => {};
  let observed, conflict = false;
  try { observed = accessInitial(); } catch {}
  function accessInitial() { return (backend || globalThis.localStorage).getItem(KEY); }
  function checkExternalChange() {
    if (conflict) return false;
    try {
      const current = access().getItem(KEY);
      if ((observed === undefined && current !== null) || (observed !== undefined && current !== observed)) {
        conflict = true;
        persistenceFailure("Newer saved progress exists in another tab. This tab has not overwritten it. Export this tab’s progress if needed, then reload to use the newer save. Progress records are not merged.");
        return false;
      }
      return true;
    } catch {
      return persistenceFailure("Progress has not been saved: current browser storage could not be checked. Retry or export before closing this tab.");
    }
  }
  if (!backend && typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("storage", event => { if (event.key === KEY || event.key === null) checkExternalChange(); });
    globalThis.addEventListener("pageshow", checkExternalChange);
    globalThis.document?.addEventListener("visibilitychange", () => { if (!document.hidden) checkExternalChange(); });
  }
  const access = () => backend || globalThis.localStorage;
  function persistenceFailure(message) {
    persistenceProblem = message;
    notifyPersistence(message);
    return false;
  }
  const currentSave = createSaveValidator({ content, progression });

  function load() {
    let raw;
    try {
      raw = access().getItem(KEY);
      observed = raw;
    } catch (error) {
      readBlocked = true;
      persistenceFailure("Progress has not been saved: browser storage is unavailable. Progress stays in this tab. Retry or export before closing it.");
      return progression.fresh();
    }
    if (!raw) return progression.fresh();
    try {
      const p = JSON.parse(raw);
      if (!currentSave(p)) throw Error("Unsupported or invalid save schema");
      return p;
    } catch (error) {
      saveProblem =
        "This save belongs to an older or incompatible version. This release uses save format 7 and does not convert old saves. Your stored data has not been changed. Reset it explicitly to start this version.";
      return progression.fresh();
    }
  }
  function snapshot() {
    if (state.session?.mode === "challenge") {
      if (state.session.finished) delete state.progress.activeChallenge;
      else state.progress.activeChallenge = JSON.parse(JSON.stringify(state.session));
    }
    LibraryEngine.compactHistory(state.progress, [state.session, state.progress.activeChallenge]);
    return JSON.stringify(state.progress);
  }
  function save() {
    if (saveProblem) return false;
    try {
      const target = access();
      if (readBlocked) {
        if (target.getItem(KEY))
          return persistenceFailure("Progress has not been saved: existing progress could not be read at startup. Export this tab’s progress, then reload to recover the existing save. Retry will not overwrite it.");
        readBlocked = false;
        observed = null;
      }
      if (!checkExternalChange()) return false;
      const raw = snapshot();
      if (raw !== observed) {
        target.setItem(KEY, raw);
        if (target.getItem(KEY) !== raw) throw Error("Storage did not retain progress");
      }
      observed = raw;
      persistenceProblem = null;
      notifyPersistence(null);
      return true;
    } catch (error) {
      return persistenceFailure("Progress has not been saved: browser storage is full or unavailable. Progress stays in this tab. Retry or export before closing it.");
    }
  }

  return {
    load,
    save,
    currentSave,
    snapshot,
    onPersistenceChange(listener) {
      notifyPersistence = listener;
      listener(persistenceProblem);
    },
    get persistenceProblem() { return persistenceProblem; },
    get problem() {
      return saveProblem;
    },
    resetProblem() {
      saveProblem = null;
    },
  };
}
