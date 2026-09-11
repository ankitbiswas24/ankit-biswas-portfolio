const progressBar=document.getElementById('progressBar');
const revealEls=document.querySelectorAll('.reveal');
const cards=document.querySelectorAll('.depth-card');
const hero=document.querySelector('.hero');
const orbitA=document.querySelector('.orbit-a');
const orbitB=document.querySelector('.orbit-b');
const atom=document.querySelector('.atom');

function updateProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;progressBar.style.width=(max?window.scrollY/max*100:0)+'%'}
window.addEventListener('scroll',updateProgress,{passive:true});updateProgress();

const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
revealEls.forEach(el=>observer.observe(el));

// Dynamic 3D cards: tilt + moving internal light field + depth lift.
cards.forEach(card=>{
 card.addEventListener('pointermove',e=>{
  const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  card.style.setProperty('--rx',`${(-y*7).toFixed(2)}deg`);card.style.setProperty('--ry',`${(x*9).toFixed(2)}deg`);card.style.setProperty('--tz','14px');
  card.style.setProperty('--card-x',`${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);card.style.setProperty('--card-y',`${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
 });
 card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--tz','0px')});
});

// Scroll-driven 3D depth and staggered project motion.
const sections=document.querySelectorAll('.content-section,.contact-section');
function depthScroll(){
 const vh=window.innerHeight;
 sections.forEach(sec=>{const r=sec.getBoundingClientRect(),distance=(r.top+r.height/2-vh/2)/(vh/2);sec.style.setProperty('--section-rot',`${Math.max(-2.8,Math.min(2.8,distance*1.7))}deg`);sec.style.setProperty('--section-scale',1-Math.min(.045,Math.abs(distance)*.022));});
 document.querySelectorAll('.project-card').forEach((card,i)=>{const r=card.getBoundingClientRect(),d=(r.top-vh*.72)/(vh*.72);card.style.setProperty('--scroll-z',`${Math.max(-25,Math.min(25,-d*18+i*1.5))}px`)});
}
window.addEventListener('scroll',depthScroll,{passive:true});depthScroll();

// Hero 3D parallax + cursor black-hole position.
window.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')},{passive:true});
hero.addEventListener('pointermove',e=>{const x=e.clientX/window.innerWidth-.5,y=e.clientY/window.innerHeight-.5;orbitA.style.transform=`translate(-50%,-50%) rotate(-25deg) rotateX(${58-y*12}deg) rotateY(${x*12}deg)`;orbitB.style.transform=`translate(-50%,-50%) rotate(${54+x*10}deg) rotateX(${63-y*10}deg)`;atom.style.transform=`translate(-50%,-50%) translate3d(${x*28}px,${y*22}px,-180px) rotateY(${x*20}deg) rotateX(${y*-10}deg)`});
hero.addEventListener('pointerleave',()=>{orbitA.style.transform='translate(-50%,-50%) rotate(-25deg) rotateX(58deg)';orbitB.style.transform='translate(-50%,-50%) rotate(54deg) rotateX(63deg)';atom.style.transform='translate(-50%,-50%) translateZ(-180px)'});

// Floating particle field generated without external libraries.
const particleLayer=document.querySelector('.data-particles');
if(particleLayer){for(let i=0;i<70;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animationDelay=(Math.random()*5)+'s';p.style.animationDuration=(4+Math.random()*7)+'s';p.style.setProperty('--s',(1+Math.random()*3)+'px');particleLayer.appendChild(p)}}
