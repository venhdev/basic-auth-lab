# Spec: Secure Auth Lab - Interactive Portfolio README

**Date:** 2026-04-28
**Status:** Draft
**Topic:** Professional Project README Design

## 1. Overview
The goal is to create a high-impact, professional README.md that serves as both a portfolio showcase for developers/recruiters and an educational resource for security students.

## 2. README Sections

### 2.1 Hero & Tech Stack
- **Title:** Secure Auth Lab: The Ultimate Authentication & Exploitation Playground.
- **Badges:** Dynamic badges for NestJS, NextJS, Docker, Security, and build status.
- **Intro:** A high-level value proposition emphasizing security and full-stack development.
- **Tech Stack Table:** Organized by Core, Security, and Infrastructure.

### 2.2 Security Architecture (The "Core")
- **Mermaid Diagram:** Visualizing the login and silent refresh flow.
- **Security Features List:**
    - Dual-token strategy (HttpOnly cookies + In-memory storage).
    - `__Host-` cookie prefix protection.
    - Blacklist (Redis) vs Whitelist (Postgres) refresh token management.
    - CSP (Content Security Policy) integration.

### 2.3 The Attack Lab (The "Showcase")
- **Intro:** Introduction to the `attack-dashboard.md` and the 10 scenarios.
- **Exploit Spotlights:** Side-by-side "Attack vs Defense" comparisons for 2 scenarios:
    1. JWT Secret Brute-forcing.
    2. XSS-based Session Manipulation.
- **Attacker Toolkit:** List of tools (Burp Suite, Hashcat, Python).

### 2.4 Project Structure
- Map of the monorepo: `apps/be`, `apps/fe`, `scripts/exploit`, `docs/`.

### 2.5 Quick Start
- One-step Docker setup: `docker compose up -d`.
- Environment variable configuration guide.

## 3. Visual Assets
- **Mermaid Flowchart:** To be embedded directly in README.
- **Feature Icons:** Using standard GitHub emojis or SVG icons for better visual separation.

## 4. Documentation Links
- Direct links to Specs, Plans, and the Attack Dashboard.
