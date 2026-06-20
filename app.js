(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const LANG = {
    zh:{home:'首页',odyssey:'声之塔',atlas:'星盘',beings:'生命体',create:'创作',library:'图书馆',open:'进入',play:'轻声试听',stop:'停止',light:'点亮',simple:'少字',reset:'重置',progress:'点亮进度'},
    en:{home:'Home',odyssey:'Odyssey',atlas:'Atlas',beings:'Beings',create:'Create',library:'Library',open:'Enter',play:'Play softly',stop:'Stop',light:'Light',simple:'Simple',reset:'Reset',progress:'Progress'}
  };
  const DATA = {
    portals:[
      ['odyssey','☄','#79ecff','声之塔','Odyssey','从一颗音符开始，像小游戏一样积累音乐能力。','Start with one note and gather musical abilities like a gentle game.'],
      ['atlas','◎','#b79bff','银河星盘','Galaxy atlas','把知识点看成恒星，把关系看成星光连线。','See ideas as stars and relations as beams of light.'],
      ['beings','◌','#ffabd7','生命体共振','Resonant beings','每个生命都有自己的结构、呼吸、频率与和声。','Every being has its structure, breath, frequency and harmony.'],
      ['create','◇','#ffe7a6','创作实验室','Creation lab','用音阶、节奏、函数与图形寻找自己的音乐。','Use scale, rhythm, function and image to find your music.'],
      ['library','☰','#a9f5ca','音乐图书馆','Library','把疗愈、声学、乐理、世界音乐与创作资料收藏起来。','Collect resources on care, acoustics, theory, world music and creation.']
    ],
    levels:[
      {id:'wave',icon:'∿',color:'#79ecff',zh:'听见频率',en:'Hear frequency',zhText:'拖动频率，观察正弦/余弦如何变成可感知的波。',enText:'Drag frequency and see sine/cosine become a perceivable wave.'},
      {id:'ratio',icon:'π',color:'#ffe7a6',zh:'比例与音阶',en:'Ratio and scale',zhText:'八度、五度、三度像星桥，比例让声音产生秩序。',enText:'Octave, fifth and third are star bridges; ratio gives sound order.'},
      {id:'harmonics',icon:'≋',color:'#b79bff',zh:'谐波织机',en:'Harmonic loom',zhText:'基频与泛音叠加，音色像光谱一样展开。',enText:'Fundamental and overtones weave timbre like a spectrum.'},
      {id:'resonance',icon:'◌',color:'#ffabd7',zh:'共振之室',en:'Resonance chamber',zhText:'当频率相似或互补，空间会被点亮。',enText:'When frequencies align or complement, a space lights up.'},
      {id:'being',icon:'✺',color:'#a9f5ca',zh:'生命星体',en:'Life star',zhText:'每个生命像一首歌，有主频、副歌、呼吸和伴奏。',enText:'Each life is like a song, with root tone, chorus, breath and accompaniment.'},
      {id:'encounter',icon:'∞',color:'#ffc58f',zh:'相遇的和弦',en:'Chord of encounter',zhText:'两个生命靠近，会产生拍频、张力、和声与新的理解。',enText:'When two beings approach, they create beats, tension, harmony and insight.'},
      {id:'compose',icon:'◇',color:'#cad8ff',zh:'创作小宇宙',en:'Creation microcosm',zhText:'把节奏点亮，听见自己的结构如何成为音乐。',enText:'Light rhythm steps and hear your structure become music.'},
      {id:'harmony',icon:'♡',color:'#d7a4ff',zh:'寻找平衡',en:'Find harmony',zhText:'最后不是完美，而是找到能呼吸、能连接的动态平衡。',enText:'The goal is not perfection, but a living balance that can breathe and connect.'}
    ],
    stars:[
      ['frequency','physics',160,150,'频率','Frequency','一秒振动多少次。音乐从变化开始。','Cycles per second. Music begins as change.'],
      ['amplitude','physics',220,210,'振幅','Amplitude','波的大小，像生命表达的强弱。','Wave size, like the intensity of expression.'],
      ['phase','physics',120,245,'相位','Phase','相同频率也可能错开，于是产生相加或抵消。','Same frequencies can be offset, adding or canceling.'],
      ['ratio','math',390,130,'比例','Ratio','八度、五度、三度让数理变成可听见的和谐。','Octaves, fifths and thirds turn math into audible harmony.'],
      ['scale','math',470,220,'音阶','Scale','一组可返回的路径，让旋律有家。','A returnable path that gives melody a home.'],
      ['matrix','math',360,300,'矩阵/变换','Matrix / transform','换一个视角，图形、声音和生命模式会重新排列。','Change perspective and patterns rearrange.'],
      ['resonance','life',610,160,'共振','Resonance','空间、身体和关系遇到合适频率时被放大。','Space, body and relation amplify at fitting frequencies.'],
      ['breath','life',690,245,'呼吸','Breath','节奏从身体内部出生。','Rhythm is born from inside the body.'],
      ['pattern','life',615,330,'模式','Pattern','重复与变化让信息可以被压缩、记住、传递。','Repetition and variation let information compress, remember and travel.'],
      ['voice','voice',840,130,'人声','Voice','身体是一件会呼吸、会变形、会表达爱的乐器。','The body is a breathing, changing instrument of expression.'],
      ['choir','voice',900,245,'和声/合唱','Harmony / choir','多个生命的频率相遇，形成新的空间。','Multiple life frequencies meet and create a new space.'],
      ['care','care',800,350,'疗愈','Care','音乐带我们回到身体、节奏、连接与希望。','Music brings us back to body, rhythm, connection and hope.']
    ],
    edges:[['frequency','amplitude'],['frequency','phase'],['frequency','ratio'],['ratio','scale'],['ratio','matrix'],['matrix','pattern'],['scale','voice'],['resonance','breath'],['resonance','choir'],['breath','voice'],['pattern','care'],['voice','choir'],['choir','care'],['phase','resonance'],['amplitude','breath']],
    sources:[
      ['心理声学','Psychoacoustics','频率、响度、掩蔽、粗糙度、空间听觉。','Frequency, loudness, masking, roughness and spatial hearing.'],
      ['乐理数理','Music theory & math','音程、音阶、和声、节奏、比例与结构。','Intervals, scales, harmony, rhythm, ratio and structure.'],
      ['声乐科学','Voice science','呼吸、声带、声道、共振峰、嗓音保护。','Breath, vocal folds, vocal tract, formants and voice care.'],
      ['音乐疗愈','Music and care','睡眠、注意、情绪、疼痛、社群与归属感。','Sleep, attention, emotion, pain, community and belonging.'],
      ['世界音乐','World music','从不同文化中学习他人的音乐模式。','Learn musical patterns from cultures and lives.'],
      ['创作工具','Creation tools','Web Audio、MIDI、合成器、采样、绘画式作曲。','Web Audio, MIDI, synths, sampling and drawing-like composition.']
    ]
  };
  const state = {
    lang: localStorage.getItem('mlcore_lang') || 'zh',
    route: localStorage.getItem('mlcore_route') || 'home',
    simple: localStorage.getItem('mlcore_simple') === '1',
    reduced: localStorage.getItem('mlcore_reduced') === '1',
    lit: new Set(JSON.parse(localStorage.getItem('mlcore_lit') || '[]')),
    lab:'wave', params:{a:55,b:45,c:60}, raf:0, starRaf:0, gateRaf:0,
    audio:null, osc:[], seq:[1,0,1,0,1,1,0,1], beat:0
  };
  const T = k => (LANG[state.lang]||LANG.zh)[k] || k;
  const zh = () => state.lang === 'zh';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save = () => {localStorage.setItem('mlcore_lang',state.lang);localStorage.setItem('mlcore_route',state.route);localStorage.setItem('mlcore_simple',state.simple?'1':'0');localStorage.setItem('mlcore_reduced',state.reduced?'1':'0');localStorage.setItem('mlcore_lit',JSON.stringify([...state.lit]));};
  document.addEventListener('DOMContentLoaded', init);
  function init(){
    document.body.classList.toggle('simple',state.simple); document.body.classList.toggle('reduced',state.reduced);
    bind(); applyI18n(); startStars(); startGate();
    if(localStorage.getItem('mlcore_entered')==='1') document.body.classList.add('entered');
    if(!['home','odyssey','atlas','beings','create','library'].includes(state.route)) state.route='home';
    render();
  }
  function bind(){
    document.addEventListener('click', onClick);
    document.addEventListener('input', e => { if(e.target.matches('[data-param]')){ state.params[e.target.dataset.param]=Number(e.target.value); updateOutputs(); drawCurrent(); }});
    window.addEventListener('resize', () => { drawCurrent(); drawHomeCanvas(); });
    window.addEventListener('hashchange',()=>{ const r=location.hash.replace('#',''); if(r) route(r,false); });
  }
  function onClick(e){
    const action = e.target.closest('[data-action]'); const rbtn = e.target.closest('[data-route]'); const level = e.target.closest('[data-level]'); const star=e.target.closest('[data-star]'); const seq=e.target.closest('[data-step]');
    if(action){ e.preventDefault(); const a=action.dataset.action;
      if(a==='enter'){ state.lang=action.dataset.lang||state.lang; localStorage.setItem('mlcore_entered','1'); document.body.classList.add('entered'); applyI18n(); save(); render(); return; }
      if(a==='skip'){ localStorage.setItem('mlcore_entered','1'); document.body.classList.add('entered'); return; }
      if(a==='reduced'){ state.reduced=!state.reduced; document.body.classList.toggle('reduced',state.reduced); save(); if(!state.reduced){ startStars(); startGate(); drawCurrent(); } return; }
      if(a==='lang'){ state.lang=zh()?'en':'zh'; applyI18n(); save(); render(); return; }
      if(a==='simple'){ state.simple=!state.simple; document.body.classList.toggle('simple',state.simple); save(); return; }
      if(a==='reset'){ state.lit.clear(); save(); render(); return; }
      if(a==='closeDrawer'){ closeDrawer(); return; }
      if(a==='play'){ playSoft(state.lab); return; }
      if(a==='stop'){ stopSound(); return; }
      if(a==='light'){ state.lit.add(state.lab); save(); render(); return; }
    }
    if(rbtn && !rbtn.closest('#gate')){ e.preventDefault(); route(rbtn.dataset.route); return; }
    if(level){ e.preventDefault(); state.lab=level.dataset.level; state.lit.add(state.lab); save(); route('odyssey'); return; }
    if(star){ e.preventDefault(); openStar(star.dataset.star); return; }
    if(seq){ e.preventDefault(); const i=Number(seq.dataset.step); state.seq[i]=state.seq[i]?0:1; renderCreate(); return; }
  }
  function route(r, push=true){
    if(!['home','odyssey','atlas','beings','create','library'].includes(r)) r='home';
    state.route=r; save(); if(push && location.hash !== '#'+r) location.hash='#'+r; render();
  }
  function applyI18n(){ $$('[data-i18n]').forEach(el=>el.textContent=T(el.dataset.i18n)); }
  function render(){
    cancelAnimationFrame(state.raf); state.raf=0; closeDrawer(false); applyI18n();
    $$('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route));
    try{ ({home:renderHome,odyssey:renderOdyssey,atlas:renderAtlas,beings:renderBeings,create:renderCreate,library:renderLibrary}[state.route]||renderHome)(); }
    catch(err){ console.error(err); $('#view').innerHTML = `<section class="page"><div class="hero-card"><p class="eyebrow">Recovery</p><h1>${zh()?'音乐世界仍然在这里':'The music world is still here'}</h1><p>${zh()?'刚才有一个模块没有渲染成功，但主世界没有消失。请回到首页或星盘继续。':'One module failed to render, but the world remains. Return home or atlas.'}</p><button class="btn primary" data-route="home">${T('home')}</button></div></section>`; }
    requestAnimationFrame(()=>$('#view')?.focus({preventScroll:true}));
  }
  function title(t,l){ return `<div class="page-title"><div><p class="eyebrow">Musicalife · ${esc(t[1])}</p><h1>${esc(t[0])}</h1><p class="lead">${esc(l)}</p></div><div class="actions"><button class="pill" data-action="play">♪ ${T('play')}</button><button class="pill" data-action="stop">${T('stop')}</button></div></div>`; }
  function renderHome(){
    const pct = Math.round(state.lit.size / DATA.levels.length * 100);
    $('#view').innerHTML = `<section class="page hero"><div class="hero-card"><p class="eyebrow">Musicalife · Starworld</p><h1>${zh()?'一切都是音乐的载体。':'Everything can become a carrier of music.'}</h1><p>${zh()?'这是一个关于音乐、数理、生命与创作的小游戏雏形。每个人都是一颗星，有自己的结构、呼吸和主要频率；我们在光和节奏中靠近，在共振与和声中学习彼此的模式。':'This is a small game-like prototype about music, mathematics, life and creation. Every person is a star, with structure, breath and a root frequency; we approach through light and rhythm, learning each other through resonance and harmony.'}</p><div class="world-quote deep">${zh()?'音乐不是孤立的声音，而是结构与变化的模式。它可以被压缩、传递、解密；也可以把感受、记忆、空间和关系连接成一种更深的秩序。这里把“万物皆乐器”作为游戏世界观：用频率、函数、星图和创作去学习如何享受音乐、理解生命、寻找自己的和声。':'Music is not an isolated sound, but a pattern of structure and change. It can be compressed, carried and decoded; it can connect feeling, memory, space and relation into deeper order. This world uses “everything is an instrument” as a game metaphor: frequency, functions, star maps and creation help us enjoy music, understand life and find our own harmony.'}</div><div class="portal-grid">${DATA.portals.map(p=>portal(p)).join('')}</div></div><div class="panel" style="padding:18px"><div class="canvasbox"><canvas id="homeCanvas"></canvas></div><div class="stat-grid"><div class="stat"><strong>${pct}%</strong><span>${T('progress')}</span><div class="progressbar"><i style="width:${pct}%"></i></div></div><div class="stat"><strong>${DATA.levels.length}</strong><span>${zh()?'音乐能力':'Abilities'}</span></div><div class="stat"><strong>${DATA.stars.length}</strong><span>${zh()?'星点':'Stars'}</span></div></div><div class="world-quote">${zh()?'建议先进入「声之塔」，再去「星盘」自由探索，最后在「创作」里把节奏点亮。':'Begin with the Odyssey, roam the atlas, then light rhythm in Creation.'}</div></div></section>`;
    requestAnimationFrame(drawHomeCanvas);
  }
  function portal(p){ return `<article class="portal-card" style="--accent:${p[2]}"><span class="portal-ico">${p[1]}</span><h3>${esc(zh()?p[3]:p[4])}</h3><p>${esc(zh()?p[5]:p[6])}</p><button class="pill" data-route="${p[0]}">${T('open')}</button></article>`; }
  function renderOdyssey(){
    $('#view').innerHTML = `<section class="page">${title([zh()?'声之塔：积累音乐能力':'Odyssey: gather musical abilities','Odyssey'], zh()?'每一关是一块发光台阶：从频率、比例、谐波、共振，到生命体、相遇、创作与和声。':'Each level is a glowing step: from frequency, ratio, harmonics and resonance to beings, encounter, creation and harmony.')}<div class="quest-grid">${DATA.levels.map((l,i)=>`<article class="card quest-card ${state.lit.has(l.id)?'done':''}" style="--accent:${l.color}"><span class="tag">${zh()?'第':'Level '} ${i+1}</span><h3>${l.icon} ${esc(zh()?l.zh:l.en)}</h3><p>${esc(zh()?l.zhText:l.enText)}</p><button class="pill" data-level="${l.id}">${zh()?'打开实验':'Open lab'}</button></article>`).join('')}</div><div class="module lab"><div class="canvasbox"><canvas id="labCanvas"></canvas></div><div class="controls">${labControls()}<div class="formula" id="formula"></div><div class="actions"><button class="btn primary" data-action="light">✦ ${T('light')}</button><button class="btn ghost" data-action="play">♪ ${T('play')}</button></div></div></div></section>`;
    updateOutputs(); animateLab();
  }
  function labControls(){ const labs=DATA.levels.map(l=>`<button class="pill" data-level="${l.id}" style="--accent:${l.color}">${esc(zh()?l.zh:l.en)}</button>`).join(''); return `<div class="row" style="justify-content:flex-start">${labs}</div>${['a','b','c'].map((k,i)=>`<div class="control"><label><span>${[zh()?'主频 / 速度':'root / speed',zh()?'呼吸 / 幅度':'breath / amplitude',zh()?'结构 / 密度':'structure / density'][i]}</span><output id="out_${k}">${state.params[k]}</output></label><input data-param="${k}" type="range" min="0" max="100" value="${state.params[k]}"></div>`).join('')}`; }
  function renderAtlas(){
    const pct = Math.round(state.lit.size / DATA.levels.length * 100);
    $('#view').innerHTML = `<section class="page">${title([zh()?'银河星盘：在万物中寻找音乐':'Galaxy atlas: find music in everything','Atlas'], zh()?'星点不是资料目录，而是生命、声音、数学和关系的模式。点击星星，打开它的故事。':'Stars are not a list of facts, but patterns of life, sound, math and relation. Tap a star to open its story.')}<div class="atlas-wrap"><div class="atlas-map panel"><div class="row" style="justify-content:space-between"><span class="tag">${T('progress')}: ${pct}%</span><span class="mini">${DATA.stars.length} stars</span></div><div class="progressbar"><i style="width:${pct}%"></i></div><div class="atlas-scroll">${atlasSvg()}</div></div><div class="star-list">${DATA.stars.map(s=>`<button data-star="${s[0]}"><strong>${esc(zh()?s[4]:s[5])}</strong><br><span class="mini">${esc(zh()?s[6]:s[7])}</span></button>`).join('')}</div></div></section>`;
  }
  function atlasSvg(){ const by=Object.fromEntries(DATA.stars.map(s=>[s[0],s])); const edges=DATA.edges.map(([a,b])=>{const A=by[a],B=by[b];return A&&B?`<line class="edge" x1="${A[2]}" y1="${A[3]}" x2="${B[2]}" y2="${B[3]}"/>`:''}).join(''); const nodes=DATA.stars.map(s=>`<g class="star-node ${state.lit.has(s[0])?'done':''}" data-star="${s[0]}"><circle cx="${s[2]}" cy="${s[3]}" r="${state.lit.has(s[0])?8:6}" fill="${catColor(s[1])}"/><text x="${s[2]+10}" y="${s[3]+4}">${esc(zh()?s[4]:s[5])}</text></g>`).join(''); return `<svg class="atlas-svg" viewBox="0 0 1020 460">${edges}${nodes}</svg>`; }
  function catColor(c){ return {physics:'#79ecff',math:'#ffe7a6',life:'#a9f5ca',voice:'#ffabd7',care:'#d7a4ff'}[c]||'#fff'; }
  function openStar(id){ const s=DATA.stars.find(x=>x[0]===id); if(!s)return; state.lit.add(id); save(); $('#drawerBody').innerHTML=`<span class="tag" style="color:${catColor(s[1])};border-color:${catColor(s[1])}77">${esc(s[1])}</span><h2>${esc(zh()?s[4]:s[5])}</h2><p>${esc(zh()?s[6]:s[7])}</p><p class="deep">${zh()?'在游戏里，这颗星代表一种可以被学习、感知和创作的音乐模式。它既可以是声学知识，也可以是生命经验的隐喻。':'In the game, this star represents a musical pattern you can learn, feel and create. It can be acoustic knowledge and also a metaphor for life experience.'}</p><div class="actions"><button class="btn primary" data-route="odyssey">${zh()?'去声之塔实验':'Try in Odyssey'}</button><button class="btn ghost" data-action="closeDrawer">${zh()?'关闭':'Close'}</button></div>`; $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false'); }
  function closeDrawer(animate=true){ const d=$('#drawer'); if(!d)return; d.classList.remove('open'); d.setAttribute('aria-hidden','true'); }
  function renderBeings(){
    $('#view').innerHTML = `<section class="page">${title([zh()?'生命体共振：每个人都是星星':'Resonant beings: everyone is a star','Beings'], zh()?'这里把“生命有自己的频率”作为诗性游戏模型：主频、呼吸、开放度、结构会画出一颗生命星体。':'This uses “each life has its own frequency” as a poetic game model: root, breath, openness and structure draw a life star.')}<div class="beings-grid"><div class="panel" style="padding:14px"><div class="canvasbox"><canvas id="beingCanvas"></canvas></div></div><div class="controls">${labControls()}<div class="world-quote">${zh()?'当两个生命靠近，不只是相同才会和谐；有时互补的频率、留白和节奏，也会打开新的空间。':'When two lives approach, harmony is not only sameness; complementary frequencies, silence and rhythm can open a new space.'}</div><button class="btn primary" data-route="create">${zh()?'把它变成音乐':'Turn it into music'}</button></div></div></section>`;
    updateOutputs(); requestAnimationFrame(()=>drawBeing($('#beingCanvas'), performance.now()/1000));
  }
  function renderCreate(){
    $('#view').innerHTML = `<section class="page">${title([zh()?'创作实验室：把节奏点亮':'Creation lab: light the rhythm','Create'], zh()?'点击 8 个星点，组成一个小节。它不需要完美，只需要属于你。':'Tap 8 stars to form a measure. It does not need to be perfect; it only needs to be yours.')}<div class="lab"><div class="canvasbox"><canvas id="createCanvas"></canvas></div><div class="controls"><div class="sequencer">${state.seq.map((v,i)=>`<button class="stepbtn ${v?'on':''}" data-step="${i}" aria-label="step ${i+1}">${i+1}</button>`).join('')}</div>${labControls()}<div class="formula">${zh()?'创作提示：重复带来稳定，变化带来生命，留白让音乐可以呼吸。':'Creation hint: repetition gives stability, variation gives life, and silence lets music breathe.'}</div><div class="actions"><button class="btn primary" data-action="play">♪ ${T('play')}</button><button class="btn ghost" data-action="light">✦ ${T('light')}</button></div></div></div></section>`;
    updateOutputs(); requestAnimationFrame(()=>drawCreate($('#createCanvas'), performance.now()/1000));
  }
  function renderLibrary(){
    $('#view').innerHTML = `<section class="page">${title([zh()?'图书馆：以后继续扩展的音乐世界':'Library: the world can keep growing','Library'], zh()?'这个 demo 先把资料分成几类。以后可以继续加入书籍、课程、论文、声音样本、创作工具和游戏关卡。':'This demo starts with categories. Later it can grow with books, courses, papers, sound samples, tools and game levels.')}<div class="grid three">${DATA.sources.map(s=>`<article class="card" style="--accent:#a9f5ca"><span class="tag">${esc(zh()?s[0]:s[1])}</span><h3>${esc(zh()?s[0]:s[1])}</h3><p>${esc(zh()?s[2]:s[3])}</p></article>`).join('')}</div><div class="world-quote module">${zh()?'下一步可以把这里做成真正的音乐资料库：每个知识星点都有来源、听觉例子、练习任务和创作素材。':'Next, this can become a real music library: each star has sources, listening examples, practice quests and creation materials.'}</div></section>`;
  }
  function updateOutputs(){ ['a','b','c'].forEach(k=>{ const o=$('#out_'+k); if(o)o.textContent=state.params[k]; }); }
  function setup(c){ const dpr=devicePixelRatio||1, rect=c.getBoundingClientRect(), w=Math.max(10,rect.width), h=Math.max(10,rect.height); if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){ c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); } const ctx=c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx,w,h}; }
  function startStars(){ const c=$('#starBg'); if(!c||state.starRaf||state.reduced)return; const stars=Array.from({length:220},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.7+.2,s:Math.random()*1.2+.2})); const frame=t=>{ const {ctx,w,h}=setup(c); ctx.clearRect(0,0,w,h); const g=ctx.createLinearGradient(0,h*.25,w,h*.75); g.addColorStop(0,'rgba(121,236,255,.05)');g.addColorStop(.5,'rgba(255,231,166,.08)');g.addColorStop(1,'rgba(183,155,255,.04)'); ctx.fillStyle=g; ctx.save(); ctx.translate(w*.5,h*.5); ctx.rotate(-.28); ctx.fillRect(-w,-h*.08,w*2,h*.16); ctx.restore(); for(const st of stars){ctx.globalAlpha=.22+.75*Math.sin(t*.001*st.s+st.x*10)**2;ctx.fillStyle=st.r>1.4?'#ffe7a6':'#fff';ctx.beginPath();ctx.arc(st.x*w,st.y*h,st.r,0,Math.PI*2);ctx.fill();} ctx.globalAlpha=1; if(!state.reduced)state.starRaf=requestAnimationFrame(frame);else state.starRaf=0;}; state.starRaf=requestAnimationFrame(frame); }
  function startGate(){ const c=$('#gateCanvas'); if(!c||state.gateRaf||state.reduced)return; const frame=t=>{drawGate(c,t*.001); if(!document.body.classList.contains('entered')&&!state.reduced)state.gateRaf=requestAnimationFrame(frame);else state.gateRaf=0;}; state.gateRaf=requestAnimationFrame(frame); }
  function drawGate(c,t){ const {ctx,w,h}=setup(c); ctx.clearRect(0,0,w,h); for(let k=1;k<=6;k++){ctx.beginPath(); for(let x=0;x<=w;x+=3){const y=h*.55+Math.sin(x*.012*k+t*(.35+k*.12))*34/k+Math.cos(x*.006+t)*20; x?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.strokeStyle=['#79ecff','#b79bff','#ffabd7','#ffe7a6','#a9f5ca','#cad8ff'][k-1]; ctx.globalAlpha=.74; ctx.lineWidth=1.8; ctx.stroke();} ctx.globalAlpha=1; for(let i=0;i<160;i++){const a=i*2.399+t*.12,r=8+i*2.4; const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r*.62; ctx.fillStyle=i%7?'rgba(255,255,255,.75)':'#ffe7a6'; ctx.beginPath();ctx.arc(x,y,i%9?1.2:2.6,0,Math.PI*2);ctx.fill();} }
  function drawHomeCanvas(){ const c=$('#homeCanvas'); if(!c)return; const {ctx,w,h}=setup(c); const t=performance.now()/1000; ctx.clearRect(0,0,w,h); drawMandala(ctx,w,h,t,state.params); drawWaves(ctx,w,h,t,'home'); }
  function animateLab(){ const c=$('#labCanvas'); if(!c)return; const frame=t=>{ drawLab(c,t*.001); if(state.route==='odyssey'&&!state.reduced) state.raf=requestAnimationFrame(frame); }; state.raf=requestAnimationFrame(frame); }
  function drawCurrent(){ if(state.route==='odyssey') drawLab($('#labCanvas'),performance.now()/1000); if(state.route==='beings') drawBeing($('#beingCanvas'),performance.now()/1000); if(state.route==='create') drawCreate($('#createCanvas'),performance.now()/1000); }
  function drawLab(c,t){ if(!c)return; const {ctx,w,h}=setup(c); ctx.clearRect(0,0,w,h); const p=state.params; if(state.lab==='wave')drawWaves(ctx,w,h,t,'wave'); else if(state.lab==='ratio')drawRatio(ctx,w,h,t); else if(state.lab==='harmonics')drawHarmonics(ctx,w,h,t,p); else if(state.lab==='resonance')drawResonance(ctx,w,h,t,p); else if(state.lab==='being')drawBeing(c,t); else if(state.lab==='encounter')drawEncounter(ctx,w,h,t,p); else if(state.lab==='compose')drawCreate(c,t); else drawMandala(ctx,w,h,t,p); const f=$('#formula'); if(f)f.textContent=formulaText(); }
  function formulaText(){ const a=state.params.a,b=state.params.b,c=state.params.c; const map={wave:`y = ${a}·sin(2πft + φ)`,ratio:`octave 2:1 · fifth 3:2 · third 5:4`,harmonics:`timbre = f + 2f + 3f + ...`,resonance:`response ↑ when |f₁ - f₂| → 0`,being:`life = root + breath + pattern + relation`,encounter:`new harmony = self ⊕ other`,compose:`music = repetition + variation + silence`,harmony:`harmony ≠ static; harmony = breathing balance`}; return map[state.lab]||`Musicalife`; }
  function drawWaves(ctx,w,h,t,mode){ const a=state.params.a/100, b=state.params.b/100; const colors=['#79ecff','#b79bff','#ffe7a6']; for(let k=0;k<3;k++){ctx.beginPath(); for(let x=0;x<w;x+=2){ const y=h*(.35+k*.16)+Math.sin(x*(.008+k*.004+a*.02)+t*(.8+k*.25))*h*(.08+b*.06)/(k+1); x?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.strokeStyle=colors[k]; ctx.globalAlpha=.82; ctx.lineWidth=2; ctx.stroke(); } ctx.globalAlpha=1; label(ctx,mode==='home'?'sine · cosine · breath · star':'frequency / wave / breath',18,28); }
  function drawRatio(ctx,w,h,t){ const ratios=[['1:1',1,'#79ecff'],['5:4',1.25,'#ffabd7'],['3:2',1.5,'#ffe7a6'],['2:1',2,'#a9f5ca']]; const cy=h*.62; ratios.forEach((r,i)=>{ const x=60+i*(w-120)/3, len=70*r[1]; ctx.strokeStyle=r[2];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x,cy-len);ctx.stroke(); ctx.fillStyle=r[2];ctx.beginPath();ctx.arc(x,cy-len+Math.sin(t+i)*5,7,0,Math.PI*2);ctx.fill(); label(ctx,r[0],x-14,cy+24);}); label(ctx,'ratio becomes harmony',18,28); }
  function drawHarmonics(ctx,w,h,t,p){ const cx=w/2,cy=h*.56; for(let n=1;n<=8;n++){ const r=22+n*18+(p.c-50)*.25; ctx.strokeStyle=['#79ecff','#b79bff','#ffe7a6','#ffabd7'][n%4]; ctx.globalAlpha=.18+.06*n; ctx.beginPath(); for(let a=0;a<=Math.PI*2+.05;a+=.04){ const rr=r+Math.sin(a*n+t*(.5+n*.08))*10*(p.b/70); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; a?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.closePath();ctx.stroke(); } ctx.globalAlpha=1; label(ctx,'harmonic loom: f + 2f + 3f',18,28); }
  function drawResonance(ctx,w,h,t,p){ const cx=w/2,cy=h/2; for(let i=0;i<9;i++){ const r=30+i*26+Math.sin(t+i)*6; ctx.strokeStyle=i%2?'#79ecff':'#ffabd7'; ctx.globalAlpha=.14+i*.05; ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke(); } const glow=Math.abs(Math.sin(t*(.4+p.a/80))); ctx.fillStyle=`rgba(255,231,166,${.15+glow*.65})`; ctx.beginPath();ctx.arc(cx,cy,36+glow*18,0,Math.PI*2);ctx.fill(); ctx.globalAlpha=1; label(ctx,'resonance: space lights when frequencies meet',18,28); }
  function drawBeing(c,t){ if(!c)return; const {ctx,w,h}=setup(c); ctx.clearRect(0,0,w,h); drawMandala(ctx,w,h,t,state.params); label(ctx,zh()?'生命星体：主频 · 呼吸 · 结构':'life star: root · breath · structure',18,28); }
  function drawEncounter(ctx,w,h,t,p){ const x1=w*.38,x2=w*.62,cy=h*.52; for(let j=0;j<2;j++){ const cx=j?x2:x1; for(let i=0;i<7;i++){ctx.strokeStyle=j?'#ffabd7':'#79ecff';ctx.globalAlpha=.12+i*.06;ctx.beginPath();ctx.arc(cx,cy,22+i*18+Math.sin(t+i)*4,0,Math.PI*2);ctx.stroke();}} ctx.globalAlpha=.8;ctx.strokeStyle='#ffe7a6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,cy);ctx.bezierCurveTo(w*.45,cy-90,w*.55,cy+90,x2,cy);ctx.stroke();ctx.globalAlpha=1;label(ctx,'encounter: two patterns create a new field',18,28); }
  function drawCreate(c,t){ if(!c)return; const {ctx,w,h}=setup(c); ctx.clearRect(0,0,w,h); const cx=w/2,cy=h/2,r=Math.min(w,h)*.32; for(let i=0;i<8;i++){ const a=-Math.PI/2+i*Math.PI*2/8; const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r; ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke(); ctx.fillStyle=state.seq[i]?'#ffe7a6':'rgba(255,255,255,.15)'; ctx.beginPath();ctx.arc(x,y,state.seq[i]?10:6,0,Math.PI*2);ctx.fill(); if(state.seq[i]){ctx.strokeStyle='#79ecff';ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(x,y,14+Math.sin(t*2+i)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;} } label(ctx,'composition: repetition + variation + silence',18,28); }
  function drawMandala(ctx,w,h,t,p){ const cx=w/2,cy=h/2, base=Math.min(w,h)*.16; for(let ring=0;ring<4;ring++){ const points=8+ring*4; ctx.beginPath(); for(let i=0;i<=points;i++){ const a=i*Math.PI*2/points+t*(ring%2?.06:-.04); const rr=base+ring*34+Math.sin(a*(2+ring)+t)*(p.b*.35); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.closePath(); ctx.strokeStyle=['#79ecff','#b79bff','#ffabd7','#ffe7a6'][ring]; ctx.globalAlpha=.32+ring*.11; ctx.lineWidth=1.6; ctx.stroke(); } ctx.globalAlpha=1; ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill(); }
  function label(ctx,text,x,y){ ctx.save();ctx.fillStyle='rgba(255,255,255,.86)';ctx.font='13px system-ui, sans-serif';ctx.fillText(text,x,y);ctx.restore(); }
  function playSoft(kind){ stopSound(); try{ const AC=window.AudioContext||window.webkitAudioContext; const ac=state.audio||(state.audio=new AC()); if(ac.state==='suspended')ac.resume(); const now=ac.currentTime; const base=180+state.params.a*2; const intervals=kind==='ratio'?[1,1.25,1.5,2]:kind==='encounter'?[1,1.2,1.5]:[1,1.5,2]; intervals.forEach((m,i)=>{ const o=ac.createOscillator(),g=ac.createGain(); o.type='sine'; o.frequency.value=base*m; g.gain.setValueAtTime(.0001,now+i*.05); g.gain.exponentialRampToValueAtTime(.026/(i+1),now+.08+i*.05); g.gain.exponentialRampToValueAtTime(.0001,now+1.2+i*.08); o.connect(g);g.connect(ac.destination);o.start(now+i*.05);o.stop(now+1.45+i*.08);state.osc.push(o); }); if(state.route==='create')playSeq(ac,now,base); }catch(e){} }
  function playSeq(ac,now,base){ state.seq.forEach((on,i)=>{ if(!on)return; const o=ac.createOscillator(),g=ac.createGain(); o.type='triangle'; o.frequency.value=base*[1,1.125,1.25,1.334,1.5,1.667,1.875,2][i]; const t=now+i*.16; g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.16);state.osc.push(o); }); }
  function stopSound(){ state.osc.forEach(o=>{try{o.stop();o.disconnect();}catch(e){}}); state.osc=[]; }
})();
