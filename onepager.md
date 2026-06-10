# CaseHire — one page

**A B2B2C platform that grades junior developers on *how they work with AI*, not on what they produce.**

## What it is

Candidates take a 20-40 minute case in a web-based sandboxed IDE — synthetic codebase, live database, mock services — with **two chat panels**: a trusted **AI Buddy** that knows their team's codebase, conventions, and business context, and a deliberately separate **External LLM** channel that's context-free. Every prompt, file read, terminal command, and edit is logged. The output is a nine-dimensional process matrix (planning, context literacy, AI calibration, safety, verification, recovery, articulation, business literacy, **OPSEC**) + a scrubbable session replay. Hiring managers see ranked candidate cards backed by evidence, not guesses.

## Why now

Output is dead as a signal. **97% of devs use AI assistants** (HackerRank 2025); **0 of 32 interviewers** detected ChatGPT-assisted cheating in a controlled study (interviewing.io). Google DORA's 2024 research on 39,000+ professionals: AI tooling correlates with *worse* software delivery performance two years running. Meanwhile, AI fluency became a literal job requirement — **Shopify CEO mandated it in performance reviews** (Apr 2025); **Coinbase CEO fired engineers who didn't adopt AI within a week** (Aug 2025). Companies have to hire for AI fluency now and have no tool to test for it.

## The signature feature

**OPSEC honeypot.** The AI Buddy is instrumented to share "sensitive" artifacts during normal task flow — API keys, customer records, internal PRs. We watch the External LLM channel for fingerprints. Cyberhaven telemetry on 1.6M workers: **11% of pasted ChatGPT content is sensitive**. Samsung Semiconductor leaked source code into ChatGPT three times in 20 days (April 2023) and banned it company-wide. **No competitor tests for this.** It's the single most defensible feature and a procurement-driving one for fintech, healthcare, and regulated industries.

## Market

Russian HR Tech: **99.3B₽ in 2024, +38% YoY** (Smart Ranking). Assessment sub-segment: **3.85B₽**. 43% of Russian companies already use AI in HR; 27% piloting for 2026. **ROI math:** one bad junior hire at SHRM's 100% replacement-cost floor (~1.5M₽ on a 1.5M salary) = >2 years of CaseHire's Team tier (588K₽). One avoided bad hire pays for the platform twice over.

## Competitive position

Process-eval is no longer empty space — HackerRank, Codility, CodeSignal, CoderPad, and Karat NextGen (Dec 2025) all have versions of it. Our defensible corner: **OPSEC honeypot + junior-tier specialization + async-automated (no human interviewer) + per-position-generated cases (not library questions) + Russian on-prem.** HackerRank's own 2025 guide: *"the challenge is not just detecting AI-assisted cheating, but determining when AI assistance should be considered legitimate."* When the incumbent reframes its product around our thesis, the category is settled — the question is who builds the right shape.

## Unit economics

Per-session cost: **$1-3** (compute + LLM tokens). Tiers: Pilot 15K₽ (1 position, 100 candidates) → Team 49K₽/mo (5 positions) → Growth 149K₽/mo (20 positions + analytics) → Enterprise from 400K₽/yr (on-prem available). Per-completed-session metering with rate limits, not per-seat SaaS.

## The roadmap punchline

The same infrastructure evaluates AI agents in v3. **Goldman Sachs is deploying "hundreds, going into thousands of Devins"** alongside its 12K human developers (CTO statement, July 2025). **Cursor is in 64% of the Fortune 500.** Procurement teams have no apples-to-apples way to compare which agent works in their codebase — that gap exists right now. Junior hiring is the wedge; **intelligence-at-work evaluation is the category**. The closing scene of the pitch is a split-screen: human candidate's session on the left, Claude Code's session on the right, same case, same process matrix filling for both.

We're not playing the HR Tech game. We built the substrate for it.
