# Musicalife

A bilingual visual platform for exploring the beauty of music: sound physics, psychoacoustics, music theory, voice science, daily life sound tools, world instruments, and future music.

## Files

- `index.html` — site entry
- `styles.css` — visual design and mobile layout
- `app.js` — data, views, star map, animations and interaction

## Local preview

```bash
cd musicalife_github_v2
python -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## GitHub Pages quick publish

1. Create a public repository named `musicalife`.
2. Upload `index.html`, `styles.css`, `app.js`, `README.md` to the repository root.
3. Go to `Settings → Pages`.
4. Choose `Deploy from a branch`.
5. Select `main` and `/root`.
6. Save and wait a few minutes.
7. The site URL will usually be:

```text
https://YOUR-USERNAME.github.io/musicalife/
```

## Edit content

Most content is in `app.js`:

- `termData` — knowledge star map terms
- `edges` — concept relationships
- `anims` — animation list
- `levels` — game path
- `voiceChapters` — voice lab
- `lifeCards` — daily life tools
- `instruments` — instrument museum
- `sources` — library links

