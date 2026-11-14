/* Current-schema validation, coordinated persistence and frozen assessment snapshots. */
function createStorage({
  state,
  content,
  progression,
  backend,
  fence,
  key = "pashto-town-days-v1",
  locks = backend ? null : globalThis.navigator?.locks,
}) {
  const KEY = key;
  let saveProblem = null, persistenceProblem = null, readBlocked = false;
  let notifyPersistence = () => {};
  let observed, conflict = false, revisionReset = false;
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
        "This save belongs to an older or incompatible version. This release uses save format 9 and does not convert old saves. Your stored data has not been changed. Reset it explicitly to start this version.";
      return progression.fresh();
    }
  }
  function snapshot() {
    if(state.reviewCampaign)return JSON.stringify(state.reviewCampaign);
    if (state.session?.mode === "challenge") {
      if (state.session.finished) delete state.progress.activeChallenge;
      else state.progress.activeChallenge = JSON.parse(JSON.stringify(state.session));
    }
    LibraryEngine.compactHistory(state.progress, [state.session, state.progress.activeChallenge]);
    return JSON.stringify(state.progress);
  }
  function prepareWrite() {
    try {
      if (readBlocked) {
        if (access().getItem(KEY))
          return persistenceFailure("Progress has not been saved: existing progress could not be read at startup. Export this tab’s progress, then reload to recover the existing save. Retry will not overwrite it.");
        readBlocked = false;
        observed = null;
      }
      return checkExternalChange();
    } catch {
      return persistenceFailure("Progress has not been saved: browser storage is full or unavailable. Progress stays in this tab. Retry or export before closing it.");
    }
  }
  function write(raw) {
    if (saveProblem || !prepareWrite()) return false;
    try {
      const target = access();
      if (raw !== observed) {
        target.setItem(KEY, raw);
        if (target.getItem(KEY) !== raw) throw Error("Storage did not retain progress");
      }
      observed = raw;
      persistenceProblem = null;
      notifyPersistence(null);
      return true;
    } catch {
      return persistenceFailure("Progress has not been saved: browser storage is full or unavailable. Progress stays in this tab. Retry or export before closing it.");
    }
  }

  let pending = 0, lastSave = Promise.resolve(true), queuedSave = null;
  function save() {
    if (saveProblem) return false;
    let raw;
    try { raw = snapshot(); } catch {
      return persistenceFailure("Progress has not been saved: the current snapshot could not be prepared. Keep this tab open and retry.");
    }
    // Injected synchronous backends are single-process test adapters. Browser
    // writers must share an origin-wide lock, including the final comparison.
    if (backend && !locks) return write(raw);
    if (!locks?.request)
      return persistenceFailure("Progress has not been saved: this browser cannot coordinate safe saves across tabs. Keep this tab open and export your progress. Use a browser with Web Locks support to resume saving.");
    // Coalesce not-yet-written snapshots from this tab. Never merge records
    // from another tab, and never retain an unbounded queue of full saves.
    if (queuedSave) { queuedSave.raw = raw; return queuedSave.promise; }
    const request = {raw, promise:null};
    queuedSave = request;
    pending++;
    request.promise = locks.request(KEY, { mode: "exclusive" }, async () => {
      // Freeze the started request. Later same-tab saves coalesce into one next
      // request while revision transactions are pending, never into this write.
      if (queuedSave === request) queuedSave = null;
      const raw = request.raw;
      if (backend) return write(raw);
      if (!prepareWrite()) return false;
      if (!fence)
        return persistenceFailure("Progress has not been saved: safe revision coordination is unavailable. Retry or export before closing this tab.");
      if (revisionReset) {
        if (!await fence.rebase(KEY, observed, () => access().getItem(KEY)))
          return persistenceFailure("Progress reset could not be safely coordinated. Retry or export before closing this tab.");
        revisionReset = false;
      }
      const result = await fence.commit(KEY, observed, raw, () => access().getItem(KEY), () => write(raw));
      if (result === "conflict") {
        conflict = true;
        return persistenceFailure("Newer saved progress exists in another tab. This tab has not overwritten it. Export this tab’s progress if needed, then reload to use the newer save. Progress records are not merged.");
      }
      if (result !== "saved")
        return persistenceProblem ? false : persistenceFailure("Progress has not been saved: safe revision coordination failed. Retry or export before closing this tab.");
      return true;
    }).catch(() => {
      if (queuedSave === request) queuedSave = null;
      return persistenceFailure("Progress has not been saved: browser save coordination failed. Retry or export before closing this tab.");
    }).finally(() => { pending--; });
    return lastSave = request.promise;
  }
  if (!backend && typeof globalThis.addEventListener === "function")
    globalThis.addEventListener("beforeunload", event => {
      if (pending) { event.preventDefault(); event.returnValue = ""; }
    });

  return {
    load,
    save,
    currentSave,
    snapshot,
    get pending() { return pending > 0; },
    settled() { return lastSave; },
    onPersistenceChange(listener) {
      notifyPersistence = listener;
      listener(persistenceProblem);
    },
    get persistenceProblem() { return persistenceProblem; },
    get problem() {
      return saveProblem;
    },
    authorizeReset() { revisionReset = true; },
    resetProblem() {
      revisionReset = true;
      saveProblem = null;
    },
  };
}
