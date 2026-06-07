import "./styles.css";
import { defaultRagdollPet } from "@ragdoll-desktop/pet-assets";
import { PetController } from "@ragdoll-desktop/pet-runtime";
import type { PetAction, PetAnimationName, PetManifest } from "@ragdoll-desktop/shared";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type FrameRectangle = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const ANIMATION_PLAYBACK_SPEED = 0.2;

// ─── DOM setup ─────────────────────────────────────────────

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
const appRoot = root;

const stageElement = document.createElement("div");
stageElement.className = "pet-stage";
appRoot.append(stageElement);

const spriteElement = document.createElement("div");
spriteElement.className = "pet-sprite";
stageElement.append(spriteElement);

const bubble = document.createElement("div");
bubble.className = "bubble";
appRoot.append(bubble);

// ─── Runtime & state ───────────────────────────────────────

const runtime = new PetController(defaultRagdollPet);
let currentAnimation: PetAnimationName | null = null;
let animationTimer: ReturnType<typeof setInterval> | null = null;
let sheetImageSize: { width: number; height: number } | null = null;
let quietMode = false;
let bootTime = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let firstMeetingTimer: ReturnType<typeof setTimeout> | null = null;
let workSessionTimer: ReturnType<typeof setTimeout> | null = null;
let userInactiveTimer: ReturnType<typeof setTimeout> | null = null;
let timeTickTimer: ReturnType<typeof setInterval> | null = null;
let edgeCheckTimer: ReturnType<typeof setInterval> | null = null;

// ─── Tauri shell bridge ────────────────────────────────────

const petShell = {
  moveBy: (delta: { x: number; y: number }) => invoke("move_window", { delta }),
  savePosition: () => invoke("save_position"),
  onQuietMode: (handler: (enabled: boolean) => void) => {
    listen<boolean>("quiet-mode", (event) => handler(event.payload));
    return () => {};
  },
  onSettingsRequested: (handler: () => void) => {
    listen("settings-requested", () => handler());
    return () => {};
  }
};

// ─── Debug helpers ─────────────────────────────────────────

window.__petDebug = { phase: "boot", manifest: defaultRagdollPet.id };
appRoot.dataset.petPhase = "boot";

function setDebugPhase(phase: string, extra: Record<string, unknown> = {}): void {
  window.__petDebug = { ...window.__petDebug, phase, ...extra };
  appRoot.dataset.petPhase = phase;
  if (extra.error) {
    appRoot.dataset.petError = String(extra.error);
  }
}

// ─── Idle scheduler ────────────────────────────────────────

function cancelIdleTick(): void {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

/** Pick the right tick interval: short during warm-up, longer after. */
function currentTickRange(): number[] {
  const warmUpMs = defaultRagdollPet.behaviors.warmUpDurationMs ?? 180_000;
  if (bootTime > 0 && (Date.now() - bootTime) < warmUpMs) {
    return defaultRagdollPet.behaviors.warmUpTickRangeMs ?? [15_000, 30_000];
  }
  return defaultRagdollPet.behaviors.idleTickRangeMs;
}

function scheduleIdleTick(): void {
  cancelIdleTick();
  const [minMs, maxMs] = currentTickRange();
  const delay = minMs + Math.random() * (maxMs - minMs);
  idleTimer = setTimeout(() => {
    applyActions(runtime.handle({ type: "IDLE_TICK", now: Date.now() }));
    scheduleIdleTick();
  }, delay);
}

// ─── First-meeting greeting ────────────────────────────────

function cancelFirstMeeting(): void {
  if (firstMeetingTimer !== null) {
    clearTimeout(firstMeetingTimer);
    firstMeetingTimer = null;
  }
}

function scheduleFirstMeeting(): void {
  const message = defaultRagdollPet.behaviors.firstMeetingMessage;
  if (!message) return;
  const [minMs, maxMs] = defaultRagdollPet.behaviors.firstMeetingDelayMs ?? [2000, 5000];
  const delay = minMs + Math.random() * (maxMs - minMs);
  firstMeetingTimer = setTimeout(() => {
    applyActions(runtime.handle({ type: "FIRST_MEETING" }));
  }, delay);
}

// ─── Work session timer ────────────────────────────────────

function cancelWorkSessionTimer(): void {
  if (workSessionTimer !== null) {
    clearTimeout(workSessionTimer);
    workSessionTimer = null;
  }
}

function scheduleWorkSessionTimer(): void {
  cancelWorkSessionTimer();
  const restAfter = defaultRagdollPet.behaviors.restNudgeAfterMs;
  workSessionTimer = setTimeout(() => {
    applyActions(runtime.handle({ type: "WORK_SESSION_LONG", now: Date.now() }));
    scheduleWorkSessionTimer();
  }, restAfter);
}

// ─── User inactivity detection ─────────────────────────────

function cancelUserInactive(): void {
  if (userInactiveTimer !== null) {
    clearTimeout(userInactiveTimer);
    userInactiveTimer = null;
  }
}

function scheduleUserInactive(): void {
  cancelUserInactive();
  const INACTIVE_TIMEOUT_MS = 120_000;
  userInactiveTimer = setTimeout(() => {
    applyActions(runtime.handle({ type: "USER_INACTIVE" }));
  }, INACTIVE_TIMEOUT_MS);
}

function onUserActivity(): void {
  scheduleUserInactive();
}

document.addEventListener("mousemove", onUserActivity, { passive: true });
document.addEventListener("keydown", onUserActivity, { passive: true });

// ─── Time tick (fires every minute for time-based nudges) ──

function cancelTimeTick(): void {
  if (timeTickTimer !== null) {
    clearInterval(timeTickTimer);
    timeTickTimer = null;
  }
}

function scheduleTimeTick(): void {
  cancelTimeTick();
  // Fire every 60 seconds with current hour and weekday
  timeTickTimer = setInterval(() => {
    const now = new Date();
    applyActions(runtime.handle({
      type: "TIME_TICK",
      now: Date.now(),
      hour: now.getHours(),
      weekday: now.getDay()
    }));
  }, 60_000);
}

// ─── Window edge detection ─────────────────────────────────

function cancelEdgeCheck(): void {
  if (edgeCheckTimer !== null) {
    clearInterval(edgeCheckTimer);
    edgeCheckTimer = null;
  }
}

function scheduleEdgeCheck(): void {
  cancelEdgeCheck();
  // Check every 10 seconds — a gentle curiosity, not a spam
  edgeCheckTimer = setInterval(() => {
    if (quietMode) return;
    const sx = window.screenX ?? 0;
    const sy = window.screenY ?? 0;
    const sw = window.screen.availWidth;
    const sh = window.screen.availHeight;
    const ww = window.outerWidth;
    const wh = window.outerHeight;

    // Only trigger when very close to edge (10px)
    const edgeThreshold = 10;
    const nearEdge =
      sx <= edgeThreshold ||
      sy <= edgeThreshold ||
      sx + ww >= sw - edgeThreshold ||
      sy + wh >= sh - edgeThreshold;

    if (nearEdge) {
      applyActions(runtime.handle({ type: "WINDOW_EDGE_NEAR" }));
    }
  }, 10_000);
}

// ─── Rendering helpers ─────────────────────────────────────

function resize(): void {
  positionSprite();
}

function positionSprite(): void {
  spriteElement.style.left = `${window.innerWidth * defaultRagdollPet.anchor.x}px`;
  spriteElement.style.top = `${window.innerHeight * defaultRagdollPet.anchor.y}px`;
  spriteElement.style.transformOrigin = `${defaultRagdollPet.anchor.x * 100}% ${defaultRagdollPet.anchor.y * 100}%`;
  spriteElement.style.transform = `translate(${-defaultRagdollPet.anchor.x * 100}%, ${-defaultRagdollPet.anchor.y * 100}%) scale(${defaultRagdollPet.scale})`;
}

function frameRect(index: number, manifest: PetManifest): FrameRectangle {
  const sheet = manifest.spritesheets[0];
  const frame = sheet.frames?.[index];
  if (frame) {
    return frame;
  }
  const columns = sheet.columns ?? 4;
  const x = (index % columns) * sheet.frameWidth;
  const y = Math.floor(index / columns) * sheet.frameHeight;
  return { x, y, w: sheet.frameWidth, h: sheet.frameHeight };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed to load: ${src}`));
    image.src = src;
  });
}

function renderFrame(frame: number): void {
  const rect = frameRect(frame, defaultRagdollPet);
  spriteElement.style.width = `${rect.w}px`;
  spriteElement.style.height = `${rect.h}px`;
  spriteElement.style.backgroundPosition = `-${rect.x}px -${rect.y}px`;
  positionSprite();
}

// ─── Animation builder ─────────────────────────────────────

async function buildAnimations(manifest: PetManifest): Promise<void> {
  const sheet = manifest.spritesheets[0];
  setDebugPhase("loading-sheet", { image: sheet.image });
  const image = await loadImage(sheet.image);
  sheetImageSize = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };
  spriteElement.style.backgroundImage = `url("${sheet.image}")`;
  spriteElement.style.backgroundRepeat = "no-repeat";
  spriteElement.style.backgroundSize = `${sheetImageSize.width}px ${sheetImageSize.height}px`;
  setDebugPhase("sheet-loaded", {
    width: image.naturalWidth,
    height: image.naturalHeight
  });

  for (const [name, animation] of Object.entries(manifest.animations)) {
    if (animation.frames.length === 0) {
      throw new Error(`Animation has no frames: ${name}`);
    }
  }
  renderFrame(manifest.animations[manifest.behaviors.default].frames[0]);
  setDebugPhase("animations-built", { animationCount: Object.keys(manifest.animations).length });
}

// ─── Playback ──────────────────────────────────────────────

function playAnimation(name: PetAnimationName): void {
  const definition = defaultRagdollPet.animations[name];
  if (!definition || currentAnimation === name) return;

  if (animationTimer !== null) {
    clearInterval(animationTimer);
    animationTimer = null;
  }

  currentAnimation = name;
  let frameIndex = 0;
  const frameDurationMs = Math.max(50, Math.round(1000 / (definition.fps * ANIMATION_PLAYBACK_SPEED)));

  renderFrame(definition.frames[frameIndex]);

  if (definition.frames.length <= 1) return;

  animationTimer = setInterval(() => {
    frameIndex += 1;
    if (frameIndex >= definition.frames.length) {
      if (definition.loop) {
        frameIndex = 0;
      } else {
        if (animationTimer !== null) {
          clearInterval(animationTimer);
          animationTimer = null;
        }
        applyActions(runtime.handle({ type: "ANIMATION_DONE", animation: name }));
        return;
      }
    }
    renderFrame(definition.frames[frameIndex]);
  }, frameDurationMs);
}

let bubbleTimer: number | null = null;

function showBubble(text: string): void {
  if (quietMode) return;
  if (bubbleTimer !== null) {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }
  bubble.textContent = text;
  bubble.classList.add("visible");
  bubbleTimer = window.setTimeout(() => {
    bubble.classList.remove("visible");
    bubbleTimer = null;
  }, 3000);
}

function applyActions(actions: PetAction[]): void {
  for (const action of actions) {
    if (action.type === "PLAY_ANIMATION") {
      playAnimation(action.animation);
    }
    if (action.type === "SHOW_BUBBLE") {
      showBubble(action.text);
    }
    if (action.type === "SET_MOOD") {
      stageElement.dataset.mood = action.mood;
      setTimeout(() => { delete stageElement.dataset.mood; }, 2000);
    }
  }
}

// ─── Drag & click (with rapid-click detection) ─────────────

let dragging = false;
let pointerStart: { x: number; y: number } | null = null;
let movedDuringDrag = false;
let totalDragPx = 0;
let clickCount = 0;
let clickWindowTimer: ReturnType<typeof setTimeout> | null = null;

stageElement.addEventListener("pointerdown", (event) => {
  dragging = true;
  movedDuringDrag = false;
  totalDragPx = 0;
  pointerStart = { x: event.screenX, y: event.screenY };
  stageElement.classList.add("dragging");
  stageElement.setPointerCapture(event.pointerId);
  cancelIdleTick();
  onUserActivity();

  // Track rapid clicks
  clickCount += 1;
  if (clickWindowTimer) clearTimeout(clickWindowTimer);
  clickWindowTimer = setTimeout(() => { clickCount = 0; }, 800);

  applyActions(runtime.handle({ type: "DRAG_START" }));
});

stageElement.addEventListener("pointermove", (event) => {
  if (!dragging || !pointerStart) return;
  const delta = { x: event.screenX - pointerStart.x, y: event.screenY - pointerStart.y };
  const dist = Math.abs(delta.x) + Math.abs(delta.y);
  if (dist > 2) {
    movedDuringDrag = true;
  }
  totalDragPx += dist;
  pointerStart = { x: event.screenX, y: event.screenY };
  void petShell.moveBy(delta);
  applyActions(runtime.handle({
    type: "DRAG_MOVE",
    direction: delta.x > 0 ? "right" : delta.x < 0 ? "left" : undefined
  }));
});

stageElement.addEventListener("pointerup", (event) => {
  dragging = false;
  pointerStart = null;
  stageElement.classList.remove("dragging");
  stageElement.releasePointerCapture(event.pointerId);
  applyActions(runtime.handle({
    type: "DRAG_END",
    now: Date.now(),
    movedPx: movedDuringDrag ? totalDragPx : undefined
  }));

  if (!movedDuringDrag) {
    cancelIdleTick();
    // Rapid click detection
    if (clickCount >= 2) {
      applyActions(runtime.handle({ type: "CLICK_RAPID", count: clickCount }));
    } else {
      applyActions(runtime.handle({ type: "CLICK" }));
    }
  }
  void petShell.savePosition();
  scheduleIdleTick();
});

// ─── Shell events ──────────────────────────────────────────

window.addEventListener("resize", resize);
petShell.onQuietMode((enabled) => {
  quietMode = enabled;
});
petShell.onSettingsRequested(() => {
  showBubble("Mona 安静地陪着你。");
});

// ─── Boot ──────────────────────────────────────────────────

try {
  bootTime = Date.now();
  await buildAnimations(defaultRagdollPet);
  applyActions(runtime.handle({ type: "BOOT", now: bootTime }));
  scheduleFirstMeeting();
  scheduleIdleTick();
  scheduleWorkSessionTimer();
  scheduleUserInactive();
  scheduleTimeTick();
  setDebugPhase("running");
  invoke("report_ready").catch(() => {});
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  setDebugPhase("failed", { error: message });
  showBubble(`素材加载失败：${message}`);
  console.error(error);
}
