# Spec: Auth Lab Runbook - The Learning Path

**Date:** 2026-04-28
**Status:** Draft
**Topic:** Operational & Educational Guide for Auth Lab

## 1. Overview
The Runbook serves as the primary operational guide and educational curriculum for the Secure Auth Lab. It bridges the gap between raw code and hands-on learning.

## 2. Structure (RUNBOOK.md)

### 2.1 Level 0: The Basecamp (Setup)
- **Environment:** Step-by-step `.env` configuration for BE and FE.
- **Infrastructure:** Docker commands and service verification (Postgres, Redis).
- **Application:** Bootstrapping the monorepo with `pnpm`.

### 2.2 Level 1: The Core (JWT & Stateless Auth)
- **Concept:** Understanding JWT structure and signature.
- **Exercises:**
    - Attack: Brute-forcing JWT secrets using `jwt_cracker.py`.
    - Defense: Implementing RSA/AES for hardened secrets.
- **Resources:** Link to `docs/superpowers/sample/scenarios/01-jwt-brute-force.md`.

### 2.3 Level 2: The Fortress (Cookies & Sessions)
- **Concept:** HttpOnly, SameSite, and Cookie Prefixes.
- **Exercises:**
    - Attack: XSS-based session manipulation via `payloads/xss.js`.
    - Defense: Analyzing the `__Host-` prefix and CSP implementation in `main.ts`.
- **Resources:** Link to `docs/superpowers/sample/scenarios/02-xss-token-theft.md`.

### 2.4 Level 3: The Gateway (OAuth2 & PKCE)
- **Concept:** Delegated authorization and the interception threat.
- **Exercises:**
    - Attack: Intercepting Auth Codes using `oauth_mock_server.py`.
    - Defense: Validating PKCE challenges in `auth.controller.ts`.
- **Resources:** Link to `docs/superpowers/sample/scenarios/03-oauth-shadow.md`.

### 2.5 Level 4: The Advanced Lab (Edge Cases)
- **Concept:** Timing attacks and Rate limiting.
- **Exercises:** Timing analysis and proxy rotation.

## 3. Maintenance & Troubleshooting
- Common issues (CORS, DB connection, Redis port conflicts).
- Commands to reset the lab state.

## 4. Documentation Links
- Centralized list of all Specs, Plans, and Attack Scenarios.
