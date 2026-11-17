#!/usr/bin/env python3
"""Make the saved demo answers: data/demo-answers.json and public/demo-audio/*.mp3.

Each question goes through the real pipeline (the local dev server, with caches skipped),
so a saved answer is exactly what Sollu would say live. Then the read-aloud audio is made once.

Usage (with `npm run dev` running on port 8940):
  python3 data/tools/demo_answers.py
  python3 data/tools/demo_answers.py --base http://localhost:8950
  python3 data/tools/demo_answers.py --only en-boy,ta-salary   # redo some, keep the rest

Read every answer it prints before you commit the result.
"""
import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BASE = sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else "http://localhost:8940"
ONLY = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None

# (key, question, lang, key of the earlier question or None, what we expect)
SCRIPT = [
    # Demo script, step 1: Tamil voice, mother's pension, then the age.
    ("ta-pension", "என் அம்மாவுக்கு பென்ஷன் கிடைக்குமா?", "ta", None, "answer"),
    ("ta-pension-67", "67 வயசு", "ta", "ta-pension", "answer"),
    ("ta-pension-67b", "அவங்களுக்கு 67 வயசு", "ta", "ta-pension", "answer"),
    ("en-pension", "Can my mother get a pension?", "en", None, "answer"),
    ("en-pension-67", "She is 67", "en", "en-pension", "answer"),
    # Demo script, step 2: students.
    ("en-girl", "I'm a girl from a government school, now in first year of college. What can I get?", "en", None, "answer"),
    ("en-boy", "I'm a boy from a government school, now in first year of college. What can I get?", "en", None, "answer"),
    ("en-bsc-girl", "Any scholarship for a B.Sc girl from a government school?", "en", None, "answer"),
    ("ta-bsc-girl", "அரசு பள்ளியில படிச்ச B.Sc பொண்ணுக்கு உதவித்தொகை இருக்கா?", "ta", None, "answer"),
    # Demo script, step 3: a right.
    ("en-salary", "My salary is late by 2 months. What can I do?", "en", None, "answer"),
    ("ta-salary", "ரெண்டு மாசமா சம்பளம் வரல. என்ன பண்றது?", "ta", None, "answer"),
    # Demo script, step 4: the trick question.
    ("en-passport", "How do I get a passport?", "en", None, "not_sure"),
    ("ta-passport", "பாஸ்போர்ட் எப்படி வாங்குறது?", "ta", None, "not_sure"),
    # The other sample chips on the Ask page.
    ("en-farmer", "I'm a farmer with 2 acres. What can I get?", "en", None, "answer"),
    ("ta-farmer", "எனக்கு 2 ஏக்கர் நிலம் இருக்கு. என்ன கிடைக்கும்?", "ta", None, "answer"),
    ("en-census", "When can I fill my own census details?", "en", None, "answer"),
    ("ta-census", "சென்சஸ் விவரத்த நானே எப்போ நிரப்பலாம்?", "ta", None, "answer"),
]


def post(path, body, raw=False):
    req = urllib.request.Request(BASE + path, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = r.read()
    return data if raw else json.loads(data)


def spoken(res):
    """Same text the page reads aloud (AskPage.tsx: spoken())."""
    return " ".join([*res["lines"], *([res["followUp"]] if res.get("followUp") else [])])


def main():
    audio_dir = ROOT / "public" / "demo-audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    made, by_key, problems = [], {}, []
    out_path = ROOT / "data" / "demo-answers.json"
    old = {a.get("key"): a for a in json.loads(out_path.read_text()).get("answers", [])} if out_path.exists() else {}

    for key, question, lang, prev_key, expect in SCRIPT:
        prev = by_key.get(prev_key) if prev_key else None
        if ONLY is not None and key not in ONLY and key in old:
            by_key[key] = old[key]
            made.append(old[key])
            continue
        history = [{"role": "user", "text": prev["question"]}, {"role": "sollu", "text": spoken(prev["response"])}] if prev else []
        for attempt in range(3):
            try:
                res = post("/api/ask", {"question": question, "lang": lang, "history": history, "fresh": True})
                break
            except Exception as e:  # busy free tier: wait and retry
                print(f"  {key}: {e}, retrying in 20s")
                time.sleep(20)
        else:
            problems.append(f"{key}: no answer")
            continue

        if res.get("kind") != expect:
            problems.append(f"{key}: expected {expect}, got {res.get('kind')}")
        if res.get("fallback"):
            problems.append(f"{key}: AI answer failed the checks (plain facts shown); run again")
            continue

        name = hashlib.sha1(f"{key}|{question}".encode()).hexdigest()[:10] + ".mp3"
        (audio_dir / name).write_bytes(post("/api/tts", {"text": spoken(res), "lang": "en" if res.get("fallback") else res["lang"]}, raw=True))
        res["audioUrl"] = f"/demo-audio/{name}"

        item = {"key": key, "prev": prev["question"] if prev else "", "question": question, "response": res}
        by_key[key] = item
        made.append(item)

        print(f"\n[{key}] {question}")
        for line in res["lines"]:
            print(f"   > {line}")
        if res.get("followUp"):
            print(f"   ? {res['followUp']}")
        print(f"   items: {[(i['id'], i.get('verdict')) for i in res['items']]}")
        time.sleep(3)  # stay under the free tier's requests per minute

    out = {
        "note": "Saved answers for the demo script and sample questions. Made by data/tools/demo_answers.py "
                "from the live pipeline. Do not edit by hand; run the script again.",
        "made_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "answers": made,
    }
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"\nSaved {len(made)} answers.")
    if problems:
        print("PROBLEMS:\n  " + "\n  ".join(problems))
        sys.exit(1)


if __name__ == "__main__":
    main()
