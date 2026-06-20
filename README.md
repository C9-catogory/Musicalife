# Musicalife Mandala Starworld v8

**Musicalife：音乐曼陀罗星河版**

一个双语、无外部依赖、可直接部署到 GitHub Pages / Netlify 的静态互动音乐世界 demo。

## Core idea

Musicalife is not only a music knowledge site. It is a visual starworld for exploring music, mathematics, life, resonance, care and creation.

在这里：

- 音乐是底层法则。
- 知识是星星。
- 数学是看见音乐的工具。
- 生命是会呼吸的乐器。
- 创作是找到自己的 harmony。
- 疗愈来自连接、节奏、边界、理解与共鸣。

## What is inside

- 星门入口 / Music mandala gate
- 宇宙港口首页 / Starworld harbor
- 声之塔小游戏主线 / Odyssey tower
- 银河星盘 / Knowledge atlas
- 毕达哥拉斯花园 / Pythagorean ratio garden
- 人声宇宙 / Voice cosmos
- 生活星系 / Life and care galaxy
- 生命共振室 / Resonance chamber
- 创作曼陀罗 / Creation mandala
- 图书馆与音乐推荐 / Library and listening gates

## File structure

```text
index.html
styles.css
data.js
animations.js
app.js
README.md
```

This version separates data, animations and app logic so the project can keep growing without becoming a single fragile script.

## Local preview

```bash
python -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Deploy

Upload all files in this folder to the root of your GitHub Pages / Netlify site.

If the old version still appears, hard refresh the browser or clear deployment cache.
