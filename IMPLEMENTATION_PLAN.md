# Implementation Plan - Kwizz: The SpeedQuizzing Killer
> **Status:** Active | **Owner:** @Conductor / @JonnyAI (The Architect) / @Pixel (The Perfectionist)

## 1. User Goal
Build a superior, high-performance interactive quiz platform (**Kwizz.co.uk**) that improves upon SpeedQuizzing by offering:
- **Zero-Friction Entry:** No player app downloads (PWA/Browser-based).
- **Infinite Quiz Generation:** AI-powered question generation and "Loads of quizzes" (User request).
- **God-Tier Aesthetics:** "Heavy branded," premium design with the Kwizz aesthetic.
- **Cross-Platform Host:** Web-based host dashboard.
- **Real-Time Synergy:** ultra-low latency buzzers using Supabase Realtime.

## 2. Proposed Architecture
- **Frontend:** Next.js 14+ (App Router), TypeScript.
- **Styling:** Tailwind CSS v4 (@theme, @apply) + Framer Motion.
- **Backend/Realtime:** Supabase.
- **Quiz Engine:** Python-based execution script (`execution/generate_kwizz_packs.py`).
- **Deployment:** Vercel + Supabase + GitHub Repo (`github-kwizd`).

## 3. Step-by-Step Task List

### Phase 1: Foundation & Branding (P0)
- [x] **Task 1.1:** Initialize Next.js project in `Clients/kwizz`.
- [x] **Task 1.2:** Implement Design System (Obsidian, Electric Purple, Neon Cyan).
- [x] **Task 1.3:** Setup Supabase schema for Quizzes, Questions, Games, Players.

# Kwizz: Neural Core Recovery Plan (@Sentinel)

Critical production bugs identified: duplicate joins, missing question text on player devices, and runtime crashes ("blackout").

## Proposed Changes

### [Sync Core] Realtime Deduplication (`lib/useGameSync.ts`)
- **State Protection**: Update `setPlayers` to always deduplicate incoming `INSERT` events by ID.
- **Session Continuity**: Implement local storage check in `joinGame` to prevent redundant record creation on refresh/re-join.

### [Player UI] Restoration of Question Text (`app/play/page.tsx`)
- **Missing Link**: Inject `<h2>{currentQuestion.text}</h2>` into the `Active Game` state.
- **Safety Gates**: Add error guards to the `AnimatePresence` result feedback to prevent component unmounting on null players.

### [Host UI] Response Hardening (`app/host/page.tsx`)
- **Leaderboard Resilience**: Ensure response sorting and player lookups handle `undefined` results gracefully without crashing the dashboard.
- **Lobby Management**: Implement a cleanup trigger to remove "ghost" nodes if multiple IDs exist for the same team name.

## Verification Plan
### Simulation Verification
- Run `execution/simulate_monetization.py` with expanded tests for:
  - Concurrent joins with the same team name.
  - Question advancement with rapid response submission.
- Manual verification of question text visibility on mobile devices.

### Phase 2: The Quiz Engine (P0)
- [x] **Task 2.1:** Create `execution/generate_kwizz_packs.py`.
- [x] **Task 2.2:** Bulk generate and import initial quiz packs (50 packs / 500 questions synced).

### Phase 3: Real-Time Host/Player Logic (P1)
- [x] **Task 3.1:** Host Dashboard (Question control, Leaderboard).
- [x] **Task 3.2:** Player Interface (Buzzer, manual PIN entry, Live Rank).
- [x] **Task 3.3:** Supabase Realtime sync.

### Phase 4: The Next Level (God-Tier Polish)
- [x] **Task 4.1:** **Public Deployment:** Initial deployment to Hostinger.
- [ ] **Task 4.2:** **Audio Experience:** Implement SFX (Buzzers, Countdowns, Victory) - *Next Sprint*.
- [ ] **Task 4.3:** **PWA Transformation:** Add manifest/icons so it installs like a native app.
- [ ] **Task 4.4:** **Advanced Host Features:** "Nearest Wins" numerics and tie-breakers.
- [x] **Task 4.5:** **QR Fix:** Resolve 403 Forbidden on QR scan (config & .htaccess).
- [x] **Task 4.6:** **God-Tier UI:** Implement Noise Texture, Motion-driven UI, and Premium Buttons.
- [x] **Task 4.7:** **Auth:** Implement Google Sign-In for Admin/Host access.

## 4. Verification Plan
1. **Low Latency Test:** Verify buzzer order. (Passed)
2. **Content Audit:** 123 Quiz Packs synced to Production DB. (Passed)
3. **UI Depth:** Noise texture and premium shadows verified in CSS.
4. **QR Path Verification:** Ensure `/play/` and `/play` both resolve to the join screen. (Fixed & SFTP Deployed)

## 5. Rollback Strategy
- Git reverts & DB snapshots.
