# Musicalife v5_20260620

一个“在音乐的海洋中探索银河”的可视化音乐知识网页。  
A visual star-ocean for exploring music knowledge.

## 本轮修复重点

- **修复部署文件名问题**：静态站点入口必须叫 `index.html`。你之前上传的是 `index(3).html`，很多平台不会把它当主页读取。
- **加入缓存刷新版本号**：`index.html` 中引用 `styles.css?v5_20260620` 和 `app.js?v5_20260620`，减少 Netlify/GitHub Pages 继续显示旧脚本的情况。
- **重写交互框架**：入口、导航、搜索、抽屉、星盘、动画实验室都使用统一事件委托，手机端点击更稳定。
- **修复双语混乱**：静态入口、导航、搜索、星盘、乐器分组、推荐模块都会按当前语言渲染；英文模式不再显示“弦振动 / String vibration”这类混合标题。
- **优化手机端动画**：动画循环可停止，切换页面不重复叠加；低动效模式会停掉动画。
- **入口视觉重做**：标题改成更优雅的星河/音乐海洋叙事，标题字体栈改为更柔和的 serif/宋体风格。
- **保留内容规模**：继续保留 262 个知识星点、52 个乐器/媒介条目、94 个推荐入口、12 个生活应用卡片、11 个声乐主线条目。

## 文件

部署时只需要把这 4 个文件放到网站根目录：

```text
index.html
styles.css
app.js
README.md
```

不要上传成 `index(3).html`、`README(1).md` 这类带括号的名字。

## 本地预览

```bash
python -m http.server 5173
```

打开：

```text
http://localhost:5173
```

## Netlify 上传建议

1. 把这 4 个文件放在同一个文件夹里。
2. 直接把文件夹拖到 Netlify Deploys 页面。
3. 发布后如果仍显示旧版本，先做一次浏览器硬刷新：
   - Windows：`Ctrl + F5`
   - Mac：`Cmd + Shift + R`
4. 如果还是旧版本，检查 Netlify 的 deploy log，确认根目录里有 `index.html`，而不是 `index(3).html`。

## GitHub Pages

放到仓库根目录后：

```text
Settings → Pages → Deploy from a branch → main → /root → Save
```

通常地址是：

```text
https://YOUR-USERNAME.github.io/musicalife/
```
