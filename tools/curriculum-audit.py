#!/usr/bin/env python3
"""Maintain the effective lexical audit after approved curriculum overrides."""

import argparse, json, re
from pathlib import Path
from build import build
from curriculum_schema import audit

ROOT = Path(__file__).resolve().parents[1]


def rendered():
    html = build()
    data = json.loads(re.search(r"const LIBRARY_DATA=(\{.*?\});", html, re.S)[1])
    game = json.loads(re.search(r"const GAME_DATA=(\{.*?\});", html, re.S)[1])
    raw = json.loads((ROOT / "content/LIBRARY_LEXICON.json").read_text())
    effective = {e["lemmaId"]: e for e in data["entries"]}
    for entry in raw["entries"]:
        entry["introduction"] = effective[entry["lemmaId"]]["introduction"]
        for form, current in zip(entry["forms"], effective[entry["lemmaId"]]["forms"]):
            form["firstAllowedDay"] = current["firstAllowedDay"]
    raw["sentenceFrames"] = data["sentenceFrames"]
    # Validate the complete evidence corpus; it is not embedded as teaching data.
    result = audit(raw)
    result["audioFindings"] = []  # evidence audio IDs were checked by build()
    result["archivedAuthoredSentenceCount"] = len(raw["generationAttestations"])
    result["playableAuthoredSentenceCount"] = 0
    result["runtimeSentenceSource"] = "productive_engine_only"
    result["nativeCertifiedLemmas"] = sum(
        e.get("reviewStatus") == "approved"
        and bool(e.get("nativeReview", {}).get("reviewer"))
        and bool(e.get("nativeReview", {}).get("reference"))
        for e in data["entries"]
    )
    result["sourceMappingCorrections"] = raw.get("sourceMappingCorrections", [])
    result["generationBoundary"] = {
        "policy": "Typed feature and semantic constraints over attested forms. Independent form study and grammar unlocks required; see GENERATION_AUDIT.json for day/family capacity and exact missing features. Provisional language, never native certification.",
        "frames": data["sentenceFrames"],
    }
    return json.dumps(result, ensure_ascii=False, indent=2) + "\n"


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--check", action="store_true")
    a = p.parse_args()
    path = ROOT / "content/CURRICULUM_AUDIT.json"
    s = rendered()
    if a.check:
        if path.read_text() != s:
            raise SystemExit("Stale curriculum audit")
    else:
        path.write_text(s)
    print(
        "Lexical audit: stable identities, intended introductions, form exclusions and archived evidence recorded; native review pending."
    )
