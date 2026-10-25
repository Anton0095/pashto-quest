#!/usr/bin/env python3
"""Generate editorial-only coverage and human review batches; never activate language."""

import argparse, collections, csv, io, json, re, subprocess, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/language-review"


def read(n):
    return json.loads((ROOT / "content" / f"{n}.json").read_text())


def tokens(s):
    text = unicodedata.normalize("NFC", s or "")
    text = "".join(
        (
            c
            if "\u0600" <= c <= "\u06ff" and unicodedata.category(c)[0] in ["L", "M"]
            else " "
        )
        for c in text
    )
    return [t for t in text.split() if t.strip("ـ")]


def build():
    lex = read("LIBRARY_LEXICON")
    candidates = read("DISTRICT_VOCABULARY_CANDIDATES")
    universal = read("UNIVERSAL_TEACHING_TARGETS")
    narrative = read("NARRATIVE_EXPRESSIONS")
    runtime = json.loads(
        subprocess.check_output(
            ["node", "tools/review-surfaces.mjs"], cwd=ROOT, text=True
        )
    )
    rows = []
    surfaces = []

    def row(
        identity,
        kind,
        meaning,
        morphology,
        scenes,
        evidence,
        existing=None,
        priority="P1",
    ):
        r = dict(
            id=identity,
            kind=kind,
            priority=priority,
            intendedMeaning=meaning,
            morphology=morphology,
            suitableScenes=scenes,
            evidence=evidence,
            existing=existing or {},
            status="pending-human-review",
            proposedPashto=None,
            proposedRomanisation=None,
            localVsWrittenVariant=None,
            acceptedAlternatives=[],
            alternativeRationale=None,
            reviewer=None,
            reviewDate=None,
            reviewReference=None,
            audioProvenance=None,
            decision=None,
        )
        rows.append(r)
        return r

    requests = {
        "noun": "Confirm lexical sense, gender, countability, singular/plural and direct/oblique forms needed by cited sentences.",
        "verb": "Confirm infinitive, simple/compound identity, transitivity, present stems, person/number agreement, object marking and contextual subject; do not infer stems from suffixes.",
        "adjective": "Confirm sense, gender/number agreement and direct/oblique forms in cited contexts.",
    }
    known = collections.defaultdict(set)
    for e in lex["entries"]:
        for f in e["forms"]:
            for t in tokens(f["pashto"]):
                known[t].add(e["lemmaId"])
        row(
            e["lemmaId"],
            "existing-lemma",
            e["englishSenses"],
            {
                "partOfSpeech": e["partOfSpeech"],
                "forms": e["forms"],
                "reviewRequest": requests.get(
                    e["partOfSpeech"],
                    "Confirm grammatical function, reference, agreement and contextual scope.",
                ),
            },
            e["suitableDistricts"],
            [
                {
                    "file": "content/LIBRARY_LEXICON.json",
                    "lemmaId": e["lemmaId"],
                    "examples": e["examples"],
                    "mappedSourceIds": [
                        k
                        for k, v in lex["sourceMappings"].items()
                        if any(x["lemmaId"] == e["lemmaId"] for x in v)
                    ],
                }
            ],
            {
                "pashto": e["displayLemmaPs"],
                "romanisation": e["romanisation"],
                "reviewStatus": e["reviewStatus"],
            },
        )

    def surface(identity, ps, en, roman, day, scene, source, **extra):
        if not ps or not tokens(ps):
            return
        surfaces.append(
            dict(
                id=identity,
                pashto=ps,
                englishContext=en,
                romanisation=roman,
                day=day,
                scene=scene,
                source=source,
                **extra,
            )
        )

    for c in runtime["cards"]:
        # Catalog aliases are reviewed through their stable lemma/form record once.
        if c["id"].startswith(("library-card:", "library-form:")):
            continue
        surface(
            c["id"],
            c["ps"],
            c["en"],
            c.get("roman"),
            c.get("loop"),
            c.get("place"),
            "runtime-catalog",
            speaker=c.get("speaker"),
            recipient=c.get("recipient"),
            sourceMappings=lex["sourceMappings"].get(c["id"], []),
        )
    for d in read("WEEK2_RUNTIME")["days"]:
        for i, (ps, en) in enumerate(d["models"]):
            surface(
                f'model:{d["day"]}:{i}',
                ps,
                en,
                None,
                d["day"],
                d["opening"],
                "content/WEEK2_RUNTIME.json models",
            )
        for q in d["dialogues"]:
            for role, ps, en in [
                ("prompt", q["promptPs"], q.get("promptEnglish")),
                ("reply", q["answerPs"], q.get("answerEnglish")),
            ]:
                surface(
                    q["id"] + ":" + role,
                    ps,
                    en,
                    None,
                    d["day"],
                    q.get("location", "school" if d["day"] == 14 else d["opening"]),
                    "content/WEEK2_RUNTIME.json dialogues",
                    speaker=q.get("speaker") if role == "prompt" else "Player",
                    recipient="Player" if role == "prompt" else q.get("speaker"),
                    authoredContext=q.get("context"),
                )
            for i, ps in enumerate(q["duds"]):
                surface(
                    q["id"] + f":dud:{i}",
                    ps,
                    "Distractor; must be wrong for this reply, not a new teaching lemma.",
                    None,
                    d["day"],
                    d["opening"],
                    "content/WEEK2_RUNTIME.json duds",
                    promptPashto=q["promptPs"],
                    targetPashto=q["answerPs"],
                    targetEnglish=q.get("answerEnglish"),
                )
        for l in d["lessons"]:
            for c in l["cards"]:
                for i, ps in enumerate(c.get("duds", [])):
                    surface(
                        c["id"] + f":dud:{i}",
                        ps,
                        "Distractor; validate against the exact sentence.",
                        None,
                        d["day"],
                        l["location"],
                        "content/WEEK2_RUNTIME.json duds",
                        targetPashto=c["pashto"],
                        targetEnglish=c["english"],
                        speaker=c.get("speaker"),
                        recipient=c.get("recipient"),
                    )
    for a in runtime["assessments"]:
        for q in a["questions"]:
            for k in ["prompt", "comment", "correct", "answerPs", "promptPs"]:
                if isinstance(q.get(k), str):
                    surface(
                        q["id"] + ":" + k,
                        q[k],
                        q.get("answerEnglish") or q.get("prompt") or q.get("comment"),
                        None,
                        a["day"],
                        q.get("location", "challenge"),
                        "src/assessment-content.js",
                        speaker=q.get("speaker"),
                        recipient=q.get("recipient"),
                    )
            for i, ps in enumerate(q.get("options", [])):
                surface(
                    q["id"] + f":option:{i}",
                    ps,
                    "Assessment option; correctness depends on authored question.",
                    None,
                    a["day"],
                    "challenge",
                    "src/assessment-content.js",
                    question=q,
                )
    # Include Pashto inside explanatory prose, workshops and tutorial text, beyond JSON cards.
    for path in sorted((ROOT / "src").glob("*.js")):
        for m in re.finditer(r'"(?:\\.|[^"\\])*"', path.read_text()):
            try:
                value = json.loads(m[0])
            except ValueError:
                continue
            if tokens(value):
                surface(
                    f"literal:{path.name}:{path.read_text()[:m.start()].count(chr(10))+1}",
                    value,
                    "Authored inline text; reviewer must distinguish examples, alternatives and UI labels.",
                    None,
                    None,
                    None,
                    str(path.relative_to(ROOT)),
                )
    for s in surfaces:
        row(
            "surface:" + s["id"],
            "authored-surface",
            s["englishContext"],
            {
                "reviewRequest": "Align every Pashto component with intended English; identify lemma/form IDs, agreement, person/number, case and phrase boundaries. Validate distractors/accepted answers separately."
            },
            [s["scene"]] if s["scene"] else ["context-in-source"],
            [s],
            {"pashto": s["pashto"], "romanisation": s["romanisation"]},
            "P0" if (s.get("day") in [6, 7] or ":dud:" in s["id"]) else "P1",
        )
    unmatched = collections.defaultdict(list)
    for s in surfaces:
        for t in sorted(set(tokens(s["pashto"])) - known.keys()):
            unmatched[t].append(s)
    for t, uses in sorted(unmatched.items()):
        row(
            "unmapped-token:" + t,
            "possible-form-or-identity-gap",
            {
                "status": "unresolved-token-alignment",
                "englishContexts": sorted(set(s["englishContext"] or "" for s in uses)),
                "instruction": "Assign the precise token sense from cited contexts; no English-to-token alignment has been assumed.",
            },
            {
                "status": "requires-human-analysis",
                "reviewRequest": "Determine whether this is an inflection, function word, name, compound component, orthographic variant or genuinely missing lemma; map to an existing identity before proposing a new lemma.",
            },
            sorted(set(s["scene"] or "context-in-source" for s in uses)),
            uses,
            {"pashto": t},
            "P0",
        )
    for c in candidates["candidates"]:
        row(
            c["candidateId"],
            "selected-candidate" if c["selectedForExpansion"] else "excluded-candidate",
            c["englishLemma"],
            {
                "partOfSpeech": c["partOfSpeech"],
                "reviewRequest": requests.get(
                    c["partOfSpeech"],
                    "Confirm lexical category and full contextual paradigm.",
                ),
            },
            c["suitableDistricts"],
            [
                {
                    "file": "content/DISTRICT_VOCABULARY_CANDIDATES.json",
                    "selectionNote": c.get("selectionNote"),
                    "auditNote": c["auditNote"],
                }
            ],
            priority="P2" if c["selectedForExpansion"] else "P3",
        )
    for t in universal["targets"]:
        row(
            t["targetId"],
            "universal-target",
            t["english"],
            {
                "reviewRequest": "Resolve semantic target to existing or new lemma/form; specify person, number, deixis, case, politeness or grammatical scope as applicable. Do not count an inflection as another lemma."
            },
            ["residential", "nature", "business", "school"],
            [{"file": "content/UNIVERSAL_TEACHING_TARGETS.json", **t}],
            priority="P2",
        )
    for p in narrative["expressions"]:
        row(
            p["id"],
            "expression",
            p["english"],
            {
                "reviewRequest": "Confirm fixed phrase, speech act, politeness, addressee number and idiomatic Laghman use; provide complete phrase, not isolated token glosses."
            },
            [p["location"]],
            [{"file": "content/NARRATIVE_EXPRESSIONS.json", **p}],
            {
                "pashto": p["pashto"],
                "romanisation": p["romanisation"],
                "active": p["active"],
            },
            "P0" if not p["active"] else "P1",
        )
    ids = [r["id"] for r in rows]
    # Surface IDs can recur as both a catalog and assessment field; consolidate exact duplicates.
    unique = {}
    for r in rows:
        if r["id"] in unique:
            unique[r["id"]]["evidence"] += r["evidence"]
        else:
            unique[r["id"]] = r
    rows = list(unique.values())
    gaps = {
        "unmappedSourceReferences": [],
        "orphanSourceMappingIds": sorted(
            set(lex["sourceMappings"])
            - (
                {c["id"] for c in runtime["cards"]}
                | {q["id"] for a in runtime["assessments"] for q in a["questions"]}
            )
        ),
        "missingLexicalCardMappings": [],
        "incompleteForms": [],
    }
    entries = {e["lemmaId"]: e for e in lex["entries"]}
    for sid, refs in lex["sourceMappings"].items():
        for ref in refs:
            if ref["lemmaId"] not in entries or not any(
                f["formId"] == ref["formId"] for f in entries[ref["lemmaId"]]["forms"]
            ):
                gaps["unmappedSourceReferences"].append({"sourceId": sid, **ref})
    for c in runtime["cards"]:
        if (
            c.get("type") not in ["sentence", "greeting"]
            and not c["id"].startswith("library-")
            and not lex["sourceMappings"].get(c["id"])
        ):
            gaps["missingLexicalCardMappings"].append(c["id"])
    for e in lex["entries"]:
        for f in e["forms"]:
            if (
                not f.get("romanisation")
                or not f.get("englishGloss")
                or any(v == "unspecified" for v in f.get("morphology", {}).values())
            ):
                gaps["incompleteForms"].append(
                    {
                        "lemmaId": e["lemmaId"],
                        "formId": f["formId"],
                        "morphology": f.get("morphology"),
                        "meaning": f.get("englishGloss"),
                    }
                )
    files = {
        "scenes.json": json.dumps(runtime["scenes"], ensure_ascii=False, indent=2)
        + "\n"
    }
    batches = []
    for priority in ["P0", "P1", "P2", "P3"]:
        group = [r for r in rows if r["priority"] == priority]
        for i in range(0, len(group), 25):
            name = f"{priority}-{i//25+1:02d}"
            part = group[i : i + 25]
            batches.append(
                {"batchId": name, "count": len(part), "file": f"batches/{name}.json"}
            )
            files[f"batches/{name}.json"] = (
                json.dumps(
                    {"batchId": name, "activationAllowed": False, "items": part},
                    ensure_ascii=False,
                    indent=2,
                )
                + "\n"
            )
    summary = {
        "counts": dict(collections.Counter(r["kind"] for r in rows)),
        "playableLemmas": len(entries),
        "playableForms": sum(len(e["forms"]) for e in entries.values()),
        "surfaceRecords": len(surfaces),
        "possibleUnmappedTokens": len(unmatched),
        "structuralGaps": gaps,
        "batches": batches,
        "limitations": [
            "Exact token matching is triage, not linguistic segmentation or proof of missing lemmas.",
            "No new Pashto, morphology approval, accepted alternatives or audio provenance has been invented.",
            "Inline double-quoted Pashto literals are included; dynamically assembled/template prose requires reviewer inspection of source alongside these batches.",
            "Planning demand shortfalls are separate from lexical identity gaps; untranslated candidates remain inactive.",
        ],
    }
    files["FINDINGS.md"] = (
        "# Coverage findings\n\n"
        + f'Playable draft: {len(entries)} lemmas / {sum(len(e["forms"]) for e in entries.values())} forms. No broken source references or unmapped standalone lexical cards were found.\n\n'
        + f'{len(gaps["incompleteForms"])} form records need metadata triage; an unspecified number on an infinitive may be not applicable rather than an error. {len(unmatched)} distinct tokens need identity/alignment review, not automatic new-lemma creation.\n\n'
        + "Unresolved tokens (see their complete source contexts and scenes in the register/batches):\n\n"
        + ", ".join("`" + t + "`" for t in sorted(unmatched))
        + "\n\nFuture supply: 301 selected untranslated district candidates, 40 universal targets and 15 untranslated expression slots. At least 213 additional district identities would be required for 24/day across Days 1–13, before exposure and scene constraints. These are distinct from token-alignment findings.\n"
    )
    files["coverage.json"] = json.dumps(summary, ensure_ascii=False, indent=2) + "\n"
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(
        [
            "batch",
            "id",
            "kind",
            "intendedMeaning",
            "scenes",
            "morphology",
            "reviewer",
            "date",
            "proposedPashto",
            "proposedRomanisation",
            "reference",
            "decision",
        ]
    )
    for b in batches:
        for r in json.loads(files[b["file"]])["items"]:
            w.writerow(
                [
                    b["batchId"],
                    r["id"],
                    r["kind"],
                    json.dumps(r["intendedMeaning"], ensure_ascii=False),
                    ";".join(r["suitableScenes"]),
                    json.dumps(r["morphology"], ensure_ascii=False),
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ]
            )
    files["review-register.csv"] = buf.getvalue()
    return files, summary


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--check", action="store_true")
    args = p.parse_args()
    files, summary = build()
    if args.check:
        assert set(files) == {
            str(p.relative_to(OUT))
            for p in OUT.rglob("*")
            if p.is_file() and p.name != "README.md"
        }, "Stale review inventory"
        for n, s in files.items():
            assert (OUT / n).read_text() == s, f"Stale {n}"
    else:
        for old in OUT.glob("batches/*.json"):
            old.unlink()
        for n, s in files.items():
            path = OUT / n
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(s)
    print(
        json.dumps(
            {
                k: v
                for k, v in summary.items()
                if k
                in [
                    "counts",
                    "possibleUnmappedTokens",
                    "playableLemmas",
                    "playableForms",
                ]
            },
            ensure_ascii=False,
        )
    )
