# Where Sollu's answers come from

Sollu's goal: make public information easy to find, government services easy to use, and laws easy to understand, no matter how comfortable someone is with technology. Voice comes first. Text is the fallback when voice doesn't work.

That only works if every answer comes from an official source. This page lists the official sources we found for Tamil Nadu (researched 17 Nov 2026), what each one gives us, and how we can get the data out.

**Short answer:** there is **no single official API** that gives every Tamil Nadu scheme with its eligibility rules. The closest is **myScheme** (central government). Everything else is spread across portals and PDFs. So Sollu needs its own **source library**: we collect from the sources below, a person checks each entry, and the AI only answers from that checked library.

---

## 1. Schemes: what can I get?

| Source | What it has | How to get the data | Notes |
|---|---|---|---|
| **[myScheme](https://www.myscheme.gov.in/about)** (Government of India, NeGD) | Central and state schemes, with eligibility questions. Has a Tamil interface. | Website. No public API confirmed. Listed as a partner on API Setu. | Best starting point for eligibility. Ask the myScheme team about data access (contact listed on [apisetu.gov.in/contact](https://apisetu.gov.in/contact)). Scheme counts differ by source, so don't quote a number. |
| **[TN State DBT portal](https://dbt.tn.gov.in/statedbtportal/scheme/schemelist)** | Tamil Nadu schemes that pay money straight to bank accounts, by department. | Web page list. | Good official list of money-giving schemes. Doesn't give full eligibility rules. |
| **[TN Finance Department publications](https://financedept.tn.gov.in/en/my-documents/2020/07/2022-2023_p65.pdf)** | Yearly statement of welfare schemes in the state budget. | PDF, one per year. | Most complete yearly list. Needs PDF extraction. |
| **Department scheme pages** (for example [BC, MBC and Minorities Welfare](https://bcmbcmw.tn.gov.in/welfschemes.htm)) | Scheme details, who can apply, papers needed. | Web pages and PDFs, different on every site. | Detailed but scattered. One scraper per department. |
| **[tn.gov.in](https://www.tn.gov.in/faq.php)** state portal | Schemes listed with "how to apply" and "documents required". | Web pages. | Official front door. Check pages are current before using. |

## 2. Rules and laws: what does the rule say?

| Source | What it has | How to get the data | Notes |
|---|---|---|---|
| **[Tamil Nadu Gazette](https://stationeryprinting.tn.gov.in/gazette.php)** (Stationery and Printing Dept.) | The legal record. G.O.s, notifications and Acts, weekly and extraordinary issues. | PDFs in a year/issue folder layout. | The final word on what a rule says. Many PDFs are scans, so they need OCR. |
| **Department G.O. lists** (for example [tn.gov.in RTI G.O. pages](https://tn.gov.in/rti/GO_Public.htm), [TNPSC](https://tnpsc.gov.in/English/cd-gos.html), [TNPCB](https://tnpcb.gov.in/tamil/publicGOs.php)) | Government Orders by department, with number, date and subject. | Static web pages and PDFs. | No central search for G.O.s was found. Some lists are old or incomplete. |
| **[india.gov.in, department-wise TN G.O.s](https://www.india.gov.in/department-wise-tamil-nadu-government-orders?page=2)** | Links to G.O.s, grouped by department. | Directory pages. | A useful map of where each department keeps its G.O.s. |
| **[India Code](https://www.indiacode.nic.in/bitstream/123456789/20529/1/act_no._17_of_2021_tamilnadu.pdf)** | Central Acts and many Tamil Nadu state Acts. | PDFs, with a browse-by-state page. | The PDFs warn that later amendments may be missing. Check against the Gazette. |

## 3. Services: where do I go, and what do I bring?

| Source | What it has | How to get the data | Notes |
|---|---|---|---|
| **[TNeGA / e-Sevai](https://tnega.tn.gov.in/home)** | The list of services at e-Sevai centres, plus application tracking. Helpline 1800 425 6000. | Web list. | A 2026 news report says 275 services across 38 departments at about 25,000 centres, with "e-Sevai 2.0" planned ([DT Next](https://www.dtnext.in/news/tamilnadu/tamil-nadu-ai-enabled-e-sevai-20-to-bring-1000-services-under-one-platform)). Check the official list before quoting numbers. |
| **[TN Open Data portal](https://tn.data.gov.in/about)** | Datasets from TN departments, for example [Common Service Centres in Tamil Nadu](https://tn.data.gov.in/resource/common-service-centers-csc-tamil-nadu). | Downloads. Some datasets have an API, some don't. | Covered by the Government Open Data License – India (GODL): reuse is allowed with credit. Check the license on each dataset. |
| **Citizen's Charters** ([india.gov.in listing](https://www.india.gov.in/citizens-charters-tamil-nadu-government-departments?page=2), [Rural Development](https://tnrd.tn.gov.in/policynotes/RDPR%20-%20CITIZEN%20CHARTER%202020%20-%20ENGLISH.pdf)) | What each department promises to do, and how fast. | PDFs. | Good for "how long should this take?" and "who do I complain to?". Check which year is current. |

## 4. Rights and free legal help

| Source | What it has | How to get the data | Notes |
|---|---|---|---|
| **[Tamil Nadu State Legal Services Authority](https://tamilnadu.nalsa.gov.in/?p=721)** | Free legal aid. District authorities (DLSA) sit in every district court complex. Taluk committees too. | Web pages. | Sollu's "get free help" hand-off. A news report says some legal aid clinics may not be working ([Citizen Matters](https://citizenmatters.in/free-legal-aid-chennai-dlsa-tnslsa-justice-women-children/)), so confirm each district office. |
| **RTI manuals by department** (via [india.gov.in](https://www.india.gov.in/manual-under-rti-act-revenue-department?page=18)) | What each department does, its officers and its records. | PDFs. | Helps answer "who handles this?". |

## 5. Voice: Tamil speech in and out

| Option | What it does | Cost and license | Notes |
|---|---|---|---|
| **Bhashini** (Government of India) | Speech-to-text, translation and text-to-speech for Indian languages, including Tamil. | Reported free for developers after signing up at bhashini.gov.in. Official terms not checked yet. | First choice for a public-good project. Check the limits before building on it. |
| **[AI4Bharat IndicConformer](https://github.com/AI4Bharat/IndicConformerASR)** | Open-source speech recognition for 22 Indian languages, including Tamil. | MIT license ([Hugging Face](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)). You must share contact info to download. | We can host it ourselves, so voice keeps working if a paid API changes. |
| **Browser speech (Web Speech API)** | What the landing page uses today. | Free. | Tamil voices depend on the phone. Good fallback, not a main engine. |
| **Paid APIs** (for example Sarvam) | Indian-language speech-to-text and text-to-speech. | Paid per minute ([price guide](https://echai.ventures/how-founders-use-ai/indian-languages/i-want-to-build-an-app-for-indian-language-users-what-do-speech-and-language-apis-cost)). | Backup if quality matters more than cost. |

## 6. Developer access: API Setu

**[API Setu](https://docs.apisetu.gov.in/document-central/explore-apisetu/)** is the government's API marketplace (run by MeitY). It has a sandbox. To use the live APIs, developers sign up on the partner portal with ID proof and an **authority letter** ([SOP](https://cdn.apisetu.gov.in/portal/assets/sop-apisetu-v0.pdf)). That probably means Sollu needs an organisation, such as a registered startup, NGO or college, before it can get keys. Some APIs on it may help later (for example, document checks), but none confirmed for scheme eligibility.

## Not official: don't use as a source

Sites like citizennest, sarkariyojana, schemesinindia, policybazaar and indiankanoon collect scheme and law info. They can help us find things, but Sollu never quotes them. Every answer must point to the official page or G.O.

---

## How Sollu should use these

1. **Collect.** Pull scheme pages, G.O.s and Gazette PDFs into one store. Keep the original file, its link and the date we fetched it.
2. **Read.** Turn PDFs (many are scans) into text. Tamil OCR is needed for Tamil G.O.s.
3. **Check.** A person checks each scheme entry: who can get it, what you get, papers needed, where to apply. Mark it with "last checked" and who checked it.
4. **Answer.** The AI answers only from checked entries, in 3 short lines, with the source link and date. If nothing matches, it says "I'm not sure" and points to e-Sevai or legal aid.
5. **Watch.** Check the Gazette and department G.O. pages every week for changes. Re-check the entries a new G.O. touches.

## Open questions

- Will myScheme share its data or an API with a public-good project? Ask the myScheme team.
- Bhashini: confirm the current free limits, Tamil speech quality and terms.
- Do the department sites allow automated collecting? Read each site's terms. Prefer downloads, open data and official APIs over scraping.
- Do we need an organisation to sign up for API Setu?
- Tamil OCR quality on old scanned Gazette PDFs: test on a sample.
