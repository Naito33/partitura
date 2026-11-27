'use strict';
/* ================= утилиты ================= */
const $=s=>document.querySelector(s);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const now=()=>Date.now();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const NS='http://www.w3.org/2000/svg';
const h=(tag,props={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(props||{})){if(v==null)continue;if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k in e&&k!=='list'&&k!=='style')e[k]=v;else e.setAttribute(k,v)}for(const c of kids.flat())if(c!=null&&c!==false)e.append(c);return e};
const P=d=>d.split('|').map(x=>x.startsWith('c')?`<circle ${x.slice(1)}/>`:x.startsWith('r')?`<rect ${x.slice(1)}/>`:`<path d="${x}"/>`).join('');
const ICONS={
 menu:P('M4 6h16|M4 12h16|M4 18h16'),search:P('ccx="11" cy="11" r="7"|m20 20-3.5-3.5'),
 sun:P('ccx="12" cy="12" r="4"|M12 2v2|M12 20v2|m4.9 4.9 1.4 1.4|m17.7 17.7 1.4 1.4|M2 12h2|M20 12h2|m6.3 17.7-1.4 1.4|m19.1 4.9-1.4 1.4'),
 moon:P('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'),sync:P('M21 12a9 9 0 1 1-2.6-6.4L21 8|M21 3v5h-5'),
 note:P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8'),
 sticky:P('M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z|M15 3v6h6'),
 check:P('m9 11 3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'),
 kanban:P('rx="3" y="3" width="18" height="18" rx="3"|M9 7v6|M15 7v10'),
 progress:P('rx="2" y="8" width="20" height="8" rx="4"|M6 12h7'),clock:P('ccx="12" cy="12" r="9"|M12 7v5l3 2'),
 image:P('rx="3" y="3" width="18" height="18" rx="3"|ccx="9" cy="9" r="2"|m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21'),
 link:P('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7|M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'),
 palette:P('M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.7 1.7 0 0 1 12 22z|ccx="7.5" cy="11" r="1"|ccx="12" cy="7" r="1"|ccx="16.5" cy="11" r="1"'),
 heading:P('M6 4v16|M18 4v16|M6 12h12'),frame:P('M22 7H2|M22 17H2|M7 2v20|M17 2v20'),
 arrow:P('M5 19 19 5|M9 5h10v10'),spark:P('M12 3l1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2z|M19 17v4|M17 19h4'),
 thumb:P('M7 10v12|M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z'),
 msg:P('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'),
 copy:P('rx="8" y="8" width="14" height="14" rx="2"|M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2'),
 trash:P('M3 6h18|M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6|M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'),
 drop:P('M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z'),
 undo:P('M3 7v6h6|M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'),redo:P('M21 7v6h-6|M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7'),
 x:P('M18 6 6 18|m6 6 12 12'),plus:P('M12 5v14|M5 12h14'),minus:P('M5 12h14'),
 fit:P('M8 3H5a2 2 0 0 0-2 2v3|M21 8V5a2 2 0 0 0-2-2h-3|M3 16v3a2 2 0 0 0 2 2h3|M16 21h3a2 2 0 0 0 2-2v-3'),
 left:P('m15 18-6-6 6-6'),right:P('m9 18 6-6-6-6'),cal:P('rx="3" y="4" width="18" height="18" rx="2"|M16 2v4|M8 2v4|M3 10h18'),
 user:P('ccx="12" cy="8" r="4"|M20 21a8 8 0 0 0-16 0'),bold:P('M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8'),
 list:P('M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01'),dice:P('rx="3" y="3" width="18" height="18" rx="3"|M8 8h.01|M16 16h.01|M12 12h.01|M16 8h.01|M8 16h.01'),
 bulb:P('M9 18h6|M10 22h4|M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'),activity:P('M22 12h-4l-3 9L9 3l-3 9H2'),
 cursor:P('M4 4l7 17 2.5-7.5L21 11z'),hand:P('M18 11V6a2 2 0 0 0-4 0v5|M14 10V4a2 2 0 0 0-4 0v6|M10 10.5V6a2 2 0 0 0-4 0v8|M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15'),
 pen:P('M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),pin:P('M12 17v5|M9 10.8V4h6v6.8l2 2.2v2H7v-2z'),rope:P('M3 12c3-6 6 6 9 0s6 6 9 0'),
 apps:P('rx="3" y="3" width="7" height="7" rx="1.5"|rx="14" y="3" width="7" height="7" rx="1.5"|rx="3" y="14" width="7" height="7" rx="1.5"|rx="14" y="14" width="7" height="7" rx="1.5"'),
 lock:P('rx="4" y="11" width="16" height="10" rx="2"|M8 11V7a4 4 0 0 1 8 0v4'),unlock:P('rx="4" y="11" width="16" height="10" rx="2"|M8 11V7a4 4 0 0 1 7.5-2'),
 play:P('M7 4v16l13-8z'),pause:P('M7 4h3v16H7z|M14 4h3v16h-3z'),reset:P('M3 12a9 9 0 1 0 3-6.7L3 8|M3 3v5h5'),
 timer:P('ccx="12" cy="13" r="8"|M12 9v4l2 2|M9 2h6'),ext:P('M15 3h6v6|M10 14 21 3|M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'),
 front:P('rx="8" y="8" width="13" height="13" rx="2"|M4 16V5a1 1 0 0 1 1-1h11'),music:P('M9 18V5l12-2v13|ccx="6" cy="18" r="3"|ccx="18" cy="16" r="3"'),
 more:P('ccx="5" cy="12" r="1"|ccx="12" cy="12" r="1"|ccx="19" cy="12" r="1"'),edit:P('M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),
 send:P('m22 2-7 20-4-9-9-4z|M22 2 11 13'),css:P('m16 18 6-6-6-6|m8 6-6 6 6 6'),
 shapes:P('rx="3" y="3" width="8" height="8" rx="1.5"|ccx="17" cy="7" r="4"|M7 13l4 8H3z|rx="13" y="13" width="8" height="8" rx="4"'),
 chart:P('M3 3v18h18|M7 16v-4|M11 16V8|M15 16v-6|M19 16V5'),gantt:P('M3 5h10|M7 10h12|M5 15h8|M10 20h9'),text:P('M4 7V4h16v3|M9 20h6|M12 4v16'),
 back:P('m12 19-7-7 7-7|M19 12H5'),bend:P('M4 20C4 10 20 14 20 4'),dash:P('M4 12h3|M10.5 12h3|M17 12h3'),both:P('M5 12h14|m9 8-4 4 4 4|m15 8 4 4-4 4'),
 layer:P('m12 2 10 5-10 5L2 7z|m2 17 10 5 10-5|m2 12 10 5 10-5'),label:P('M4 7h16|M4 12h10|M4 17h7'),straight:P('M4 20 20 4'),
 italic:P('M19 4h-9|M14 20H5|M15 4 9 20'),underline:P('M6 4v6a6 6 0 0 0 12 0V4|M4 20h16'),strike:P('M16 4H9a3 3 0 0 0-2.83 4|M14 12a4 4 0 0 1 0 8H6|M4 12h16'),
 al:P('M15 12H3|M17 18H3|M21 6H3'),ac:P('M17 12H7|M19 18H5|M21 6H3'),ar:P('M21 12H9|M21 18H7|M21 6H3'),aj:P('M3 6h18|M3 12h18|M3 18h18'),
 crop:P('M6 2v14a2 2 0 0 0 2 2h14|M18 22V8a2 2 0 0 0-2-2H2'),btn:P('rx="2" y="7" width="20" height="10" rx="5"|M9 12h6|m13 10 2 2-2 2'),
 tree:P('rx="9" y="2" width="6" height="5" rx="1"|rx="3" y="16" width="6" height="5" rx="1"|rx="15" y="16" width="6" height="5" rx="1"|M12 7v4|M6 16v-2h12v2'),
 alignv:P('M12 3v18|rx="5" y="6" width="14" height="4" rx="1"|rx="7" y="14" width="10" height="4" rx="1"'),chev:P('m6 9 6 6 6-6'),
};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;
const ibtn=(icon,title,fn,cls='cb')=>h('button',{className:cls,title,innerHTML:ic(icon,15),onmousedown:e=>e.preventDefault(),onclick:e=>{e.stopPropagation();fn(e)}});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=html=>(new DOMParser().parseFromString((html||'').replace(/<(br|div|p|li|ul|ol)\b/gi,' <$1'),'text/html').body.textContent||'').replace(/\s+/g,' ').trim();
function hashHue(s){let x=0;for(const c of String(s))x=(x*31+c.charCodeAt(0))>>>0;return x%360}
function avatar(name,size=22){const n=String(name||'?').trim();const ini=n.split(/\s+/).map(w=>w[0]).join('').slice(0,2)||'?';
  const a=h('span',{className:'av',title:n,textContent:ini});a.style.cssText=`--s:${size}px;background:hsl(${hashHue(n.toLowerCase())} 55% 50%)`;return a}
function plural(n,a,b,c){n=Math.abs(n);const m=n%10,m2=n%100;return m===1&&m2!==11?a:m>=2&&m<=4&&(m2<10||m2>=20)?b:c}
function dateOf(s){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function daysTo(s){const t=new Date();t.setHours(0,0,0,0);return Math.round((dateOf(s)-t)/864e5)}
const fmtDate=s=>dateOf(s).toLocaleDateString('ru',{day:'numeric',month:'short'}).replace('.','');
function ago(t){const s=(now()-t)/1000;if(s<60)return'только что';if(s<3600)return Math.floor(s/60)+' мин назад';if(s<86400)return Math.floor(s/3600)+' ч назад';return new Date(t).toLocaleDateString('ru',{day:'numeric',month:'short'})}
function toast(t,action){const e=$('#toast');e.textContent='';e.append(h('span',{},t));if(action)e.append(h('button',{onclick:()=>{action.fn();e.classList.remove('on')}},action.label));
  e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),action?5500:2400)}
const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const enc=s=>new TextEncoder().encode(s);
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s)}
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ================= состояние и хранилище ================= */
const idb=(()=>{let p;const open=()=>p??=new Promise((res,rej)=>{const r=indexedDB.open('boards-app',1);r.onupgradeneeded=()=>{r.result.createObjectStore('boards');r.result.createObjectStore('images')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const tx=async(st,mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction(st,mode);const r=fn(t.objectStore(st));t.oncomplete=()=>res(r?.result);t.onerror=()=>rej(t.error)})};
  return{get:(s,k)=>tx(s,'readonly',o=>o.get(k)),put:(s,k,v)=>tx(s,'readwrite',o=>o.put(v,k)),all:s=>tx(s,'readonly',o=>o.getAll()),keys:s=>tx(s,'readonly',o=>o.getAllKeys())}})();
const meta=Object.assign({sha:{},pushed:{},uploaded:{}},JSON.parse(localStorage.meta||'{}'));
const saveMeta=()=>localStorage.meta=JSON.stringify(meta);
let cfg=JSON.parse(localStorage.cfg||'{}');
const me=()=>localStorage.myName||'';
let boards={},cur=null,maxZ=1,view={x:0,y:0,s:1};
let selSet=new Set(),selConn=null,tool='select',spaceDown=false;
let ink=Object.assign({color:'auto',size:3},JSON.parse(localStorage.ink||'{}'));
const board=()=>boards[cur];
const vp=$('#vp'),world=$('#world'),cardsEl=$('#cards'),svg=$('#links'),ropesSvg=$('#ropes'),draft=$('#draft'),titleIn=$('#boardTitle');
const elMap=new Map();
const elOf=id=>{if(!id)return null;const e=elMap.get(id);if(e&&e.isConnected)return e;const f=cardsEl.querySelector(`[data-id="${CSS.escape(id)}"]`);if(f)elMap.set(id,f);return f};
const live=b=>Object.values(b.items).filter(i=>!i.del&&i.type&&i.type[0]!=='_');
const hidden=(b,t)=>Object.values(b.items).filter(i=>!i.del&&i.type===t);
const saveT={};
function persist(b){clearTimeout(saveT[b.id]);saveT[b.id]=setTimeout(()=>{delete saveT[b.id];idb.put('boards',b.id,b)},700)}
function flushSaves(){for(const id of Object.keys(saveT)){clearTimeout(saveT[id]);delete saveT[id];if(boards[id])idb.put('boards',id,boards[id])}}
addEventListener('pagehide',flushSaves);
function touch(b){b.rev=(b.rev||0)+1;persist(b);scheduleSync()}
function stamp(it,bid=cur){it.at=now();if(me())it.by=me();rtQueue(bid,it.id)}
function put(b,o){const li=b.items[o.id];if(li&&li!==o){for(const k of Object.keys(li))delete li[k];Object.assign(li,o)}else b.items[o.id]=o;rtQueue(b.id,o.id);return b.items[o.id]}
const tomb=(b,id)=>put(b,{id,del:true,at:now()});

/* ================= тема ================= */
function setTheme(t){document.documentElement.dataset.theme=t;localStorage.theme=t;$('#themeBtn').innerHTML=ic(t==='dark'?'sun':'moon');
  document.querySelector('meta[name=theme-color]').content=t==='dark'?'#0d0e12':'#f2f3f7';drawLinks()}

/* ================= отмена ================= */
const undoS=[],redoS=[];let lastSnap={},batchE=null;
function snap(ids,force){const b=board();
  if(batchE){for(const id of ids)if(!batchE.ch.some(c=>c.id===id))batchE.ch.push({id,prev:b.items[id]?JSON.stringify(b.items[id]):null});return}
  if(!force&&ids.length===1&&lastSnap.id===ids[0]&&now()-lastSnap.t<1200){lastSnap.t=now();return}
  undoS.push({b:b.id,ch:ids.map(id=>({id,prev:b.items[id]?JSON.stringify(b.items[id]):null}))});if(undoS.length>200)undoS.shift();redoS.length=0;
  lastSnap=ids.length===1?{id:ids[0],t:now()}:{}}
function batch(fn){if(batchE)return fn();batchE={b:cur,ch:[]};try{return fn()}finally{const e=batchE;batchE=null;if(e.ch.length){undoS.push(e);redoS.length=0}}}
function edit(it,fn,o={}){if(o.snap!==false)snap([it.id]);if(typeof fn==='function')fn();else if(fn)Object.assign(it,fn);stamp(it);touch(board());scheduleDraw()}
function applyHist(from,to){const e=from.pop();if(!e)return toast('Нечего отменять');const b=boards[e.b];if(!b)return;
  to.push({b:e.b,ch:e.ch.map(c=>({id:c.id,prev:b.items[c.id]?JSON.stringify(b.items[c.id]):null}))});
  for(const c of e.ch){const v=c.prev?JSON.parse(c.prev):{id:c.id,del:true};v.at=now();put(b,v)}
  lastSnap={};touch(b);if(b.id!==cur)openBoard(b.id);else{document.activeElement?.blur?.();renderBoard()}}
const undo=()=>applyHist(undoS,redoS),redo=()=>applyHist(redoS,undoS);

/* ================= вид: плавный зум и панорама ================= */
let tv=null,animR=0,viewT;
const invEls=['#selbox','#bendh','#curs','#marquee'].map(s=>$(s));let lastInv=0;
function applyView(){world.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.s})`;if(lastInv!==view.s){lastInv=view.s;for(const e of invEls)e.style.setProperty('--inv',1/view.s)}
  vp.style.backgroundSize=`${24*view.s}px ${24*view.s}px`;vp.style.backgroundPosition=`${view.x}px ${view.y}px`;
  $('#zl').textContent=Math.round(view.s*100)+'%';updateSelUI();clearTimeout(viewT);viewT=setTimeout(()=>cur&&(localStorage['view:'+cur]=JSON.stringify(view)),300);
  world.classList.add('moving');document.body.classList.add('moving');clearTimeout(applyView.m);applyView.m=setTimeout(()=>{world.classList.remove('moving');document.body.classList.remove('moving')},180);
  document.body.classList.toggle('lod',view.s<.38);scheduleCull();scheduleMinimap()}
let cullT=0;function scheduleCull(){if(!cullT)cullT=setTimeout(()=>{cullT=0;cull()},90)}
function cull(){const b=board();if(!b)return;const m=300/view.s,x0=-view.x/view.s-m,y0=-view.y/view.s-m,x1=x0+vp.clientWidth/view.s+2*m,y1=y0+vp.clientHeight/view.s+2*m;
  for(const el of cardsEl.children){const id=el.dataset.id;const L=el.offsetLeft,T=el.offsetTop;
    const v=selSet.has(id)||(L<x1&&L+el.offsetWidth>x0&&T<y1&&T+el.offsetHeight>y0)?'':'hidden';if(el.style.visibility!==v)el.style.visibility=v}}
function animStep(){animR=0;if(!tv)return;const k=.2;view.s*=Math.pow(tv.s/view.s,k);
  if(tv.a){view.x=tv.a.cx-tv.a.wx*view.s;view.y=tv.a.cy-tv.a.wy*view.s}else{view.x+=(tv.x-view.x)*k;view.y+=(tv.y-view.y)*k}
  if(Math.abs(tv.s/view.s-1)<.0015&&(tv.a||Math.hypot(tv.x-view.x,tv.y-view.y)<.6)){view.s=tv.s;if(tv.a){view.x=tv.a.cx-tv.a.wx*view.s;view.y=tv.a.cy-tv.a.wy*view.s}else{view.x=tv.x;view.y=tv.y}tv=null}
  applyView();if(tv)animR=requestAnimationFrame(animStep)}
const kick=()=>{if(!animR)animR=requestAnimationFrame(animStep)};
function zoomAt(cx,cy,f){const s=clamp((tv?.s||view.s)*f,.08,4);tv={s,a:{cx,cy,wx:(cx-view.x)/view.s,wy:(cy-view.y)/view.s}};kick()}
function zoomInstant(cx,cy,f){tv=null;const s=clamp(view.s*f,.08,4),wx=(cx-view.x)/view.s,wy=(cy-view.y)/view.s;view={s,x:cx-wx*s,y:cy-wy*s};applyView()}
function animateTo(v){tv={...v};kick()}
function panBy(dx,dy){view.x+=dx;view.y+=dy;if(tv){if(tv.a){tv.a.cx+=dx;tv.a.cy+=dy}else{tv.x+=dx;tv.y+=dy}}applyView()}
const toWorld=(cx,cy)=>({x:(cx-view.x)/view.s,y:(cy-view.y)/view.s});
const center=()=>toWorld(vp.clientWidth/2,vp.clientHeight/2);
const isMouseWheel=e=>e.deltaMode===1||(e.deltaX===0&&Math.abs(e.deltaY)>=40&&Number.isInteger(e.deltaY));
vp.addEventListener('wheel',e=>{e.preventDefault();
  if(e.ctrlKey||e.metaKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.012));
  else if(e.shiftKey)panBy(-e.deltaY,0);
  else if(isMouseWheel(e))zoomAt(e.clientX,e.clientY,Math.exp(-Math.sign(e.deltaY)*Math.min(Math.abs(e.deltaY*(e.deltaMode===1?40:1)),160)*.0028));
  else panBy(-e.deltaX,-e.deltaY)},{passive:false});
let needFit=false;
function bounds(items){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const i of items){const r=itemBox(i);x0=Math.min(x0,r.x);y0=Math.min(y0,r.y);x1=Math.max(x1,r.x+r.w);y1=Math.max(y1,r.y+r.h)}return{x:x0,y:y0,w:x1-x0,h:y1-y0}}
function fitView(force,smooth){const W=vp.clientWidth,H=vp.clientHeight;if(!(needFit||force)||!W||!board())return;needFit=false;const its=live(board());let v;
  if(its.length){const r=bounds(its);const s=clamp(Math.min((W-80)/r.w,(H-220)/r.h),.15,1);v={s,x:W/2-(r.x+r.w/2)*s,y:Math.max(90,(H-r.h*s)/2)-r.y*s}}else v={x:W/2,y:H/2,s:1};
  if(smooth)animateTo(v);else{view=v;applyView()}}
new ResizeObserver(()=>fitView()).observe(vp);

/* ================= жесты ================= */
let op=null;
function beginOp(pid,move,up,cancel){endOp();const mv=e=>{if(e.pointerId===pid)move(e)},u=e=>{if(e.pointerId!==pid)return;endOp();up(e)};
  addEventListener('pointermove',mv);addEventListener('pointerup',u);addEventListener('pointercancel',u);op={mv,u,cancel}}
function endOp(){if(!op)return;removeEventListener('pointermove',op.mv);removeEventListener('pointerup',op.u);removeEventListener('pointercancel',op.u);op=null}
function cancelOp(){const o=op;endOp();o?.cancel?.()}
const ptrs=new Map();let pinch=null;
const isBg=t=>t===vp||t===world||t===cardsEl||t===svg||t===ropesSvg;
vp.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===2){cancelOp();document.body.classList.remove('dragging','panning');const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s,m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};return}}
  if(!isBg(e.target))return;closePops();
  if(e.button===1||spaceDown||tool==='hand'||(e.pointerType==='touch'&&tool==='select')){startPan(e);return}
  if(e.button!==0)return;
  if(tool==='select')startMarquee(e);else if(tool==='pen'||tool==='arrow')startDraw(e,tool);else if(tool==='pin'||tool==='rope')startLink(e,null,'rope')});
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&ptrs.size>=2){const[a,b]=[...ptrs.values()],m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};panBy(m.x-pinch.m.x,m.y-pinch.m.y);pinch.m=m;zoomInstant(m.x,m.y,Math.hypot(a.x-b.x,a.y-b.y)/pinch.d*pinch.s/view.s)}});
for(const t of['pointerup','pointercancel'])addEventListener(t,e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null});
vp.addEventListener('contextmenu',e=>{e.preventDefault();if(isBg(e.target))showCanvasMenu(e.clientX,e.clientY)});
vp.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
addEventListener('auxclick',e=>{if(e.button===1&&vp.contains(e.target))e.preventDefault()});
vp.addEventListener('dblclick',e=>{if(isBg(e.target)&&tool==='select')showAddMenu(e.clientX,e.clientY,toWorld(e.clientX,e.clientY))});
function startPan(e){e.preventDefault();let lx=e.clientX,ly=e.clientY,moved=false;const sx=lx,sy=ly,btn=e.button,touch=e.pointerType==='touch';tv=null;document.body.classList.add('panning');
  beginOp(e.pointerId,ev=>{if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>3)moved=true;panBy(ev.clientX-lx,ev.clientY-ly);lx=ev.clientX;ly=ev.clientY},
    ev=>{document.body.classList.remove('panning');if(!moved){if(touch||btn===0)setSel([])}},()=>document.body.classList.remove('panning'))}
function itemBox(it){const el=elOf(it.id);return el?{x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight}:{x:it.x,y:it.y,w:it.w||100,h:it.h||100}}
function startMarquee(e){const add=e.shiftKey,base=add?new Set(selSet):new Set(),sx=e.clientX,sy=e.clientY,m=$('#marquee');let moved=false;
  beginOp(e.pointerId,ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;moved=true;
    const x0=Math.min(sx,ev.clientX),y0=Math.min(sy,ev.clientY),x1=Math.max(sx,ev.clientX),y1=Math.max(sy,ev.clientY);
    m.hidden=false;Object.assign(m.style,{left:x0+'px',top:y0+'px',width:x1-x0+'px',height:y1-y0+'px'});
    const a=toWorld(x0,y0),b=toWorld(x1,y1),ids=new Set(base);
    for(const it of live(board())){const r=itemBox(it);if(it.type==='pin'&&it.on)continue;const ok=it.type==='frame'?r.x>=a.x&&r.y>=a.y&&r.x+r.w<=b.x&&r.y+r.h<=b.y:r.x<b.x&&r.x+r.w>a.x&&r.y<b.y&&r.y+r.h>a.y;if(ok)ids.add(it.id)}
    setSel([...ids])},()=>{m.hidden=true;if(!moved&&!add)setSel([])},()=>m.hidden=true)}

/* ================= выделение ================= */
function setSel(ids){const next=new Set(ids);const same=next.size===selSet.size&&[...next].every(i=>selSet.has(i))&&!selConn;selSet=next;selConn=null;
  for(const e of cardsEl.children)e.classList.toggle('sel',selSet.has(e.dataset.id));document.body.classList.toggle('multi',selSet.size>1);
  if(!same){buildSel();onSelChange()}updateSelUI();drawLinks()}
function toggleSel(id){const s=new Set(selSet);s.has(id)?s.delete(id):s.add(id);setSel([...s])}
const selItems=()=>{const b=board();return b?[...selSet].map(id=>b.items[id]).filter(i=>i&&!i.del&&i.type):[]};
const HAS_H=new Set(['frame','draw','embed','shape']);
function buildSel(){const sb=$('#selbox');sb.textContent='';const its=selItems();
  if(its.length===1&&its[0].type!=='pin'){const t=its[0].type;const dirs=its[0].locked?[]:t==='lens'?['nw','ne','se','sw']:HAS_H.has(t)?['nw','n','ne','e','se','s','sw','w']:t==='heading'||t==='button'?['e','w']:['nw','ne','e','se','sw','w'];
    for(const d of dirs){const hd=h('div',{className:'hdl'});hd.dataset.d=d;hd.addEventListener('pointerdown',e=>startResize(e,d,its[0]));sb.append(hd)}
    if(!its[0].locked&&!['frame','lens'].includes(t)){const r=h('div',{className:'hdl rot',title:'Повернуть (Shift — шагами по 15°)'});r.dataset.d='rot';r.addEventListener('pointerdown',e=>startRotate(e,its[0]));sb.append(r)}}
  buildCtx()}
function updateSelUI(){const sb=$('#selbox'),cx=$('#ctx');const its=selItems();
  const bt=bendTarget();let bp=null;if(bt){if(selConn)bp=connMid[selConn];else{const p=bt.pts;bp=bt.bend?{x:bt.x+bt.bend[0],y:bt.y+bt.bend[1]}:{x:bt.x+(p[0][0]+p[1][0])/2,y:bt.y+(p[0][1]+p[1][1])/2}}}
  bendH.hidden=!bp;if(bp){bendH.style.left=bp.x+'px';bendH.style.top=bp.y+'px'}
  if(!its.length&&!selConn){sb.hidden=true;cx.hidden=true;return}
  let r;if(its.length){r=bounds(its);const pad=0;sb.hidden=its.every(i=>i.type==='pin');
    Object.assign(sb.style,{left:r.x-pad-3/view.s+'px',top:r.y-pad-3/view.s+'px',width:r.w+2*pad+6/view.s+'px',height:r.h+2*pad+6/view.s+'px'});sb.style.rotate=its.length===1&&its[0].rot?its[0].rot+'rad':''}
  else{sb.hidden=true;const m=connMid[selConn];if(!m){cx.hidden=true;return}r={x:m.x,y:m.y,w:0,h:0}}
  if(!cx.childElementCount){cx.hidden=true;return}cx.hidden=false;
  const W=cx.offsetWidth,H=cx.offsetHeight,sx=(r.x+r.w/2)*view.s+view.x;let sy=r.y*view.s+view.y-H-14;if(sy<74)sy=(r.y+r.h)*view.s+view.y+(its.length===1&&!['frame','lens','pin'].includes(its[0].type)?60:14);
  cx.style.left=clamp(sx-W/2,8,innerWidth-W-8)+'px';cx.style.top=clamp(sy,70,innerHeight-H-80)+'px'}
function onSelChange(){if(wins.comments&&selSet.size===1){wins.comments._card=[...selSet][0];renderWin('comments')}}

/* ================= типы ================= */
const COLORS=['','#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#14b8a6'];
const PRIO={must:{l:'Необходимо',c:'#10b981',k:'1'},should:{l:'Менее важно',c:'#f59e0b',k:'2'},nope:{l:'Не нужно',c:'#9ca3af',k:'3'}};
const isSortable=i=>i&&!['frame','pin','draw','heading','gantt'].includes(i.type);
const INKS=['auto','#000000','#ffffff','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#9ca3af'];
const inkCss=c=>!c||c==='auto'?'var(--tx)':c;
const TYPES={
 note:{name:'Заметка',icon:'note',w:290},sticky:{name:'Стикер',icon:'sticky',w:210},todo:{name:'Чек-лист',icon:'check',w:300},
 kanban:{name:'Канбан',icon:'kanban',w:660},progress:{name:'Прогресс',icon:'progress',w:280},deadline:{name:'Дедлайн',icon:'clock',w:250},
 image:{name:'Референс',icon:'image',w:300},link:{name:'Ссылка',icon:'link',w:290},palette:{name:'Палитра',icon:'palette',w:340},
 heading:{name:'Заголовок',icon:'heading',w:440},frame:{name:'Раздел',icon:'frame',w:720,h:480},timer:{name:'Таймер',icon:'timer',w:260},
 shape:{name:'Фигура',icon:'shapes',w:180,h:100},chart:{name:'Диаграмма',icon:'chart',w:360},gantt:{name:'Таймлайн задач',icon:'gantt',w:720},
 audio:{name:'Музыка',icon:'music',w:340},lens:{name:'Лупа',icon:'search',w:260},button:{name:'Кнопка-ссылка',icon:'btn',w:220},
 embed:{name:'Приложение',icon:'apps',w:420,h:320},draw:{name:'Рисунок',icon:'pen'},pin:{name:'Пин',icon:'pin',w:28}};
const kcols=()=>[{id:uid(),title:'Надо сделать',tasks:[]},{id:uid(),title:'В работе',tasks:[]},{id:uid(),title:'Готово',tasks:[]}];
function defaults(t){return{note:{html:''},sticky:{text:'',c:1},todo:{title:'',rows:[{id:uid(),text:'',done:false}]},kanban:{title:'',cols:kcols()},
  progress:{title:'',mode:'all',val:0},deadline:{title:'',date:new Date(now()+14*864e5).toISOString().slice(0,10)},link:{url:'',label:''},
  palette:{title:'',colors:randomPalette(),locks:[]},heading:{text:''},frame:{title:'',h:480},timer:{title:'',dur:600000,endAt:0,left:null},
  shape:{kind:'round',text:'',c:3},lens:{zoom:2.2,fish:.6},button:{text:'',c:5},chart:{title:'',kind:'bar',src:'manual',data:[{l:'Янв',v:12},{l:'Фев',v:19},{l:'Мар',v:9},{l:'Апр',v:24}]},gantt:{title:''}}[t]||{}}
const minW=it=>({lens:90,button:80,image:40,heading:120,frame:240,draw:20,embed:200,pin:28,shape:40,note:it.bare?40:160})[it.type]||160;
const minH=it=>({frame:160,draw:20,embed:120,shape:30})[it.type]||40;
function tasksOf(it){if(it.type==='todo')return(it.rows||[]).map(r=>!!r.done);
  if(it.type==='kanban'){const L=it.cols.length-1;return it.cols.flatMap((c,ci)=>c.tasks.map(()=>ci===L))}return[]}
const ratio=a=>a.length?a.filter(Boolean).length/a.length:0;
function progressOf(it,b=board()){if(it.type==='todo'||it.type==='kanban')return ratio(tasksOf(it));
  if(it.type==='progress'){const m=it.mode||'manual';if(m==='manual')return(it.val||0)/100;
    return ratio(live(b).filter(t=>(t.type==='todo'||t.type==='kanban')&&(m==='all'||t.id===m)).flatMap(tasksOf))}return 0}
function boardProgress(b){const a=live(b).filter(t=>t.type==='todo'||t.type==='kanban').flatMap(tasksOf);return a.length?{p:ratio(a),n:a.length,d:a.filter(Boolean).length}:null}
function allTasks(b){const out=[];for(const it of live(b)){
  if(it.type==='todo')(it.rows||[]).forEach(r=>out.push({card:it,ref:r,kind:'todo',text:r.text,done:!!r.done,due:r.due,who:r.who,where:it.title||'Чек-лист'}));
  if(it.type==='kanban'){const L=it.cols.length-1;it.cols.forEach((c,ci)=>c.tasks.forEach(t=>out.push({card:it,ref:t,kind:'kanban',ci,text:t.text,done:ci===L,due:t.due,who:t.who,where:(it.title||'Канбан')+' · '+c.title})))}}
  return out}
function itemText(it){switch(it.type){case'note':return strip(it.html);case'sticky':case'heading':case'_cmt':return it.text||'';
  case'todo':return[it.title,...(it.rows||[]).map(r=>(r.done?'[x] ':'[ ] ')+r.text)].filter(Boolean).join(' · ');case'kanban':return[it.title,...(it.cols||[]).flatMap(c=>c.tasks.map(t=>t.text))].filter(Boolean).join(' · ');
  case'link':case'embed':return(it.label||'')+' '+(it.url||'');case'image':return it.cap||'';case'palette':return(it.title||'')+' '+(it.colors||[]).join(' ');default:return it.title||''}}
const cardLabel=it=>(TYPES[it.type]?.name||'')+(itemText(it)?': '+itemText(it).slice(0,60):'');

/* ================= отрисовка карточек ================= */
function place(el,it){if(!el)return;
  if(it.type==='pin'){Object.assign(el.style,{left:it.x-14+'px',top:it.y-34+'px',width:'28px',height:'34px'});return}
  Object.assign(el.style,{left:it.x+'px',top:it.y+'px',width:it.w+'px',zIndex:it.type==='frame'?0:(it.z||1)+2});
  if(HAS_H.has(it.type))el.style.height=(it.h||300)+'px';
  if(it.c&&COLORS[it.c]){el.style.setProperty('--hue',COLORS[it.c]);el.classList.add('tint')}else{el.style.removeProperty('--hue');el.classList.remove('tint')}
  el.style.rotate=it.rot?it.rot+'rad':'';el.classList.toggle('locked',!!it.locked);el.classList.toggle('tight',!!it.tight);if(it.type==='lens')el.style.height=it.w+'px';
  el.classList.toggle('bare',!!it.bare);el.classList.toggle('nohdr',!!it.nohdr);for(const k in PRIO)el.classList.toggle('p-'+k,it.type!=='frame'&&it.prio===k);el.classList.toggle('zone',it.type==='frame'&&!!(it.prio||it.inbox))}
const pinSvg=c=>`<svg width="28" height="34" viewBox="0 0 28 34"><path d="M14 18 L14 33" stroke="#9aa1ad" stroke-width="2.2" stroke-linecap="round"/><circle cx="14" cy="11" r="9" fill="${c||'#ef4444'}"/><circle cx="11" cy="8" r="3" fill="#fff" opacity=".45"/></svg>`;
function pathD(pts,smooth){if(!pts.length)return'';if(!smooth||pts.length<3)return'M'+pts.map(p=>p[0]+' '+p[1]).join('L');
  let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+=`Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`}
  const l=pts[pts.length-1];return d+`L${l[0]} ${l[1]}`}
function headD(x1,y1,x2,y2,len=12){const a=Math.atan2(y2-y1,x2-x1),s=.45;return` M${x2} ${y2}L${x2-len*Math.cos(a-s)} ${y2-len*Math.sin(a-s)}M${x2} ${y2}L${x2-len*Math.cos(a+s)} ${y2-len*Math.sin(a+s)}`}
function drawSvg(it){const s=document.createElementNS(NS,'svg');s.setAttribute('width',it.w);s.setAttribute('height',it.h);const p=it.pts||[];let d;
  if(it.bend&&p.length===2){const m=it.bend,c=[2*m[0]-(p[0][0]+p[1][0])/2,2*m[1]-(p[0][1]+p[1][1])/2];d=`M${p[0][0]} ${p[0][1]}Q${c[0]} ${c[1]} ${p[1][0]} ${p[1][1]}`;if(it.kind==='arrow')d+=headD(c[0],c[1],p[1][0],p[1][1],8+it.size*2.5)}
  else{d=pathD(p,it.kind==='pen');if(it.kind==='arrow'&&p.length>1)d+=headD(...p[p.length-2],...p[p.length-1],8+it.size*2.5)}
  s.innerHTML=`<path class="dpath" d="${d}" style="stroke:${inkCss(it.color)};stroke-width:${it.size}"/><path class="hit" d="${d}"/>`;return s}
function renderItem(it){const T=TYPES[it.type]||{name:it.type,icon:'note'};
  const el=h('div',{className:'card t-'+it.type+(selSet.has(it.id)?' sel':'')});el.dataset.id=it.id;elMap.set(it.id,el);place(el,it);
  el.addEventListener('pointerdown',e=>cardDown(e,it.id,el),true);
  el.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();if(!selSet.has(it.id))setSel([it.id]);showCardMenu(e.clientX,e.clientY)});
  if(it.type==='draw'){el.append(drawSvg(it));return el}
  if(it.type==='pin'){el.innerHTML=pinSvg(it.color);return el}
  if(it.type==='lens'){fillLens(it,el);return el}
  if(it.type==='button'){fillButton(it,el);return el}
  const zp=it.type==='frame'&&(PRIO[it.prio]||(it.inbox&&{c:'#3b82f6'}));const lead=it.type==='frame'?h('span',{style:'display:flex;align-items:center;gap:8px;flex:1;min-width:0'},zp?h('span',{className:'zdot',style:`background:${zp.c}`}):null,h('input',{className:'ttl',value:it.title||'',placeholder:'Название раздела',oninput:e=>edit(it,{title:e.target.value})}),zp?h('span',{className:'zc'},''):null)
    :kindLabel(it,T);
  const hd=h('div',{className:'hd'},lead,h('span',{className:'sp'}),it.type==='embed'||it.type==='link'?ibtn('ext','Открыть в новой вкладке',()=>window.open(it.url,'_blank','noopener')):null);
  const bd=h('div',{className:'bd'});el.append(hd,bd,h('div',{className:'ft'}));fillBody(it,el,bd);if(it.link)el.append(linkBadge(it));if(it.prio&&PRIO[it.prio]&&it.type!=='frame')el.append(h('span',{className:'prio-b',style:`background:${PRIO[it.prio].c}`},PRIO[it.prio].l));return el}
function kindLabel(it,T){const def=it.type==='embed'?(it.svc||T.name):T.name;const txt=h('span',{},it.hdr||def);const k=h('span',{className:'kind',title:'Двойной клик — переименовать'});k.innerHTML=ic(T.icon,13);k.append(txt);
  k.addEventListener('dblclick',e=>{e.stopPropagation();renameHdr(it,txt,def)});return k}
function renameHdr(it,txt,def){const el=elOf(it.id);if(!txt){txt=el?.querySelector('.kind span');def=TYPES[it.type]?.name}if(!txt)return;txt.contentEditable='plaintext-only';txt.focus();const r=document.createRange();r.selectNodeContents(txt);getSelection().removeAllRanges();getSelection().addRange(r);
  const done=()=>{txt.contentEditable='false';const v=txt.textContent.trim();edit(it,()=>{if(v&&v!==def)it.hdr=v;else delete it.hdr});txt.textContent=it.hdr||def};
  txt.addEventListener('blur',done,{once:true});txt.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();txt.blur()}})}
const navStack=[];
function followLink(l){if(!l)return;if(l.startsWith('board:')){const[bid,cid]=l.slice(6).split('#');if(!boards[bid]||boards[bid].deleted)return toast('Доска не найдена');
  if(bid!==cur){navStack.push(cur);openBoard(bid)}$('#backBtn').hidden=!navStack.length;if(cid)setTimeout(()=>focusCard(cid),120)}else window.open(l,'_blank','noopener')}
function linkLabel(l){if(l.startsWith('board:'))return'→ '+(boards[l.slice(6).split('#')[0]]?.title||'доска');try{return new URL(l).hostname.replace(/^www\./,'')}catch{return'ссылка'}}
function linkBadge(it){return h('button',{className:'lnk-b',title:'Перейти: '+linkLabel(it.link),innerHTML:ic('link',11)+'<span>'+esc(linkLabel(it.link))+'</span>',onclick:e=>{e.stopPropagation();followLink(it.link)}})}
function placeEnd(n){const r=document.createRange();r.selectNodeContents(n);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function rerenderCard(id){const o=elOf(id),it=board().items[id];if(!o||!it)return;const n=renderItem(it);o.replaceWith(n);paintAll()}
const OKTAG=new Set(['B','I','U','S','STRONG','EM','UL','OL','LI','BR','DIV','P','SPAN','CODE','STRIKE']);
function clean(html){const d=new DOMParser().parseFromString('<div>'+(html||'')+'</div>','text/html').body.firstChild;
  (function walk(n){for(const c of[...n.children]){walk(c);if(!OKTAG.has(c.tagName)){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|IMG|SVG)$/.test(c.tagName))c.remove();else c.replaceWith(...c.childNodes)}else for(const a of[...c.attributes]){if(c.tagName==='SPAN'&&a.name==='style'&&/^color:\s*#[0-9a-f]{3,8};?$/i.test(a.value.trim()))continue;c.removeAttribute(a.name)}}})(d);return d.innerHTML}
const progLine=it=>{const p=it?progressOf(it):0;return h('div',{className:'pline'},h('div',{className:'bar'},h('div',{className:'fill',style:`width:${(p*100).toFixed(1)}%`})),h('span',{className:'pct'},Math.round(p*100)+'%'))};
const ttlInput=(it,ph)=>h('input',{className:'ttl',value:it.title||'',placeholder:ph,oninput:e=>edit(it,{title:e.target.value})});
function chips(o,onclick,done){const c=h('button',{className:'chips',title:'Срок и исполнитель',onmousedown:e=>e.preventDefault(),onclick:e=>{e.stopPropagation();onclick(e)}});
  if(o.due){const d=daysTo(o.due);c.append(h('span',{className:'due '+(done?'':d<0?'over':d<=2?'soon':''),innerHTML:ic('cal',11)+esc(fmtDate(o.due))}))}
  if(o.who)c.append(avatar(o.who,20));if(!o.due&&!o.who)c.append(h('span',{className:'more',innerHTML:ic('user',14)}));return c}
function editableLine(text,oninput,onkey){const t=h('div',{className:'rt',contentEditable:'plaintext-only',textContent:text||''});
  t.addEventListener('input',()=>oninput(t.textContent));if(onkey)t.addEventListener('keydown',e=>onkey(e,t));return t}

function fillBody(it,el,bd){bd.textContent='';const refill=()=>{fillBody(it,el,bd);paintAll()};
  switch(it.type){
  case'note':case'sticky':case'heading':{const rich=it.type==='note';
    const t=h('div',{className:'txt',contentEditable:rich?'true':'plaintext-only'});t.dataset.ph={note:'Текст заметки…',sticky:'Идея…',heading:'Заголовок'}[it.type];
    if(rich)t.innerHTML=clean(it.html);else t.textContent=it.text||'';applyText(t,it);applyAsc(t,it);if(it.bare&&!it.html&&rich)t.dataset.ph='Текст';
    t.addEventListener('input',e=>{
      if(rich&&e.inputType==='insertText'&&/[\s ]$/.test(e.data||'')){const s=getSelection(),n=s.anchorNode;
        if(n&&n.nodeType===3&&/^[-*•][\s ]$/.test(n.textContent.slice(0,s.anchorOffset))&&(!n.previousSibling||n.previousSibling.nodeName==='BR')&&!n.parentElement.closest('li')){
          n.textContent=n.textContent.slice(s.anchorOffset);const r=document.createRange();r.setStart(n,0);r.collapse(true);s.removeAllRanges();s.addRange(r);document.execCommand('insertUnorderedList')}}
      edit(it,rich?{html:t.innerHTML}:{text:t.textContent})});
    bd.append(t);break}
  case'todo':{it.rows??=[];const ul=h('ul',{className:'rows'});
    const focusRow=i=>{const r=bd.querySelectorAll('.rt')[i];if(r){r.focus();placeEnd(r)}};
    const addRow=i=>{edit(it,()=>it.rows.splice(i,0,{id:uid(),text:'',done:false}));refill();focusRow(i)};
    it.rows.forEach((r,i)=>{const li=h('li',{className:r.done?'done':''});
      li.append(h('input',{type:'checkbox',checked:!!r.done,onchange:e=>{const on=e.target.checked;edit(it,()=>r.done=on);li.classList.toggle('done',on);if(on)burst(e.target);paintProgress();scheduleDraw()}}),
        editableLine(r.text,v=>edit(it,()=>r.text=v),(e,t)=>{if(e.key==='Enter'){e.preventDefault();addRow(i+1)}
          else if(e.key==='Backspace'&&!t.textContent){e.preventDefault();edit(it,()=>it.rows.splice(i,1));refill();focusRow(Math.max(0,i-1))}}),
        chips(r,e=>metaPop(e.currentTarget,it,r,refill),r.done));ul.append(li)});
    bd.append(ttlInput(it,'Чек-лист'),progLine(it),ul,h('button',{className:'addrow',onclick:()=>{if(!selSet.has(it.id))setSel([it.id]);addRow(it.rows.length)}},'+ пункт'));break}
  case'kanban':{it.cols??=kcols();const grid=h('div',{className:'kb'});grid.style.gridTemplateColumns=`repeat(${it.cols.length},minmax(0,1fr))`;
    it.cols.forEach((col,ci)=>{const L=it.cols.length-1;const list=h('div');
      col.tasks.forEach((t,ti)=>{const mv=d=>()=>{const old=bd.querySelector(`[data-tid="${t.id}"]`)?.getBoundingClientRect();edit(it,()=>{col.tasks.splice(ti,1);it.cols[ci+d].tasks.push(t)});refill();
          const ne=bd.querySelector(`[data-tid="${t.id}"]`);flip(ne,old);if(ci+d===L&&ne)setTimeout(()=>burst(ne),300)};
        list.append(h('div',{className:'kt','data-tid':t.id},editableLine(t.text,v=>edit(it,()=>t.text=v),e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}}),
          h('div',{className:'kt-f'},chips(t,e=>metaPop(e.currentTarget,it,t,refill),ci===L),h('span',{className:'sp'}),
            ci>0?ibtn('left','Назад',mv(-1)):null,ci<L?ibtn('right','Дальше',mv(1)):null,ibtn('x','Удалить',()=>{edit(it,()=>col.tasks.splice(ti,1));refill()}))))});
      grid.append(h('div',{className:'kc'+(ci===L?' last':'')},
        h('div',{className:'kc-h'},editableLine(col.title,v=>edit(it,()=>col.title=v)),h('span',{className:'cnt'},col.tasks.length)),list,
        h('button',{className:'addrow',onclick:()=>{if(!selSet.has(it.id))setSel([it.id]);edit(it,()=>col.tasks.push({id:uid(),text:''}));refill();const ts=bd.querySelectorAll('.kc')[ci].querySelectorAll('.kt .rt');ts[ts.length-1]?.focus()}},'+ задача')))});
    bd.append(ttlInput(it,'Канбан'),progLine(it),grid);break}
  case'progress':{const s=h('select',{});const fillSel=()=>{s.textContent='';s.append(h('option',{value:'manual'},'Вручную (ползунок)'),h('option',{value:'all'},'Авто: все задачи доски'));
      for(const t of live(board()))if(t.type==='todo'||t.type==='kanban')s.append(h('option',{value:t.id},'Авто: «'+(t.title||TYPES[t.type].name)+'»'));s.value=it.mode||'manual';if(!s.value)s.value='manual'};
    fillSel();s.addEventListener('pointerdown',fillSel);s.addEventListener('focus',fillSel);s.onchange=()=>{edit(it,{mode:s.value});paintProgress()};
    bd.append(ttlInput(it,'Прогресс'),h('div',{className:'big'}),progLine(it),h('input',{type:'range',min:0,max:100,value:it.val||0,oninput:e=>{edit(it,{val:+e.target.value});paintProgress()}}),s);break}
  case'deadline':{const d=it.date?daysTo(it.date):null;
    const big=h('div',{className:'dl-big '+(d==null?'':d<0?'over':d<=3?'soon':'')},d==null?'—':d===0?'Сегодня':String(Math.abs(d)));
    const sub=h('div',{className:'dl-sub'},d==null?'Выберите дату':d===0?'дедлайн сегодня':d>0?plural(d,'день','дня','дней')+' до '+fmtDate(it.date):'просрочено на '+(-d)+' '+plural(-d,'день','дня','дней'));
    let p=0;if(it.date){const st=it.cat||it.at,en=dateOf(it.date).getTime()+864e5;p=clamp((now()-st)/Math.max(1,en-st),0,1)}
    bd.append(ttlInput(it,'Дедлайн'),big,sub,h('div',{className:'bar'},h('div',{className:'fill',style:`width:${p*100}%`})),
      h('input',{type:'date',className:'field',value:it.date||'',onchange:e=>{edit(it,{date:e.target.value});refill()}}));break}
  case'palette':fillPalette(it,el,bd,refill);break;
  case'timer':fillTimer(it,el,bd,refill);break;
  case'embed':fillEmbed(it,el,bd);break;
  case'audio':fillAudio(it,el,bd);break;
  case'shape':fillShape(it,el,bd,refill);break;
  case'chart':fillChart(it,el,bd,refill);break;
  case'gantt':fillGantt(it,el,bd);break;
  case'image':{const c=it.crop,box=h('div',{className:'imw'});box.style.aspectRatio=String(c?c.w/((it.ar||1)*c.h):1/(it.ar||1));
    const im=h('img',{className:'im',loading:'lazy',decoding:'async',draggable:false,alt:'',onload:()=>lensTick()});box.append(im);
    if(c)Object.assign(im.style,{position:'absolute',width:100/c.w+'%',maxWidth:'none',left:-c.x/c.w*100+'%',top:-c.y/c.h*100+'%',borderRadius:0});
    bd.addEventListener('dblclick',async()=>{const u=it.src||await imgURL(it.img);if(u)window.open(u,'_blank')});
    (it.src?Promise.resolve(it.src):imgURL(it.img)).then(u=>{if(u)im.src=u});
    bd.append(box,h('input',{className:'cap',value:it.cap||'',placeholder:'Подпись…',oninput:e=>edit(it,{cap:e.target.value})}));break}
  case'link':{let host='';try{host=new URL(it.url).hostname.replace(/^www\./,'')}catch{}
    const fav=h('span',{className:'fav',textContent:(host||'?')[0].toUpperCase()});fav.style.background=`hsl(${hashHue(host)} 55% 48%)`;
    bd.append(h('a',{className:'lk',href:/^https?:/i.test(it.url||'')?it.url:'#',target:'_blank',rel:'noopener'},fav,h('span',{className:'lt'},h('div',{},it.label||host||'Ссылка'),h('small',{},host))),
      h('input',{className:'ttl',value:it.label||'',placeholder:'Название ссылки',oninput:e=>edit(it,{label:e.target.value})}),
      h('input',{className:'url',value:it.url||'',placeholder:'https://…',onchange:e=>{edit(it,{url:e.target.value.trim()});refill()}}));break}
  }}

/* ================= перемещение и размер ================= */
function frameKids(f){const out=[];for(const k of live(board())){if(k===f||k.type==='frame')continue;const r=itemBox(k);const cx=k.type==='pin'?k.x:r.x+r.w/2,cy=k.type==='pin'?k.y:r.y+r.h/2;
  if(cx>f.x&&cx<f.x+f.w&&cy>f.y&&cy<f.y+(f.h||400))out.push(k)}return out}
function cardDown(e,id,el){const it=board()?.items[id];if(e.button===1){e.preventDefault();e.stopPropagation();startPan(e);return}if(!it||e.button===2||el.classList.contains('cropping'))return;
  if(e.pointerType==='touch'&&ptrs.size>=1&&!ptrs.has(e.pointerId))return;
  if(tool==='pin'||tool==='rope'){e.stopPropagation();startLink(e,id,'rope');return}
  if(tool==='arrow'){e.stopPropagation();startLink(e,id,'arrow');return}
  if(tool==='pen'){e.stopPropagation();startDraw(e,'pen');return}
  if(tool==='hand'||spaceDown){e.stopPropagation();startPan(e);return}
  if(e.shiftKey){e.preventDefault();toggleSel(id);return}
  if(it.type==='button'&&tool==='select'){e.preventDefault();if(!selSet.has(id))setSel([id]);startMove(e,()=>it.link?followLink(it.link):linkPop(el,[it]));return}
  const was=selSet.has(id)&&selSet.size===1;if(!selSet.has(id))setSel([id]);
  const t=e.target,inter=t.closest('button,input,select,textarea,a,label,[contenteditable],iframe,.hdl');
  if(inter&&getComputedStyle(inter).pointerEvents!=='none'&&!(was===false&&inter.matches('[contenteditable],input.ttl,input.cap,input.url')))return;
  if(was&&t.closest('.txt,.rt'))return;
  e.preventDefault();document.activeElement?.blur?.();startMove(e)}
let liveT=0;
function startMove(e,onClick){const B=board();const base=selItems().filter(i=>!i.locked);const set=new Map(base.map(i=>[i.id,i]));
  for(const i of base)if(i.type==='frame')for(const k of frameKids(i))set.set(k.id,k);
  for(const p of live(B))if(p.type==='pin'&&p.on&&set.has(p.on))set.set(p.id,p);
  const list=[...set.values()].map(it=>({it,el:elOf(it.id),x:it.x,y:it.y}));const sx=e.clientX,sy=e.clientY;let moved=false;
  const lp=e.pointerType==='touch'?setTimeout(()=>{if(!moved){endOp();showCardMenu(sx,sy)}},550):0;
  beginOp(e.pointerId,ev=>{const dx=(ev.clientX-sx)/view.s,dy=(ev.clientY-sy)/view.s;
    if(!moved){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;moved=true;clearTimeout(lp);snap(list.map(l=>l.it.id),true);
      for(const i of base)if(i.type!=='frame'&&i.type!=='pin'){i.z=++maxZ;const e2=elOf(i.id);if(e2){e2.style.zIndex=i.z+2;if(base.length<30)e2.classList.add('lift')}}document.body.classList.add('dragging')}
    for(const l of list){l.it.x=Math.round(l.x+dx);l.it.y=Math.round(l.y+dy);place(l.el,l.it)}
    drawLinks();updateSelUI();lensTick();if(now()-liveT>45){liveT=now();rtLive(list.map(l=>l.it))}},
  ()=>{clearTimeout(lp);document.body.classList.remove('dragging');for(const l of list)l.el?.classList.remove('lift');if(!moved){onClick?.();return}
    if(base.length===1&&base[0].type==='pin')attachPin(base[0]);
    for(const it of base)if(isSortable(it))dropToZone(it);
    for(const l of list)stamp(l.it);touch(B);scheduleDraw();updateSelUI()},
  ()=>{clearTimeout(lp);document.body.classList.remove('dragging');for(const l of list){l.el?.classList.remove('lift');l.it.x=l.x;l.it.y=l.y;place(l.el,l.it)}drawLinks();updateSelUI()})}
function startResize(e,dir,it){e.preventDefault();e.stopPropagation();const el=elOf(it.id);if(!el||it.locked)return;
  const o={fs:it.fs||(it.type==='sticky'?17:it.type==='heading'?34:it.type==='shape'?15:15),x:it.x,y:it.y,w:it.w||el.offsetWidth,h:it.h||el.offsetHeight,pts:it.pts&&JSON.parse(JSON.stringify(it.pts)),bend:it.bend&&[...it.bend]};const sx=e.clientX,sy=e.clientY,hasH=HAS_H.has(it.type);let moved=false;
  beginOp(e.pointerId,ev=>{const dx=(ev.clientX-sx)/view.s,dy=(ev.clientY-sy)/view.s;
    if(!moved){moved=true;snap([it.id],true);document.body.classList.add('dragging')}
    let w=o.w,hh=o.h;if(dir.includes('e'))w=o.w+dx;if(dir.includes('w'))w=o.w-dx;if(hasH){if(dir.includes('s'))hh=o.h+dy;if(dir.includes('n'))hh=o.h-dy}
    if(ev.shiftKey&&hasH&&dir.length===2){const k=Math.max(w/o.w,hh/o.h);w=o.w*k;hh=o.h*k}
    w=Math.max(minW(it),w);hh=Math.max(minH(it),hh);
    if(ev.altKey&&TXT_T.has(it.type)){it.fs=Math.max(6,Math.round(o.fs*w/o.w));const tt=el.querySelector('.txt');if(tt)tt.style.fontSize=it.fs+'px'}
    it.w=Math.round(w);it.x=Math.round(dir.includes('w')?o.x+o.w-w:o.x);if(hasH){it.h=Math.round(hh);it.y=Math.round(dir.includes('n')?o.y+o.h-hh:o.y)}
    if(it.type==='draw'){const kx=it.w/o.w,ky=it.h/o.h;it.pts=o.pts.map(p=>[+(p[0]*kx).toFixed(1),+(p[1]*ky).toFixed(1)]);if(o.bend)it.bend=[o.bend[0]*kx,o.bend[1]*ky];el.replaceChildren(drawSvg(it))}
    place(el,it);if(it.type==='shape')refreshShape(el,it);if(it.type==='lens')fillLens(it,el);lensTick();drawLinks();updateSelUI();if(now()-liveT>45){liveT=now();rtLive([it])}},
  ()=>{document.body.classList.remove('dragging');if(moved){stamp(it);touch(board());scheduleDraw();if(it.type==='gantt')refreshAuto(el,it)}},()=>document.body.classList.remove('dragging'))}
function nudge(dx,dy){const its=selItems();if(!its.length)return;snap(its.map(i=>i.id));for(const i of its){i.x+=dx;i.y+=dy;place(elOf(i.id),i);stamp(i)}touch(board());drawLinks();updateSelUI()}

/* ================= рисование, пины, связи ================= */
function rdp(pts,eps){if(pts.length<3)return pts;const[a,b]=[pts[0],pts[pts.length-1]];let mi=0,md=0;const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
  for(let i=1;i<pts.length-1;i++){const d=Math.abs((b[1]-a[1])*pts[i][0]-(b[0]-a[0])*pts[i][1]+b[0]*a[1]-b[1]*a[0])/L;if(d>md){md=d;mi=i}}
  return md>eps?[...rdp(pts.slice(0,mi+1),eps).slice(0,-1),...rdp(pts.slice(mi),eps)]:[a,b]}
function startDraw(e,kind){e.preventDefault();const p0=toWorld(e.clientX,e.clientY);let pts=[[p0.x,p0.y]];const color=ink.color,size=ink.size;
  const path=document.createElementNS(NS,'path');path.setAttribute('class','dpath');path.style.stroke=inkCss(color);path.style.strokeWidth=size;draft.append(path);
  beginOp(e.pointerId,ev=>{const p=toWorld(ev.clientX,ev.clientY);
    if(kind==='pen'){const l=pts[pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])>1.5/view.s)pts.push([p.x,p.y]);path.setAttribute('d',pathD(pts,true))}
    else{let q=[p.x,p.y];if(ev.shiftKey){const a=Math.round(Math.atan2(q[1]-pts[0][1],q[0]-pts[0][0])/(Math.PI/4))*Math.PI/4,l=Math.hypot(q[0]-pts[0][0],q[1]-pts[0][1]);q=[pts[0][0]+l*Math.cos(a),pts[0][1]+l*Math.sin(a)]}
      pts=[pts[0],q];path.setAttribute('d',pathD(pts)+headD(...pts[0],...pts[1],8+size*2.5))}},
  ()=>{path.remove();if(pts.length<2)return;const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);if(Math.max(...xs)-Math.min(...xs)<3&&Math.max(...ys)-Math.min(...ys)<3)return;
    if(kind==='pen')pts=rdp(pts,.45);addDraw(pts,kind==='pen'?'pen':'arrow',color,size)},()=>path.remove())}
function addDraw(pts,kind,color,size){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),pad=size*2+12;const x=Math.min(...xs)-pad,y=Math.min(...ys)-pad;
  return addItem({type:'draw',kind,color,size,w:Math.max(...xs)-x+pad,h:Math.max(...ys)-y+pad,pts:pts.map(p=>[+(p[0]-x).toFixed(1),+(p[1]-y).toFixed(1)]),noFocus:true,noSelect:true},x,y)}
function cardAt(p,skip){let best=null;for(const it of live(board())){if(it.type==='pin'||it.type==='draw'||it.id===skip)continue;const r=itemBox(it);
  if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h){const z=it.type==='frame'?-1:(it.z||1);if(!best||z>best.z)best={it,z}}}return best?.it}
function pinData(p,card,color){const d={type:'pin',color:color||(ink.color==='auto'?'#ef4444':ink.color),noFocus:true,noSelect:true};if(card){d.on=card.id;d.dx=Math.round(p.x-card.x);d.dy=Math.round(p.y-card.y)}return d}
function placePin(e,card){e.preventDefault();const p=toWorld(e.clientX,e.clientY);batch(()=>addItem(pinData(p,card||cardAt(p)),p.x,p.y))}
function attachPin(pin){const c=cardAt({x:pin.x,y:pin.y},pin.id);if(c){pin.on=c.id;pin.dx=pin.x-c.x;pin.dy=pin.y-c.y}else delete pin.on}
function anchorOf(id,toward){const it=board().items[id],el=elOf(id);if(!it||!el)return null;if(it.type==='pin')return{x:it.x,y:it.y-23};
  const r={x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight};r.cx=r.x+r.w/2;r.cy=r.y+r.h/2;if(!toward)return{x:r.cx,y:r.cy};
  const dx=toward.x-r.cx,dy=toward.y-r.cy;if(!dx&&!dy)return{x:r.cx,y:r.cy};const t=Math.min((r.w/2+6)/Math.abs(dx),(r.h/2+6)/Math.abs(dy));return{x:r.cx+dx*t,y:r.cy+dy*t}}
const sagOf=(a,b,k=1)=>clamp(Math.hypot(b.x-a.x,b.y-a.y)*.2,14,170)*k;
const ropeD=(a,b,m)=>`M${a.x} ${a.y}Q${2*m.x-(a.x+b.x)/2} ${2*m.y-(a.y+b.y)/2} ${b.x} ${b.y}`;
function startLink(e,fromId,style){e.preventDefault();const B=board();const start=toWorld(e.clientX,e.clientY);const color=ink.color==='auto'?(style==='rope'?'#ef4444':'auto'):ink.color;
  const path=document.createElementNS(NS,'path');path.setAttribute('class',style==='rope'?'rope':'ln');path.style.stroke=inkCss(color);draft.append(path);
  beginOp(e.pointerId,ev=>{const p=toWorld(ev.clientX,ev.clientY);const a=fromId?anchorOf(fromId,p):start;
    if(style==='rope'){const m={x:(a.x+p.x)/2,y:(a.y+p.y)/2+sagOf(a,p)};path.setAttribute('d',ropeD(a,p,m))}else path.setAttribute('d',`M${a.x} ${a.y}L${p.x} ${p.y}`+headD(a.x,a.y,p.x,p.y))},
  ev=>{path.remove();const p=toWorld(ev.clientX,ev.clientY);const moved=Math.hypot(p.x-start.x,p.y-start.y)>8/view.s;
    let toEl=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.card');let toId=toEl?.dataset.id;if(toId===fromId)toId=null;
    if(style==='arrow'){if(fromId&&toId)batch(()=>addConn(fromId,toId,'arrow',color));
      else if(fromId&&moved){batch(()=>{const n=addItem({type:'sticky',noFocus:false},p.x-100,p.y-60);addConn(fromId,n.id,'arrow',color)})}return}
    if(!moved){if(!fromId||B.items[fromId]?.type!=='pin')batch(()=>addItem(pinData(start,fromId?B.items[fromId]:cardAt(start),color),start.x,start.y));return}
    batch(()=>{let a=fromId,z=toId;
      if(!a||B.items[a].type!=='pin')a=addItem(pinData(start,a?B.items[a]:cardAt(start),color),start.x,start.y).id;
      if(!z||B.items[z].type!=='pin')z=addItem(pinData(p,z?B.items[z]:cardAt(p),color),p.x,p.y).id;
      addConn(a,z,'rope',color)})},()=>path.remove())}
const newConns=new Set();
function addConn(a,b,style='arrow',color){const B=board();if(hidden(B,'_conn').some(c=>(c.from===a&&c.to===b)||(c.from===b&&c.to===a)))return toast('Уже связаны');
  const c={id:uid(),type:'_conn',from:a,to:b,style,color:color||'auto'};snap([c.id],true);put(B,c);stamp(c);touch(B);newConns.add(c.id);setTimeout(()=>newConns.delete(c.id),700);drawLinks();return c}
let drawR=0;const spring={},connMid={};
function drawLinks(){if(!drawR)drawR=requestAnimationFrame(drawNow)}
const connLabel=(c,m)=>c.label?`<text class="clabel" x="${m.x}" y="${m.y-8}" text-anchor="middle">${esc(c.label)}</text>`:'';
function drawNow(){drawR=0;const b=board();if(!b)return;let s1='',s2='',again=false;
  for(const c of hidden(b,'_conn')){const A=b.items[c.from],Z=b.items[c.to];if(!A||!Z||A.del||Z.del||!elOf(c.from)||!elOf(c.to))continue;
    const ca=anchorOf(c.from),cz=anchorOf(c.to),sm={x:(ca.x+cz.x)/2,y:(ca.y+cz.y)/2};
    const col=c.color&&c.color!=='auto'?c.color:'';const cls=(selConn===c.id?'sel ':'')+(newConns.has(c.id)?'new':'');const dash=c.dash?';stroke-dasharray:8 7':'';
    if(c.style==='rope'){const t=c.bend?{x:sm.x+c.bend.x,y:sm.y+c.bend.y}:{x:sm.x,y:sm.y+sagOf(ca,cz,c.slack||1)};let st=spring[c.id];
      if(!st)st=spring[c.id]=newConns.has(c.id)?{x:t.x,y:sm.y,vx:0,vy:0}:{x:t.x,y:t.y,vx:0,vy:0};
      st.vx=(st.vx+(t.x-st.x)*.09)*.86;st.vy=(st.vy+(t.y-st.y)*.09)*.86;st.x+=st.vx;st.y+=st.vy;
      if(Math.abs(st.vx)+Math.abs(st.vy)>.03||Math.hypot(t.x-st.x,t.y-st.y)>.08)again=true;else{st.x=t.x;st.y=t.y}
      const p=anchorOf(c.from,st),q=anchorOf(c.to,st);const d=ropeD(p,q,st);connMid[c.id]={x:st.x,y:st.y,sm};
      s2+=`<g data-id="${c.id}" class="${cls}"><path class="rope-sh" d="${d}"/><path class="rope" pathLength="1" d="${d}" style="stroke:${col||'#ef4444'}${dash}"/><path class="hit" d="${d}"/>${connLabel(c,st)}</g>`}
    else{let d,m,head=c.head||'end';
      if(c.bend){m={x:sm.x+c.bend.x,y:sm.y+c.bend.y};const p=anchorOf(c.from,m),q=anchorOf(c.to,m),k={x:2*m.x-(p.x+q.x)/2,y:2*m.y-(p.y+q.y)/2};
        d=`M${p.x} ${p.y}Q${k.x} ${k.y} ${q.x} ${q.y}`+(head!=='none'?headD(k.x,k.y,q.x,q.y):'')+(head==='both'?headD(k.x,k.y,p.x,p.y):'')}
      else{const p=anchorOf(c.from,cz),q=anchorOf(c.to,ca);const dx=q.x-p.x,dy=q.y-p.y,hz=Math.abs(dx)>Math.abs(dy);const c1={x:hz?p.x+dx/2:p.x,y:hz?p.y:p.y+dy/2},c2={x:hz?q.x-dx/2:q.x,y:hz?q.y:q.y-dy/2};
        d=`M${p.x} ${p.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${q.x} ${q.y}`+(head!=='none'?headD(c2.x,c2.y,q.x,q.y):'')+(head==='both'?headD(c1.x,c1.y,p.x,p.y):'');m={x:(p.x+3*c1.x+3*c2.x+q.x)/8,y:(p.y+3*c1.y+3*c2.y+q.y)/8}}
      connMid[c.id]={x:m.x,y:m.y,sm};
      s1+=`<g data-id="${c.id}" class="${cls}"><path class="ln" pathLength="1" d="${d}" style="stroke:${col||'currentColor'}${dash}"/><path class="hit" d="${d}"/>${connLabel(c,m)}</g>`}}
  svg.innerHTML=s1;ropesSvg.innerHTML=s2;updateSelUI();if(again)drawLinks()}
const bendH=$('#bendh');
function bendTarget(){if(selConn)return board()?.items[selConn];const s=selItems();return s.length===1&&s[0].type==='draw'&&s[0].pts?.length===2?s[0]:null}
bendH.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const t=bendTarget();if(!t)return;const isConn=!!selConn;let moved=false;
  beginOp(e.pointerId,ev=>{const p=toWorld(ev.clientX,ev.clientY);if(!moved){moved=true;snap([t.id],true);document.body.classList.add('dragging')}
    if(isConn){const sm=connMid[t.id]?.sm;if(!sm)return;t.bend={x:Math.round(p.x-sm.x),y:Math.round(p.y-sm.y)};if(spring[t.id])Object.assign(spring[t.id],{x:p.x,y:p.y,vx:0,vy:0})}
    else{t.bend=[+(p.x-t.x).toFixed(1),+(p.y-t.y).toFixed(1)];elOf(t.id)?.replaceChildren(drawSvg(t))}
    drawLinks();updateSelUI()},()=>{document.body.classList.remove('dragging');if(moved){stamp(t);touch(board())}},()=>document.body.classList.remove('dragging'))});
bendH.addEventListener('dblclick',e=>{e.stopPropagation();const t=bendTarget();if(!t)return;snap([t.id],true);delete t.bend;stamp(t);touch(board());if(t.type==='draw')elOf(t.id)?.replaceChildren(drawSvg(t));drawLinks()});
for(const s of[svg,ropesSvg])s.addEventListener('pointerdown',e=>{const g=e.target.closest('g[data-id]');if(!g||tool!=='select')return;e.stopPropagation();e.preventDefault();
  setSel([]);selConn=g.dataset.id;buildCtx();drawLinks()});

/* ================= рендер доски ================= */
function renderBoard(soft){const b=board();if(!b){cardsEl.textContent='';return}
  if(document.activeElement!==titleIn)titleIn.value=b.title;
  const vis=live(b);maxZ=Math.max(1,...vis.map(i=>i.z||1));
  const keep=soft?document.activeElement?.closest?.('.card'):null;const els={};for(const e of[...cardsEl.children])els[e.dataset.id]=e;
  for(const it of vis){const old=els[it.id];delete els[it.id];if(old&&old===keep){place(old,it);old.dataset.stale=1;continue}const n=renderItem(it);old?old.replaceWith(n):cardsEl.append(n)}
  for(const e of Object.values(els))e.remove();
  const ok=[...selSet].filter(id=>b.items[id]&&!b.items[id].del);if(ok.length!==selSet.size)setSel(ok);else buildSel();
  paintAll();updatePeople()}
cardsEl.addEventListener('focusout',e=>{const c=e.target.closest?.('.card');if(c?.dataset.stale&&!c.contains(e.relatedTarget)){delete c.dataset.stale;setTimeout(()=>rerenderCard(c.dataset.id),0)}});
function paintProgress(){const b=board();if(!b)return;
  for(const el of cardsEl.children){const it=b.items[el.dataset.id];if(!it)continue;
    if(it.type==='gantt'||(it.type==='chart'&&it.src&&it.src!=='manual')){refreshAuto(el,it);continue}
    if(!['todo','kanban','progress'].includes(it.type))continue;
    const p=progressOf(it,b),f=el.querySelector('.fill'),t=el.querySelector('.pct'),prev=el._p;el._p=p;
    if(f){f.style.width=(p*100).toFixed(1)+'%';if(prev!=null&&p>prev+.001){f.classList.remove('bump');void f.offsetWidth;f.classList.add('bump')}}
    if(t)tweenNum(t,Math.round(p*100),'%',el);
    if(prev!=null&&prev<.999&&p>=.999&&el.style.visibility!=='hidden')celebrate(el);
    if(it.type==='progress'){const r=el.querySelector('input[type=range]');if(r){r.hidden=(it.mode||'manual')!=='manual';r.value=it.val||0}const bg=el.querySelector('.big');if(bg)tweenNum(bg,Math.round(p*100),'%',el._bs??={})}}
  if(!$('#drawer').hidden)renderBoardList()}
function paintAll(){scheduleMinimap();emptyHint();paintProgress();paintMeta();drawLinks();refreshWins();scheduleCull();zoneCounts();lensTick()}
function zoneCounts(){const b=board();if(!b)return;for(const f of live(b)){if(f.type!=='frame'||!(f.prio||f.inbox))continue;const z=elOf(f.id)?.querySelector('.zc');if(z)z.textContent=frameKids(f).filter(isSortable).length}}
function zoneAt(it){const r=itemBox(it),cx=r.x+r.w/2,cy=r.y+Math.min(r.h/2,60);return live(board()).find(f=>f.type==='frame'&&(f.prio||f.inbox)&&cx>f.x&&cx<f.x+f.w&&cy>f.y&&cy<f.y+f.h)}
function dropToZone(it){const z=zoneAt(it);if(!z)return;const np=z.inbox?undefined:z.prio;if((it.prio||undefined)===np)return;if(np)it.prio=np;else delete it.prio;stamp(it);const el=elOf(it.id);if(el){const n=renderItem(it);el.replaceWith(n);if(np)burst(n)}}
let drawT;function scheduleDraw(){drawLinks();clearTimeout(drawT);drawT=setTimeout(()=>{paintMeta();refreshWins();zoneCounts();if(!$('#drawer').hidden)renderBoardList()},500)}
function updatePeople(){const names=new Set();if(me())names.add(me());
  for(const b of Object.values(boards))for(const i of Object.values(b.items)){if(i.by)names.add(i.by);if(i.who)names.add(i.who);
    for(const r of i.rows||[])if(r.who)names.add(r.who);for(const c of i.cols||[])for(const t of c.tasks)if(t.who)names.add(t.who)}
  $('#peopleList').replaceChildren(...[...names].map(n=>h('option',{value:n})));
  const b=board();const p=$('#people');p.textContent='';if(!b)return;const online=new Set([...RT.peers.values()].filter(x=>x.dc?.readyState==='open').map(x=>x.name||'Гость'));
  const last={};for(const i of Object.values(b.items))if(i.by)last[i.by]=Math.max(last[i.by]||0,i.at||0);for(const n of online)last[n]=now();
  const list=Object.entries(last).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(list.length>1||online.size||(list.length&&list[0][0]!==me()))for(const[n,t]of list){const a=avatar(n,28);if(online.has(n)){a.classList.add('on');a.title=n+' · сейчас на доске'}else a.title=n+' · '+ago(t);p.append(a)}}
function openBoard(id){cur=id;localStorage.cur=id;selSet=new Set();selConn=null;cancelOp();try{view=JSON.parse(localStorage['view:'+id])}catch{view=null}
  needFit=!view;if(!view)view={x:0,y:0,s:1};tv=null;cardsEl.textContent='';applyView();renderBoard();fitView();closeDrawer();renderCrumbs();adoptFromLinks(board());$('#backBtn').hidden=!navStack.length;for(const k of Object.keys(wins))if(k!=='ai'&&k!=='inspire')renderWin(k);rtCursorsClear()}
function focusCard(id){const it=board()?.items[id];const el=elOf(id);if(!it||!el)return;
  animateTo({s:view.s,x:vp.clientWidth/2-(el.offsetLeft+el.offsetWidth/2)*view.s,y:vp.clientHeight/2-(el.offsetTop+el.offsetHeight/2)*view.s});setSel([id]);
  el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}

/* ================= добавление и удаление ================= */
function mk(d,x,y){const t=TYPES[d.type];const it={id:uid(),c:0,...defaults(d.type),...d,w:d.w||t?.w||260,x:Math.round(x),y:Math.round(y),z:++maxZ,cat:now()};
  if(HAS_H.has(d.type))it.h=d.h||t?.h||300;delete it.noFocus;delete it.noSelect;it.at=now();if(me())it.by=me();return it}
function addItem(d,x,y){const b=board();const w=d.w||TYPES[d.type]?.w||260;
  if(x==null){const c=center();x=c.x-w/2+(Math.random()*40-20);y=c.y-120+(Math.random()*40-20)}
  const it=mk(d,x,y);snap([it.id],true);put(b,it);touch(b);const el=renderItem(it);el.classList.add('enter');el.addEventListener('animationend',()=>el.classList.remove('enter'),{once:true});cardsEl.append(el);
  if(!d.noSelect)setSel([it.id]);paintAll();
  const f=el.querySelector('.txt,.ttl,.rt');if(f&&!d.noFocus&&!['image','palette','embed','timer','draw','pin'].includes(d.type)){f.focus();if(f.isContentEditable)placeEnd(f)}return it}
function leaveRemove(el){if(!el)return;el.classList.add('leave');setTimeout(()=>el.remove(),190)}
function deleteSel(){const B=board();if(selConn){const c=B.items[selConn];snap([c.id],true);tomb(B,c.id);touch(B);selConn=null;buildCtx();drawLinks();toast('Связь удалена',{label:'Отменить',fn:undo});return}
  const base=selItems().filter(i=>!i.locked);if(!base.length)return selItems().length&&toast('Карточка закреплена — снимите замок, чтобы удалить');const ids=new Set(base.map(i=>i.id));let kids=0;
  for(const i of base)if(i.type==='frame')for(const k of frameKids(i)){if(!ids.has(k.id))kids++;ids.add(k.id)}
  for(const p of live(B))if(p.type==='pin'&&p.on&&ids.has(p.on))ids.add(p.id);
  for(const c of hidden(B,'_conn'))if(ids.has(c.from)||ids.has(c.to))ids.add(c.id);
  snap([...ids],true);for(const id of ids){players[id]?.a.pause();tomb(B,id);leaveRemove(elOf(id))}touch(B);setSel([]);paintAll();
  toast(base.length===1&&!kids?`${TYPES[base[0].type]?.name||'Карточка'} удалена`:`Удалено объектов: ${base.length+kids}`,{label:'Отменить',fn:undo})}
function cloneItems(items,dx,dy){const map={};const out=[];for(const it of items){const c=JSON.parse(JSON.stringify(it));map[it.id]=c.id=uid();(c.rows||[]).forEach(r=>r.id=uid());(c.cols||[]).forEach(k=>{k.id=uid();k.tasks.forEach(t=>t.id=uid())});out.push(c)}
  for(const c of out){if(c.on)c.on=map[c.on]||undefined;if(c.type==='_conn'){c.from=map[c.from];c.to=map[c.to]}if(c.x!=null){c.x+=dx;c.y+=dy}}return out.filter(c=>c.type!=='_conn'||(c.from&&c.to))}
function insertClones(list){const B=board();const ids=[];batch(()=>{for(const c of list){snap([c.id],true);if(c.type!=='_conn')c.z=++maxZ;stamp(c);put(B,c);if(c.type[0]!=='_'){const el=renderItem(c);el.classList.add('enter');cardsEl.append(el);ids.push(c.id)}}});
  touch(B);setSel(ids);paintAll()}
function dupSel(){const B=board();const its=selItems();if(!its.length)return;const ids=new Set(its.map(i=>i.id));const conns=hidden(B,'_conn').filter(c=>ids.has(c.from)&&ids.has(c.to));insertClones(cloneItems([...its,...conns],30,30))}
function toFront(){const its=selItems();snap(its.map(i=>i.id),true);for(const i of its)if(i.type!=='frame'){i.z=++maxZ;place(elOf(i.id),i);stamp(i)}touch(board())}
function toBack(){const its=selItems();snap(its.map(i=>i.id),true);const mn=Math.min(...live(board()).map(i=>i.z||1));for(const i of its)if(i.type!=='frame'){i.z=mn-1;place(elOf(i.id),i);stamp(i)}touch(board())}
function groupSel(){const its=selItems().filter(i=>i.type!=='frame');if(!its.length)return;const r=bounds(its),pad=40;
  batch(()=>addItem({type:'frame',title:'Раздел',w:Math.round(r.w+pad*2),h:Math.round(r.h+pad*2+30),noFocus:false},r.x-pad,r.y-pad-30))}

/* ================= инструменты, док ================= */
const TOOL_HINTS={hand:'Рука — двигайте холст · Esc — выход',pen:'Карандаш — рисуйте мышью или пальцем · Shift — прямые · Esc — выход',
  arrow:'Стрелка: от карточки к карточке — связь; от карточки в пустоту — новый стикер; на пустом месте — линия',
  pin:'Нажмите — пин · протяните от карточки или пина к другой — верёвка (пины появятся сами) · Esc — выход'};
function setTool(t){if(t==='rope')t='pin';tool=t;document.body.dataset.tool=t;for(const b of dock.querySelectorAll('[data-tool]'))b.classList.toggle('on',b.dataset.tool===t);
  const hn=$('#hint');if(TOOL_HINTS[t]){hn.textContent=TOOL_HINTS[t];hn.hidden=false}else hn.hidden=true;renderPenbar()}
function renderPenbar(){const pb=$('#penbar');if(!['pen','arrow','pin','rope'].includes(tool)){pb.hidden=true;return}pb.hidden=false;pb.textContent='';
  for(const c of INKS){const b=h('button',{className:'sw2'+(ink.color===c?' on':''),title:c==='auto'?'Цвет текста':c,onclick:()=>{ink.color=c;localStorage.ink=JSON.stringify(ink);renderPenbar()}});b.style.background=c==='auto'?'var(--tx)':c;pb.append(b)}
  if(tool==='pen'||tool==='arrow'){pb.append(h('span',{className:'sep'}));for(const s of[2,3,6,10]){const b=h('button',{className:'wd'+(ink.size===s?' on':''),title:'Толщина '+s,onclick:()=>{ink.size=s;localStorage.ink=JSON.stringify(ink);renderPenbar()}});const i=h('i');i.style.height=Math.max(2,s*.8)+'px';b.append(i);pb.append(b)}}}
const dock=$('#dock'),tipEl=$('#tip');
function tool_(icon,tip,fn,cls='',key){const b=h('button',{className:'tool '+cls,innerHTML:ic(icon,19),onclick:fn});b.dataset.tip=tip;if(key)b.dataset.tool=key;return b}
function buildDock(){dock.replaceChildren(
  tool_('cursor','Выделение (V)',()=>setTool('select'),'on','select'),tool_('hand','Рука (H, пробел)',()=>setTool('hand'),'','hand'),
  tool_('pen','Карандаш (P)',()=>setTool('pen'),'','pen'),tool_('arrow','Стрелка / связь (A)',()=>setTool('arrow'),'','arrow'),
  tool_('pin','Пин и верёвка (I): нажмите — пин, протяните — верёвка',()=>setTool('pin'),'','pin'),h('span',{className:'sep'}),
  tool_('bulb','Вдохновение',()=>openInspire(),'magic'),tool_('spark','ИИ-помощник',()=>openAI(),'ai'),h('span',{className:'sep'}),
  tool_('text','Текст без подложки (T)',()=>addOfType('text')),
  ...['sticky','note','todo','kanban','image','frame'].map(k=>tool_(TYPES[k].icon,TYPES[k].name+({sticky:' (N)',frame:' (F)'}[k]||''),()=>addOfType(k))),
  tool_('shapes','Фигуры, майнд-карта, диаграммы, таймлайн (D)',e=>diagramMenu(e.currentTarget)),
  tool_('plus','Ещё: прогресс, дедлайн, таймер, ссылка, заголовок…',e=>{const r=e.currentTarget.getBoundingClientRect();showAddMenu(r.left,r.top-8,null,true)}),h('span',{className:'sep'}),
  tool_('palette','Палитры',e=>paletteMenu(e.currentTarget)),tool_('apps','Приложения: музыка, видео, Pinterest, Figma…',e=>appsMenu(e.currentTarget)),h('span',{className:'sep'}),
  tool_('undo','Отменить (Ctrl+Z)',undo),tool_('redo','Вернуть (Ctrl+Shift+Z)',redo))}
document.addEventListener('pointerover',e=>{const t=e.target.closest?.('[data-tip]');if(!t||e.pointerType==='touch'){tipEl.style.opacity=0;return}
  tipEl.textContent=t.dataset.tip;const r=t.getBoundingClientRect();tipEl.style.opacity=1;tipEl.style.left=clamp(r.left+r.width/2-tipEl.offsetWidth/2,6,innerWidth-tipEl.offsetWidth-6)+'px';tipEl.style.top=(r.top-tipEl.offsetHeight-8)+'px'});

/* ================= меню и контекстная панель ================= */
function posPop(p,x,y){const r=p.getBoundingClientRect();p.style.left=clamp(x,8,innerWidth-r.width-8)+'px';p.style.top=clamp(y,8,innerHeight-r.height-8)+'px'}
function closePops(){document.querySelectorAll('.pop').forEach(p=>p.remove())}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.pop,.chips,#ctx,.tool,.win'))closePops()});
function menu(x,y,items,up){closePops();const m=h('div',{className:'pop glass'});
  for(const i of items){if(i==='-'){m.append(h('div',{className:'psep'}));continue}if(i.head){m.append(h('div',{className:'phd'},i.head));continue}
    m.append(h('button',{className:i.danger?'danger':'',innerHTML:ic(i.icon,17)+`<span>${esc(i.label)}${i.sub?`<small>${esc(i.sub)}</small>`:''}</span>`,onclick:()=>{closePops();i.fn()}}))}
  document.body.append(m);posPop(m,x,up?y-m.offsetHeight:y);return m}
function showAddMenu(x,y,at,up){menu(x,y,[{icon:'text',label:'Текст без подложки',fn:()=>addOfType('text',at)},{icon:'term',label:'ASCII-арт…',sub:'Галерея, текст и картинки в символы',fn:()=>asciiMenu(x,y,up)},...Object.entries(TYPES).filter(([k])=>!['draw','pin','embed'].includes(k)).map(([k,t])=>({icon:t.icon,label:t.name,fn:()=>addOfType(k,at)}))],up)}
function showCanvasMenu(x,y){const at=toWorld(x,y);menu(x,y,[{head:'Добавить'},...['sticky','note','todo','image','frame'].map(k=>({icon:TYPES[k].icon,label:TYPES[k].name,fn:()=>addOfType(k,at)})),
  {icon:'more',label:'Другие карточки…',fn:()=>showAddMenu(x,y,at)},'-',{icon:'check',label:'Сортировка по важности',sub:'Разложить по зонам',fn:arrangeZones},{icon:'term',label:'ASCII-арт…',fn:()=>asciiMenu(x,y)},
  {icon:'frame',label:'Показ разделов как слайдов',sub:'← → — листать, Esc — выход',fn:startPresent},
  {icon:'layer',label:document.body.classList.contains('hide-nope')?'Показать «Не нужно»':'Скрыть «Не нужно»',fn:toggleNope},'-',{icon:'cursor',label:'Выделить всё',fn:()=>setSel(live(board()).map(i=>i.id))},{icon:'fit',label:'Показать всё',fn:()=>fitView(true,true)}])}
function showCardMenu(x,y){const its=selItems();if(!its.length)return;const one=its.length===1?its[0]:null;
  menu(x,y,[{icon:'copy',label:'Дублировать',sub:'Ctrl+D',fn:dupSel},{icon:'front',label:'На передний план',fn:toFront},{icon:'front',label:'На задний план',fn:toBack},
    ...(its.length>1?[{icon:'frame',label:'Объединить в раздел',fn:groupSel}]:[]),
    ...(one&&!['draw','pin'].includes(one.type)?[{icon:'msg',label:'Обсудить',fn:()=>openComments(one.id)}]:[]),
    ...(one&&!['draw','pin','frame','shape','heading'].includes(one.type)&&!one.bare?[{icon:'edit',label:'Переименовать подпись «'+(one.hdr||TYPES[one.type]?.name)+'»',sub:'или двойной клик по ней',fn:()=>renameHdr(one)},
      {icon:'layer',label:one.nohdr?'Показать подпись над карточкой':'Скрыть подпись над карточкой',fn:()=>{snap([one.id],true);one.nohdr=!one.nohdr;if(!one.nohdr)delete one.nohdr;stamp(one);place(elOf(one.id),one);touch(board());updateSelUI()}}]:[]),
    {icon:'spark',label:'Спросить ИИ об этом',fn:()=>openAI({ids:its.map(i=>i.id)})},'-',{icon:'trash',label:'Удалить',sub:'Del',danger:true,fn:deleteSel}])}
function setPrio(its,p){const fr=its.filter(i=>i.type==='frame'),cs=its.filter(isSortable);snap(its.map(i=>i.id),true);
  for(const i of cs){if(p)i.prio=p;else delete i.prio;stamp(i);const el=elOf(i.id);if(el){const n=renderItem(i);el.replaceWith(n);if(p)burst(n)}}
  for(const f of fr){delete f.inbox;if(p==='inbox'){f.inbox=true;delete f.prio}else if(p){f.prio=p;f.c={must:2,should:1,nope:0}[p];if(!f.title)f.title=PRIO[p].l}else delete f.prio;stamp(f);elOf(f.id)?.replaceWith(renderItem(f))}
  touch(board());buildSel();paintAll()}
function prioMenu(a,its){const r=a.getBoundingClientRect();const fr=its.length===1&&its[0].type==='frame';
  menu(r.left,r.bottom+6,[...Object.entries(PRIO).map(([k,v])=>({icon:'check',label:(fr?'Зона: ':'')+v.l,sub:fr?'Карточки, перенесённые сюда, получат эту оценку':'Клавиша '+v.k,fn:()=>setPrio(its,k)})),
    ...(fr?[{icon:'check',label:'Зона: Разобрать',sub:'Карточки здесь теряют оценку',fn:()=>setPrio(its,'inbox')}]:[]),{icon:'x',label:fr?'Обычный раздел':'Без оценки',sub:fr?'':'Клавиша 0',fn:()=>setPrio(its,null)},
    '-',{icon:'kanban',label:'Разложить по зонам',sub:'Создаст зоны и разложит карточки по оценкам',fn:arrangeZones}])}
function colorPop(anchor,its,inkMode){closePops();const r=anchor.getBoundingClientRect();const list=inkMode?INKS:COLORS;
  const p=h('div',{className:'pop swatches glass'},...list.map((c,i)=>{const val=inkMode?c:i;const cur_=inkMode==='tc'?(its[0].tc||'auto'):inkMode?(its[0].color||'auto'):(its[0].c||0);
    const b=h('button',{className:cur_===val?'on':'',title:c?'':'Без цвета',onclick:()=>{const B=board();snap(its.map(x=>x.id),true);for(const it of its){if(inkMode==='tc'){it.tc=c;if(isAscii(it)){stripColors(it);if(it.asc){delete it.asc.g;if(!it.asc.anim||it.asc.anim==='none')delete it.asc}}}else if(inkMode)it.color=c;else it.c=i;stamp(it);
      if(it.type==='_conn')continue;const el=elOf(it.id);if(it.type==='draw'||it.type==='pin'||inkMode==='tc'||it.type==='shape')el.replaceWith(renderItem(it));else place(el,it)}touch(B);drawLinks();buildSel();closePops()}});
    b.style.background=inkMode?(c==='auto'?'var(--tx)':c):(c||'var(--card)');return b}));
  if(inkMode&&its.every(i=>i.type==='draw'))p.append(h('div',{style:'width:100%;display:flex;gap:4px'},...[2,3,6,10].map(s=>h('button',{className:'chip'+(its[0].size===s?' on':''),onclick:()=>{snap(its.map(x=>x.id),true);for(const it of its){it.size=s;stamp(it);elOf(it.id).replaceWith(renderItem(it))}touch(board());closePops()}},s+'px'))));
  document.body.append(p);posPop(p,r.left-60,r.bottom+8)}
function buildCtx(){const c=$('#ctx');c.textContent='';const B=board();if(!B)return;const sep=()=>h('span',{className:'vs'});const add=(...x)=>c.append(...x);
  if(selConn){const k=B.items[selConn];if(!k)return;const re=f=>()=>{edit(k,f);delete spring[k.id];buildCtx();drawLinks()};
    const HEADS={end:'both',both:'none',none:'end'};
    add(h('button',{className:'cb wide',innerHTML:ic(k.style==='rope'?'arrow':'rope',15)+(k.style==='rope'?'Стрелка':'Верёвка'),onclick:re(()=>k.style=k.style==='rope'?'arrow':'rope')}),
      k.style!=='rope'?ibtn('both',{end:'Наконечник: в конце → с двух сторон',both:'Наконечники: с двух сторон → без',none:'Без наконечников → в конце'}[k.head||'end'],re(()=>k.head=HEADS[k.head||'end'])):null,
      ibtn('dash',k.dash?'Сплошная':'Пунктир',re(()=>k.dash=!k.dash)),ibtn('label','Подпись',()=>{const t=prompt('Подпись на линии:',k.label||'');if(t!==null)re(()=>{if(t.trim())k.label=t.trim();else delete k.label})()}),
      ibtn('straight',k.style==='rope'?'Натянуть':'Выпрямить',re(()=>k.bend={x:0,y:0})),ibtn('bend','Изгиб по умолчанию (двойной клик по точке)',re(()=>delete k.bend)),
      ibtn('drop','Цвет',e=>colorPop(e.currentTarget,[k],true)),sep(),ibtn('trash','Удалить (Del)',deleteSel));updateSelUI();return}
  const its=selItems();if(!its.length){updateSelUI();return}const one=its.length===1?its[0]:null,T=one?.type;
  const setAll=(f)=>{snap(its.map(x=>x.id),true);for(const x of its){f(x);stamp(x);elOf(x.id)?.replaceWith(renderItem(x))}touch(B);buildSel();paintAll()};
  if(its.length>1&&its.every(x=>TXT_T.has(x.type)))add(ibtn('text','Текст: шрифт, размер, стиль',e=>textPop(e.currentTarget,its)),sep());
  if(its.every(isAscii))add(h('button',{className:'cb wide',title:'Цвет, градиент и анимация ASCII',innerHTML:ic('palette',15)+'ASCII',onclick:e=>{e.stopPropagation();ascPop(e.currentTarget,its)}}),sep());
  if(T==='note'||T==='shape'||T==='sticky'||T==='heading'){const el=elOf(one.id);if(T==='note')add(ibtn('bold','Жирный',()=>fmt(el,'bold')),ibtn('list','Список',()=>fmt(el,'insertUnorderedList')));
    add(h('button',{className:'cb wide',title:'Шрифт, размер, жирный, курсив, выравнивание, цвет',innerHTML:'<b style="font-size:15px">Aa</b>',onmousedown:e=>e.preventDefault(),onclick:e=>{e.stopPropagation();textPop(e.currentTarget,its)}}),sep())}
  if(T==='lens')add(h('button',{className:'cb wide',innerHTML:ic('search',15)+'×'+(+(one.zoom||2.2)).toFixed(1),title:'Увеличение',onclick:e=>{const r=e.currentTarget.getBoundingClientRect();menu(r.left,r.bottom+6,[1.5,2,3,4,6].map(z=>({icon:'search',label:'×'+z,fn:()=>setAll(x=>x.zoom=z)})))}}),
    h('button',{className:'cb wide',innerHTML:'Рыбий глаз',title:'Сила искажения',onclick:e=>{const r=e.currentTarget.getBoundingClientRect();menu(r.left,r.bottom+6,[[0,'Без искажения'],[.35,'Слабый'],[.6,'Средний'],[.95,'Сильный']].map(([f,l])=>({icon:'search',label:l,fn:()=>setAll(x=>x.fish=f)})))}}),sep());
  if(T==='button')add(ibtn('edit','Текст кнопки',()=>{const t=prompt('Текст на кнопке:',one.text||'');if(t!==null)setAll(x=>x.text=t.trim())}),ibtn('text','Шрифт кнопки',e=>textPop(e.currentTarget,its)),sep());
  if(T==='shape')add(ibtn('shapes','Форма',e=>{const r=e.currentTarget.getBoundingClientRect();menu(r.left,r.bottom+6,Object.entries(SHAPES).map(([k,l])=>({icon:'shapes',label:l,fn:()=>setAll(x=>x.kind=k)})))}),
    ibtn('layer',one.nofill?'Залить':'Без заливки',()=>setAll(x=>x.nofill=!x.nofill)),sep());
  if(its.every(x=>x.type==='note'||x.type==='image'))add(h('button',{className:'cb wide',title:'Подложка карточки',innerHTML:ic('layer',15)+(its[0].bare?'Подложка':'Без подложки'),onclick:()=>{const v=!its[0].bare;setAll(x=>{if(v)x.bare=true;else delete x.bare})}}),sep());
  if(T==='image')add(ibtn('dots',one.dot?'Настроить точечный арт':'Сделать точечный арт',()=>openDot({src:one.dot?.src||{type:'img',img:one.img,src:one.src,crop:one.crop},o:one.dot?.o,origin:one,target:one.dot?one.id:null})),ibtn('crop','Обрезать',()=>startCrop(one)),ibtn('term','В ASCII-арт',e=>{const r=e.currentTarget.getBoundingClientRect();asciiMenu(r.left,r.bottom+6)}),ibtn('palette','Палитра из картинки',()=>paletteFromImage(one)),ibtn('ext','Открыть',async()=>{const u=one.src||await imgURL(one.img);if(u)window.open(u,'_blank')}),sep());
  if(T==='embed'||T==='link')add(ibtn('ext','Открыть',()=>window.open(one.url,'_blank','noopener')),sep());
  const inkMode=its.every(i=>i.type==='draw'||i.type==='pin')?true:its.every(i=>i.bare&&i.type==='note')?'tc':false;add(ibtn('drop',inkMode==='tc'?'Цвет текста':'Цвет',e=>colorPop(e.currentTarget,its,inkMode)));
  if(its.some(isSortable)||T==='frame'){const pb=ibtn('check',T==='frame'?'Сделать зоной сортировки':'Важность (клавиши 1, 2, 3, 0)',e=>prioMenu(e.currentTarget,its));const pr=PRIO[one?.prio];if(pr&&T!=='frame'){pb.style.color=pr.c}add(pb)}
  if(!its.some(x=>x.type==='draw'||x.type==='pin'))add(ibtn('link',its[0].link?'Ссылка: '+linkLabel(its[0].link):'Ссылка на сайт или другую доску',e=>linkPop(e.currentTarget,its)));
  if(one&&!['draw','pin','frame','heading'].includes(T)){const cm=hidden(B,'_cmt').filter(x=>x.item===one.id).length,vs=hidden(B,'_vote').filter(x=>x.item===one.id),mine=vs.some(v=>v.by===me());
    const cbm=ibtn('msg','Обсудить',()=>openComments(one.id));if(cm)cbm.append(h('span',{className:'n'},cm));const vb=ibtn('thumb','Голосовать',()=>{toggleVote(one);buildCtx()});if(vs.length)vb.append(h('span',{className:'n'},vs.length));if(mine)vb.classList.add('on');add(cbm,vb)}
  if(its.length>1)add(ibtn('frame','Объединить в раздел',groupSel));
  if(its.length>1)add(ibtn('alignv','Выровнять и распределить',e=>alignMenu(e.currentTarget)));
  {const lk=its.every(x=>x.locked);add(ibtn(lk?'lock':'unlock',lk?'Открепить':'Закрепить (нельзя сдвинуть и удалить)',()=>{const v=!lk;setAll(x=>{if(v)x.locked=true;else delete x.locked})}))}
  add(ibtn('spark','Спросить ИИ',()=>openAI({ids:its.map(i=>i.id)})),sep(),ibtn('copy','Дублировать (Ctrl+D)',dupSel),ibtn('trash','Удалить (Del)',deleteSel),ibtn('more','Ещё',e=>{const r=e.currentTarget.getBoundingClientRect();showCardMenu(r.left,r.bottom+6)}));
  updateSelUI()}
function fmt(el,cmd){const t=el.querySelector('.txt');if(!t.contains(getSelection().anchorNode)){t.focus();placeEnd(t)}document.execCommand(cmd)}
function metaPop(anchor,it,o,after){closePops();const r=anchor.getBoundingClientRect();
  const d=h('input',{type:'date',value:o.due||''}),w=h('input',{placeholder:'Имя',value:o.who||'',list:'peopleList'});
  const done=()=>{p.remove();after()};
  const p=h('div',{className:'pop meta glass'},h('label',{},'Срок'),d,h('label',{},'Исполнитель'),w,
    h('div',{className:'row'},h('button',{className:'btn sm',onclick:()=>{edit(it,()=>{delete o.due;delete o.who});done()}},'Очистить'),
      h('button',{className:'btn pri sm',onclick:()=>{edit(it,()=>{o.due=d.value||undefined;o.who=w.value.trim()||undefined});done()}},'Готово')));
  w.addEventListener('keydown',e=>{if(e.key==='Enter')p.querySelector('.pri').click()});document.body.append(p);posPop(p,r.left,r.bottom+6)}

/* ================= всплывающие окна ================= */
const wins={};
function openWin(id,title,render,o={}){let w=wins[id];
  if(!w){w=h('div',{className:'win glass'});const hd=h('div',{className:'win-h'},h('b'),h('button',{className:'cb',innerHTML:ic('x',16),title:'Закрыть (Esc)',onclick:()=>closeWin(id)}));
    w.append(hd,h('div',{className:'win-b'}));document.body.append(w);wins[id]=w;
    hd.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const sx=e.clientX-w.offsetLeft,sy=e.clientY-w.offsetTop;
      beginOp(e.pointerId,ev=>{w.style.left=clamp(ev.clientX-sx,0,innerWidth-80)+'px';w.style.top=clamp(ev.clientY-sy,0,innerHeight-60)+'px'},()=>{})});
    const r=o.anchor;const W=Math.min(430,innerWidth-20);
    if(r){w.style.left=clamp(r.right+16,10,innerWidth-W-10)+'px';w.style.top=clamp(r.top,80,innerHeight-420)+'px'}else{w.style.left=(innerWidth-W-12)+'px';w.style.top='78px'}}
  w.querySelector('.win-h b').textContent=title;w._render=render;Object.assign(w,o.props||{});renderWin(id,true);return w}
function renderWin(id,force){const w=wins[id];if(!w)return;const b=w.querySelector('.win-b');if(!force&&w.contains(document.activeElement)&&/TEXTAREA|INPUT/.test(document.activeElement.tagName))return;const st=b.scrollTop;b.textContent='';w._render(b,w);b.scrollTop=st}
function closeWin(id){const w=wins[id];if(!w)return;delete wins[id];w.classList.add('closing');setTimeout(()=>w.remove(),170)}
function refreshWins(){for(const k of['tasks','activity','comments'])renderWin(k)}
let taskFilter='open';
function renderTasks(body){const b=board();if(!b)return;const all=allTasks(b),n=me()?.toLowerCase(),done=all.filter(t=>t.done).length;
  body.append(h('div',{className:'sum'},h('div',{className:'muted'},'Выполнено'),h('div',{},h('b',{},`${done}`),h('span',{className:'muted'},` из ${all.length}`)),h('div',{className:'bar',style:'margin-top:8px'},h('div',{className:'fill',style:`width:${ratio(all.map(t=>t.done))*100}%`}))));
  const F={open:['Открытые',t=>!t.done],mine:['Мои',t=>!t.done&&n&&t.who?.toLowerCase()===n],over:['Просрочено',t=>!t.done&&t.due&&daysTo(t.due)<0],week:['На неделе',t=>!t.done&&t.due&&daysTo(t.due)<=7],done:['Готово',t=>t.done]};
  body.append(h('div',{className:'filters'},...Object.entries(F).map(([k,[l,f]])=>h('button',{className:'chip'+(taskFilter===k?' on':''),onclick:()=>{taskFilter=k;renderWin('tasks',true)}},l+' '+all.filter(f).length))));
  const list=all.filter(F[taskFilter][1]).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
  if(!list.length)body.append(h('div',{className:'empty'},taskFilter==='mine'&&!me()?'Укажите своё имя в настройках, чтобы видеть свои задачи':'Здесь пусто'));
  for(const t of list)body.append(h('div',{className:'trow'+(t.done?' done':'')},h('input',{type:'checkbox',checked:t.done,onchange:()=>toggleTask(t)}),
    h('div',{className:'tx',onclick:()=>focusCard(t.card.id)},h('div',{},t.text||'Без названия'),h('small',{},t.where)),chips(t.ref,()=>focusCard(t.card.id),t.done)))}
function toggleTask(t){const it=t.card;if(t.kind==='todo')edit(it,()=>t.ref.done=!t.ref.done);
  else edit(it,()=>{const L=it.cols.length-1;it.cols[t.ci].tasks=it.cols[t.ci].tasks.filter(x=>x!==t.ref);it.cols[t.done?0:L].tasks.push(t.ref)});rerenderCard(it.id)}
function renderActivity(body){const b=board();if(!b)return;const list=Object.values(b.items).filter(i=>i.at&&i.type).sort((a,b)=>b.at-a.at).slice(0,80);
  if(!list.length)body.append(h('div',{className:'empty'},'Пока нет изменений'));
  for(const i of list){const target=i.item||i.from||i.on||i.id;const what=i.type==='_cmt'?'прокомментировал(а)':i.type==='_vote'?'проголосовал(а)':i.type==='_conn'?'связал(а) карточки':(i.cat&&i.at-i.cat<3000?'добавил(а)':'изменил(а)')+' · '+(TYPES[i.type]?.name||'').toLowerCase();
    body.append(h('div',{className:'arow',onclick:()=>focusCard(target)},avatar(i.by||'?',26),h('div',{className:'tx'},h('div',{},h('b',{},i.by||'Без имени'),' ',what),
      h('div',{className:'ex'},itemText(i)||(b.items[i.item]?cardLabel(b.items[i.item]):'')),h('small',{className:'muted'},ago(i.at)))))}}
function openComments(id){const el=elOf(id);openWin('comments','Обсуждение',renderComments,{anchor:el?.getBoundingClientRect(),props:{_card:id}});setTimeout(()=>wins.comments?.querySelector('textarea')?.focus(),60)}
function renderComments(body,w){const b=board();const it=b?.items[w._card];if(!it||it.del){body.append(h('div',{className:'empty'},'Выберите карточку на доске'));return}
  body.append(h('div',{className:'ctx2',onclick:()=>focusCard(it.id)},h('div',{className:'muted'},'Карточка'),h('div',{},cardLabel(it))));
  const list=hidden(b,'_cmt').filter(c=>c.item===it.id).sort((a,b)=>a.at-b.at);if(!list.length)body.append(h('div',{className:'empty'},'Комментариев пока нет — начните обсуждение'));
  for(const c of list)body.append(h('div',{className:'cmt'},avatar(c.by,28),h('div',{className:'tx'},h('div',{},h('b',{},c.by),' ',h('small',{className:'muted'},ago(c.at))),h('div',{className:'bub'},c.text)),
    (!c.by||c.by===me())?ibtn('trash','Удалить',()=>{snap([c.id],true);tomb(b,c.id);touch(b);paintMeta();renderWin('comments',true)}):null));
  const ta=h('textarea',{placeholder:'Комментарий… (Enter — отправить)',rows:1});const send=()=>{addComment(it.id,ta.value);ta.value='';renderWin('comments',true);wins.comments?.querySelector('textarea')?.focus()};
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
  body.append(h('div',{className:'cbox'},ta,h('button',{className:'btn pri',innerHTML:ic('send',16),onclick:send})))}

/* ================= голоса, комментарии ================= */
function needName(){if(me())return me();const n=(prompt('Как вас зовут? Имя увидят участники команды.')||'').trim();if(n){localStorage.myName=n;updatePeople()}return n}
const voteId=(it,n)=>'v_'+it.id+'_'+n.toLowerCase().replace(/[^a-zа-яё0-9]/gi,'_');
function toggleVote(it){const n=needName();if(!n)return;const b=board(),id=voteId(it,n),ex=b.items[id];snap([id],true);
  if(ex&&!ex.del)tomb(b,id);else{const v={id,type:'_vote',item:it.id,by:n};put(b,v);stamp(v)}touch(b);paintMeta();refreshWins()}
function addComment(itemId,text){const n=needName();if(!n||!text.trim())return;const c={id:uid(),type:'_cmt',item:itemId,text:text.trim(),by:n};const b=board();snap([c.id],true);put(b,c);stamp(c);touch(b);paintMeta();buildCtx()}
function paintMeta(){const b=board();if(!b)return;const votes={},cm={},mine={};
  for(const v of hidden(b,'_vote')){votes[v.item]=(votes[v.item]||0)+1;if(me()&&v.by===me())mine[v.item]=1}
  for(const c of hidden(b,'_cmt'))cm[c.item]=(cm[c.item]||0)+1;
  const team=new Set(Object.values(b.items).map(i=>i.by).filter(Boolean)).size>1;
  for(const el of cardsEl.children){const it=b.items[el.dataset.id];if(!it)continue;const ft=el.querySelector('.ft');if(!ft)continue;
    const key=`${votes[it.id]||0}|${cm[it.id]||0}|${mine[it.id]||0}|${it.by||''}|${team}|${it.by?ago(it.at):''}`;if(ft._k===key)continue;ft._k=key;ft.textContent='';
    if(votes[it.id])ft.append(h('span',{className:'badge'+(mine[it.id]?' on':''),innerHTML:ic('thumb',12)+votes[it.id],title:'Голоса',onclick:()=>toggleVote(it)}));
    if(cm[it.id])ft.append(h('span',{className:'badge',innerHTML:ic('msg',12)+cm[it.id],title:'Комментарии',onclick:()=>openComments(it.id)}));
    if(it.by&&(votes[it.id]||cm[it.id]||team))ft.append(h('span',{className:'sp'}),h('span',{className:'muted'},ago(it.at)),avatar(it.by,20))}}

/* ================= картинки ================= */
let pickAt=null;
async function storeImage(file){const bmp=await createImageBitmap(file);let w=bmp.width,hh=bmp.height;const k=Math.min(1,1600/Math.max(w,hh));w=Math.round(w*k);hh=Math.round(hh*k);
  const c=document.createElement('canvas');c.width=w;c.height=hh;c.getContext('2d').drawImage(bmp,0,0,w,hh);
  let blob=await new Promise(r=>c.toBlob(r,'image/webp',.86));if(!blob||blob.type!=='image/webp')blob=await new Promise(r=>c.toBlob(r,/png|gif|webp|svg/.test(file.type||'')?'image/png':'image/jpeg',.88));
  const hash=hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())).slice(0,32)+(blob.type==='image/webp'?'.webp':blob.type==='image/png'?'.png':'.jpg');
  await idb.put('images',hash,blob);return{img:hash,ar:hh/w,w:Math.min(300,w)}}
async function addImageFile(file,x,y){try{const d=await storeImage(file);return addItem({type:'image',cap:'',...d,bare:localStorage.imgPlate!=='1',noFocus:true},x,y)}catch(err){console.error(err);toast('Не удалось добавить картинку')}}
async function addImageURL(url,x,y){try{const r=await fetch(url,{mode:'cors'});if(!r.ok)throw 0;return await addImageFile(await r.blob(),x,y)}
  catch{const im=new Image();im.src=url;try{await im.decode()}catch{return null}return addItem({type:'image',src:url,ar:im.naturalHeight/im.naturalWidth||1,w:300,noFocus:true},x,y)}}
const MIME={webp:'image/webp',jpg:'image/jpeg',mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',flac:'audio/flac',aac:'audio/aac'};
const mimeOf=n=>MIME[n.split('.').pop().toLowerCase()]||'application/octet-stream';
const urlCache={};
async function imgURL(hash){if(!hash)return null;if(urlCache[hash])return urlCache[hash];let blob=await idb.get('images',hash);
  if(!blob&&cfg.token){try{const r=await gh('images/'+hash,{raw:true});if(r.ok){blob=new Blob([await r.blob()],{type:mimeOf(hash)});await idb.put('images',hash,blob);meta.uploaded[hash]=1;saveMeta()}}catch{}}
  return blob?(urlCache[hash]=URL.createObjectURL(blob)):null}
$('#filePick').onchange=async e=>{const files=[...e.target.files];e.target.value='';let p=pickAt;pickAt=null;for(const f of files){await addImageFile(f,p?.x,p?.y);if(p)p={x:p.x+30,y:p.y+30}}};
function addOfType(t,at){const x=at?.x,y=at?.y;
  if(t==='image'){pickAt=at;$('#filePick').click();return}
  if(t==='link'){const u=prompt('Адрес ссылки:','https://');if(!u||u==='https://')return;embedOrLink(u.trim(),x,y);return}
  if(t==='text'){addItem({type:'note',bare:true,fs:22,w:320,html:''},x,y);return}
  if(t==='button'){addButton(at);return}
  addItem({type:t},x,y)}
const isEditing=()=>{const a=document.activeElement;return a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))};
document.addEventListener('paste',e=>{if(!cur||document.querySelector('dialog[open]'))return;const cd=e.clipboardData;const files=[...(cd?.files||[])].filter(f=>f.type.startsWith('image/'));
  if(files.length){e.preventDefault();files.forEach(f=>addImageFile(f));return}
  const t=(cd?.getData('text/plain')||'').trim();
  if(t.startsWith('BOARDS1:')&&!isEditing()){e.preventDefault();try{const list=JSON.parse(t.slice(8));const c=center(),r=bounds(list.filter(i=>i.x!=null).map(i=>({...i,id:'_'})));insertClones(cloneItems(list,Math.round(c.x-r.x-r.w/2),Math.round(c.y-r.y-r.h/2)))}catch{}return}
  const ae=document.activeElement;if(isEditing()){if(ae.isContentEditable){e.preventDefault();document.execCommand('insertText',false,t)}return}
  if(!t)return;e.preventDefault();if(/^https?:\/\/\S+$/i.test(t))embedOrLink(t);else addItem({type:'sticky',text:t,noFocus:true})});
document.addEventListener('copy',e=>{if(isEditing()||!selSet.size)return;const B=board();const its=selItems();const ids=new Set(its.map(i=>i.id));
  const list=[...its,...hidden(B,'_conn').filter(c=>ids.has(c.from)&&ids.has(c.to))];e.clipboardData.setData('text/plain','BOARDS1:'+JSON.stringify(list));e.preventDefault();toast('Скопировано: '+its.length)});
document.addEventListener('cut',e=>{if(isEditing()||!selSet.size)return;const B=board();const its=selItems();const ids=new Set(its.map(i=>i.id));
  e.clipboardData.setData('text/plain','BOARDS1:'+JSON.stringify([...its,...hidden(B,'_conn').filter(c=>ids.has(c.from)&&ids.has(c.to))]));e.preventDefault();deleteSel()});
vp.addEventListener('dragover',e=>e.preventDefault());
vp.addEventListener('drop',e=>{e.preventDefault();if(!cur)return;let p=toWorld(e.clientX,e.clientY);const dt=e.dataTransfer;const au=[...dt.files].filter(f=>f.type.startsWith('audio/')||/\.(mp3|m4a|ogg|wav|flac|aac)$/i.test(f.name));if(au.length){au.forEach((f,i)=>addAudioFile(f,p.x+i*30,p.y+i*30));return}const files=[...dt.files].filter(f=>f.type.startsWith('image/'));
  if(files.length){(async()=>{for(const f of files){await addImageFile(f,p.x,p.y);p={x:p.x+30,y:p.y+30}}})();return}
  const html=dt.getData('text/html');const src=html&&new DOMParser().parseFromString(html,'text/html').querySelector('img')?.src;if(src&&/^https?:/.test(src)){addImageURL(src,p.x,p.y);return}
  if(files.length===0&&dt.files.length){const f=dt.files[0];if(/\.tldr$/i.test(f.name)){f.text().then(t=>importTldraw(JSON.parse(t),f.name.replace(/\.tldr$/i,'')));return}}
  const u=(dt.getData('text/uri-list')||dt.getData('text/plain')||'').trim().split('\n')[0];if(/^https?:\/\//i.test(u)){if(/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(u))addImageURL(u,p.x,p.y);else embedOrLink(u,p.x,p.y)}});

/* ================= проекты, поиск, настройки ================= */
function openDrawer(){renderBoardList();$('#drawer').hidden=$('#scrim').hidden=false}
function closeDrawer(){$('#drawer').hidden=$('#scrim').hidden=true}
function renderBoardList(){const l=$('#blist');l.textContent='';const all=Object.values(boards).filter(b=>!b.deleted);const byT=bOrder;
  const hideSubs=localStorage.hideSubs==='1';const col=new Set(JSON.parse(localStorage.collapsed||'[]'));const sb=$('#subsBtn');if(sb)sb.textContent=hideSubs?'Показать поддоски':'Скрыть поддоски';
  const isTop=b=>!b.parent||!boards[b.parent]||boards[b.parent].deleted;const kids={};for(const b of all)if(!isTop(b))(kids[b.parent]??=[]).push(b);
  const row=(b,depth)=>{const k=(kids[b.id]||[]).sort(byT);const p=boardProgress(b);const last=Math.max(0,...Object.values(b.items).map(i=>i.at||0),b.titleAt||0);const open=!col.has(b.id)&&!hideSubs;
    const caret=k.length?h('button',{className:'cb caret'+(open?' open':''),title:open?'Свернуть поддоски':'Развернуть поддоски',innerHTML:ic('chev',14),onclick:e=>{e.stopPropagation();
        if(hideSubs){localStorage.hideSubs='0';col.delete(b.id)}else if(col.has(b.id))col.delete(b.id);else col.add(b.id);localStorage.collapsed=JSON.stringify([...col]);renderBoardList()}}):h('span',{style:'width:26px;flex:none'});
    l.append(h('div',{className:'bi'+(b.id===cur?' on':'')+(depth?' sub':''),'data-bid':b.id,title:'Тяните: на другую доску — сделать поддоской, между досками — переставить, на холст — кнопка-ссылка',style:depth?`margin-left:${depth*16}px`:null,onclick:()=>{if(!blistSuppress)openBoard(b.id)},oncontextmenu:e=>{e.preventDefault();boardMenu(e.clientX,e.clientY,b)}},caret,
      h('div',{className:'nm'},h('div',{},b.title||'Без названия'),h('small',{},(k.length?`${k.length} ${plural(k.length,'поддоска','поддоски','поддосок')} · `:'')+(p?`${p.d} из ${p.n} задач · `:'')+ago(last)),p?h('div',{className:'bar'},h('div',{className:'fill',style:`width:${p.p*100}%`})):null),
      ibtn('more','Переименовать, сделать поддоской, удалить…',e=>{const r=e.currentTarget.getBoundingClientRect();boardMenu(r.left-150,r.bottom+4,b)})));
    if(open&&depth<6)for(const c of k)row(c,depth+1)};
  for(const b of all.filter(isTop).sort(byT))row(b,0)}
function createBoard(title,tplKey){const b={id:uid(),title,titleAt:now(),deleted:false,delAt:0,items:{},rev:0};boards[b.id]=b;
  for(const d of(TEMPLATES[tplKey]?.make()||[])){const it=mk(d,d.x,d.y);b.items[it.id]=it}touch(b);return b}
let qSel=0;
function openSearch(){$('#q').value='';runSearch();$('#search').showModal();$('#q').focus()}
function runSearch(){const q=$('#q').value.trim().toLowerCase(),res=[];
  for(const b of Object.values(boards)){if(b.deleted)continue;if(!q||(b.title||'').toLowerCase().includes(q))res.push({b,label:b.title||'Без названия',sub:'Проект',icon:'menu'});if(!q)continue;
    for(const i of Object.values(b.items)){if(i.del||!i.type)continue;const t=itemText(i);if(t.toLowerCase().includes(q)){const card=i.type==='_cmt'?b.items[i.item]:i;if(!card||card.del||card.type?.[0]==='_')continue;
      res.push({b,id:card.id,label:t.slice(0,90),sub:b.title+' · '+(i.type==='_cmt'?'комментарий':TYPES[card.type]?.name),icon:TYPES[card.type]?.icon||'msg'})}}}
  const box=$('#qres');box.textContent='';qSel=0;
  res.slice(0,40).forEach((r,i)=>box.append(h('div',{className:'qr'+(i===0?' on':''),onclick:()=>goRes(r)},h('span',{innerHTML:ic(r.icon,16),className:'muted'}),h('div',{className:'tx'},h('div',{},r.label),h('small',{className:'muted'},r.sub)))));
  if(!res.length)box.append(h('div',{className:'empty'},'Ничего не найдено'));box._res=res}
function goRes(r){$('#search').close();if(r.b.id!==cur)openBoard(r.b.id);if(r.id)setTimeout(()=>focusCard(r.id),40)}
const ser=b=>({id:b.id,title:b.title,titleAt:b.titleAt||0,deleted:!!b.deleted,delAt:b.delAt||0,parent:b.parent||null,parentAt:b.parentAt||0,order:b.order??null,items:b.items});
const blobToDataURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});

/* ================= слияние и синхронизация с GitHub ================= */
function mergeBoard(local,remote){if(!local)return{...remote,items:{...remote.items},rev:0};
  if((remote.titleAt||0)>(local.titleAt||0)){local.title=remote.title;local.titleAt=remote.titleAt}
  if((remote.delAt||0)>(local.delAt||0)){local.deleted=remote.deleted;local.delAt=remote.delAt}
  if((remote.parentAt||0)>(local.parentAt||0)){if(remote.parent)local.parent=remote.parent;else delete local.parent;local.parentAt=remote.parentAt;if(remote.order!=null)local.order=remote.order;else delete local.order}
  for(const[k,ri]of Object.entries(remote.items||{})){const li=local.items[k];if(!li||(ri.at||0)>(li.at||0)){if(li){for(const x of Object.keys(li))delete li[x];Object.assign(li,ri)}else local.items[k]=ri}}return local}
function sameAs(b,rb){if(b.title!==rb.title||(b.titleAt||0)!==(rb.titleAt||0)||(b.delAt||0)!==(rb.delAt||0))return false;
  const a=Object.keys(b.items),r=rb.items||{};if(a.length!==Object.keys(r).length)return false;return a.every(k=>r[k]&&(r[k].at||0)===(b.items[k].at||0))}
function gh(path,{raw,headers,...opt}={}){return fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${path}`,
  {cache:'no-store',...opt,headers:{Authorization:'Bearer '+cfg.token,Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...headers}})}
const sEl=$('#sync');
function setSync(st,msg){const liveN=[...RT.peers.values()].filter(p=>p.dc?.readyState==='open').length;sEl.className='ib '+(st==='ok'&&liveN?'live':st);
  sEl.title={off:'Синхронизация не настроена — нажмите, чтобы настроить',busy:'Синхронизация…',ok:(liveN?`В реальном времени с ${liveN} ${plural(liveN,'участником','участниками','участниками')} · `:'')+'Сохранено в GitHub '+new Date().toLocaleTimeString(),err:'Ошибка синхронизации: '+msg}[st];setSync.last=st}
let syncing=false,again=false,syncT,lastPush=0;
function scheduleSync(){clearTimeout(syncT);syncT=setTimeout(sync,Math.max(1500,lastPush+8000-now()))}
async function sync(){if(!cfg.token){setSync('off');return}if(syncing){again=true;return}syncing=true;setSync('busy');
  try{const r=await gh('boards');let list=[];if(r.ok)list=await r.json();else if(r.status!==404)throw new Error(r.status===401?'неверный токен':r.status===404?'репозиторий не найден':'GitHub '+r.status);
    const remote={};for(const f of list)if(f.name.endsWith('.json'))remote[f.name.slice(0,-5)]=f.sha;
    let changedCur=false;
    for(const id of new Set([...Object.keys(boards),...Object.keys(remote)]))if(await syncBoard(id,remote[id])&&id===cur)changedCur=true;
    if(!cur||!boards[cur]||boards[cur].deleted){const n=Object.values(boards).find(b=>!b.deleted);if(n)openBoard(n.id)}else if(changedCur)renderBoard(true);
    if(!$('#drawer').hidden)renderBoardList();updatePeople();setSync('ok');rtStart()}
  catch(e){console.error(e);setSync('err',e.message)}
  syncing=false;if(again){again=false;scheduleSync()}}
async function syncBoard(id,rsha,retry=0){let changed=false,b=boards[id],need;
  if(rsha&&rsha!==meta.sha[id]){const r=await gh(`boards/${id}.json`,{raw:true});if(!r.ok)throw new Error('загрузка доски '+r.status);
    const rb=await r.json();b=boards[id]=mergeBoard(boards[id],rb);meta.sha[id]=rsha;saveMeta();persist(b);changed=true;
    need=!sameAs(b,rb);if(!need)meta.pushed[id]=b.rev||0}
  else need=!!b&&(!rsha||(b.rev||0)!==(meta.pushed[id]||0));
  if(need&&b){await uploadImages(b);const rev=b.rev||0;const body={message:`${b.title||id}${me()?' — '+me():''}`,content:b64(enc(JSON.stringify(ser(b))))};if(rsha)body.sha=rsha;
    const r=await gh(`boards/${id}.json`,{method:'PUT',body:JSON.stringify(body)});
    if((r.status===409||r.status===422)&&retry<3){const g=await gh(`boards/${id}.json`);const sha=g.ok?(await g.json()).sha:undefined;return(await syncBoard(id,sha,retry+1))||changed}
    if(!r.ok)throw new Error('сохранение '+r.status);meta.sha[id]=(await r.json()).content.sha;meta.pushed[id]=rev;saveMeta();lastPush=now()}
  return changed}
async function uploadImages(b){for(const it of Object.values(b.items)){if((it.type!=='image'&&it.type!=='audio')||it.del||!it.img||meta.uploaded[it.img])continue;
  const blob=await idb.get('images',it.img);if(!blob)continue;
  const r=await gh('images/'+it.img,{method:'PUT',body:JSON.stringify({message:'image',content:b64(new Uint8Array(await blob.arrayBuffer()))})});
  if(r.ok||r.status===422){meta.uploaded[it.img]=1;saveMeta()}else throw new Error('загрузка картинки '+r.status)}}
const etags={};let pollN=0;
async function pollCur(){if(!cfg.token||document.visibilityState!=='visible'||syncing||!cur||setSync.last==='err')return;
  if(RT.peers.size&&(++pollN%4))return;
  try{const r=await gh(`boards/${cur}.json`,{headers:etags[cur]?{'If-None-Match':etags[cur]}:{}});if(r.status===304||!r.ok)return;etags[cur]=r.headers.get('ETag');
    const j=await r.json();if(j.sha&&j.sha!==meta.sha[cur])sync()}catch{}}
