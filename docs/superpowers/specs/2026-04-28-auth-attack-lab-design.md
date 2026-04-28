# Spec: Auth Attack Lab - Hybrid Exploitation Environment

**Date:** 2026-04-28
**Status:** Draft
**Topic:** Educational Authentication Attack Scenarios

## 1. Overview
The Auth Attack Lab is a collection of hands-on scenarios designed to demonstrate common and advanced authentication vulnerabilities. It uses a "Hybrid" approach, combining manual exploitation (using tools like Burp Suite) with automated scripts (Python/Bash).

## 2. Objectives
- Demonstrate the practical risks of misconfigured authentication.
- Teach the methodology of "Red Team" testing for auth flows.
- Provide a safe environment to use professional security tools.

## 3. Attack Scenarios (The Big 10)

| ID | Name | Focus Area | Primary Tools |
|----|------|------------|---------------|
| 01 | JWT Secret Heist | JWT Brute-force | `hashcat`, `jwt_tool` |
| 02 | Silent Cookie Miner | XSS & Session Theft | `BeEF`, `xsstrike` |
| 03 | OAuth Shadow | OAuth2 Logic | Burp Suite, Python |
| 04 | Algorithm Confusion | JWT Signature Bypass | `jwt_tool`, Python |
| 05 | Account Linking Hijack| OAuth2 CSRF/State | Burp Suite |
| 06 | Stopwatch Attack | Timing/Enumeration | Python (Time-based) |
| 07 | Leaky Referer | Token Leakage | DevTools, Python |
| 08 | Pre-Auth Trap | Session Fixation | `curl`, Burp Suite |
| 09 | Zombie Army | Rate Limit Bypass | Burp Intruder, Proxy |
| 10 | None Algorithm | JWT Header Manipulation| JWT Editor |

## 4. Architecture & Directory Structure
The lab will be organized as follows:

```bash
docs/superpowers/sample/
├── attack-dashboard.md       # Central navigation
├── assets/                   # Diagrams (Mermaid)
└── scenarios/                # Step-by-step MD guides
    ├── 01-jwt-brute-force.md
    ├── 02-xss-token-theft.md
    └── ... (all 10 scenarios)
scripts/exploit/              # The Toolkit
├── jwt_cracker.py            # JWT brute-forcer
├── timing_attack.py          # Timing analysis script
├── oauth_callback_server.py  # Mock listener for OAuth codes
└── payloads/                 # XSS/CSRF payloads
```

## 5. Security & Ethical Disclaimer
> [!CAUTION]
> This lab is for **educational purposes only**. Unauthorized access to systems you do not own is illegal. Use these tools and techniques only on the provided local environment.

## 6. Implementation Strategy
- **Phase 1:** Setup the directory structure and the `attack-dashboard.md`.
- **Phase 2:** Create the "Manual" guides for each scenario in `scenarios/`.
- **Phase 3:** Develop the supporting Python/JS scripts in `scripts/exploit/`.
- **Phase 4:** Add Mermaid diagrams to visualize the "Happy Path" vs "Attack Path".
