#!/usr/bin/env python3
"""Check every Sollu data entry against its saved official sources.

An entry is "verified" only when:
  - it has the required fields for its type,
  - every source it names was saved by tools/fetch.sh from an allowed official domain,
  - every evidence quote appears word for word (whitespace-insensitive) in that source's text.txt,
  - every filled fact field has at least one evidence quote.

Usage:
  python3 tools/check.py            # check all, print report
  python3 tools/check.py --write    # also write the result into each entry's "verification"
  python3 tools/check.py --build    # also build data/sollu-demo.json from verified entries
"""
import datetime
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent

OFFICIAL_SUFFIXES = (".gov.in", ".nic.in")
OFFICIAL_EXTRA = {
    "cmchistn.com",          # Chief Minister's Comprehensive Health Insurance Scheme (Govt of Tamil Nadu)
    "www.cmchistn.com",
}
BLOCKED = ("citizennest", "sarkariyojana", "schemesinindia", "policybazaar", "indiankanoon", "wikipedia")

AUDIENCES = {"school_students", "college_students", "seniors", "farmers", "workers", "women",
             "children", "disabled", "families", "entrepreneurs", "fishermen", "transgender", "everyone"}
TOPICS = {"wages", "rent", "ration", "rti", "police_complaint",
          "consumer", "domestic_violence", "dowry", "maternity_leave", "child_marriage", "legal_aid",
          "senior_maintenance", "workplace_harassment", "education", "cyber_crime"}

REQUIRED = {
    "scheme": ["id", "name_en", "level", "department", "audiences", "benefit", "eligibility", "sources", "evidence"],
    "right": ["id", "topic", "title_en", "law", "rule_plain", "what_you_can_do", "sources", "evidence"],
    "notice": ["id", "title", "issued_by", "says", "who_it_affects", "sources", "evidence"],
    "service": ["id", "title_en", "department", "what_it_is", "how_to_apply", "sources", "evidence"],
}

# Fields that state a fact and so must be backed by a quote when filled.
FACT_FIELDS = {
    "scheme": ["benefit", "name_ta", "eligibility.age_min", "eligibility.age_max", "eligibility.gender",
               "eligibility.income_max_annual_inr", "eligibility.occupation", "eligibility.community",
               "eligibility.other", "documents", "how_to_apply", "where_to_apply", "helpline", "go_number"],
    "right": ["law", "rule_plain", "what_you_can_do"],
    "notice": ["says", "what_to_do", "by_when", "if_not", "date", "reference_number"],
    "service": ["what_it_is", "name_ta", "who_can_apply", "documents", "how_to_apply", "where_to_apply",
                "fee", "time_limit", "validity", "helpline"],
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip().lower()


def get(entry, path):
    cur = entry
    for part in path.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def filled(v):
    if v is None:
        return False
    if isinstance(v, (list, str)) and len(v) == 0:
        return False
    if v == "any" or v == "all":
        return False  # "no restriction" needs no quote
    return True


source_text_cache = {}


def load_source(sid):
    if sid in source_text_cache:
        return source_text_cache[sid]
    d = ROOT / "sources" / sid
    meta_p, text_p = d / "meta.json", d / "text.txt"
    if not meta_p.exists() or not text_p.exists():
        source_text_cache[sid] = (None, None)
        return None, None
    meta = json.loads(meta_p.read_text())
    text = norm(text_p.read_text(encoding="utf-8", errors="replace"))
    source_text_cache[sid] = (meta, text)
    return meta, text


def official(url):
    host = (urlparse(url).hostname or "").lower()
    if any(b in host for b in BLOCKED):
        return False
    return host.endswith(OFFICIAL_SUFFIXES) or host in OFFICIAL_EXTRA


def check(entry):
    problems, warnings = [], []
    t = entry.get("type")
    if t not in REQUIRED:
        return ["unknown type"], []
    for f in REQUIRED[t]:
        if f not in entry:
            problems.append(f"missing field: {f}")
    if t == "scheme":
        bad = set(entry.get("audiences") or []) - AUDIENCES
        if bad:
            problems.append(f"unknown audiences: {sorted(bad)}")
        if entry.get("level") not in ("state", "central"):
            problems.append("level must be state or central")
    if t == "right" and entry.get("topic") not in TOPICS:
        problems.append(f"unknown topic: {entry.get('topic')}")

    srcs = entry.get("sources") or []
    if not srcs:
        problems.append("no sources")
    for sid in srcs:
        meta, text = load_source(sid)
        if meta is None:
            problems.append(f"source not saved: {sid}")
        elif not official(meta["url"]):
            problems.append(f"source not official: {sid} ({meta['url']})")
        elif len(text) < 200:
            warnings.append(f"source text very short ({len(text)} chars): {sid}")

    backed = set()
    for i, ev in enumerate(entry.get("evidence") or []):
        sid, quote, field = ev.get("source"), ev.get("quote", ""), ev.get("field", "")
        if sid not in srcs:
            problems.append(f"evidence #{i} cites source not in sources: {sid}")
            continue
        meta, text = load_source(sid)
        if text is None:
            continue
        q = norm(quote)
        if len(q) < 8:
            problems.append(f"evidence #{i} quote too short to prove anything: {quote!r}")
        elif q not in text:
            problems.append(f"evidence #{i} quote NOT FOUND in {sid}: {quote[:90]!r}")
        else:
            backed.add(field)
            backed.add(field.split(".")[0])

    for f in FACT_FIELDS[t]:
        if filled(get(entry, f)) and f not in backed:
            problems.append(f"field has no quote: {f}")
    return problems, warnings


def main():
    write = "--write" in sys.argv or "--build" in sys.argv
    build = "--build" in sys.argv
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    results = {"verified": [], "needs_review": []}
    for folder in ("schemes", "rights", "notices", "services"):
        for p in sorted((ROOT / folder).glob("*.json")):
            entry = json.loads(p.read_text())
            problems, warnings = check(entry)
            status = "verified" if not problems else "needs_review"
            results[status].append(entry)
            mark = "PASS" if not problems else "FAIL"
            print(f"[{mark}] {folder}/{p.name}")
            for x in problems:
                print(f"    - {x}")
            for x in warnings:
                print(f"    ~ {x}")
            if write:
                entry["verification"] = {
                    "status": status,
                    "method": "Automatic: every quote matched in the saved official source (tools/check.py).",
                    "checked_at": now,
                    "problems": problems,
                    "human_review": entry.get("verification", {}).get("human_review", "pending"),
                }
                p.write_text(json.dumps(entry, ensure_ascii=False, indent=2) + "\n")
    v, n = len(results["verified"]), len(results["needs_review"])
    print(f"\n{v} verified, {n} need review")
    if build:
        live = [e for e in results["verified"] if e.get("review", {}).get("demo_use") in ("ready", "caution")]
        held = [e["id"] for e in results["verified"] if e not in live]
        out = {"built_at": now,
               "note": "Only entries whose every quote matched an official saved source and that a reviewer did not hold back. "
                       "Entries marked review.demo_use = 'caution' must be spoken with their note in mind.",
               "held_back": held,
               "schemes": [e for e in live if e["type"] == "scheme"],
               "rights": [e for e in live if e["type"] == "right"],
               "notices": [e for e in live if e["type"] == "notice"],
               "services": [e for e in live if e["type"] == "service"]}
        # ROOT is the data/ folder, so this is data/sollu-demo.json, the file the app reads.
        (ROOT / "sollu-demo.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
        # A tiny index for the landing page's "Check" card: which checked schemes are for which group.
        index = {}
        for e in out["schemes"]:
            for aud in e["audiences"]:
                index.setdefault(aud, []).append({"id": e["id"], "name": e["name_en"]})
        (ROOT / "audience-index.json").write_text(json.dumps(
            {"note": "Built by tools/check.py --build from sollu-demo.json. Do not edit by hand.",
             "counts": {k: len(out[k]) for k in ("schemes", "rights", "notices", "services")},
             "audiences": index},
            ensure_ascii=False, indent=2) + "\n")
        print(f"built data/sollu-demo.json: {len(out['schemes'])} schemes, {len(out['rights'])} rights, "
              f"{len(out['notices'])} notices, {len(out['services'])} services")


if __name__ == "__main__":
    main()
