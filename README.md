# Musicalife

**Musicalife｜一个探索音乐之美的可视化星海**  
A visual cosmos for exploring the beauty of music.

This is a static GitHub Pages website. It uses only:

- `index.html`
- `styles.css`
- `app.js`

## Local preview

```bash
python -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## GitHub Pages deployment

1. Create a public GitHub repository named `musicalife`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
3. Open repository **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select **main** and **/root**.
6. Save.
7. Wait a few minutes, then open:

```text
https://YOUR_USERNAME.github.io/musicalife/
```

## Main data sections in `app.js`

- `termData`: bilingual knowledge constellation nodes
- `edges`: knowledge connections
- `levels`: game journey levels
- `animationCards`: animation lab entries
- `voiceChapters`: human voice lab modules
- `lifeCards`: life support scenarios
- `instrumentData`: instrument cosmos
- `timelineData`: media history timeline
- `sourceData`: library and sources

## Accessibility

- Language gate: Chinese / English
- Simple mode
- Reduced motion mode
- Mobile-first layout
- No sound autoplay
