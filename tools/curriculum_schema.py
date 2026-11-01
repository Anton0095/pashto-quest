"""Mechanical curriculum validation and audit. No linguistic approval is inferred."""

import json, re
from pathlib import Path

def is_native_approved(entry):
    review = entry.get("nativeReview", {})
    return entry.get("reviewStatus") == "native_approved" and bool(review.get("reviewer")) and bool(review.get("reference")) and bool(review.get("date"))


def is_user_approved(entry):
    review = entry.get("userApproval", {})
    return (entry.get("reviewStatus") == "user_approved" and entry.get("userVerified") is True
            and all(review.get(k) for k in ["reviewer", "date", "reference"])
            and review.get("nativeCertificationClaimed") is False)


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
        if e.get("reviewStatus") == "native_approved" and not is_native_approved(e):
            raise ValueError("Native approval requires reviewer evidence: " + eid)
        if e.get("reviewStatus") not in {"needs_native_review", "provisional_playable", "native_approved", "user_approved"}:
            raise ValueError("Invalid playable review status: " + eid)
        if e.get("reviewStatus") == "provisional_playable" and (
            e.get("userVerified") is not False
            or e.get("provenance", {}).get("nativeApproved") is not False
        ):
            raise ValueError("False provisional approval: " + eid)
        if e.get("reviewStatus") == "user_approved" and not is_user_approved(e):
            raise ValueError("User approval requires scoped reviewer/date/reference evidence: " + eid)
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
            if "acceptedEnglishAnswers" in f:
                answers=f["acceptedEnglishAnswers"]
                if (not isinstance(answers,list) or not answers or any(not isinstance(a,str) or not a.strip() for a in answers)
                        or len(set(a.casefold() for a in answers)) != len(answers) or not f.get("englishAnswerEvidence",{}).get("reference")):
                    raise ValueError("Invalid explicit English answer policy: " + fid)
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
            if f["composition"]["enabled"]:
                evidence = f.get("featureEvidence", {})
                c = f["composition"]
                if (not f.get("romanisation") or not c.get("roles")
                    or evidence.get("pashtoSpan") != f["pashto"]
                    or evidence.get("romanisationSpan") != f["romanisation"]
                    or evidence.get("features") != m):
                    raise ValueError("Incomplete composition evidence: " + fid)
                if "verb" in c["roles"] and any(m.get(k) is None for k in
                        ["person", "number", "tense", "aspect", "mood", "transitivity"]):
                    raise ValueError("Incomplete finite verb: " + fid)
                if "verb" in c["roles"] and (m.get("tense"), m.get("aspect"), m.get("mood")) != ("present", "imperfective", "indicative"):
                    raise ValueError("Unsupported productive tense/aspect/mood: " + fid)
                if "adjective" in c["roles"] and any(m.get(k) is None for k in ["gender", "number", "case"]):
                    raise ValueError("Incomplete adjective: " + fid)
                if "possessive" in c["roles"] and m.get("case") != "oblique":
                    raise ValueError("Possessive lacks case license: " + fid)
                if "location" in c["roles"] and (m.get("case") != "oblique" or c.get("chunkSchema") != "attested_indivisible"):
                    raise ValueError("Location lacks intact case license: " + fid)
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
    attestations = {a["sourceId"]: a for a in data.get("generationAttestations", [])}
    for fid, (e, f) in forms.items():
        if not f["composition"]["enabled"]:
            continue
        evidence = f["featureEvidence"]
        a = attestations.get(evidence["sourceId"])
        if not a or f["pashto"] not in a["pashto"] or (f["romanisation"] not in a["romanisation"] and not (is_user_approved(e) and f is e["forms"][0] and f["romanisation"] == e["romanisation"] and evidence.get("romanisationApproval") == e.get("userApproval"))):
            raise ValueError("Unattested composition span: " + fid)
        if f.get("priorAttestedRomanisation") and (not a or f["priorAttestedRomanisation"] not in a["romanisation"] or not is_user_approved(e)):
            raise ValueError("Unattested prior pronunciation aid: " + fid)
    config = data.get("sentenceFrames", {})
    if config and config.get("schemaVersion") != 2:
        raise ValueError("Unsupported frame schema")
    frameids = set()
    roles = {r for _, f in forms.values() for r in f["composition"].get("roles", [])}
    realisers = {"description", "attributive", "identification", "spatial", "where", "which", "whose", "how_many", "what", "transitive", "intransitive"}
    for frame in config.get("frames", []):
        if frame["id"] in frameids:
            raise ValueError("Duplicate frame identity")
        frameids.add(frame["id"])
        if frame.get("scope") != "feature_vetted_draft" or frame.get("englishRealiser") not in realisers:
            raise ValueError("Unsupported frame license/realiser")
        if not 1 <= frame["earliestDay"] <= 13 or any(dep not in grammar for dep in frame["requiredGrammarIds"]):
            raise ValueError("Unhandled frame grammar")
        placeholders = set(re.findall(r"\{([a-z]+)\}", frame["pashtoPattern"]))
        expected = set(frame["slots"]) | ({"copula"} if frame.get("copulaFrom") else set())
        residue = re.sub(r"\{[a-z]+\}", "", frame["pashtoPattern"])
        if placeholders != expected or residue.strip(" .؟"):
            raise ValueError("Unlicensed pattern token or omitted semantic slot")
        for name, slot in frame["slots"].items():
            if slot["role"] not in roles or (slot["partOfSpeech"] and slot["partOfSpeech"] not in POS):
                raise ValueError("Unknown typed slot")
            if slot.get("grammaticalFunction") not in {None, "independent", "determiner"}:
                raise ValueError("Unknown grammatical function")
            if "case" in slot["features"] and slot["features"]["case"] != ("oblique" if slot["role"] in {"possessive", "location"} else "direct"):
                raise ValueError("Invalid slot case")
        for rule in frame["constraints"]:
            if rule["type"] not in {"agree", "adjective", "object", "location", "ownable", "countable", "numeral", "adverb"}:
                raise ValueError("Unknown unification constraint")
            if rule["left"] not in frame["slots"] or (rule.get("right") and rule["right"] not in frame["slots"]):
                raise ValueError("Missing constraint slot")
        for terminal in frame["terminals"]:
            a = attestations.get(terminal["evidenceSourceId"])
            if terminal["grammarId"] not in grammar or not a or terminal["pashto"] not in a["pashto"] or terminal["romanisation"] not in a["romanisation"]:
                raise ValueError("Unhandled terminal grammar/evidence")
    for frame in config.get("compositeFrames", []):
        if (frame.get("id") in frameids or frame.get("id") != "coordinate-present"
                or frame.get("family") != "coordinated_present"
                or frame.get("kind") != "clause_coordination"
                or frame.get("scope") != "feature_vetted_draft"
                or frame.get("earliestDay") != 4
                or frame.get("requiredGrammarIds") != ["grammar-day-4"]
                or frame.get("connectorRole") != "conjunction"):
            raise ValueError("Unsupported composite grammar frame")
        frameids.add(frame["id"])
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
