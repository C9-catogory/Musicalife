(() => {
  'use strict';
  const DATA = window.ML_DATA;
  const ANIM = window.ML_ANIM;
  const ROUTES = new Set(['home','odyssey','atlas','pythagoras','voice','life','beings','create','library']);
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e) { return fallback; } };
  const state = {
    lang: localStorage.getItem('ml8_lang') || 'zh',
    route: ROUTES.has(location.hash.replace('#','')) ? location.hash.replace('#','') : 'home',
    entered: localStorage.getItem('ml8_entered') === '1',
    simple: localStorage.getItem('ml8_simple') === '1',
    reduced: localStorage.getItem('ml8_reduced') === '1',
    lit: new Set(safeJson('ml8_lit', [])),
    activeQuest: 0,
    activeCat: 'all',
    activeVoice: 0,
    params: {a: 56, b: 52, c: 62},
    seq: [1,0,1,0,1,0,0,1],
    cleanup: null,
    cosmosCleanup: null,
    gateCleanup: null,
    term: null
  };
  const L = obj => obj?.[state.lang] || obj?.zh || obj?.en || {};
  const C = key => DATA.copy[state.lang]?.[key] || DATA.copy.zh[key] || key;
  const catById = Object.fromEntries(DATA.cats.map(c => [c.id, c]));
  const starById = Object.fromEntries(DATA.stars.map(s => [s.id, s]));
  const save = () => {
    localStorage.setItem('ml8_lang', state.lang);
    localStorage.setItem('ml8_simple', state.simple ? '1' : '0');
    localStorage.setItem('ml8_reduced', state.reduced ? '1' : '0');
    localStorage.setItem('ml8_entered', state.entered ? '1' : '0');
    localStorage.setItem('ml8_lit', JSON.stringify([...state.lit]));
  };
  document.addEventListener('DOMContentLoaded', init);
  function init(){
    document.body.classList.toggle('entered', state.entered);
    document.body.classList.toggle('simple', state.simple);
    document.body.classList.toggle('reduced', state.reduced);
    bind();
    applyLang();
    state.cosmosCleanup = ANIM.startCosmos($('#cosmos'), state.reduced);
    state.gateCleanup = ANIM.startGate($('#gateCanvas'), state.reduced);
    render();
  }
  function bind(){
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    window.addEventListener('hashchange', () => {
      const next = location.hash.replace('#','') || 'home';
      state.route = ROUTES.has(next) ? next : 'home';
      render();
    });
    window.addEventListener('resize', debounce(() => drawStatic(), 120));
    $('#searchInput')?.addEventListener('input', doSearch);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDrawer(); closeSearch(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    });
  }
  function onClick(e){
    const routeBtn = e.target.closest('[data-route]');
    const actionBtn = e.target.closest('[data-action]');
    if (routeBtn) { e.preventDefault(); return route(routeBtn.dataset.route); }
    if (!actionBtn) return;
    const a = actionBtn.dataset.action;
    e.preventDefault();
    if (a === 'enter' || a === 'skip') return enter(actionBtn.dataset.lang);
    if (a === 'lang') return toggleLang();
    if (a === 'simple') return toggleSimple();
    if (a === 'motion') return toggleMotion();
    if (a === 'quest') { state.activeQuest = Number(actionBtn.dataset.index) || 0; return renderOdyssey(); }
    if (a === 'cat') { state.activeCat = actionBtn.dataset.cat || 'all'; return renderAtlas(); }
    if (a === 'star') return openStar(actionBtn.dataset.id);
    if (a === 'light') return lightStar(actionBtn.dataset.id);
    if (a === 'closeDrawer') return closeDrawer();
    if (a === 'voice') { state.activeVoice = Number(actionBtn.dataset.index) || 0; return renderVoice(); }
    if (a === 'seq') { const i = Number(actionBtn.dataset.index); state.seq[i] = state.seq[i] ? 0 : 1; return renderCreate(false); }
    if (a === 'play') return ANIM.play(actionBtn.dataset.kind || currentAnim(), state.params, state.seq);
    if (a === 'stop') return ANIM.stopSound();
    if (a === 'reset') return resetProgress();
    if (a === 'search') return openSearch();
    if (a === 'closeSearch') return closeSearch();
  }
  function onInput(e){
    const p = e.target.closest('[data-param]');
    if (!p) return;
    state.params[p.dataset.param] = Number(p.value);
    updateOutputs();
  }
  function debounce(fn, wait){ let t=0; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; }
  function enter(lang){ if (lang) state.lang = lang === 'en' ? 'en' : 'zh'; state.entered = true; document.body.classList.add('entered'); save(); applyLang(); render(); }
  function toggleLang(){ state.lang = state.lang === 'zh' ? 'en' : 'zh'; save(); applyLang(); render(); }
  function toggleSimple(){ state.simple = !state.simple; document.body.classList.toggle('simple', state.simple); save(); applyLang(); }
  function toggleMotion(){
    state.reduced = !state.reduced;
    document.body.classList.toggle('reduced', state.reduced);
    save();
    if (state.cosmosCleanup) state.cosmosCleanup();
    if (state.gateCleanup) state.gateCleanup();
    state.cosmosCleanup = ANIM.startCosmos($('#cosmos'), state.reduced);
    state.gateCleanup = ANIM.startGate($('#gateCanvas'), state.reduced);
    render();
  }
  function resetProgress(){ state.lit.clear(); state.seq = [1,0,1,0,1,0,0,1]; save(); render(); }
  function route(r){
    const next = ROUTES.has(r) ? r : 'home';
    if (!state.entered) enter();
    if (location.hash !== '#'+next) location.hash = next;
    else { state.route = next; render(); }
  }
  function applyLang(){
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach(el => { el.textContent = C(el.dataset.i18n); });
    const gt = $('[data-gate-title]'), gl = $('[data-gate-lead]');
    if (gt) gt.textContent = C('gateTitle');
    if (gl) gl.textContent = C('gateLead');
    const search = $('#searchTitle'); if (search) search.textContent = C('search');
    const input = $('#searchInput'); if (input) input.placeholder = state.lang === 'zh' ? '频率 / 共振 / 声带 / 毕达哥拉斯 / 睡眠 / ambient' : 'frequency / resonance / voice / Pythagoras / sleep / ambient';
  }
  function stopLoop(){ if (state.cleanup) { state.cleanup(); state.cleanup = null; } }
  function render(){
    stopLoop(); closeSearch(false);
    applyLang();
    $$('.bottomnav button').forEach(b => b.classList.toggle('active', b.dataset.route === state.route));
    try {
      const map = {home: renderHome, odyssey: renderOdyssey, atlas: renderAtlas, pythagoras: renderPythagoras, voice: renderVoice, life: renderLife, beings: renderBeings, create: () => renderCreate(true), library: renderLibrary};
      (map[state.route] || renderHome)();
    } catch(err) {
      console.error('Musicalife render error', err);
      $('#view').innerHTML = `<section class="page hero"><article class="hero-card"><p class="eyebrow">Musicalife · Recovery</p><h1>${state.lang==='zh'?'音乐星河仍然在这里':'The music starworld is still here'}</h1><p class="lead">${state.lang==='zh'?'刚刚某个模块渲染失败，但世界没有消失。可以回首页、打开星盘或进入声之塔。':'A module failed to render, but the world did not disappear. Return home, open the atlas or enter the Odyssey.'}</p><div class="actions"><button class="btn primary" data-route="home">${C('home')}</button><button class="btn ghost" data-route="atlas">${C('atlas')}</button><button class="btn ghost" data-route="odyssey">${C('odyssey')}</button></div></article></section>`;
    }
    requestAnimationFrame(() => $('#app')?.focus({preventScroll:true}));
  }
  function pageTitle(title, lead){ return `<div class="page-title"><div><p class="eyebrow">Musicalife</p><h1>${esc(title)}</h1><p>${esc(lead)}</p></div><div class="actions"><button class="pill" data-route="home" type="button">⌂ ${C('home')}</button><button class="pill" data-action="search" type="button">⌕</button></div></div>`; }
  function renderHome(){
    const lit = state.lit.size, pct = Math.round(lit / DATA.stars.length * 100);
    $('#view').innerHTML = `<section class="page hero"><article class="hero-card"><p class="eyebrow">Musicalife · Mandala Starworld</p><h1>${esc(C('homeTitle'))}</h1><p class="lead">${esc(C('homeLead'))}</p><div class="world-quote deep">${state.lang==='zh'?'音乐带给我们生命的激情，音乐给我们生命的勇气。音乐是我们建构的爱的方程式：关于和谐、连续、转化、连接。':'Music gives life passion and courage. Music is the equation of love we build: harmony, continuity, transformation and connection.'}</div><div class="actions"><button class="btn primary" data-route="odyssey" type="button">☄ ${C('odyssey')}</button><button class="btn ghost" data-route="atlas" type="button">◎ ${C('atlas')}</button><button class="btn ghost" data-route="create" type="button">◇ ${C('create')}</button></div><div class="portal-grid">${DATA.portals.map(portalCard).join('')}</div></article><aside class="panel" style="padding:18px"><div class="canvasbox"><canvas id="homeCanvas"></canvas></div><div class="stat-grid"><div class="stat"><strong>${DATA.stars.length}</strong><span>${state.lang==='zh'?'音乐知识星点':'Knowledge stars'}</span></div><div class="stat"><strong>${lit}</strong><span>${state.lang==='zh'?'已点亮':'Lit'}</span><div class="progressbar"><i style="width:${pct}%"></i></div></div><div class="stat"><strong>${DATA.cats.length}</strong><span>${state.lang==='zh'?'星系':'Galaxies'}</span></div></div><div class="world-quote module">${state.lang==='zh'?'一切存在都是乐器。我们接收每秒的旋律，也把内部的节奏创造出来。':'Everything that exists can be an instrument. We receive each second’s melody and create our inner rhythm.'}</div></aside></section>`;
    state.cleanup = ANIM.loop($('#homeCanvas'), 'mandala', () => state.params, () => ({seq: state.seq}));
  }
  function portalCard(p){ const l=L(p); return `<article class="card portal-card" style="--accent:${esc(p.color)}"><span class="portal-ico">${esc(p.icon)}</span><h3>${esc(l.title)}</h3><p>${esc(l.desc)}</p><button class="pill" data-route="${esc(p.route)}" type="button">${C('open')}</button></article>`; }
  function renderOdyssey(){
    const q = DATA.quests[state.activeQuest] || DATA.quests[0];
    const l = L(q);
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'声之塔：积累音乐能力':'Odyssey tower: build musical abilities', state.lang==='zh'?'像小游戏一样，从频率、比例、共振、人声、疗愈一路走向创作。':'Like a gentle game, travel from frequency, ratio, resonance, voice and care toward creation.')}<div class="split"><div class="side-list">${DATA.quests.map((x,i)=>`<button class="${i===state.activeQuest?'active':''}" data-action="quest" data-index="${i}" type="button"><span class="tag">${state.lang==='zh'?'关卡':'Level'} ${i+1}</span><strong>${esc(L(x).title)}</strong><br><span class="mini">${esc(L(x).goal)}</span></button>`).join('')}</div><div class="panel" style="padding:14px"><div class="lab"><div class="canvasbox"><canvas id="labCanvas"></canvas></div><div class="controls"><p class="eyebrow">${state.lang==='zh'?'当前动画任务':'Current animation quest'}</p><h2>${esc(l.title)}</h2><p class="lead">${esc(l.goal)}</p>${controls()}<div class="formula" id="formula">${formula(q.anim)}</div><div class="actions"><button class="btn primary" data-action="play" data-kind="${esc(q.anim)}" type="button">♪ ${C('play')}</button><button class="btn ghost" data-action="stop" type="button">${C('stop')}</button></div></div></div></div></div></section>`;
    updateOutputs();
    state.cleanup = ANIM.loop($('#labCanvas'), () => currentAnim(), () => state.params, () => ({seq: state.seq}));
  }
  function currentAnim(){ return (DATA.quests[state.activeQuest] || DATA.quests[0]).anim; }
  function controls(){ return ['a','b','c'].map((k,i)=>`<div class="control"><label><span>${['frequency / 主频','breath / 呼吸','texture / 结构'][i]}</span><output id="out_${k}">${state.params[k]}</output></label><input data-param="${k}" type="range" min="0" max="100" value="${state.params[k]}"></div>`).join(''); }
  function updateOutputs(){ ['a','b','c'].forEach(k=>{ const o=$('#out_'+k); if(o) o.textContent = state.params[k]; }); }
  function formula(anim){ const z=state.lang==='zh'; const m={wave:['y = A·sin(2πft + φ)','frequency turns motion into pitch'],ratio:['2:1 · 3:2 · 4:3','number becomes harmony'],harmonics:['timbre = f + 2f + 3f + ...','overtones become color'],resonance:['response ↑ when |f₁ - f₂| → 0','when structure can receive, it lights'],prediction:['beauty = expectation + surprise','prediction becomes feeling'],rhythm:['rhythm = repetition + variation + silence','time becomes a path'],voice:['voice = breath + folds + tract + language','body becomes instrument'],choir:['harmony = self ⊕ other','lives create a new field'],life:['care = rhythm + boundary + return','music supports recovery'],mandala:['creation = pattern + color + sound','draw your inner rhythm']}; const x=m[anim]||m.mandala; return z?x[0]+' · '+x[1]:x[0]+' · '+x[1]; }
  function filteredStars(){ return state.activeCat === 'all' ? DATA.stars : DATA.stars.filter(s => s.cat === state.activeCat); }
  function renderAtlas(){
    const stars = filteredStars();
    const lit = state.lit.size, pct = Math.round(lit / DATA.stars.length * 100);
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'银河星盘：在万事万物中寻找音乐':'Galaxy atlas: finding music in everything', state.lang==='zh'?'知识点像恒星，关系像星光。点击星星，打开动画、隐喻、创作用法和生活连接。':'Ideas are stars; relations are light. Tap a star to open animation, metaphor, creation and life links.')}<div class="tabs"><button class="pill ${state.activeCat==='all'?'active':''}" data-action="cat" data-cat="all">${C('all')}</button>${DATA.cats.map(c=>`<button class="pill ${state.activeCat===c.id?'active':''}" style="--accent:${esc(c.color)}" data-action="cat" data-cat="${esc(c.id)}">${esc(c.icon)} ${esc(state.lang==='zh'?c.zh:c.en)}</button>`).join('')}</div><div class="atlas-wrap"><div class="atlas-map panel"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="tag">${state.lang==='zh'?'已点亮':'Lit'} ${lit}/${DATA.stars.length}</span><span class="mini">${pct}%</span></div><div class="progressbar"><i style="width:${pct}%"></i></div><div class="atlas-scroll">${atlasSvg(stars)}</div></div><div class="term-list">${stars.map(termButton).join('')}</div></div></section>`;
  }
  function atlasSvg(stars){
    const groups = Object.fromEntries(DATA.cats.map((c,i)=>[c.id,{c,i,items:[]} ]));
    DATA.stars.forEach(s=>groups[s.cat]?.items.push(s));
    const selected = new Set(stars.map(s=>s.id));
    const nodes = [];
    const edges = [];
    Object.values(groups).forEach(g => {
      const cx = 140 + (g.i%3)*350, cy = 125 + Math.floor(g.i/3)*180;
      const items = g.items.filter(s=>selected.has(s.id));
      items.forEach((s,j)=>{
        const a = j * Math.PI * 2 / Math.max(6, items.length) + g.i*.23;
        const r = 42 + (j%3)*18;
        s._x = Math.round(cx + Math.cos(a)*r); s._y = Math.round(cy + Math.sin(a)*r);
        if(j>0) edges.push([items[j-1], s]);
      });
    });
    stars.forEach(s=>{ const c=catById[s.cat]||DATA.cats[0]; const title=L(s).title; nodes.push(`<g class="star-node ${state.lit.has(s.id)?'is-lit':''}" data-action="star" data-id="${esc(s.id)}" tabindex="0"><circle cx="${s._x}" cy="${s._y}" r="${state.lit.has(s.id)?6:4.6}" fill="${esc(c.color)}"/><text x="${s._x+8}" y="${s._y+4}">${esc(title.length>16?title.slice(0,16)+'…':title)}</text></g>`); });
    const edgeHtml = edges.map(([a,b])=>`<line class="edge" x1="${a._x}" y1="${a._y}" x2="${b._x}" y2="${b._y}"/>`).join('');
    return `<svg class="atlas-svg" viewBox="0 0 1000 620" role="img" aria-label="Musicalife star atlas">${edgeHtml}${nodes.join('')}</svg>`;
  }
  function termButton(s){ const c=catById[s.cat]||DATA.cats[0]; return `<button class="term-btn" data-action="star" data-id="${esc(s.id)}" type="button" style="--accent:${esc(c.color)}"><strong>${esc(L(s).title)}</strong><span>${esc(L(s).one)}</span></button>`; }
  function openStar(id){
    const s=starById[id]; if(!s) return;
    state.term = id; const c=catById[s.cat]||DATA.cats[0]; const related = DATA.stars.filter(x=>x.cat===s.cat && x.id!==s.id).slice(0,5);
    $('#drawerBody').innerHTML = `<span class="tag" style="border-color:${esc(c.color)}66;color:${esc(c.color)}">${esc(state.lang==='zh'?c.zh:c.en)}</span><h2>${esc(L(s).title)}</h2><p class="lead">${esc(L(s).one)}</p><p>${esc(L(s).deep)}</p><div class="actions"><button class="btn primary" data-action="light" data-id="${esc(s.id)}" type="button">✦ ${C('light')}</button><button class="btn ghost" data-action="play" data-kind="${esc(s.anim)}" type="button">♪ ${C('play')}</button></div><h3>${C('related')}</h3><div class="chips">${related.map(r=>`<button class="chip" data-action="star" data-id="${esc(r.id)}">${esc(L(r).title)}</button>`).join('')}</div><div class="canvasbox module"><canvas id="drawerCanvas"></canvas></div>`;
    $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false');
    ANIM.draw($('#drawerCanvas'), s.anim, state.params, performance.now()/1000, {seq: state.seq});
  }
  function lightStar(id){ if(id) state.lit.add(id); save(); openStar(id); }
  function closeDrawer(){ $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden','true'); }
  function renderPythagoras(){
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'毕达哥拉斯花园：数如何变成音乐':'Pythagorean garden: how number becomes music', state.lang==='zh'?'在这里，比例不是抽象数字，而是八度、五度、四度与和声的光。':'Here ratio is not abstract number, but the light of octave, fifth, fourth and harmony.')}<div class="hero"><div class="panel" style="padding:14px"><div class="canvasbox"><canvas id="ratioCanvas"></canvas></div><div class="actions"><button class="btn primary" data-action="play" data-kind="ratio">♪ ${C('play')}</button></div></div><div><div class="ratio-grid">${DATA.ratios.map(r=>`<article class="card ratio-card" style="--accent:#ffe7a6"><span class="tag">${esc(r.ratio)}</span><h3>${esc(state.lang==='zh'?r.zh:r.en)}</h3><p>${esc(state.lang==='zh'?r.zhFeel:r.enFeel)}</p></article>`).join('')}</div><div class="world-quote module">${state.lang==='zh'?'数学不是把音乐变冷，而是让我们看见音乐如何在结构中发光。':'Mathematics does not make music cold; it lets us see how music glows inside structure.'}</div></div></div></section>`;
    state.cleanup = ANIM.loop($('#ratioCanvas'), 'ratio', () => state.params);
  }
  function renderVoice(){
    const lesson = DATA.voiceLessons[state.activeVoice] || DATA.voiceLessons[0];
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'人声宇宙：身体是会呼吸的乐器':'Voice cosmos: the body is a breathing instrument', state.lang==='zh'?'声乐不是只有声带，而是呼吸、振动、声道、语言、听觉反馈和情绪共同形成的系统。':'Voice is not only vocal folds, but breath, vibration, tract, language, auditory feedback and feeling.')}<div class="split"><div class="side-list">${DATA.voiceLessons.map((v,i)=>`<button class="${i===state.activeVoice?'active':''}" data-action="voice" data-index="${i}"><strong>${esc(L(v).title)}</strong><br><span class="mini">${esc(L(v).desc)}</span></button>`).join('')}</div><div class="panel" style="padding:14px"><div class="lab"><div class="canvasbox"><canvas id="voiceCanvas"></canvas></div><div class="controls"><p class="eyebrow">Voice lesson</p><h2>${esc(L(lesson).title)}</h2><p class="lead">${esc(L(lesson).desc)}</p>${controls()}<div class="actions"><button class="btn primary" data-action="play" data-kind="${esc(lesson.anim)}">♪ ${C('play')}</button></div><div class="world-quote deep">${state.lang==='zh'?'每个人都有自己的音色。学习人声，也是学习如何温柔地使用身体表达生命。':'Everyone has their own timbre. Learning voice is learning how to let the body express life gently.'}</div></div></div></div></div></section>`;
    updateOutputs(); state.cleanup = ANIM.loop($('#voiceCanvas'), () => lesson.anim, () => state.params);
  }
  function renderLife(){
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'生活星系：音乐如何支持生命':'Life galaxy: how music supports life', state.lang==='zh'?'音乐带来激情，也带来恢复。它帮助我们启动、降档、记忆、连接和照顾边界。':'Music brings passion and recovery. It helps activation, downshifting, memory, connection and boundaries.')}<div class="grid three">${DATA.lifeCards.map(c=>`<article class="card" style="--accent:#a9f5ca"><span class="tag">♡</span><h3>${esc(L(c).title)}</h3><p>${esc(L(c).desc)}</p><button class="pill" data-action="play" data-kind="${esc(c.anim)}">♪ ${C('play')}</button></article>`).join('')}</div><div class="module"><h2>${state.lang==='zh'?'乐器与世界音乐也是生命的声音':'Instruments and world music are life sounding'}</h2><div class="grid three">${DATA.instruments.map(i=>`<article class="card" style="--accent:#cad8ff"><h3>${esc(L(i).title)}</h3><p>${esc(L(i).desc)}</p><button class="pill" data-action="play" data-kind="${esc(i.anim)}">♪ ${C('play')}</button></article>`).join('')}</div></div></section>`;
  }
  function renderBeings(){
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'生命共振室：每个人都是星星':'Resonance chamber: every person is a star', state.lang==='zh'?'每个生命都有主频、呼吸、结构、音色和开放度。相遇时，相似会共振，差异会生成新的和声。':'Every being has root frequency, breath, structure, timbre and openness. In encounter, similarity resonates and difference can form new harmony.')}<div class="hero"><div class="panel" style="padding:14px"><div class="canvasbox"><canvas id="beingCanvas"></canvas></div><div class="actions"><button class="btn primary" data-action="play" data-kind="resonance">♪ ${C('play')}</button></div></div><div><div class="life-params">${['主频 / Root','呼吸 / Breath','结构 / Pattern','开放度 / Openness'].map((n,i)=>`<article class="card" style="--accent:${['#79ecff','#a9f5ca','#ffe7a6','#ffabd7'][i]}"><span class="tag">${i+1}</span><h3>${esc(n)}</h3><p>${state.lang==='zh'?'它不是固定标签，而是此刻生命如何流动、接收、表达与恢复。':'Not a fixed label, but how life flows, receives, expresses and recovers now.'}</p></article>`).join('')}</div><div class="world-quote module">${state.lang==='zh'?'我们因为频率相似或互补而相遇，又因为差异而创作新的音乐模式。':'We meet through similar or complementary frequencies, and create new musical patterns through difference.'}</div></div></div></section>`;
    state.cleanup = ANIM.loop($('#beingCanvas'), 'resonance', () => state.params);
  }
  function renderCreate(start=true){
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'创作曼陀罗：每个人都是音乐家':'Creation mandala: everyone is a musician', state.lang==='zh'?'选择节奏点，听见自己的模式。后续可以扩展成音阶、和弦、色彩和个人生命星图。':'Choose rhythm points and hear your pattern. Later this can grow into scales, chords, color and a personal life star map.')}<div class="hero"><div class="panel" style="padding:14px"><div class="canvasbox"><canvas id="createCanvas"></canvas></div><div class="actions"><button class="btn primary" data-action="play" data-kind="mandala">♪ ${C('play')}</button><button class="btn ghost" data-action="stop">${C('stop')}</button></div></div><div><h2>${state.lang==='zh'?'点亮你的节奏':'Light your rhythm'}</h2><div class="seq">${state.seq.map((on,i)=>`<button class="${on?'on':''}" data-action="seq" data-index="${i}" type="button">${i+1}</button>`).join('')}</div><div class="module">${controls()}</div><div class="formula">music = repetition + variation + silence + care</div><div class="world-quote module deep">${state.lang==='zh'?'创作不是为了完美，而是把内部生命的节奏变成可以被看见、听见、分享的形式。':'Creation is not about perfection, but making inner rhythm visible, audible and shareable.'}</div></div></div></section>`;
    updateOutputs(); if(start) state.cleanup = ANIM.loop($('#createCanvas'), 'mandala', () => state.params, () => ({seq: state.seq})); else { stopLoop(); state.cleanup = ANIM.loop($('#createCanvas'), 'mandala', () => state.params, () => ({seq: state.seq})); }
  }
  function renderLibrary(){
    const grouped = {};
    DATA.library.forEach(s => { const cat = state.lang==='zh'?s.zhCat:s.enCat; (grouped[cat]=grouped[cat]||[]).push(s); });
    $('#view').innerHTML = `<section class="page">${pageTitle(state.lang==='zh'?'图书馆：继续探索音乐与生命':'Library: keep exploring music and life', state.lang==='zh'?'书、课程、论文、网站和推荐音乐，让每颗星都能继续深入。':'Books, courses, papers, sites and listening gates let each star go deeper.')} ${Object.entries(grouped).map(([cat,items])=>`<div class="module"><h2>${esc(cat)}</h2><div class="grid three">${items.map(s=>`<article class="card source-card" style="--accent:#cad8ff"><h3>${esc(s.name)}</h3><a class="btn ghost" target="_blank" rel="noopener" href="${esc(s.url)}">${state.lang==='zh'?'打开资料':'Open source'}</a></article>`).join('')}</div></div>`).join('')}<div class="module"><h2>${state.lang==='zh'?'音乐推荐入口':'Listening gates'}</h2><div class="grid four">${DATA.recs.map(r=>recCard(r)).join('')}</div></div></section>`;
  }
  function recCard(r){ const q=encodeURIComponent(r.name); return `<article class="card" style="--accent:#ffe7a6"><span class="tag">${esc(r.cat)}</span><h3>${esc(r.name)}</h3><p>${state.lang==='zh'?'作为进入音乐星河的聆听入口。':'A listening gate into the musical starworld.'}</p><div class="chips"><a class="chip" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">YouTube</a><a class="chip" target="_blank" rel="noopener" href="https://open.spotify.com/search/${q}">Spotify</a><a class="chip" target="_blank" rel="noopener" href="https://www.bilibili.com/search?keyword=${q}">Bilibili</a></div></article>`; }
  function openSearch(){ $('#searchOverlay').classList.remove('hidden'); $('#searchInput')?.focus(); doSearch(); }
  function closeSearch(){ $('#searchOverlay')?.classList.add('hidden'); }
  function doSearch(){
    const q = ($('#searchInput')?.value || '').trim().toLowerCase();
    const hits = DATA.stars.filter(s => !q || [s.id,L(s).title,L(s).one,L(s).deep,s.zh.title,s.en.title].join(' ').toLowerCase().includes(q)).slice(0,32);
    $('#searchResults').innerHTML = hits.map(s => `<button class="result" data-action="star" data-id="${esc(s.id)}"><b>${esc(L(s).title)}</b><br><span>${esc(L(s).one)}</span></button>`).join('');
  }
  function drawStatic(){
    if (state.route === 'atlas') return;
    const c = $('#homeCanvas') || $('#labCanvas') || $('#ratioCanvas') || $('#voiceCanvas') || $('#beingCanvas') || $('#createCanvas');
    if (c) ANIM.draw(c, currentAnim(), state.params, performance.now()/1000, {seq: state.seq});
  }
})();
