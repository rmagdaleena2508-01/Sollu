# Sollu demo data

This folder holds the checked facts Sollu answers from: 20 schemes, 5 rights and 3 real notices for Tamil Nadu. The app reads only `sollu-demo.json`.

## What's in here

| Path | What it is |
|---|---|
| `sollu-demo.json` | The file the app uses. Only entries that passed the checker and were not held back. |
| `schemes/`, `rights/`, `notices/` | One JSON file per entry, with its quotes, gaps, check result and review note. |
| `sources/<id>/` | For each official source: `meta.json` (URL, fetch time, SHA-256 of the original) and `text.txt` (the text the quotes are matched against). The original PDFs and pages are not stored here; fetch them again from the URL and compare the SHA-256. |
| `tools/fetch.sh` | Saves a new official source. |
| `tools/check.py` | Checks every entry. `--write` records the result, `--build` rebuilds `sollu-demo.json`. |

## How an entry gets in

1. The source is saved from an official site with `tools/fetch.sh`.
2. Every fact in the entry has a quote copied word for word from that source's `text.txt`. Missing facts stay empty and are listed under `gaps`.
3. `tools/check.py` passes it: every quote is found, every source is official, every filled fact has a quote.
4. A reviewer reads it and sets `review.demo_use`: `ready`, `caution` (use, but keep the note in mind) or `hold` (left out of `sollu-demo.json`).
5. `review.human_review` stays `pending` until the project owner confirms amounts and current status. These checks prove a fact matches an official page. They don't prove the page is up to date.

## Golden rules

1. **Official sources only.** Government sites (`*.gov.in`, `*.nic.in`, `*.tn.gov.in`) and named official portals listed in `tools/check.py`. Never news sites, blogs or aggregators (citizennest, sarkariyojana, schemesinindia, policybazaar, indiankanoon, wikipedia).
2. **Save before you use.** Every source is saved with `tools/fetch.sh <source-id> <url> [render]`. That stores the original file, a `text.txt` and `meta.json` (URL, fetch time, SHA-256).
3. **Every fact needs a quote.** Each filled field has an `evidence` item whose `quote` is copied word for word from that source's `text.txt`. If the source doesn't say it, the field is `null` and the gap is listed in `gaps`. Never fill a field from memory.
4. **The checker decides.** `python3 data/tools/check.py` marks each entry `verified` only when every quote is found in its saved source and every filled field has a quote.

## Scheme (`schemes/<id>.json`)

```json
{
  "id": "pm-kisan",
  "type": "scheme",
  "name_en": "Pradhan Mantri Kisan Samman Nidhi",
  "name_ta": null,
  "level": "central",
  "department": "Department of Agriculture and Farmers Welfare",
  "audiences": ["farmers"],
  "benefit": "Plain-English sentence on what you get.",
  "eligibility": {
    "age_min": null, "age_max": null,
    "gender": null,
    "income_max_annual_inr": null,
    "occupation": ["farmer"],
    "community": null,
    "district": "all",
    "other": ["Must own cultivable land"]
  },
  "documents": ["Aadhaar"],
  "how_to_apply": "…",
  "where_to_apply": "…",
  "helpline": null,
  "go_number": null,
  "sources": ["pm-kisan-home"],
  "evidence": [
    {"field": "benefit", "source": "pm-kisan-home", "quote": "exact words from text.txt"}
  ],
  "gaps": ["Source does not list an income limit."]
}
```

`audiences` uses only: `school_students`, `college_students`, `seniors`, `farmers`, `workers`, `women`.
`gender` is `"female"`, `"male"`, `"any"` or `null`. `district` is `"all"`, a list of districts, or `null`.

## Right (`rights/<id>.json`)

```json
{
  "id": "right-rti",
  "type": "right",
  "topic": "rti",
  "title_en": "You can ask the government for information",
  "law": "Right to Information Act, 2005, Section 6 and 7",
  "rule_plain": "2-3 plain sentences.",
  "what_you_can_do": ["Step 1", "Step 2"],
  "where_to_get_help": "…",
  "sources": ["rti-act-2005"],
  "evidence": [{"field": "rule_plain", "source": "rti-act-2005", "quote": "…"}],
  "gaps": []
}
```

`topic` is one of `wages`, `rent`, `ration`, `rti`, `police_complaint`.

## Notice (`notices/<id>.json`)

```json
{
  "id": "notice-…",
  "type": "notice",
  "title": "…",
  "issued_by": "…",
  "date": "YYYY-MM-DD or null",
  "reference_number": "G.O./notification number or null",
  "says": "Plain-English summary, 1-2 sentences.",
  "what_to_do": "… or null",
  "by_when": "… or null",
  "if_not": "… or null",
  "who_it_affects": "…",
  "sources": ["…"],
  "evidence": [{"field": "says", "source": "…", "quote": "…"}],
  "gaps": []
}
```

## Evidence `field` names

Use the JSON path of the field the quote supports: `benefit`, `name_ta`, `department`, `eligibility.age_min`, `eligibility.income_max_annual_inr`, `eligibility.other`, `documents`, `how_to_apply`, `where_to_apply`, `helpline`, `go_number`, `rule_plain`, `what_you_can_do`, `law`, `says`, `what_to_do`, `by_when`, `if_not`, `date`, `reference_number`, and so on.
