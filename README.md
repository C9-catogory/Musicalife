# Musicalife v4

一个探索音乐之美的可视化星海。  
A visual cosmos for exploring the beauty of music.

## What changed in v4

- 修复入口页无法点击进入的问题：事件绑定改为全局委托，入口按钮更稳定。
- 双语数据结构重写：中文与英文分开存储，减少切换后混乱。
- 262 个知识星点：声音物理、听觉心理、乐理数理、人声人体、大脑身体、生活应用、语言文化、乐器媒介、未来音乐。
- 24 个动画方向：声波、谐波、共振、干涉、噪声、掩蔽、双耳、ANC、音阶、和声、节奏、人声、SOVT、Formant、声调、合唱等。
- 声乐主线增强：人是乐器、呼吸、声带、SOVT、三腔/共鸣澄清、Formant、声调、音准、节拍器、合唱、嗓音保护。
- 生活模块增强：睡眠、ADHD 启动、感官过载、疼痛、记忆、MBCT、社交声音、房间声景等。
- 乐器和推荐扩展：52 个乐器/媒介条目、94 个音乐家/演唱家/ambient/钢琴/世界音乐推荐。

## Local preview

```bash
python -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## GitHub Pages

Upload these files to the root of your `musicalife` repository:

```text
index.html
styles.css
app.js
README.md
```

Then open:

```text
Settings → Pages → Deploy from a branch → main → /root → Save
```

Your site will usually appear at:

```text
https://YOUR-USERNAME.github.io/musicalife/
```
