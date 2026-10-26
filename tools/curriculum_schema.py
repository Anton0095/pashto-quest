"""Mechanical curriculum validation and audit. No linguistic approval is inferred."""

import json
from pathlib import Path

POS = {
    "noun",
    "verb",
    "adjective",
    "numeral",
    "demonstrative",
    "pronoun",
    "adverb",
    "interrogative",
    "adposition",
    "conjunction",
}
TRAITS = {"gender", "number", "case", "person", "aspect", "transitivity"}
DISTRICTS = {"residential", "nature", "business", "school"}


FEATURES = {
    "gender": {None, "masculine", "feminine"},
    "number": {None, "singular", "plural"},
    "case": {None, "direct", "oblique"},
    "person": {None, 1, 2, 3},
    "aspect": {None, "perfective", "imperfective"},
    "transitivity": {
        None,
        "transitive",
        "intransitive",
        "ditransitive",
        "ambitransitive",
    },
}


def validate_features(values, identity):
    if any(values.get(key) not in allowed for key, allowed in FEATURES.items()):
        raise ValueError("Invalid grammatical feature: " + identity)


def validate_curriculum(data):
    entries = {}
    forms = {}
    grammar = {g["grammarId"] for g in data["grammar"]}
    for e in data["entries"]:
        eid = e["lemmaId"]
        if eid in entries:
            raise ValueError("Duplicate lemma identity: " + eid)
        entries[eid] = e
        if e["partOfSpeech"] not in POS:
            raise ValueError("Invalid POS: " + eid)
        if not e.get("grammaticalRoles") or set(e.get("traits", {})) != TRAITS:
            raise ValueError("Missing grammatical traits: " + eid)
        validate_features(e["traits"], eid)
        intro = e.get("introduction", {})
        if (
            not isinstance(intro.get("day"), int)
            or not 1 <= intro["day"] <= 13
            or intro.get("district") not in DISTRICTS | {"universal"}
            or not isinstance(intro.get("teachingOrder"), int)
        ):
            raise ValueError("Invalid introduction: " + eid)
        if e["partOfSpeech"] == "verb" and intro["day"] < 2:
            raise ValueError("Day 1 action: " + eid)
        if (
            e["vocabularyClass"] == "district"
            and intro["district"] not in e["suitableDistricts"]
        ):
            raise ValueError("Unsuitable introduction district: " + eid)
        for dep in intro["requiredGrammarIds"]:
            if dep not in grammar or int(dep.split("-")[-1]) > intro["day"]:
                raise ValueError("Unhandled introduction grammar: " + eid)
        if not isinstance(e.get("forms"), list) or not e["forms"]:
            raise ValueError("Missing forms: " + eid)
        for f in e["forms"]:
            fid = f["formId"]
            m = f.get("morphology", {})
            if fid in forms:
                raise ValueError("Duplicate form identity: " + fid)
            forms[fid] = (e, f)
            if not TRAITS.issubset(m):
                raise ValueError("Missing form traits: " + fid)
            validate_features(m, fid)
            if (
                e["partOfSpeech"] != "verb"
                and m.get("person")
                and e["partOfSpeech"] != "pronoun"
            ):
                raise ValueError("Impossible person on form: " + fid)
            if m["form"] == "infinitive" and m.get("person"):
                raise ValueError("Finite infinitive: " + fid)
            if not 1 <= f["firstAllowedDay"] <= 13:
                raise ValueError("Invalid form introduction: " + fid)
            if any(
                dep not in grammar or int(dep.split("-")[-1]) > f["firstAllowedDay"]
                for dep in f["prerequisiteGrammarIds"]
            ):
                raise ValueError("Unhandled form grammar: " + fid)
            if f["composition"]["enabled"] and (
                not f.get("romanisation")
                or any(m.get(k) is None for k in ["gender", "number", "case"])
            ):
                raise ValueError("Incomplete composition form: " + fid)
    for sid, refs in data["sourceMappings"].items():
        for r in refs:
            if (
                r["formId"] not in forms
                or forms[r["formId"]][0]["lemmaId"] != r["lemmaId"]
            ):
                raise ValueError("Orphan source mapping: " + sid)
    orders = [
        (e["introduction"]["district"], e["introduction"]["teachingOrder"])
        for e in entries.values()
    ]
    if len(orders) != len(set(orders)):
        raise ValueError("Introduction order collision")
    frameids = set()
    for frame in data.get("sentenceFrames", {}).get("frames", []):
        if frame["id"] in frameids:
            raise ValueError("Duplicate frame identity")
        frameids.add(frame["id"])
        if len({b["id"] for b in frame["bindings"]}) != len(frame["bindings"]):
            raise ValueError("Duplicate binding identity")
        if any(dep not in grammar for dep in frame["requiredGrammarIds"]):
            raise ValueError("Unhandled frame grammar")
        for terminal in frame["terminals"]:
            if terminal["grammarId"] not in frame["requiredGrammarIds"] or any(
                frame["slots"]["noun"]["features"].get(key) != value
                for key, value in terminal["features"].items()
            ):
                raise ValueError("Unhandled terminal grammar/agreement")
        for b in frame["bindings"]:
            values = {}
            for name, spec in frame["slots"].items():
                r = b["slots"][name]
                e, f = forms.get(r["formId"], (None, None))
                if (
                    not e
                    or e["lemmaId"] != r["lemmaId"]
                    or e["partOfSpeech"] != spec["partOfSpeech"]
                    or not f["composition"]["enabled"]
                    or any(
                        f["morphology"].get(k) != v for k, v in spec["features"].items()
                    )
                ):
                    raise ValueError("Impossible frame binding: " + b["id"])
                values[name] = f["pashto"]
            if (
                frame["pashtoPattern"].format(**values) != b["output"]["pashto"]
                or frame["englishPattern"].format(**b["englishSlots"])
                != b["output"]["english"]
            ):
                raise ValueError("Inconsistent attestation: " + b["id"])
    return entries, forms


def audit(data):
    entries, forms = validate_curriculum(data)
    records = []
    for e in entries.values():
        findings = []
        if not e["examples"]:
            findings.append("missing-contextual-example")
        if e.get("identityWarning"):
            findings.append(e["identityWarning"])
        for f in e["forms"]:
            if not f.get("romanisation"):
                findings.append(f["formId"] + ":missing-own-romanisation")
            if f["metadataUncertainty"]:
                findings.append(f["formId"] + ":uncertain-morphology-or-romanisation")
        records.append(
            {
                **e,
                "mappedSourceIds": [
                    sid
                    for sid, refs in data["sourceMappings"].items()
                    if any(r["lemmaId"] == e["lemmaId"] for r in refs)
                ],
                "findings": findings,
            }
        )
    return {
        "schemaVersion": 1,
        "notice": "Mechanical editorial audit, not native Laghman verification. Null traits are unknown, not asserted defaults.",
        "lemmaCount": len(entries),
        "formCount": len(forms),
        "compositionExcludedFormIds": [
            fid for fid, (_, f) in forms.items() if not f["composition"]["enabled"]
        ],
        "records": records,
    }
