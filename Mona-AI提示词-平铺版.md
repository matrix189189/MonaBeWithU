# Mona 桌宠 AI 画图提示词（平铺版/Spritesheet 风格）

> **V2 更新**：已吸收 ig_09ef403735...png 参考图的完整视觉特征
> 参考风格：Yaya 平铺版精灵图 + Mona 品种参考姿势图
> 目标：生成 Mona（布偶猫，Seal Point）的半写实插画风精灵图序列
> 生成时间：2026-06-07 | V2 更新时间：2026-06-07

---

## 视觉风格校准（基于参考图实测）

| 特征 | V1（仅Yaya数据） | **V2（参考图+数据融合）** |
|------|------------|---------------------------|
| 风格层次 | 纯扁平插画 | **半写实插画**：扁平基底 + 柔和体感阴影 |
| 轮廓线 | 纯黑色 `#000` | **深棕描边** — 非纯黑，线条有粗细变化 |
| 体感表现 | 完全无阴影 | **柔和投影**：身体下方有圆形阴影，侧身有轻微明暗 |
| 毛发质感 | 纯色块 | **有简单毛流暗示**：不是照片级毛发，但有纹理方向感 |
| 眼睛处理 | 纯色蓝 | **宝石蓝+白色高光点**，情绪变化时瞳孔大小不同 |
| 鼻子 | 纯粉 | **粉色+鼻头高光**，有立体感 |
| 身体比例 | 大头Q版 | **写实比例**：头约占1/3，和Mona照片一致 |
| 配色基调 | 暖奶油白 | **奶油白+深巧克力棕** 双色对比，重点色是深棕不是黑色 |

---

## 全局风格关键词（V2 已对齐参考图）

```
semi-realistic illustration, ragdoll cat digital art, soft cel-shading with
gentle body shadows, warm cream-white fur base, dark chocolate brown seal point
markings on ears face and tail, large sapphire blue eyes with white highlight dot,
pink nose with subtle highlight, visible white whiskers, light fur texture hints,
subtle round drop shadow beneath body on ground, clean dark brown outline with
variable line weight, transparent background PNG, kawaii desktop pet sprite sheet,
consistent character design, pastel-soft overall tone, between flat illustration
and light realism
```

## 全局角色描述（Mona 专属，每帧必用）

```
Mona the seal point ragdoll cat, large round sapphire blue eyes with white catchlight
highlight, soft pink nose with gentle pink tone, pink paw pads on all four paws,
cream-white fur on chest belly chin and legs, rich dark chocolate brown seal point
coloring on both ears, full facial mask, and fluffy tail tip, plush thick neck ruff (frill)
around chest, elegant white whiskers spreading outward, medium-large ragdoll body with
balanced proportions (head ~1/3 of body height), long bushy tail with visible fur texture,
overall gentle sweet expression, between cute and elegant
```

## 全局负面提示词（V2 更新）

```
negative: pure flat design with no shading, pure black outlines, realistic photo,
3D CGI render, hyper-realistic fur texture, orange tabby cat, grey cat, black cat,
pink-eyed albino cat, exaggerated chibi proportions, deformed face, extra limbs,
different eye color (not blue), no nose, asymmetric face, blurry, low resolution,
pixelated, text, watermark, logo, complex background, dark moody lighting,
neon colors, high saturation, cartoon network style, anime style with giant eyes,
meme style, sketchy unfinished lines, brush strokes visible, messy scribble
```

---

## 动作 1：`idle_sit`（正面待机坐姿 — 4 帧呼吸微动）

> 参考姿势：正面朝前，前爪并拢踩地，尾巴环绕于身体前方，胸部蓬松颈圈明显

### 帧 1 — 基准中性表情 (NEUTRAL)
```
Semi-realistic illustration, Mona the seal point ragdoll cat sitting upright facing
directly forward, front paws together on ground, fluffy tail curled around front of body,
NEUTRAL expression: sapphire blue eyes fully open with white highlight dot, pink nose,
mouth closed in gentle neutral line, ears upright and relaxed, full seal point mask visible
(dark brown face, ears, tail tip), cream-white chest fluff (neck ruff) prominent,
white whiskers, clean dark brown outline, soft cel-shading on body sides, subtle round
drop shadow beneath body on ground, warm cream-beige-beige palette, transparent background,
kawaii desktop pet sprite, 192x200 pixel frame
```

### 帧 2 — 呼吸缩小 (SOFT STRETCH feel)
```
Same pose, Mona sitting facing forward, body slightly smaller scale (exhale),
head title 5 degrees to left, expression slightly softer (ATTENTIVE→neutral),
eyes relaxed but still open, tiny content smile hint, same character design,
same dark brown outline, same soft cel-shading, same drop shadow, transparent background,
consistent with frame 1 layout
```

### 帧 3 — 呼吸放大
```
Same pose, Mona sitting facing forward, body slightly larger scale (inhale),
head title 5 degrees to right, eyes wide bright and alert (ATTENTIVE level),
ears perked slightly forward, same character design, transparent background,
consistent with frame 1
```

### 帧 4 — 耳朵微动变体
```
Same pose, Mona sitting facing forward, one ear tilted slightly (ear flick),
bright attentive blue eyes with catchlight, very tiny pink tongue tip showing,
playful detail, same character design, transparent background
```

---

## 动作 2：`idle_lie`（正面趴姿 — 4 帧）

> 参考姿势：胸腹贴地趴下，前爪向前平伸，头抬起朝前看

### 帧 1 — 趴姿基准
```
Semi-realistic illustration, Mona the seal point ragdoll cat lying down flat
facing forward, head raised, front paws stretched forward on ground side by side,
sapphire blue eyes looking directly at viewer, NEUTRAL relaxed expression,
dark chocolate seal point ears and mask, cream-white chest and chin visible,
fluffy tail visible behind body, clean dark brown outline with subtle line weight,
soft shadow beneath body, warm cream palette, transparent background, desktop pet sprite
```

### 帧 2 — 放松眯眼
```
Same lying pose, head now resting on front paws, eyes half-closed in relaxed
contentment (SLEEPY expression level), small gentle smile, tail tip slightly curled,
same character design, same shading, transparent background
```

### 帧 3 — 警觉抬头
```
Same lying pose, head suddenly lifted up higher, eyes wide open bright and alert
(ATTENTIVE), ears perked fully forward, curious expression, same character design,
transparent background
```

### 帧 4 — 伸爪卖萌
```
Same lying pose, one front paw stretched further forward with toes spread showing
pink paw pads, cute playful gesture, bright eyes, same character design, transparent bg
```

---

## 动作 3：`sleep`（蜷缩睡觉 — 3 帧缓慢起伏）

> 参考姿势：侧面蜷曲成一团，尾巴包住身体，眼睛闭合为弧形线

### 帧 1 — 侧蜷睡姿基准
```
Semi-realistic illustration, Mona the seal point ragdoll cat curled up sleeping,
pure side view, body in compact curled ball, eyes fully closed shown as two downward-
curved dark brown eyelid lines, peaceful SLEEPY smile, whiskers relaxed and drooping
downward, all four paws tucked close to body, fluffy tail wrapped around body with
dark tip visible, cream-white belly area partially visible, soft warm shadows on
body underside, subtle round drop shadow, warm palette, clean dark brown outline,
transparent background, sleeping kawaii cat sprite
```

### 帧 2 — 吸气微放大
```
Same sleeping curled pose, body very slightly larger (breathing in),
belly gently expanded, same peaceful closed-eye SLEEPY expression,
same character design, same shading, transparent background
```

### 帧 3 — 呼气微缩小+爪动
```
Same sleeping curled pose, body very slightly smaller (breathing out),
one front paw twitching faintly (dreaming), same peaceful SLEEPY expression,
same character design, transparent background
```

---

## 动作 4：`blink_slow`（慢速眨眼 — 共 5 帧完整序列）

> 参考：NEUTRAL→半闭→全闭→半闭→NEUTRAL 完整循环

### 帧 1 — 全睁 NEUTRAL
```
Semi-realistic illustration, Mona seal point ragdoll cat face close-up portrait,
NEUTRAL expression: large round sapphire blue eyes fully open with bright white
catchlight highlight dot, pink nose with subtle highlight, mouth closed in gentle
neutral line, white whiskers spread evenly outward, dark chocolate seal point mask,
fluffy round cheeks, soft warm shading on cheeks, clean dark brown outline,
transparent background, face sprite for blink animation
```

### 帧 2 — 半闭 (BLINK 过度 1)
```
Same face close-up, eyes half-closed (slow blink midpoint), upper eyelids now
covering top half of blue irises, catchlight still faintly visible, soft relaxed
BLINK expression, same character design, transparent background
```

### 帧 3 — 全闭 (BLINK 完成)
```
Same face close-up, eyes fully closed, shown as two downward-curved dark brown
eyelid lines, relaxed peaceful expression, whiskers slightly drooped,
same character design, transparent background
```

### 帧 4 — 半闭 (BLINK 恢复)
```
Same face close-up, eyes half-open (waking from blink), upper eyelids lifting
to reveal lower half of blue irises, catchlight returning, same character design,
transparent background
```

### 帧 5 — 全睁 (回 NEUTRAL，同帧1但微变)
```
Same face close-up, eyes fully open again, NEUTRAL expression restored,
very subtle difference from frame 1 (eye catchlight position shifted 1px),
same character design, transparent background
```

---

## 动作 5：`tail_sway`（尾巴轻摇 — 4 帧）

> 侧面/斜侧面视角，身体完全固定，仅尾巴位置/角度变化

### 帧 1 — 尾巴自然下垂
```
Semi-realistic illustration, Mona seal point ragdoll cat sitting pose,
three-quarter view, one large sapphire blue eye visible in profile,
tail hanging down naturally, dark seal point face mask, cream-white body,
clean dark brown outline, soft body shading, drop shadow, transparent background
```

### 帧 2 — 尾巴左摆
```
Same pose identical body, tail now swayed gently to the left side,
everything else unchanged, transparent background
```

### 帧 3 — 尾巴右摆
```
Same pose identical body, tail now swayed gently to the right side,
everything else unchanged, transparent background
```

### 帧 4 — 尾巴上翘
```
Same pose identical body, tail raised up and tip curled (happy/curious),
everything else unchanged, transparent background
```

---

## 动作 6：`look_up`（抬头看上方 — 3 帧）

> 参考：头后仰，眼睛朝上注视，颈部拉长可见

### 帧 1 — 基准抬头
```
Semi-realistic illustration, Mona seal point ragdoll cat sitting facing forward,
head tilted upward gazing at something above frame, sapphire blue eyes looking up,
white catchlight prominent, curious ATTENTIVE expression, neck visible and stretched,
pink nose positioned higher, dark seal point ears, cream-white neck fluff,
soft shadow beneath chin, clean dark brown outline, transparent background,
kawaii desktop pet sprite
```

### 帧 2 — 惊讶好奇
```
Same upward-looking pose, eyes even wider open with larger catchlight, mouth
slightly open (tiny surprised "o" shape), one front paw raised as if reaching
upward, ears fully forward, same character design, transparent background
```

### 帧 3 — 温柔凝视回落
```
Same upward-looking pose but head slightly lower, eyes softened (gentle focus),
small sweet smile, tail tip twitching, same character design, transparent background
```

---

## 动作 7：`stretch`（伸懒腰 — 4 帧）

> 参考：前爪前伸、身体拉长、屁股翘起、尾巴上翘

### 帧 1 — 前伸懒腰
```
Semi-realistic illustration, Mona seal point ragdoll cat in full stretching pose,
front paws stretched far forward on ground, chest lowered, back elongated with
rear end raised slightly, eyes closed enjoying the stretch (SOFT STRETCH expression),
fluffy tail raised up, seal point coloring on back, cream-white belly visible,
clean dark brown outline, soft body shading, drop shadow, transparent background,
kawaii desktop pet stretch sprite
```

### 帧 2 — 弓背回缩
```
Same character, now back arched upward (finishing stretch), front paws pulled in
closer to body, head lowered, eyes half-closed satisfied, same character design,
transparent background
```

### 帧 3 — 仰面露肚皮（经典动作）
```
Semi-realistic illustration, Mona seal point ragdoll cat lying on back,
belly fully exposed upward, all four paws relaxed in the air with pink paw pads
clearly visible, sapphire blue eyes looking at viewer, cute playful ATTENTIVE
expression, dark seal point ears and face, cream-white fluffy belly prominent,
clean dark brown outline, soft body shading, transparent background
```

### 帧 4 — 露肚皮蹬腿
```
Same lying-on-back pose, one hind paw kicking playfully in the air, tiny pink
tongue tip showing at corner of mouth, happy playful expression, same design,
transparent background
```

---

## 动作 8：`walk_short`（侧面行走 — 4 帧循环）

> 参考：完全侧面视角，身体水平，四条腿交替迈出

### 帧 1 — 左前腿迈出
```
Semi-realistic illustration, Mona seal point ragdoll cat walking, pure right-facing
side view, left front paw stepping forward extended, right front paw back, right hind
paw forward (walk cycle contact pose), dark seal point face mask and one sapphire
blue eye visible in profile, tail horizontal behind body, fluffy body slightly
compressed in stride, clean dark brown outline, soft body shading, drop shadow on
ground, warm palette, transparent background, walk sprite frame 1
```

### 帧 2 — 四肢收拢
```
Same side view walking, all four paws gathered close under body (passing pose),
body slightly higher in profile, tail still horizontal, same character design,
transparent background, walk frame 2
```

### 帧 3 — 右前腿迈出（镜像帧1）
```
Same side view, right front paw now stepping forward (mirror of frame 1 contact),
left front paw back, leg positions swapped, same character design,
transparent background, walk frame 3
```

### 帧 4 — 四肢收拢（镜像帧2）
```
Same side view walking, all four paws gathered under body again, slightly different
tail angle for visual variety, same character design, transparent background,
walk frame 4
```

---

## 表情状态参考表（基于参考图）

生成所有帧时，表情应遵循以下规则：

| 表情状态 | 眼睛 | 耳朵 | 嘴巴 | 胡须 | 适用场景 |
|----------|------|------|------|------|---------|
| **NEUTRAL** | 全睁，圆，有高光 | 竖起，放松 | 闭合，水平 | 自然散开 | idle_sit, idle_lie, walk_short |
| **ATTENTIVE** | 更睁大，高光更大 | 竖起，前倾 | 闭合/微张 | 微上翘 | look_up, 互动帧 |
| **SLEEPY** | 半眯，高光小或消失 | 略下垂 | 微弧微笑 | 下垂 | sleep, idle_lie 放松帧 |
| **BLINK** | 半闭→全闭→半闭循环 | 放松 | 闭合 | 略下垂 | blink_slow |

---

## 精灵图布局规划

参考 Yaya 的 8列 布局 + 参考图的 8 动作映射：

```
列1      列2      列3      列4      列5      列6      列7      列8
idle_sit_1  sit_2  sit_3  sit_4  lie_1  lie_2   lie_3   lie_4
sleep_1 sleep_2 sleep_3  -    blink_1 blink_2 blink_3 blink_4 blink_5
tail_1  tail_2 tail_3 tail_4 look_1  look_2  look_3  -
stretch_1 str_2  str_3  str_4 walk_1  walk_2  walk_3  walk_4
```

**总帧数**：31 帧（blink 从 3 帧升级到 5 帧）  
**每帧尺寸**：192×200px  
**帧间水平间距**：12px  
**帧间垂直间距**：16px  
**精灵图总尺寸**：~1536×840px（4行×8列）  
**输出格式**：WebP（透明背景）或 PNG

---

## 生成工作流

### 第1步：角色设计基准
用 `idle_sit 帧1` 提示词生成，确认：
- ✅ 奶油白+深巧克力棕 双色对比正确
- ✅ 蓝眼睛有白色高光点
- ✅ 深棕描边（非纯黑）
- ✅ 身体下方有柔和圆形投影
- ✅ 身体侧面有轻微体感阴影

### 第2步：批量生成
- 锁定 seed（Midjourney `--seed X`）
- 同动作全部帧用同一 seed + 微调提示词
- SD 用 IP-Adapter 保持角色一致性

### 第3步：后处理
1. `rembg` 去背景（保透明）
2. 统一尺寸 192×200px，角色居中
3. PS/GIMP 统一投影样式（跨帧一致）
4. ImageMagick 拼合：`montage *.png -tile 8x4 -geometry 192x200+12+16 spritesheet.webp`

---

## 推荐 AI 工具（V2更新）

| 工具 | 推荐设置 | 为什么 |
|------|---------|--------|
| **Midjourney** | `--niji 6 --style expressive --seed X` | 日系插画，半写实感好 |
| **Stable Diffusion** | SDXL + `realisticVision` 或 `dreamshaper` | 控制力最强 |
| **DALL-E 3** | 直接提示词 | 理解力最好 |
| **Leonardo.ai** | AlbedoBase XL + Character Reference | 多帧角色一致性 |

---

*参考来源：Yaya 精灵图像素分析 (1536×1872, RGBA) + ig_09ef4037...png Mona品种参考姿势图 (8 pose + expression guide)*  
*Mona 特征来源：Mona视觉分析报告.md（基于25张真实照片）*
