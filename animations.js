
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
  function drawCosmos(canvas, reduced=false){
    const {ctx,w,h}=setup(canvas);
    const stars=Array.from({length:180},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.25,s:Math.random()*0.8+.3,a:Math.random()*TAU}));
    let raf=0;
    function frame(t){
      clear(ctx,w,h);
      const tt=t*.001;
      for(const st of stars){
        const pulse = reduced ? .62 : (.32+.68*Math.sin(tt*st.s+st.a)**2);
        ctx.globalAlpha=pulse; star(ctx,st.x*w,st.y*h,st.r,'#fff');
      }
      ctx.globalAlpha=1;
      // large quiet function curves
      for(let k=0;k<4;k++){
        ctx.beginPath();
        for(let x=0;x<=w;x+=3){
          const y=h*(.35+k*.12)+Math.sin(x*.009*(k+1)+tt*(.25+k*.08))*22/(k+1)+Math.cos(x*.004+tt)*14;
          x?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.strokeStyle=['rgba(124,233,255,.28)','rgba(255,225,155,.18)','rgba(255,159,213,.16)','rgba(185,156,255,.22)'][k];
        ctx.lineWidth=1.2; ctx.stroke();
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
    for(let i=0;i<16;i++){
      const n=notes[i];
      const a=i/16*TAU-Math.PI/2; const r=R*(n>=0?0.88:0.55);
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
  window.ML_ANIM = {setup,drawCosmos,drawGate,drawLab,drawMandala,noteToFreq,makeAudio,playFreq,playMelody};
})();
