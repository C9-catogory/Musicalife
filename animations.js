(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const setup = (c) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    const w = Math.max(10, rect.width || c.clientWidth || innerWidth);
    const h = Math.max(10, rect.height || c.clientHeight || innerHeight);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };
  const label = (ctx, text, x, y) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.86)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(text, x, y);
    ctx.restore();
  };
  const glowCircle = (ctx, x, y, r, color, alpha = .55) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.7);
    g.addColorStop(0, color);
    g.addColorStop(.28, color.replace('1)', '.36)'));
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.7, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  const pColor = ['rgba(121,236,255,1)','rgba(183,155,255,1)','rgba(255,171,215,1)','rgba(255,231,166,1)','rgba(169,245,202,1)'];
  const drawWave = (ctx, w, h, t, p, caption = 'frequency · wave · breath') => {
    const amp = h * (.055 + p.b / 900);
    const speed = .5 + p.a / 120;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h * (.28 + k * .14) + Math.sin(x * (.007 + k * .003 + p.a / 5200) + t * speed * (1 + k * .18)) * amp / (k + .8) + Math.cos(x * .004 + t) * 10;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = pColor[k % pColor.length];
      ctx.globalAlpha = .78;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    label(ctx, caption, 18, 28);
  };
  const drawMandala = (ctx, w, h, t, p, caption = 'music mandala: rhythm · ratio · light') => {
    const cx = w / 2, cy = h / 2, base = Math.min(w, h) * .13;
    ctx.save();
    for (let ring = 0; ring < 6; ring++) {
      const points = 6 + ring * 3;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const a = i * TAU / points + t * (ring % 2 ? .04 : -.035);
        const rr = base + ring * Math.min(w, h) * .055 + Math.sin(a * (2 + ring) + t) * (8 + p.b * .22);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = pColor[ring % pColor.length];
      ctx.globalAlpha = .22 + ring * .08;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    glowCircle(ctx, cx, cy, 15, 'rgba(255,231,166,1)', .52);
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(cx, cy, 4.8, 0, TAU); ctx.fill();
    ctx.restore();
    label(ctx, caption, 18, 28);
  };
  const drawRatio = (ctx, w, h, t, p) => {
    const ratios = [['1:1',1,'rgba(121,236,255,1)'],['5:4',1.25,'rgba(255,171,215,1)'],['4:3',1.333,'rgba(169,245,202,1)'],['3:2',1.5,'rgba(255,231,166,1)'],['2:1',2,'rgba(183,155,255,1)']];
    const cy = h * .70;
    ratios.forEach((r, i) => {
      const x = 55 + i * (w - 110) / (ratios.length - 1);
      const len = 58 * r[1] * (.75 + p.a / 250);
      ctx.strokeStyle = r[2]; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy - len); ctx.stroke();
      glowCircle(ctx, x, cy - len + Math.sin(t + i) * 4, 9, r[2], .45);
      ctx.fillStyle = r[2]; ctx.beginPath(); ctx.arc(x, cy - len + Math.sin(t + i) * 4, 6, 0, TAU); ctx.fill();
      label(ctx, r[0], x - 15, cy + 24);
    });
    label(ctx, 'Pythagorean ratios: number becomes harmony', 18, 28);
  };
  const drawHarmonics = (ctx, w, h, t, p) => {
    const cx = w * .5, cy = h * .55;
    for (let n = 1; n <= 9; n++) {
      ctx.beginPath();
      for (let a = 0; a <= TAU + .05; a += .035) {
        const rr = 24 + n * 17 + Math.sin(a * n + t * (.4 + n * .05)) * (6 + p.b * .09);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = pColor[n % pColor.length];
      ctx.globalAlpha = .18 + n * .045;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    label(ctx, 'harmonic loom: f + 2f + 3f + ... = timbre', 18, 28);
  };
  const drawResonance = (ctx, w, h, t, p) => {
    const cx = w / 2, cy = h / 2;
    const pulse = Math.abs(Math.sin(t * (.4 + p.a / 90)));
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = i % 2 ? 'rgba(121,236,255,1)' : 'rgba(255,171,215,1)';
      ctx.globalAlpha = .09 + i * .045;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, 24 + i * 24 + pulse * 8, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    glowCircle(ctx, cx, cy, 24 + pulse * 18, 'rgba(255,231,166,1)', .72);
    ctx.fillStyle = 'rgba(255,250,245,.93)'; ctx.beginPath(); ctx.arc(cx, cy, 6 + pulse * 4, 0, TAU); ctx.fill();
    label(ctx, 'resonance: when structure can receive, it lights', 18, 28);
  };
  const drawInterference = (ctx, w, h, t, p) => {
    const phase = (p.c - 50) / 50 * Math.PI;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = h * .48 + Math.sin(x * .018 + t) * 52 + Math.sin(x * .018 + t + phase) * 52;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,231,166,.95)'; ctx.lineWidth = 3; ctx.stroke();
    drawWave(ctx, w, h, t, p, 'interference: relation changes the result');
  };
  const drawSpectrum = (ctx, w, h, t, p) => {
    const bars = 28;
    for (let i = 0; i < bars; i++) {
      const x = 30 + i * (w - 60) / bars;
      const bh = (Math.abs(Math.sin(i * .55 + t)) * .55 + .18) * h * (.28 + p.b / 250);
      const grad = ctx.createLinearGradient(x, h * .78, x, h * .78 - bh);
      grad.addColorStop(0, 'rgba(121,236,255,.16)'); grad.addColorStop(1, pColor[i % pColor.length]);
      ctx.fillStyle = grad;
      ctx.fillRect(x, h * .78 - bh, Math.max(4, (w - 90) / bars * .58), bh);
    }
    label(ctx, 'spectrum: compressed information made visible', 18, 28);
  };
  const drawRhythm = (ctx, w, h, t, p) => {
    const cx = w/2, cy = h/2, r = Math.min(w,h)*.30;
    for (let i=0;i<16;i++){
      const a = -Math.PI/2 + i*TAU/16;
      const on = i%4===0 || (p.c>55 && i%5===0) || (p.b>65 && i%3===0);
      const x = cx+Math.cos(a)*r, y = cy+Math.sin(a)*r;
      ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
      ctx.fillStyle = on ? pColor[i%pColor.length] : 'rgba(255,255,255,.14)';
      ctx.beginPath(); ctx.arc(x,y,on?8:5,0,TAU); ctx.fill();
    }
    const a=-Math.PI/2+(t%4)/4*TAU; glowCircle(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,12,'rgba(255,231,166,1)',.5);
    label(ctx, 'rhythm: time becomes a path', 18, 28);
  };
  const drawVoice = (ctx, w, h, t, p) => {
    const cx=w/2, top=h*.18;
    ctx.strokeStyle='rgba(255,255,255,.20)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(cx,top+40); ctx.bezierCurveTo(cx-70,top+110,cx-60,top+190,cx,top+240); ctx.bezierCurveTo(cx+60,top+190,cx+70,top+110,cx,top+40); ctx.stroke();
    // breath wave
    ctx.beginPath();
    for(let x=cx-130;x<=cx+130;x+=3){ const y=top+270+Math.sin((x-cx)*.05+t*2)*18; x===cx-130?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    ctx.strokeStyle='rgba(121,236,255,.9)'; ctx.lineWidth=2; ctx.stroke();
    // folds
    const open=10+Math.sin(t*3)*5+p.a/20;
    ctx.strokeStyle='rgba(255,171,215,.95)'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(cx-open,top+150); ctx.quadraticCurveTo(cx-16,top+175,cx-open,top+200); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+open,top+150); ctx.quadraticCurveTo(cx+16,top+175,cx+open,top+200); ctx.stroke();
    label(ctx, 'voice: breath · folds · tract · language', 18, 28);
  };
  const drawBinaural = (ctx,w,h,t,p) => {
    const cy=h/2, lx=w*.25, rx=w*.75;
    for(let side=0; side<2; side++){
      const x=side?rx:lx;
      ctx.strokeStyle=side?'rgba(255,171,215,.8)':'rgba(121,236,255,.8)';
      for(let i=0;i<7;i++){ctx.globalAlpha=.15+i*.05;ctx.beginPath();ctx.arc(x,cy,30+i*21+Math.sin(t+i+side)*5,0,TAU);ctx.stroke();}
    }
    ctx.globalAlpha=1;ctx.strokeStyle='rgba(255,231,166,.7)';ctx.beginPath();ctx.moveTo(lx,cy);ctx.bezierCurveTo(w*.42,cy-95,w*.58,cy+95,rx,cy);ctx.stroke();
    label(ctx, 'binaural: space appears between two ears', 18, 28);
  };
  const drawTheremin = (ctx,w,h,t,p) => {
    const cx=w*.42, cy=h*.52;
    ctx.strokeStyle='rgba(255,255,255,.26)';ctx.lineWidth=2;ctx.strokeRect(cx-45,cy-58,90,116);
    ctx.beginPath();ctx.moveTo(cx+45,cy-58);ctx.quadraticCurveTo(cx+130,cy-95,cx+160,cy-10);ctx.strokeStyle='rgba(255,231,166,.7)';ctx.stroke();
    for(let i=0;i<9;i++){ctx.globalAlpha=.1+i*.06;ctx.strokeStyle=i%2?'rgba(121,236,255,.9)':'rgba(255,171,215,.9)';ctx.beginPath();ctx.arc(cx+150,cy,25+i*18+Math.sin(t+i)*4,0,TAU);ctx.stroke();}
    ctx.globalAlpha=1; label(ctx,'theremin: music through field, distance and care',18,28);
  };
  const drawCreate = (ctx,w,h,t,p,seq=[]) => {
    drawMandala(ctx,w,h,t,p,'creation mandala: choose rhythm, color, silence');
    const cx=w/2,cy=h/2,r=Math.min(w,h)*.34;
    for(let i=0;i<8;i++){const a=-Math.PI/2+i*TAU/8;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.strokeStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=seq[i]?'rgba(255,231,166,.95)':'rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(x,y,seq[i]?10:6,0,TAU);ctx.fill();}
  };
  const draw = (c, type='mandala', params={}, t=performance.now()/1000, extra={}) => {
    if (!c) return;
    const {ctx,w,h} = setup(c);
    ctx.clearRect(0,0,w,h);
    const p = Object.assign({a:50,b:50,c:50}, params || {});
    const bg = ctx.createRadialGradient(w*.45,h*.45,0,w*.5,h*.5,Math.max(w,h)*.7);
    bg.addColorStop(0,'rgba(121,236,255,.035)'); bg.addColorStop(.5,'rgba(183,155,255,.035)'); bg.addColorStop(1,'rgba(5,4,20,0)'); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    if (type === 'wave') drawWave(ctx,w,h,t,p);
    else if (type === 'ratio' || type === 'scale') drawRatio(ctx,w,h,t,p);
    else if (type === 'harmonics' || type === 'chord' || type === 'choir') drawHarmonics(ctx,w,h,t,p);
    else if (type === 'resonance' || type === 'airColumn' || type === 'string') drawResonance(ctx,w,h,t,p);
    else if (type === 'interference') drawInterference(ctx,w,h,t,p);
    else if (type === 'spectrum' || type === 'formant' || type === 'synth' || type === 'masking') drawSpectrum(ctx,w,h,t,p);
    else if (type === 'rhythm' || type === 'life' || type === 'prediction' || type === 'compose') drawRhythm(ctx,w,h,t,p);
    else if (type === 'voice' || type === 'breath') drawVoice(ctx,w,h,t,p);
    else if (type === 'binaural') drawBinaural(ctx,w,h,t,p);
    else if (type === 'theremin') drawTheremin(ctx,w,h,t,p);
    else if (type === 'mandala') drawCreate(ctx,w,h,t,p,extra.seq || []);
    else drawMandala(ctx,w,h,t,p);
  };
  const loop = (c, type, getParams, getExtra) => {
    let raf = 0;
    const frame = (ms) => {
      draw(c, typeof type === 'function' ? type() : type, typeof getParams === 'function' ? getParams() : getParams, ms/1000, typeof getExtra === 'function' ? getExtra() : (getExtra || {}));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  };
  const startCosmos = (c, reduced) => {
    if (!c || reduced) return () => {};
    const stars = Array.from({length:260}, () => ({x:Math.random(),y:Math.random(),r:Math.random()*1.7+.2,s:Math.random()*1.2+.15}));
    let raf=0;
    const frame=(ms)=>{const {ctx,w,h}=setup(c);ctx.clearRect(0,0,w,h);const t=ms/1000;const g=ctx.createLinearGradient(0,h*.25,w,h*.75);g.addColorStop(0,'rgba(121,236,255,.045)');g.addColorStop(.5,'rgba(255,231,166,.075)');g.addColorStop(1,'rgba(183,155,255,.04)');ctx.save();ctx.translate(w*.5,h*.5);ctx.rotate(-.28);ctx.fillStyle=g;ctx.fillRect(-w,-h*.10,w*2,h*.20);ctx.restore();stars.forEach(st=>{ctx.globalAlpha=.18+.78*Math.sin(t*st.s+st.x*10)**2;ctx.fillStyle=st.r>1.4?'#ffe7a6':'#fff';ctx.beginPath();ctx.arc(st.x*w,st.y*h,st.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;raf=requestAnimationFrame(frame)};raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
  };
  const startGate = (c, reduced) => reduced ? (()=>{}) : loop(c, 'mandala', {a:60,b:58,c:64});
  let audio = null;
  let oscs = [];
  const stopSound = () => { oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch(e){} }); oscs = []; };
  const play = (kind='ratio', params={a:50}, seq=[]) => {
    stopSound();
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio = audio || new AC();
      if (audio.state === 'suspended') audio.resume();
      const now = audio.currentTime;
      const base = 160 + (params.a || 50) * 2.2;
      const patterns = {ratio:[1,1.25,1.5,2], resonance:[1,1.01,1.5], choir:[1,1.25,1.5,2], wave:[1], theremin:[1,1.06], mandala:[1,1.125,1.25,1.5]};
      const list = patterns[kind] || patterns.mandala;
      list.forEach((m,i)=>{ const o=audio.createOscillator(), g=audio.createGain(); o.type = kind==='theremin' ? 'sine' : (kind==='mandala' ? 'triangle' : 'sine'); o.frequency.value = base*m; const start = now + i*.055; g.gain.setValueAtTime(.0001,start); g.gain.exponentialRampToValueAtTime(.03/(i+1),start+.06); g.gain.exponentialRampToValueAtTime(.0001,start+1.25+i*.08); o.connect(g); g.connect(audio.destination); o.start(start); o.stop(start+1.45+i*.08); oscs.push(o); });
      if (seq && seq.some(Boolean)) seq.forEach((on,i)=>{ if(!on)return; const o=audio.createOscillator(),g=audio.createGain(); o.type='triangle'; o.frequency.value=base*[1,1.125,1.25,1.334,1.5,1.667,1.875,2][i]; const t=now+i*.16; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.034,t+.018); g.gain.exponentialRampToValueAtTime(.0001,t+.14); o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t+.16); oscs.push(o); });
    } catch(e) {}
  };
  window.ML_ANIM = { draw, loop, startCosmos, startGate, play, stopSound };
})();
