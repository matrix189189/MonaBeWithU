export type PetAnimationName = string;

export interface PetSpritesheet {
  id: string;
  image: string;
  frameWidth: number;
  frameHeight: number;
  columns?: number;
  frames?: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

export interface PetAnimationDefinition {
  sheet: string;
  frames: number[];
  fps: number;
  loop: boolean;
}

export interface PetBehaviors {
  default: PetAnimationName;
  onClick: PetAnimationName[];
  idlePool: PetAnimationName[];
  restNudge: PetAnimationName[];
  /** How long (ms) before a rest nudge fires (default 2 hours). */
  restNudgeAfterMs: number;
  /** Range for idle tick interval [min, max] in ms. */
  idleTickRangeMs: number[];
  /** Messages randomly chosen for rest nudge bubble. */
  restNudgeMessages: string[];
  /** Optional: morning greeting message (shown once per day, 6-10am). */
  morningGreetingMessage?: string;
  /** Optional: meal-time messages keyed by hour (e.g. {"12": "该吃午饭了～"}). */
  mealMessages?: Record<number, string>;
  /** Optional: late-night message (shown after this hour, e.g. 23). */
  lateNightAfterHour?: number;
  /** Optional: late-night message text. */
  lateNightMessage?: string;
  /** Optional: animation pool for rapid-click reactions. */
  rapidClickPool?: PetAnimationName[];
  /** Optional: messages randomly chosen for rapid-click bubble. */
  rapidClickMessages?: string[];
  /** Optional: messages for single-click feedback bubble (30-50% chance). */
  clickMessages?: string[];
  /** Optional: probability (0-1) of showing a bubble on single click. Default 0.4. */
  clickBubbleChance?: number;
  /** Optional: duration of post-boot warm-up period in ms. Default 180000 (3 min). */
  warmUpDurationMs?: number;
  /** Optional: tick range during warm-up [min, max] in ms. Default [15000, 30000]. */
  warmUpTickRangeMs?: number[];
  /** Optional: switch idle animation every N ticks during warm-up. Default 1. */
  warmUpIdleEveryN?: number;
  /** Optional: switch idle animation every N ticks after warm-up. Default 8. */
  idleEveryN?: number;
  /** Optional: first-meeting message shown shortly after boot. */
  firstMeetingMessage?: string;
  /** Optional: delay range for first-meeting [min, max] in ms. Default [2000, 5000]. */
  firstMeetingDelayMs?: number[];
  /** Optional: messages shown after drag with significant movement. */
  dragEndMessages?: string[];
  /** Optional: animation pool for post-drag feedback. Default ["look_around", "wave_hello"]. */
  dragEndAnimations?: PetAnimationName[];
}

export interface PetManifest {
  id: string;
  name: string;
  version: string;
  scale: number;
  anchor: {
    x: number;
    y: number;
  };
  spritesheets: PetSpritesheet[];
  animations: Record<PetAnimationName, PetAnimationDefinition>;
  behaviors: PetBehaviors;
}

export type PetEvent =
  | { type: "BOOT"; now: number }
  | { type: "FIRST_MEETING" }
  | { type: "CLICK" }
  | { type: "CLICK_RAPID"; count: number }
  | { type: "DRAG_START" }
  | { type: "DRAG_MOVE"; direction?: "left" | "right" }
  | { type: "DRAG_END"; now: number; movedPx?: number }
  | { type: "IDLE_TICK"; now: number }
  | { type: "TIME_TICK"; now: number; hour: number; weekday: number }
  | { type: "WORK_SESSION_LONG"; now: number }
  | { type: "USER_INACTIVE" }
  | { type: "WINDOW_EDGE_NEAR" }
  | { type: "ANIMATION_DONE"; animation: PetAnimationName };

export type PetAction =
  | { type: "PLAY_ANIMATION"; animation: PetAnimationName }
  | { type: "SHOW_BUBBLE"; text: string }
  | { type: "SET_MOOD"; mood: "calm" | "sleepy" | "curious" | "excited" | "grumpy" }
  | { type: "SET_CLICK_THROUGH"; enabled: boolean };
