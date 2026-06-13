# CaseHire / КейсПодбор

> A B2B2C platform that grades junior developers on **how they work with AI**, not on what they produce. Sandboxed IDE, two chat channels (a trusted AI buddy and an "external" LLM), full observation of every keystroke. The same infrastructure will eventually evaluate AI agents on the same axes.

---

## 1. The thesis

Output is no longer a signal. **97% of developers use AI assistants** ([HackerRank 2025 Developer Skills Report](https://www.hackerrank.com/reports/developer-skills-report-2025)); in a controlled experiment, **0 of 32 interviewers detected ChatGPT-assisted cheating** ([interviewing.io](https://interviewing.io/blog/how-hard-is-it-to-cheat-with-chatgpt-in-technical-interviews)). LeetCode-style screening is structurally dead. What every hiring manager actually needs to know about a junior in 2026 is invisible to current tools: **does this person think before prompting, verify before pasting, and treat sensitive context as sensitive?** That's what CaseHire measures.

This is not "AI hiring assistance for recruiters." It is **AI-fluency assessment of candidates**, and the same infrastructure becomes an agent-evaluation platform in the v3 timeframe.

---

## 2. Why now — and why nobody could have built this in 2023

Three structural shifts happened in 24 months:

**Output became cheap.** Stack Overflow 2024 Survey: 76% of developers use AI tools, **only 43% trust the accuracy** of what the AI returns ([survey.stackoverflow.co](https://survey.stackoverflow.co/2024/ai)). The Google DORA 2024 report — primary research on 39,000+ professionals — found that AI tooling **correlates with worse software delivery performance** (lower stability, lower throughput) for the second year running ([dora.dev](https://dora.dev/research/2024/dora-report/)). METR's July 2025 RCT on 16 experienced open-source maintainers found AI made them **19% slower**, while developers still believed they'd been 20% faster ([metr.org](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [arXiv 2507.09089](https://arxiv.org/abs/2507.09089)). The mismatch between perception and performance is precisely what an evaluation product needs to surface.

**Junior hiring shrank, and the survivors must be elite.** SignalFire's 2025 State of Talent: new grads are **7% of Big Tech hires, down 25% YoY and >50% since 2019**; new-grad unemployment up 30% since Sept 2022 ([signalfire.com](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025)). IEEE Spectrum: entry-level postings down ~60% from 2022 ([spectrum.ieee.org](https://spectrum.ieee.org/ai-effect-entry-level-jobs)). The juniors who do get hired are now expected to be productive in week one — using AI tools — and managers have no way to test for that capability.

**AI fluency became a job requirement, on the record.** Shopify CEO Tobi Lütke (Apr 2025) made AI competency a **performance-review criterion** and required managers to prove AI can't do a job before hiring ([CNBC](https://www.cnbc.com/2025/04/07/shopify-ceo-prove-ai-cant-do-jobs-before-asking-for-more-headcount.html)). Coinbase CEO Brian Armstrong fired engineers who didn't adopt AI tools within a week (Aug 2025) and now reports **33% AI-written code, targeting 50% by Q3 2025** ([TechCrunch](https://techcrunch.com/2025/08/22/coinbase-ceo-explains-why-he-fired-engineers-who-didnt-try-ai-immediately/)). These aren't fringe positions — they're the floor.

**Sensitive-data leakage became a board-level risk.** Samsung Semiconductor engineers pasted internal source code and an internal meeting transcript into ChatGPT in three separate incidents over **20 days in April 2023** ([Bloomberg](https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak)). Samsung company-wide banned generative AI; Apple, JPMorgan, Goldman Sachs, Citi, and Verizon followed ([Fortune](https://fortune.com/2023/05/19/chatgpt-banned-workplace-apple-goldman-risk-privacy/)). Cyberhaven's telemetry across 1.6M workers found **11% of all content pasted into ChatGPT is sensitive/internal** ([cyberhaven.com](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)). Nobody is testing whether a junior dev candidate has the OPSEC reflex to NOT do this. That's a $0 problem with multi-million-dollar consequences.

---

## 3. What CaseHire actually is

A candidate clicks a link from a job application. ~30 seconds later they're in a web-based sandboxed IDE — synthetic codebase, live database with seed data, mock external services, working test runner — and **two chat panels**:

- **AI Buddy** — context-aware, knows the codebase, the team's conventions, and the business. Trusted insider channel.
- **External LLM** — generic, no context. Framed as "public LLM in another tab" with a visible warning banner. Untrusted channel.

The candidate has 20-40 minutes to do a real-shaped task. We log every prompt to both chats, every file read, every command run, every test executed, every edit. **We score the candidate on a nine-dimensional process matrix** (context literacy, planning, prompt specificity, AI calibration, safety judgment, verification, recovery, articulation, OPSEC) — not on whether the task compiles.

The hiring manager sees a ranked feed: ProcessScore + a scrubbable session replay + auto-extracted watch-items ("pasted file containing API_KEY into External LLM at 14:32"). They make the interview decision with evidence, not guesses.

---

## 4. The signature differentiator: the OPSEC honeypot

This is the one feature no competitor offers and the one feature that sells itself to regulated industries.

The AI Buddy is **instrumented to share "sensitive" artifacts as part of normal task flow** — files marked `// PII — internal use only`, snippets with `API_KEY = sk_test_…`, schema sections tagged "tier-4 sensitive." These are honeypots embedded in real work. We then watch the External LLM channel — which we host but UI-present as third-party — for fingerprints of those artifacts (text match + embedding similarity for paraphrased leaks).

The output is a measured **leak-rate per candidate**: raw paste vs. paraphrased vs. clean. This is the test that 11% of every workforce currently fails ([Cyberhaven](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)) and that no hiring funnel surfaces. For fintech, healthcare, defense-adjacent, and any company with an existing AI usage policy, this is a procurement-driving feature.

---

## 5. Who buys this — and what specifically they're buying

**Primary buyer:** Engineering managers and HR-leads at companies hiring **10-50 junior/intern developers per year** in **AI-active stacks**.

**Buyer profile (sharper):**
- Mid-size or larger tech-adjacent company (50-500 eng headcount, or a large company's tech-hiring unit).
- Already deploys AI dev tools (Cursor/Copilot/Claude Code).
- Has been burned by a recent junior who looked good on a screen but couldn't function with AI in week two — OR has an existing AI data-handling policy that a candidate could violate.
- Hiring volume justifies per-case spend (one bad junior hire at SHRM's 100-150% salary replacement cost ≫ a thousand CaseHire sessions).

**What they actually pay for:** Not "better hiring," which every tool claims. Specifically:
1. **Confidence to hire a junior in the AI era** — a session replay + process score they can defend to their VP of Eng.
2. **A negative test for OPSEC failure** — explicit defense against the next Samsung-style leak from a new hire.
3. **Time-to-shortlist compression** — current tech time-to-hire is **30-45 days** ([HR Dive](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)); we compress the screening portion from days of phone screens + take-home reviews to a 30-minute auto-graded session.

**Buyer JTBD (one sentence):** "Tell me which of these 80 junior applicants will be productive with our AI tools in week two — and which will leak our codebase to ChatGPT."

---

## 6. Who uses this — the B2B2C reality

| User | Surface | Frequency | Pain we solve |
|---|---|---|---|
| **Candidate** (student / 0-2 yr dev) | Sandboxed web IDE + dual-chat | One session per application | "My CV is thin; let me prove I can actually work" |
| **Hiring manager** | Ranked candidate feed + session replay | Every hiring round | "I can't read 80 LeetCode submissions; show me who thinks" |
| **HR / Talent ops** | Multi-position kanban + position-task authoring | Daily, ongoing | "Give me a defensible filter that doesn't kick out the unconventional good ones" |

**Why this is B2B2C, not B2B:** Candidates are not employees of the buyer. They're individuals using the platform across multiple applications, accumulating a portable process matrix + session replay they can attach to future applications. Candidate experience metrics (completion rate, NPS, return rate) are leading indicators of buyer churn — if candidates bail mid-session, the buyer's pipeline dries up. The candidate surface gets consumer-grade UX, not a B2B form.

---

## 7. The mechanic

### 7.1 Four-layer teamlead onboarding

The platform's "no upload of your codebase" promise rests on this. Teamleads describe their *context* in tiers; the platform synthesizes the *implementation*:

| Layer | What teamlead provides | Frequency | Time |
|---|---|---|---|
| **Stack / environment** | Pick a curated template ("Python + Postgres + REST") OR write a paragraph-level architecture description. We synthesize the env. | Once per team | 30 sec to 90 min |
| **Team identity** | "How we work" doc — conventions, gotchas, banned things. Via 5-7 structured prompts OR paste an existing onboarding doc / style guide. Output: TEAM.md-shaped artifact. | Once per team | 10-15 min |
| **Business context** | What we build, for whom, KPIs. ~5-7 short answers, ~300 words. Can lift from a careers page. | Once per team | 5-7 min |
| **Position task** | One to three lines: *"the most valuable and most frequent task the junior in this role will do."* We expand into a concrete case using the other three layers. Teamlead previews & approves. | Per hiring position | 2-5 min |

Critical guarantees (these are the credibility lines on the website):
- **No codebase upload.** Ever.
- **No wiki / Atlassian dump.** Ever.
- **Generated cases require teamlead approval.**
- **Layers 1-3 amortized:** set up once, reused across every position, every season, every role family.

### 7.2 Per-position uniqueness (not per-session)

All candidates for a given position get the **same generated case**. Within-position sharing risk is small and acceptable because:
- A position sees 50-200 candidates in a 2-4 week window, not millions.
- **Process signals are not shareable** — a candidate told the case ahead still has to actually do the work, and we observe how.
- Real-shaped tasks have many valid solutions; no "one right answer" to copy.
- If a position's task leaks, teamlead refreshes with one click (new one-liner → regenerate → ship).

Cross-position comparability lives in the **process rubric** (signal definitions are constant), not in case identity. Same principle as the GRE: different sittings, calibrated dimensions.

### 7.3 The process matrix (nine dimensions)

| Dimension | What "good" looks like |
|---|---|
| Context literacy | Reads README, greps relevant files, asks Buddy to "explain X" before coding |
| Planning | First 2-3 prompts express understanding before demanding code |
| Prompt specificity | References files, states constraints, asks for trade-offs |
| AI calibration | Edits Buddy output; pushes back ("but won't this break X?") |
| Safety judgment | Pauses on dangerous commands; asks "is this safe?" before running |
| Verification | Runs tests; inspects output; reads diffs before commit |
| Recovery | Refines prompt on failure rather than panic-repeating |
| Articulation | Reasons in plain language; names trade-offs unprompted |
| **OPSEC** | **Channel discrimination; respects sensitivity markers; paraphrases instead of raw-pasting to External LLM; doesn't leak honeypot artifacts** |

Per-dimension weights are configurable per role. Backend infra weights safety + verification heavier; data analyst weights business literacy + context literacy heavier; regulated-industry roles weight OPSEC heaviest.

Skill matrix (`Domain → Skill → Subskill`, e.g. `SQL → Joins → LEFT JOIN with filter`) survives as a *secondary* axis for filtering ("show me candidates who touched Postgres"), but it's not the headline grade. The headline is ProcessScore + session replay.

---

## 8. The market

### 8.1 Russian HR Tech — primary number

The Russian HR Tech market reached **99.3B rubles in 2024, up 38% YoY** (Smart Ranking, primary RU analyst, [smartranking.ru](https://smartranking.ru/ru/analytics/hrtech/hrtech-rynok-v-rossii-vyros-na-38/)). Within that:
- Recruitment: ~50B₽ (HH.ru alone = 36.1B₽)
- Assessment/development: **3.85B₽, +38% YoY** — this is our SAM
- KEDO / HR doc-management: 1.9B₽
- Comprehensive HR: 7.7B₽

Forbes Russia confirmed Smart Ranking's ~100B₽ forecast for 2024 ([forbes.ru](https://www.forbes.ru/tekhnologii/528584-kadry-menaut-sotnu-ob-em-rynka-hr-tech-v-2024-godu-dostignet-100-mlrd-rublej)). H1 2025: 40.6B₽, +12% YoY — growth decelerating but still expanding ([smartranking.ru H1 2025](https://smartranking.ru/ru/analytics/hrtech/v-i-polugodii-2025-goda-rynok-hrtech-vyros-na-12-do-406-mlrd-rublej-odnako-tempy-rosta-ostayutsya/)). **43% of Russian companies already use AI in HR processes; 27% are testing for 2026 rollout** ([Izvestia](https://en.iz.ru/en/1863778/2025-04-02/russian-companies-have-started-using-ai-employee-recruitment)).

### 8.2 Global frame (for the vision slide)

- Global HR Tech: USD 40-42B (2024), **8-10% CAGR** ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/hr-tech-market)).
- AI-in-recruiting (narrow segment): USD 620-680M (2024), 7-8% CAGR, three sources triangulating tightly ([Straits](https://straitsresearch.com/report/ai-recruitment-market), [SkyQuest](https://www.skyquestt.com/report/ai-recruitment-market)).
- Talent assessment / pre-employment: USD 1.3-3.7B depending on definition (wide variance flagged honestly).

### 8.3 Pain quantification

- **Cost-per-hire (SHRM 2025 Benchmark, tier-1 source):** USD 5,475 average non-executive ([shrm.org](https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat)).
- **Bad-hire replacement cost (SHRM):** 50-200% of annual salary; mid-level tech/managerial 100-150% ([shrm.org](https://www.shrm.org/topics-tools/news/employee-relations/cost-bad-hire-can-astronomical)).
- **Tech time-to-hire:** 30-45 days; junior ~15-25 ([HR Dive](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)).
- **Vendor-estimated cheating rate at entry-level coding assessments:** 30-50% ([HackerEarth](https://www.hackerearth.com/blog/different-ways-candidates-cheat-in-online-technical-assessments)).

### 8.4 Wedge sizing (CaseHire-specific, conservative)

- **Beachhead:** Russian companies running stage/intern/junior tech-role programs at 10-50 hires/year. Estimated 400-800 such organizations, average potential ACV 400-900k₽/year → **160-720M₽ beachhead ARR ceiling**.
- **24-month SOM target:** 20-35M₽ ARR — 50-80 paying companies, weighted toward the 250-500k₽/yr tier. Same SOM cited in earlier ДЗ2 work; per-session unit economics (Section 11) confirm this is conservative.

---

## 9. The honest competitive landscape

**Bottom line:** "Test process, not output" is no longer empty space. Five serious players sit on or adjacent to this positioning. CaseHire's defensible corner is narrower than "process eval" — it's **OPSEC + junior-tier focus + async-automated + per-position-generated + RU on-prem**.

### 9.1 The actual threats (process-eval territory)

**HackerRank** — incumbent (~$1B+ valuation, used by Fortune 500). Their **"AI-Assisted IDE"** captures all candidate-AI interactions in a dedicated **"AI Collaboration" rubric weighted at 20%**, flagging "accepting suggestions without understanding" ([HackerRank 2025 guide](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)). Pricing: Starter $165/mo, Pro $375/mo. **Gap they leave us:** library-question model (not per-position generated); built for big-co mid/senior; **no OPSEC/leak-channel concept**; no RU on-prem.

**Codility** — Cody, a literal AI assistant inside their assessments, whose full transcript is reviewable by hiring teams ([codility.com](https://www.codility.com/blog/codility-debuts-assessment-of-ai-assisted-engineering-skills/)). Their own blog admits Cody is "a first step" with gaps in measuring iteration loops. Pricing Starter $1,200/yr, Scale $6,000/yr. **Gap:** Bolted onto senior-oriented coding tasks; no junior-tier rubric; no OPSEC.

**CodeSignal — Cosmo** — context-aware in-assessment AI assistant, but positioned more as candidate-help than as a measured collaborator. Recent attention going into a **mobile micro-learning app** ($24.99/mo, [PR Newswire](https://www.prnewswire.com/news-releases/codesignal-launches-cosmo-a-mobile-learning-app-with-300-business--tech-courses-now-on-ios-302534007.html)) — signals possible deprioritization of the assessment-side innovation.

**CoderPad** — **"Interview AI Assist"** with full prompt-by-keystroke transparency; explicit emphasis on prompt engineering and output verification as scored dimensions. Selected by **Meta for its Oct 2025 AI-enabled coding interview pilot** ([CoderPad](https://coderpad.io/use-case/ai-enabled-hiring/), [interviewing.io coverage](https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples)). **Gap:** Still synchronous (human interviewer needed); no OPSEC; no junior rubric.

**Karat — NextGen** (launched Dec 2025, **the closest competitor**). VS-Code-style IDE, production-grade multi-file codebase, built-in AI assistant, **human Karat Interview Engineer probing live**. Rubric: Technical Communication, AI Proficiency, Productivity, Product Sense ([karat.com/nextgen](https://karat.com/nextgen/), [launch on BusinessWire](https://www.businesswire.com/news/home/20251210685922/en/Karat-Launches-NextGen-Interviews-The-First-Human-Led-AI-Enabled-Talent-Evaluation-Solution)). **Gap:** Human-in-the-loop → high per-candidate cost → won't scale to a 200-applicant junior funnel. No OPSEC channel. US/enterprise GTM; no RU presence.

### 9.2 Adjacent but not direct threats

- **TestGorilla / Coderbyte / HackerEarth / DevSkiller / iMocha** — MCQ-style "AI fluency" tests, output-grading, or proctoring-focused. Not in process-eval.
- **HireVue / Apriora (Alex)** — *AI as interviewer*, not *evaluator of candidate's AI skill*. Different category.
- **Mercor** — raised $350M at $10B valuation Oct 2025 ([TechCrunch](https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/)) but **pivoted away from candidate-assessment** to AI-training-data labor marketplace. Signals investor money is flowing into "AI-meets-labor" adjacents, but cautionary tale for pure AI-hiring plays.

### 9.3 Russian market

- **hh.ru "Virtual Recruiter"** — 1-10 AI score per application, lemmatized matching, 2-3-sentence summaries ([hh.ru kb](https://feedback.hh.ru/knowledge-base/article/9913)). **This is what every RU hiring team already sees** — we sell on top of it, with a different signal (process vs. résumé-match).
- **Skillaz, Поток (Potok), Хантфлоу** — funnel-side AI (résumé scoring, outreach automation, ATS). **None are skill-process evaluators.**
- **StartExam** — 5M+ tests/year, traditional assessment + AI proctoring + cheat detection. Acquisition / partnership candidate, not direct competitor.
- **Conclusion:** No RU competitor on the AI-collaboration-process axis. The market is large (43% AI HR adoption) and the local incumbents are funnel-automation. **Russian + on-prem is genuinely defensible.**

### 9.4 Where CaseHire wins that the actual threats don't

1. **OPSEC honeypot** — nobody else tests it. Single most defensible feature; sells itself in regulated industries.
2. **Junior tier specialization** — Karat/HackerRank/Codility skew senior/mid. We size cases, weight rubrics, and price for junior hiring volume.
3. **Async + automated** — no human interviewer needed (Karat's bottleneck). 80 candidates → 80 sessions → 80 scored cards.
4. **Per-position generated cases** — every position gets a case tied to its actual most-frequent junior task. Competitors run library questions. Cases feel like real work because they are real-shaped work.
5. **RU on-prem option** — none of the AI-process Western players have any RU presence or data-locality story.

---

## 10. The product is built around a thesis the market already validates

The most credible validation isn't us claiming the category is real. It's the incumbents publicly conceding their model is broken:

> "The challenge is not just detecting AI-assisted cheating, but determining when AI assistance should be considered legitimate."
> — *HackerRank, [Designing AI-Integrated Coding Assessments, 2025 guide](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)*

When the dominant incumbent reframes its own product around evaluating AI collaboration, the category is settled. The remaining question is **who builds the right shape of it**.

---

## 11. Unit economics

### Per-session cost
A live session = container (codebase + DB + mocks) + LLM tokens for the AI Buddy AND the auto-scoring evaluator — both on a **large context** (the synthetic codebase plus the full session history), which is the dominant cost driver — + manual review/calibration + buffer. Budgeted conservatively.

- AI Buddy LLM — large context (synthetic codebase + session history): $1.40
- Final scoring pass — strong model, large context: $1.20
- Safety / leakage layer (Haiku): $0.10
- Container / IDE: $0.20
- Logs / replay / storage: $0.20
- Backend / DB / network: $0.25
- Email / auth: $0.05
- Manual review (calibration / disputed sessions): $0.40
- Buffer (+30%, token spikes / retries): $0.70
- **All-in per completed session: ~$4.5.** Conservative reserve; the target with token-price drops and context caching is ~$2–3.

### Pricing — per-candidate consumption

We meter per *evaluated candidate*, not per seat — variable compute makes per-seat SaaS break. Three offerings:

| Offering | Target | Price |
|---|---|---|
| **Pilot** | First touch | free — first 20 candidates |
| **Candidate** | Core tier, pay-as-you-go | 1,500₽ per evaluated candidate · billed on completion |
| **Enterprise** | Custom, on-prem available | on request + local deployment |

**Value anchor:** 2-3× cheaper than an hour of a live technical interviewer ($35-60/hr).

**Gross margin: ~72%** (a single honest number, not a per-tier spread). At the 1,500₽ (~$20) candidate price against a conservative ~$4.5 COGS, the per-candidate margin holds across volume and widens toward ~80% as compute costs fall.

*Internal break-even (for Q&A):* ≈ 3,050 completed sessions/month at the $20 (~1,500₽) price covers fixed costs of ~3.2M₽/month.

**Critical:** Per-evaluated-candidate metering is non-negotiable. Per-seat SaaS pricing breaks against the variable compute cost.

### Comparison value
Cost of one bad junior hire at SHRM's 100% replacement floor on a 1.5M₽ junior salary = **1.5M₽**. At 1,500₽ per evaluated candidate, that one avoided bad hire pays for **~1,000 candidate evaluations**.

---

## 12. Risks (named honestly)

| Risk | Reality | Response |
|---|---|---|
| **Karat NextGen vertical-integrates and underprices** | Real. Karat has $248M raised and acquired Byteboard. | Async-automated + junior-tier + RU is structurally faster and cheaper per session. Don't compete on senior eng at FAANG-adjacents. |
| **Process eval gets commoditized fast** | Already happening (HackerRank, Codility, CoderPad all doing some version). | OPSEC honeypot + per-position-generated cases are not commodities. Lean on those. |
| **AI synthetic env quality is the long pole** | True — if synthetic codebases feel like CS homework, the whole pitch collapses. | Hand-craft 1-2 templates production-grade, not 15 shallow ones. Quality > breadth at v1. |
| **Per-session cost climbs with usage** | LLM tokens for Buddy compound. | Cheaper model for Buddy (Haiku-tier); higher-tier model only for scoring pass. Pre-warm pool + snapshot/restore. |
| **Regulatory: Mobley v. Workday could cascade** | Real — first major AI-hiring class-action proceeded May 2025 ([Bloomberg Law](https://news.bloomberglaw.com/litigation/workday-ai-bias-suit-to-go-forward-as-age-claim-class-action)). NYC AEDT, EU AI Act, Illinois AI Video. | Process eval is *not* automated decision — it's decision-support. Session replay = full evidence trail. Easier to defend than résumé-screening AI. |
| **Candidate framing — "surveillance" reads** | Real if mishandled. Telling a candidate "everything is logged" lands wrong. | Frame as **portfolio artifact**: candidate keeps the replay + matrix; can attach to future applications. They're building something, not being watched. |

---

## 13. The roadmap — and the punchline at the end

The same infrastructure that grades human juniors grades AI agents. **The substrate is identical.**

| Beat | Scope | What it says |
|---|---|---|
| **Now (v1)** | Pilot, 10 companies, one template (B2B SaaS backend or data analyst), one industry overlay | We're focused. We're shipping. |
| **Next** | More roles, more industries, Tier-2 generative shape match for buyers wanting deeper company-specificity | Wedge widens within hiring. |
| **Agents** | Agent evaluation mode — same env, same rubric, agent in the chair | We've stopped being an HR tool. |
| **Long-term** | The substrate for evaluating intelligence at work, whoever's doing it | We're a category. |

The agent-eval expansion isn't a stretch — it's a structural consequence of how we built v1. **Goldman Sachs is deploying "hundreds, going into thousands of Devins"** alongside its 12,000 human developers, per CTO Marco Argenti ([CNBC, Jul 2025](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html)). **Cursor reports 64% Fortune 500 adoption, 100M+ lines of enterprise code per day** ([cursor.com/enterprise](https://cursor.com/enterprise)). Procurement teams have no apples-to-apples way to evaluate which agent handles their actual work — that gap exists *right now* and grows faster than HR Tech.

The strategic discipline: **v1 stays junior hiring only.** Agent eval is the positioning frame and the closing scroll-narrative beat, not a v1 feature.

**The split-screen scene that closes the pitch:** human candidate's session on the left, Claude Code's session on the right, **same case, same process matrix filling for both.** Overlay text: *"You'll need to compare them. We're already built for it."*

That's the moment a studio judge stops thinking "another HR Tech project" and starts thinking "this team sees the next decade."

---

## 14. Source appendix

### Market & adoption
- [Smart Ranking — RU HR Tech 2024 (99.3B₽, +38%)](https://smartranking.ru/ru/analytics/hrtech/hrtech-rynok-v-rossii-vyros-na-38/)
- [Smart Ranking — H1 2025 (40.6B₽, +12%)](https://smartranking.ru/ru/analytics/hrtech/v-i-polugodii-2025-goda-rynok-hrtech-vyros-na-12-do-406-mlrd-rublej-odnako-tempy-rosta-ostayutsya/)
- [Forbes Russia — HR Tech 2024 forecast](https://www.forbes.ru/tekhnologii/528584-kadry-menaut-sotnu-ob-em-rynka-hr-tech-v-2024-godu-dostignet-100-mlrd-rublej)
- [Mordor Intelligence — Global HR Tech](https://www.mordorintelligence.com/industry-reports/hr-tech-market)
- [Straits Research — AI Recruitment](https://straitsresearch.com/report/ai-recruitment-market)
- [Izvestia — 43% RU companies use AI in HR](https://en.iz.ru/en/1863778/2025-04-02/russian-companies-have-started-using-ai-employee-recruitment)
- [SHRM 2025 Benchmarking ($5,475 cost-per-hire)](https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat)
- [SHRM — Bad hire replacement cost](https://www.shrm.org/topics-tools/news/employee-relations/cost-bad-hire-can-astronomical)
- [HR Dive — Tech time-to-hire](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)
- [SignalFire State of Talent 2025 (entry-level collapse)](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025)
- [IEEE Spectrum — AI shifts entry-level expectations](https://spectrum.ieee.org/ai-effect-entry-level-jobs)

### Productivity research
- [METR RCT — 19% slowdown (July 2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) + [arXiv](https://arxiv.org/abs/2507.09089) + [Feb 2026 update](https://metr.org/blog/2026-02-24-uplift-update/)
- [Stack Overflow 2024 Survey — AI](https://survey.stackoverflow.co/2024/ai)
- [Google DORA 2024](https://dora.dev/research/2024/dora-report/) and [DORA 2025 AI-assisted](https://dora.dev/dora-report-2025/)
- [ACM — Measuring GitHub Copilot productivity](https://cacm.acm.org/research/measuring-github-copilots-impact-on-productivity/)
- [MIT Media Lab — Your Brain on ChatGPT](https://arxiv.org/abs/2506.08872)
- [Addy Osmani — The 70% Problem](https://addyosmani.com/blog/next-two-years/)

### OPSEC / leaks
- [Bloomberg — Samsung ChatGPT ban (May 2023)](https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak)
- [Fortune — Apple/JPMorgan/Goldman/Verizon restrictions](https://fortune.com/2023/05/19/chatgpt-banned-workplace-apple-goldman-risk-privacy/)
- [Cyberhaven — 11% sensitive pastes (1.6M workers)](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)
- [Microsoft Work Trend Index 2024 — 75% BYOAI](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part)

### Hiring-criteria shift
- [CNBC — Shopify AI mandate](https://www.cnbc.com/2025/04/07/shopify-ceo-prove-ai-cant-do-jobs-before-asking-for-more-headcount.html)
- [TechCrunch — Coinbase fires non-AI engineers](https://techcrunch.com/2025/08/22/coinbase-ceo-explains-why-he-fired-engineers-who-didnt-try-ai-immediately/)
- [interviewing.io — 0/32 detection](https://interviewing.io/blog/how-hard-is-it-to-cheat-with-chatgpt-in-technical-interviews)
- [HackerRank 2025 Developer Skills Report — 97% AI use](https://www.hackerrank.com/reports/developer-skills-report-2025)
- [HackerRank 2025 guide — process eval pivot](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)
- [Vibe coding — Wikipedia entry](https://en.wikipedia.org/wiki/Vibe_coding)

### Competitive landscape
- [Codility — Cody assistant blog](https://www.codility.com/blog/codility-debuts-assessment-of-ai-assisted-engineering-skills/)
- [CoderPad — AI-enabled hiring](https://coderpad.io/use-case/ai-enabled-hiring/) + [Meta pilot coverage](https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples)
- [Karat NextGen launch (Dec 2025)](https://karat.com/nextgen/) + [BusinessWire](https://www.businesswire.com/news/home/20251210685922/en/Karat-Launches-NextGen-Interviews-The-First-Human-Led-AI-Enabled-Talent-Evaluation-Solution)
- [CodeSignal Cosmo](https://support.codesignal.com/hc/en-us/articles/16957386089879-Evaluate-test-takers-AI-skills-with-Cosmo)
- [TestGorilla AI Fluency](https://www.testgorilla.com/ai-fluency/)
- [Mercor pivot — TechCrunch](https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/)
- [hh.ru Virtual Recruiter](https://feedback.hh.ru/knowledge-base/article/9913)
- [TAdviser — RU HR-tech market](https://tadviser.com/index.php/Article:Russian_HR-tech_market)

### Agent / roadmap
- [CNBC — Goldman deploys thousands of Devins](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html)
- [Cursor Enterprise — 64% Fortune 500](https://cursor.com/enterprise)
- [Cognition — Devin / SWE-bench](https://cognition.ai/blog/swe-bench-technical-report)
- [Braintrust Series B ($80M, Feb 2026)](https://www.braintrust.dev/blog/announcing-series-b)
- [LangChain Series B ($125M, Oct 2025)](https://www.langchain.com/blog/series-b)
- [Galileo Series B](https://www.prnewswire.com/news-releases/galileo-raises-45m-series-b-funding-to-bring-evaluation-intelligence-to-generative-ai-teams-everywhere-302276383.html)

### Regulation / litigation
- [EEOC v. iTutorGroup settlement (2023)](https://www.eeoc.gov/newsroom/itutorgroup-pay-365000-settle-eeoc-discriminatory-hiring-suit)
- [Mobley v. Workday class-action proceeds (May 2025)](https://news.bloomberglaw.com/litigation/workday-ai-bias-suit-to-go-forward-as-age-claim-class-action)
- [HR Dive — HireVue/Intuit complaints](https://www.hrdive.com/news/ai-intuit-hirevue-deaf-indigenous-employee-discrimination-aclu/743273/)
