
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
    lang: localStorage.getItem('hs12_lang') || localStorage.getItem('hs9_lang') || 'zh',
    route: ROUTES.has(location.hash.replace('#','')) ? location.hash.replace('#','') : 'home',
    entered: (localStorage.getItem('hs12_entered') || localStorage.getItem('hs9_entered')) === '1',
    simple: (localStorage.getItem('hs12_simple') || localStorage.getItem('hs9_simple')) === '1',
    reduced: (localStorage.getItem('hs12_reduced') || localStorage.getItem('hs9_reduced')) === '1',
    lit: new Set(jget('hs12_lit', jget('hs9_lit',[]))),
    lab: 'sound',
    term: null,
    query: '',
    atlasFilter: 'all',
    raf: 0,
    stopCosmos: null,
    audio: null,
    compose: jget('hs12_compose',{scale:'C_major',tempo:84,steps:32,instrument:'warmPiano',purpose:'daily',emotion:'focus',grid:Array(32).fill(-1)}),
    life: {preset:'sleep', bpm:62,dynamic:22,lyrics:10,predict:86},
    beings: {a:52,b:68,c:42,open:60},
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
    if(!Array.isArray(state.compose.grid)) state.compose.grid = [];
    while(state.compose.grid.length < state.compose.steps) state.compose.grid.push(-1);
    if(state.compose.grid.length > state.compose.steps) state.compose.grid = state.compose.grid.slice(0,state.compose.steps);
  }
  normalizeComposition();

  const C = k => (DATA.copy[state.lang] && DATA.copy[state.lang][k]) || DATA.copy.zh[k] || k;
  const L = obj => obj?.[state.lang] || obj?.zh || obj?.en || obj || '';
  const save = () => {
    localStorage.setItem('hs12_lang', state.lang);
    localStorage.setItem('hs12_entered', state.entered?'1':'0');
    localStorage.setItem('hs12_simple', state.simple?'1':'0');
    localStorage.setItem('hs12_reduced', state.reduced?'1':'0');
    localStorage.setItem('hs12_lit', JSON.stringify([...state.lit]));
    localStorage.setItem('hs12_compose', JSON.stringify(state.compose));
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
      const el=e.target.closest('[data-act],[data-route],[data-term],[data-lab],[data-preset],[data-param-toggle],[data-filter],[data-voice-lesson],[data-soundlab]');
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
      if(act==='compose-wav'){exportWav(); return;}
      if(act==='compose-midi'){exportMidi(); return;}
      if(act==='compose-musicxml'){exportMusicXML(); return;}
      if(act==='purpose'){applyPurpose(el.dataset.id); return;}
      if(act==='emotion'){applyEmotion(el.dataset.id); return;}
      if(act==='voice-lesson'){state.params.lesson=el.dataset.id; renderVoice(); return;}
      if(act==='compose-clear'){state.compose.grid=Array(state.compose.steps||32).fill(-1); save(); renderCompose(); return;}
      if(act==='compose-random'){randomComposition(); return;}
      if(act==='compose-export'){exportComposition(); return;}
      if(act==='download-png'){downloadMandala('mandala'); return;}
      if(act==='download-wallpaper'){downloadMandala('wallpaper'); return;}
      if(act==='preset' || el.dataset.preset){applyPreset(el.dataset.preset); return;}
      if(el.dataset.filter){ state.atlasFilter=el.dataset.filter; renderAtlas(); return; }
      if(el.dataset.voiceLesson){ state.params.voiceLesson=el.dataset.voiceLesson; renderVoice(); return; }
      if(el.dataset.soundlab){ state.lab=el.dataset.soundlab; closeModal(); route('lab'); return; }
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
      if(el.id==='purposeSelect'){applyPurpose(el.value); return;}
      if(el.id==='emotionSelect'){applyEmotion(el.value); return;}
      if(el.id==='scaleSelect'){state.compose.scale=el.value; save(); renderCompose(); return;}
      if(el.id==='instrumentSelect'){state.compose.instrument=el.value; save(); updateComposeSide(); return;}
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
      $('#view').innerHTML=`<section class="gate"><div class="gate-copy"><p class="eyebrow">Musicalife · Harmonic Starcove</p><h1 class="title-gradient">${C('gateTitle')}</h1><p class="lead">${C('gateSub')}</p><p class="lead deep">${state.lang==='zh'?'音乐带给我们生命的激情。音乐给我们生命的勇气。音乐是我们建构的爱的方程式。':'Music gives life passion. Music gives life courage. Music is the equation of love we build.'}</p><div class="actions"><button class="btn primary" data-act="enter">${C('enter')}</button><button class="btn ghost" data-route="odyssey">☄ ${C('odyssey')}</button><button class="btn ghost" data-route="compose">𝄞 ${C('compose')}</button></div></div><div class="gate-canvas-wrap"><canvas id="gateCanvas"></canvas></div></section>`;
      loopCanvas('gateCanvas',(c,t)=>ANIM.drawGate(c,t,state.params)); return;
    }
    const pct=Math.round(state.lit.size/DATA.terms.length*100);
    const paths=DATA.learningPaths||[];
    $('#view').innerHTML=`<section class="home-grid"><div class="hero-card panel"><p class="eyebrow">Harmonic Starcove v11 · ${state.lang==='zh'?'音乐能力星图':'Music ability atlas'}</p><h1 class="title-gradient">${C('homeTitle')}</h1><p class="lead">${C('homeLead')}</p><div class="learning-flow">${paths.map((p,i)=>`<button class="flow-step" data-route="${p.route}"><b>${i+1}. ${state.lang==='zh'?p.zh:p.en}</b><span>${p.icon}</span></button>`).join('')}</div><div class="actions"><button class="btn primary" data-route="odyssey">☄ ${C('odyssey')}</button><button class="btn ghost" data-route="atlas">◎ ${C('atlas')}</button><button class="btn ghost" data-route="compose">𝄞 ${C('compose')}</button></div></div><div class="panel"><div class="canvas-wrap"><canvas id="homeCanvas"></canvas></div><div class="stat-grid"><div class="stat"><strong>${state.lit.size}</strong><span>${C('made')}</span><div class="progress"><i style="width:${pct}%"></i></div></div><div class="stat"><strong>${DATA.terms.length}</strong><span>${C('stars')}</span></div><div class="stat"><strong>${paths.length}</strong><span>${state.lang==='zh'?'学习路径':'paths'}</span></div></div><p class="mini">${state.lang==='zh'?'主线不是浏览页面，而是积累音乐能力：听见、歌唱、创作、选择、聆听、表达。':'The main line is not browsing pages, but growing music ability: hear, sing, compose, choose, listen and express.'}</p></div></section><section class="path-grid">${paths.map(p=>pathCard(p)).join('')}</section>`;
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
    if(type==='harmonics') return `<div class="toggle-row">${[1,2,3,4,5].map(n=>`<button class="pill ${state.params['h'+n]?'active':''}" data-param-toggle="h${n}" type="button">${n}f</button>`).join('')}</div>${range('freq','Hz',110,440,Number(state.params.freq||220))}${[1,2,3,4,5].map(n=>range('h'+n,`${n}f`,0,1,Number(state.params['h'+n]??(n<4?1:.4)),.05)).join('')}`;
    if(type==='resonance') return `${range('freq','input Hz',110,660,Number(state.params.freq||330))}${range('target','preferred Hz',180,660,Number(state.params.target||440))}`;
    return `${range('freq','frequency Hz',110,880,Number(state.params.freq||220))}${range('amp','amplitude',0,100,Number(state.params.amp||52))}${range('phase','phase °',0,360,Number(state.params.phase||0))}`;
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
  
function renderVoice(redraw=true){
    const lessons=DATA.voiceCurriculum||[];
    const active=state.params.voiceLesson||'breath';
    const lesson=lessons.find(x=>x.id===active)||lessons[0];
    $('#view').innerHTML=`<section class="page">${head(C('voice'),state.lang==='zh'?'歌唱工作室：从身体成为乐器开始，按顺序理解姿态、呼吸、声带、SOVT、声道、元音、音阶、换气与合唱。':'Singing studio: begin with the body as instrument, then posture, breath, folds, SOVT, tract, vowels, scale, phrasing and choir.')}
      <div class="lesson-path">${lessons.map(l=>`<button class="lesson-card ${active===l.id?'active':''}" data-voice-lesson="${l.id}"><b>${state.lang==='zh'?l.zh:l.en}</b><span class="mini">${state.lang==='zh'?l.principleZh:l.principleEn}</span></button>`).join('')}</div>
      <div class="lesson-stage">
        <div class="panel">
          <div class="canvas-wrap"><canvas id="voiceLessonCanvas"></canvas></div>
          <div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="${lesson.term}">${C('learn')}</button><button class="btn gold" data-route="compose">${state.lang==='zh'?'把练习写成旋律':'Turn practice into melody'}</button></div>
        </div>
        <aside class="panel">
          <h2>${esc(state.lang==='zh'?lesson.zh:lesson.en)}</h2>
          <div class="lesson-principles">
            <div class="principle-card"><b>${state.lang==='zh'?'原理':'Principle'}</b><p>${esc(state.lang==='zh'?lesson.principleZh:lesson.principleEn)}</p></div>
            <div class="principle-card"><b>${state.lang==='zh'?'怎么练':'Practice'}</b><p>${esc(state.lang==='zh'?lesson.practiceZh:lesson.practiceEn)}</p></div>
            <div class="principle-card"><b>${state.lang==='zh'?'常见错误':'Common mistake'}</b><p>${esc(state.lang==='zh'?lesson.mistakeZh:lesson.mistakeEn)}</p></div>
          </div>
          <div class="control"><label>Vowel / 元音</label><select id="vowelSelect">${['a','e','i','o','u'].map(v=>`<option ${state.params.vowel===v?'selected':''}>${v}</option>`).join('')}</select></div>
          <div class="formula">${voiceFormula(active)}</div>
          <p class="mini">${state.lang==='zh'?'默认声音已改成柔和合成音色，避免尖锐刺激。真正练习时保持小音量、无疼痛、不过度用力。':'Default sound is softened to avoid harshness. In real practice, stay low-volume, pain-free and non-forced.'}</p>
        </aside>
      </div>
    </section>`;
    if(redraw) drawActive();
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
    const sc=DATA.scales[state.compose.scale]; const grid=state.compose.grid;
    const insts=DATA.instruments||[];
    const purposes=DATA.composePurposes||[];
    const emotions=DATA.emotionTemplates||[];
    const activeEmotion=emotions.find(e=>e.id===state.compose.emotion)||emotions[0]||{};
    $('#view').innerHTML=`<section class="page">${head(C('compose'),state.lang==='zh'?'创作工作室：先理解想表达什么，再学习乐曲如何展开，最后写旋律、看乐谱、生成曼陀罗并导出。':'Composition studio: understand what to express, learn how a piece unfolds, then write melody, read notation, generate mandala and export.')}
      <div class="studio-layout">
        <aside class="studio-left">
          <details class="fold" open><summary>${state.lang==='zh'?'① 我要表达什么':'① What do I express?'}</summary><div class="fold-body">
            <div class="visual-template-grid">${emotions.map(e=>`<button class="visual-template ${state.compose.emotion===e.id?'active':''}" data-act="emotion" data-id="${e.id}"><div class="template-icon">${templateBars(e)}</div><b>${state.lang==='zh'?e.zh:e.en}</b><p class="mini">${state.lang==='zh'?e.zhWhy:e.enWhy}</p></button>`).join('')}</div>
          </div></details>
          <details class="fold" open><summary>${state.lang==='zh'?'② 音乐参数':'② Music parameters'}</summary><div class="fold-body">
            <div class="compose-top">
              <label>${state.lang==='zh'?'情绪':'Emotion'}<select id="emotionSelect">${emotions.map(e=>`<option value="${e.id}" ${e.id===state.compose.emotion?'selected':''}>${state.lang==='zh'?e.zh:e.en}</option>`).join('')}</select></label>
              <label>${state.lang==='zh'?'用途':'Purpose'}<select id="purposeSelect">${purposes.map(p=>`<option value="${p.id}" ${p.id===state.compose.purpose?'selected':''}>${state.lang==='zh'?p.zh:p.en}</option>`).join('')}</select></label>
              <label>${state.lang==='zh'?'音阶':'Scale'}<select id="scaleSelect">${Object.keys(DATA.scales).map(k=>`<option value="${k}" ${k===state.compose.scale?'selected':''}>${state.lang==='zh'?DATA.scales[k].zh:DATA.scales[k].en}</option>`).join('')}</select></label>
              <label>${state.lang==='zh'?'乐器':'Instrument'}<select id="instrumentSelect">${insts.map(i=>`<option value="${i.id}" ${i.id===state.compose.instrument?'selected':''}>${state.lang==='zh'?i.zh:i.en}</option>`).join('')}</select></label>
              <label>${state.lang==='zh'?'长度':'Length'}<select id="stepsSelect">${[16,32,64,128].map(n=>`<option value="${n}" ${n===state.compose.steps?'selected':''}>${n} steps</option>`).join('')}</select></label>
            </div>
            <div class="control"><label><span>BPM</span><output>${state.compose.tempo}</output></label><input id="tempoRange" type="range" min="40" max="180" value="${state.compose.tempo}"><input id="tempoInput" type="number" min="40" max="180" value="${state.compose.tempo}"></div>
          </div></details>
        </aside>
        <section class="studio-mid">
          <div class="panel">
            <h2>${state.lang==='zh'?'③ 写旋律 / 读乐谱':'③ Write melody / read notation'}</h2>
            <p class="mini">${state.lang==='zh'?'点击星格写旋律；简谱看音级，五线谱看“时间 × 音高”，曼陀罗看整体结构。':'Click star cells to write melody; jianpu shows degree, staff shows time × pitch, mandala shows structure.'}</p>
            <div class="compose-actions">
              <button class="btn primary" data-act="compose-play">▶ ${C('play')}</button>
              <button class="btn ghost" data-act="compose-random">${state.lang==='zh'?'按模板生成':'Generate by template'}</button>
              <button class="btn ghost" data-act="compose-clear">${C('reset')}</button>
            </div>
            <div class="sequencer long" style="${seqStyle(grid.length)}">${seqGrid(sc,grid)}</div>
            <div id="notation" class="notation">${notation(sc,grid)}</div>
          </div>
        </section>
        <aside class="studio-right">
          <div class="panel">
            <h2>${state.lang==='zh'?'④ 结构动画':'④ Form animation'}</h2>
            <div class="structure-canvas-wrap"><canvas id="structureCanvas"></canvas></div>
            <div class="explain-box">${structureExplanation(activeEmotion)}</div>
          </div>
          <div class="panel">
            <h2>${state.lang==='zh'?'⑤ 音乐曼陀罗 / 导出':'⑤ Mandala / export'}</h2>
            <div class="canvas-wrap small-canvas"><canvas id="mandalaCanvas"></canvas></div>
            <div class="export-grid">
              <button class="btn gold" data-act="compose-wav">WAV</button>
              <button class="btn gold" data-act="compose-midi">MIDI</button>
              <button class="btn gold" data-act="compose-musicxml">MusicXML</button>
              <button class="btn ghost" data-act="compose-export">JSON</button>
              <button class="btn ghost" data-act="download-png">PNG</button>
              <button class="btn ghost" data-act="download-wallpaper">${state.lang==='zh'?'手机壁纸':'Wallpaper'}</button>
            </div>
            <p class="mini">${state.lang==='zh'?'WAV 可以真的导出听；MIDI / MusicXML 可以继续进入乐谱软件或 DAW。':'WAV can be listened to; MIDI / MusicXML can continue in notation software or DAW.'}</p>
          </div>
        </aside>
      </div></section>`;
    if(redraw) drawActive();
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
function seqStyle(steps){ return `grid-template-columns:42px repeat(${steps},minmax(28px,1fr))`; }
  function seqGrid(sc,grid){
    let html='<div class="seq-label"></div>';
    for(let s=0;s<grid.length;s++) html+=`<div class="seq-label ${s%8===0?'seq-step-accent':''}">${s+1}</div>`;
    for(let p=7;p>=0;p--){
      html+=`<div class="seq-label">${sc.jianpu[p]}</div>`;
      for(let s=0;s<grid.length;s++) html+=`<button class="seq-cell ${grid[s]===p?'on':'rest'} ${s%8===0?'seq-step-accent':''}" data-act="compose-note" data-step="${s}" data-pitch="${p}" type="button" aria-label="step ${s+1} pitch ${p}"></button>`;
    }
    return html;
  }
  function notation(sc,grid){
    const nums=grid.map(n=>n>=0?sc.jianpu[n]:'·').join(' ');
    const notes=grid.map((n,i)=>n>=0?`<span class="note-dot" style="left:${Math.min(96,3+i*(94/Math.max(1,grid.length-1)))}%;top:${72-n*8}px"></span>`:'').join('');
    return `<b>${state.lang==='zh'?'简谱':'Jianpu'}:</b><div class="jianpu">${nums}</div><div class="staff">${[0,1,2,3,4].map(()=>'<div class="line"></div>').join('')}${notes}</div>`;
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
    $('#view').innerHTML=`<section class="page">${head(C('atlas'),state.lang==='zh'?'知识星图：按学习路径筛选，点击每颗星进入动画小课、声音实验、创作方法和继续阅读。':'Knowledge star map: filter by learning path; tap a star for mini lesson, sound lab, composition use and further reading.')}
      <div class="term-tools"><input id="searchInput" placeholder="${C('search')}" value="${esc(state.query)}"><button class="pill" data-lab="sound">∿ ${C('lab')}</button><button class="pill" data-route="voice">◌ ${C('voice')}</button><button class="pill" data-route="compose">𝄞 ${C('compose')}</button></div>
      <div class="atlas-legend">${filters.map(f=>`<button class="pill ${state.atlasFilter===f.id?'active':''}" data-filter="${f.id}">${f.icon||'✦'} ${state.lang==='zh'?f.zh:f.en}</button>`).join('')}</div>
      <div class="star-map star-map-v12" id="starMap">${starMapSvg()}</div>
      <h2>${state.lang==='zh'?'知识星点':'Knowledge stars'}</h2>
      <div id="atlasList" class="term-list"></div>
    </section>`;
    renderAtlasList();
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
    const terms=filteredTerms().slice(0,96);
    const W=1240,H=820;
    const pos={
      sound:[250,170],hearing:[610,140],theory:[960,170],
      world:[220,420],create:[620,395],rhythm:[1000,420],
      life:[270,660],beings:[620,670],voice:[970,650]
    };
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Harmonic Starcove knowledge map">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <text x="620" y="410" text-anchor="middle" fill="#fff" font-size="28" font-weight="900">${state.lang==='zh'?'音乐是爱的方程式':'music is love equation'}</text>
      <text x="620" y="438" text-anchor="middle" fill="#ffe19b" font-size="15">${state.lang==='zh'?'选择一条路径，点亮相关星系':'choose a path and light related galaxies'}</text>`;
    const links=[['sound','hearing'],['sound','theory'],['theory','rhythm'],['rhythm','create'],['create','life'],['life','beings'],['beings','voice'],['voice','theory'],['world','sound'],['world','create']];
    links.forEach(([a,b])=>{const A=pos[a],B=pos[b]; if(A&&B) svg+=`<path class="star-edge" d="M${A[0]} ${A[1]} C ${(A[0]+B[0])/2} ${A[1]}, ${(A[0]+B[0])/2} ${B[1]}, ${B[0]} ${B[1]}"/>`;});
    groups.forEach(g=>{
      const P=pos[g.id]||[620,410];
      const related=state.atlasFilter==='all'||pathGalaxy(state.atlasFilter).includes(g.id);
      svg+=`<circle cx="${P[0]}" cy="${P[1]}" r="${related?38:26}" fill="${g.color}" opacity="${related?.22:.09}" filter="url(#glow)"/><text class="star-galaxy-label" x="${P[0]}" y="${P[1]-48}" text-anchor="middle" fill="${g.color}" font-size="22" font-weight="900">${esc(L(g))}</text>`;
    });
    const counts={};
    terms.forEach((t,i)=>{
      const P=pos[t.g]||[620,410];
      const n=counts[t.g]=(counts[t.g]||0)+1;
      const col=Math.floor((n-1)%4), row=Math.floor((n-1)/4);
      const x=P[0]-90+col*60+(row%2)*16;
      const y=P[1]-6+row*38;
      const color=galaxy(t.g).color;
      if(n<=16) svg+=`<path class="star-edge" d="M${P[0]} ${P[1]} Q ${(P[0]+x)/2} ${(P[1]+y)/2-18} ${x} ${y}"/>`;
      svg+=`<g class="star-node" data-term="${t.id}"><circle cx="${x}" cy="${y}" r="${state.lit.has(t.id)?6:4}" fill="${state.lit.has(t.id)?'#ffe19b':color}" filter="url(#glow)"/><title>${esc(L(t).title)}</title><text x="${x+8}" y="${y+4}" fill="rgba(255,255,255,.84)" font-size="10">${esc(L(t).title).slice(0,14)}</text></g>`;
    });
    svg+=`</svg>`;
    return svg;
  }
  function renderAtlasList(){
    const list=filteredTerms();
    $('#atlasList').innerHTML=list.map(t=>`<button class="card term-card ${state.lit.has(t.id)?'lit':''}" data-term="${t.id}" style="--accent:${galaxy(t.g).color}"><span class="tag">${state.lit.has(t.id)?'✦':'○'} ${esc(L(galaxy(t.g)))}</span><h3>${esc(L(t).title)}</h3><p>${esc(L(t).one)}</p></button>`).join('');
  }
function renderLife(redraw=true){
    const p=state.life;
    $('#view').innerHTML=`<section class="page">${head(C('life'),state.lang==='zh'?'选择音乐也是一种创作训练：先识别状态，再把状态翻译成 BPM、动态、歌词、可预测性、音色和结构。':'Choosing music is also composition training: identify state, then translate it into BPM, dynamics, lyrics, predictability, timbre and form.')}
      <div class="life-grid">
        <div class="panel">
          <div class="canvas-wrap"><canvas id="lifeCanvas"></canvas></div>
          ${['bpm','dynamic','lyrics','predict'].map(k=>rangeLife(k)).join('')}
          <div class="formula">${state.lang==='zh'?'冥想 ≈ 低干扰 + 低噪声 + 可预测结构 + 温和身体节律':'Meditation ≈ low interference + low noise + predictable structure + gentle bodily rhythm'}</div>
          <div class="actions"><button class="btn primary" data-act="play-lab">${C('listen')}</button><button class="btn ghost" data-act="light" data-id="sleep_music">${C('learn')}</button><button class="btn gold" data-route="compose">${state.lang==='zh'?'用这些参数创作':'Create with these parameters'}</button></div>
        </div>
        <aside class="panel">
          <h2>${state.lang==='zh'?'状态 → 音乐特征':'State → musical features'}</h2>
          <p class="lead">${state.lang==='zh'?'不要问“哪首歌治愈我”，先问：我现在需要降低还是提高唤醒？我需要歌词、节拍、空间，还是安静？':'Do not first ask “which song heals me”; ask whether you need lower or higher arousal, lyrics, beat, space or quiet.'}</p>
          <div class="preset-list">${DATA.lifePresets.map(pr=>`<button class="${p.preset===pr.id?'active':''}" data-preset="${pr.id}"><b>${state.lang==='zh'?pr.zh:pr.en}</b><br><span class="mini">${state.lang==='zh'?pr.zhText:pr.enText}</span></button>`).join('')}</div>
        </aside>
      </div>
    </section>`; if(redraw) drawActive();
  }
function rangeLife(k){return `<div class="control"><label><span>${k}</span><output>${state.life[k]}</output></label><input data-life="${k}" type="range" min="${k==='bpm'?40:0}" max="${k==='bpm'?140:100}" value="${state.life[k]}"></div>`}
  function applyPreset(id){const pr=DATA.lifePresets.find(x=>x.id===id); if(!pr)return; state.life={preset:id,...pr.target}; renderLife();}
  function renderBeings(redraw=true){
    $('#view').innerHTML=`<section class="page">${head(C('beings'),state.lang==='zh'?'共振不是所有人变得一样，而是在边界、开放和差异中形成新的和声。V11 加入三星/三体模式。':'Resonance is not everyone becoming the same; it is new harmony through boundary, openness and difference. V11 adds a three-body mode.')}
      <div class="lab-layout">
        <div class="canvas-wrap"><canvas id="beingsCanvas"></canvas></div>
        <aside class="panel">
          <h2>${state.lang==='zh'?'三颗生命星体':'Three being-stars'}</h2>
          <div class="multi-being-controls">${rangeBeing('a','Star A')}${rangeBeing('b','Star B')}${rangeBeing('c','Star C')}${rangeBeing('open','openness')}</div>
          <div class="formula">similarity ≠ sameness · boundary + openness + complement → harmony</div>
          <p class="mini">${state.lang==='zh'?'频率接近会共振；差异会产生拍频和张力；互补会生成新的和声。爱不是合并，而是在边界中共同发光。':'Close frequencies resonate; difference creates beating and tension; complement generates new harmony. Love is not merging, but glowing together with boundaries.'}</p>
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
    requestAnimationFrame(()=>{const c=$('#modalLessonCanvas'); if(c) ANIM.drawMiniLesson(c, labId, state.params);});
  }
function closeModal(){ $('#modal').classList.remove('open'); }
  function galaxy(id){return DATA.galaxies.find(g=>g.id===id)||DATA.galaxies[0];}
  function light(id){ if(id){state.lit.add(id); save(); toast(`✦ ${state.lang==='zh'?'已点亮':'Lit'}: ${id}`); if(state.stopCosmos) state.stopCosmos(); state.stopCosmos=ANIM.drawCosmos($('#cosmos'),state.reduced); render();} }
  function toast(msg){const el=$('#toast'); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1600);}
  function loopCanvas(id,draw){ cancelAnimationFrame(state.raf); const c=$('#'+id); if(!c)return; const frame=(t)=>{draw(c,t*.001); if(!state.reduced) state.raf=requestAnimationFrame(frame);}; state.raf=requestAnimationFrame(frame);}
  function drawActive(){
    if($('#labCanvas')){
      const basic=['sound','harmonics','resonance','ratio','voice','life','beings'];
      if(basic.includes(state.lab)) loopCanvas('labCanvas',(c)=>ANIM.drawLab(c,state.lab,state.params));
      else loopCanvas('labCanvas',(c)=>ANIM.drawMiniLesson(c,state.lab,state.params));
    }
    if($('#voiceLessonCanvas')) loopCanvas('voiceLessonCanvas',(c)=>ANIM.drawMiniLesson(c, state.params.voiceLesson||'breath', state.params));
    if($('#voiceCanvas')) loopCanvas('voiceCanvas',(c)=>ANIM.drawLab(c,'voice',state.params));
    if($('#lifeCanvas')) loopCanvas('lifeCanvas',(c)=>ANIM.drawLab(c,'life',state.life));
    if($('#beingsCanvas')) loopCanvas('beingsCanvas',(c)=>ANIM.drawLab(c,'beings',state.beings));
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
    if($('#beingsCanvas')) { ANIM.playFreq(a,180+state.beings.a*4,.6,'sine',.026); ANIM.playFreq(a,180+state.beings.b*4,.6,'triangle',.026); ANIM.playFreq(a,180+state.beings.c*4,.6,'sine',.018); return; }
    const type=state.lab;
    if(type==='harmonics'){[1,2,3,4,5].forEach(n=>{ if(Number(state.params['h'+n]||0)>0) ANIM.playFreq(a,Number(state.params.freq||220)*n,.6,'sine',.018*Number(state.params['h'+n]));});}
    else if(type==='resonance'){ANIM.playFreq(a,Number(state.params.freq||330),.55,'sine',.04);}
    else ANIM.playFreq(a,Number(state.params.freq||220),.55,'sine',.045);
  }
  
function currentNotes(){
    const sc=DATA.scales[state.compose.scale];
    return state.compose.grid.map(n=>n>=0?sc.notes[n]:null);
  }
  function currentPayload(){
    const sc=DATA.scales[state.compose.scale];
    return {
      title:'Harmonic Starcove melody',
      version: DATA.version || 'v12',
      purpose: state.compose.purpose,
      scale: state.compose.scale,
      tempo: state.compose.tempo,
      steps: state.compose.steps,
      instrument: state.compose.instrument,
      notes: currentNotes(),
      jianpu: state.compose.grid.map(n=>n>=0?sc.jianpu[n]:'0'),
      grid: state.compose.grid
    };
  }
  function playComposition(){
    if(!state.audio) state.audio=ANIM.makeAudio(); const a=state.audio; if(!a)return;
    const notes=currentNotes();
    const stepMs=ANIM.playMelodyInstrument ? ANIM.playMelodyInstrument(a,notes,state.compose.tempo,state.compose.instrument) : ANIM.playMelody(a,notes,state.compose.tempo,'triangle');
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
    const blob=ANIM.wavBlob(currentNotes(), state.compose.tempo, state.compose.instrument);
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
      const g=ctx.createLinearGradient(0,0,0,1920); g.addColorStop(0,'#050415'); g.addColorStop(.55,'#101044'); g.addColorStop(1,'#061d36'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920);
      ctx.drawImage(c,80,330,920,920);
      ctx.fillStyle='rgba(255,250,242,.92)'; ctx.font='bold 56px system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText('Harmonic Starcove',540,1420);
      ctx.font='34px system-ui, sans-serif'; ctx.fillStyle='rgba(255,225,155,.82)'; ctx.fillText('Music is the equation of love',540,1485);
      const a=document.createElement('a'); a.href=off.toDataURL('image/png'); a.download='harmonic-starcove-wallpaper.png'; a.click(); return;
    }
    const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='harmonic-starcove-mandala.png'; a.click();
  }
})();
