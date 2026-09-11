
(() => {
  const root=document.documentElement;
  const cards=[...document.querySelectorAll('.depth-card,.fold-card')];
  const radar=document.querySelector('.radar-system');

  // Smooth scroll-linked background camera.
  let px=.5, py=.5, sx=.5, sy=.5;
  let scroll=0,targetScroll=0;
  let lastTime=performance.now();

  addEventListener('pointermove',e=>{
    px=e.clientX/innerWidth;
    py=e.clientY/innerHeight;
  },{passive:true});
  addEventListener('scroll',()=>targetScroll=scrollY,{passive:true});

  // Reveal sections only once. This is the primary visible scroll animation.
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  // Visible fold-out for cards. Only plays when first entering; no flicker on reverse scroll.
  cards.forEach((card,i)=>{
    card.classList.add('v11-ready');
    card.style.animationDelay=(Math.min(i%4,3)*70)+'ms';
  });
  const foldObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && !entry.target.dataset.played){
        const card=entry.target;
        card.dataset.played='1';
        card.classList.remove('v11-ready');
        card.classList.add('v11-foldout');
        setTimeout(()=>card.classList.remove('v11-foldout'),1200);
      }
    });
  },{threshold:.2,rootMargin:'0px 0px -6% 0px'});
  cards.forEach(c=>foldObserver.observe(c));

  // Subtle mouse tilt, bounded so it never causes jitter.
  cards.forEach(card=>{
    let tx=0,ty=0,sx2=0,sy2=0,raf=0;
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      tx=((e.clientX-r.left)/r.width-.5)*2;
      ty=((e.clientY-r.top)/r.height-.5)*2;
      if(!raf) raf=requestAnimationFrame(()=>{
        sx2 += (tx-sx2)*.12;
        sy2 += (ty-sy2)*.12;
        card.style.setProperty('--tilt-x',(-sy2*2.2)+'deg');
        card.style.setProperty('--tilt-y',(sx2*2.2)+'deg');
        card.style.transform=`perspective(1200px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(0)`;
        raf=0;
      });
    });
    card.addEventListener('pointerleave',()=>{
      tx=ty=0;
      card.style.transform='perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });

  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(40,now-lastTime); lastTime=now;
    const k=1-Math.pow(.0008,dt/1000);
    sx+=(px-sx)*k*.35;
    sy+=(py-sy)*k*.35;
    scroll+=(targetScroll-scroll)*.035;

    if(radar){
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const p=Math.max(0,Math.min(1,scroll/max));
      const ry=(sx-.5)*16 + p*10;
      const rz=(sy-.5)*9 + p*12;
      const scale=1+Math.sin(p*Math.PI)*.045;
      root.style.setProperty('--radar-ry',ry.toFixed(2)+'deg');
      root.style.setProperty('--radar-rz',rz.toFixed(2)+'deg');
      root.style.setProperty('--radar-scale',scale.toFixed(3));
    }
  }
  requestAnimationFrame(frame);

  // Downward-only small section pulse.
  let previous=scrollY;
  addEventListener('scroll',()=>{
    const delta=scrollY-previous;
    if(delta>6){
      document.body.classList.add('moving-down');
      clearTimeout(window.__downTimer);
      window.__downTimer=setTimeout(()=>document.body.classList.remove('moving-down'),260);
    }
    previous=scrollY;
  },{passive:true});
})();


/* V14 — living background: drifting particles + flowing energy lanes */
(() => {
  const canvas = document.getElementById('dynamicField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;

  let w=0,h=0,dpr=1, particles=[];
  let mx=.5,my=.5,tx=.5,ty=.5, scrollTarget=0, scrollSmooth=0, last=performance.now();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth; h=innerHeight;
    canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.min(110,Math.max(52,Math.floor(w*h/14500)));
    particles=Array.from({length:n},(_,i)=>({
      x:Math.random()*w,y:Math.random()*h,
      z:.25+Math.random()*.95,s:.35+Math.random()*1.55,
      a:.22+Math.random()*.5,p:Math.random()*Math.PI*2,hue:i%3
    }));
  }
  function color(p,a){
    return p.hue===0 ? `rgba(72,220,255,${a})` :
           p.hue===1 ? `rgba(140,110,255,${a})` :
                       `rgba(65,150,255,${a})`;
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{
    tx=e.clientX/Math.max(1,w); ty=e.clientY/Math.max(1,h);
  },{passive:true});
  addEventListener('scroll',()=>{
    scrollTarget=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
  },{passive:true});
  resize();

  function draw(now){
    const dt=Math.min(32,now-last); last=now, t=now*.001;
    mx+=(tx-mx)*.035; my+=(ty-my)*.035;
    scrollSmooth+=(scrollTarget-scrollSmooth)*.025;
    ctx.clearRect(0,0,w,h);

    // Soft moving atmospheric wells.
    for(const q of [
      {x:w*(.20+mx*.035),y:h*(.30+my*.035),r:Math.max(w,h)*.28},
      {x:w*(.78-mx*.025),y:h*(.68-my*.025),r:Math.max(w,h)*.24}
    ]){
      const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);
      g.addColorStop(0,'rgba(55,190,255,.075)');
      g.addColorStop(.38,'rgba(93,85,255,.025)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(q.x-q.r,q.y-q.r,q.r*2,q.r*2);
    }

    // Flowing perspective lanes.
    ctx.save();
    ctx.translate((mx-.5)*22,(my-.5)*14);
    ctx.rotate((scrollSmooth-.5)*.045);
    for(let lane=0;lane<7;lane++){
      const y0=h*(.12+lane*.13);
      ctx.beginPath();
      for(let x=-60;x<=w+60;x+=18){
        const y=y0+Math.sin(x*.007+t*(.32+lane*.015)+lane*.8)*18+
                    Math.sin(x*.0025-t*.18)*10;
        x===-60?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=lane%2?'rgba(82,151,255,.035)':'rgba(77,221,255,.05)';
      ctx.lineWidth=1; ctx.stroke();
    }
    ctx.restore();

    // Drifting particles with tiny motion trails.
    for(const p of particles){
      p.p+=.0025*dt*p.z;
      p.x+=Math.cos(p.p)*.10*p.z*dt;
      p.y+=(.018+Math.sin(p.p*.7)*.012)*p.z*dt;
      if(p.x>w+20)p.x=-20; if(p.x<-20)p.x=w+20; if(p.y>h+20)p.y=-20;
      const x=p.x+(mx-.5)*18*p.z, y=p.y+(my-.5)*12*p.z;
      const pulse=.65+.35*Math.sin(t*(.8+p.z)+p.p);
      ctx.beginPath(); ctx.arc(x,y,p.s*p.z,0,Math.PI*2);
      ctx.fillStyle=color(p,p.a*pulse); ctx.fill();
      if(p.z>.8){
        ctx.beginPath(); ctx.moveTo(x,y);
        ctx.lineTo(x-Math.cos(p.p)*7*p.z,y-Math.sin(p.p)*7*p.z);
        ctx.strokeStyle=color(p,.10*pulse); ctx.lineWidth=.7; ctx.stroke();
      }
    }

    // Subtle diagonal scanner.
    const scan=((t*.055+scrollSmooth*.22)%1.35)-.15, sx=w*scan;
    const sg=ctx.createLinearGradient(sx-140,0,sx+140,0);
    sg.addColorStop(0,'rgba(60,210,255,0)');
    sg.addColorStop(.5,'rgba(80,205,255,.045)');
    sg.addColorStop(1,'rgba(110,90,255,0)');
    ctx.fillStyle=sg; ctx.fillRect(sx-140,0,280,h);

    if(!reduced) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();


/* V15 — cursor-following glow */
(() => {
  const glow = document.getElementById('cursorGlow');
  if (!glow || matchMedia('(pointer: coarse)').matches) return;

  let tx=innerWidth*.5, ty=innerHeight*.5;
  let x=tx, y=ty, vx=0, vy=0;
  let visible=false, lastMove=performance.now(), lastX=tx, lastY=ty;

  addEventListener('pointermove', e => {
    tx=e.clientX; ty=e.clientY;
    visible=true;
    lastMove=performance.now();

    const speed=Math.hypot(e.clientX-lastX,e.clientY-lastY);
    lastX=e.clientX; lastY=e.clientY;

    // Faster movement makes the aura bloom slightly.
    const bloom=Math.min(1.45, 1 + speed*.012);
    glow.style.setProperty('--glow-bloom', bloom.toFixed(2));
  }, {passive:true});

  addEventListener('pointerleave', () => { visible=false; }, {passive:true});

  function animate(){
    // Smooth lag gives the glow a physical "floating" feel.
    vx += (tx-x)*.105;
    vy += (ty-y)*.105;
    vx *= .72;
    vy *= .72;
    x += vx;
    y += vy;

    glow.style.transform=`translate3d(${x}px,${y}px,0) scale(${getComputedStyle(glow).getPropertyValue('--glow-bloom')||1})`;
    glow.style.opacity = visible && performance.now()-lastMove < 180 ? '.96' : '.48';

    requestAnimationFrame(animate);
  }
  animate();
})();


/* V16 — background energy engine */
(() => {
  const canvas = document.getElementById('energyField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;

  let w=0,h=0,dpr=1,t=0,mx=.5,my=.5,tx=.5,ty=.5;
  let scroll=.5, targetScroll=.5, last=performance.now();
  const streaks=[], orbits=[];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth; h=innerHeight;
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);

    streaks.length=0;
    const n=Math.min(30,Math.max(14,Math.floor(w/48)));
    for(let i=0;i<n;i++){
      streaks.push({
        x:Math.random()*w,
        y:Math.random()*h,
        len:70+Math.random()*190,
        speed:45+Math.random()*105,
        phase:Math.random()*Math.PI*2,
        width:.6+Math.random()*1.3,
        type:i%3
      });
    }

    orbits.length=0;
    for(let i=0;i<8;i++){
      orbits.push({
        a:.12+Math.random()*.42,
        b:.045+Math.random()*.20,
        angle:Math.random()*Math.PI*2,
        speed:(.035+Math.random()*.075)*(i%2?-1:1),
        size:1+Math.random()*2
      });
    }
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{
    tx=e.clientX/Math.max(1,w);
    ty=e.clientY/Math.max(1,h);
  },{passive:true});
  addEventListener('scroll',()=>{
    targetScroll=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
  },{passive:true});
  resize();

  function lineGradient(x1,y1,x2,y2){
    const g=ctx.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0,'rgba(45,190,255,0)');
    g.addColorStop(.45,'rgba(62,218,255,.14)');
    g.addColorStop(.72,'rgba(116,91,255,.10)');
    g.addColorStop(1,'rgba(90,80,255,0)');
    return g;
  }

  function draw(now){
    const dt=Math.min(32,now-last); last=now;
    t+=dt*.001;
    mx+=(tx-mx)*.025;
    my+=(ty-my)*.025;
    scroll+=(targetScroll-scroll)*.025;
    ctx.clearRect(0,0,w,h);

    // Large slow-moving energy arcs, like a futuristic reactor field.
    ctx.save();
    ctx.translate(w*.5+(mx-.5)*45,h*.5+(my-.5)*28);
    ctx.rotate((scroll-.5)*.18);
    for(let i=0;i<5;i++){
      const rx=Math.min(w*.75,h*1.05)*(0.48+i*.075);
      const ry=Math.min(w*.75,h*1.05)*(0.16+i*.038);
      ctx.beginPath();
      ctx.ellipse(
        0,0,rx,ry,
        t*(.035+i*.009)*(i%2?-1:1)+i*.6,
        0,Math.PI*2
      );
      ctx.strokeStyle=i%2?'rgba(106,94,255,.045)':'rgba(61,218,255,.052)';
      ctx.lineWidth=1;
      ctx.stroke();
    }
    ctx.restore();

    // Fast diagonal energy streaks.
    for(const s of streaks){
      s.x += s.speed*dt*.001;
      s.y += Math.sin(t*.7+s.phase)*dt*.008;
      if(s.x>w+s.len) {
        s.x=-s.len-Math.random()*100;
        s.y=Math.random()*h;
      }
      const drift=Math.sin(t*.35+s.phase)*24;
      const x1=s.x, y1=s.y+drift;
      const x2=s.x+s.len, y2=s.y+drift-18;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.strokeStyle=lineGradient(x1,y1,x2,y2);
      ctx.lineWidth=s.width;
      ctx.stroke();

      // bright travelling head
      const head=(s.x/(w+s.len));
      if(head>.02 && head<.98){
        ctx.beginPath();
        ctx.arc(x2,y2,1.4+s.width,0,Math.PI*2);
        ctx.fillStyle='rgba(100,225,255,.20)';
        ctx.fill();
      }
    }

    // Small particles orbiting an invisible central field.
    const cx=w*(.5+(mx-.5)*.12);
    const cy=h*(.5+(my-.5)*.10);
    const base=Math.min(w,h);
    for(let i=0;i<orbits.length;i++){
      const o=orbits[i];
      o.angle += o.speed*dt;
      const ang=o.angle+t*o.speed*2;
      const x=cx+Math.cos(ang)*base*o.a;
      const y=cy+Math.sin(ang)*base*o.b;
      const tail=14+o.size*8;

      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(
        x-Math.cos(ang)*tail,
        y-Math.sin(ang)*tail*.42
      );
      ctx.strokeStyle=i%2?'rgba(135,105,255,.12)':'rgba(65,220,255,.14)';
      ctx.lineWidth=.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x,y,o.size,0,Math.PI*2);
      ctx.fillStyle=i%2?'rgba(145,110,255,.62)':'rgba(75,225,255,.68)';
      ctx.fill();
    }

    // Moving horizontal scan pulses.
    const scanY=((t*42 + scroll*h*1.7)%(h+180))-90;
    const sg=ctx.createLinearGradient(0,scanY-28,0,scanY+28);
    sg.addColorStop(0,'rgba(50,210,255,0)');
    sg.addColorStop(.5,'rgba(60,215,255,.045)');
    sg.addColorStop(1,'rgba(100,90,255,0)');
    ctx.fillStyle=sg;
    ctx.fillRect(0,scanY-28,w,56);

    if(!reduced) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();


/* V16 — stronger interactive card tilt */
(() => {
  const cards=document.querySelectorAll('.depth-card, .project-card, .skill-card, .info-card');
  if(!cards.length || matchMedia('(pointer:coarse)').matches) return;

  cards.forEach(card=>{
    let tx=0,ty=0,rx=0,ry=0;
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;

      // Increased from the subtle V13 response: up to ~12° tilt.
      tx=-py*12;
      ty=px*14;
    },{passive:true});

    card.addEventListener('pointerleave',()=>{
      tx=0; ty=0;
    },{passive:true});

    function tick(){
      rx+=(tx-rx)*.12;
      ry+=(ty-ry)*.12;

      // Preserve the card's own CSS animation/position by using variables.
      card.style.setProperty('--mouse-rx',rx.toFixed(2)+'deg');
      card.style.setProperty('--mouse-ry',ry.toFixed(2)+'deg');
      card.style.setProperty('--mouse-lift',(Math.hypot(rx,ry)*.18).toFixed(2)+'px');
      requestAnimationFrame(tick);
    }
    tick();
  });
})();


/* V18 — scroll reactive 3D background element.
   ADDITIVE layer: V16 particles, energy streaks, cursor glow and card tilt are untouched. */
(() => {
  const canvas = document.getElementById('scrollCore');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;

  let w=0,h=0,dpr=1;
  let targetProgress=0, progress=0;
  let targetMX=.5,targetMY=.5,mx=.5,my=.5;
  let scrollVelocity=0, velocity=0, lastY=scrollY;
  let time=0,last=performance.now();

  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth; h=innerHeight;
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{
    targetMX=e.clientX/Math.max(1,w);
    targetMY=e.clientY/Math.max(1,h);
  },{passive:true});
  addEventListener('scroll',()=>{
    targetProgress=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    scrollVelocity=scrollY-lastY;
    lastY=scrollY;
  },{passive:true});
  resize();

  function rot(x,y,z,rx,ry,rz){
    let yy=y*Math.cos(rx)-z*Math.sin(rx);
    let zz=y*Math.sin(rx)+z*Math.cos(rx);
    let xx=x*Math.cos(ry)+zz*Math.sin(ry);
    zz=-x*Math.sin(ry)+zz*Math.cos(ry);
    const X=xx*Math.cos(rz)-yy*Math.sin(rz);
    const Y=xx*Math.sin(rz)+yy*Math.cos(rz);
    return [X,Y,zz];
  }

  function draw(now){
    const dt=Math.min(32,now-last); last=now;
    time+=dt*.001;

    progress+=(targetProgress-progress)*.055;
    mx+=(targetMX-mx)*.035;
    my+=(targetMY-my)*.035;
    velocity+=(scrollVelocity-velocity)*.14;
    scrollVelocity*=.80;

    ctx.clearRect(0,0,w,h);

    const min=Math.min(w,h);
    const R=min*.205;
    const cx=w*.5+(mx-.5)*35;
    const cy=h*.50+(my-.5)*25 + Math.sin(progress*Math.PI*5)*min*.025;

    // Scroll is the camera: every page section changes the object's attitude.
    const rx=.55+(my-.5)*.48+Math.sin(progress*Math.PI*3.5)*.24;
    const ry=time*.11 + progress*Math.PI*7.2 + (mx-.5)*.55 + velocity*.035;
    const rz=Math.sin(progress*Math.PI*2.5)*.22;
    const scale=1+Math.sin(progress*Math.PI*4)*.055;

    // Halo behind the object.
    const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,R*2.25);
    halo.addColorStop(0,'rgba(55,220,255,.065)');
    halo.addColorStop(.35,'rgba(93,90,255,.028)');
    halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=halo;
    ctx.fillRect(cx-R*2.25,cy-R*2.25,R*4.5,R*4.5);

    ctx.save();
    ctx.translate(cx,cy);

    // Longitude lines.
    for(let lon=0;lon<14;lon++){
      const a=lon*Math.PI/7;
      ctx.beginPath();
      for(let i=0;i<=72;i++){
        const p=-Math.PI/2+i*Math.PI/72;
        const x=Math.cos(p)*Math.cos(a)*R*scale;
        const y=Math.sin(p)*R*scale;
        const z=Math.cos(p)*Math.sin(a)*R*scale;
        const [X,Y,Z]=rot(x,y,z,rx,ry,rz);
        const px=X,py=Y;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      }
      ctx.strokeStyle=lon%3===0?'rgba(70,220,255,.115)':'rgba(104,113,255,.052)';
      ctx.lineWidth=lon%3===0?1:.65;
      ctx.stroke();
    }

    // Latitude lines.
    for(let lat=-5;lat<=5;lat++){
      const p=lat*Math.PI/12;
      ctx.beginPath();
      for(let i=0;i<=80;i++){
        const a=i*Math.PI*2/80;
        const x=Math.cos(p)*Math.cos(a)*R*scale;
        const y=Math.sin(p)*R*scale;
        const z=Math.cos(p)*Math.sin(a)*R*scale;
        const [X,Y,Z]=rot(x,y,z,rx,ry,rz);
        if(i===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);
      }
      ctx.strokeStyle='rgba(79,190,255,.065)';
      ctx.lineWidth=.7;
      ctx.stroke();
    }

    // Technical orbital rings.
    for(let i=0;i<3;i++){
      ctx.save();
      ctx.rotate(ry*.25+i*.85);
      ctx.beginPath();
      ctx.ellipse(0,0,R*(1.45+i*.16),R*(.32+i*.05),0,0,Math.PI*2);
      ctx.strokeStyle=i===0?'rgba(68,220,255,.13)':'rgba(116,93,255,.075)';
      ctx.lineWidth=i===0?1.15:.7;
      ctx.stroke();
      ctx.restore();
    }

    // Moving energy node on the outer orbit.
    const a=time*.55+progress*Math.PI*8;
    const ox=Math.cos(a)*R*1.48;
    const oy=Math.sin(a)*R*.34;
    ctx.beginPath();
    ctx.arc(ox,oy,3.2,0,Math.PI*2);
    ctx.fillStyle='rgba(104,231,255,.85)';
    ctx.shadowBlur=18;
    ctx.shadowColor='rgba(75,210,255,.9)';
    ctx.fill();
    ctx.shadowBlur=0;

    // Scroll-direction streak crossing the object.
    const sweep=(progress*Math.PI*12+time*.7)%(Math.PI*2);
    ctx.beginPath();
    ctx.arc(0,0,R*1.08,sweep,sweep+.62);
    ctx.strokeStyle='rgba(91,229,255,.27)';
    ctx.lineWidth=1.7;
    ctx.stroke();

    ctx.restore();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();


/* V19 — replay card animation on downward scroll.
   Cards replay only after meaningful downward movement, so the effect feels
   intentional instead of flickering on every tiny wheel event. */
(() => {
  const cards = Array.from(document.querySelectorAll(
    '.depth-card, .project-card, .skill-card, .info-card, .fold-card'
  ));
  if (!cards.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let lastY = scrollY;
  let accumulatedDown = 0;
  let lastReplay = 0;
  let ticking = false;

  function replayVisibleCards(){
    const now = performance.now();
    if (now-lastReplay < 260) return;

    const visible = [];
    for (const card of cards){
      const r = card.getBoundingClientRect();
      // Animate cards that are currently visible or just entering the viewport.
      if (r.bottom > -80 && r.top < innerHeight + 120) visible.push(card);
    }

    if (!visible.length) return;

    lastReplay = now;
    visible.forEach((card,i)=>{
      card.classList.remove('scroll-replay-card');
      // Force a reflow so the same animation can replay every time.
      void card.offsetWidth;
      card.style.setProperty('--scroll-delay', `${Math.min(i*65,260)}ms`);
      card.classList.add('scroll-replay-card');

      clearTimeout(card._v19Timer);
      card._v19Timer = setTimeout(()=>{
        card.classList.remove('scroll-replay-card');
      }, 1200);
    });
  }

  function onScroll(){
    const y=scrollY;
    const dy=y-lastY;
    lastY=y;

    if (dy > 0){
      accumulatedDown += dy;
      // Replay after each meaningful downward scroll distance.
      if (accumulatedDown >= 85){
        accumulatedDown=0;
        if (!ticking){
          ticking=true;
          requestAnimationFrame(()=>{
            replayVisibleCards();
            ticking=false;
          });
        }
      }
    } else if (dy < 0){
      // Scrolling upward resets the distance counter; the next downward
      // movement can trigger the animation again.
      accumulatedDown=0;
    }
  }

  addEventListener('scroll',onScroll,{passive:true});
})();
