
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
    lang: localStorage.getItem('hs18_lang') || localStorage.getItem('hs17_lang') || localStorage.getItem('hs16_lang') || localStorage.getItem('hs15_lang') || localStorage.getItem('hs14_lang') || localStorage.getItem('hs13_lang') || localStorage.getItem('hs12_lang') || localStorage.getItem('hs9_lang') || 'zh',
    route: ROUTES.has(location.hash.replace('#','')) ? location.hash.replace('#','') : 'home',
    entered: (localStorage.getItem('hs18_entered') || localStorage.getItem('hs17_entered') || localStorage.getItem('hs16_entered') || localStorage.getItem('hs15_entered') || localStorage.getItem('hs14_entered') || localStorage.getItem('hs13_entered') || localStorage.getItem('hs12_entered') || localStorage.getItem('hs9_entered')) === '1',
    simple: (localStorage.getItem('hs18_simple') || localStorage.getItem('hs17_simple') || localStorage.getItem('hs16_simple') || localStorage.getItem('hs15_simple') || localStorage.getItem('hs14_simple') || localStorage.getItem('hs13_simple') || localStorage.getItem('hs12_simple') || localStorage.getItem('hs9_simple')) === '1',
    reduced: (localStorage.getItem('hs18_reduced') || localStorage.getItem('hs17_reduced') || localStorage.getItem('hs16_reduced') || localStorage.getItem('hs15_reduced') || localStorage.getItem('hs14_reduced') || localStorage.getItem('hs13_reduced') || localStorage.getItem('hs12_reduced') || localStorage.getItem('hs9_reduced')) === '1',
    lit: new Set(jget('hs18_lit', jget('hs17_lit', jget('hs16_lit', jget('hs15_lit', jget('hs14_lit', jget('hs13_lit', jget('hs12_lit', jget('hs9_lit', []))))))))),
    lab: 'sound',
    term: null,
    query: '',
    atlasFilter: 'all',
    expandedGalaxy: localStorage.getItem('hs18_expandedGalaxy') || localStorage.getItem('hs17_expandedGalaxy') || localStorage.getItem('hs15_expandedGalaxy') || 'create',
    uiMode: localStorage.getItem('hs18_uiMode') || localStorage.getItem('hs17_uiMode') || localStorage.getItem('hs16_uiMode') || localStorage.getItem('hs15_uiMode') || 'quick',
    activeTrack: localStorage.getItem('hs18_activeTrack') || localStorage.getItem('hs17_activeTrack') || 'melody',
    voiceTrainer: {mode:'pitch',targetFreq:261.63,currentFreq:0,cents:0,level:0,mic:false,status:''},
    drawMelody: {points:[], bound:false, smoothing:.62, sensitivity:.72, snap:'scale', lineStyle:'smooth', quantize:8},
    raf: 0,
    rafs: {},
    stopCosmos: null,
    audio: null,
    compose: jget('hs18_compose', jget('hs17_compose', jget('hs16_compose', jget('hs15_compose', jget('hs14_compose', jget('hs13_compose', jget('hs12_compose', {scale:'C_major',tempo:84,steps:32,instrument:'warmPiano',purpose:'daily',emotion:'focus',naturalize:true,vocalGuide:true,syllable:'hum',drums:true,grid:Array(32).fill(-1)}))))))),
    life: {preset:'sleep', bpm:62,dynamic:22,lyrics:10,predict:86},
    beings: {a:52,b:68,c:42,open:60,ratioMode:'triad'},
    params: {freq:220,amp:52,phase:0,target:440,h1:1,h2:1,h3:.6,h4:.42,h5:.25,vowel:'a', voiceLesson:'breath'}
  };

  function normalizeComposition(){
    if(!state.compose || typeof state.compose !== 'object') state.compose={};
    state.compose.scale = state.compose.scale || 'C_major';
    state.compose.tempo = Number(state.compose.tempo || 86);
    state.compose.steps = Number(state.compose.steps || (Array.isArray(state.compose.grid)?state.compose.grid.length:32) || 32);
    if(![16,32,64,128].includes(state.compose.steps)) state.compose.steps = 32;
    state.compose.instrument = state.compose.instrument || 'softBell';
    state.compose.purpose = state.compose.purpose || 'daily';
    state.compose.emotion = state.compose.emotion || 'focus';
    state.compose.layers = state.compose.layers || {melody:true,bass:true,chords:true,pulse:true,drums:true};
    if(state.compose.layers.pulse === undefined) state.compose.layers.pulse = true;
    if(state.compose.layers.drums === undefined) state.compose.layers.drums = true;
    state.compose.naturalize = state.compose.naturalize !== false;
    state.compose.vocalGuide = state.compose.vocalGuide !== false;
    state.compose.syllable = state.compose.syllable || 'hum';
    state.compose.drums = state.compose.drums !== false;
    state.compose.chords = Array.isArray(state.compose.chords) ? state.compose.chords : ['I','V','vi','IV'];
    state.compose.accidentals = state.compose.accidentals && typeof state.compose.accidentals==='object' ? state.compose.accidentals : {};
    state.compose.sections = state.compose.sections || [
      {id:'intro',start:0,length:8,color:'blue'},
      {id:'A',start:8,length:16,color:'gold'},
      {id:'B',start:24,length:16,color:'rose'},
      {id:'return',start:40,length:8,color:'green'}
    ];
    if(!Array.isArray(state.compose.grid)) state.compose.grid = [];
    while(state.compose.grid.length < state.compose.steps) state.compose.grid.push(-1);
    if(state.compose.grid.length > state.compose.steps) state.compose.grid = state.compose.grid.slice(0,state.compose.steps);
  }
  normalizeComposition();

  const C = k => (DATA.copy[state.lang] && DATA.copy[state.lang][k]) || DATA.copy.zh[k] || k;
  const L = obj => obj?.[state.lang] || obj?.zh || obj?.en || obj || '';
  const save = () => {
    localStorage.setItem('hs18_lang', state.lang);
    localStorage.setItem('hs18_entered', state.entered?'1':'0');
    localStorage.setItem('hs18_simple', state.simple?'1':'0');
    localStorage.setItem('hs18_reduced', state.reduced?'1':'0');
    localStorage.setItem('hs18_lit', JSON.stringify([...state.lit]));
    localStorage.setItem('hs18_compose', JSON.stringify(state.compose));
    localStorage.setItem('hs18_uiMode', state.uiMode);
    localStorage.setItem('hs18_activeTrack', state.activeTrack||'melody');
    localStorage.setItem('hs18_expandedGalaxy', state.expandedGalaxy);
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
      const el=e.target.closest('[data-act],[data-route],[data-term],[data-lab],[data-preset],[data-param-toggle],[data-filter],[data-voice-lesson],[data-soundlab],[data-voice-mode],[data-layer],[data-syllable],[data-ratio-mode],[data-ui-mode],[data-start-mode],[data-galaxy],[data-track],[data-voice-trainer],[data-template]');
      if(!el) return;
      if(el.dataset.route){ e.preventDefault(); closeModal(); route(el.dataset.route); return; }
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
      if(act==='draw-to-melody'){drawLineToMelody(); return;}
      if(act==='draw-clear'){state.drawMelody.points=[]; save(); drawActive(); return;}
      if(act==='start-mic'){startMicTrainer(); return;}
      if(act==='stop-mic'){stopMicTrainer(); return;}
      if(act==='play-target'){playTargetTone(); return;}
      if(act==='drum-hit'){toast(state.lang==='zh'?'鼓点已加入当前身体节奏':'Drum step added to body pulse'); return;}
      if(act==='compose-note'){toggleNote(+el.dataset.step,+el.dataset.pitch); return;}
      if(act==='compose-play'){playComposition(); return;}
      if(act==='vocal-guide-play'){playVocalGuide(); return;}
      if(act==='compose-naturalize'){naturalizeComposition(); return;}
      if(act==='toggle-natural'){state.compose.naturalize=!state.compose.naturalize; save(); renderCompose(); return;}
      if(act==='toggle-vocal'){state.compose.vocalGuide=!state.compose.vocalGuide; save(); renderCompose(); return;}
      if(act==='toggle-drums'){state.compose.layers=state.compose.layers||{}; state.compose.layers.drums=!state.compose.layers.drums; save(); renderCompose(); return;}
      if(act==='compose-wav'){exportWav(); return;}
      if(act==='compose-midi'){exportMidi(); return;}
      if(act==='compose-musicxml'){exportMusicXML(); return;}
      if(act==='purpose'){applyPurpose(el.dataset.id); return;}
      if(act==='chord'){ toggleChord(el.dataset.id); return;}
      if(act==='emotion'){applyEmotion(el.dataset.id); return;}
      if(act==='voice-lesson'){state.params.lesson=el.dataset.id; renderVoice(); return;}
      if(act==='compose-clear'){state.compose.grid=Array(state.compose.steps||32).fill(-1); save(); renderCompose(); return;}
      if(act==='compose-random'){randomComposition(); return;}
      if(act==='compose-export'){exportComposition(); return;}
      if(act==='download-png'){downloadMandala('mandala'); return;}
      if(act==='download-wallpaper'){downloadMandala('wallpaper'); return;}
      if(act==='preset' || el.dataset.preset){applyPreset(el.dataset.preset); return;}
      if(el.dataset.voiceMode){ state.params.voiceMode=el.dataset.voiceMode; drawActive(); return; }
      if(el.dataset.syllable){ state.compose.syllable=el.dataset.syllable; save(); renderCompose(); return; }
      if(el.dataset.layer){ state.compose.layers=state.compose.layers||{}; state.compose.layers[el.dataset.layer]=!state.compose.layers[el.dataset.layer]; save(); renderCompose(); return; }
      if(el.dataset.ratioMode){ state.beings.ratioMode=el.dataset.ratioMode; drawActive(); return; }
      if(el.dataset.uiMode){ state.uiMode=el.dataset.uiMode; save(); render(); return; }
      if(el.dataset.startMode){ const m=(DATA.startModes||[]).find(x=>x.id===el.dataset.startMode); if(m){ state.uiMode=m.mode||'quick'; state.entered=true; save(); route(m.route||'home'); } return; }
      if(el.dataset.template){ applyComposeTemplate(el.dataset.template); return; }
      if(el.dataset.track){ state.activeTrack=el.dataset.track; save(); renderCompose(); return; }
      if(el.dataset.voiceTrainer){ state.voiceTrainer=state.voiceTrainer||{}; state.voiceTrainer.mode=el.dataset.voiceTrainer; renderVoice(true); return; }
      if(el.dataset.galaxy){ state.expandedGalaxy=el.dataset.galaxy; save(); renderAtlas(); return; }
      if(el.dataset.filter){ state.atlasFilter=el.dataset.filter; renderAtlas(); return; }
      if(el.dataset.voiceLesson){ state.params.voiceLesson=el.dataset.voiceLesson; renderVoice(); return; }
      if(el.dataset.soundlab){ state.lab=el.dataset.soundlab; closeModal(); route('lab'); return; }
      if(el.dataset.paramToggle){ const k=el.dataset.paramToggle; state.params[k]=state.params[k]?0:1; renderLab(); return; }
      if(el.dataset.term){openTerm(el.dataset.term); return;}
      if(el.dataset.lab){state.lab=el.dataset.lab; route('lab'); return;}
    });
    document.addEventListener('input', e=>{
      const el=e.target;
      if(el.matches('[data-draw-param]')){
        const k=el.dataset.drawParam; state.drawMelody=state.drawMelody||{};
        state.drawMelody[k]= el.tagName==='SELECT' ? el.value : Number(el.value);
        save(); drawActive(); return;
      }
      if(el.matches('[data-trainer-param]')){
        const k=el.dataset.trainerParam; state.voiceTrainer=state.voiceTrainer||{}; state.voiceTrainer[k]=Number(el.value);
        const out=el.closest('.control')?.querySelector('output'); if(out) out.textContent=Number(el.value).toFixed(k==='level'?2:0);
        drawActive(); return;
      }
      if(el.matches('[data-param]')){
        const k=el.dataset.param; state.params[k]=Number(el.value);
        const out=el.closest('.control')?.querySelector('output'); if(out) out.textContent=Number(el.value).toFixed(el.step && Number(el.step)<1 ? 2 : 0);
        drawActive(); return;
      }
      if(el.id==='purposeSelect'){applyPurpose(el.value); return;}
      if(el.id==='emotionSelect'){applyEmotion(el.value); return;}
      if(el.id==='scaleSelect'){state.compose.scale=el.value; save(); renderCompose(); return;}
      if(el.id==='instrumentSelect'){state.compose.instrument=el.value; save(); updateComposeSide(); return;}
      if(el.matches('[data-chord-select]')){ state.compose.chords=state.compose.chords||['I','V','vi','IV']; state.compose.chords[Number(el.dataset.chordSelect)]=el.value; save(); renderCompose(); return; }
      if(el.id==='stepsSelect'){resizeComposition(Number(el.value)); return;}
      if(el.id==='tempoInput' || el.id==='tempoRange'){state.compose.tempo=Number(el.value); save(); syncTempoInputs(); updateComposeSide(); return;}
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
  function route(r){ state.route=ROUTES.has(r)?r:'home'; window.scrollTo({top:0,behavior:'smooth'}); $('#view')?.scrollIntoView({block:'start'}); if(location.hash!==`#${state.route}`) location.hash=state.route; else render(); }
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
    const modes=DATA.startModes||[];
    if(!state.entered){
      $('#view').innerHTML=`<section class="gate"><div class="gate-copy"><p class="eyebrow">Musicalife · Harmonic Starcove</p><h1 class="title-gradient">${C('gateTitle')}</h1><p class="lead">${C('gateSub')}</p><p class="lead deep">${state.lang==='zh'?'先选择一种入口：直接创作，或进入教学。每一种入口都可以随时切换。':'Choose an entrance first: create directly, or enter teaching. You can switch anytime.'}</p><div class="mode-strip"><button class="pill ${state.uiMode==='quick'?'active':''}" data-ui-mode="quick">⚡ ${C('quick')||'Quick'}</button><button class="pill ${state.uiMode==='teach'?'active':''}" data-ui-mode="teach">✦ ${C('teach')||'Teach'}</button><button class="pill" data-act="lang">中/EN</button><button class="pill" data-act="motion">${C('motion')}</button></div><div class="start-mode-grid">${modes.map((m,i)=>`<button class="start-card" style="--accent:${['#7ce9ff','#ff9fd5','#ffe19b','#aaf2c5','#b99cff','#fff1aa'][i%6]}" data-start-mode="${m.id}"><i>${m.icon}</i><b>${state.lang==='zh'?m.zh:m.en}</b><p>${state.lang==='zh'?m.zhText:m.enText}</p></button>`).join('')}</div><div class="actions"><button class="btn primary" data-act="enter">${C('enter')}</button><button class="btn ghost" data-start-mode="quickCompose">𝄞 ${state.lang==='zh'?'快速开始':'Quick start'}</button></div></div><div class="gate-canvas-wrap"><canvas id="gateCanvas"></canvas></div></section>`;
      loopCanvas('gateCanvas',(c,t)=>ANIM.drawGate(c,t,state.params)); return;
    }
    const pct=Math.round(state.lit.size/DATA.terms.length*100);
    const paths=DATA.learningPaths||[];
    $('#view').innerHTML=`<section class="home-grid"><div class="hero-card panel"><p class="eyebrow">Harmonic Starcove</p><h1 class="title-gradient">${C('homeTitle')}</h1><p class="lead">${C('homeLead')}</p><div class="mode-strip"><button class="pill ${state.uiMode==='quick'?'active':''}" data-ui-mode="quick">⚡ ${C('quick')||'Quick'}</button><button class="pill ${state.uiMode==='teach'?'active':''}" data-ui-mode="teach">✦ ${C('teach')||'Teach'}</button></div><div class="start-mode-grid">${modes.map((m,i)=>`<button class="start-card" style="--accent:${['#7ce9ff','#ff9fd5','#ffe19b','#aaf2c5','#b99cff','#fff1aa'][i%6]}" data-start-mode="${m.id}"><i>${m.icon}</i><b>${state.lang==='zh'?m.zh:m.en}</b><p>${state.lang==='zh'?m.zhText:m.enText}</p></button>`).join('')}</div></div><div class="panel"><div class="canvas-wrap"><canvas id="homeCanvas"></canvas></div><div class="stat-grid"><div class="stat"><strong>${state.lit.size}</strong><span>${C('made')}</span><div class="progress"><i style="width:${pct}%"></i></div></div><div class="stat"><strong>${DATA.terms.length}</strong><span>${C('stars')}</span></div><div class="stat"><strong>${paths.length}</strong><span>${state.lang==='zh'?'学习路径':'paths'}</span></div></div><p class="mini">${state.lang==='zh'?'下方模式可直接进入操作；想学原理时切换到教学。':'Use the cards to operate directly; switch to teaching for principles.'}</p></div></section><section class="path-grid">${paths.map(p=>pathCard(p)).join('')}</section>`;
    loopCanvas('homeCanvas',(c)=>ANIM.drawMandala(c,state.compose.grid,-1));
  }
  function pathCard(p){
    return `<article class="card path-card" style="--accent:${galaxyForPath(p.id)}"><span class="big-ico">${p.icon}</span><h3>${esc(state.lang==='zh'?p.zh:p.en)}</h3><p>${esc(state.lang==='zh'?p.zhLead:p.enLead)}</p><div class="skill-strip">${(p.skills||[]).slice(0,6).map(id=>`<span>${esc(termName(id))}</span>`).join('')}</div><div class="actions"><button class="btn ghost" data-route="${p.route}">${C('open')}</button></div></article>`;
  }
  function termName(id){const t=DATA.terms.find(x=>x.id===id); return t?L(t).title:id;}
  function galaxyForPath(id){return {hear:'#7ce9ff',sing:'#ff9fd5',compose:'#ffe19b',choose:'#aaf2c5',listen:'#b99cff',express:'#fff1aa'}[id]||'#7ce9ff';}
function renderOdyssey(){
    const paths=DATA.learningPaths||[];
    $('#view').innerHTML=`<section class="page">${head(C('odyssey'), state.lang==='zh'?'六条主线把音乐知识变成能力：每一步都对应动画、声音、练习、创作与点亮反馈。':'Six paths turn music knowledge into ability: each step links to animation, sound, practice, creation and starlight feedback.')}
      <div class="path-grid">${paths.map(p=>pathCard(p)).join('')}</div>
      <h2>${state.lang==='zh'?'当前任务':'Current quests'}</h2>
      <div class="quest-grid">${DATA.quests.map((q,i)=>`<article class="card" style="--accent:${DATA.galaxies[i%DATA.galaxies.length].color}"><span class="tag">${state.lit.has(q.term)?'✦':'○'} Level ${i+1}</span><h3>${esc(L(q).title)}</h3><p>${esc(L(q).goal)}</p><p class="mini deep"><b>${C('task')}:</b> ${esc(L(q).task)}</p><div class="actions"><button class="btn ghost" data-lab="${q.lab}">${C('open')}</button><button class="pill" data-act="light" data-id="${q.term}">${C('light')}</button></div></article>`).join('')}</div></section>`;
  }
function labControls(type){
    const chip=(id,label)=>`<button class="${state.params.labPreset===id?'active':''}" data-param-toggle="${id}" type="button">${label}</button>`;
    const quick=`<div class="lab-quick-controls">${[
      ['hear',state.lang==='zh'?'听变化':'hear change'],
      ['compose',state.lang==='zh'?'转成创作':'to compose'],
      ['sing',state.lang==='zh'?'用于唱歌':'for singing'],
      ['care',state.lang==='zh'?'用于疗愈':'for care']
    ].map(x=>chip(x[0],x[1])).join('')}</div>`;
    if(type==='harmonics' || type==='spectrum') return quick+`<div class="toggle-row">${[1,2,3,4,5].map(n=>`<button class="pill ${state.params['h'+n]?'active':''}" data-param-toggle="h${n}" type="button">${n}f</button>`).join('')}</div>${range('freq','Hz',80,660,Number(state.params.freq||220))}${[1,2,3,4,5].map(n=>range('h'+n,`${n}f`,0,1,Number(state.params['h'+n]??(n<4?1:.4)),.05)).join('')}`;
    if(type==='resonance') return quick+`${range('freq','input Hz',80,880,Number(state.params.freq||330))}${range('target','preferred Hz',120,880,Number(state.params.target||440))}${range('amp','energy',0,100,Number(state.params.amp||52))}`;
    if(type==='tempo' || type==='rhythmDensity') return quick+`${range('tempo','BPM',40,180,Number(state.params.tempo||84))}${range('density','density',0,100,Number(state.params.density||55))}${range('accent','accent',0,100,Number(state.params.accent||65))}`;
    if(type==='noise') return quick+`${range('noiseSlope','noise color',0,100,Number(state.params.noiseSlope||45))}${range('amp','softness',0,100,Number(state.params.amp||52))}`;
    if(type==='chordTension' || type==='scaleColor') return quick+`${range('tension','tension',0,100,Number(state.params.tension||45))}${range('resolution','resolution',0,100,Number(state.params.resolution||65))}`;
    return quick+`${range('freq','frequency Hz',80,880,Number(state.params.freq||220))}${range('amp','amplitude',0,100,Number(state.params.amp||52))}${range('phase','phase °',0,360,Number(state.params.phase||0))}`;
  }
  function range(k,label,min,max,val,step=1){return `<div class="control"><label><span>${label}</span><output>${Number(val).toFixed(step<1?2:0)}</output></label><input data-param="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"></div>`}
  function renderLab(redraw=true){
    const labs=DATA.soundLabs||[];
    const type=state.lab||'sound';
    const lab=labs.find(x=>x.id===type)||labs[0]||{id:'sound',term:'frequency',zh:'频率与音高',en:'Frequency & pitch',formula:'f=1/T'};
    const term=DATA.terms.find(t=>t.id===lab.term)||DATA.terms.find(t=>t.id==='frequency');
    $('#view').innerHTML=`<section class="page">${head(C('lab'), state.lang==='zh'?'声学实验库：每个知识点都应该有对应动画，而不是都跳到同一个实验。':'Sound lab library: each knowledge point should have a matching animation, not one generic lab.')}
      <div class="sound-lab-grid">${labs.map(l=>`<button class="${type===l.id?'active':''}" data-soundlab="${l.id}"><b>${state.lang==='zh'?l.zh:l.en}</b><br><span class="mini">${l.formula}</span></button>`).join('')}</div>
      <div class="lab-layout">
        <div class="canvas-wrap"><canvas id="labCanvas"></canvas></div>
        <aside class="panel control-panel">
          <h2>${esc(state.lang==='zh'?lab.zh:lab.en)}</h2>
          <p class="lead">${esc(L(term).one)}</p>
          ${labControls(type)}
          <div class="formula">${esc(lab.formula||formula(type))}</div>
          <div class="use-grid">
            <div class="use"><b>${state.lang==='zh'?'用于创作':'For composing'}</b><p class="mini">${state.lang==='zh'?'把这个参数转成旋律、节奏、音色或结构选择。':'Turn this parameter into melody, rhythm, timbre or form choices.'}</p></div>
            <div class="use"><b>${state.lang==='zh'?'用于聆听':'For listening'}</b><p class="mini">${state.lang==='zh'?'听见它如何改变身体感和情绪预测。':'Hear how it changes body-feeling and prediction.'}</p></div>
            <div class="use"><b>${state.lang==='zh'?'用于疗愈':'For care'}</b><p class="mini">${state.lang==='zh'?'降低干扰、控制密度、找到安全锚点。':'Reduce interference, control density and find safe anchors.'}</p></div>
          </div>
          <div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="${term.id}">${C('learn')}</button></div>
        </aside>
      </div></section>`;
    if(redraw) drawActive();
  }
function renderPythagoras(){
    state.lab='ratio';
    $('#view').innerHTML=`<section class="page">${head(C('pythagoras'),state.lang==='zh'?'从毕达哥拉斯比例进入音乐：数字不是枯燥的，它会变成八度、五度、和声与星形结构。':'Enter music through Pythagorean ratio: number becomes octave, fifth, harmony and star structure.')}<div class="lab-layout"><div class="canvas-wrap"><canvas id="ratioCanvas"></canvas></div><aside class="panel"><h2>1:1 · 2:1 · 3:2 · 4:3 · 5:4 · 6:5</h2><p class="lead">${state.lang==='zh'?'点击下面的比例，听见它们如何成为音程。':'Tap ratios and hear how they become intervals.'}</p><div class="toggle-row">${[['1:1',220],['2:1',440],['3:2',330],['4:3',293.33],['5:4',275],['6:5',264]].map(r=>`<button class="pill" data-act="ratio-tone" data-freq="${r[1]}">${r[0]}</button>`).join('')}</div><div class="actions"><button class="btn ghost" data-act="light" data-id="octave">${C('light')}</button><button class="btn ghost" data-act="light" data-id="fifth">${C('light')}</button><button class="btn ghost" data-route="compose">${C('compose')}</button></div></aside></div></section>`;
    loopCanvas('ratioCanvas',(c)=>ANIM.drawLab(c,'ratio',state.params));
  }
  
function trainerScores(){
    const vt=state.voiceTrainer||{}; const target=vt.targetFreq||261.63; const current=vt.currentFreq||0;
    const cents=current?1200*Math.log2(current/target):999;
    const pitch=Math.max(0,Math.min(100,100-Math.abs(cents)*1.9));
    const stable=Math.max(0,Math.min(100,100-Math.abs(cents)*1.1-(vt.jitter||0)*2));
    const breath=Math.max(0,Math.min(100,(vt.level||0)*120));
    const rhythm=Math.max(35,Math.min(100, 78 + ((state.compose.grid||[]).filter(n=>n<0).length/(state.compose.grid?.length||32))*22));
    return {pitch:Math.round(pitch),stable:Math.round(stable),breath:Math.round(breath),rhythm:Math.round(rhythm),cents:Math.round(cents)};
  }
  function scoreCard(key,label,val){
    return `<div class="score-card"><b>${label}</b><span id="score-${key}">${val}</span><div class="score-bar"><i id="bar-${key}" style="width:${Math.max(0,Math.min(100,val))}%"></i></div></div>`;
  }
  function renderVoice(redraw=true){
    const lessons=DATA.voiceCurriculum||[];
    const active=state.params.voiceLesson||'breath';
    const lesson=lessons.find(x=>x.id===active)||lessons[0];
    const trainers=DATA.voiceTrainers||[];
    const mode=state.voiceTrainer?.mode||'pitch';
    const trainer=trainers.find(t=>t.id===mode)||trainers[0]||{};
    const theoryList = state.uiMode==='quick' ? lessons.filter(l=>['posture','breath','folds','sovt','vowel','phrase','dynamics','emotion'].includes(l.id)) : lessons;
    $('#view').innerHTML=`<section class="page">${head(C('voice'),state.lang==='zh'?'歌唱工作室：可以直接训练，也可以展开原理。先练音准、气息、节奏和表达，再按需打开身体/声带/共鸣/咬字知识。':'Singing studio: train directly, and unfold principles when needed. Practice pitch, breath, rhythm and expression, then open body/fold/resonance/diction knowledge as needed.')}
      ${composeModeBar()}
      <div class="panel voice-flow-panel">
        <h2>${state.lang==='zh'?'从感受到歌声：总流程':'From feeling to song: full flow'}</h2>
        <div class="voice-flow-wrap"><canvas id="voiceFlowCanvas"></canvas></div>
        <p class="mini">${state.lang==='zh'?'感受先变成身体方向，再变成气流、声带振动、声道滤波、咬字、强弱、节奏和乐句。下面可以直接训练，也可以展开看原理。':'Feeling becomes body direction, airflow, fold vibration, tract filtering, diction, dynamics, rhythm and phrasing. Train first, unfold explanations when needed.'}</p>
      </div>
      <div class="voice-lab-layout">
        <aside class="panel">
          <h2>${state.lang==='zh'?'训练器':'Trainer'}</h2>
          <div class="voice-trainer-tabs compact">${trainers.map(t=>`<button class="${mode===t.id?'active':''}" data-voice-trainer="${t.id}"><b>${t.icon||'✦'} ${state.lang==='zh'?t.zh:t.en}</b><span class="mini">${state.lang==='zh'?t.zhGoal:t.enGoal}</span></button>`).join('')}</div>
          <div class="trainer-readout">
            <div class="meter-card"><b>${state.lang==='zh'?'目标':'Target'}</b><span id="voiceTargetHz">${Math.round(state.voiceTrainer?.targetFreq||261.63)} Hz</span></div>
            <div class="meter-card"><b>${state.lang==='zh'?'当前':'Current'}</b><span id="voiceCurrentHz">${state.voiceTrainer?.currentFreq?Math.round(state.voiceTrainer.currentFreq)+' Hz':'—'}</span></div>
            <div class="meter-card"><b>${state.lang==='zh'?'反馈':'Feedback'}</b><span id="voiceFeedback" class="pitch-status">${voiceFeedback()}</span></div>
          </div>
          <div class="voice-score-grid">${(()=>{const s=trainerScores();return scoreCard('pitch',state.lang==='zh'?'音准':'Pitch',s.pitch)+scoreCard('stable',state.lang==='zh'?'稳定':'Stability',s.stable)+scoreCard('breath',state.lang==='zh'?'气息':'Breath',s.breath)+scoreCard('rhythm',state.lang==='zh'?'节奏':'Rhythm',s.rhythm)})()}</div>
          <div class="actions">
            <button class="btn primary" data-act="play-target">${state.lang==='zh'?'听目标音':'Target tone'}</button>
            <button class="btn ghost" data-act="start-mic">${state.voiceTrainer?.mic?(state.lang==='zh'?'重新开始麦克风':'Restart mic'):(state.lang==='zh'?'打开麦克风':'Start mic')}</button>
            <button class="btn ghost" data-act="stop-mic">${state.lang==='zh'?'停止麦克风':'Stop mic'}</button>
          </div>
          <div class="control"><label><span>${state.lang==='zh'?'目标音高':'Target pitch'}</span><output>${Math.round(state.voiceTrainer?.targetFreq||261.63)}</output></label><input data-trainer-param="targetFreq" type="range" min="130" max="660" value="${state.voiceTrainer?.targetFreq||261.63}"></div>
          ${mode==='breath'?`<div class="control"><label><span>${state.lang==='zh'?'目标稳定度':'Target steadiness'}</span><output>${Math.round((state.voiceTrainer?.level||0.45)*100)}</output></label><input data-trainer-param="level" type="range" min="0" max="1" step="0.01" value="${state.voiceTrainer?.level||0.45}"></div>`:''}
          <p class="mini">${state.lang==='zh'?trainer.zhGoal:trainer.enGoal}</p>
        </aside>
        <section class="panel">
          <h2>${state.lang==='zh'?trainer.zh:trainer.en}</h2>
          <div class="voice-trainer-canvas"><canvas id="voiceTrainerCanvas"></canvas></div>
          <details class="teaching-overlay"><summary>${state.lang==='zh'?'展开训练说明':'Open training notes'}</summary><p>${voiceTrainerInstruction(mode)}</p></details>
          <div class="actions"><button class="btn primary" data-act="vocal-guide-play">${state.lang==='zh'?'机器哼唱当前旋律':'Sing current melody'}</button><button class="btn ghost" data-route="compose">${state.lang==='zh'?'去画/写旋律':'Draw/compose melody'}</button></div>
        </section>
      </div>
      <div class="voice-folds">
        <details><summary>${state.lang==='zh'?'按需展开：唱歌原理路径':'Unfold when needed: singing principle path'}</summary><div class="inside">
          <div class="voice-organ-wrap"><canvas id="voiceOrganCanvas"></canvas></div>
          <div class="voice-quick-grid">${theoryList.map((l,i)=>`<button class="${active===l.id?'active':''}" data-voice-lesson="${l.id}"><b><span class="voice-step-num">${i+1}</span>${state.lang==='zh'?l.zh.replace(/^\d+\.\s*/,''):l.en.replace(/^\d+\.\s*/,'')}</b><span class="mini">${state.lang==='zh'?l.principleZh:l.principleEn}</span></button>`).join('')}</div>
          <div class="lesson-stage" style="margin-top:12px">
            <div class="panel"><h2>${esc(state.lang==='zh'?lesson.zh:lesson.en)}</h2><div class="canvas-wrap"><canvas id="voiceLessonCanvas"></canvas></div><div class="voice-mode-row">${voiceModeButtons(active)}</div><div class="voice-control-grid">${voiceControls(active)}</div></div>
            <aside class="panel"><div class="lesson-principles"><div class="principle-card"><b>${state.lang==='zh'?'原理':'Principle'}</b><p>${esc(state.lang==='zh'?lesson.principleZh:lesson.principleEn)}</p></div><div class="principle-card"><b>${state.lang==='zh'?'怎么练':'Practice'}</b><p>${esc(state.lang==='zh'?lesson.practiceZh:lesson.practiceEn)}</p></div><div class="principle-card"><b>${state.lang==='zh'?'常见错误':'Common mistake'}</b><p>${esc(state.lang==='zh'?lesson.mistakeZh:lesson.mistakeEn)}</p></div><div class="principle-card"><b>${state.lang==='zh'?'公式 / 逻辑':'Formula / logic'}</b><p class="formula-plain">${voiceFormula(active)}</p></div></div>${lessonLinks(lesson.term||active)}</aside>
          </div>
        </div></details>
        <details><summary>${state.lang==='zh'?'风格比较：流行 / 美声 / 泛音 / 民歌':'Style comparison: pop / classical / overtone / folk'}</summary><div class="inside"><div class="singing-style-grid">${(DATA.singingStyles||[]).map(s=>`<article class="principle-card"><b>${state.lang==='zh'?s.zh:s.en}</b><p>${state.lang==='zh'?s.zhText:s.enText}</p></article>`).join('')}</div></div></details>
        <details><summary>${state.lang==='zh'?'当前旋律的换气与重音':'Breath and accent marks for current melody'}</summary><div class="inside"><div class="melody-guide">${vocalPhraseMarks().map(x=>`<span>${x}</span>`).join('')}</div><p class="mini">${state.lang==='zh'?'☾ 是建议换气点；★ 是强调或回家点。先听机器哼唱，再自己跟唱。':'☾ marks suggested breath; ★ marks accent/home. Listen to the guide, then sing along.'}</p></div></details>
      </div>
    </section>`;
    if(redraw) drawActive();
  }
  function voiceFeedback(){
    const vt=state.voiceTrainer||{}; if(!vt.currentFreq) return state.lang==='zh'?'未检测':'—';
    const cents=1200*Math.log2(vt.currentFreq/(vt.targetFreq||261.63));
    if(Math.abs(cents)<18) return state.lang==='zh'?'准了':'in tune';
    return cents>0 ? (state.lang==='zh'?'偏高':'sharp') : (state.lang==='zh'?'偏低':'flat');
  }
  function voiceTrainerInstruction(mode){
    const zh={
      pitch:'训练目标：不是一开始就唱大声，而是让音高光点慢慢靠近中心线。先用 hum，再换 la / ah。',
      breath:'训练目标：让声音强度像平稳河流。冲气会一开始很高，憋气会断，稳定气流最容易唱准。',
      rhythm:'训练目标：强拍像脚落地，弱拍像身体流动，换气在句子边界，不要随机断开。',
      folds:'训练目标：漏气、挤压、平衡三种状态都听懂。平衡闭合是清楚但不紧。',
      expression:'训练目标：情感不是只变大声，而是重音、淡出、滑音、咬字和换气位置共同改变。'
    };
    const en={
      pitch:'Goal: do not start by singing loudly; bring the pitch-dot gently toward the target line. Hum first, then la / ah.',
      breath:'Goal: keep intensity like a steady river. A burst spikes, holding breaks, stable airflow supports pitch.',
      rhythm:'Goal: strong beat is landing, weak beat is flow, breath belongs at phrase boundaries.',
      folds:'Goal: hear breathy, pressed and balanced states. Balanced closure is clear but not tight.',
      expression:'Goal: emotion is not only loudness; accent, fade, glide, diction and breath placement shape meaning.'
    };
    return state.lang==='zh'?zh[mode]||zh.pitch:en[mode]||en.pitch;
  }
  function lessonLinks(term){
    const q=encodeURIComponent((DATA.voiceTrainers||[]).find(t=>t.term===term)?.search?.[0] || term || 'singing practice');
    return `<div class="principle-card"><b>${state.lang==='zh'?'继续学习':'Continue learning'}</b><div class="link-chips"><button data-term="${term||'voice'}">${state.lang==='zh'?'打开星点':'Open star'}</button><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">YouTube</a><a target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}">Search</a></div></div>`;
  }
function voiceModeButtons(id){
    if(id==='posture') return ['collapsed','balanced','tense'].map(m=>`<button class="pill ${state.params.voiceMode===m?'active':''}" data-voice-mode="${m}">${m}</button>`).join('');
    if(id==='folds') return ['breathy','balanced','pressed'].map(m=>`<button class="pill ${state.params.voiceMode===m?'active':''}" data-voice-mode="${m}">${m}</button>`).join('');
    if(id==='emotion') return ['comfort','joy','courage','goodbye'].map(m=>`<button class="pill ${state.params.voiceMode===m?'active':''}" data-voice-mode="${m}">${m}</button>`).join('');
    return '';
  }
  function controlRange(k,label,min,max,val){return `<div class="control"><label><span>${label}</span><output>${val}</output></label><input data-param="${k}" type="range" min="${min}" max="${max}" value="${val}"></div>`}
  function voiceControls(id){
    const p=state.params;
    if(id==='breath') return controlRange('air',state.lang==='zh'?'气流稳定度':'airflow',0,100,p.air||55);
    if(id==='folds'||id==='onset') return controlRange('closure',state.lang==='zh'?'声带闭合度':'fold closure',0,100,p.closure||55)+controlRange('air',state.lang==='zh'?'气流':'airflow',0,100,p.air||55);
    if(id==='sovt') return controlRange('outlet',state.lang==='zh'?'出口宽度':'outlet width',0,100,p.outlet||35);
    if(['tract','vowel','resonanceChoice','diction'].includes(id)) return controlRange('mouthOpen',state.lang==='zh'?'开口':'mouth opening',0,100,p.mouthOpen||55)+controlRange('tongue',state.lang==='zh'?'舌位高度':'tongue height',0,100,p.tongue||45)+controlRange('lipRound',state.lang==='zh'?'唇形圆展':'lip roundness',0,100,p.lipRound||35)+`<div class="control"><label>Vowel / 元音</label><select id="vowelSelect">${['a','e','i','o','u'].map(v=>`<option ${p.vowel===v?'selected':''}>${v}</option>`).join('')}</select></div>`;
    if(id==='dynamics'||id==='emotion') return controlRange('amp',state.lang==='zh'?'强弱幅度':'dynamic range',0,100,p.amp||52)+controlRange('freq',state.lang==='zh'?'音高中心':'pitch center',120,660,p.freq||220);
    return '';
  }
function voiceFormula(id){
    const map={
      posture:'body alignment → free airflow + free resonance',
      breath:'stable airflow ≠ maximum airflow',
      folds:'air pressure + fold closure → vibration',
      onset:'balanced onset = clear start without collision',
      sovt:'narrow outlet → back pressure → easier oscillation',
      tract:'source × tract filter → timbre',
      vowel:'tongue + lips + opening → F1/F2',
      scale:'scale = safe pitch path back to tonic',
      phrase:'phrase = notes + breath + meaning',
      choir:'separate voices + shared tuning → harmony',
      resonanceChoice:'source × tract shape + body feedback → perceived resonance',
      diction:'consonant boundary + vowel flow → clear sung language',
      dynamics:'energy envelope + accent → emotional weight',
      emotion:'tempo + dynamics + timbre + diction → expressive meaning',
      formant:'source × vocal tract filter → vowel color'
    };
    return map[id]||'voice = body + breath + source + filter + intention';
  }
function voiceCue(id){
    const zh={breath:'先安静吸气，再用很小的气流做 sss 或 hum，观察波形是否平稳。',vocal_folds:'轻声起音，避免突然撞击或用力挤压；目标是清楚但不紧。',sovt:'用吸管或唇颤轻声滑音，感觉声音不需要推得很大。',formant:'切换 a/i/u，注意嘴型与舌位改变的是音色滤波，而不只是音高。',choir:'先唱根音，再加入三度和五度，听见稳定三角形。'};
    const en={breath:'Inhale quietly, then use a tiny steady sss or hum and watch the wave stay smooth.',vocal_folds:'Begin gently; avoid hard collision or squeezing. Aim for clear but not tight.',sovt:'Use straw or lip trill softly and glide; feel that sound does not need to be pushed.',formant:'Switch a/i/u and notice mouth/tongue shape changes filter color, not only pitch.',choir:'Sing root first, then add third and fifth; hear a stable triangle.'};
    return state.lang==='zh'?(zh[id]||zh.formant):(en[id]||en.formant);
  }
function renderCompose(redraw=true){
    normalizeComposition();
    if(state.uiMode==='quick') return renderComposeQuick(redraw);
    return renderComposeTeach(redraw);
  }
  function composeModeBar(){
    return `<div class="mode-strip"><button class="pill ${state.uiMode==='quick'?'active':''}" data-ui-mode="quick">⚡ ${C('quick')||'Quick'}</button><button class="pill ${state.uiMode==='teach'?'active':''}" data-ui-mode="teach">✦ ${C('teach')||'Teach'}</button></div>`;
  }
  function renderComposeQuick(redraw=true){
    const sc=DATA.scales[state.compose.scale]; const grid=state.compose.grid; const insts=DATA.instruments||[]; const emotions=DATA.emotionTemplates||[];
    $('#view').innerHTML=`<section class="page">${head(C('compose'),state.lang==='zh'?'极简创作：选择感受，点星格，播放并导出。需要原理时切换到教学模式。':'Quick compose: choose feeling, tap star cells, play and export. Switch to teaching for principles.')}
      ${composeModeBar()}${templatePicker()}
      <div class="quick-compose"><div class="panel"><div class="quick-controls compact">
        <label>${state.lang==='zh'?'情绪':'Emotion'}<select id="emotionSelect">${emotions.map(e=>`<option value="${e.id}" ${e.id===state.compose.emotion?'selected':''}>${state.lang==='zh'?e.zh:e.en}</option>`).join('')}</select></label>
        <label>${state.lang==='zh'?'音阶':'Scale'}<select id="scaleSelect">${Object.keys(DATA.scales).map(k=>`<option value="${k}" ${k===state.compose.scale?'selected':''}>${state.lang==='zh'?DATA.scales[k].zh:DATA.scales[k].en}</option>`).join('')}</select></label>
        <label>${state.lang==='zh'?'乐器':'Instrument'}<select id="instrumentSelect">${insts.map(i=>`<option value="${i.id}" ${i.id===state.compose.instrument?'selected':''}>${state.lang==='zh'?i.zh:i.en}</option>`).join('')}</select></label>
        <label>${state.lang==='zh'?'长度':'Length'}<select id="stepsSelect">${[16,32,64,128].map(n=>`<option value="${n}" ${n===state.compose.steps?'selected':''}>${n}</option>`).join('')}</select></label>
      </div><div class="control"><label><span>BPM</span><output>${state.compose.tempo}</output></label><input id="tempoRange" type="range" min="40" max="180" value="${state.compose.tempo}"><input id="tempoInput" type="number" min="40" max="180" value="${state.compose.tempo}"></div>
      <div class="quick-hint">${quickComposeHint()}</div>${drawMelodyPanel()}${trackMobilePanel()}${makerCorePanel()}${vocalGuidePanel()}
      <div class="sequencer long" style="${seqStyle(grid.length)}">${seqGrid(sc,grid)}</div>
      <div id="notation" class="notation">${notation(sc,grid)}</div>
      <div class="quick-actions-sticky"><button class="btn primary" data-act="compose-play">▶ ${C('play')}</button><button class="btn ghost" data-act="vocal-guide-play">${state.lang==='zh'?'哼唱':'Vocal'}</button><button class="btn ghost" data-act="compose-random">${state.lang==='zh'?'生成':'Generate'}</button><button class="btn ghost" data-act="compose-naturalize">${state.lang==='zh'?'更自然':'Humanize'}</button><button class="btn ghost" data-act="compose-clear">${C('reset')}</button><button class="btn gold" data-act="compose-wav">WAV</button><button class="btn gold" data-act="compose-midi">MIDI</button><button class="btn ghost" data-act="download-png">PNG</button></div></div>
      <aside class="panel"><div class="canvas-wrap"><canvas id="mandalaCanvas"></canvas></div><div class="compose-analysis">${compositionAnalysis().slice(0,3).map(a=>`<div class="analysis-card"><b>${a.title}</b><p class="mini">${a.text}</p></div>`).join('')}</div><div class="actions"><button class="btn ghost" data-act="download-wallpaper">${state.lang==='zh'?'星空壁纸':'Wallpaper'}</button><button class="btn ghost" data-ui-mode="teach">${state.lang==='zh'?'查看原理':'Show teaching'}</button></div></aside></div></section>`;
    if(redraw) drawActive();
  }

  function templatePicker(){
    const list=DATA.composeTemplates||[];
    if(!list.length) return '';
    return `<div class="panel"><h2>${C('template')||'Template'}</h2><div class="template-picker">${list.map(t=>`<button class="template-card ${state.compose.template===t.id?'active':''}" data-template="${t.id}"><b>${state.lang==='zh'?t.zh:t.en}</b><span>${t.tempo} BPM · ${t.instrument}</span></button>`).join('')}</div><p class="mini">${state.lang==='zh'?'模板会生成段落、主旋律轮廓、和弦、低音、鼓点和哼唱音节。':'Templates generate form, melodic contour, chords, bass, drums and vocal syllable.'}</p></div>`;
  }
  
  function drawMelodyPanel(){
    const guide=DATA.drawMelodyGuide?.[state.lang]||DATA.drawMelodyGuide?.zh||{};
    const d=state.drawMelody||{};
    return `<details class="draw-melody-panel" open><summary><b>${C('drawMelody')||'Draw melody'}</b> · ${guide.title||''}</summary>
      <div class="brush-controls">
        <label>${state.lang==='zh'?'平滑度':'Smoothing'}<input data-draw-param="smoothing" type="range" min="0" max="1" step="0.01" value="${d.smoothing??.62}"></label>
        <label>${state.lang==='zh'?'灵敏度':'Sensitivity'}<input data-draw-param="sensitivity" type="range" min="0.2" max="1.5" step="0.01" value="${d.sensitivity??.72}"></label>
        <label>${state.lang==='zh'?'吸附':'Snap'}<select data-draw-param="snap"><option value="scale" ${d.snap==='scale'?'selected':''}>${state.lang==='zh'?'音阶内':'scale'}</option><option value="chromatic" ${d.snap==='chromatic'?'selected':''}>${state.lang==='zh'?'半音':'chromatic'}</option><option value="free" ${d.snap==='free'?'selected':''}>${state.lang==='zh'?'自由':'free'}</option></select></label>
        <label>${state.lang==='zh'?'线条':'Line'}<select data-draw-param="lineStyle"><option value="smooth" ${d.lineStyle==='smooth'?'selected':''}>${state.lang==='zh'?'圆滑连线':'smooth'}</option><option value="angular" ${d.lineStyle==='angular'?'selected':''}>${state.lang==='zh'?'折线断奏':'angular'}</option><option value="dotted" ${d.lineStyle==='dotted'?'selected':''}>${state.lang==='zh'?'点状跳音':'dotted'}</option></select></label>
      </div>
      <div class="draw-melody-canvas-wrap"><canvas id="drawMelodyCanvas"></canvas></div>
      <div class="actions"><button class="btn primary" data-act="draw-to-melody">${state.lang==='zh'?'线条转旋律':'Line → melody'}</button><button class="btn ghost" data-act="draw-clear">${state.lang==='zh'?'清空线条':'Clear line'}</button><button class="btn ghost" data-act="compose-naturalize">${state.lang==='zh'?'更自然':'Humanize'}</button></div>
      <p class="mini">${guide.x||''} · ${guide.y||''} · ${state.lang==='zh'?'平滑度控制歌唱感，吸附决定是否允许半音。':'Smoothing controls singability; snap decides whether chromatic notes are allowed.'}</p>
    </details>`;
  }
  function trackMobilePanel(){
    const roles=DATA.trackRoles||[];
    const active=state.activeTrack||'melody';
    return `<div class="track-mobile-shell"><div class="track-tabs">${roles.map(r=>`<button class="${r.id} ${active===r.id?'active':''}" data-track="${r.id}">${r.name||r.id}<br><span class="mini">${state.lang==='zh'?(r.zh||r.id):(r.en||r.id)}</span></button>`).join('')}</div>
      <div class="track-lane-view">${trackLaneContent(active)}</div>
      <div class="track-overview">${roles.slice(0,4).map(r=>trackOverviewRow(r)).join('')}</div>
    </div>`;
  }
  function trackLaneContent(id){
    const role=(DATA.trackRoles||[]).find(r=>r.id===id)||{};
    if(id==='melody') return `<b>Melody / ${state.lang==='zh'?'主旋律':'main line'}</b><p class="mini">${state.lang==='zh'?'在下方星格或上方手绘线条中写旋律。主旋律负责“我想说什么”。':'Write melody in the grid or by drawing. Melody says what you mean.'}</p>`;
    if(id==='chords') return `<b>Chord / ${state.lang==='zh'?'和弦':'harmony'}</b><p class="mini">${state.lang==='zh'?'选择一组和弦：根音给稳定，三度给明暗，五度给支撑。':'Choose chords: root stabilizes, third colors, fifth supports.'}</p><div class="chord-row">${(DATA.chordProgressions||[]).map(ch=>`<button class="pill ${state.compose.chords?.includes(ch.id)?'active':''}" data-act="chord" data-id="${ch.id}">${ch.id}</button>`).join('')}</div>`;
    if(id==='bass') return `<b>Bass / ${state.lang==='zh'?'低音':'bass'}</b><p class="mini">${state.lang==='zh'?'低音跟随和弦根音，让音乐有地面和回家感。':'Bass follows chord roots so the song has ground and home.'}</p><button class="pill ${state.compose.layers?.bass!==false?'active':''}" data-layer="bass">${state.lang==='zh'?'低音开关':'Bass on/off'}</button>`;
    if(id==='drums'||id==='pulse') return `<b>Djembe / ${state.lang==='zh'?'鼓圈':'drum circle'}</b><p class="mini">${state.lang==='zh'?'Bass=地面，Tone=步伐，Slap=强调，休止=呼吸。':'Bass=ground, Tone=step, Slap=accent, silence=breath.'}</p><div class="drum-circle">${Array.from({length:16},(_,i)=>`<button class="drum-hit ${(i%4===0||i%4===2)?'on':''}" data-act="drum-hit" data-step="${i}">${i%4===0?'B':i%4===2?'S':'·'}</button>`).join('')}</div>`;
    return `<b>${role.name||id}</b><p class="mini">${state.lang==='zh'?(role.zhText||'轨道可以打开或收起。'):(role.enText||'Open or fold this track.')}</p>`;
  }
  function trackOverviewRow(r){
    const grid=state.compose.grid||[];
    const cells=Array.from({length:32},(_,i)=>{
      const section=i<4?'intro':i<16?'a':i<28?'b':'return';
      const on=r.id==='melody'?grid[i%grid.length]>=0:(r.id==='chords'||r.id==='bass'?i%8===0:(i%4===0||i%4===2));
      return `<i class="${on?'on '+r.id:''} section-${section}"></i>`;
    }).join('');
    return `<div class="track-overview-row ${r.id}"><b>${r.name||r.id}</b><div class="track-mini-grid">${cells}</div></div>`;
  }

  function quickComposeHint(){
    const e=(DATA.emotionTemplates||[]).find(x=>x.id===state.compose.emotion)||{};
    return state.lang==='zh'?`当前感受：${e.zh||''}。先写一个 4 步小动机，重复一次，再变化一次，最后回到 1。`:`Feeling: ${e.en||''}. Write a 4-step motive, repeat it, vary once, then return to 1.`;
  }

  function makerCorePanel(){
    const layers=state.compose.layers||{};
    return `<div class="maker-strip">
      <button class="${layers.melody!==false?'active':''}" data-layer="melody"><b>Melody</b><span class="mini">${state.lang==='zh'?'表达主线':'main expression'}</span></button>
      <button class="${layers.bass!==false?'active':''}" data-layer="bass"><b>Bass</b><span class="mini">${state.lang==='zh'?'稳定中心':'gravity / home'}</span></button>
      <button class="${layers.chords!==false?'active':''}" data-layer="chords"><b>Chord</b><span class="mini">${state.lang==='zh'?'情绪颜色':'emotional color'}</span></button>
      <button class="${layers.drums?'active':''}" data-act="toggle-drums"><b>Djembe</b><span class="mini">${state.lang==='zh'?'身体节奏':'body pulse'}</span></button>
    </div><div class="drum-panel"><b>${state.lang==='zh'?'更自然的音乐':'More natural music'}</b><p class="mini">${state.lang==='zh'?'打开低音、和弦、非洲鼓和“更自然”，旋律就不再只是单音格子。':'Turn on bass, chords, djembe and humanize so melody is not just single grid notes.'}</p></div>`;
  }
  function vocalGuidePanel(){
    const syll=(DATA.vocalGuide&&DATA.vocalGuide.syllables)||[];
    return `<div class="vocal-guide-box"><h3>${state.lang==='zh'?'机器哼唱 Guide':'Vocal guide'}</h3><p class="mini">${state.lang==='zh'?(DATA.vocalGuide?.zhLead||'用当前旋律生成哼唱 guide。'):(DATA.vocalGuide?.enLead||'Generate a vocal guide from your melody.')}</p><div class="actions">${syll.map(s=>`<button class="pill ${state.compose.syllable===s.id?'active':''}" data-syllable="${s.id}">${state.lang==='zh'?s.zh:s.en}</button>`).join('')}<button class="btn ghost" data-act="vocal-guide-play">${state.lang==='zh'?'唱出旋律':'Sing guide'}</button><button class="btn ghost" data-act="toggle-vocal">${state.compose.vocalGuide!==false?'✓ ':''}${state.lang==='zh'?'随播放加入':'with playback'}</button></div><div class="melody-guide">${vocalPhraseMarks().map(x=>`<span>${x}</span>`).join('')}</div></div>`;
  }
  function vocalPhraseMarks(){
    const len=state.compose.grid.length||32; const marks=[];
    for(let i=0;i<len;i+=8) marks.push(`${i+1}-${Math.min(len,i+8)} ${state.lang==='zh'?'一句/换气':'phrase/breath'}`);
    return marks.slice(0,4);
  }

  function renderComposeTeach(redraw=true){
    const sc=DATA.scales[state.compose.scale]; const grid=state.compose.grid;
    const insts=DATA.instruments||[]; const purposes=DATA.composePurposes||[]; const emotions=DATA.emotionTemplates||[]; const activeEmotion=emotions.find(e=>e.id===state.compose.emotion)||emotions[0]||{};
    $('#view').innerHTML=`<section class="page">${head(C('compose'),state.lang==='zh'?'教学创作：把感受翻译成音阶、BPM、乐器、轨道、和弦和结构。':'Teaching compose: translate feeling into scale, BPM, instrument, tracks, chords and form.')}
      ${composeModeBar()}<div class="studio-layout"><aside class="studio-left"><details class="fold" open><summary>${state.lang==='zh'?'① 感受 → 参数':'① Feeling → parameters'}</summary><div class="fold-body"><div class="visual-template-grid">${emotions.map(e=>`<button class="visual-template ${state.compose.emotion===e.id?'active':''}" data-act="emotion" data-id="${e.id}"><div class="template-icon">${templateBars(e)}</div><b>${state.lang==='zh'?e.zh:e.en}</b><p class="mini">${state.lang==='zh'?e.zhWhy:e.enWhy}</p></button>`).join('')}</div></div></details><details class="fold" open><summary>${state.lang==='zh'?'② 操作参数':'② Controls'}</summary><div class="fold-body"><div class="compose-top"><label>${state.lang==='zh'?'情绪':'Emotion'}<select id="emotionSelect">${emotions.map(e=>`<option value="${e.id}" ${e.id===state.compose.emotion?'selected':''}>${state.lang==='zh'?e.zh:e.en}</option>`).join('')}</select></label><label>${state.lang==='zh'?'用途':'Purpose'}<select id="purposeSelect">${purposes.map(p=>`<option value="${p.id}" ${p.id===state.compose.purpose?'selected':''}>${state.lang==='zh'?p.zh:p.en}</option>`).join('')}</select></label><label>${state.lang==='zh'?'音阶':'Scale'}<select id="scaleSelect">${Object.keys(DATA.scales).map(k=>`<option value="${k}" ${k===state.compose.scale?'selected':''}>${state.lang==='zh'?DATA.scales[k].zh:DATA.scales[k].en}</option>`).join('')}</select></label><label>${state.lang==='zh'?'乐器':'Instrument'}<select id="instrumentSelect">${insts.map(i=>`<option value="${i.id}" ${i.id===state.compose.instrument?'selected':''}>${state.lang==='zh'?i.zh:i.en}</option>`).join('')}</select></label><label>${state.lang==='zh'?'长度':'Length'}<select id="stepsSelect">${[16,32,64,128].map(n=>`<option value="${n}" ${n===state.compose.steps?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="control"><label><span>BPM</span><output>${state.compose.tempo}</output></label><input id="tempoRange" type="range" min="40" max="180" value="${state.compose.tempo}"><input id="tempoInput" type="number" min="40" max="180" value="${state.compose.tempo}"></div></div></details><details class="fold" open><summary>${state.lang==='zh'?'③ 轨道分工':'③ Track roles'}</summary><div class="fold-body">${trackMobilePanel()}${arrangementPanel()}</div></details></aside><section class="studio-mid"><div class="panel"><h2>${state.lang==='zh'?'写旋律 / 看乐谱':'Write melody / read notation'}</h2><p class="mini">${state.lang==='zh'?'旋律表达，低音稳定中心，和弦给情绪颜色，节奏推动身体。':'Melody expresses, bass stabilizes, chords color emotion, pulse moves the body.'}</p><div class="compose-actions"><button class="btn primary" data-act="compose-play">▶ ${C('play')}</button><button class="btn ghost" data-act="compose-random">${state.lang==='zh'?'按模板生成':'Generate by template'}</button><button class="btn ghost" data-act="compose-clear">${C('reset')}</button></div>${drawMelodyPanel()}<div class="sequencer long" style="${seqStyle(grid.length)}">${seqGrid(sc,grid)}</div><div id="notation" class="notation">${notation(sc,grid)}</div></div></section><aside class="studio-right"><div class="panel"><h2>${state.lang==='zh'?'结构动画':'Form animation'}</h2><div class="structure-canvas-wrap"><canvas id="structureCanvas"></canvas></div><div class="explain-box">${structureExplanation(activeEmotion)}</div></div><div class="panel"><h2>${state.lang==='zh'?'曼陀罗 / 分析 / 导出':'Mandala / analysis / export'}</h2><div class="canvas-wrap small-canvas"><canvas id="mandalaCanvas"></canvas></div><div class="compose-analysis">${compositionAnalysis().map(a=>`<div class="analysis-card"><b>${a.title}</b><p class="mini">${a.text}</p></div>`).join('')}</div><div class="export-grid"><button class="btn gold" data-act="compose-wav">WAV</button><button class="btn gold" data-act="compose-midi">MIDI</button><button class="btn gold" data-act="compose-musicxml">MusicXML</button><button class="btn ghost" data-act="compose-export">JSON</button><button class="btn ghost" data-act="download-png">PNG</button><button class="btn ghost" data-act="download-wallpaper">${state.lang==='zh'?'壁纸':'Wallpaper'}</button></div></div></aside></div></section>`;
    if(redraw) drawActive();
  }
  function arrangementPanel(){
    const roles=DATA.trackRoles||[]; const chords=DATA.chordProgressions||[];
    return `<div class="track-role-grid">${roles.map(r=>`<button class="track-role ${r.id} ${state.compose.layers?.[r.id]?'active':''}" data-layer="${r.id}"><b>${r.name||r.id}</b><span>${state.lang==='zh'?(r.zh||r.id):(r.en||r.id)}</span></button>`).join('')}</div><div class="chord-row">${chords.map(ch=>`<button class="pill ${state.compose.chords?.includes(ch.id)?'active':''}" data-act="chord" data-id="${ch.id}">${ch.id}</button>`).join('')}</div><p class="mini">${state.lang==='zh'?'和弦不是装饰：根音给稳定，三度给明暗，五度给支撑。':'Chords are not decoration: root stabilizes, third colors, fifth supports.'}</p>${vocalGuidePanel()}`;
  }
  function templateBars(e){
    const d=Math.max(.25,Math.min(1,e.density||.5));
    const vals=e.contour==='rise'?[.25,.42,.62,.9]:e.contour==='fall'?[.9,.62,.42,.25]:e.contour==='breath'?[.35,.8,.35,.7]:e.contour==='leap'?[.3,.85,.45,.92]:[.45,.65,.55,.72];
    return vals.map(v=>`<i style="height:${Math.round(16+v*28*d)}px"></i>`).join('');
  }
  function structureExplanation(e){
    const parts=(e.structure||[]).join(' → ');
    return state.lang==='zh'
      ? `<b>${e.zh||''}</b><br>结构：${parts}<br>${e.zhWhy||''}<br>创作提示：先写一个短动机，再重复一次，第三次做一点变化，最后回到主音。`
      : `<b>${e.en||''}</b><br>Form: ${parts}<br>${e.enWhy||''}<br>Tip: write a short motive, repeat it, vary it once, then return to tonic.`;
  }

function compositionAnalysis(){
    const grid=state.compose.grid||[];
    const active=grid.filter(n=>n>=0);
    const density=active.length/Math.max(1,grid.length);
    const first=active[0]??0, last=active[active.length-1]??0;
    const avgFirst=grid.slice(0,Math.max(1,Math.floor(grid.length/2))).filter(n=>n>=0).reduce((s,n)=>s+n,0)/Math.max(1,grid.slice(0,Math.floor(grid.length/2)).filter(n=>n>=0).length);
    const avgLast=grid.slice(Math.floor(grid.length/2)).filter(n=>n>=0).reduce((s,n)=>s+n,0)/Math.max(1,grid.slice(Math.floor(grid.length/2)).filter(n=>n>=0).length);
    const coach=DATA.compositionCoach?.[state.lang]||DATA.compositionCoach?.zh||{};
    const dText=density<.34?coach.densityLow:density>.68?coach.densityHigh:coach.densityMid;
    const contour=(avgLast-avgFirst)>1?coach.rise:(avgFirst-avgLast)>1?coach.fall:coach.wave;
    const homeStrong=grid.slice(-4).some(n=>n===0||n===7);
    const homeText=homeStrong?coach.homeStrong:coach.homeWeak;
    const titles=state.lang==='zh'?['密度','旋律轮廓','回家感','下一步']:['Density','Contour','Return home','Next step'];
    return [
      {title:titles[0],text:dText||''},
      {title:titles[1],text:contour||''},
      {title:titles[2],text:homeText||''},
      {title:titles[3],text:state.lang==='zh'?'想更像完整曲子：写一个短动机，重复一次，第三次变化，最后回到主音。':'To feel complete: write a short motive, repeat once, vary the third time, then return to tonic.'}
    ];
  }

function seqStyle(steps){ return `grid-template-columns:42px repeat(${steps},minmax(28px,1fr))`; }
  function seqGrid(sc,grid){
    let html='<div class="seq-label"></div>';
    for(let s=0;s<grid.length;s++) html+=`<div class="seq-label ${s%8===0?'seq-step-accent':''}">${s+1}</div>`;
    for(let p=7;p>=0;p--){
      html+=`<div class="seq-label">${sc.jianpu[p]}</div>`;
      for(let s=0;s<grid.length;s++) html+=`<button class="seq-cell ${grid[s]===p?'on':'rest'} ${s%8===0?'seq-step-accent':''} ${state.compose.naturalize?'naturalized':''}" data-act="compose-note" data-step="${s}" data-pitch="${p}" type="button" aria-label="step ${s+1} pitch ${p}"></button>`;
    }
    return html;
  }
  function accidentalMark(i){ const a=Number((state.compose.accidentals||{})[i]||0); return a>0?'♯':a<0?'♭':''; }
  function noteFreq(sc,n,step=0){
    if(n<0 || !sc.notes[n]) return 0;
    const base=ANIM.noteToFreq(sc.notes[n]);
    const semi=Number((state.compose.accidentals||{})[step]||0);
    return base*Math.pow(2, semi/12);
  }
  function notation(sc,grid){
    const nums=grid.map((n,i)=>n>=0?`${sc.jianpu[n]}${accidentalMark(i)}`:'·').join(' ');
    const melody=grid.map((n,i)=>n>=0?`<span class="note-dot ${accidentalMark(i)?'accidental':''}" style="left:${Math.min(96,3+i*(94/Math.max(1,grid.length-1)))}%;top:${72-n*8}px"></span>`:'').join('');
    const vocal=grid.map((n,i)=>n>=0 && i%2===0?`<span class="note-dot vocal" style="left:${Math.min(96,3+i*(94/Math.max(1,grid.length-1)))}%;top:${66-n*8}px"></span>`:'').join('');
    return `<b>${state.lang==='zh'?'简谱':'Jianpu'}:</b><div class="notation-legend"><span><i style="background:var(--track-melody)"></i>Melody</span><span><i style="background:var(--track-vocal)"></i>Vocal guide</span><span>${state.lang==='zh'?'♯/♭ 表示半音装饰':'♯/♭ marks chromatic color'}</span></div><div class="jianpu">${nums}</div><div class="staff wide multi">${[0,1,2,3,4].map(()=>'<div class="line"></div>').join('')}${melody}${vocal}</div>`;
  }
  function updateComposeSide(){const n=$('#notation'); if(n){const sc=DATA.scales[state.compose.scale]; n.innerHTML=notation(sc,state.compose.grid);} drawActive();}
  function syncTempoInputs(){ const a=$('#tempoInput'), b=$('#tempoRange'); if(a) a.value=state.compose.tempo; if(b) b.value=state.compose.tempo; const o=b?.closest('.control')?.querySelector('output'); if(o) o.textContent=state.compose.tempo; }
  function resizeComposition(n){ state.compose.steps=n; while(state.compose.grid.length<n) state.compose.grid.push(-1); if(state.compose.grid.length>n) state.compose.grid=state.compose.grid.slice(0,n); save(); renderCompose(); }
  function toggleNote(step,pitch){state.compose.grid[step]=state.compose.grid[step]===pitch?-1:pitch; save(); renderCompose();}
  function randomComposition(){
    normalizeComposition();
    const e=(DATA.emotionTemplates||[]).find(x=>x.id===state.compose.emotion)||{};
    state.compose.tempo=e.bpm||state.compose.tempo;
    state.compose.scale=e.scale||state.compose.scale;
    state.compose.instrument=e.instrument||state.compose.instrument;
    const grid=Array(state.compose.steps).fill(-1);
    const density=e.density ?? .55;
    const contour=e.contour || 'stable';
    const len=state.compose.steps;
    for(let i=0;i<len;i++){
      if(Math.random()>density) continue;
      const phase=i/Math.max(1,len-1);
      let pitch=3;
      if(contour==='rise') pitch=Math.round(1+phase*5+Math.sin(i*.7));
      else if(contour==='fall') pitch=Math.round(6-phase*5+Math.sin(i*.5));
      else if(contour==='breath') pitch=Math.round(3.5+Math.sin(i/len*Math.PI*4)*1.7);
      else if(contour==='leap') pitch=[0,4,2,5,3,7,5,4][i%8];
      else if(contour==='wave') pitch=Math.round(3.5+Math.sin(i/len*Math.PI*6)*2.2);
      else pitch=[0,2,4,2,3,4,2,0][i%8];
      if(i%8===7 && Math.random()>.35) pitch=0; // return/home point
      grid[i]=Math.max(0,Math.min(7,pitch));
    }
    state.compose.grid=grid; normalizeComposition(); save(); renderCompose();
  }
  
  function toggleChord(id){
    state.compose.chords = Array.isArray(state.compose.chords) ? state.compose.chords : ['I','V','vi','IV'];
    state.compose.accidentals = state.compose.accidentals && typeof state.compose.accidentals==='object' ? state.compose.accidentals : {};
    state.compose.sections = state.compose.sections || [
      {id:'intro',start:0,length:8,color:'blue'},
      {id:'A',start:8,length:16,color:'gold'},
      {id:'B',start:24,length:16,color:'rose'},
      {id:'return',start:40,length:8,color:'green'}
    ];
    if(state.compose.chords.includes(id)) state.compose.chords = state.compose.chords.filter(x=>x!==id);
    else state.compose.chords.push(id);
    if(!state.compose.chords.length) state.compose.chords=['I'];
    save(); renderCompose();
  }

  function applyComposeTemplate(id){
    const t=(DATA.composeTemplates||[]).find(x=>x.id===id); if(!t) return;
    state.compose.template=id;
    state.compose.emotion=t.emotion||state.compose.emotion;
    state.compose.scale=t.scale||state.compose.scale;
    state.compose.tempo=t.tempo||state.compose.tempo;
    state.compose.instrument=t.instrument||state.compose.instrument;
    state.compose.chords=Array.isArray(t.chords)?[...t.chords]:state.compose.chords;
    state.compose.layers=Object.assign({}, state.compose.layers||{}, t.layers||{});
    state.compose.syllable=t.syllable||state.compose.syllable||'hum';
    state.compose.naturalize=true;
    state.compose.accidentals={};
    const steps=state.compose.steps||32;
    const grid=Array(steps).fill(-1);
    const density=t.density??.45, contour=t.contour||'wave';
    for(let i=0;i<steps;i++){
      const phase=i/Math.max(1,steps-1);
      const keep = (i%8===7) ? false : Math.random()<density || i%4===0;
      if(!keep) continue;
      let pitch=3;
      if(contour==='rise') pitch=Math.round(1+phase*5+Math.sin(i*.45));
      else if(contour==='fall') pitch=Math.round(6-phase*5+Math.sin(i*.45));
      else if(contour==='breath') pitch=Math.round(3.5+Math.sin(phase*Math.PI*4)*1.7);
      else if(contour==='stable') pitch=[0,2,4,2,3,4,2,0][i%8];
      else pitch=Math.round(3.5+Math.sin(phase*Math.PI*6)*2.2);
      grid[i]=Math.max(0,Math.min(7,pitch));
      if(t.id==='courage' && i%8===4) state.compose.accidentals[i]=.5;
      if(t.id==='sad' && i%8===3) state.compose.accidentals[i]=-.5;
    }
    grid[steps-1]=0;
    state.compose.grid=grid;
    save(); renderCompose();
  }
  function applyPurpose(id){
    const p=(DATA.composePurposes||[]).find(x=>x.id===id); if(!p) return;
    state.compose.purpose=id; state.compose.tempo=p.tempo||state.compose.tempo; state.compose.scale=p.scale||state.compose.scale; state.compose.instrument=p.instrument||state.compose.instrument;
    if(id==='wake'){ state.compose.steps=Math.max(state.compose.steps,32); }
    normalizeComposition(); save(); renderCompose();
  }
  function applyEmotion(id){
    const e=(DATA.emotionTemplates||[]).find(x=>x.id===id); if(!e) return;
    state.compose.emotion=id; state.compose.tempo=e.bpm||state.compose.tempo; state.compose.scale=e.scale||state.compose.scale; state.compose.instrument=e.instrument||state.compose.instrument;
    normalizeComposition(); save(); renderCompose();
  }

function renderAtlas(){
    const filters=[{id:'all',zh:'全部',en:'All'},...(DATA.learningPaths||[]).map(p=>({id:p.id,zh:p.zh,en:p.en,icon:p.icon}))];
    $('#view').innerHTML=`<section class="page">${head(C('atlas'),state.lang==='zh'?'知识星图 V13：先看清分区，再点亮星点；每颗星可以进入动画小课、声音实验、歌唱或创作。':'Knowledge star map V13: see zones first, then light stars; each star opens mini lessons, sound labs, singing or creation.')}
      <div class="term-tools"><input id="searchInput" placeholder="${C('search')}" value="${esc(state.query)}"><button class="pill" data-lab="sound">∿ ${C('lab')}</button><button class="pill" data-route="voice">◌ ${C('voice')}</button><button class="pill" data-route="compose">𝄞 ${C('compose')}</button></div>
      <div class="atlas-legend">${filters.map(f=>`<button class="pill ${state.atlasFilter===f.id?'active':''}" data-filter="${f.id}">${f.icon||'✦'} ${state.lang==='zh'?f.zh:f.en}</button>`).join('')}</div>
      <div class="atlas-focus"><div class="star-map star-map-v15" id="starMap">${starMapSvg()}</div><aside class="panel atlas-side">${expandedGalaxyPanel()}</aside></div>
      <div class="map-hint-panel">
        <div class="analysis-card"><b>${state.lang==='zh'?'看结构':'See structure'}</b><p class="mini">${state.lang==='zh'?'淡色星云代表一个知识区域，不再把所有字挤在中心。':'Soft nebulae are knowledge zones; labels no longer crowd the center.'}</p></div>
        <div class="analysis-card"><b>${state.lang==='zh'?'点星点':'Tap stars'}</b><p class="mini">${state.lang==='zh'?'点击星点打开原理、动画、用途和下一步。':'Tap a star for principle, animation, use and next step.'}</p></div>
        <div class="analysis-card"><b>${state.lang==='zh'?'筛路径':'Filter paths'}</b><p class="mini">${state.lang==='zh'?'上方按钮现在用于筛选学习路径。':'Top buttons filter learning paths.'}</p></div>
      </div>
      <h2>${state.lang==='zh'?'知识星点':'Knowledge stars'}</h2>
      <div id="atlasList" class="term-list"></div>
    </section>`;
    renderAtlasList();
  }
  function expandedGalaxyPanel(){
    const g=galaxy(state.expandedGalaxy); const terms=filteredTerms().filter(t=>t.g===state.expandedGalaxy).slice(0,10);
    return `<h2 style="color:${g.color}">${esc(L(g))}</h2><p class="mini">${state.lang==='zh'?'点击左侧星云区域切换分区；点击星点打开小课。':'Tap a nebula zone to switch; tap stars for mini lessons.'}</p><div class="skill-strip">${terms.map(t=>`<button class="pill" data-term="${t.id}">${esc(L(t).title)}</button>`).join('')}</div><div class="actions"><button class="btn ghost" data-route="lab">∿ ${C('lab')}</button><button class="btn ghost" data-route="voice">◌ ${C('voice')}</button><button class="btn ghost" data-route="compose">𝄞 ${C('compose')}</button></div>`;
  }
  function filteredTerms(){
    let list=DATA.terms;
    const p=(DATA.learningPaths||[]).find(x=>x.id===state.atlasFilter);
    if(p) list=list.filter(t=>(p.skills||[]).includes(t.id) || pathGalaxy(p.id).includes(t.g));
    const q=state.query;
    if(q) list=list.filter(t=>(`${L(t).title} ${L(t).one} ${t.id}`).toLowerCase().includes(q));
    return list;
  }
  function pathGalaxy(id){
    return {hear:['sound','hearing'],sing:['voice','theory'],compose:['theory','rhythm','create'],choose:['life','hearing'],listen:['hearing','world','theory'],express:['beings','life','voice']}[id]||[];
  }
  function starMapSvg(){
    const groups=DATA.galaxies;
    const selected=state.atlasFilter==='all'?null:(DATA.learningPaths||[]).find(p=>p.id===state.atlasFilter);
    const terms=filteredTerms();
    const W=1240,H=820;
    const zones={
      sound:{x:64,y:70,w:330,h:180},hearing:{x:455,y:58,w:330,h:180},theory:{x:846,y:70,w:330,h:180},
      world:{x:64,y:320,w:330,h:180},create:{x:455,y:308,w:330,h:200},rhythm:{x:846,y:320,w:330,h:180},
      life:{x:64,y:575,w:330,h:180},beings:{x:455,y:582,w:330,h:180},voice:{x:846,y:575,w:330,h:180}
    };
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Harmonic Starcove knowledge map">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <text x="620" y="278" text-anchor="middle" fill="#fff" font-size="30" font-weight="900">${state.lang==='zh'?'音乐是爱的方程式':'Music is love equation'}</text>
      <text x="620" y="306" text-anchor="middle" fill="#ffe19b" font-size="16">${state.lang==='zh'?'从分区进入，再展开细节':'Enter by zones, then open details'}</text>`;
    groups.forEach(g=>{
      const z=zones[g.id]; if(!z) return;
      const related=!selected || pathGalaxy(selected.id).includes(g.id) || (selected.skills||[]).some(id=>(DATA.terms.find(t=>t.id===id)||{}).g===g.id);
      svg+=`<rect class="nebula-zone-v15" data-galaxy="${g.id}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="42" fill="${g.color}" opacity="${related?.13:.045}"/>
        <text class="zone-title" data-galaxy="${g.id}" x="${z.x+24}" y="${z.y+38}" fill="${g.color}">${esc(L(g))}</text>`;
    });
    const byGroup={};
    terms.forEach(t=>{(byGroup[t.g]||(byGroup[t.g]=[])).push(t)});
    Object.entries(byGroup).forEach(([gid,arr])=>{
      const z=zones[gid]; if(!z) return;
      const core=(DATA.coreStars&&DATA.coreStars[gid])||arr.slice(0,6).map(t=>t.id);
      arr.slice(0, gid===state.expandedGalaxy ? 20 : 5).forEach((t,i)=>{
        const isCore=core.includes(t.id);
        const col=i%4,row=Math.floor(i/4);
        const x=z.x+52+col*78+(row%2)*12;
        const y=z.y+76+row*30;
        const color=galaxy(t.g).color;
        svg+=`<g class="star-node" data-term="${t.id}"><circle data-term="${t.id}" cx="${x}" cy="${y}" r="${state.lit.has(t.id)?7:isCore?5:3.5}" fill="${state.lit.has(t.id)?'#ffe19b':color}" filter="url(#glow)"/><title>${esc(L(t).title)}</title>`;
        if(isCore) svg+=`<text data-term="${t.id}" class="core-label" x="${x+10}" y="${y+5}" fill="rgba(255,255,255,.92)">${esc(L(t).title).slice(0,10)}</text>`;
        else if(i<10) svg+=`<text data-term="${t.id}" class="dim-label" x="${x+8}" y="${y+4}" fill="rgba(255,255,255,.62)">${esc(L(t).title).slice(0,6)}</text>`;
        svg+=`</g>`;
      });
    });
    const links=[['sound','hearing'],['sound','theory'],['theory','rhythm'],['rhythm','create'],['create','life'],['life','beings'],['beings','voice'],['voice','theory'],['world','sound'],['world','create']];
    links.forEach(([a,b])=>{const A=zones[a],B=zones[b]; if(!A||!B)return; const x1=A.x+A.w/2,y1=A.y+A.h/2,x2=B.x+B.w/2,y2=B.y+B.h/2; svg+=`<path class="star-edge" d="M${x1} ${y1} C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}" opacity=".42"/>`;});
    svg+=`</svg>`;
    return svg;
  }
  function renderAtlasList(){
    const list=filteredTerms();
    $('#atlasList').innerHTML=list.map(t=>`<button class="card term-card ${state.lit.has(t.id)?'lit':''}" data-term="${t.id}" style="--accent:${galaxy(t.g).color}"><span class="tag">${state.lit.has(t.id)?'✦':'○'} ${esc(L(galaxy(t.g)))}</span><h3>${esc(L(t).title)}</h3><p>${esc(L(t).one)}</p></button>`).join('');
  }
function renderLife(redraw=true){
    const p=state.life;
    $('#view').innerHTML=`<section class="page">${head(C('life'),state.lang==='zh'?'选择音乐也是一种创作训练：识别状态，把状态翻译成 BPM、动态、歌词、可预测性、音色和结构，再去寻找或创作。':'Choosing music is also composition training: identify state, translate it into BPM, dynamics, lyrics, predictability, timbre and form, then search or create.')}
      <div class="life-grid">
        <div class="panel">
          <div class="canvas-wrap"><canvas id="lifeCanvas"></canvas></div>
          ${['bpm','dynamic','lyrics','predict'].map(k=>rangeLife(k)).join('')}
          <div class="formula formula-plain">${state.lang==='zh'?'冥想 ≈ 低干扰 + 低噪声 + 可预测结构 + 温和身体节律':'Meditation ≈ low interference + low noise + predictable structure + gentle bodily rhythm'}</div>
          <div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="sleep_music">${C('learn')}</button><button class="btn gold" data-route="compose">${state.lang==='zh'?'用这些参数创作':'Create with these parameters'}</button></div>
        </div>
        <aside class="panel">
          <h2>${state.lang==='zh'?'状态 → 音乐特征':'State → musical features'}</h2>
          <p class="lead">${state.lang==='zh'?'不要先问“哪首歌治愈我”，先问：我现在需要降低还是提高唤醒？我需要歌词、节拍、空间，还是安静？':'Do not first ask “which song heals me”; ask whether you need lower or higher arousal, lyrics, beat, space or quiet.'}</p>
          <div class="preset-list">${DATA.lifePresets.map(pr=>`<button class="${p.preset===pr.id?'active':''}" data-preset="${pr.id}"><b>${state.lang==='zh'?pr.zh:pr.en}</b><br><span class="mini">${state.lang==='zh'?pr.zhText:pr.enText}</span></button>`).join('')}</div>
        </aside>
      </div>
      <h2>${state.lang==='zh'?'适合寻找/创作的音乐方向':'Music directions to search or create'}</h2>
      <div class="choice-guide-grid">${(DATA.choiceGuides||[]).map(g=>`<article class="choice-guide"><b>${state.lang==='zh'?g.zh:g.en}</b><p class="mini">${g.params}</p><p>${state.lang==='zh'?g.createZh:g.createEn}</p><p class="mini">${state.lang==='zh'?g.listenZh:g.listenEn}</p><div class="resource-grid">${resourceLinks(g.linksKey).map(r=>`<a href="${r.url}" target="_blank" rel="noopener">↗ ${r.label}</a>`).join('')}</div></article>`).join('')}</div>
    </section>`; if(redraw) drawActive();
  }

  function resourceLinks(key){ return (DATA.resourceLinks&&DATA.resourceLinks[key]) || (DATA.resourceLinks&&DATA.resourceLinks.composition) || []; }
function rangeLife(k){return `<div class="control"><label><span>${k}</span><output>${state.life[k]}</output></label><input data-life="${k}" type="range" min="${k==='bpm'?40:0}" max="${k==='bpm'?140:100}" value="${state.life[k]}"></div>`}
  function applyPreset(id){const pr=DATA.lifePresets.find(x=>x.id===id); if(!pr)return; state.life={preset:id,...pr.target}; renderLife();}
  function renderBeings(redraw=true){
    const modes=[['unison','1:1 同音'],['octave','2:1 八度'],['fifth','3:2 五度'],['third','5:4 大三度'],['minor','6:5 小三度'],['triad','1-3-5 三和弦'],['beating','接近但不稳']];
    $('#view').innerHTML=`<section class="page">${head(C('beings'),state.lang==='zh'?'共振工作室：把生命星体、频率比例和和声原理连起来。和谐不是相同，而是在边界中形成稳定关系。':'Resonance studio: connect being-stars, frequency ratios and harmony. Harmony is not sameness; it is stable relation with boundaries.')}
      <div class="lab-layout">
        <div class="panel"><div class="canvas-wrap"><canvas id="beingsCanvas"></canvas></div><div class="ratio-row">${modes.map(m=>`<button class="pill ${state.beings.ratioMode===m[0]?'active':''}" data-ratio-mode="${m[0]}">${m[1]}</button>`).join('')}</div></div>
        <aside class="panel">
          <h2>${state.lang==='zh'?'多星体如何形成和声':'How multiple stars form harmony'}</h2>
          <div class="multi-being-controls">${rangeBeing('a','Star A')}${rangeBeing('b','Star B')}${rangeBeing('c','Star C')}${rangeBeing('open','openness')}</div>
          <div class="formula formula-plain">2:1 octave · 3:2 fifth · 5:4 major third · 6:5 minor third · 1-3-5 triad</div>
          <div class="resonance-explain">
            <div class="analysis-card"><b>${state.lang==='zh'?'相同':'Sameness'}</b><p class="mini">${state.lang==='zh'?'同频会融合，但不一定最丰富。':'Same frequency fuses, but is not always the richest.'}</p></div>
            <div class="analysis-card"><b>${state.lang==='zh'?'互补':'Complement'}</b><p class="mini">${state.lang==='zh'?'3:2、5:4 等比例会形成稳定而有颜色的关系。':'Ratios like 3:2 and 5:4 create stable colored relations.'}</p></div>
            <div class="analysis-card"><b>${state.lang==='zh'?'张力':'Tension'}</b><p class="mini">${state.lang==='zh'?'太接近但不稳定会产生拍频，像关系中的摩擦。':'Too close but unstable creates beating, like friction in relation.'}</p></div>
            <div class="analysis-card"><b>${state.lang==='zh'?'边界':'Boundary'}</b><p class="mini">${state.lang==='zh'?'边界清楚，开放适中，才不会过载。':'Clear boundary plus moderate openness prevents overload.'}</p></div>
          </div>
          <div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="life_frequency">${C('learn')}</button><button class="btn gold" data-route="compose">${state.lang==='zh'?'把共振写成音乐':'Turn resonance into music'}</button></div>
        </aside>
      </div>
    </section>`; if(redraw) drawActive();
  }
function rangeBeing(k,label){return `<div class="control"><label><span>${label}</span><output>${state.beings[k]}</output></label><input data-being="${k}" type="range" min="0" max="100" value="${state.beings[k]}"></div>`}
  function renderLibrary(){
    $('#view').innerHTML=`<section class="page">${head(C('library'),state.lang==='zh'?'图书馆是星库：激发兴趣、验证知识、继续深入。每条资料都连接到星盘、实验、创作和声乐。':'The library is a star archive: spark curiosity, verify knowledge and go deeper. Each resource connects to atlas, labs, composition and voice.')}
      <div class="library-grid">${DATA.library.map((x,i)=>`<article class="card library-card"><span class="tag">${state.lang==='zh'?x[0]:x[1]}</span><h3>${state.lang==='zh'?x[0]:x[1]}</h3><p>${x[2]}</p><div class="skill-strip"><span>${i%2===0?C('atlas'):C('lab')}</span><span>${i%3===0?C('compose'):C('voice')}</span><span>${state.lang==='zh'?'继续搜索':'search more'}</span></div></article>`).join('')}</div>
    </section>`;
  }
function termMini(id){const t=DATA.terms.find(x=>x.id===id); return t?`<button class="card term-card" data-term="${t.id}"><h3>${esc(L(t).title)}</h3><p>${esc(L(t).one)}</p></button>`:'';}
  function openTerm(id){
    const t=DATA.terms.find(x=>x.id===id); if(!t)return;
    const g=galaxy(t.g);
    const labId=(DATA.soundLabs||[]).find(l=>l.term===t.id)?.id || (t.lab?.split(':')[1]) || 'sound';
    $('#modalBody').innerHTML=`<span class="tag" style="color:${g.color}">${esc(L(g))}</span><h2>${esc(L(t).title)}</h2><p class="lead">${esc(L(t).one)}</p>
      <div class="structure-canvas-wrap"><canvas id="modalLessonCanvas"></canvas></div>
      <div class="use-grid">
        <div class="use"><b>${state.lang==='zh'?'原理':'Principle'}</b><p class="mini">${esc(L(t).deep)}</p></div>
        <div class="use"><b>${state.lang==='zh'?'怎么用':'How to use'}</b><p class="mini">${esc(L(t).use||L(t).deep)}</p></div>
        <div class="use"><b>${state.lang==='zh'?'下一步':'Next step'}</b><p class="mini">${state.lang==='zh'?'进入对应实验、创作或歌唱路径，把知识变成动作。':'Open lab, compose or voice path to turn knowledge into action.'}</p></div>
      </div>
      <div class="actions"><button class="btn primary" data-act="light" data-id="${t.id}">${C('learn')}</button><button class="btn ghost" data-soundlab="${labId}">${C('lab')}</button><button class="btn ghost" data-route="voice">${C('voice')}</button><button class="btn ghost" data-route="compose">${C('compose')}</button></div>`;
    $('#modal').classList.add('open');
    requestAnimationFrame(()=>{const c=$('#modalLessonCanvas'); if(c) (ANIM.drawTeachingLab||ANIM.drawMiniLesson)(c, labId, state.params);});
  }
function closeModal(){ $('#modal').classList.remove('open'); }
  function galaxy(id){return DATA.galaxies.find(g=>g.id===id)||DATA.galaxies[0];}
  function light(id){ if(id){state.lit.add(id); save(); toast(`✦ ${state.lang==='zh'?'已点亮':'Lit'}: ${id}`); if(state.stopCosmos) state.stopCosmos(); state.stopCosmos=ANIM.drawCosmos($('#cosmos'),state.reduced); render();} }
  function toast(msg){const el=$('#toast'); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1600);}
  
  function bindDrawMelodyCanvas(){
    const c=$('#drawMelodyCanvas'); if(!c || c.dataset.bound==='1') return;
    c.dataset.bound='1';
    const getP=(e)=>{const r=c.getBoundingClientRect(); const p=e.touches?e.touches[0]:e; return {x:Math.max(0,Math.min(1,(p.clientX-r.left)/r.width)), y:Math.max(0,Math.min(1,(p.clientY-r.top)/r.height))};};
    let drawing=false;
    const start=e=>{drawing=true; state.drawMelody.points=[getP(e)]; e.preventDefault(); drawActive();};
    const move=e=>{if(!drawing)return; const p=getP(e); const pts=state.drawMelody.points; const last=pts[pts.length-1]; if(!last || Math.hypot(p.x-last.x,p.y-last.y)>.012){pts.push(p); if(pts.length>240) pts.shift(); ANIM.drawLineMelodyGuide(c,pts,state.compose.grid);} e.preventDefault();};
    const end=e=>{drawing=false; save();};
    c.addEventListener('pointerdown',start); c.addEventListener('pointermove',move); window.addEventListener('pointerup',end);
    c.addEventListener('touchstart',start,{passive:false}); c.addEventListener('touchmove',move,{passive:false}); window.addEventListener('touchend',end);
  }
  function drawLineToMelody(){
    const pts0=state.drawMelody?.points||[];
    if(pts0.length<2){toast(state.lang==='zh'?'请先在画布上画一条线':'Draw a line first');return;}
    normalizeComposition();
    const d=state.drawMelody||{};
    const steps=state.compose.steps||32;
    const smoothing=Number(d.smoothing??.62), sensitivity=Number(d.sensitivity??.72);
    const snap=d.snap||'scale', lineStyle=d.lineStyle||'smooth';
    let pts=pts0.map(p=>({x:p.x,y:p.y}));
    // smoothing: moving average in y
    const radius=Math.round(1+smoothing*8);
    if(lineStyle==='smooth'){
      pts=pts.map((p,i)=>{
        let sum=0,c=0;
        for(let k=-radius;k<=radius;k++){const q=pts0[i+k]; if(q){sum+=q.y;c++;}}
        return {x:p.x,y:sum/Math.max(1,c)};
      });
    }
    const grid=Array(steps).fill(-1); const acc={};
    for(let i=0;i<steps;i++){
      const x=i/Math.max(1,steps-1);
      let nearest=pts[0], dist=999;
      pts.forEach(p=>{const dd=Math.abs(p.x-x); if(dd<dist){dist=dd; nearest=p;}});
      const centered=(1-nearest.y-.5)*sensitivity+.5;
      let raw=Math.max(0,Math.min(1,centered))*7;
      let pitch=Math.round(raw);
      let accidental=0;
      if(snap==='chromatic' || snap==='free'){
        const frac=raw-Math.floor(raw);
        if(frac>.32 && frac<.68) accidental=.5;
        if(snap==='free' && frac>.68){pitch=Math.min(7,Math.ceil(raw)); accidental=-.25;}
      }
      grid[i]=Math.max(0,Math.min(7,pitch));
      if(accidental) acc[i]=accidental;
    }
    // line style -> rhythm
    for(let i=1;i<steps-1;i++){
      if(lineStyle==='smooth' && i%2===1 && Math.abs(grid[i]-grid[i-1])<=1 && Math.abs(grid[i]-grid[i+1])<=1) grid[i]=-1;
      if(lineStyle==='dotted' && i%2===1) grid[i]=-1;
      if(lineStyle==='angular' && i%4===3) grid[i]=-1;
      if(i%8===7) grid[i]=-1;
    }
    if(grid.length>4 && !grid.slice(-4).some(n=>n===0||n===7)) grid[grid.length-1]=0;
    state.compose.grid=grid;
    state.compose.accidentals=acc;
    state.compose.naturalize=true;
    save(); renderCompose();
  }
  function autoCorrelate(buf, sampleRate){
    let SIZE=buf.length, rms=0;
    for(let i=0;i<SIZE;i++){const v=buf[i]; rms+=v*v;}
    rms=Math.sqrt(rms/SIZE);
    if(rms<0.012) return {freq:0,level:rms};
    let r1=0,r2=SIZE-1,thres=0.2;
    for(let i=0;i<SIZE/2;i++){ if(Math.abs(buf[i])<thres){r1=i; break;} }
    for(let i=1;i<SIZE/2;i++){ if(Math.abs(buf[SIZE-i])<thres){r2=SIZE-i; break;} }
    buf=buf.slice(r1,r2); SIZE=buf.length;
    const c=new Array(SIZE).fill(0);
    for(let i=0;i<SIZE;i++) for(let j=0;j<SIZE-i;j++) c[i]+=buf[j]*buf[j+i];
    let d=0; while(c[d]>c[d+1]) d++;
    let maxval=-1,maxpos=-1;
    for(let i=d;i<SIZE;i++){ if(c[i]>maxval){maxval=c[i]; maxpos=i;} }
    let T0=maxpos;
    if(T0>0 && T0<SIZE-1){
      const x1=c[T0-1],x2=c[T0],x3=c[T0+1];
      const a=(x1+x3-2*x2)/2,b=(x3-x1)/2;
      if(a) T0=T0-b/(2*a);
    }
    return {freq: sampleRate/T0, level:rms};
  }
  async function startMicTrainer(){
    try{
      stopMicTrainer(false);
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!state.audio) state.audio=ANIM.makeAudio();
      const ctx=state.audio; if(ctx.state==='suspended') await ctx.resume();
      const source=ctx.createMediaStreamSource(stream);
      const analyser=ctx.createAnalyser(); analyser.fftSize=2048; source.connect(analyser);
      const buf=new Float32Array(analyser.fftSize);
      state.voiceMic={stream,source,analyser,buf,timer:null};
      state.voiceTrainer.mic=true; state.voiceTrainer.status='listening';
      const tick=()=>{
        analyser.getFloatTimeDomainData(buf);
        const res=autoCorrelate(buf,ctx.sampleRate);
        const prev=state.voiceTrainer.currentFreq||0;
        state.voiceTrainer.currentFreq=res.freq||0; state.voiceTrainer.level=Math.min(1,(res.level||0)*12);
        state.voiceTrainer.jitter = prev && res.freq ? Math.abs(res.freq-prev) : 0;
        const s=trainerScores();
        const set=(id,val)=>{const el=$('#'+id); if(el) el.textContent=val;};
        const bar=(id,val)=>{const el=$('#bar-'+id); if(el) el.style.width=Math.max(0,Math.min(100,val))+'%'; const tx=$('#score-'+id); if(tx) tx.textContent=val;};
        set('voiceCurrentHz', state.voiceTrainer.currentFreq?Math.round(state.voiceTrainer.currentFreq)+' Hz':'—');
        set('voiceFeedback', voiceFeedback());
        bar('pitch',s.pitch);bar('stable',s.stable);bar('breath',s.breath);bar('rhythm',s.rhythm);
        drawActive();
      };
      state.voiceMic.timer=setInterval(tick,120); toast(state.lang==='zh'?'麦克风训练已开启':'Mic trainer started');
    }catch(err){
      console.error(err); toast(state.lang==='zh'?'无法打开麦克风，请检查浏览器权限':'Could not open microphone; check browser permission');
    }
  }
  function stopMicTrainer(show=true){
    if(state.voiceMic){
      clearInterval(state.voiceMic.timer);
      state.voiceMic.stream?.getTracks?.().forEach(t=>t.stop());
      state.voiceMic=null;
    }
    state.voiceTrainer.mic=false;
    if(show) toast(state.lang==='zh'?'麦克风已停止':'Mic stopped');
  }
  function playTargetTone(){
    if(!state.audio) state.audio=ANIM.makeAudio();
    const a=state.audio; if(a.state==='suspended') a.resume();
    ANIM.playInstrument(a, state.voiceTrainer?.targetFreq||261.63, .85, 'softChoir', .7);
  }

function loopCanvas(id,draw){ if(state.rafs && state.rafs[id]) cancelAnimationFrame(state.rafs[id]); const c=$('#'+id); if(!c)return; const frame=(t)=>{draw(c,t*.001); if(!state.reduced) state.rafs[id]=requestAnimationFrame(frame);}; state.rafs[id]=requestAnimationFrame(frame);}
  function drawActive(){
    if($('#labCanvas')){
      const basic=['sound','harmonics','resonance','ratio','voice','life','beings'];
      if(ANIM.drawTeachingLab) loopCanvas('labCanvas',(c)=>ANIM.drawTeachingLab(c,state.lab,state.params));
      else if(basic.includes(state.lab)) loopCanvas('labCanvas',(c)=>ANIM.drawLab(c,state.lab,state.params));
      else loopCanvas('labCanvas',(c)=>ANIM.drawMiniLesson(c,state.lab,state.params));
    }
    if($('#voiceFlowCanvas')) loopCanvas('voiceFlowCanvas',(c)=>ANIM.drawVoiceFlow(c, DATA.voiceFlow||[], state.params.voiceLesson||'breath'));
    if($('#voiceTrainerCanvas')) loopCanvas('voiceTrainerCanvas',(c)=>(ANIM.drawSingingTrainer||ANIM.drawSingingCoach||ANIM.drawMiniLesson)(c, state.voiceTrainer||{}, state.params));
    if($('#voiceOrganCanvas')) loopCanvas('voiceOrganCanvas',(c)=>(ANIM.drawVoiceOrgans||ANIM.drawMiniLesson)(c, state.params.voiceLesson||'all', state.params));
    if($('#voiceLessonCanvas')) loopCanvas('voiceLessonCanvas',(c)=>(ANIM.drawSingingCoach||ANIM.drawVoiceTeaching||ANIM.drawMiniLesson)(c, state.params.voiceLesson||'breath', state.params));
    if($('#voiceCanvas')) loopCanvas('voiceCanvas',(c)=>ANIM.drawLab(c,'voice',state.params));
    if($('#lifeCanvas')) loopCanvas('lifeCanvas',(c)=>ANIM.drawLab(c,'life',state.life));
    if($('#beingsCanvas')) loopCanvas('beingsCanvas',(c)=>(ANIM.drawResonanceTeaching||ANIM.drawLab)(c,state.beings));
    if($('#drawMelodyCanvas')) { bindDrawMelodyCanvas(); ANIM.drawLineMelodyGuide($('#drawMelodyCanvas'), state.drawMelody?.points||[], state.compose.grid, state.drawMelody||{}); }
    if($('#trackOverviewCanvas')) ANIM.drawTrackOverview($('#trackOverviewCanvas'), {grid:state.compose.grid,steps:state.compose.steps});
    if($('#mandalaCanvas')) ANIM.drawMandala($('#mandalaCanvas'),state.compose.grid,-1);
    if($('#structureCanvas')) loopCanvas('structureCanvas',(c)=>ANIM.drawSongStructure(c,(DATA.emotionTemplates||[]).find(e=>e.id===state.compose.emotion)||{}));
  }
function playCurrentLab(){
    if(!state.audio) state.audio=ANIM.makeAudio();
    const a=state.audio; if(!a)return; if(a.state==='suspended') a.resume();
    if($('#voiceLessonCanvas')) { 
      const lesson=state.params.voiceLesson||'breath';
      const base={posture:220,breath:196,folds:247,onset:262,sovt:294,tract:330,vowel:392,scale:262,phrase:330,choir:262}[lesson]||330;
      const inst=lesson==='choir'?'softChoir':lesson==='scale'?'warmPiano':lesson==='vowel'?'breathFlute':'ambientPad';
      ANIM.playInstrument(a,base,.65,inst,.75);
      if(lesson==='choir'){ANIM.playInstrument(a,base*5/4,.65,'softChoir',.45,.05);ANIM.playInstrument(a,base*3/2,.65,'softChoir',.42,.1);}
      return; 
    }
    if($('#lifeCanvas')) { ANIM.playFreq(a,220,.18,'sine',.03); setTimeout(()=>ANIM.playFreq(a,277,.22,'triangle',.025),180); return; }
    if($('#beingsCanvas')) { 
      const base=220; const mode=state.beings.ratioMode||'triad';
      const ratios={unison:[1],octave:[1,2],fifth:[1,1.5],third:[1,1.25],minor:[1,1.2],triad:[1,1.25,1.5],beating:[1,1.04]}[mode]||[1,1.25,1.5];
      ratios.forEach((r,i)=>ANIM.playInstrument(a,base*r,.75,i===0?'deepBowl':'softChoir',i===0?.55:.36,i*.04)); return; 
    }
    const type=state.lab;
    if(type==='harmonics'){[1,2,3,4,5].forEach(n=>{ if(Number(state.params['h'+n]||0)>0) ANIM.playFreq(a,Number(state.params.freq||220)*n,.6,'sine',.018*Number(state.params['h'+n]));});}
    else if(type==='resonance'){ANIM.playFreq(a,Number(state.params.freq||330),.55,'sine',.04);}
    else ANIM.playFreq(a,Number(state.params.freq||220),.55,'sine',.045);
  }
  

function shiftOct(note,delta){
    const m=String(note||'C4').match(/^([A-G])(#|b)?(\d)$/); if(!m) return note;
    return `${m[1]}${m[2]||''}${Math.max(1,Math.min(7,Number(m[3])+delta))}`;
  }
  function chordDegrees(symbol){
    const map={I:[0,2,4],ii:[1,3,5],iii:[2,4,6],IV:[3,5,0],V:[4,6,1],vi:[5,0,2],'vii°':[6,1,3],i:[0,2,4],VII:[6,1,3]};
    return map[symbol]||map.I;
  }
  function arrangementEvents(opts={}){
    const sc=DATA.scales[state.compose.scale]; const layers=state.compose.layers||{}; const chords=state.compose.chords||['I','V','vi','IV'];
    const events=[]; const stepDur=60/state.compose.tempo/2; const natural=state.compose.naturalize!==false;
    const grid=state.compose.grid||[];
    grid.forEach((n,step)=>{
      const human = natural ? ((step%3)-1)*0.018 : 0;
      const vel = natural ? (.82 + ((step*37)%17)/100) : 1;
      if(layers.melody!==false && n>=0){
        events.push({role:'melody',step:step+human,freq:noteFreq(sc,n,step),instrument:state.compose.instrument,gain:vel,dur:stepDur*(natural?(step%8===6?1.25:.82):.9)});
        // passing tone between larger leaps: makes grid melody less blocky
        const next=grid[step+1];
        if(natural && next>=0 && Math.abs(next-n)>=3){
          const f1=noteFreq(sc,n,step), f2=noteFreq(sc,next,step+1);
          events.push({role:'passing',step:step+.52,freq:Math.sqrt(f1*f2),instrument:state.compose.instrument,gain:.34,dur:stepDur*.28});
        }
      }
      if(step%8===0){
        const sym=chords[Math.floor(step/8)%Math.max(1,chords.length)]||'I'; const deg=chordDegrees(sym);
        if(layers.bass!==false){const root=sc.notes[deg[0]%7]||sc.notes[0]; events.push({role:'bass',step,freq:ANIM.noteToFreq(shiftOct(root,-1)),instrument:'deepBowl',gain:.48,dur:stepDur*7.6});}
        if(layers.chords!==false){deg.forEach((d,i)=>{const note=sc.notes[d%7]||sc.notes[0]; events.push({role:'chord',step:step+i*.06,freq:ANIM.noteToFreq(note),instrument:'ambientPad',gain:.22,dur:stepDur*7.4});});}
      }
      if(layers.pulse!==false && step%2===0) events.push({role:'pulse',step:step+.01,freq:ANIM.noteToFreq(shiftOct(sc.notes[0],-1)),instrument:'woodPulse',gain:.18,dur:stepDur*.22});
      if(layers.drums!==false && state.compose.drums!==false){
        if(step%4===0) events.push({role:'drum',step:step+.005,freq:86,instrument:'djembeLow',gain:.62,dur:stepDur*.25});
        else if(step%4===2) events.push({role:'drum',step:step+.005,freq:170,instrument:'djembeSlap',gain:.30,dur:stepDur*.16});
        else if(natural && step%8===7) events.push({role:'drum',step:step+.01,freq:220,instrument:'djembeSlap',gain:.20,dur:stepDur*.12});
      }
    });
    if(opts.vocal || (state.compose.vocalGuide && opts.includeVocal)){
      grid.forEach((n,step)=>{ if(n>=0) events.push({role:'vocal',step:step+(natural?0.035:0),freq:noteFreq(sc,n,step),instrument:'vocalGuide',gain:.34,dur:stepDur*(natural?1.05:.9)}); });
    }
    return events.sort((a,b)=>(a.step||0)-(b.step||0));
  }


function currentNotes(){
    const sc=DATA.scales[state.compose.scale];
    return state.compose.grid.map((n,i)=>n>=0?sc.notes[n]+accidentalMark(i):null);
  }
  function currentPayload(){
    const sc=DATA.scales[state.compose.scale];
    return {
      title:'Harmonic Starcove melody',
      version: DATA.version || 'v18',
      purpose: state.compose.purpose,
      scale: state.compose.scale,
      tempo: state.compose.tempo,
      steps: state.compose.steps,
      instrument: state.compose.instrument,
      layers: state.compose.layers,
      chords: state.compose.chords,
      notes: currentNotes(),
      jianpu: state.compose.grid.map(n=>n>=0?sc.jianpu[n]:'0'),
      grid: state.compose.grid,
      arrangement: arrangementEvents().map(e=>({step:e.step,freq:Math.round(e.freq),instrument:e.instrument,gain:e.gain}))
    };
  }

  function playVocalGuide(){
    if(!state.audio) state.audio=ANIM.makeAudio(); const a=state.audio; if(!a)return; if(a.state==='suspended') a.resume();
    const events=arrangementEvents({vocal:true}).filter(e=>e.role==='vocal'||e.role==='melody');
    if(ANIM.playVocalGuide) ANIM.playVocalGuide(a,events,state.compose.tempo,state.compose.syllable||'hum');
    else events.filter(e=>e.role==='melody').forEach(e=>ANIM.playInstrument(a,e.freq,e.dur||.4,'vocalGuide',.45,e.step*(60/state.compose.tempo/2)));
  }
  function naturalizeComposition(){
    state.compose.naturalize=true;
    const g=state.compose.grid||[];
    // add breath rests and small returns without destroying the user's melody
    for(let i=7;i<g.length;i+=8){ if(Math.random()>.35) g[i]=-1; }
    for(let i=6;i<g.length;i+=16){ if(g[i]>=0 && Math.random()>.45) g[i]=Math.max(0,g[i]-1); }
    if(g.length>4 && !g.slice(-4).some(n=>n===0||n===7)) g[g.length-1]=0;
    state.compose.grid=g; save(); renderCompose();
  }

  function playComposition(){
    if(!state.audio) state.audio=ANIM.makeAudio(); const a=state.audio; if(!a)return; if(a.state==='suspended') a.resume();
    const events=arrangementEvents({includeVocal:true}); const stepMs=60/state.compose.tempo/2*1000;
    events.forEach(e=>ANIM.playInstrument(a,e.freq,e.dur||stepMs/1000,e.instrument||state.compose.instrument,e.gain||1,Math.max(0,e.step)*stepMs/1000));
    let i=0; const cells=$$('.seq-cell'); const max=state.compose.grid.length;
    const timer=setInterval(()=>{
      cells.forEach(c=>c.classList.remove('playing'));
      $$(`.seq-cell[data-step="${i}"]`).forEach(c=>c.classList.add('playing'));
      const mc=$('#mandalaCanvas'); if(mc) ANIM.drawMandala(mc,state.compose.grid,i);
      i++;
      if(i>=max){clearInterval(timer); setTimeout(()=>cells.forEach(c=>c.classList.remove('playing')),300)}
    }, stepMs||250);
  }
  function downloadBlob(blob,filename){
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function exportComposition(){
    downloadBlob(new Blob([JSON.stringify(currentPayload(),null,2)],{type:'application/json'}),'harmonic-starcove-melody.json');
  }
  function exportWav(){
    const blob=(ANIM.wavBlobArrangement?ANIM.wavBlobArrangement(arrangementEvents({includeVocal:true}), state.compose.tempo):ANIM.wavBlob(currentNotes(), state.compose.tempo, state.compose.instrument));
    downloadBlob(blob,'harmonic-starcove-melody.wav');
  }
  function exportMidi(){
    const payload=currentPayload();
    const midi=simpleMidi(payload.notes,payload.tempo);
    downloadBlob(new Blob([midi],{type:'audio/midi'}),'harmonic-starcove-melody.mid');
  }
  function exportMusicXML(){
    const p=currentPayload();
    const xml=`<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Harmonic Starcove</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>
      ${p.notes.map(n=>noteXml(n)).join('\n      ')}
    </measure>
  </part>
</score-partwise>`;
    downloadBlob(new Blob([xml],{type:'application/vnd.recordare.musicxml+xml'}),'harmonic-starcove-melody.musicxml');
  }
  function noteXml(note){
    if(!note) return '<note><rest/><duration>1</duration><type>eighth</type></note>';
    const m=String(note).match(/^([A-G])(#|b)?(\d)$/); if(!m) return '<note><rest/><duration>1</duration><type>eighth</type></note>';
    const alter=m[2]==='#'?'<alter>1</alter>':m[2]==='b'?'<alter>-1</alter>':'';
    return `<note><pitch><step>${m[1]}</step>${alter}<octave>${m[3]}</octave></pitch><duration>1</duration><type>eighth</type></note>`;
  }
  function simpleMidi(notes,tempo){
    const ppq=96, stepTicks=ppq/2;
    const events=[];
    let time=0;
    notes.forEach(n=>{
      if(n){
        const midi=noteMidi(n);
        events.push([time,0x90,midi,78]);
        events.push([time+stepTicks,0x80,midi,0]);
      }
      time+=stepTicks;
    });
    events.sort((a,b)=>a[0]-b[0]);
    const bytes=[];
    function vq(n){const out=[n&0x7f]; while(n>>=7) out.unshift((n&0x7f)|0x80); return out;}
    // tempo meta
    const mpqn=Math.round(60000000/tempo);
    bytes.push(0x00,0xff,0x51,0x03,(mpqn>>16)&255,(mpqn>>8)&255,mpqn&255);
    let last=0;
    events.forEach(e=>{bytes.push(...vq(e[0]-last),e[1],e[2],e[3]); last=e[0];});
    bytes.push(0x00,0xff,0x2f,0x00);
    const trackLen=bytes.length;
    const arr=[];
    const pushStr=s=>{for(let i=0;i<s.length;i++)arr.push(s.charCodeAt(i));};
    const push32=n=>arr.push((n>>24)&255,(n>>16)&255,(n>>8)&255,n&255);
    const push16=n=>arr.push((n>>8)&255,n&255);
    pushStr('MThd'); push32(6); push16(0); push16(1); push16(ppq);
    pushStr('MTrk'); push32(trackLen); arr.push(...bytes);
    return new Uint8Array(arr);
  }
  function noteMidi(note){
    const map={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    const m=String(note).match(/^([A-G])(#|b)?(\d)$/); if(!m) return 60;
    return 12*(Number(m[3])+1)+map[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
  }
  function downloadMandala(mode='mandala'){
    const c=$('#mandalaCanvas'); if(!c)return;
    if(mode==='wallpaper'){
      const off=document.createElement('canvas'); off.width=1080; off.height=1920;
      const ctx=off.getContext('2d');
      const g=ctx.createLinearGradient(0,0,0,1920); g.addColorStop(0,'#050415'); g.addColorStop(.50,'#101044'); g.addColorStop(1,'#061d36'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920);
      // starry background
      for(let i=0;i<360;i++){
        const x=Math.random()*1080, y=Math.random()*1920, r=Math.random()*2.1+.35;
        ctx.globalAlpha=.35+Math.random()*.6; ctx.fillStyle=i%9===0?'#ffe19b':i%7===0?'#7ce9ff':'#fff';
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
      // preserve source aspect ratio, no stretching
      const box=940, sx=c.width, sy=c.height;
      const scale=Math.min(box/sx,box/sy);
      const dw=sx*scale, dh=sy*scale;
      ctx.save();
      ctx.shadowColor='rgba(255,225,155,.6)'; ctx.shadowBlur=42;
      ctx.drawImage(c,(1080-dw)/2,330+(box-dh)/2,dw,dh);
      ctx.restore();
      // musical rings
      ctx.strokeStyle='rgba(255,225,155,.18)'; ctx.lineWidth=2;
      for(let r=380;r<=520;r+=46){ctx.beginPath();ctx.arc(540,800,r,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle='rgba(255,250,242,.92)'; ctx.font='bold 56px system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText('Harmonic Starcove',540,1435);
      ctx.font='34px system-ui, sans-serif'; ctx.fillStyle='rgba(255,225,155,.86)'; ctx.fillText('Music is the equation of love',540,1500);
      ctx.font='28px system-ui, sans-serif'; ctx.fillStyle='rgba(215,208,238,.76)'; ctx.fillText('my musical mandala',540,1552);
      const a=document.createElement('a'); a.href=off.toDataURL('image/png'); a.download='harmonic-starcove-starry-mandala-wallpaper.png'; a.click(); return;
    }
    const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='harmonic-starcove-mandala.png'; a.click();
  }

})();
