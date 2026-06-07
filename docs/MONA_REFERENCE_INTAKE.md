# Mona Reference Intake Spec

## Purpose

This document tells the execution agents how to use Mona's real photos and videos to refine a desktop-pet spritesheet without losing the stable Yaya-style readability of the current stage.

The goal is not photoreal animation.

The goal is:

- keep Mona recognizable at small size
- preserve consistent cat identity across frames
- improve face, fur volume, tail, and pose accuracy
- keep the motion pack simple enough for a desktop pet

## Core Principle

Use real media in three different roles:

1. Photos for identity.
2. Videos for motion timing and pose transitions.
3. The existing spritesheet system for final runtime behavior.

Do not ask the model to invent all three at once.

## What To Optimize For

Priority order:

1. Recognizable face and colorpoint pattern
2. Fur volume and silhouette
3. Tail shape and tail motion
4. Body proportions in each pose
5. Small expressions such as blink, look-up, yawn, stretch, sleepy eyes
6. Micro-detail such as whiskers, paw pads, and fur strands

If a tradeoff is needed, prefer clean readability over extra texture detail.

## What Photos Are Most Useful

Collect photos in neutral light, from a fixed camera, with minimal perspective distortion.

### Must-have photos

- 5 front-facing photos
- 3 left profile photos
- 3 right profile photos
- 3 sitting full-body photos
- 3 lying full-body photos
- 3 standing or walking photos
- 3 tail detail photos
- 3 closeups of face, eyes, and colorpoint boundary

### Strongly recommended photos

- one photo with relaxed open eyes
- one photo with sleepy or half-closed eyes
- one photo with a more alert expression
- one photo showing the chest ruff clearly
- one photo showing the tail curled near the body

### Photo quality rules

- Use consistent lighting across the set.
- Avoid heavy backlight.
- Avoid extreme wide-angle distortion.
- Avoid cropped photos that remove the tail or paws unless the crop is a deliberate detail shot.
- Avoid filters that change fur color.
- Prefer sharp focus on the face.

## What Videos Are Most Useful

Short clips are more useful than long clips.

Recommended clips:

- walking toward and across camera
- sitting down
- lying down
- getting up
- turning the head up
- stretching
- grooming
- yawning
- tail swaying while stationary

### Video capture rules

- Fixed camera only.
- Keep the cat fully in frame whenever possible.
- Use even lighting.
- Record at the highest practical frame rate available.
- Keep the background simple.
- Avoid fast camera motion.

## What To Extract From Photos

The visual agent should extract these identity anchors before any sprite work:

- face mask shape
- eye size and eye color
- nose color
- muzzle width
- chest ruff volume
- shoulder width
- back and flank color distribution
- tail thickness, tail color, and tail tip
- paw color and paw pad visibility

This should become a short "Mona identity sheet" before animation mapping starts.

## What To Extract From Video

Use video to capture:

- head pitch and head roll
- shoulder bounce
- paw lift height
- tail follow-through
- body compression when crouching
- body expansion when stretching
- sleep breathing rhythm

Do not expect video to directly produce the final sprite frames.

The best workflow is:

1. Pick pose keyframes from video.
2. Map them to the existing sprite actions.
3. Redraw or correct the sprite poses to keep identity stable.
4. Recheck the full loop for motion consistency.

## Spritesheet Revision Strategy

Use the existing motion pack as the base:

- `idle_sit`
- `idle_lie`
- `sleep`
- `blink_slow`
- `tail_sway`
- `look_up`
- `stretch`
- `walk_short`

Recommended revision order:

1. `idle_sit`
2. `idle_lie`
3. `look_up`
4. `blink_slow`
5. `tail_sway`
6. `stretch`
7. `walk_short`
8. `sleep`

Why this order:

- the first two lock identity
- the middle actions define personality
- the last two are more tolerant of softness and looseness

## How To Use AI Safely

AI is useful for:

- proposing pose variants
- helping align colorpoint boundaries
- suggesting fur mass distribution
- generating rough expression exploration
- filling in low-risk frame transitions

AI is not reliable for:

- maintaining exact Mona identity across all frames automatically
- preserving the same eye shape and mask shape without review
- generating a complete production-ready sheet with no manual pass

So the workflow should be:

1. use AI to explore
2. choose the best candidate
3. manually normalize
4. validate against the reference photos

## What To Avoid

- do not over-sharpen fur into noisy detail
- do not turn the cat into a plush toy with no structure
- do not exaggerate the eyes into anime proportions
- do not flatten the chest ruff into a blob
- do not change the tail color distribution between frames
- do not let the face mask drift from frame to frame
- do not introduce new costume-like features
- do not rely on motion capture as an automatic final output

## Agent Handoff Checklist

Before sprite revision begins, the intake agent should produce:

- a folder of source media
- a one-page Mona identity summary
- a pose reference sheet for front, side, sit, lie, stretch, look-up, walk, sleep
- a list of the best 8 to 12 reference images
- a list of the best 3 to 5 reference clips
- a note on which details must stay unchanged

## Review Criteria

A good Mona sprite revision passes these checks:

- reads as Mona in under five seconds
- face remains consistent at small size
- fur mass feels soft and full
- colorpoint boundary is stable
- tail identity stays recognizable
- motion feels calm and companionable
- the pet still works as a desktop resident, not as an over-animated character

## Practical Recommendation

If you only have time for one improvement path, do this:

1. choose 10 to 20 strong photos
2. choose 3 to 5 short videos
3. build the Mona identity sheet
4. revise only the highest-value sprite frames first
5. leave fine-grained motion polish for later

