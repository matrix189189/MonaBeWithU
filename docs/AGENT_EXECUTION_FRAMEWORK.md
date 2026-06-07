# Agent Execution Framework

## Mission

Build a local-first Mac / Windows desktop pet companion. The first pet is an adult ragdoll cat. The MVP succeeds when the cat feels present, soft, quiet, and alive on the desktop.

## Locked Technical Route

OpenPets/Petdex-style asset package + TypeScript Pet Runtime + Electron Desktop Shell + PixiJS spritesheet renderer.

Do not reselect the stack unless Electron is proven unable to satisfy transparent window, always-on-top, dragging, tray, or basic cross-platform packaging.

## Agents

### Commander Agent

Owns scope, task splitting, risk, and final acceptance. It should not write large feature patches.

Outputs each round:

- Current goal
- Assigned tasks
- Status table
- Blockers
- Rework items
- Next smallest verifiable increment

### Visual Agent

Owns adult ragdoll identity, animation quality, expression, and visual consistency. It has veto power over visual acceptance.

### Desktop Shell Agent

Owns Electron main/preload code, transparent windows, always-on-top behavior, tray, dragging IPC, startup/shutdown, and packaging.

### Pet Runtime Agent

Owns the platform-independent state machine. It must not import Electron, PixiJS, DOM APIs, or renderer code.

### Renderer Agent

Owns PixiJS rendering, spritesheet frame extraction, anchor alignment, scaling, and transparent edge quality.

### Asset Agent

Owns `pet.json`, spritesheet naming, asset directory layout, default ragdoll placeholders, and future real asset intake.

Use `docs/MONA_REFERENCE_INTAKE.md` when converting Mona photos or videos into sprite revision inputs.

### QA Agent

Owns manual test scripts, smoke tests, stability checks, CPU/memory checks, and cross-platform behavioral checks.

## Task Template

```text
Task:
Owner:
Background:
Inputs:
Outputs:
Allowed files:
Forbidden changes:
Acceptance:
Report when done:
Report when blocked:
```

## Stage 1 Acceptance

- App launches a transparent borderless window.
- Pet is always on top.
- Pet displays a transparent-background spritesheet animation.
- User can drag the pet by dragging the window.
- Click plays a short reaction animation.
- Idle behavior changes without scattered timers.
- Work-rest nudge is expressed by motion first.
- Tray menu can quit the app.
- Runtime package does not depend on Electron.
- Continuous local run for 1 hour does not crash.

## Escalate To Commander

- Any agent wants to change the stack.
- Any agent wants to add AI, 3D, login, cloud, marketplace, or motion capture in Stage 1.
- Runtime starts depending on Electron or DOM APIs.
- Multiple modules implement competing state machines.
- Visual Agent rejects the cat twice for the same reason.
- Idle CPU or memory becomes unsuitable for a resident desktop app.
