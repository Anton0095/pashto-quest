# Week 1 pronunciation, audio and device language-review protocol

**Current state:** The game can play a bundled `audio/<content-id>.mp3` file where provided, otherwise tries a Pashto device/system speech voice and warns about uncertain fallback. The repository **does not currently contain a native-reviewed recording pack**. Browser speech-selection unit tests and Chromium mobile emulation do **not** validate a physical iPhone or a speaker's pronunciation.

Review the exact text and context in [Week 1 forms](WEEK1_FORM_REVIEW.csv) and [fixed-language items](WEEK1_FIXED_LANGUAGE_REVIEW.csv) rather than creating a different recording script by hand.

## Priority order

1. **Day 1 onboarding:** two approved tutorial questions, daily greeting, School starters and core Home/Nature/Market forms; check teaching tone and beginner intelligibility.
2. **Days 2–4:** exact finite verb person contrasts and first/second-person pronouns; do not record citation/infinitive forms where the game actually displays finite forms.
3. **Days 5–7:** respectful/plural `تاسې`/`تاسو`, direct noun plurals, `موږ`, `هغوی`, Hill introductions, exam instructions/feedback and each day's fixed greeting.
4. **Bilal's optional conversations:** all current day greetings, correct/incorrect/conclusion and repeat events, plus expected player replies; maintain context and speak naturally, not word-by-word.
5. **Source-reproducible generated sentences:** use actual reviewed sentence proofs and licensed form bindings, not manually reconstructed approximations.

## Native pronunciation review record

For each unique audio target, record the following fields in a copy of the worksheet or an attached issue:

| Field | Required evidence |
| --- | --- |
| Exact stable ID | `formId`, phrase ID, event audio ID or generated sentence/proof |
| Exact reviewed text | Pashto and English/context as shown to learner |
| Pronunciation aid | Current romanisation and reviewer's suggested correction |
| Voice type | Native human recording, platform/system voice or unknown fallback |
| Speaker dialect/register | Declared spoken variety (Laghman if applicable), formal/informal delivery and addressee |
| File/voice locator | Recording filename, hash/source, or actual device/voice name |
| Reviewer code/date | Human review evidence, not just a test-run timestamp |
| Verdict | `ACCEPT`, `REVISE`, `REJECT`, `UNCERTAIN` |
| Problem | Mispronounced consonant/vowel, wrong syllabification, omitted word, wrong inflection, unnatural rhythm, distortion or silence |
| Rights/consent | Confirm the speaker permitted redistribution for the game's actual use; store personal consents privately |

Do not mark an audio item `native_approved` simply because its written Pashto form was reviewed. Recording approval is a separate scoped evidence event. A person may review orthography without having listened to the audio.

## Recording and packaging controls

- Verify the actual spoken sentence is identical in meaning and form to the approved Pashto target; do not silently substitute a familiar variant.
- Use a consistent recording environment, clear speech, bounded loudness and trimmed silence. Avoid clipping and background noise.
- If producing MP3, confirm each real `audioContentId` that the game requests and test its exact lookup in `src/audio.js`. A missing ID must not be guessed from the English gloss.
- Keep original lossless recordings and editable metadata securely; only ship derivative audio after explicit rights/consent review.
- Store source speaker/dialect, content ID, textual version/revision, date, recording hash, review status and any alternative variant. When a corrected string is merged, invalidate or re-record stale audio.
- Never fabricate files or attribute TTS to a native speaker. Check audio-pack size and offline loading against the performance budget before publishing large packages.

## Physical-device verification sheet

Test real devices, not only a browser emulation mode. Suggested coverage:

| Platform | Minimum check | Result |
| --- | --- | --- |
| iPhone Safari | Intro question playback, isolated Pashto words, inflected forms, Bilal dialogue, sentence playback, audio after app reload | **NOT TESTED** |
| Android Chrome | Same sequence, voice availability and pause/resume | **NOT TESTED** |
| Windows Chromium/Edge | Speech voice choice, detection, cancellation and fallback warning | **NOT TESTED** |
| Offline/no voice available | No silent false success; clear warning; text teaching and movement still function | **NOT TESTED** |

For each actual run, record: date/time, model, OS version, browser/version, online/offline state, local/opened file or served app, audio target ID, playback mode (MP3/TTS), voice identifier/language, audible output, intelligibility, text match, warning message, repeat/cancel behaviour and screenshot/recording evidence.

Do not substitute a generic `ps-AF` language tag for evidence that a real voice exists or is intelligible on the user's machine.

## Acceptance

A Week-1 public language release requires reviewed pronunciation for compulsory instructional audio targets and confirmed, intelligible playback or a clearly documented non-audio mode on the supported devices. For internal alpha, unreviewed TTS may remain **explicitly provisional**; it cannot be represented as vetted Laghman pronunciation.

Open `S0/S1` issues for a voice that changes words/meaning or teaches a seriously misleading pronunciation. Missing audio is a product limitation that should be reported even if the game remains navigable.

See [LANGUAGE_REVIEW.md](../../LANGUAGE_REVIEW.md#audio-and-device-status) and [Milestone A language gate](MILESTONE_A_LANGUAGE_GATE.md).