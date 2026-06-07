import type { PetAction, PetAnimationName, PetEvent, PetManifest } from "@ragdoll-desktop/shared";

type RuntimeState = "booting" | "idle" | "dragged" | "reacting" | "rest_nudge";

export class PetController {
  private state: RuntimeState = "booting";
  private currentAnimation: PetAnimationName | null = null;
  private idleSince = 0;
  private idleTickCount = 0;
  /** Track last greeting date to avoid duplicate greetings. */
  private lastGreetingDate = "";
  /** Track what time-based nudges we've already shown today. */
  private shownNudgesToday = new Set<string>();
  /** Date marker value — used to detect day change. */
  private currentDate = "";
  /** Boot timestamp — used for warm-up period logic. */
  private bootTime = 0;
  /** Cooldown for edge reactions to avoid spam. */
  private lastEdgeReaction = 0;

  constructor(private readonly manifest: PetManifest) {}

  handle(event: PetEvent): PetAction[] {
    switch (event.type) {
      case "BOOT":
        return this.handleBoot(event);

      case "FIRST_MEETING":
        return this.handleFirstMeeting();

      case "CLICK":
        if (this.state === "dragged") return [];
        return this.handleClick();

      case "CLICK_RAPID":
        if (this.state === "dragged") return [];
        return this.handleClickRapid(event.count);

      case "DRAG_START":
        this.state = "dragged";
        return [{ type: "SET_MOOD", mood: "curious" as const }];

      case "DRAG_MOVE":
        if (event.direction === "right") return this.play("walk_right");
        if (event.direction === "left") return this.play("walk_left");
        return [];

      case "DRAG_END":
        return this.handleDragEnd(event);

      case "IDLE_TICK": {
        if (this.state !== "idle") return [];
        this.idleTickCount += 1;
        const idleElapsed = event.now - this.idleSince;

        // Rest nudge: only after long continuous idle (2+ hours)
        const restAfter = this.manifest.behaviors.restNudgeAfterMs;
        if (idleElapsed > restAfter) {
          this.state = "rest_nudge";
          return [
            ...this.play(this.randomPick(this.manifest.behaviors.restNudge)),
            { type: "SHOW_BUBBLE", text: this.randomMessage(this.manifest.behaviors.restNudgeMessages) }
          ];
        }

        // Normal idle: occasional switch to idle variant
        const picked = this.randomIdle();
        if (picked === this.currentAnimation) return [];
        // If the picked animation is non-looping, enter reacting so ANIMATION_DONE can return to idle_sit
        const def = this.manifest.animations[picked];
        if (def && !def.loop) {
          this.state = "reacting";
        }
        return this.play(picked);
      }

      case "TIME_TICK": {
        return this.handleTimeTick(event.hour, event.weekday);
      }

      case "WORK_SESSION_LONG":
        if (this.state !== "idle") return [];
        this.state = "rest_nudge";
        this.idleSince = event.now;
        return [
          ...this.play(this.randomPick(this.manifest.behaviors.restNudge)),
          { type: "SHOW_BUBBLE", text: "坐了这么久，起来活动一下吧！" }
        ];

      case "USER_INACTIVE":
        this.state = "idle";
        return this.play("sleep");

      case "WINDOW_EDGE_NEAR":
        if (this.state !== "idle") return [];
        // 30s cooldown to avoid spam when window stays at edge
        if (Date.now() - this.lastEdgeReaction < 30_000) return [];
        this.lastEdgeReaction = Date.now();
        this.state = "reacting";
        return [
          ...this.play("look_around"),
          { type: "SHOW_BUBBLE", text: "嗯？这边是边缘了…" }
        ];

      case "ANIMATION_DONE":
        if (this.state === "reacting" || this.state === "rest_nudge") {
          return this.enterIdle(Date.now());
        }
        return [];
    }
  }

  // ─── event handlers ────────────────────────────────────────

  private handleBoot(event: { now: number }): PetAction[] {
    this.bootTime = event.now;
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    const actions = this.enterIdle(event.now);

    // Morning greeting: only once per day, between 6-10 am
    const greetingMsg = this.manifest.behaviors.morningGreetingMessage;
    if (greetingMsg && this.lastGreetingDate !== today && hour >= 6 && hour < 10) {
      this.lastGreetingDate = today;
      return [
        ...actions,
        ...this.play("wave_hello"),
        { type: "SHOW_BUBBLE", text: greetingMsg }
      ];
    }

    return actions;
  }

  private handleFirstMeeting(): PetAction[] {
    if (this.state !== "idle") return [];
    const message = this.manifest.behaviors.firstMeetingMessage;
    if (!message) return [];
    this.state = "reacting";
    return [
      ...this.play("wave_hello"),
      { type: "SHOW_BUBBLE", text: message }
    ];
  }

  private handleClick(): PetAction[] {
    this.state = "reacting";
    const anim = this.randomPick(this.manifest.behaviors.onClick);
    const actions: PetAction[] = [...this.play(anim)];

    // 30-50% chance of showing a short click-feedback bubble
    const chance = this.manifest.behaviors.clickBubbleChance ?? 0.4;
    const messages = this.manifest.behaviors.clickMessages;
    if (messages && messages.length > 0 && Math.random() < chance) {
      actions.push({ type: "SHOW_BUBBLE", text: this.randomMessage(messages) });
    }

    return actions;
  }

  private handleClickRapid(count: number): PetAction[] {
    this.state = "reacting";
    const rapidPool = this.manifest.behaviors.rapidClickPool ?? ["stretch"];
    const rapidMsgs = this.manifest.behaviors.rapidClickMessages ?? ["喵喵喵！"];
    const animation = this.randomPick(rapidPool);

    // Tier 3: 20+ clicks — full protest mode
    if (count >= 20) {
      return [
        ...this.play(animation),
        { type: "SET_MOOD", mood: "grumpy" as const },
        { type: "SHOW_BUBBLE", text: "够了够了！再戳我要生气了！" }
      ];
    }

    // Tier 2: 10-19 clicks — intense reaction
    if (count >= 10) {
      return [
        ...this.play(animation),
        { type: "SET_MOOD", mood: "excited" as const },
        { type: "SHOW_BUBBLE", text: "喵喵喵！！" }
      ];
    }

    // Tier 1: 2-9 clicks — playful reaction
    return [
      ...this.play(animation),
      { type: "SET_MOOD", mood: "excited" as const },
      { type: "SHOW_BUBBLE", text: this.randomMessage(rapidMsgs) }
    ];
  }

  private handleDragEnd(event: { now: number; movedPx?: number }): PetAction[] {
    const baseActions = this.enterIdle(event.now);

    // If dragged a significant distance, give extra feedback
    const minMovePx = 80;
    if (event.movedPx && event.movedPx > minMovePx) {
      // Set reacting so ANIMATION_DONE can transition back to idle
      this.state = "reacting";
      const messages = this.manifest.behaviors.dragEndMessages ?? ["这里也不错～"];
      const pool = this.manifest.behaviors.dragEndAnimations ?? ["look_around", "wave_hello"];
      const feedbackAnim = this.randomPick(pool);
      return [
        ...baseActions,
        ...this.play(feedbackAnim),
        { type: "SHOW_BUBBLE", text: this.randomMessage(messages) }
      ];
    }

    return baseActions;
  }

  private handleTimeTick(hour: number, weekday: number): PetAction[] {
    if (this.state !== "idle") return [];
    const today = new Date().toISOString().slice(0, 10);

    // Reset shownNudges when date changes
    if (this.currentDate !== today) {
      this.shownNudgesToday.clear();
      this.currentDate = today;
    }

    const nudgeKey = `${today}-${hour}`;

    // Meal-time nudge: only once per time slot per day
    const mealMessages = this.manifest.behaviors.mealMessages;
    if (mealMessages && !this.shownNudgesToday.has(nudgeKey)) {
      const msg = mealMessages[hour];
      if (msg) {
        this.shownNudgesToday.add(nudgeKey);
        this.state = "reacting";
        return [
          ...this.play("wave_hello"),
          { type: "SHOW_BUBBLE", text: msg }
        ];
      }
    }

    // Late-night nudge: once per day (date-prefixed key ensures daily reset)
    const lateNightHour = this.manifest.behaviors.lateNightAfterHour;
    const lateNightMsg = this.manifest.behaviors.lateNightMessage;
    const lateNightKey = `${today}-late-night`;
    if (lateNightHour && lateNightMsg && hour === lateNightHour && !this.shownNudgesToday.has(lateNightKey)) {
      this.shownNudgesToday.add(lateNightKey);
      this.state = "reacting";
      return [
        ...this.play("sleep"),
        { type: "SHOW_BUBBLE", text: lateNightMsg }
      ];
    }

    return [];
  }

  // ─── helpers ────────────────────────────────────────────────

  /** Check if we're still in the post-boot warm-up period. */
  private isWarmUp(now?: number): boolean {
    const warmUpMs = this.manifest.behaviors.warmUpDurationMs ?? 180_000;
    const ref = now ?? Date.now();
    return this.bootTime > 0 && (ref - this.bootTime) < warmUpMs;
  }

  private enterIdle(now: number): PetAction[] {
    this.state = "idle";
    this.idleSince = now;
    this.idleTickCount = 0;
    return this.play(this.manifest.behaviors.default);
  }

  private play(animation: PetAnimationName): PetAction[] {
    if (animation === this.currentAnimation) return [];
    this.currentAnimation = animation;
    return [{ type: "PLAY_ANIMATION", animation }];
  }

  private randomPick(list: PetAnimationName[]): PetAnimationName {
    if (list.length === 0) return this.currentAnimation ?? this.manifest.behaviors.default;
    const candidates = list.length > 1
      ? list.filter((a) => a !== this.currentAnimation)
      : list;
    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx];
  }

  private randomMessage(list: string[]): string {
    if (list.length === 0) return "";
    return list[Math.floor(Math.random() * list.length)];
  }

  /** Pick from the idle pool.
   *  During warm-up: switch more frequently (every N ticks, default 3).
   *  After warm-up: configurable, defaulting to every 8 ticks. */
  private randomIdle(): PetAnimationName {
    const pool = this.manifest.behaviors.idlePool;
    if (pool.length === 0) return this.currentAnimation ?? this.manifest.behaviors.default;

    const everyN = this.isWarmUp()
      ? (this.manifest.behaviors.warmUpIdleEveryN ?? 3)
      : (this.manifest.behaviors.idleEveryN ?? 8);

    if (this.idleTickCount % everyN !== 0) return this.currentAnimation ?? this.manifest.behaviors.default;
    return this.randomPick(pool);
  }
}
