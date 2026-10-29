# Pashto Quest — Days 6–7 narrative and learning-content blueprint

> **Historical editorial archive — not active instructions.** All implementation imperatives, old API names, fixed sentence sets, branch directions and “not implemented” status statements below belong to the original planning checkpoint. Do not restore them or treat them as unfinished work. Current goals/mechanics are in [README](../../README.md) and [GAME_SPEC](../../GAME_SPEC.md); workflow is in [AGENTS](../../AGENTS.md). Runtime instructional clauses are generated, not copied from these targets. Historical example language remains provisional.

Current implementation/workflow: see [README](../../README.md) and [AGENTS](../../AGENTS.md); the [cleanup review](../maintenance/CLEANUP_REVIEW.md) records a later historical checkpoint. Historical status notes below are curriculum context, not instructions to restore removed migrations or prototype code.
**Status:** Authoring specification for Codex. This is **not** implemented in the reference game. Example English meanings below are the semantic targets for Pashto sentence cards. Codex should reuse valid existing `GAME_DATA.words` entries where available, add stable new IDs for genuinely new material, and produce Pashto spellings/romanisations subject to local Laghman native review. Avoid automated word swaps that create nonsense or change a verb's grammatical role.

## Shared implementation rules

- **Only four free-roam places:** Home (`house`), Market (`market`), Lake (`river`), School (`school`). The Hills are a **Day 6 final-challenge background/scene**, not an additional map destination, course, or route node.
- Normal route: first day's designated teacher/scene is **forced if choosing the story**, followed by the other three locations in any order. The final challenge is opened at its story location/scene after optional visits. But the **Skip** option starts the end-of-day challenge at once (after Day 1 tutorial, beginning of Days 2–7).
- **Every speaker and recipient is clear:** card metadata should include `speaker`, `recipient`, `location`, `day`, and, where relevant, `participants` and `targetPerson`. Differentiate an NPC's spoken line from a language prompt that asks the player to imagine addressing somebody else.
- At each of the four locations offer ~**five meaningful sentences** and context-specific vocabulary. Mix old and new words; prior-day words need not all be used each day.
- Present-tense sentences only. Do not introduce compulsory new tense paradigms during Week 1. Complex examples (e.g. go running, carry, give) should use the correctly attested present forms and appropriate morphology, rather than naïve `stem + suffix` when irregular.
- Use standard Pashto orthography as the base. `موږ/مونږ` and `تاسې/تاسو` are valid considerations requiring regional review. For learning logic, use a single validated canonical answer plus explicitly accepted equivalent variants when appropriate. Do not mark a natural regional alternate wrong only because it is not byte-for-byte identical.
- For compound sentences, each clause has its own subject and conjugated verb; use `او` when semantically appropriate.

## Day 6 — Together in the Village

**Primary grammar:** first-person plural `موږ` (we), present verb ending commonly `ـو`, comparison with `زه` (I, often `ـم`) and addressed plural `تاسې` (you all, often `ـئ`). A compound subject containing the speaker — e.g. `Mina and I` — is first-person plural. Distinguish *speaker included* from *speaker addressing a group*.

### Cast and opening

New character: **Mina** — Saleha's sister, slightly younger, energetic and playful, likes running in the hills. Add her to the long-lived character registry with consistent portrait/avatar, role text `Saleha's sister`, and dialogue label. She is not a new map location.

**Lake compulsory opening on normal route:**

1. **Saleha → player:** “Salaam! I want you to meet my sister, Mina. We often run together beside the lake.”
2. **Mina → player:** “Salaam! Saleha and I like to run. What would you say if you joined us?”
3. **Saleha → player:** Contrast: `زه منډې وهم.` *(I run)* → `مینا او زه یو ځای منډې وهو.` *(Mina and I run together)* → `موږ یو ځای منډې وهو.` *(We run together)*.
4. **Saleha → player:** Show how the verb changes from first singular to first plural and explain that the pronoun may be omitted when the verb already marks person.
5. **Mina → player:** Address both sisters as **you all** (`تاسې`). Contrast “You both run” with “We run,” specifying whether the player is included.
6. **Player task:** identify who belongs to each group and build at least one first-person plural sentence before continuing the ordinary lake vocabulary practice.

**Model forms to verify:**

| English | Pashto draft | Usage |
|---|---|---|
| I run | زه منډې وهم. | 1st singular comparison |
| Mina and I run together | مینا او زه یو ځای منډې وهو. | Compound subject includes speaker |
| We run together | موږ یو ځای منډې وهو. | First-person plural |
| We go to school | موږ ښوونځي ته ځو. | Reuse prior school vocabulary |
| You all go to school | تاسې ښوونځي ته ځئ. | Contrast with Day 5 plural you |

The last two illustrate `ځو` versus `ځئ`, not a blanket rule for every verb. **Do not use “they” as taught knowledge until Day 7.**

### Day 6 location sentence sets (target five each)

| Location / character context | English meanings; include old/new words | New focus / reuse |
|---|---|---|
| **Lake — Saleha and Mina** | 1. I run beside the lake. 2. Mina and I run together. 3. We see two birds. 4. We drink water. 5. You both walk beside the river. | run, together, walk, two; recall water, bird, river, see |
| **Home — Muhammad Jan, with Saleha visiting** | 1. We clean the room. 2. Mina and I open the door. 3. We drink tea together. 4. We sit on the chairs. 5. You both help Muhammad Jan. | help, chairs, together; recall door, room, clean, tea |
| **Market — Edris and Muhammad Jan** | 1. We buy bread. 2. Mina and I carry baskets. 3. We choose apples. 4. We buy vegetables for dinner. 5. You both carry the food. | baskets, choose, carry; recall buy, bread, apple, dinner |
| **School — Ms Hameed, with Mina or Saleha visiting** | 1. We read books. 2. Saleha and I write sentences. 3. We learn Pashto. 4. We answer questions together. 5. You both open your books. | answer, questions, together; recall books, writing, learn |

Where `I run beside the lake` implies the player is participating, stage it after Saleha has invited the player to run. Align every speaker with the actual subject: a quote by Mina saying `Mina and I` is wrong unless the named speaker is the **player**. Prefer `Player → player response` or `Saleha → teaching example` for that sentence.

### Day 6 final — trip to the Hills

Scene: **A special illustrated view of the hills overlooking the village.** The player, Saleha and Mina take a walk, describing their shared activities and addressing one another. No exploration nodes are added. The scene is entered by the ordinary final challenge action (including skip) and is not gated on new vocabulary being studied when skipping.

**15 questions, 12 correct needed.** Content should draw from a stable, authored question set; 5 short recognition, 5 sentence meaning / person transformations, 5 context-specific construction or interlocutor choices. Suggested fixed semantic targets:

| # | Question scene / target | Expected language focus | Speaker → player addresses |
|---|---|---|---|
| 1 | Recognise the word for “we” | `موږ` | Saleha → player |
| 2 | Recognise “together” in a familiar sentence | shared-action adverb | Mina → player |
| 3 | Recognise the word for “river/lake” | Day 1 recall | Saleha → player |
| 4 | Recognise “you all” | `تاسې` | Mina → player |
| 5 | Recognise “walk” or “run” | local action vocabulary | Saleha → player |
| 6 | Convert “I run” to “we run” | 1SG → 1PL ending | Saleha → player |
| 7 | Identify subject of “Mina and I walk together” | speaker-included group | Mina introduces; player answers as player |
| 8 | Distinguish “We see two birds” from “You both see two birds” | we versus you-all | Saleha → player |
| 9 | Understand “We drink water” | SOV + 1PL | Mina → player |
| 10 | Identify who is addressed in “You both carry the water” | 2PL listener group | Player → Saleha and Mina |
| 11 | Build “We walk together beside the lake” | natural present sentence | Player → Saleha and Mina |
| 12 | Build “Mina and I see the village” | named subject including player | Player → Saleha |
| 13 | Build “You both drink water” | second plural, clear audience | Player → Saleha and Mina |
| 14 | Build “We carry the bag” | SOV + 1PL | Player → Mina |
| 15 | Build “I see the river, and we see the hills” | two sensible clauses with distinct subjects | Player → Saleha and Mina |

Questions may be mixed/shuffled provided each remains semantically coherent and the first-try score is exactly 15 opportunities. If a target introduces a new location noun *hills*, ensure the challenge introduces it as context rather than grading an unseen word on a skip-only path, or make the word meaning available in the prompt.

## Day 7 — The People Around Us

**Primary grammar:** `هغوی` (“they”), third-person plural present. Highlight how a pronoun and real-world referent tell us which group is being described; in common present forms third-person singular/plural suffixes may coincide (`ـي`), so **do not teach a false universal rule that the plural ending is always distinct**. Distinguish `they` (group spoken about), `we` (speaker's group), `you all` (addressed group), he/she, informal you, and polite singular you.

### Market opening (required for normal story)

1. **Edris → player:** “The market is busy today. Look at the people beside the fruit stall. They are buying apples.”
2. **Edris → player:** “See those customers? They carry baskets.”
3. **Edris → player:** Contrast “He buys bread” with “They buy bread” and identify that the subject changes from one person to a group; carefully model verbs and plural nouns as needed.
4. **Edris → player:** Contrast “We buy vegetables” (Edris + player included), “You all buy vegetables” (addressing customers), “They buy vegetables” (speaking about customers).
5. **Player practice:** describe at least two distinct groups in the market without describing Edris or the player as a third-party group.

### Day 7 location sentence sets (five each)

| Location / characters | English meanings | Focus |
|---|---|---|
| **Market — Edris, customers** | 1. They buy apples. 2. They carry baskets. 3. They choose fresh vegetables. 4. They sell bread at the stall. 5. They drink water. | `they`, buying/selling; reused food words; mark which group is being observed |
| **Home — Muhammad Jan, visiting relatives** | 1. They open the door. 2. They clean the room. 3. They drink tea together. 4. They sit on chairs. 5. They help Muhammad Jan. | group of visitors; house vocabulary revisited |
| **Lake — Saleha, Mina and other children** | 1. They walk beside the water. 2. They see fish. 3. They watch the birds. 4. They carry bottles of water. 5. They run together. | clearly define observed group; Mina visible as character, no artificial fixed posting |
| **School — Ms Hameed and other students** | 1. They read books. 2. They write sentences. 3. They learn Pashto. 4. They answer questions. 5. They open their notebooks. | third plural subjects, literacy; cumulative review |

Avoid making the same character talk about *themself* as `they` without an explicit quotation/observer. Location words should refer to what can plausibly occur there. New nouns need introduction with speaker pronunciation buttons before normal-route recall; skipped players can still attempt the cumulative test.

## Day 7 final — Ms Hameed's Week 1 lesson and examination

**Location:** School, as a special separate final assessment event after normal visits (or immediately from Skip). Ms Hameed is the visible exam leader. Other characters can appear in situational prompts, but the interface must always show who is quoted and to whom the player replies.

Opening dialogue suggestion: “You have spent your first week speaking with your neighbours. Today we will check how you describe things, talk about yourself, speak to friends and elders, and talk about groups.”

**25 unique graded questions; pass at 20/25 (80%).** Suggested balanced bank:

| # | Section | Prompt or scenario (English meaning) | Skill / response |
|---|---|---|---|
| 1 | Pronouns | Player describes what the player and Mina do. | Choose `we / موږ` |
| 2 | Pronouns | Player speaks directly to familiar friend Saleha. | Choose informal `you / ته` |
| 3 | Pronouns | Player addresses Ms Hameed respectfully. | Choose polite `you / تاسې` |
| 4 | Pronouns | Player addresses Saleha and Mina together. | Choose plural `you / تاسې` |
| 5 | Pronouns | Player describes customers elsewhere in the market. | Choose `they / هغوی` |
| 6 | Verb forms | “I read a book.” | Use first-person singular present verb form |
| 7 | Verb forms | “You [Saleha] read a book.” | Use second-person singular present verb form |
| 8 | Verb forms | “We read books.” | Use first-person plural present verb form |
| 9 | Verb forms | “You all read books.” | Use second-person plural present verb form |
| 10 | Verb forms | “They read books.” | Use third-person plural and context |
| 11 | SOV | “He buys bread.” | Construct subject–object–verb |
| 12 | SOV | “I drink water.” | Construct subject–object–verb |
| 13 | SOV | “We see birds.” | Construct present SOV |
| 14 | SOV | “They carry baskets.” | Construct present SOV |
| 15 | SOV | “You [friend] open the book.” | SOV + 2SG |
| 16 | Compound | “You [Saleha] clean the room, and I sit on the chair.” | Both clauses present / `او` |
| 17 | Compound | “I read the book, and you [Saleha] write a sentence.” | 1SG + 2SG |
| 18 | Compound | “We buy vegetables, and they buy bread.” | 1PL + 3PL |
| 19 | Compound | “You all read books, and we write sentences.” | 2PL + 1PL |
| 20 | Compound | “The door is open, and they clean the room.” | adjective/copula recall + action |
| 21 | Dialogue | Mina invites player to join a group run. Player says “We run together.” | 1PL; group includes player |
| 22 | Dialogue | Player addresses Saleha alone: “You see the bird.” | 2SG informal |
| 23 | Dialogue | Player politely tells Muhammad Jan “You drink tea.” | respectful 2nd singular (`تاسې`) |
| 24 | Dialogue | Player addresses both sisters: “You both walk beside the river.” | plural 2nd |
| 25 | Dialogue | Edris points to shoppers: player says “They buy apples.” | 3PL observer perspective |

**Implementation:** The 25 items can use an appropriate mixture of choice, recall, translation and tile construction. All grading should evaluate **the current question's exact expected form**, including clear person/number; avoid visually identical alternatives and distractors that are valid regional variants. If older content lacks words needed for an item, explicitly teach or replace it with familiar contextual vocabulary. Maintain question speaker/addressee labels for each interaction. No question should be missing its Pashto answer. If translations require additional review, flag them without silently disabling the exam.

### Graduation narrative and rewards

If score **<20/25**, Ms Hameed gives supportive feedback and invites another attempt. Player stays **Newcomer**, even with >=1,800 stored XP.

If score **>=20/25** on the **new exam version**, one-time XP floor is applied, **Level 10** is unlocked, title changes to **New Resident**, and Ms Hameed congratulates the player for successfully finishing the first week. Example dialogue: “When you arrived, you were a newcomer. Now you can introduce yourself, speak respectfully to your neighbours, and describe the people around you. You are a new resident of our village.” Show a persistent completion record and replay affordance; this is not the end of the game and does not unlock unplanned Week 2 content.
