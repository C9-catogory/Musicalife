# Musicalife Starworld v6

一个探索音乐之美的可视化星海。  
A visual starworld for exploring the beauty of music.

## This version focuses on

- 恢复“像音乐星河小游戏”一样的整体气质，而不是普通资料页。
- 强化稳定入口：星门可点击，进入后始终有可见内容。
- 背景升级：星空、闪烁星点、极光、流星，整体更梦幻。
- 首页重构为“宇宙港口”：开始航行 / 知识星盘 / 人声宇宙 / 生活星系 / 世界音乐博物馆 / 图书馆。
- 航行页升级为“声之塔 / Odyssey”，保留任务感与闯关感。
- 保留现有双语、知识星点、动画实验室、推荐与图书馆数据。
- 增加渲染错误回退视图，避免出现“页面空白、完全进不去”。

## Local preview

```bash
python -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## Deploy

Upload these files to the root of your static site:

```text
index.html
styles.css
app.js
README.md
```

If your site still shows an old version, clear the browser cache or force refresh.
