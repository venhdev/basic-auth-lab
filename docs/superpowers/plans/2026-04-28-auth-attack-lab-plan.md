# Auth Attack Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive hybrid authentication attack lab with 10 interactive scenarios.

**Architecture:** A collection of Markdown guides (manual exploration) and Python/JS scripts (automated exploitation) targeting the existing NestJS/NextJS auth lab.

**Tech Stack:** Python 3 (PyJWT, Requests), Node.js, Burp Suite (manual guide), Mermaid.js.

---

### Task 1: Foundation & Dashboard

**Files:**
- Create: `docs/superpowers/sample/attack-dashboard.md`
- Create: `docs/superpowers/sample/scenarios/.gitkeep`
- Create: `scripts/exploit/.gitkeep`

- [x] **Step 1: Create the directory structure**
Run: `mkdir -p docs/superpowers/sample/scenarios docs/superpowers/sample/assets scripts/exploit/payloads`

- [x] **Step 2: Initialize the Attack Dashboard**
Create `docs/superpowers/sample/attack-dashboard.md` with links to all 10 scenarios and a welcome message.

- [x] **Step 3: Commit foundation**
```bash
git add docs/superpowers/sample/ scripts/exploit/
git commit -m "chore: initialize attack lab structure"
```

### Task 2: JWT Secret Heist (Scenario 01)
**Focus:** Brute-force & Signature Forgery.
- [x] **Step 1: Create Scenario Guide `scenarios/01-jwt-brute-force.md`**
- [x] **Step 2: Create Python Cracker `scripts/exploit/jwt_cracker.py`**
- [x] **Step 3: Commit**

### Task 3: Algorithm Confusion (Scenario 04)
**Focus:** RS256 to HS256 downgrade.
- [x] **Step 1: Create Scenario Guide `scenarios/04-algorithm-confusion.md`**
- [x] **Step 2: Create Exploit Script `scripts/exploit/alg_confusion.py`**
- [x] **Step 3: Commit**

### Task 4: None Algorithm (Scenario 10)
**Focus:** Bypassing signature check with `alg: none`.
- [x] **Step 1: Create Scenario Guide `scenarios/10-none-algorithm.md`**
- [x] **Step 2: Create Payload Script `scripts/exploit/jwt_none_gen.py`**
- [x] **Step 3: Commit**

### Task 5: Silent Cookie Miner (Scenario 02)
**Focus:** XSS to perform actions on behalf of user (Request Forgery).
- [x] **Step 1: Create Scenario Guide `scenarios/02-xss-token-theft.md`**
- [x] **Step 2: Create XSS Payloads in `scripts/exploit/payloads/xss.js`**
- [x] **Step 3: Commit**

### Task 6: Leaky Referer (Scenario 07)
**Focus:** Token leakage via Referer header.
- [x] **Step 1: Create Scenario Guide `scenarios/07-leaky-referer.md`**
- [x] **Step 2: Create Leak Listener `scripts/exploit/leak_listener.py`**
- [x] **Step 3: Commit**

### Task 7: Pre-Auth Trap (Scenario 08)
**Focus:** Session Fixation.
- [x] **Step 1: Create Scenario Guide `scenarios/08-pre-auth-trap.md`**
- [x] **Step 2: Create Exploit Script `scripts/exploit/session_fixation.sh`**
- [x] **Step 3: Commit**

### Task 8: OAuth Shadow & Account Hijack (Scenario 03 & 05)
**Focus:** Redirect URI interception & State CSRF.
- [x] **Step 1: Create Scenario Guides `03-oauth-shadow.md` and `05-account-linking.md`**
- [x] **Step 2: Create Mock Callback Server `scripts/exploit/oauth_mock_server.py`**
- [x] **Step 3: Commit**

### Task 9: Stopwatch Attack (Scenario 06)
**Focus:** Timing analysis for user enumeration.
- [x] **Step 1: Create Scenario Guide `scenarios/06-timing-attack.md`**
- [x] **Step 2: Create Timing Analyzer `scripts/exploit/timing_analyzer.py`**
- [x] **Step 3: Commit**

### Task 10: Zombie Army (Scenario 09)
**Focus:** Rate limit bypass via proxy rotation.
- [x] **Step 1: Create Scenario Guide `scenarios/09-rate-limit-bypass.md`**
- [x] **Step 2: Create Proxy Rotator Script `scripts/exploit/brute_force_rotated.py`**
- [x] **Step 3: Commit**

---
**Self-Review:**
1. Spec coverage: All 10 scenarios from spec are now mapped to tasks.
2. Placeholder scan: No placeholders.
3. Type consistency: Consistent with the monorepo structure.
