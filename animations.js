
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const setup = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    const w = Math.max(10, r.width || canvas.clientWidth || 600);
    const h = Math.max(10, r.height || canvas.clientHeight || 360);
    if(canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)){
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  };
  const noteMap = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function noteToFreq(note){
    const m = String(note).match(/^([A-G])(#|b)?(\d)$/);
    if(!m) return 440;
    let n = noteMap[m[1]] + (m[2]==='#'?1:m[2]==='b'?-1:0);
    const octave = +m[3];
    const midi = 12*(octave+1)+n;
    return 440 * Math.pow(2,(midi-69)/12);
  }
  function clear(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    const g=ctx.createRadialGradient(w*.5,h*.45,0,w*.5,h*.45,Math.max(w,h)*.75);
    g.addColorStop(0,'rgba(120,90,255,.11)');
    g.addColorStop(.52,'rgba(8,9,38,.18)');
    g.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }
  function star(ctx,x,y,r,color='rgba(255,255,255,.85)'){
    ctx.save(); ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=r*4; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill(); ctx.restore();
  }
  function label(ctx,t,x,y){
    ctx.save(); ctx.fillStyle='rgba(255,255,255,.82)'; ctx.font='12px system-ui, sans-serif'; ctx.fillText(t,x,y); ctx.restore();
  }
  function litCount(){
    try{
      const keys=['hs14_lit','hs13_lit','hs12_lit','hs11_lit','hs10_lit','hs9_lit'];
      for(const k of keys){
        const v=JSON.parse(localStorage.getItem(k)||'[]');
        if(Array.isArray(v) && v.length) return v.length;
      }
    }catch(e){}
    return 0;
  }
  function drawCosmos(canvas, reduced=false){
    const {ctx,w,h}=setup(canvas);
    const lit=litCount();
    const count=180+Math.min(220,lit*5);
    const stars=Array.from({length:count},()=>({x:Math.random(),y:Math.random(),r:Math.random()*(1.4+Math.min(1.4,lit*.02))+.25,s:Math.random()*0.8+.3,a:Math.random()*TAU,c:Math.random()}));
    let raf=0;
    function frame(t){
      clear(ctx,w,h);
      const tt=t*.001;
      const glowBoost=Math.min(.45,lit*.006);
      for(const st of stars){
        const pulse = reduced ? (.48+glowBoost) : (.22+glowBoost+.78*Math.sin(tt*st.s+st.a)**2);
        const col=st.c>.88?'#ffe19b':st.c>.72?'#7ce9ff':st.c>.58?'#ff9fd5':'#fff';
        ctx.globalAlpha=Math.min(1,pulse); star(ctx,st.x*w,st.y*h,st.r,col);
      }
      ctx.globalAlpha=1;
      // large quiet function curves
      for(let k=0;k<4;k++){
        ctx.beginPath();
        for(let x=0;x<=w;x+=3){
          const y=h*(.35+k*.12)+Math.sin(x*.009*(k+1)+tt*(.25+k*.08))*22/(k+1)+Math.cos(x*.004+tt)*14;
          x?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.strokeStyle=[`rgba(124,233,255,${.28+glowBoost})`,`rgba(255,225,155,${.18+glowBoost})`,`rgba(255,159,213,${.16+glowBoost})`,`rgba(185,156,255,${.22+glowBoost})`][k];
        ctx.lineWidth=1.2+Math.min(1.2,lit*.01); ctx.stroke();
      }
      if(lit>8){
        for(let i=0;i<Math.min(16,Math.floor(lit/4));i++){
          const a=tt*.05+i*TAU/Math.max(1,Math.min(16,Math.floor(lit/4)));
          const cx=w*.5+Math.cos(a)*w*.28, cy=h*.52+Math.sin(a*1.7)*h*.22;
          star(ctx,cx,cy,1.4+i*.02,'rgba(255,225,155,.9)');
        }
      }
      if(!reduced) raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    return ()=>cancelAnimationFrame(raf);
  }
  function drawGate(canvas,t,params={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const tt=t||performance.now()*.001;
    const cx=w*.52, cy=h*.50;
    // mandala rings
    for(let ring=0; ring<5; ring++){
      const R=Math.min(w,h)*(0.12+ring*.075);
      ctx.beginPath();
      for(let i=0;i<=360;i++){
        const a=i/360*TAU;
        const rr=R*(1+0.10*Math.sin(a*(ring+3)+tt*(.6+ring*.1)));
        const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=['rgba(124,233,255,.65)','rgba(255,225,155,.45)','rgba(255,159,213,.45)','rgba(185,156,255,.55)','rgba(170,242,197,.42)'][ring];
      ctx.lineWidth=1.4; ctx.stroke();
    }
    // sine bridge, unobstructed
    for(let k=0;k<5;k++){
      ctx.beginPath();
      for(let x=0;x<=w;x+=2){
        const y=h*.74 + Math.sin(x*.014*(k+1)+tt*(.42+k*.12))*34/(k+1);
        x?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=['#7ce9ff','#ffe19b','#ff9fd5','#b99cff','#aaf2c5'][k];
      ctx.globalAlpha=.65; ctx.lineWidth=1.5; ctx.stroke();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<120;i++){
      const a=i*2.399+tt*.18, r=8+i*2.15;
      const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.72;
      star(ctx,x,y,i%9===0?2.6:1.05,i%7===0?'#ffe19b':'rgba(255,255,255,.72)');
    }
    label(ctx,'sine · ratio · resonance · mandala',22,30);
  }
  function drawLab(canvas,type,params={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const t=performance.now()*.001;
    if(type==='harmonics') return drawHarmonics(ctx,w,h,t,params);
    if(type==='resonance') return drawResonance(ctx,w,h,t,params);
    if(type==='ratio') return drawRatio(ctx,w,h,t,params);
    if(type==='voice') return drawVoice(ctx,w,h,t,params);
    if(type==='beings') return drawBeings(ctx,w,h,t,params);
    if(type==='life') return drawLife(ctx,w,h,t,params);
    return drawSound(ctx,w,h,t,params);
  }
  function drawSound(ctx,w,h,t,p){
    const freq=+(p.freq||440), amp=+(p.amp||50)/100, phase=+(p.phase||0);
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=1;
    for(let y=h*.25;y<h*.8;y+=34){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-20,y);ctx.stroke();}
    const waves=[
      ['rgba(124,233,255,.9)',0],
      ['rgba(255,159,213,.62)',phase/180*Math.PI]
    ];
    waves.forEach(([col,ph])=>{
      ctx.beginPath();
      for(let x=22;x<=w-22;x+=2){
        const y=h*.48+Math.sin((x/w)*TAU*(freq/55)+t*2+ph)*amp*70;
        x>22?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
    });
    const period=(1/freq).toFixed(4);
    label(ctx,`frequency ${freq.toFixed(0)} Hz · period ${period}s`,28,30);
    label(ctx,`amplitude ${(amp*100).toFixed(0)}% · phase ${phase}°`,28,50);
    // pitch star
    const y=h*.82-(Math.log2(freq/110))*42;
    star(ctx,w*.78,Math.max(60,Math.min(h-60,y)),8,'#ffe19b');
  }
  function drawHarmonics(ctx,w,h,t,p){
    const base=+(p.freq||220); const hs=p.harmonics||[1,2,3,4];
    for(let k=0;k<hs.length;k++){
      const n=hs[k]; const a=(p['h'+n] ?? 1);
      ctx.beginPath();
      for(let x=24;x<=w-24;x+=2){
        const y=h*.34 + Math.sin((x/w)*TAU*n*3+t*(.7+n*.07))*38*a/n;
        x>24?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=['#7ce9ff','#ffe19b','#ff9fd5','#b99cff','#aaf2c5'][k%5]; ctx.globalAlpha=.82; ctx.lineWidth=1.6; ctx.stroke();
      const bh=(h*.35)*a/(k+1)**.3;
      ctx.fillStyle=ctx.strokeStyle; ctx.globalAlpha=.75;
      ctx.fillRect(40+k*(w-90)/hs.length,h-42-bh,(w-110)/hs.length,bh);
      label(ctx,`${n}f`,48+k*(w-90)/hs.length,h-20);
    }
    ctx.globalAlpha=1; label(ctx,`fundamental ${base}Hz · timbre = harmonic pattern`,24,30);
  }
  function drawResonance(ctx,w,h,t,p){
    const freq=+(p.freq||330), target=+(p.target||440), closeness=Math.max(0,1-Math.abs(freq-target)/240);
    const cx=w*.52, cy=h*.48;
    const glow=30+120*closeness;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,glow*2);
    g.addColorStop(0,`rgba(255,225,155,${.18+.35*closeness})`);
    g.addColorStop(.45,`rgba(124,233,255,${.12+.28*closeness})`);
    g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    for(let m=1;m<=5;m++){
      ctx.beginPath();
      for(let x=60;x<=w-60;x+=3){
        const y=cy+Math.sin((x-60)/(w-120)*Math.PI*m)*Math.sin(t*2)*30*closeness;
        x>60?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=m===Math.round(1+closeness*4)?'#ffe19b':'rgba(255,255,255,.28)';
      ctx.lineWidth=m===Math.round(1+closeness*4)?2.5:1.1; ctx.stroke();
    }
    star(ctx,cx,cy,9+8*closeness,'#ffe19b'); label(ctx,`input ${freq.toFixed(0)}Hz → preferred ${target.toFixed(0)}Hz`,24,30);
    label(ctx,`resonance ${(closeness*100).toFixed(0)}%`,24,52);
  }
  function drawRatio(ctx,w,h,t,p){
    const ratios=[[1,1,'1:1'],[2,1,'2:1 octave'],[3,2,'3:2 fifth'],[4,3,'4:3 fourth'],[5,4,'5:4 major third'],[6,5,'6:5 minor third']];
    const cx=w*.5, cy=h*.48, R=Math.min(w,h)*.31;
    for(let i=0;i<ratios.length;i++){
      const a=i/ratios.length*TAU-TauSafe()/4; const x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
      ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();
      star(ctx,x,y,7, i%2?'#7ce9ff':'#ffe19b'); label(ctx,ratios[i][2],x+10,y+4);
    }
    for(let i=0;i<6;i++){ const a=i/6*TAU+t*.1; const r=R*.45+Math.sin(t+i)*12; star(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.2,'rgba(255,255,255,.76)'); }
    label(ctx,'Pythagorean ratios: number becomes harmony',24,30);
  }
  function TauSafe(){return Math.PI*2}
  function drawVoice(ctx,w,h,t,p){
    const vowel=p.vowel||'a'; const data={a:[720,1200],i:[300,2400],u:[350,850],e:[500,1900],o:[450,900]}[vowel]||[720,1200];
    // body source-filter chain
    const y=h*.55;
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(60,y);ctx.bezierCurveTo(w*.25,y-80,w*.35,y+80,w*.48,y);ctx.bezierCurveTo(w*.62,y-80,w*.75,y+45,w-70,y);ctx.stroke();
    // vocal folds
    ctx.fillStyle='rgba(255,159,213,.45)'; ctx.beginPath(); ctx.ellipse(w*.22,y,28,65,0,0,TAU); ctx.fill(); ctx.beginPath();ctx.ellipse(w*.27,y,20,56,0,0,TAU);ctx.fill();
    label(ctx,'vocal folds: source',w*.16,y-80);
    // tract
    ctx.fillStyle='rgba(124,233,255,.15)'; ctx.strokeStyle='rgba(124,233,255,.8)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect?.(w*.42,y-55,w*.36,110,55); ctx.stroke();
    label(ctx,`vocal tract filter · vowel ${vowel}`,w*.43,y-72);
    // spectrum bars/formants
    const baseX=w*.12, baseY=h*.86, bw=(w*.76)/16;
    for(let i=0;i<16;i++){
      const f=200+i*180; const amp=Math.exp(-((f-data[0])**2)/(2*170**2))*.9+Math.exp(-((f-data[1])**2)/(2*230**2))*.75+0.1;
      ctx.fillStyle=i%2?'rgba(255,225,155,.72)':'rgba(124,233,255,.72)';
      ctx.fillRect(baseX+i*bw,baseY-amp*90,bw*.72,amp*90);
    }
    star(ctx,baseX+(data[0]-200)/180*bw,baseY-98,6,'#ffe19b'); star(ctx,baseX+(data[1]-200)/180*bw,baseY-86,6,'#ff9fd5');
    label(ctx,`F1 ${data[0]}Hz · F2 ${data[1]}Hz`,24,30);
  }
  function drawBeings(ctx,w,h,t,p){
    const a=+(p.a||52), b=+(p.b||68), c=+(p.c||42), open=+(p.open||60)/100;
    const cx1=w*.30, cx2=w*.68, cx3=w*.50, cy1=h*.48, cy2=h*.48, cy3=h*.30;
    const vals=[a,b,c];
    const avg=vals.reduce((s,x)=>s+x,0)/3;
    const spread=(Math.abs(a-b)+Math.abs(b-c)+Math.abs(c-a))/3;
    const resonance=Math.max(0,1-spread/78)*open;
    drawBeing(ctx,cx1,cy1,48,a,'#7ce9ff',t);
    drawBeing(ctx,cx2,cy2,48,b,'#ff9fd5',-t);
    drawBeing(ctx,cx3,cy3,42,c,'#ffe19b',t*.7);
    const pts=[[cx1,cy1],[cx2,cy2],[cx3,cy3]];
    ctx.globalAlpha=.16+.55*resonance; ctx.strokeStyle='#ffe19b'; ctx.lineWidth=1.4+resonance*3;
    for(let i=0;i<3;i++){
      const [x1,y1]=pts[i], [x2,y2]=pts[(i+1)%3];
      for(let k=0;k<5;k++){
        ctx.beginPath();
        ctx.moveTo(x1,y1-18+k*9);
        ctx.bezierCurveTo(w*.5, h*.58+Math.sin(t+k+i)*60, w*.5, h*.22+Math.cos(t+k+i)*42, x2, y2-18+k*9);
        ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
    star(ctx,w*.5,h*.58,6+resonance*8,'#fff1aa');
    label(ctx,`three-body resonance ${(resonance*100).toFixed(0)}% · shared center ${avg.toFixed(0)}`,24,30);
    label(ctx,`similarity is not sameness: boundary + openness → harmony`,24,52);
  }
  function drawBeings(ctx,w,h,t,p){
    const a=+(p.a||52), b=+(p.b||68), open=+(p.open||60)/100;
    const cx1=w*.36, cx2=w*.64, cy=h*.48;
    const diff=Math.abs(a-b); const resonance=Math.max(0,1-diff/70)*open;
    drawBeing(ctx,cx1,cy,58,a,'#7ce9ff',t); drawBeing(ctx,cx2,cy,58,b,'#ff9fd5',-t);
    ctx.globalAlpha=.18+.55*resonance; ctx.strokeStyle='#ffe19b'; ctx.lineWidth=2+resonance*4;
    for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(cx1+40,cy-40+i*10);ctx.bezierCurveTo(w*.48,cy-80*Math.sin(t+i),w*.52,cy+80*Math.cos(t+i),cx2-40,cy-40+i*10);ctx.stroke();}
    ctx.globalAlpha=1; label(ctx,`shared field ${(resonance*100).toFixed(0)}% · difference ${diff.toFixed(0)}`,24,30);
  }
  function drawBeing(ctx,cx,cy,R,f,color,t){
    for(let k=0;k<5;k++){ctx.beginPath(); for(let i=0;i<=180;i++){const a=i/180*TAU; const rr=R*(1+.11*Math.sin(a*(k+3)+t*(.7+k*.1)+f*.01)); const x=cx+Math.cos(a)*rr*(1-k*.04), y=cy+Math.sin(a)*rr*(1-k*.04); i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.strokeStyle=color; ctx.globalAlpha=.75-k*.1; ctx.lineWidth=1.2; ctx.stroke();} ctx.globalAlpha=1; star(ctx,cx,cy,6,color);
  }
  function drawLife(ctx,w,h,t,p){
    const bpm=+(p.bpm||70), dyn=+(p.dynamic||30), lyr=+(p.lyrics||10), pred=+(p.predict||80);
    const items=[['BPM',bpm,120],['dynamic',dyn,100],['lyrics',lyr,100],['predict',pred,100]];
    items.forEach((it,i)=>{const x=w*.18+i*w*.19, y=h*.72, val=it[1]/it[2]; ctx.fillStyle='rgba(255,255,255,.07)'; ctx.beginPath();ctx.arc(x,y,52,0,TAU);ctx.fill();ctx.strokeStyle=['#7ce9ff','#ff9fd5','#ffe19b','#aaf2c5'][i];ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y,52,-Math.PI/2,-Math.PI/2+TAU*val);ctx.stroke();label(ctx,it[0],x-24,y+4);});
    // arousal curve
    ctx.beginPath(); for(let x=24;x<=w-24;x+=3){const y=h*.36+Math.sin(x*.025+t*bpm/45)*((dyn/100)*50+10)+Math.cos(x*.007)*20*(1-pred/100); x>24?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.strokeStyle='rgba(124,233,255,.86)';ctx.lineWidth=2;ctx.stroke();
    label(ctx,'choose music by parameters, not by magic frequency',24,30);
  }
  function drawMandala(canvas, notes=[], step=0){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const cx=w*.5, cy=h*.5, R=Math.min(w,h)*.34;
    const active=notes.filter(n=>n>=0);
    const count=Math.max(8,active.length||8);
    for(let ring=0;ring<4;ring++){
      ctx.beginPath();
      for(let i=0;i<=count*20;i++){
        const a=i/(count*20)*TAU;
        const idx=Math.floor(i/20)%Math.max(1,active.length||1);
        const pitch=(active[idx]??4)+1;
        const rr=R*(.35+ring*.16)*(1+.15*Math.sin(a*pitch+ring));
        const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=['#7ce9ff','#ffe19b','#ff9fd5','#b99cff'][ring]; ctx.lineWidth=1.7; ctx.globalAlpha=.82; ctx.stroke();
    }
    ctx.globalAlpha=1;
    const total=Math.max(16,notes.length||16);
    for(let i=0;i<total;i++){
      const n=notes[i];
      const a=i/total*TAU-Math.PI/2; const r=R*(n>=0?0.88:0.55);
      star(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,n>=0?5:2,n>=0?'#ffe19b':'rgba(255,255,255,.35)');
      if(i===step) {ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,11,0,TAU);ctx.stroke();}
    }
  }
  function makeAudio(){
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return null;
    const ctx=new Ctx(); return ctx;
  }
  function playFreq(audio,freq=440,dur=.35,type='sine',gain=.045,when=0){
    if(!audio) return;
    const now=audio.currentTime+when;
    const o=audio.createOscillator(), g=audio.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,now);
    g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(gain,now+.025); g.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o.connect(g); g.connect(audio.destination); o.start(now); o.stop(now+dur+.03);
  }
  function playMelody(audio,notes,tempo=88,type='triangle'){
    if(!audio) return 0;
    if(audio.state==='suspended') audio.resume();
    const step=60/tempo/2;
    let last=0;
    notes.forEach((note,i)=>{ if(note) { playFreq(audio,noteToFreq(note),Math.min(.46,step*.9),type,.04,i*step); last=i; } });
    return step*1000;
  }

  function instrumentProfile(instrument){
    const map={
      softBell:{osc:'sine',gain:.045,partials:[[1,.9],[2,.35],[3,.12]],decay:.9},
      warmPiano:{osc:'triangle',gain:.05,partials:[[1,.9],[2,.22],[3,.08]],decay:.55},
      musicBox:{osc:'sine',gain:.042,partials:[[1,.9],[2,.55],[4,.18]],decay:.7},
      theremin:{osc:'sine',gain:.04,partials:[[1,1]],decay:.75},
      ambientPad:{osc:'sine',gain:.032,partials:[[1,.75],[2,.22],[3,.12],[5,.06]],decay:1.15},
      pluck:{osc:'triangle',gain:.048,partials:[[1,.9],[2,.32],[3,.2]],decay:.38},
      softChoir:{osc:'sine',gain:.03,partials:[[1,.7],[2,.18],[3,.08]],decay:1.2},
      breathFlute:{osc:'sine',gain:.035,partials:[[1,.75],[2,.28],[4,.06]],decay:.75},
      deepBowl:{osc:'sine',gain:.045,partials:[[.5,.55],[1,.8],[2,.16]],decay:1.6},
      warmStrings:{osc:'triangle',gain:.04,partials:[[1,.75],[2,.26],[3,.12],[5,.04]],decay:1.1},
      kalimba:{osc:'triangle',gain:.046,partials:[[1,.9],[2,.38],[5,.1]],decay:.45},
      celeste:{osc:'sine',gain:.043,partials:[[1,.8],[2,.55],[3,.18],[6,.08]],decay:.7}
    };
    return map[instrument]||map.warmPiano;
  }
  function playInstrument(audio,freq=440,dur=.35,instrument='warmPiano',gainMul=1,when=0){
    if(!audio) return;
    if(audio.state==='suspended') audio.resume();
    const prof=instrumentProfile(instrument);
    const now=audio.currentTime+when;
    const master=audio.createGain();
    master.gain.setValueAtTime(.0001,now);
    master.gain.exponentialRampToValueAtTime(Math.max(.0001,prof.gain*gainMul),now+.025);
    master.gain.exponentialRampToValueAtTime(.0001,now+Math.max(.08,dur*prof.decay));
    master.connect(audio.destination);
    (prof.partials||[[1,1]]).forEach(([mul,amp])=>{
      const o=audio.createOscillator();
      o.type=prof.osc;
      o.frequency.setValueAtTime(freq*mul,now);
      if(instrument==='theremin'){
        o.frequency.linearRampToValueAtTime(freq*mul*1.012,now+dur*.45);
        o.frequency.linearRampToValueAtTime(freq*mul*.998,now+dur);
      }
      const g=audio.createGain();
      g.gain.setValueAtTime(amp,now);
      o.connect(g); g.connect(master); o.start(now); o.stop(now+Math.max(.1,dur*prof.decay)+.05);
    });
  }
  function playMelodyInstrument(audio,notes,tempo=88,instrument='warmPiano'){
    if(!audio) return 0;
    if(audio.state==='suspended') audio.resume();
    const step=60/tempo/2;
    notes.forEach((note,i)=>{ if(note) playInstrument(audio,noteToFreq(note),Math.min(.62,step*.92),instrument,.9,i*step); });
    return step*1000;
  }
  function synthSample(freq,t,instrument){
    const p=instrumentProfile(instrument);
    let y=0;
    (p.partials||[[1,1]]).forEach(([mul,amp])=>{ y+=Math.sin(TAU*freq*mul*t)*amp; });
    const env=Math.min(1,t/.03)*Math.exp(-Math.max(0,t-.04)/(p.decay*.35));
    return Math.max(-1,Math.min(1,y*env*.22));
  }
  function renderWavBuffer(notes,tempo=88,instrument='warmPiano'){
    const sr=44100, step=60/tempo/2, dur=notes.length*step+1.2;
    const samples=new Float32Array(Math.ceil(sr*dur));
    notes.forEach((note,i)=>{
      if(!note) return;
      const freq=noteToFreq(note), start=Math.floor(i*step*sr), len=Math.floor(Math.min(.9,step*.92)*sr);
      for(let j=0;j<len && start+j<samples.length;j++){
        samples[start+j]+=synthSample(freq,j/sr,instrument);
      }
    });
    return {samples,sr};
  }
  function wavBlob(notes,tempo=88,instrument='warmPiano'){
    const {samples,sr}=renderWavBuffer(notes,tempo,instrument);
    const buffer=new ArrayBuffer(44+samples.length*2);
    const view=new DataView(buffer);
    function wstr(o,s){for(let i=0;i<s.length;i++) view.setUint8(o+i,s.charCodeAt(i));}
    wstr(0,'RIFF'); view.setUint32(4,36+samples.length*2,true); wstr(8,'WAVE'); wstr(12,'fmt ');
    view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,sr,true); view.setUint32(28,sr*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    wstr(36,'data'); view.setUint32(40,samples.length*2,true);
    let off=44; for(let i=0;i<samples.length;i++,off+=2){ const s=Math.max(-1,Math.min(1,samples[i])); view.setInt16(off,s<0?s*0x8000:s*0x7fff,true); }
    return new Blob([view],{type:'audio/wav'});
  }


  function drawSongStructure(canvas, template={}, step=0){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const parts=(template.structure||['Intro','Motif','Repeat','Turn','Return']);
    const pad=34, y=h*.58, total=parts.length, gap=(w-pad*2)/Math.max(1,total);
    ctx.save();
    ctx.lineWidth=2;
    parts.forEach((name,i)=>{
      const x=pad+gap*(i+.5);
      const amp=[.25,.5,.45,.7,.9,.55,.35][i%7];
      const r=18+amp*34;
      const color=['#7ce9ff','#ffe19b','#ff9fd5','#b99cff','#aaf2c5','#fff1aa'][i%6];
      ctx.globalAlpha=.18; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y-r*.45,r*1.8,0,TAU); ctx.fill();
      ctx.globalAlpha=.88; star(ctx,x,y-r*.45,7+i%3,color);
      ctx.beginPath();
      for(let k=0;k<=36;k++){
        const a=k/36*TAU;
        const rr=r*(1+.11*Math.sin(a*(i+3)+performance.now()*.001));
        const px=x+Math.cos(a)*rr, py=y-r*.45+Math.sin(a)*rr*.65;
        k?ctx.lineTo(px,py):ctx.moveTo(px,py);
      }
      ctx.strokeStyle=color; ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.88)'; ctx.font='12px system-ui, sans-serif'; ctx.textAlign='center';
      ctx.fillText(name,x,y+58);
      if(i<total-1){ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(x+28,y); ctx.lineTo(x+gap-28,y); ctx.stroke();}
    });
    ctx.globalAlpha=1;
    label(ctx,'song form: space → seed → repeat → change → return',22,28);
    ctx.restore();
  }
  function drawMiniLesson(canvas,type='frequency',p={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const t=performance.now()*.001;
    if(type.includes('breath')||type==='voice-breath'){
      ctx.beginPath();
      for(let x=30;x<w-30;x+=3){
        const y=h*.52+Math.sin((x/w)*TAU*2+t)*36;
        x>30?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle='#aaf2c5'; ctx.lineWidth=4; ctx.stroke();
      label(ctx,'breath = stable gentle airflow',24,28);
      label(ctx,'not more air, but smoother support',24,50);
      return;
    }
    if(type.includes('fold')||type==='voice-folds'){
      const cx=w*.5, cy=h*.52, gap=22+Math.sin(t*8)*8;
      ctx.fillStyle='rgba(255,159,213,.42)';
      ctx.beginPath();ctx.ellipse(cx-gap,cy,28,100,0,0,TAU);ctx.fill();
      ctx.beginPath();ctx.ellipse(cx+gap,cy,28,100,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#ffe19b'; ctx.lineWidth=2;
      for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx-gap+8,cy+i*18);ctx.quadraticCurveTo(cx,cy+i*16+Math.sin(t*10+i)*10,cx+gap-8,cy+i*18);ctx.stroke();}
      label(ctx,'vocal fold gate: breathy ⇄ balanced ⇄ pressed',24,28);
      return;
    }
    if(type.includes('sovt')){
      const cx=w*.46, cy=h*.52;
      ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=16; ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(w*.18,cy);ctx.bezierCurveTo(w*.35,cy-80,w*.55,cy+70,w*.72,cy);ctx.stroke();
      ctx.strokeStyle='#7ce9ff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(w*.72,cy);ctx.lineTo(w*.9,cy);ctx.stroke();
      for(let i=0;i<8;i++){star(ctx,w*.58+i*20,cy+Math.sin(t*3+i)*18,2+i*.2,'#ffe19b');}
      label(ctx,'SOVT: narrow outlet → back pressure → easier vibration',24,28);
      return;
    }
    if(type.includes('formant')||type.includes('vowel')||type==='voice-formant'||type==='voice-tract'){
      drawVoice(ctx,w,h,t,{vowel:p.vowel||'a'}); return;
    }
    if(type.includes('scale')||type==='voice-scale'){
      const notes=['1','2','3','4','5','6','7','1′']; notes.forEach((n,i)=>{
        const x=w*.12+i*w*.1, y=h*.75-i*22; star(ctx,x,y,8,i===0||i===7?'#ffe19b':'#7ce9ff'); label(ctx,n,x-5,y-16);
      });
      ctx.strokeStyle='rgba(255,255,255,.28)';ctx.beginPath();notes.forEach((n,i)=>{const x=w*.12+i*w*.1,y=h*.75-i*22;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
      label(ctx,'scale = safe pitch path · return to tonic',24,28); return;
    }
    if(type.includes('choir')){
      const cx=w*.5, cy=h*.5, R=96; const pts=[[-Math.PI/2,'1','#ffe19b'],[Math.PI/6,'3','#ff9fd5'],[Math.PI*5/6,'5','#7ce9ff']];
      ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.beginPath();
      pts.forEach((pt,i)=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}); ctx.closePath();ctx.stroke();
      pts.forEach(pt=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R;star(ctx,x,y,12,pt[2]);label(ctx,pt[1],x-4,y+4)});
      label(ctx,'choir: root + third + fifth = stable triangle',24,28); return;
    }
    if(type==='beating'){
      drawSound(ctx,w,h,t,{freq:220,amp:60,phase:0}); label(ctx,'beating: close frequencies pulse in loudness',24,72); return;
    }
    if(type==='noise'){
      for(let i=0;i<80;i++){const x=20+i*(w-40)/80; const y=h*.62-Math.random()*120*(1-i/90); ctx.fillStyle=i%2?'#7ce9ff':'#ffe19b';ctx.fillRect(x,y,4,h*.62-y);}
      label(ctx,'noise color = different spectrum slopes',24,28); return;
    }
    if(type==='tempo'||type==='rhythmDensity'){
      for(let i=0;i<16;i++){const x=40+i*(w-80)/15; const on=type==='tempo'?i%2===0:i%3!==1; star(ctx,x,h*.55,on?9:3,on?'#ffe19b':'rgba(255,255,255,.35)');}
      label(ctx,type==='tempo'?'BPM: how fast the body clock moves':'rhythm density: how much information per time',24,28); return;
    }
    if(type==='scaleColor'||type==='chordTension'){
      drawRatio(ctx,w,h,t,p); label(ctx,type==='scaleColor'?'scale color = pitch environment':'chord tension → resolution',24,56); return;
    }
    drawLab(canvas,'sound',p);
  }


  function drawArrow(ctx,x1,y1,x2,y2,color='rgba(255,225,155,.75)'){
    ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1), s=8;
    ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-Math.cos(a-.45)*s,y2-Math.sin(a-.45)*s); ctx.lineTo(x2-Math.cos(a+.45)*s,y2-Math.sin(a+.45)*s); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function captionBox(ctx,txt,x,y,w=210){
    ctx.save(); ctx.fillStyle='rgba(7,5,29,.66)'; ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect?.(x,y,w,46,12); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(255,250,242,.9)'; ctx.font='12px system-ui, sans-serif';
    const words=String(txt).split(' '); let line='', yy=y+18;
    words.forEach(word=>{ const test=line?line+' '+word:word; if(ctx.measureText(test).width>w-18){ctx.fillText(line,x+9,yy); line=word; yy+=15;} else line=test;});
    ctx.fillText(line,x+9,yy); ctx.restore();
  }
  function drawTeachingLab(canvas,type='sound',p={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const t=performance.now()*.001;
    if(['sound','amplitude','phase'].includes(type)){
      const freq=+(p.freq||260), amp=type==='amplitude'?0.82:(+(p.amp||52)/100), phase=type==='phase'?Math.PI:0;
      ctx.strokeStyle='rgba(255,255,255,.12)'; for(let y=70;y<h-70;y+=38){ctx.beginPath();ctx.moveTo(36,y);ctx.lineTo(w-36,y);ctx.stroke();}
      ctx.beginPath();
      for(let x=42;x<w-42;x+=2){const y=h*.46+Math.sin(x/w*TAU*(freq/55)+t*2)*amp*70; x>42?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      ctx.strokeStyle='#7ce9ff';ctx.lineWidth=3;ctx.stroke();
      if(type==='phase'){
        ctx.beginPath(); for(let x=42;x<w-42;x+=2){const y=h*.46+Math.sin(x/w*TAU*(freq/55)+t*2+phase)*amp*70; x>42?ctx.lineTo(x,y):ctx.moveTo(x,y)}
        ctx.strokeStyle='#ff9fd5';ctx.lineWidth=2;ctx.stroke(); captionBox(ctx,'opposite phase cancels energy',w*.58,42,230);
      } else {
        captionBox(ctx,type==='amplitude'?'amplitude ↑ → usually louder':'frequency ↑ → wave denser → pitch rises',w*.56,42,250);
      }
      drawArrow(ctx,w*.50,h*.25,w*.62,h*.30); label(ctx,type==='amplitude'?'vibration size changes loudness':'cycles per second shape pitch',26,30); return;
    }
    if(type==='harmonics'||type==='spectrum'){
      drawHarmonics(ctx,w,h,t,p);
      captionBox(ctx,'timbre is a pattern of harmonic energy, not one single tone',w*.52,42,280);
      captionBox(ctx,'spectrum translates sound into frequency bars',w*.08,h*.70,250); return;
    }
    if(type==='resonance'){
      drawResonance(ctx,w,h,t,p);
      captionBox(ctx,'when input frequency matches the system, response grows',w*.52,42,290);
      drawArrow(ctx,w*.48,h*.35,w*.52,h*.48); return;
    }
    if(type==='beating'){
      const f1=220,f2=226;
      ctx.beginPath(); for(let x=40;x<w-40;x+=2){const y=h*.48+(Math.sin(x*.055+t*4)+Math.sin(x*.055*(f2/f1)+t*4.12))*34; x>40?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      ctx.strokeStyle='#ffe19b';ctx.lineWidth=2.5;ctx.stroke(); captionBox(ctx,'two close frequencies make pulsing tension: beat rate = |f1-f2|',w*.48,44,310); label(ctx,'beating = tension / shimmer / unease',24,30); return;
    }
    if(type==='noise'){
      for(let i=0;i<90;i++){const x=30+i*(w-60)/90; const v=(type==='noise'?(1-i/120):1)*Math.random(); ctx.fillStyle=i%3?'#7ce9ff':'#ffe19b';ctx.fillRect(x,h*.74-v*150,5,v*150)}
      captionBox(ctx,'noise color changes spectrum: white / pink / brown feel different',w*.45,44,300); label(ctx,'for care: reduce harshness and unpredictability',24,30); return;
    }
    if(type==='tempo'||type==='rhythmDensity'){
      const dense=type==='rhythmDensity';
      for(let i=0;i<24;i++){const on=dense?i%3!==1:i%4===0; const x=40+i*(w-80)/23; const y=h*.52+(on?Math.sin(t*3+i)*12:0); star(ctx,x,y,on?9:3,on?'#ffe19b':'rgba(255,255,255,.35)'); if(i%4===0) label(ctx,'beat',x-10,y+35);}
      captionBox(ctx,dense?'more events per time → more information load':'BPM sets the body clock and arousal',w*.48,42,280); return;
    }
    if(type==='scaleColor'){
      drawRatio(ctx,w,h,t,p); captionBox(ctx,'scale = the pitch environment; it shapes safe choices',w*.52,42,280); return;
    }
    if(type==='chordTension'){
      const cx=w*.5, cy=h*.52, R=105, pts=[[-Math.PI/2,'1','#ffe19b'],[Math.PI/6,'3','#ff9fd5'],[Math.PI*5/6,'5','#7ce9ff']];
      ctx.strokeStyle='rgba(255,255,255,.22)';ctx.beginPath();pts.forEach((pt,i)=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke();
      pts.forEach(pt=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R;star(ctx,x,y,12,pt[2]);label(ctx,pt[1],x-4,y+4)});
      captionBox(ctx,'1-3-5 forms a triad: stability, color, direction',w*.50,42,290); label(ctx,'harmony = tension → resolution',24,30); return;
    }
    drawMiniLesson(canvas,type,p);
  }


  function drawTeachingLabV14(canvas,type='sound',p={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const t=performance.now()*.001;
    const top=36;
    function drawTimeGrid(strongEvery=4,dense=false){
      const y=h*.55, left=48, right=w-48, steps=24;
      ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(right,y); ctx.stroke();
      for(let i=0;i<steps;i++){
        const x=left+i*(right-left)/(steps-1), strong=i%strongEvery===0;
        ctx.strokeStyle=strong?'rgba(255,225,155,.55)':'rgba(255,255,255,.18)';
        ctx.beginPath(); ctx.moveTo(x,y-42); ctx.lineTo(x,y+42); ctx.stroke();
        const on=dense ? i%3!==1 : strong || i%8===2;
        if(on) star(ctx,x,y+(strong?-18:14),strong?9:5,strong?'#ffe19b':'#7ce9ff');
        if(strong) label(ctx,'强/beat',x-18,y+66);
      }
      captionBox(ctx,'rhythm = sound + silence organized in time',w*.52,top,310);
      captionBox(ctx,'accent tells the body where weight falls',44,top,270);
    }
    if(type==='meter'){ drawTimeGrid(4,false); return; }
    if(type==='polyrhythm'){
      const left=56,right=w-56,y1=h*.43,y2=h*.62;
      ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.beginPath();ctx.moveTo(left,y1);ctx.lineTo(right,y1);ctx.moveTo(left,y2);ctx.lineTo(right,y2);ctx.stroke();
      for(let i=0;i<4;i++){const x=left+i*(right-left)/3; star(ctx,x,y1,9,'#ffe19b'); label(ctx,'4',x-4,y1-22)}
      for(let i=0;i<3;i++){const x=left+i*(right-left)/2; star(ctx,x,y2,9,'#7ce9ff'); label(ctx,'3',x-4,y2+34)}
      captionBox(ctx,'polyrhythm = different cycles share one time field',w*.48,top,330); return;
    }
    if(type==='motif'){
      const pts=[[80,h*.62],[140,h*.50],[200,h*.56],[260,h*.42]];
      for(let rep=0;rep<3;rep++){
        ctx.beginPath(); pts.forEach(([x,y],i)=>{const xx=x+rep*260, yy=y+(rep===2?(i%2? -26:16):0); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); star(ctx,xx,yy,6,rep===2?'#ff9fd5':'#ffe19b')});
        ctx.strokeStyle=rep===2?'#ff9fd5':'#ffe19b'; ctx.lineWidth=2; ctx.stroke();
        label(ctx,rep===0?'motif':rep===1?'repeat':'variation',92+rep*260,h*.75);
      }
      captionBox(ctx,'motive = small memorable seed → repeat → vary',w*.52,top,300); return;
    }
    // teach waveform cases with labels
    if(['sound','amplitude','phase'].includes(type)){
      const freq=+(p.freq||260), amp=type==='amplitude'?0.86:(+(p.amp||52)/100), ph=type==='phase'?Math.PI:0;
      ctx.strokeStyle='rgba(255,255,255,.12)'; for(let y=80;y<h-65;y+=40){ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(w-40,y);ctx.stroke();}
      ctx.beginPath(); for(let x=44;x<w-44;x+=2){const y=h*.48+Math.sin(x/w*TAU*(freq/55)+t*2)*amp*70; x>44?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      ctx.strokeStyle='#7ce9ff';ctx.lineWidth=3;ctx.stroke();
      if(type==='phase'){ctx.beginPath(); for(let x=44;x<w-44;x+=2){const y=h*.48+Math.sin(x/w*TAU*(freq/55)+t*2+ph)*amp*70; x>44?ctx.lineTo(x,y):ctx.moveTo(x,y)} ctx.strokeStyle='#ff9fd5';ctx.lineWidth=2;ctx.stroke(); captionBox(ctx,'opposite phase → cancellation / quieter result',w*.52,top,310)}
      else captionBox(ctx,type==='amplitude'?'amplitude changes wave height → usually loudness':'frequency changes cycles per second → pitch',w*.52,top,300);
      drawArrow(ctx,w*.43,h*.25,w*.56,h*.31); label(ctx,type==='amplitude'?'do not force loudness with throat':'pitch path connects to melody',28,32); return;
    }
    if(type==='harmonics'||type==='spectrum'){
      drawHarmonics(ctx,w,h,t,p); captionBox(ctx,'same pitch, different harmonic pattern → different instrument color',w*.50,top,330); return;
    }
    if(type==='resonance'){
      drawResonance(ctx,w,h,t,p); captionBox(ctx,'resonance grows when input matches a preferred frequency',w*.50,top,330); return;
    }
    if(type==='beating'){
      ctx.beginPath(); for(let x=40;x<w-40;x+=2){const y=h*.5+(Math.sin(x*.055+t*4)+Math.sin(x*.058+t*4.14))*36; x>40?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      ctx.strokeStyle='#ffe19b';ctx.lineWidth=2.5;ctx.stroke(); captionBox(ctx,'close but not stable frequencies create pulsing tension',w*.52,top,310); return;
    }
    if(type==='tempo'||type==='rhythmDensity'){ drawTimeGrid(4,type==='rhythmDensity'); return; }
    if(type==='scaleColor'){
      const notes=['1','2','3','4','5','6','7','1′']; notes.forEach((n,i)=>{const x=w*.12+i*w*.1,y=h*.72-i*20; star(ctx,x,y,8,i===0||i===7?'#ffe19b':'#7ce9ff'); label(ctx,n,x-4,y-16)});
      captionBox(ctx,'scale is a pitch environment: it limits choices and creates color',w*.48,top,340); return;
    }
    if(type==='chordTension'){
      drawIntervalTriangle(ctx,w,h,'1','3','5'); captionBox(ctx,'triad = root + third + fifth: stability + color + direction',w*.45,top,350); return;
    }
    if(type==='noise'){
      for(let i=0;i<90;i++){const x=34+i*(w-68)/90; const v=Math.random()*(1-i/130); ctx.fillStyle=i%3?'#7ce9ff':'#ffe19b';ctx.fillRect(x,h*.72-v*160,5,v*160)}
      captionBox(ctx,'noise color = spectral slope; choose softer noise to reduce interference',w*.45,top,350); return;
    }
    drawMiniLesson(canvas,type,p);
  }
  function drawIntervalTriangle(ctx,w,h,a='1',b='3',c='5'){
    const cx=w*.45, cy=h*.55, R=100, pts=[[-Math.PI/2,a,'#ffe19b'],[Math.PI/6,b,'#ff9fd5'],[Math.PI*5/6,c,'#7ce9ff']];
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2; ctx.beginPath(); pts.forEach((pt,i)=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R; i?ctx.lineTo(x,y):ctx.moveTo(x,y)}); ctx.closePath();ctx.stroke();
    pts.forEach(pt=>{const x=cx+Math.cos(pt[0])*R,y=cy+Math.sin(pt[0])*R; star(ctx,x,y,12,pt[2]); label(ctx,pt[1],x-4,y+4)});
  }
  function drawVoiceTeaching(canvas,lesson='breath',p={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const t=performance.now()*.001, mode=p.voiceMode||'balanced';
    const air=+(p.air||55)/100, closure=+(p.closure||55)/100, mouth=+(p.mouthOpen||55)/100, tongue=+(p.tongue||45)/100, lip=+(p.lipRound||35)/100;
    if(lesson==='posture'){
      const cx=w*.38, floor=h*.78; ctx.strokeStyle='#ffe19b'; ctx.lineWidth=7; ctx.lineCap='round';
      const tilt=mode==='collapsed'?18:mode==='tense'?-14:0; const neckY=floor-210;
      ctx.beginPath();ctx.arc(cx+tilt*.5,neckY-52,28,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,neckY-20);ctx.lineTo(cx+tilt,floor-70);ctx.lineTo(cx-55,floor);ctx.moveTo(cx+tilt,floor-70);ctx.lineTo(cx+55,floor);ctx.moveTo(cx+tilt*.5,neckY+30);ctx.lineTo(cx-70,neckY+90);ctx.moveTo(cx+tilt*.5,neckY+30);ctx.lineTo(cx+70,neckY+90);ctx.stroke();
      captionBox(ctx,mode==='collapsed'?'collapsed body narrows breath and tract':mode==='tense'?'over-straight body adds pressure':'balanced posture opens airflow without forcing',w*.55,70,310); return;
    }
    if(lesson==='breath'){
      const cx=w*.43, cy=h*.52; ctx.strokeStyle='#aaf2c5';ctx.lineWidth=3;
      for(let r=0;r<5;r++){ctx.beginPath();ctx.ellipse(cx,cy,75+r*12+air*22,105+r*6,0,Math.PI*.1,Math.PI*.9);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,75+r*12+air*22,105+r*6,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
      ctx.beginPath();for(let x=w*.58;x<w*.9;x+=3){const y=cy+Math.sin(x*.045+t*2)*12*air; x>w*.58?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle='#7ce9ff';ctx.lineWidth=4;ctx.stroke();
      captionBox(ctx,air<.35?'too little airflow: tone may fade':air>.78?'too much air: pushed and unstable':'stable airflow: gentle support',w*.56,64,320); return;
    }
    if(lesson==='folds'||lesson==='onset'){
      const cx=w*.43, cy=h*.52; const gap=52*(1-closure)+8; ctx.fillStyle='rgba(255,159,213,.42)';
      ctx.beginPath();ctx.ellipse(cx-gap/2,cy,30,105,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(cx+gap/2,cy,30,105,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#7ce9ff';ctx.lineWidth=2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(w*.16,cy+i*18);ctx.bezierCurveTo(w*.28,cy+i*8,w*.36,cy+i*10,cx-gap/2,cy+i*8);ctx.stroke();}
      const msg=closure<.35?'breathy: too open → air leaks':closure>.78?'pressed: too closed → throat effort':'balanced: clear and sustainable'; captionBox(ctx,msg,w*.56,64,310); return;
    }
    if(lesson==='sovt'){
      const outlet=+(p.outlet||35)/100; const cx=w*.40, cy=h*.52; ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w*.18,cy);ctx.bezierCurveTo(w*.35,cy-85,w*.55,cy+75,w*.72,cy);ctx.stroke();
      ctx.strokeStyle='#7ce9ff';ctx.lineWidth=4+outlet*16;ctx.beginPath();ctx.moveTo(w*.72,cy);ctx.lineTo(w*.92,cy);ctx.stroke();
      for(let i=0;i<9;i++) star(ctx,w*.56+i*22,cy+Math.sin(t*3+i)*18,2.5,'#ffe19b'); captionBox(ctx,'narrow outlet creates back pressure; it is not pushing or holding breath',w*.48,64,350); return;
    }
    if(['tract','vowel','resonanceChoice','diction'].includes(lesson)){
      const cx=w*.45, cy=h*.48; ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.15,cy);ctx.lineTo(w*.32,cy);ctx.stroke(); label(ctx,'source',w*.16,cy-18);
      ctx.fillStyle='rgba(124,233,255,.14)';ctx.strokeStyle='#7ce9ff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect?.(w*.35,cy-70,w*.27,140,48+mouth*18);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,159,213,.55)';ctx.beginPath();ctx.ellipse(w*.48,cy+38-tongue*70,55,16,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#ffe19b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(w*.68,cy,18+lip*30,32-lip*10,0,0,TAU);ctx.stroke();
      const F1=Math.round(250+mouth*650), F2=Math.round(800+(1-tongue)*1500-lip*450); captionBox(ctx,`mouth/tongue/lips change filter: F1≈${F1}Hz F2≈${F2}Hz`,w*.55,52,360); return;
    }
    if(lesson==='scale'){
      const notes=['1','2','3','4','5','6','7','1′']; notes.forEach((n,i)=>{const x=w*.12+i*w*.1,y=h*.72-i*20; star(ctx,x,y,8,i===0||i===7?'#ffe19b':'#7ce9ff'); label(ctx,n,x-4,y-17)}); captionBox(ctx,'scale is a safe path; learn to return home before chasing high notes',w*.45,64,350); return;
    }
    if(lesson==='phrase'){
      const y=h*.55; for(let i=0;i<8;i++){const x=80+i*(w-160)/7; star(ctx,x,y+Math.sin(i*.9)*28,7,i===4?'#aaf2c5':'#ffe19b'); if(i===4){label(ctx,'breath',x-18,y+55);}}
      captionBox(ctx,'breath belongs at phrase boundaries, like punctuation',w*.48,64,330); return;
    }
    if(lesson==='choir'){
      drawIntervalTriangle(ctx,w,h,'1','3','5'); captionBox(ctx,'choir = separate voices tuning into one harmonic field',w*.52,64,330); return;
    }
    if(lesson==='dynamics'||lesson==='emotion'){
      const y=h*.62; ctx.strokeStyle='#ffe19b';ctx.lineWidth=4;ctx.beginPath();for(let x=60;x<w-60;x+=4){const u=(x-60)/(w-120);const yy=y-Math.sin(u*Math.PI)*130*(lesson==='dynamics'?1:.65)-Math.sin(u*Math.PI*4)*18; x>60?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke();
      captionBox(ctx,lesson==='dynamics'?'crescendo/decrescendo changes emotional weight, not only volume':'same notes can express comfort, joy, courage or goodbye',w*.48,64,350); return;
    }
    drawMiniLesson(canvas,lesson,p);
  }
  function drawResonanceTeaching(canvas,p={}){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h); const t=performance.now()*.001; const mode=p.ratioMode||'triad';
    const cx=w*.42,cy=h*.52,R=125; const ratios={unison:['1:1','same / fusion',[1]],octave:['2:1','octave / same name',[1,2]],fifth:['3:2','fifth / stable bridge',[1,1.5]],third:['5:4','major third / bright color',[1,1.25]],minor:['6:5','minor third / tender color',[1,1.2]],triad:['1-3-5','triad / harmony',[1,1.25,1.5]],beating:['close','beating / tension',[1,1.04]]};
    const r=ratios[mode]||ratios.triad; const vals=r[2];
    vals.forEach((v,i)=>{const a=-Math.PI/2+i*TAU/Math.max(3,vals.length); const x=cx+Math.cos(a)*R*(i?1:.1), y=cy+Math.sin(a)*R*(i?1:.1); star(ctx,x,y,14,['#ffe19b','#7ce9ff','#ff9fd5'][i%3]); label(ctx,i===0?'root':String(v),x-14,y+28); if(i>0){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();}});
    captionBox(ctx,`${r[0]} → ${r[1]}`,w*.56,64,330); captionBox(ctx,'harmony is not sameness: ratio + boundary + listening',w*.56,126,330);
  }


  function wavBlobArrangement(events,tempo=88){
    const sr=44100, step=60/tempo/2;
    const dur=(events.reduce((m,e)=>Math.max(m,e.step||0),0)+4)*step+1.2;
    const samples=new Float32Array(Math.ceil(sr*dur));
    events.forEach(e=>{
      const start=Math.floor((e.step||0)*step*sr), len=Math.floor((e.dur||step*.9)*sr), freq=e.freq||440;
      for(let j=0;j<len && start+j<samples.length;j++) samples[start+j]+=synthSample(freq,j/sr,e.instrument||'warmPiano')*(e.gain||1);
    });
    const buffer=new ArrayBuffer(44+samples.length*2), view=new DataView(buffer);
    function wstr(o,str){for(let i=0;i<str.length;i++)view.setUint8(o+i,str.charCodeAt(i));}
    wstr(0,'RIFF'); view.setUint32(4,36+samples.length*2,true); wstr(8,'WAVE'); wstr(12,'fmt ');
    view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,sr,true); view.setUint32(28,sr*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true); wstr(36,'data'); view.setUint32(40,samples.length*2,true);
    let off=44; for(let i=0;i<samples.length;i++,off+=2){const sm=Math.max(-1,Math.min(1,samples[i])); view.setInt16(off,sm<0?sm*0x8000:sm*0x7fff,true);}
    return new Blob([view],{type:'audio/wav'});
  }


  function drawVoiceFlow(canvas, steps=[], active='breath'){
    const {ctx,w,h}=setup(canvas); clear(ctx,w,h);
    const labels=(steps&&steps.length?steps:[
      {id:'feeling',zh:'感受',en:'Feeling'}, {id:'body',zh:'身体',en:'Body'}, {id:'breath',zh:'呼吸',en:'Breath'},
      {id:'source',zh:'声带',en:'Source'}, {id:'filter',zh:'声道',en:'Filter'}, {id:'words',zh:'咬字',en:'Words'},
      {id:'shape',zh:'强弱',en:'Shape'}, {id:'song',zh:'歌声',en:'Song'}
    ]);
    const t=performance.now()*.001, pad=42, y=h*.52, gap=(w-pad*2)/Math.max(1,labels.length-1);
    ctx.save(); ctx.lineWidth=2;
    ctx.strokeStyle='rgba(255,255,255,.17)'; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke();
    labels.forEach((s,i)=>{
      const x=pad+i*gap; const on=s.id===active || (active==='posture'&&s.id==='body') || (active==='folds'&&s.id==='source') || (active==='sovt'&&s.id==='source') || (active==='vowel'&&s.id==='filter') || (active==='diction'&&s.id==='words') || (active==='dynamics'&&s.id==='shape') || (active==='emotion'&&s.id==='song');
      const color=on?'#ffe19b':['#7ce9ff','#aaf2c5','#ff9fd5','#b99cff'][i%4];
      ctx.globalAlpha=on?1:.65;
      star(ctx,x,y, on?12:7, color);
      ctx.strokeStyle=color; ctx.globalAlpha=on?.8:.18; ctx.beginPath(); ctx.arc(x,y,24+Math.sin(t*2+i)*4,0,TAU); ctx.stroke();
      ctx.globalAlpha=1; ctx.fillStyle='rgba(255,250,242,.9)'; ctx.font=(on?'bold ':'')+'12px system-ui, sans-serif'; ctx.textAlign='center';
      const label=s.zh||s.en||s.id; ctx.fillText(label,x,y+42);
      if(i<labels.length-1){
        const x2=pad+(i+1)*gap; ctx.strokeStyle='rgba(255,225,155,.28)'; ctx.beginPath(); ctx.moveTo(x+16,y); ctx.lineTo(x2-16,y); ctx.stroke();
        const a=0, arrowX=x2-18; ctx.fillStyle='rgba(255,225,155,.55)'; ctx.beginPath(); ctx.moveTo(arrowX,y); ctx.lineTo(arrowX-7,y-4); ctx.lineTo(arrowX-7,y+4); ctx.closePath(); ctx.fill();
      }
    });
    ctx.globalAlpha=1; label(ctx,'feeling → body → breath → source → filter → words → expression',24,30);
    ctx.restore();
  }

  window.ML_ANIM = {setup,drawCosmos,drawGate,drawLab,drawMandala,drawSongStructure,drawMiniLesson,drawTeachingLab:drawTeachingLabV14,drawVoiceTeaching,drawResonanceTeaching,drawVoiceFlow,noteToFreq,makeAudio,playFreq,playMelody,playInstrument,playMelodyInstrument,wavBlob,wavBlobArrangement};
})();
