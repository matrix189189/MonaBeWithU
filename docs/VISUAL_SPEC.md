# Adult Ragdoll Visual Spec

## North Star

The pet should read as an adult ragdoll cat within five seconds: blue eyes, soft long fur, colorpoint face and ears, fluffy tail, calm posture, slow affectionate motion.

## Stage 1 Motion Pack

All animations use the same canvas size, anchor, scale, light direction, fur pattern, and body proportions.

| Animation | Purpose | Suggested FPS | Loop |
| --- | --- | ---: | --- |
| `idle_sit` | Sitting breathing baseline | 8 | yes |
| `idle_lie` | Lying quietly | 8 | yes |
| `sleep` | Sleeping with subtle breathing | 6 | yes |
| `blink_slow` | Soft click/idle expression | 10 | no |
| `tail_sway` | Independent tail life | 8 | yes |
| `look_up` | Click reaction | 10 | no |
| `stretch` | Weak rest nudge | 10 | no |
| `walk_short` | Short reposition motion | 12 | no |

## Asset Rules

- Use one canvas size for the whole sheet. Stage 1 default: `512x512` per frame.
- Use a stable floor/body anchor. Stage 1 default: `{ "x": 0.5, "y": 0.92 }`.
- Keep transparent background and clean alpha edges.
- Keep the same adult body mass across every animation.
- Avoid kitten proportions, huge anime eyes, human gestures, and exaggerated facial expressions.
- Motion should be slow, soft, and low-amplitude.

## Future Photo Intake

Ask the user for:

- 5 front-face photos
- 3 left profile photos
- 3 right profile photos
- 3 sitting full-body photos
- 3 lying photos
- 5 standing/walking photos
- 3 tail detail photos
- 3 eye/face colorpoint closeups

## Future Video Intake

Ask for short, well-lit fixed-camera clips:

- Walking
- Sitting down
- Lying down
- Stretching
- Grooming
- Yawning
- Tail swaying

Use video as timing and pose reference first. Do not treat motion capture as an automatic animation generator.
