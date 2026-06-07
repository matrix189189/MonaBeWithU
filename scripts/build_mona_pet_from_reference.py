#!/usr/bin/env python3
"""Build a first-pass Mona Codex pet atlas from the supplied multi-pose sheet."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

CELL_W = 192
CELL_H = 208
ATLAS_W = CELL_W * 8
ATLAS_H = CELL_H * 9

ROW_SPECS = [
    ("idle", 0, 6),
    ("running-right", 1, 8),
    ("running-left", 2, 8),
    ("waving", 3, 4),
    ("jumping", 4, 5),
    ("failed", 5, 8),
    ("waiting", 6, 6),
    ("running", 7, 6),
    ("review", 8, 6),
]


def source_mask(source: Image.Image) -> np.ndarray:
    rgb = np.array(source.convert("RGB")).astype(np.int16)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    # The supplied source uses a high-value neutral checkerboard background.
    background = ((mx - mn) <= 5) & (mn >= 236)
    return ~background


def clear_transparent_rgb(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = bytearray(rgba.tobytes())
    for index in range(0, len(data), 4):
        if data[index + 3] == 0:
            data[index] = 0
            data[index + 1] = 0
            data[index + 2] = 0
    return Image.frombytes("RGBA", rgba.size, bytes(data))


def crop_with_alpha(source: Image.Image, mask: np.ndarray, bbox: tuple[int, int, int, int]) -> Image.Image:
    x1, y1, x2, y2 = bbox
    crop = source.crop((x1, y1, x2, y2)).convert("RGBA")
    alpha = (mask[y1:y2, x1:x2].astype(np.uint8) * 255)
    crop.putalpha(Image.fromarray(alpha, "L"))
    return clear_transparent_rgb(crop)


def keep_largest_alpha_component(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = np.array(rgba.getchannel("A"))
    h, w = alpha.shape
    visited = np.zeros((h, w), dtype=bool)
    best: list[tuple[int, int]] = []

    for y in range(h):
        for x in range(w):
            if alpha[y, x] <= 16 or visited[y, x]:
                continue
            stack = [(x, y)]
            visited[y, x] = True
            pixels: list[tuple[int, int]] = []
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and alpha[ny, nx] > 16:
                        visited[ny, nx] = True
                        stack.append((nx, ny))
            if len(pixels) > len(best):
                best = pixels

    if not best:
        return rgba
    kept = np.zeros((h, w), dtype=np.uint8)
    for x, y in best:
        kept[y, x] = alpha[y, x]
    rgba.putalpha(Image.fromarray(kept, "L"))
    return clear_transparent_rgb(rgba)


def load_component(run_dir: Path, idx: int) -> Image.Image:
    return Image.open(run_dir / "source-components" / f"pose-{idx:02d}.png").convert("RGBA")


def fit_frame(sprite: Image.Image, scale: float = 1.0, x_offset: int = 0, y_offset: int = 0) -> Image.Image:
    frame = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    bbox = sprite.getbbox()
    if bbox is None:
        return frame
    sprite = sprite.crop(bbox)
    max_w = CELL_W - 12
    max_h = CELL_H - 12
    base_scale = min(max_w / sprite.width, max_h / sprite.height, 1.0)
    final_scale = base_scale * scale
    if abs(final_scale - 1.0) > 0.001:
        sprite = sprite.resize(
            (max(1, round(sprite.width * final_scale)), max(1, round(sprite.height * final_scale))),
            Image.Resampling.LANCZOS,
        )
    left = (CELL_W - sprite.width) // 2 + x_offset
    top = CELL_H - sprite.height - 8 + y_offset
    frame.alpha_composite(sprite, (left, top))
    return frame


def row_strip(frames: list[Image.Image]) -> Image.Image:
    strip = Image.new("RGBA", (CELL_W * len(frames), CELL_H), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * CELL_W, 0))
    return strip


def save_row(run_dir: Path, state: str, frames: list[Image.Image]) -> None:
    frame_dir = run_dir / "frames" / state
    frame_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames):
        clear_transparent_rgb(frame).save(frame_dir / f"{index:02d}.png")
    (run_dir / "decoded").mkdir(parents=True, exist_ok=True)
    clear_transparent_rgb(row_strip(frames)).save(run_dir / "decoded" / f"{state}.png")


def main() -> None:
    run_dir = Path(__file__).resolve().parents[1] / "runs" / "hatch-mona-from-reference"
    source_path = Path("/Users/simon/Downloads/ig_09ef403735409482016a255117821c8199903651b779f4ed61.png")
    source = Image.open(source_path).convert("RGBA")
    mask = source_mask(source)

    poses: dict[int | str, Image.Image] = {
        idx: load_component(run_dir, idx)
        for idx in range(41)
    }
    poses["walk-a"] = keep_largest_alpha_component(crop_with_alpha(source, mask, (1171, 248, 1362, 393)))
    poses["walk-b"] = keep_largest_alpha_component(crop_with_alpha(source, mask, (1328, 248, 1520, 393)))

    # Use a calm front pose as canonical base for the hatch-pet run.
    base = fit_frame(poses[36], scale=1.0)
    (run_dir / "decoded").mkdir(parents=True, exist_ok=True)
    (run_dir / "references").mkdir(parents=True, exist_ok=True)
    clear_transparent_rgb(base).save(run_dir / "decoded" / "base.png")
    clear_transparent_rgb(base).save(run_dir / "references" / "canonical-base.png")

    def f(key: int | str, scale: float = 1.0, x: int = 0, y: int = 0) -> Image.Image:
        return fit_frame(poses[key], scale=scale, x_offset=x, y_offset=y)

    rows: dict[str, list[Image.Image]] = {
        "idle": [
            f(36, 0.98, y=1),
            f(37, 1.00, y=0),
            f(38, 1.00, y=0),
            f(37, 1.00, y=0),
            f(36, 0.98, y=1),
            f(1, 0.98, y=1),
        ],
        "running-right": [
            f(10, 0.93, x=-3),
            f(14, 0.95, x=-1),
            f("walk-a", 0.95, x=1),
            f(14, 0.95, x=2),
            f(10, 0.93, x=-2),
            f(14, 0.95, x=0),
            f("walk-a", 0.95, x=2),
            f(14, 0.95, x=2),
        ],
        "waving": [
            f(32, 0.98),
            f(33, 0.98),
            f(3, 1.02),
            f(33, 0.98),
        ],
        "jumping": [
            f(16, 0.70, y=-2),
            f(18, 0.95, y=2),
            f(2, 0.92, y=-22),
            f(9, 0.95, y=-8),
            f(16, 0.70, y=-2),
        ],
        "failed": [
            f(12, 0.96),
            f(13, 0.92),
            f(23, 0.88),
            f(24, 0.90),
            f(40, 0.96),
            f(39, 0.98),
            f(7, 0.88),
            f(8, 0.88),
        ],
        "waiting": [
            f(0, 0.98),
            f(2, 0.98),
            f(9, 0.98),
            f(3, 0.98),
            f(5, 0.98),
            f(33, 0.96),
        ],
        "running": [
            f(28, 0.94),
            f(25, 0.96),
            f(26, 0.96),
            f(30, 0.94),
            f(31, 0.94),
            f(29, 0.96),
        ],
        "review": [
            f(5, 0.98),
            f(32, 0.98),
            f(33, 0.98),
            f(34, 0.98),
            f(35, 0.98),
            f(38, 0.98),
        ],
    }
    rows["running-left"] = [ImageOps.mirror(frame) for frame in rows["running-right"]]

    for state, _row, count in ROW_SPECS:
        save_row(run_dir, state, rows[state][:count])

    atlas = Image.new("RGBA", (ATLAS_W, ATLAS_H), (0, 0, 0, 0))
    for state, row, count in ROW_SPECS:
        for col, frame in enumerate(rows[state][:count]):
            atlas.alpha_composite(frame, (col * CELL_W, row * CELL_H))

    (run_dir / "final").mkdir(parents=True, exist_ok=True)
    clear_transparent_rgb(atlas).save(run_dir / "final" / "spritesheet.png")
    clear_transparent_rgb(atlas).save(
        run_dir / "final" / "spritesheet.webp",
        format="WEBP",
        lossless=True,
        quality=100,
        method=6,
        exact=True,
    )

    manifest_rows = []
    for state, _row, count in ROW_SPECS:
        manifest_rows.append(
            {
                "state": state,
                "frames": [
                    str((run_dir / "frames" / state / f"{index:02d}.png").resolve())
                    for index in range(count)
                ],
                "method": "components",
            }
        )
    (run_dir / "frames" / "frames-manifest.json").write_text(
        json.dumps({"ok": True, "rows": manifest_rows}, indent=2) + "\n",
        encoding="utf-8",
    )

    jobs_path = run_dir / "imagegen-jobs.json"
    jobs = json.loads(jobs_path.read_text(encoding="utf-8"))
    completed_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    for job in jobs["jobs"]:
        job["status"] = "complete"
        job["completed_at"] = completed_at
        job["source_path"] = str((run_dir / job["output_path"]).resolve())
        job["generation_note"] = "Built deterministically from the supplied multi-pose Mona reference sheet."
    jobs_path.write_text(json.dumps(jobs, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "atlas": str((run_dir / "final" / "spritesheet.webp").resolve()),
                "frames": str((run_dir / "frames").resolve()),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
