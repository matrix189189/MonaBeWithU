# Stage 1 QA Checklist

## Smoke Test

- Start the app.
- Confirm a transparent borderless desktop pet window appears.
- Confirm the pet remains above normal app windows.
- Drag the pet around the screen.
- Click without dragging and confirm a reaction animation.
- Use tray menu to quit.

## Animation

- `idle_sit` loops smoothly.
- `blink_slow` starts and returns to idle.
- `stretch` starts and returns to idle.
- Random idle changes do not flicker.
- The body anchor does not jump between frames.

## Behavior

- No modal reminder appears during Stage 1.
- Weak rest nudge uses `stretch` or `look_up` first.
- Runtime has one scheduler path for idle ticks.
- Drag state interrupts animation cleanly and recovers after drop.

## Visual

- Reads as an adult ragdoll cat.
- Blue eyes, colorpoint face/ears, fluffy tail are visible.
- Transparent edge is clean.
- No black or white halo appears around the cat.

## Performance

- Idle CPU target: below 3-5% where possible.
- Memory target: below 300 MB in Stage 1.
- App should survive a 1 hour local run without crashing.
