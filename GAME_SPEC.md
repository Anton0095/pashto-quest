# Pashto Quest / Pashto Town — Game Specification

**Specification date:** 22 October 2026  
**Project:** Pashto-language learning game set in a lived-in village in Laghman, Afghanistan  
**Authoritative implementation:** [`index.html`](index.html), an exact-byte copy of the latest recovered file, `history/pashto_quest_days_1_5_narrative.html` (created 21 October 2026)  
**Scope:** Document the game AS IT EXISTS and preserve the agreed product direction. **This handoff does not implement or modify any gameplay.**

## 0. Status legend and interpretation

- **[IMPLEMENTED]** Exists in the authoritative HTML source, although not necessarily fully tested across devices.
- **[PARTIAL]** Present in simplified or prototype form; gaps are explicitly described.
- **[PROPOSED]** Agreed direction, desired quality bar or potential work, **not** complete in the authoritative HTML.
- **[KNOWN ISSUE]** Inconsistency, limitation or defect found during the source audit; recorded, **not fixed**.

**Important precedence rule:** The actual code in `index.html` is the implementation baseline. This specification expresses the intended product and flags differences between code and intent; it must **not** be used to claim a feature is already functioning if the implementation is missing. Before making future changes, Codex should reconcile the proposed behaviour with the source and ask for an implementation request, rather than silently rewriting the game.

## 1. Game concept and goals

**[IMPLEMENTED]** Working title/branding: the source calls the experience **PASHTO TOWN**; the broader project is **Pashto Quest**. The player is a resident of a small Afghan village, not a tourist simply taking disconnected language quizzes. They meet recurring villagers, explore the town's home, lake, market and school, learn words and grammatical forms through concrete scenes, then complete a daily end-of-day challenge to advance.

**[IMPLEMENTED]** The beginner learning path is intentionally spiral and **present tense only**. Vocabulary is introduced in context by nouns, verbs, adjectives and complete sentences, then reused in subsequent lessons and challenges. The first *day* focuses on the impersonal English meaning of “it” / simple descriptions: “The door is open”, “The river is blue”, etc., rather than jumping to action verbs. English “it” is not necessarily a separate Pashto word in these descriptions.

**[IMPLEMENTED]** The product works as a **single static HTML file with inline CSS, inline JavaScript, embedded SVG map and data**. Normal reading, quizzes, state management and navigation need no server or build tooling. The game uses browser `localStorage` where available. Internet and externally installed packages are not required for the text-based game. Audio availability is separate; see §9.

**[PROPOSED]** Expand the sense of actually *living in town* with consequential but beginner-accessible choices, believable social exchanges and coherent events. Keep learning scaffolding central; narrative must serve correct Pashto rather than overwhelm it. Do not add tenses beyond present tense without a separate decision.

## 2. Locations and characters

### 2.1 Locations — [IMPLEMENTED]

| Game location / code ID | Resident / initial teacher | Role in curriculum | Notes |
|---|---|---|---|
| **Your Home** / `house` | **Muhammad Jan** (👴) | Things in the house, home routines, social interaction, informal Day 4 lesson | The player's home and Muhammad Jan's teaching/check-in location; do not assume an unestablished biological family relationship. |
| **The Lake** / `river` | **Saleha** (👩‍🎓) | Water, animals, seeing, movement; Day 3 “I” introduction; Day 5 community gathering | Internal ID remains `river`; town UI calls this the lake, and vocabulary also covers the river. |
| **The Market** / `market` | **Edris** (🧑‍🌾) | Food, produce, buying and selling; Day 3 shopping-for-dinner challenge | Edris is an adult grocer/shopkeeper. |
| **The School** / `school` | **Ms Hameed** (👩‍🏫) | Books, writing, grammatical instruction and polite register | Day 2 S–O–V and Day 5 polite/plural second person begin here on the normal route. |

### 2.2 Characters and relationships — [IMPLEMENTED] / [PROPOSED]

- **Muhammad Jan:** an older, respected village leader/elder; patient guide and first welcoming character. He teaches the compulsory four-greeting introduction, usually administers the Day 1–2 challenges, teaches Day 4 at home, and is one of the Day 5 lakeside participants. **Relationship:** respected elder and mentor, **not** specified to be the player's father/grandfather. [IMPLEMENTED]
- **Saleha:** a fellow student, socially a familiar peer/friend whom the player can address with informal singular **ته**. Associated with the lake; introduces **زه** on Day 3 and participates in Day 5's gathering. [IMPLEMENTED]
- **Edris:** local adult grocer; familiar market contact, but respectful **تاسې** is the appropriate beginner default when directly addressing him as an older/adult interlocutor. He guides the Day 3 dinner-shopping challenge. [IMPLEMENTED]
- **Ms Hameed:** schoolteacher and respected authority. Explains word order on Day 2 and respectful/plural **تاسې** on Day 5. The player generally addresses her politely; she may address the player with informal **ته**, where appropriate. [IMPLEMENTED]
- **Player:** newly settled village resident and learner; no imposed name, age, kinship, gender, voice or backstory beyond the town-resident premise. [IMPLEMENTED]

**[IMPLEMENTED]** From Day 5 onwards, characters may appear at places other than their original location. The source contains `roamingTeachers`, `peopleAt`, `teacherFor()`, visual portrait emojis, named speaker labels, and audience/recipient cues. Day 5 explicitly gathers all four named characters near the lake. Days 6–7 also have roaming assignments, although their scenes are lightweight.

**[PARTIAL]** Named speakers and intended addressees are particularly visible in Day 4/5 challenge turns. An audience indicator marks known single-person recipients. These are **scripted quiz turns**, not free-form dialogue with persistent interpersonal state. **[PROPOSED]** Generalise explicit **speaker + listener/recipient + role/portrait** cues to every conversational exchange and future narrative scenario. Never leave the player guessing whose “I”, “you”, “we” or “they” is meant.

**Register / cultural constraint (non-negotiable):** On Day 4, Muhammad Jan may say **ته** when speaking to the player, but learners should **not** be required to address this respected elder as **ته**. To elicit informal “you” in the player's own answer, the situation must explicitly identify a familiar peer such as Saleha. From Day 5, use **تاسې** to elders, teachers, unfamiliar adults and groups, and **ته** when appropriate to one familiar peer; do not imply the distinction can be inferred from English “you” alone.

## 3. Content architecture and learning principles

**[IMPLEMENTED]** `GAME_DATA` is inline JSON within the HTML. On the audited version:

- **7** day definitions in `GAME_DATA.loops`, **4** locations, **28** day/location `courses`.
- **230** `words` records as stored (including **4** introductory greetings), categorised as **43 nouns, 26 verbs, 27 adjectives, 130 sentences and 4 greetings**. These are record counts, not 230 guaranteed-unique lexical IDs (see duplicate-ID issue §12).
- Per-record fields include `id`, `loop`, `place`, `type`, `ps` (Pashto script), `roman` (learner reading aid), `en` (English meaning), `note` and `dialect`.
- Each location teaches cards before checking knowledge, with new lexical items, model sentences, and adaptive recall items drawn from previously encountered content. The usual order is introductory/grammar explanation when applicable → lexical cards → example sentences → multiple-choice quiz with retries.
- **Four introductory greetings** are mandatory before entering Day 1: **سلام** (hello), **څنګه یې؟** (how are you?), **مننه** (thank you), **خدای پامان** (goodbye).

**[IMPLEMENTED]** Grammar outcomes must be taught contextually, rather than by rote suffix tables alone. Pashto script is shown **right-to-left**, while English and romanisation run left-to-right. Simple present-tense action clauses tend toward **subject–object–verb** (S–O–V); simple nominal/adjectival predicates are a separate Day 1 introduction. Vocabulary includes explicit gender/number agreement examples: masculine **دی**, feminine **ده**, plural **دي**.

**[PROPOSED]** Verify Pashto spelling, naturalness, translation and register for **every item**, especially compound sentences and region-specific variants, with a speaker knowledgeable about the intended Laghman variety before treating the contents as linguistically final. Grammar patterns are learner scaffolds, not promises of a universal inflection rule.

## 4. Daily route, pedagogy, story and challenge

Each day unlocks only after the preceding day's **passed** challenge. All four location lessons are available along a **normal narrative route**, but the learner may optionally bypass daily visits via the **Skip to challenge** control as defined in §5. Passing a daily challenge—not completing four visits—is the true progression gate.

| Day | Pronouns / language focus | Normal route / teaching | End-of-day challenge | Status |
|---|---|---|---|---|
| **1 — It / Things** | Simple descriptions; nouns, adjectives, **دی / ده / دي**, no action sentences as the initial focus | **Compulsory** first hello with Muhammad Jan (4 greetings). Then free-roam home, lake, market and school in any order | 15 questions; Muhammad Jan's home check-in | [IMPLEMENTED] |
| **2 — He / She** | **هغه**, third-person present-tense action verbs; **S–O–V** | **School first** with Ms Hameed; then market and lake in either order; then home | 15-question Muhammad Jan conversation/check-in | [IMPLEMENTED] |
| **3 — I** | **زه**; first-person singular endings (frequently **ـم**), subject/verb agreement; contextual purchase vocabulary | **Lake first** with Saleha; practise home/school/market; then **dinner shopping with Edris** at market | Scripted 15-turn Edris dinner-shopping assessment | [IMPLEMENTED] |
| **4 — You (informal)** | **ته** to one familiar person; present-tense second-person endings (often **ـې**); **compound clauses with او** combining “you” and “I” | **Home first** with Muhammad Jan; then other village locations; return home | Informal, gentle one-to-one conversation with Muhammad Jan, grounded in **I / informal-you clauses** | [PARTIAL] Scripted dialogue-style 15-question quiz implemented; spontaneous back-and-forth is not. |
| **5 — You (polite/plural)** | **تاسې** for respectful singular / plural; contrast with **ته**, verb endings commonly **ـئ** | **School first** with Ms Hameed; visit characters around town, then **lakeside community gathering** | 15 turns with multiple speakers; choose address appropriate for friend/elder/teacher/group | [IMPLEMENTED] for contextual quiz and audience UI; richer social dialogue remains possible. |
| **6 — We** | **موږ**, first-person plural present tense, often **ـو** | Four existing locations, now with roaming characters. No dedicated plot-driven opening required by current code | Generic mixed 15-question day challenge | [PARTIAL] Playable vocabulary/lessons/challenge and movement exist; distinct Day 6 narrative not developed. |
| **7 — They** | **هغوی**, third-person plural, frequently **ـي**, recycling cumulative vocabulary | Four locations with roaming characters | Generic mixed 15-question completion challenge; closes first week | [PARTIAL] Playable vocabulary/lessons/challenge exist; first-week narrative payoff not developed. |

### 4.1 Further day-specific behaviour

**Day 1 [IMPLEMENTED]:** The app opens on the introduction. Only after finishing Muhammad Jan's greetings tutorial does the map and skip action become available. The examples should be things the player can see (e.g. “The door is open”, “The water is cold”). Grammar uses agreement rather than an isolated English *it* pronoun.

**Day 2 [IMPLEMENTED]:** Ms Hameed's S–O–V explanation is first on the **normal path**. Skipping is available before it. The use of **هغه** covers both he and she; do not invent separate gendered English-to-Pashto subject pronouns.

**Day 3 [IMPLEMENTED]:** Saleha explicitly contrasts “he/she drinks” **څښي** and “I drink” **څښم**. Dinner-shopping is a contextual sequence with exactly 5 words + 5 recalled sentences + 5 sentence builds. User can bypass lessons and start Edris's check-in immediately.

**Day 4 [IMPLEMENTED/PARTIAL]:** Muhammad Jan is a friendly elder. The lesson contrasts **زه** and **ته** verb forms, and shows two complete clauses joined with **او**. The challenge has **5 word questions, 5 sentence questions, 5 constructions**, scripted as a conversation at home. When an informal “you” expression appears, the UI specifies the player is **imagining addressing Saleha**, not speaking disrespectfully to Muhammad Jan. Retain the informal, relaxed tone without sacrificing social appropriateness.

**Day 5 [IMPLEMENTED]:** Ms Hameed explains that **تاسې** is used for elders, teachers and groups; the alternative **تاسو** is mentioned as a regional/usage variant, not taught as a new separate person. The lake challenge contains **5 social-address choice questions** (ته vs تاسې), **5 sentence-recognition questions**, and **5 Pashto sentence builds**. It explicitly identifies the current speaker and the person/group being addressed, with named participant portraits. Participants include Muhammad Jan, Edris, Saleha and Ms Hameed. Thus the challenge's first five questions **are not ordinary vocabulary recall**, unlike the other days.

**Days 6–7 [PARTIAL]:** There is stored data, day labels, teacher movement assignments, introductory grammar summaries and generic mixed daily challenges. Do **not** describe them to Codex as fully authored character-driven chapters. **[PROPOSED]** Give Days 6 and 7 story arcs, meaningfully shared actions for “we”, group observation for “they”, and end-of-day discussions that build on the first five days; preserve their current grammatical sequence (Day 6 = we; Day 7 = they).

## 5. The optional Skip-to-End-of-Day feature

**[IMPLEMENTED]** The skip control was explicitly requested and later implemented. It is not a cheat that unlocks a new day automatically; the player must still **pass the same daily assessment**.

- **Day 1:** The four-greeting **tutorial is compulsory**; after it, the player can either complete the four visits or skip straight to Muhammad Jan's final challenge.
- **Days 2–7:** A **skip-to-challenge option is available immediately** on the newly unlocked day, before mandatory-on-normal-route lessons such as Day 2 school or Day 5 school.
- **Normal route preserved:** On Day 2 the school is ordinarily first; on Day 3 the lake; on Day 4 home; on Day 5 school. An optional skip must never be blocked by these route constraints.
- **No reward-free advancement:** The challenge remains the only day-unlock condition; **12/15 correct** is still required. Failure permits retries, and the town lessons remain available for practice.
- **Code entry points:** `renderSkipDayAction()`, `startChallenge()`, `allowed()`, `passedChallenge()`, plus `skipDayBtn`, `startChallenge` and the normal location navigation.

**[IMPLEMENTED]** A replay of an already passed challenge is possible; the completed day remains passed. UI records best score and attempts in saved state.

## 6. Question engine and challenge rules

**[IMPLEMENTED]** Exactly **15 scored turns** per daily end-of-day challenge. The threshold is **12 correct (80%)**. The current first attempt at each answer is what counts: score cannot be changed after feedback on that turn. Result display shows score, XP earned and whether the day passed. Failed challenges can be retried without a full reset. Success immediately unlocks the next day; on Day 7 the first week ends.

**Generic days 1–2, 6–7:** 5 lexical/word recognition questions, 5 whole-sentence recognition questions and 5 sentence-construction questions. Questions are sampled from the current course and earlier days, generally spanning the four town locations and including some earlier-day recall where possible. Recognition rotates between Pashto → English and English → Pashto. Sentences are built by tapping re-orderable Pashto word tiles; Undo and Clear controls exist. Current validation compares the assembled word string with the source `ps` text minus specified punctuation. The app gives immediate correct/incorrect feedback.

**Day 3:** A **fixed, story-ordered** Edris sequence: 5 vocab, 5 meaning questions, 5 constructions about dinner shopping. **Day 4:** A **fixed** Muhammad Jan dialogue-like sequence: 5 lexical, 5 sentence, 5 construction. **Day 5:** A **fixed** 5 address-choice + 5 sentence + 5 construction sequence. Fixed sequences deliberately preserve continuity of the encounters.

**[IMPLEMENTED]** In regular location quizzes, an incorrect answer is placed back into the queue for practice. Lesson completion requires all required lesson items to have been answered correctly, potentially after retries. This differs from the **daily challenge**, where all 15 first answers count and retries happen at the *challenge level*, not within a scored question.

**[IMPLEMENTED]** Typical rewards: XP per lesson answer (amount depends on whether new/due/retried), +25 XP for first-time completed tutorial or location, +5 XP for eligible correct challenge answers (once per reward key), and +75 XP on first pass of each day's challenge. Player level is `1 + floor(XP/100)`. These are implementation details; do not change scoring inadvertently.

**[PROPOSED]** Later improvements may allow richer recall beyond four-choice recognition and rigid exact-match word tiles, **provided** fair bilingual evaluation, appropriate difficulty, the 15-question cap and 12/15 progression threshold remain intact unless explicitly changed. Be careful with permissible Pashto variants, diacritics and meaningful inflections.

## 7. Game state and spaced repetition

**[IMPLEMENTED]** Browser `localStorage` key is **`pashto-town-days-v1`**. It stores `xp`, `stats`, `complete`, `challenges`, `challengeRewards`, `tutorialDone`, `sovSeen` and `personIntros`. The loader attempts backward migration from keys **`pashto-quest-things-v2`** and **`pashto-quest-spiral-v1`**. The current source supports Reset Progress with confirmation; this clears game state using the fresh-state schema.

**[IMPLEMENTED]** Word statistics track `seen`, `correct`, `wrong`, `stage` and `dueAt`. The spaced-repetition intervals are **0, 1, 3, 7, 14, 30 days** across stages. The **Memory Trail** review button is enabled when learned items are due. Lessons include up to four previous items for recall, prioritising due and historically missed material.

**[LIMITATION]** `localStorage` on opened `file://` pages can behave differently between browsers and iOS file-opening workflows. The user previously said permanent progress saving is **not currently a priority**; do not make account creation, cloud synchronisation, native packaging or server hosting a prerequisite. Do not promise guaranteed cross-device save portability from the present HTML.

**[PROPOSED]** In a later phase, optionally provide export/import of progress, proper browser-independent storage, and more transparent memory-review recommendations. Not approved for immediate implementation.

## 8. Interaction, UI and platform expectations

**[IMPLEMENTED]** Single-page app sections: intro/tutorial, town map, lesson/challenge screen and result screen. The game includes an embedded illustrated SVG village map, responsive location cards, day tabs (Days 1–7), progress markers, XP/learned stats, teacher avatar/portrait emojis, due-review count and replay/reset controls.

**[IMPLEMENTED]** Responsive CSS provides phone-width adaptations including smaller tiles and buttons. Pashto text uses `dir="rtl"` and `lang="ps"` in important answer contexts, with fonts falling back through **Noto Naskh Arabic**, **Segoe UI** and serif. English is left-to-right. Speaker buttons are accessible via click/tap and have visible status text.

**[IMPLEMENTED]** The game is designed to run in a browser offline **without hosting**, including by opening the saved HTML on a phone where file handling permits. Earlier instructions discussed opening on iPhone using Shortcuts/Safari as an optional route. The native browser's file permissions, `localStorage` and TTS voice inventory vary by platform; mobile appearance and every workflow should be retested after future implementation changes.

**[PROPOSED]** Sustain a clean responsive experience on desktop and narrow iPhone screens. Speaker/name/recipient indicators must remain legible without horizontal scrolling. Maintain keyboard/focus usability and accurate semantic labels as features expand.

## 9. Pashto dialect and pronunciation requirements

### 9.1 Linguistic variety

**Core requirement:** Teach Afghan Pashto **as spoken in Laghman**, not default Pakistani Pashto or an unqualified Kandahari accent. Laghman speech itself varies by community. Keep **standard Pashto script**, show an intelligible reading aid, explicitly acknowledge unresolved regional forms, and prefer **review by a native speaker from the relevant part of Laghman** to unsupported confident assertions.

**[IMPLEMENTED]** Each data record includes script and `roman` hints, plus a note and optional dialect field. UI dialect guidance discusses regional tendencies including **ښ**, **ږ**, **څ**, and retroflex **ټ / ډ / ړ**, while admitting that some local communities pronounce these differently. This guidance **is not a verified dialect corpus**. The course describes variants such as **کوټه / خونه** (room), **ښوونځی / مکتب** (school), and **تاسې / تاسو** (polite/plural you), without automatically substituting variants for one another.

### 9.2 Current audio: what is and is not implemented

- **[IMPLEMENTED]** Speaker controls exist on study cards, some quiz questions and grammar examples.
- **[IMPLEMENTED]** `speak(id)` first tries **`audio/<word-id>.mp3`**. If this playback cannot be loaded, it attempts browser speech synthesis **only if** an actual Pashto voice (`ps`, `ps-AF`, or other `ps-...`) is installed; it prefers an Afghan voice when found. Utterance locale is `ps-AF`, playback rate `0.82`.
- **[IMPLEMENTED]** It **does not** quietly synthesize using an English, Urdu or Persian voice as a fake Pashto accent. If no Pashto audio or voice exists, it shows a visible **unavailable-audio** message.
- **[NOT DELIVERED]** No synthesised Pashto MP3 recordings are present in this verified transfer package. Speaker buttons may therefore be silent on a typical offline iPhone installation. The earlier user request to “create and synthesise AI generated pronunciations” has **not** been satisfied with bundled playable recordings in this authoritative build.
- **[PARTIAL]** Exact **Laghman-accent** pronunciation and the current transliterations have **not** been verified by an appropriate native speaker.

### 9.3 Proposed audio implementation and validation — [PROPOSED]

1. Review **all 230 stored records** for natural spelling, wording and intended Laghman reading; resolve the duplicate `a-clean` ID before asset generation. Keep a per-item transcript and reviewer sign-off. Prioritise greetings, high-frequency sentences, and confusing contrasts between **ـم**, **ـې**, **ـئ**, **ـو**, and **ـي**.
2. Generate or commission **one MP3 per stable unique item ID**, in an Afghan Pashto voice, named `audio/<id>.mp3`. Use a true Pashto voice/provider where possible, not another language's voice or a made-up claim of Laghman accuracy. Audio should be included as separate, **real playable files** in any genuinely offline build.
3. Have a Laghman speaker judge words/phrases for pronunciation, stress, vowel quality, word boundaries, grammatical naturalness and social register. Where the voice cannot match the target reliably, use corrected recorded audio rather than treating synthetic output as authoritative.
4. Confirm on iPhone and desktop with networking disabled that every speaker button plays the correct ID's file, works after repeat taps, and gracefully reports missing items.
5. Retain both Pashto script and readable cue; allow replays at learning stages. Any optional slow/normal speed or audio preferences require a later explicit implementation brief.

See [`audio/README.md`](audio/README.md) and [`audio_manifest.json`](audio_manifest.json) for the **intended** asset filenames; the manifest itself is not an audio pack.

## 10. Narrative and pedagogical expansion backlog

| Priority | Proposed feature | Reason and acceptance requirement | Current reality |
|---|---|---|---|
| P0 | **Verified Pashto audio pack** | True playable per-item files, `ps-AF` voice or local recordings, and dialect review; never mislabel generic TTS as Laghmani | Speaker wiring exists, recordings absent. |
| P0 | **Native-speaker language QA** | Audit script, transliterations, translations, grammatical agreement, compound sentences, polite address, and potentially regionally differing forms | Not completed. |
| P1 | **Expanded Days 6–7 stories** | Continue town relationships; Day 6 authentic “we” experiences; Day 7 “they” and a satisfying first-week conclusion | Basic day loops/lessons/challenges exist; story is minimal. |
| P1 | **Stronger Day 4/5 social interaction** | Preserve explicit speaker/listener, relevant pronoun, context and politeness in genuinely conversational sequences, not just a sequence of quizzes | Named dialogue-style prompts and choices are in place. |
| P1 | **Consistent speaker/recipient design** | Any new scene or challenge must identify who says each line and who the player's response addresses; make it visually obvious on mobile | Especially developed for Days 4–5. |
| P2 | **Richer contextual interaction** | More lived-in visits, relationships, everyday errands and purposeful dialogue, without new tense overload | Static narrative texts and quizzes exist. |
| P2 | **Content QA / exact-match flexibility** | Validate and handle legitimate alternate translations and Pashto wordings in assessment fairly | Current exact-answer matching can be strict. |
| P3 | **Optional portable progress** | Consider save export/import only if later wanted | Browser `localStorage` exists; saving is not current priority. |

These are **proposals**, not a command to Codex to implement them on opening this repository.

## 11. Technical source map and file inventory

- **`index.html`** — [IMPLEMENTED] canonical runtime. An **unaltered byte-for-byte copy** of latest source. Never modify without user approval.
- **`history/pashto_quest_days_1_5_narrative.html`** — source-of-record latest snapshot (same bytes as `index.html`).
- **`history/*.html`** — six recovered **earlier/parallel development versions**. Archived for reference only; **not** separate runtime dependencies and not files to combine manually with `index.html`.
- **`audio_manifest.json`** — generated **documentation-only** inventory of existing source records, intended MP3 filenames and their associated text. It includes the duplicate-ID collision as found; it is not a source replacement or set of synthesized recordings.
- **`audio/README.md`** — playback contract, verification and missing-assets warning. No actual MP3s are bundled.
- **`README.md`**, **`AGENTS.md`**, **`qa/SMOKE_TESTS.md`** and **`TRANSFER_MANIFEST.json`** — Codex handoff, source preservation guidance, manual testing and checksums.

**Old Library items not reproducibly available for this package:** Earlier archives named `pashto_town_7_days_game_and_audio_kit.zip` and `pashto_quest_things_first_audio_ready.zip`, and `pashto_greetings_quest.html`, were identifiable in Library metadata but their raw bytes could not be retrieved here. They are **historical references, not verified dependencies of the current game**, and must not be mistaken for supplied MP3 assets. The current executable source itself has **no linked external JS or CSS dependencies**.

### 11.1 Relevant source functions — [IMPLEMENTED]

| Concern | Functions and state in the HTML |
|---|---|
| Course and content | `GAME_DATA`, `wordById`, `courses`, `loops`, `zones`, `villagePeople` |
| Movement and story | `roamingTeachers`, `peopleAt`, `teacherFor()`, `placeAccessible()`, `dayGuidance()`, `navigatePlace()` |
| Unlocks and skip | `allowed()`, `passedChallenge()`, `renderWorld()`, `renderSkipDayAction()`, `startChallenge()` |
| Lesson/tutorial | `begin()`, `teachCard()`, `afterStudy()`, `showGrammar()`, `afterGrammar()` |
| Challenge question types | `selectChallenge()`, `specialDayChallenge()`, `showChallengeQuestion()`, `answerChallenge()`, `finishChallenge()` |
| Sentence construction | `buildTiles()`, `renderBuiltSentence()` |
| Review and progress | `load()`, `save()`, `stat()`, `pickRecall()`, `duePool()`, `hud()` |
| Audio | `speak()`, `pashtoVoice()`, `stopAudio()`, `audioStatus()` |

### 11.2 How to transfer to Codex

1. Extract the supplied `Pashto_Quest_Codex_Transfer.zip` to a local `Pashto-Quest` folder; **keep folder structure intact**.
2. Open that folder as a project in **ChatGPT Codex** (or an equivalent Codex workspace). Ask Codex to read `AGENTS.md`, `GAME_SPEC.md` and `README.md` first.
3. Use **`index.html`** as the only playable current game: open it directly in a browser. No Node, package installation, framework migration or server is required for this version.
4. For future requests, tell Codex which **proposed feature** to implement, ask it to preserve current functionality, test using `qa/SMOKE_TESTS.md`, then update status sections and any asset manifest **as part of that later change**.
5. This specification transfer makes **no change** to the game itself. The user expressly did not request new implementation in this handoff.

## 12. Known issues and unresolved questions (do not silently fix)

1. **[KNOWN ISSUE] Duplicate `a-clean` ID.** `GAME_DATA.words` contains **two records with `id: "a-clean"`**, one attributed to Day 3/lake and another Day 1/home. JavaScript `wordById` indexing keeps only the last such record, so their course references and audio filename collide. Repair requires deliberate ID migration and testing of saved state and audio filenames. **No change in this package.**
2. **[KNOWN ISSUE] Missing verified audio media.** Source calls `audio/<id>.mp3`, but none of the required files are bundled. Browser TTS is conditional on an installed Pashto voice, not a dependable substitute.
3. **[KNOWN ISSUE] Linguistic/dialect QA incomplete.** New sentences and the romanisation system may contain unnatural phrasing or regional mismatches. Need local review prior to publishing as specifically Laghman Pashto.
4. **[KNOWN ISSUE] Simplified conversation.** Day 4/5 dialogue is context-labelled quiz interaction, not free natural-language input, speech recognition or full branching narrative.
5. **[KNOWN ISSUE] Day 6/7 depth.** Their course content and generic challenges are operational in code but they lack the detailed Day 1–5 day-specific story scenes.
6. **[KNOWN ISSUE] Offline mobile persistence.** Text-game offline usage is viable; local storage and speech voices depend on how iOS/browser opens local HTML. Explicit end-to-end verification on the intended iPhone workflow is pending for this packaged snapshot.
7. **[KNOWN ISSUE] Strict construction match.** Tile-based sentence answers compare one precise token order with normalized punctuation; legitimate alternate word orders or dialect variants generally aren't accepted.
8. **[KNOWN ISSUE] Game is a prototype, not native-speaker certified.** No external medical/safety issues are relevant here; the critical product risk is teaching unreliable pronunciation or register as authoritative.

## 13. Minimum acceptance tests for any later code change

**The current handoff is documentation only.** For all subsequent implementations, maintain these regression checks:

1. Open `index.html` with no backend; intro appears without a runtime crash. Four-greeting Muhammad Jan tutorial is initially compulsory.
2. Complete tutorial, then confirm **Day 1 skip** exists immediately, without visits. Passing exactly **12/15** unlocks Day 2; **11/15** does not.
3. On Day 2–7, skip is available immediately on day unlock, **before** the designated normal-route first lesson. Passing is still mandatory.
4. Follow normal Day 2 school-first, Day 3 lake-first, Day 4 home-first and Day 5 school-first routes; confirm appropriate guides, curriculum and next interactions.
5. Inspect Day 4 prompts: compound “I + informal you” builds appear; no answer requires the player to address Muhammad Jan himself with **ته**.
6. Inspect Day 5 at the lake: four characters are visibly identified, recipient context is explicit, five address questions choose **ته** vs **تاسې**, and all 15 turns score correctly.
7. Day 6 stays **موږ (we)**, Day 7 **هغوی (they)**; there is no accidental swap from older versions.
8. Multiple-choice scoring, construction tile controls, daily 12/15 threshold, replay, XP and due review continue to work.
9. With audio assets absent, the UI clearly states unavailable audio; it must not speak Pashto using a wrong-language voice or falsely claim generated local audio.
10. Check narrow mobile layout, Pashto RTL/LTR mixing and visual speaker/recipient clarity; confirm nothing leaks from another selected day.
11. Verify unique IDs after any future data revision, run language review for additions, and avoid breaking localStorage migration when updating the source.

See [`qa/SMOKE_TESTS.md`](qa/SMOKE_TESTS.md) for a copy-paste-friendly condensed QA checklist.

---

**Change-control instruction for Codex:** Do not start implementing every proposal after reading this file. Ask for / follow the user's specific requested change. Preserve this dated baseline, and update the implementation-status labels only **after** corresponding functionality is actually delivered and tested.
