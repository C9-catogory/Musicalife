
(() => {
  'use strict';
  const DATA = window.ML_DATA;
  const ANIM = window.ML_ANIM;
  const ROUTES = new Set(DATA.routes.map(r=>r[0]));
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const jget = (k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}};
  const state = {
    lang: localStorage.getItem('hs9_lang') || 'zh',
    route: ROUTES.has(location.hash.replace('#','')) ? location.hash.replace('#','') : 'home',
    entered: localStorage.getItem('hs9_entered') === '1',
    simple: localStorage.getItem('hs9_simple') === '1',
    reduced: localStorage.getItem('hs9_reduced') === '1',
    lit: new Set(jget('hs9_lit',[])),
    lab: 'sound',
    term: null,
    query: '',
    raf: 0,
    stopCosmos: null,
    audio: null,
    compose: jget('hs9_compose',{scale:'C_major',tempo:86,grid:Array(16).fill(-1)}),
    life: {preset:'sleep', bpm:62,dynamic:22,lyrics:10,predict:86},
    beings: {a:52,b:68,open:60},
    params: {freq:220,amp:52,phase:0,target:440,h1:1,h2:1,h3:.6,h4:.42,h5:.25,vowel:'a'}
  };
  const C = k => (DATA.copy[state.lang] && DATA.copy[state.lang][k]) || DATA.copy.zh[k] || k;
  const L = obj => obj?.[state.lang] || obj?.zh || obj?.en || obj || '';
  const save = () => {
    localStorage.setItem('hs9_lang', state.lang);
    localStorage.setItem('hs9_entered', state.entered?'1':'0');
    localStorage.setItem('hs9_simple', state.simple?'1':'0');
    localStorage.setItem('hs9_reduced', state.reduced?'1':'0');
    localStorage.setItem('hs9_lit', JSON.stringify([...state.lit]));
    localStorage.setItem('hs9_compose', JSON.stringify(state.compose));
  };
  document.addEventListener('DOMContentLoaded', init);
  function init(){
    document.body.classList.toggle('simple',state.simple);
    document.body.classList.toggle('reduced',state.reduced);
    state.stopCosmos = ANIM.drawCosmos($('#cosmos'), state.reduced);
    bind();
    renderShell();
    render();
  }
  function bind(){
    document.addEventListener('click', e=>{
      const el=e.target.closest('[data-act],[data-route],[data-term],[data-lab],[data-preset],[data-param-toggle]');
      if(!el) return;
      if(el.dataset.route){ e.preventDefault(); route(el.dataset.route); return; }
      const act=el.dataset.act;
      if(act) e.preventDefault();
      if(act==='enter'){state.entered=true; save(); render(); return;}
      if(act==='lang'){state.lang=state.lang==='zh'?'en':'zh'; save(); renderShell(); render(); return;}
      if(act==='simple'){state.simple=!state.simple; document.body.classList.toggle('simple',state.simple); save(); return;}
      if(act==='motion'){state.reduced=!state.reduced; document.body.classList.toggle('reduced',state.reduced); save(); if(state.stopCosmos) state.stopCosmos(); state.stopCosmos=ANIM.drawCosmos($('#cosmos'),state.reduced); return;}
      if(act==='play-lab'){playCurrentLab(); return;}
      if(act==='ratio-tone'){ if(!state.audio) state.audio=ANIM.makeAudio(); ANIM.playFreq(state.audio,Number(el.dataset.freq||220),.55,'sine',.04); return;}
      if(act==='light'){light(el.dataset.id); return;}
      if(act==='close'){closeModal(); return;}
      if(act==='compose-note'){toggleNote(+el.dataset.step,+el.dataset.pitch); return;}
      if(act==='compose-play'){playComposition(); return;}
      if(act==='compose-clear'){state.compose.grid=Array(16).fill(-1); save(); renderCompose(); return;}
      if(act==='compose-random'){randomComposition(); return;}
      if(act==='compose-export'){exportComposition(); return;}
      if(act==='download-png'){downloadMandala(); return;}
      if(act==='preset' || el.dataset.preset){applyPreset(el.dataset.preset); return;}
      if(el.dataset.paramToggle){ const k=el.dataset.paramToggle; state.params[k]=state.params[k]?0:1; renderLab(); return; }
      if(el.dataset.term){openTerm(el.dataset.term); return;}
      if(el.dataset.lab){state.lab=el.dataset.lab; route('lab'); return;}
    });
    document.addEventListener('input', e=>{
      const el=e.target;
      if(el.matches('[data-param]')){
        const k=el.dataset.param; state.params[k]=Number(el.value);
        const out=el.closest('.control')?.querySelector('output'); if(out) out.textContent=Number(el.value).toFixed(el.step && Number(el.step)<1 ? 2 : 0);
        drawActive(); return;
      }
      if(el.id==='scaleSelect'){state.compose.scale=el.value; save(); renderCompose(); return;}
      if(el.id==='tempoInput'){state.compose.tempo=Number(el.value); save(); updateComposeSide(); return;}
      if(el.matches('[data-life]')){
        state.life[el.dataset.life]=Number(el.value);
        const out=el.closest('.control')?.querySelector('output'); if(out) out.textContent=el.value;
        drawActive(); return;
      }
      if(el.matches('[data-being]')){
        state.beings[el.dataset.being]=Number(el.value);
        const out=el.closest('.control')?.querySelector('output'); if(out) out.textContent=el.value;
        drawActive(); return;
      }
      if(el.id==='searchInput'){state.query=el.value.trim().toLowerCase(); renderAtlasList(); return;}
      if(el.id==='vowelSelect'){state.params.vowel=el.value; drawActive(); return;}
    });
    window.addEventListener('hashchange',()=>{
      const r=location.hash.replace('#','')||'home';
      state.route=ROUTES.has(r)?r:'home'; render();
    });
    window.addEventListener('resize',()=>{drawActive();});
  }
  function renderShell(){
    document.documentElement.lang = state.lang==='zh'?'zh-CN':'en';
    $('#app').innerHTML = `
      <header class="topbar">
        <button class="iconbtn" data-route="home" type="button">⌂</button>
        <div class="brand"><i>✦</i><span>Harmonic Starcove</span></div>
        <div class="top-actions">
          <button class="pill hide-sm" data-act="motion" type="button">${C('motion')}</button>
          <button class="pill hide-sm" data-act="simple" type="button">${C('simple')}</button>
          <button class="pill" data-act="lang" type="button">中/EN</button>
        </div>
      </header>
      <section id="view" class="view"></section>
      <nav class="bottomnav">${DATA.routes.map(r=>`<button data-route="${r[0]}" type="button"><span>${r[1]}</span><b>${state.lang==='zh'?r[2]:r[3]}</b></button>`).join('')}</nav>
      <aside id="modal" class="modal" aria-hidden="true"><button class="iconbtn modal-close" data-act="close" type="button">×</button><div id="modalBody"></div></aside>
      <div id="toast" class="toast hidden"></div>
    `;
  }
  function route(r){ state.route=ROUTES.has(r)?r:'home'; if(location.hash!==`#${state.route}`) location.hash=state.route; else render(); }
  function render(){
    $$('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route));
    try{
      const map={home:renderHome,odyssey:renderOdyssey,lab:renderLab,atlas:renderAtlas,pythagoras:renderPythagoras,voice:renderVoice,life:renderLife,beings:renderBeings,compose:renderCompose,library:renderLibrary};
      (map[state.route]||renderHome)();
      requestAnimationFrame(drawActive);
    }catch(err){
      console.error(err);
      $('#view').innerHTML = `<section class="panel"><p class="eyebrow">Recovery</p><h1 class="title-gradient">${state.lang==='zh'?'星河没有熄灭':'The stars are still lit'}</h1><p class="lead">${state.lang==='zh'?'这个页面发生渲染错误，但主导航仍然可用。':'This page hit a render error, but navigation remains available.'}</p><button class="btn primary" data-route="home">${C('home')}</button></section>`;
    }
  }
  function head(title,lead){
    return `<div class="page-head"><div><p class="eyebrow">Musicalife · Harmonic Starcove</p><h1 class="title-gradient">${esc(title)}</h1><p>${esc(lead)}</p></div><div class="actions"><button class="btn ghost" data-route="atlas">◎ ${C('atlas')}</button><button class="btn ghost" data-route="compose">𝄞 ${C('compose')}</button></div></div>`;
  }
  function renderHome(){
    if(!state.entered){
      $('#view').innerHTML=`<section class="gate"><div class="gate-copy"><p class="eyebrow">Musicalife · Harmonic Starcove</p><h1 class="title-gradient">${C('gateTitle')}</h1><p class="lead">${C('gateSub')}</p><p class="lead deep">${state.lang==='zh'?'音乐带给我们生命的激情。音乐给我们生命的勇气。音乐是我们建构的爱的方程式。':'Music gives life passion. Music gives life courage. Music is the equation of love we build.'}</p><div class="actions"><button class="btn primary" data-act="enter">${C('enter')}</button><button class="btn ghost" data-route="compose">𝄞 ${C('compose')}</button><button class="btn ghost" data-route="lab">∿ ${C('lab')}</button></div></div><div class="gate-canvas-wrap"><canvas id="gateCanvas"></canvas></div></section>`;
      loopCanvas('gateCanvas',(c,t)=>ANIM.drawGate(c,t,state.params)); return;
    }
    const pct=Math.round(state.lit.size/DATA.terms.length*100);
    const portals=[
      ['odyssey','☄',C('odyssey'),state.lang==='zh'?'小游戏主线：看见、听见、点亮音乐能力。':'Game path: see, hear and light music skills.','#7ce9ff'],
      ['lab','∿',C('lab'),state.lang==='zh'?'频率、谐波、共振：真正可操作的声学实验。':'Frequency, harmonics and resonance: hands-on acoustics.','#ffe19b'],
      ['compose','𝄞',C('compose'),state.lang==='zh'?'写 16 步旋律，生成简谱、五线谱雏形和曼陀罗。':'Write a 16-step melody and generate notation and mandala.','#ff9fd5'],
      ['voice','◌',C('voice'),state.lang==='zh'?'声源-滤波、元音、Formant 与合唱。':'Source-filter, vowels, formants and choir.','#b99cff'],
      ['life','♡',C('life'),state.lang==='zh'?'按状态选择音乐：BPM、动态、歌词、可预测性。':'Choose music by state: BPM, dynamics, lyrics, predictability.','#aaf2c5'],
      ['beings','✺',C('beings'),state.lang==='zh'?'每个人都是星星：主频、呼吸、边界与共振。':'Each person is a star: center frequency, breath, boundary and resonance.','#fff1aa']
    ];
    $('#view').innerHTML=`<section class="home-grid"><div class="hero-card panel"><p class="eyebrow">Harmonic Starcove · 和谐星旅</p><h1 class="title-gradient">${C('homeTitle')}</h1><p class="lead">${C('homeLead')}</p><div class="mandala-nav">${portals.map(p=>`<button class="portal" data-route="${p[0]}" style="--accent:${p[4]}"><b>${p[1]} ${p[2]}</b><p>${p[3]}</p><span class="pill">${C('open')}</span></button>`).join('')}</div></div><div class="panel"><div class="canvas-wrap"><canvas id="homeCanvas"></canvas></div><div class="stat-grid"><div class="stat"><strong>${state.lit.size}</strong><span>${C('made')}</span><div class="progress"><i style="width:${pct}%"></i></div></div><div class="stat"><strong>${DATA.terms.length}</strong><span>${C('stars')}</span></div><div class="stat"><strong>${Math.min(100,pct+state.compose.grid.filter(n=>n>=0).length*2)}</strong><span>${C('score')}</span></div></div><p class="mini">${state.lang==='zh'?'最终目标：点亮一整片星空，把知识转译成声音、图形和自己的生命节奏。':'Goal: light a whole sky and translate knowledge into sound, image and your own life rhythm.'}</p></div></section>`;
    loopCanvas('homeCanvas',(c)=>ANIM.drawMandala(c,state.compose.grid,-1));
  }
  function renderOdyssey(){
    $('#view').innerHTML=`<section class="page">${head(C('odyssey'), state.lang==='zh'?'每一层都是一个“看见—听见—操作—理解—点亮”的音乐任务。':'Each step is a see-hear-operate-understand-light music task.')}<div class="quest-grid">${DATA.quests.map((q,i)=>`<article class="card" style="--accent:${DATA.galaxies[i%DATA.galaxies.length].color}"><span class="tag">${state.lit.has(q.term)?'✦':'○'} Level ${i+1}</span><h3>${esc(L(q).title)}</h3><p>${esc(L(q).goal)}</p><p class="mini deep"><b>${C('task')}:</b> ${esc(L(q).task)}</p><div class="actions"><button class="btn ghost" data-lab="${q.lab}">${C('open')}</button><button class="pill" data-act="light" data-id="${q.term}">${C('light')}</button></div></article>`).join('')}</div></section>`;
  }
  function labControls(type){
    if(type==='harmonics') return `<div class="toggle-row">${[1,2,3,4,5].map(n=>`<button class="pill ${state.params['h'+n]?'active':''}" data-param-toggle="h${n}" type="button">${n}f</button>`).join('')}</div>${range('freq','Hz',110,440,Number(state.params.freq||220))}${[1,2,3,4,5].map(n=>range('h'+n,`${n}f`,0,1,Number(state.params['h'+n]??(n<4?1:.4)),.05)).join('')}`;
    if(type==='resonance') return `${range('freq','input Hz',110,660,Number(state.params.freq||330))}${range('target','preferred Hz',180,660,Number(state.params.target||440))}`;
    return `${range('freq','frequency Hz',110,880,Number(state.params.freq||220))}${range('amp','amplitude',0,100,Number(state.params.amp||52))}${range('phase','phase °',0,360,Number(state.params.phase||0))}`;
  }
  function range(k,label,min,max,val,step=1){return `<div class="control"><label><span>${label}</span><output>${Number(val).toFixed(step<1?2:0)}</output></label><input data-param="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"></div>`}
  function renderLab(redraw=true){
    const type=state.lab||'sound';
    const termId = type==='harmonics'?'harmonic': type==='resonance'?'resonance':'frequency';
    const term=DATA.terms.find(t=>t.id===termId);
    $('#view').innerHTML=`<section class="page">${head(C('lab'), state.lang==='zh'?'这里不是装饰动画，而是可以听见、拖动、比较和点亮的声学教学。':'This is not decoration: it is acoustics you can hear, drag, compare and light.')}<div class="chips">${['sound','harmonics','resonance'].map(x=>`<button class="pill ${type===x?'active':''}" data-lab="${x}">${x}</button>`).join('')}</div><div class="lab-layout"><div class="canvas-wrap"><canvas id="labCanvas"></canvas></div><aside class="panel control-panel"><h2>${esc(L(term).title)}</h2><p class="lead">${esc(L(term).one)}</p>${labControls(type)}<div class="formula">${formula(type)}</div><div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="${term.id}">${C('learn')}</button></div></aside></div></section>`;
    if(redraw) drawActive();
  }
  function formula(type){if(type==='harmonics')return 'timbre = f + 2f + 3f + ...'; if(type==='resonance') return 'response ↑ when input frequency ≈ preferred frequency'; return 'f = 1 / T · v = fλ';}
  function renderPythagoras(){
    state.lab='ratio';
    $('#view').innerHTML=`<section class="page">${head(C('pythagoras'),state.lang==='zh'?'从毕达哥拉斯比例进入音乐：数字不是枯燥的，它会变成八度、五度、和声与星形结构。':'Enter music through Pythagorean ratio: number becomes octave, fifth, harmony and star structure.')}<div class="lab-layout"><div class="canvas-wrap"><canvas id="ratioCanvas"></canvas></div><aside class="panel"><h2>1:1 · 2:1 · 3:2 · 4:3 · 5:4 · 6:5</h2><p class="lead">${state.lang==='zh'?'点击下面的比例，听见它们如何成为音程。':'Tap ratios and hear how they become intervals.'}</p><div class="toggle-row">${[['1:1',220],['2:1',440],['3:2',330],['4:3',293.33],['5:4',275],['6:5',264]].map(r=>`<button class="pill" data-act="ratio-tone" data-freq="${r[1]}">${r[0]}</button>`).join('')}</div><div class="actions"><button class="btn ghost" data-act="light" data-id="octave">${C('light')}</button><button class="btn ghost" data-act="light" data-id="fifth">${C('light')}</button><button class="btn ghost" data-route="compose">${C('compose')}</button></div></aside></div></section>`;
    loopCanvas('ratioCanvas',(c)=>ANIM.drawLab(c,'ratio',state.params));
  }
  function renderVoice(redraw=true){
    $('#view').innerHTML=`<section class="page">${head(C('voice'),state.lang==='zh'?'声乐学习从声源-滤波开始：声带产生原始声源，声道把它塑造成元音和音色。':'Voice learning begins with source-filter: folds create a source, the tract shapes vowel and timbre.')}<div class="lab-layout"><div class="canvas-wrap"><canvas id="voiceCanvas"></canvas></div><aside class="panel"><h2>${state.lang==='zh'?'声源 → 滤波 → 元音':'Source → filter → vowel'}</h2><p class="lead">${state.lang==='zh'?'切换元音，看 F1/F2 和频谱如何改变。这比抽象说“共鸣”更直观。':'Switch vowels and watch F1/F2 and spectrum shift. This is clearer than vague “resonance”.'}</p><div class="control"><label>Vowel / 元音</label><select id="vowelSelect">${['a','i','u','e','o'].map(v=>`<option ${state.params.vowel===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="formant">${C('learn')}</button></div><div class="formula">voice = source × vocal tract filter</div></aside></div><div class="quest-grid">${['breath','vocal_folds','sovt','formant','vowel','choir'].map(id=>termMini(id)).join('')}</div></section>`;
    if(redraw) drawActive();
  }
  function renderCompose(redraw=true){
    const sc=DATA.scales[state.compose.scale]; const grid=state.compose.grid;
    $('#view').innerHTML=`<section class="page">${head(C('compose'),state.lang==='zh'?'这次真的可以写旋律：选择音阶，点击格子，播放，生成简谱、五线谱雏形和音乐曼陀罗。':'Now you can really write a melody: choose scale, click cells, play, generate notation and mandala.')}<div class="compose-layout"><div class="panel"><div class="actions"><label>${C('choose')} <select id="scaleSelect">${Object.keys(DATA.scales).map(k=>`<option value="${k}" ${k===state.compose.scale?'selected':''}>${state.lang==='zh'?DATA.scales[k].zh:DATA.scales[k].en}</option>`).join('')}</select></label><label>BPM <input id="tempoInput" type="number" min="40" max="180" value="${state.compose.tempo}"></label><button class="btn primary" data-act="compose-play">${C('play')}</button><button class="btn ghost" data-act="compose-random">${state.lang==='zh'?'生成灵感':'Inspire'}</button><button class="btn ghost" data-act="compose-clear">${C('reset')}</button></div><div class="sequencer">${seqGrid(sc,grid)}</div><div id="notation" class="notation">${notation(sc,grid)}</div><div class="actions"><button class="btn gold" data-act="compose-export">${C('export')} JSON</button><button class="btn ghost" data-act="download-png">PNG</button><button class="btn ghost" data-act="light" data-id="mandala">${C('light')}</button></div></div><aside class="panel"><div class="canvas-wrap"><canvas id="mandalaCanvas"></canvas></div><p class="mini">${state.lang==='zh'?'旋律不是只有声音，也可以变成图形、结构和可传递的信息。':'Melody is not only sound; it can become image, structure and transmissible information.'}</p></aside></div></section>`;
    if(redraw) drawActive();
  }
  function seqGrid(sc,grid){
    let html='<div class="seq-label"></div>'; for(let s=0;s<16;s++) html+=`<div class="seq-label">${s+1}</div>`;
    for(let p=7;p>=0;p--){ html+=`<div class="seq-label">${sc.jianpu[p]}</div>`; for(let s=0;s<16;s++) html+=`<button class="seq-cell ${grid[s]===p?'on':''}" data-act="compose-note" data-step="${s}" data-pitch="${p}" type="button" aria-label="step ${s+1} pitch ${p}"></button>`; }
    return html;
  }
  function notation(sc,grid){
    const nums=grid.map(n=>n>=0?sc.jianpu[n]:'·').join(' ');
    const notes=grid.map((n,i)=>n>=0?`<span class="note-dot" style="left:${20+i*5.6}%;top:${72-n*8}px"></span>`:'').join('');
    return `<b>${state.lang==='zh'?'简谱':'Jianpu'}:</b><div class="jianpu">${nums}</div><div class="staff">${[0,1,2,3,4].map(()=>'<div class="line"></div>').join('')}${notes}</div>`;
  }
  function updateComposeSide(){const n=$('#notation'); if(n){const sc=DATA.scales[state.compose.scale]; n.innerHTML=notation(sc,state.compose.grid);} drawActive();}
  function toggleNote(step,pitch){state.compose.grid[step]=state.compose.grid[step]===pitch?-1:pitch; save(); renderCompose();}
  function randomComposition(){const grid=Array(16).fill(-1); for(let i=0;i<16;i++){ if(Math.random()>.28) grid[i]=Math.floor(Math.random()*8); } state.compose.grid=grid; save(); renderCompose();}
  function renderAtlas(){ $('#view').innerHTML=`<section class="page">${head(C('atlas'),state.lang==='zh'?'知识不是列表，而是星星：每颗星都可以继续通往实验、声乐、创作或疗愈。':'Knowledge is not a list but stars: each can lead to lab, voice, creation or care.')}<div class="term-tools"><input id="searchInput" placeholder="${C('search')}" value="${esc(state.query)}"><button class="pill" data-lab="sound">∿ ${C('lab')}</button><button class="pill" data-route="compose">𝄞 ${C('compose')}</button></div><div id="atlasList" class="term-list"></div></section>`; renderAtlasList();}
  function renderAtlasList(){
    const q=state.query; const list=DATA.terms.filter(t=>!q||(`${L(t).title} ${L(t).one} ${t.id}`).toLowerCase().includes(q));
    $('#atlasList').innerHTML=list.map(t=>`<button class="card term-card ${state.lit.has(t.id)?'lit':''}" data-term="${t.id}" style="--accent:${galaxy(t.g).color}"><span class="tag">${state.lit.has(t.id)?'✦':'○'} ${esc(L(galaxy(t.g)))}</span><h3>${esc(L(t).title)}</h3><p>${esc(L(t).one)}</p></button>`).join('');
  }
  function renderLife(redraw=true){
    const p=state.life; $('#view').innerHTML=`<section class="page">${head(C('life'),state.lang==='zh'?'学习如何选择音乐：不是神奇频率，而是 BPM、动态、歌词、可预测性与你当前状态的匹配。':'Learn to choose music: not magic frequency, but matching BPM, dynamics, lyrics and predictability to your state.')}<div class="life-grid"><div class="panel"><div class="canvas-wrap"><canvas id="lifeCanvas"></canvas></div>${['bpm','dynamic','lyrics','predict'].map(k=>rangeLife(k)).join('')}<div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="sleep_music">${C('learn')}</button></div></div><aside class="panel"><h2>${state.lang==='zh'?'状态预设':'State presets'}</h2><div class="preset-list">${DATA.lifePresets.map(pr=>`<button class="${p.preset===pr.id?'active':''}" data-preset="${pr.id}"><b>${state.lang==='zh'?pr.zh:pr.en}</b><br><span class="mini">${state.lang==='zh'?pr.zhText:pr.enText}</span></button>`).join('')}</div></aside></div></section>`; if(redraw) drawActive();
  }
  function rangeLife(k){return `<div class="control"><label><span>${k}</span><output>${state.life[k]}</output></label><input data-life="${k}" type="range" min="${k==='bpm'?40:0}" max="${k==='bpm'?140:100}" value="${state.life[k]}"></div>`}
  function applyPreset(id){const pr=DATA.lifePresets.find(x=>x.id===id); if(!pr)return; state.life={preset:id,...pr.target}; renderLife();}
  function renderBeings(redraw=true){
    $('#view').innerHTML=`<section class="page">${head(C('beings'),state.lang==='zh'?'这是诗性游戏模型：每个生命都是星星，有自己的主频、呼吸、结构和边界。':'A poetic game model: each being is a star with center frequency, breath, structure and boundary.')}<div class="lab-layout"><div class="canvas-wrap"><canvas id="beingsCanvas"></canvas></div><aside class="panel"><h2>${state.lang==='zh'?'相遇如何形成新的音乐':'How meeting creates new music'}</h2>${rangeBeing('a','Star A')}${rangeBeing('b','Star B')}${rangeBeing('open','openness')}<div class="formula">similarity × openness → resonance · difference → tension · complement → harmony</div><div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="life_frequency">${C('learn')}</button></div></aside></div></section>`; if(redraw) drawActive();
  }
  function rangeBeing(k,label){return `<div class="control"><label><span>${label}</span><output>${state.beings[k]}</output></label><input data-being="${k}" type="range" min="0" max="100" value="${state.beings[k]}"></div>`}
  function renderLibrary(){ $('#view').innerHTML=`<section class="page">${head(C('library'),state.lang==='zh'?'继续深入音乐宇宙：每颗星背后都有书、课程、理论和可验证资料。':'Go deeper: behind each star are books, courses, theories and traceable resources.')}<div class="quest-grid">${DATA.library.map(x=>`<article class="card"><span class="tag">${state.lang==='zh'?x[0]:x[1]}</span><h3>${state.lang==='zh'?x[0]:x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div></section>`; }
  function termMini(id){const t=DATA.terms.find(x=>x.id===id); return t?`<button class="card term-card" data-term="${t.id}"><h3>${esc(L(t).title)}</h3><p>${esc(L(t).one)}</p></button>`:'';}
  function openTerm(id){const t=DATA.terms.find(x=>x.id===id); if(!t)return; const g=galaxy(t.g); $('#modalBody').innerHTML=`<span class="tag" style="color:${g.color}">${esc(L(g))}</span><h2>${esc(L(t).title)}</h2><p class="lead">${esc(L(t).one)}</p><h3>${C('why')}</h3><p>${esc(L(t).deep)}</p><h3>${C('how')}</h3><p>${esc(L(t).use||L(t).deep)}</p><div class="actions"><button class="btn primary" data-act="light" data-id="${t.id}">${C('learn')}</button>${t.lab?.startsWith('lab')?`<button class="btn ghost" data-lab="${t.lab.split(':')[1]}">${C('lab')}</button>`:''}<button class="btn ghost" data-route="compose">${C('compose')}</button></div>`; $('#modal').classList.add('open');}
  function closeModal(){ $('#modal').classList.remove('open'); }
  function galaxy(id){return DATA.galaxies.find(g=>g.id===id)||DATA.galaxies[0];}
  function light(id){ if(id){state.lit.add(id); save(); toast(`✦ ${state.lang==='zh'?'已点亮':'Lit'}: ${id}`); render();} }
  function toast(msg){const el=$('#toast'); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1600);}
  function loopCanvas(id,draw){ cancelAnimationFrame(state.raf); const c=$('#'+id); if(!c)return; const frame=(t)=>{draw(c,t*.001); if(!state.reduced) state.raf=requestAnimationFrame(frame);}; state.raf=requestAnimationFrame(frame);}
  function drawActive(){
    if($('#labCanvas')) loopCanvas('labCanvas',(c)=>ANIM.drawLab(c,state.lab,state.params));
    if($('#voiceCanvas')) loopCanvas('voiceCanvas',(c)=>ANIM.drawLab(c,'voice',state.params));
    if($('#lifeCanvas')) loopCanvas('lifeCanvas',(c)=>ANIM.drawLab(c,'life',state.life));
    if($('#beingsCanvas')) loopCanvas('beingsCanvas',(c)=>ANIM.drawLab(c,'beings',state.beings));
    if($('#mandalaCanvas')) ANIM.drawMandala($('#mandalaCanvas'),state.compose.grid,-1);
  }
  function playCurrentLab(){
    if(!state.audio) state.audio=ANIM.makeAudio();
    const a=state.audio; if(!a)return; if(a.state==='suspended') a.resume();
    if($('#voiceCanvas')) { const v=state.params.vowel||'a'; const map={a:440,i:660,u:330,e:550,o:392}; ANIM.playFreq(a,map[v],.55,'sawtooth',.035); return; }
    if($('#lifeCanvas')) { ANIM.playFreq(a,220,.18,'sine',.03); setTimeout(()=>ANIM.playFreq(a,277,.22,'triangle',.025),180); return; }
    if($('#beingsCanvas')) { ANIM.playFreq(a,180+state.beings.a*4,.55,'sine',.03); ANIM.playFreq(a,180+state.beings.b*4,.55,'triangle',.03); return; }
    const type=state.lab;
    if(type==='harmonics'){[1,2,3,4,5].forEach(n=>{ if(Number(state.params['h'+n]||0)>0) ANIM.playFreq(a,Number(state.params.freq||220)*n,.6,'sine',.018*Number(state.params['h'+n]));});}
    else if(type==='resonance'){ANIM.playFreq(a,Number(state.params.freq||330),.55,'sine',.04);}
    else ANIM.playFreq(a,Number(state.params.freq||220),.55,'sine',.045);
  }
  function playComposition(){
    if(!state.audio) state.audio=ANIM.makeAudio(); const a=state.audio; if(!a)return;
    const sc=DATA.scales[state.compose.scale];
    const notes=state.compose.grid.map(n=>n>=0?sc.notes[n]:null);
    const stepMs=ANIM.playMelody(a,notes,state.compose.tempo,'triangle');
    let i=0; const cells=$$('.seq-cell'); const timer=setInterval(()=>{cells.forEach(c=>c.classList.remove('playing')); $$(`.seq-cell[data-step="${i}"]`).forEach(c=>c.classList.add('playing')); ANIM.drawMandala($('#mandalaCanvas'),state.compose.grid,i); i++; if(i>=16){clearInterval(timer); setTimeout(()=>cells.forEach(c=>c.classList.remove('playing')),300)}}, stepMs||250);
  }
  function exportComposition(){
    const sc=DATA.scales[state.compose.scale];
    const payload={title:'Harmonic Starcove melody',scale:state.compose.scale,tempo:state.compose.tempo,notes:state.compose.grid.map(n=>n>=0?sc.notes[n]:null),jianpu:state.compose.grid.map(n=>n>=0?sc.jianpu[n]:'0')};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='harmonic-starcove-melody.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  function downloadMandala(){const c=$('#mandalaCanvas'); if(!c)return; const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='harmonic-starcove-mandala.png'; a.click();}
})();
