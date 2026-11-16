# Sollu — product flow and website copy

> **Sollu** (சொல்லு, "say it / tell me") is a working name. Swap it any time; the copy is written so the name only appears in the logo, buttons and footer wordmark.

An AI helper that reads government notices, welfare schemes and local laws, then explains them in plain Tamil or English. People can ask by voice, check if they qualify for a scheme, and learn their rights.

- **v1 (now):** Tamil Nadu. 38 districts. Tamil + English. Voice in, voice and text out.
- **v2 (next):** All of India. 22 scheduled languages. State-by-state scheme packs.

---

## 1. Designer brief (client-to-designer)

### The problem in one line
The rules that decide what people get from the government are written in a language most people do not read: long PDFs, legal English, formal Tamil, G.O. numbers.

### Who we design for
| Person | What they need | What stops them today |
|---|---|---|
| Senior citizen (60+) | Pension, health cover | Can't read small print; forms are long |
| Farmer | Crop insurance, input subsidies, loan waivers | Notices arrive as PDFs in formal Tamil |
| Student (and parent) | Scholarships, girl-student schemes | Doesn't know which schemes exist |
| Daily-wage / gig worker | Labour board welfare, ration, rights at work | No time, low data, low literacy |
| Woman head of household | Monthly entitlements, housing, safety rights | Has to depend on a middleman |
| Helper (NGO, e-Sevai operator, ward volunteer) | Explain fast to many people | Has to read every G.O. themselves |

### Design principles
1. **Voice first, text always.** Every answer can be heard and read. The mic is the biggest button.
2. **Three lines first.** Every answer starts with a 3-line summary. Details fold open below.
3. **Show the source.** Every answer names the document it came from and the date we last checked it.
4. **Say "I'm not sure".** When the AI is unsure, it says so and sends people to a real office.
5. **No middlemen, no fees.** Free to ask. No sign-in needed to ask.
6. **Low data, low phone.** Works on a ₹7,000 Android phone on 3G.

### Word rules (how we choose verbs)
We use one plain verb per action and never swap it. A person should learn the word once.

| Use | Means | Never use |
|---|---|---|
| **Ask** | Start a question (voice or text) | Query, chat, prompt, search |
| **Check** | See if you qualify | Verify, evaluate, assess, determine |
| **Explain** | Turn a notice into plain words | Simplify, decode, summarise, parse |
| **Hear** | Play the answer aloud | Listen to, audio, playback |
| **Know** | Learn a right | Understand, discover, explore |
| **Save** | Keep an answer for later | Bookmark, store, pin |
| **Share** | Send to family on WhatsApp | Forward, export |
| **Find** | Locate the office or form | Locate, navigate |

Banned words on every page: *empower, leverage, unlock, seamless, revolutionise, cutting-edge, AI-powered* (as a headline). Say what it does instead.

Tone: short sentences, third-grade reading level, second person ("you"), no exclamation marks, numbers as digits.

---

## 2. Sitemap

```
Home (landing)
├── Ask               the assistant (voice + text)         /ask
├── Schemes           browse + eligibility check           /schemes
│   └── Scheme page   one scheme, explained               /schemes/:slug
├── Notices           paste, upload or photo a notice     /notices
├── Rights            plain-language rights library       /rights
│   └── Right page    one topic (tenant, wages, RTI…)     /rights/:slug
├── Saved             saved answers (no sign-in, on phone) /saved
├── How it works      sources, accuracy, privacy          /how-it-works
├── For helpers       NGOs, e-Sevai, ward volunteers      /helpers
├── Languages         what's live, what's next            /languages
└── Help              FAQ, contact, report a wrong answer /help
```

Global nav (desktop): Schemes · Notices · Rights · How it works · தமிழ்/EN · **Ask Sollu**
Global nav (phone): Logo · language toggle · big mic button. Bottom tab bar: **Ask · Schemes · Notices · Rights · Saved**.

---

## 3. Core user flows

### Flow A — "Do I get this?" (eligibility, the money flow)
1. Lands on Home → taps **Check a scheme**.
2. Answers 5 one-tap questions: age, district, who lives at home, monthly income band, work type. (Voice or tap. Skip any.)
3. Sees **"You may fit 6 schemes"** — sorted by money and how sure we are.
4. Opens one → 3-line summary · "What you get" · "Who can get it" (✓ / ✗ / ? against their answers) · "Papers you need" · "Where to apply".
5. Taps **Hear** (voice), **Save**, or **Share on WhatsApp**.
6. Taps **Find the office** → nearest e-Sevai centre / taluk office.

### Flow B — "What does this notice mean?" (explain flow)
1. Taps **Explain a notice**.
2. Takes a photo, uploads a PDF, or pastes text.
3. Gets: **What it says** (3 lines) · **What you must do** (with dates) · **What happens if you don't** · **Source + date**.
4. Asks a follow-up by voice: "What if I miss the date?"

### Flow C — "Is this allowed?" (rights flow)
1. Asks by voice: "My owner wants me out in 3 days. Can he?"
2. Gets the plain rule, the law it comes from, and **what you can do today** (steps).
3. If it's serious or unclear → **Get free legal help** (District Legal Services Authority hand-off).

### Flow D — First visit on a phone
Language pick (தமிழ் / English, big buttons, remembered) → one-screen "Tap and speak" demo → Ask screen. No sign-in, no forms.

### Flow E — Trust check
Any answer → **Where is this from?** → source card: document name, G.O./Act number, issuing department, date published, date we last checked, link to the original.

---

## 4. Landing page — section order and why

Pattern taken from the two references: big numbers up top, a headline with icons inside the letters, a tilted sticker, a bento of 3 live demos, a feature grid with coloured icon chips, an accuracy card with a tilted pill, a role switcher, a fanned card stack, then a blue-fade footer with a giant white wordmark.

| # | Section | Job on the page | Reference move |
|---|---|---|---|
| 0 | Nav | Get to Ask in one tap | Clean top bar, dark CTA |
| 1 | Hero | Say what it is in 4 words, prove it's for TN | Big stats + icons-in-letters headline + tilted "Hear it" sticker |
| 2 | Three things it does | Show the product working | Bento with 3 live mini-demos |
| 3 | Feature grid | List the 6 jobs, one verb each | Inline chip in headline ("3 lines") + coloured icon grid |
| 4 | Trust / sources | Answer "can I trust an AI?" | Accuracy card + tilted "Source shown" pill |
| 5 | Made for every person | Let each persona see themselves | Role tabs + accordion card |
| 6 | Questions people ask | Show range, without fake testimonials | Fanned card stack |
| 7 | Roadmap | Tamil Nadu now, India next | Simple two-step timeline |
| 8 | FAQ | Remove last doubts | Accordion |
| 9 | Final CTA + footer | One last push, then a playful sign-off | "Ready to…?" + copy chip + blue fade wordmark |

> **No invented proof.** We have no users yet, so there are no testimonials, user counts or ratings. The fanned cards show *sample questions*, labelled as samples. Add real quotes after the pilot.

---

## 5. Page-by-page copy

### 5.0 Nav
`Schemes` `Notices` `Rights` `How it works` · `தமிழ் / EN` · **[Ask Sollu]**

### 5.1 Home — Hero
- Pill: **Now in Tamil Nadu. All of India next.**
- Stats: **38** districts · **2** languages at launch
- H1: **Know what's yours.** *In your own words.*
- Sub: Sollu reads government schemes, notices and local laws for you. Then it explains them in plain Tamil or English. Ask by voice. Check what you can get. Know your rights.
- CTA 1: **Ask Sollu — free** · CTA 2: **Check a scheme**
- Micro-line: No sign-in. No fees. Works on any phone.
- Sticker: **Hear it ▶**

### 5.2 Home — "Everything you need…"
- Label: What Sollu does
- H2: **Government rules, said simply — by you, for you.**
- Card 1 **Check.** Answer 5 questions. See every scheme you may fit.
- Card 2 **Explain.** Snap a notice. Get it in 3 lines.
- Card 3 **Ask.** Speak in Tamil. Hear the answer back.

### 5.3 Home — Feature grid
- H2: **Read [3 lines] instead of 30 pages.**
- **Ask by voice.** Speak in Tamil or English. Sollu understands everyday words, not just official ones.
- **Explain a notice.** Photo, PDF or text. Get what it says, what you must do, and by when.
- **Check eligibility.** See which schemes you may fit, and why, before you stand in a queue.
- **Know your rights.** Rent, wages, ration, RTI, police complaints. Plain rules, real steps.
- **Get the papers list.** Know every document you need before you leave home.
- **Find the office.** Nearest e-Sevai centre, taluk office or legal aid desk.

### 5.4 Home — Trust
- Label: Sources
- H2: **Every answer shows where it came from.**
- Body: Sollu only answers from official sources: government orders, gazettes, scheme guidelines and Acts. Each answer names the document and the date we last checked it. When Sollu isn't sure, it says so, and sends you to a real person.
- Sticker: **Source shown**
- Form: **Get alerts when a new scheme fits you.** [phone number] [Get alerts] — fine print: We only send scheme alerts. Stop any time by replying STOP.

### 5.5 Home — Made for every person
- H2: **Made for every person.**
- Tabs: Seniors · Farmers · Students · Workers · Women
- Each tab: a sample question in Tamil + English, and the 3 things Sollu would tell them.

### 5.6 Home — Questions people ask
- H2: **See what [Tamil Nadu] asks.** (chip = state name; becomes your state in v2)
- Cards (labelled *Sample questions*): "Can my mother get a pension?" · "My salary is late by 2 months. What can I do?" · "Is this land notice about my plot?" · "Which scholarships fit a first-year B.Sc student?" · "Can the shop refuse my ration?"

### 5.7 Home — Roadmap
- H2: **Tamil Nadu first. All of India next.**
- **Now — Tamil Nadu.** 38 districts. Tamil and English. State and central schemes that apply in TN.
- **Next — India.** 22 languages. Every state's schemes, one state at a time.

### 5.8 Home — FAQ
- **Is Sollu free?** Yes. Asking is free and always will be.
- **Is this legal advice?** No. Sollu explains rules in plain words. For a legal case, it connects you to free legal aid.
- **Do I need to sign in?** No. Your saved answers stay on your phone.
- **What happens to my voice?** It's turned into text to answer you, then deleted. We never sell your data.
- **What if Sollu is wrong?** Tap "Report a wrong answer". A person checks it, and we fix the source.
- **Will it work on my phone?** Yes. It's built for low-cost Android phones and slow networks.

### 5.9 Home — Final CTA + footer
- H2: **Ready to know what's yours?**
- CTA: **Ask Sollu →** · Copy chip: `"Can I get a pension at 60?"` (copies a starter question)
- Footer left: **Ask it. Know it.** 
- Columns — **Product:** Ask · Schemes · Notices · Rights · Saved · **Learn:** How it works · Sources · Languages · Roadmap · **Help:** For helpers · Report a wrong answer · Contact · FAQ · **Legal:** Privacy · Terms · Not legal advice
- Wordmark: giant white **Sollu** on blue fade, with stickers.

### 5.10 Ask (`/ask`)
- Empty state H1: **What do you want to know?**
- Sub: Tap the mic and speak, or type. Tamil or English.
- Big button: **Tap and speak** (hold-to-talk on phone)
- Starter chips: Check a scheme · Explain a notice · My rights at work · Pension for my parents
- Answer layout: **In short** (3 lines) → **What you get** → **Who can get it** → **Papers you need** → **Where to go** → source card. Actions: **Hear · Save · Share · Report**.
- Unsure state: **I'm not sure about this one.** Here's who can tell you for certain: [office + phone].

### 5.11 Schemes (`/schemes`)
- H1: **Check what you can get.**
- Sub: Answer 5 quick questions. We'll show every scheme you may fit.
- Steps: How old are you? · Which district? · Who lives with you? · Monthly family income? · What work do you do?
- Result H2: **You may fit 6 schemes.** Sub: Sorted by what you get. "May fit" means check the papers list before you apply.
- Filters: Money · Health · Education · Housing · Farming · Work · Women · Seniors
- Scheme card: name (Tamil + English) · one-line "what you get" · fit badge (**Good fit / Check one thing / Not likely**) · **Open**

### 5.12 Scheme page (`/schemes/:slug`)
- H1: scheme name · sub: one-line what you get
- Sections: **In short · What you get · Who can get it** (✓/✗/? vs your answers) **· Papers you need · How to apply · Where to apply · Last checked [date] · Source**
- Actions: **Hear · Save · Share · Find the office**

### 5.13 Notices (`/notices`)
- H1: **Explain a notice.**
- Sub: Got a letter, circular or G.O.? Snap it or paste it. We'll tell you what it means for you.
- Inputs: **Take a photo · Upload a file · Paste text**
- Result: **What it says · What you must do · By when · If you don't · Source**
- Privacy line: Your file is used to answer you, then deleted.

### 5.14 Rights (`/rights`)
- H1: **Know your rights.**
- Sub: Plain rules for everyday problems. Each one ends with what you can do today.
- Topics: Rent & housing · Wages & work · Ration & food · Police & complaints · RTI (ask the government) · Consumer problems · Women's safety · Land & property
- Right page sections: **The rule · Where it comes from · What you can do today · Get free help**

### 5.15 How it works (`/how-it-works`)
- H1: **How Sollu gets its answers.**
- 1 **We read the source.** Government orders, gazettes, scheme rules and Acts — only official ones.
- 2 **We write it plainly.** Every answer starts with 3 short lines.
- 3 **We show our work.** The document, the date, a link to the original.
- 4 **We check again.** Sources are re-checked on a schedule and when a new G.O. comes out.
- Privacy block H2: **Your questions stay yours.** No sign-in. Voice deleted after answering. Nothing sold.

### 5.16 For helpers (`/helpers`)
- H1: **Help more people in less time.**
- Sub: For NGOs, e-Sevai operators, ward volunteers and SHG leaders.
- Points: **Explain in seconds.** · **Print a 1-page summary.** · **Share in the family's language.**
- CTA: **Partner with us**

### 5.17 Languages (`/languages`)
- H1: **Your language, not the office's.**
- Live: Tamil, English. Next: Hindi, Telugu, Kannada, Malayalam… (all 22)
- CTA: **Ask for your language**

### 5.18 Help (`/help`)
- H1: **How can we help?**
- **Report a wrong answer** · **Contact us** · FAQ

---

## 6. Open items before launch
- Confirm scheme names, amounts and rules with the source G.O.s before showing any on the live site. The landing page uses scheme *names only*, inside clearly marked sample UI.
- Confirm the legal-aid hand-off details (DLSA contact per district).
- Replace sample questions with real ones (with consent) after the pilot.
- Decide the final product name and check the domain/trademark.
