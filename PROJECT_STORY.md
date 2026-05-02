# Flame Founder — Devpost “About the project”

_Copy the sections below into your Devpost project story._

---

## Inspiration

We wanted a **quiet, reflective web ritual** that could sit alongside a bigger experience—like a **Roblox world or a live event**—without feeling like a generic form. The idea: the page **waits** until the game world **triggers** the next step, then the player gets a **focused mini-game** with a clear emotional theme (**self-acceptance**, **vulnerability**, **shared warmth**). Each step ends with a short **typed recap** so the lesson lands before moving on.

---

## What it does

**Flame Founder** (Husky) is a **three-task flow** in the browser:

1. **Task 1 — Recognize imperfection** — A pile of stones; one is subtly wrong. Find it. After success, a **Self-Acceptance** recap types out, then the flow advances.
2. **Task 2 — Being honest with yourself** — **Floating words** drift in the play area; you **capture one** truth. That choice is sent to the API. A **Vulnerability** recap types out, then advance.
3. **Task 3 — Share your fire** — Drag a **torch** through scattered **flames** to gather them; a **lit torch** appears in the center. A **Shared warmth** recap types out, then the run completes.

A **status banner** shows whether tasks are waiting, triggered, or all done. **Dev / admin tools** (refresh, polling, reset, force preview, trigger endpoints) live in a **side drawer** opened with a small **⚙** button so they don’t clutter the player UI or push the layout.

---

## How we built it

- **Backend (`backend/main.py`)** — **FastAPI** with an in-memory **flow state machine**: each of `task-1` … `task-3` is `waiting` → `triggered` → `completed`. Endpoints include `POST /task-N/trigger`, `POST /task-N/complete`, `GET /flow`, `POST /flow/reset`, and task-2 stores a **`choice`** in JSON.
- **Frontend (`frontend/`)** — **Next.js 16** + **React 19**, **Tailwind 4** + **`globals.css`**. Client tasks live in `src/components/Task1.jsx`, `Task2.jsx`, `Task3.jsx`. Flow polling is in `src/hooks/useFlowPoller.js` (optional **2s** poll). API calls go through `src/lib/api.js` to **`/api`**, which **rewrites** to the deployed host in `next.config.mjs`.
- **Polish** — **GSAP** is available for cursor / motion experiments (`package.json`). **Typewriter recaps** after each task use timed character reveals in the task components.

---

## Challenges we ran into

- Keeping **drag / hit-test** interactions (torch vs flames) **smooth**—we avoided heavy layout reads on every move and used **cached positions** + careful clamping where needed.
- **Layout vs dev tools** — a full-width admin block **pushed** the background and felt wrong for players; we moved controls into a **fixed slide-out drawer** (`page.js` + drawer styles in `globals.css`).
- **API contract** — completions only apply when a task is **`triggered`** (`_complete` in `main.py`), so the UI and debug triggers had to stay aligned with that rule.

---

## Accomplishments that we're proud of

- A **cohesive three-beat narrative** with **distinct mechanics** per task—not three versions of the same clicker.
- **Typed recaps** that feel intentional, not tacked on.
- A **clean player surface**: one glass panel, strong background, admin **hidden** until needed.
- A **small but clear backend**: easy to reset, trigger, and inspect **`GET /flow`** for demos and judging.

---

## What we learned

- **Explicit flow APIs** (`trigger` / `complete` / `flow`) make cross-platform demos much easier than ad-hoc flags.
- **Performance** for pointer-driven UI is as much about **what you don’t do every frame** as what you draw.
- **Separating “player chrome” from “dev chrome”** is worth the extra UI work for hackathon polish.

---

## What's next for Flame Founder

- Deeper **Roblox ↔ web** integration (richer payloads, player identity, live sync).
- **Persistence** beyond in-memory flow (DB or Redis) for production.
- **Accessibility** pass on motion, contrast, and keyboard paths for each mini-game.
- Optional **sound design** and haptics timed to recap beats.

---

## Built with (quick reference)

**Next.js**, **React**, **Tailwind CSS**, **FastAPI**, **Pydantic**, **Uvicorn**, **GSAP** — see `frontend/package.json` and `backend/main.py`.
