'use strict';
/* ================= палитры ================= */
function hsl(hh,s,l){s/=100;l/=100;const k=n=>(n+hh/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')}
function hexToHsl(hx){const n=parseInt(hx.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let hh=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60}return{h:hh,s:s*100,l:l*100}}
const lum=hx=>{const n=parseInt(hx.slice(1),16);return(.299*(n>>16&255)+.587*(n>>8&255)+.114*(n&255))/255};
const SCHEMES={auto:'Любая гармония',analog:'Аналоговая',compl:'Комплементарная',triad:'Триада',split:'Сплит-комплемент',mono:'Монохром'};
const OFFS={analog:[0,25,50,-25,-50],compl:[0,180,15,195,-15],triad:[0,120,240,15,135],split:[0,150,210,30,330],mono:[0,0,0,0,0]};
function randomPalette(mode='auto',base){const m=mode==='auto'?pick(Object.keys(OFFS)):mode;const b=base??Math.random()*360;const L=[24,42,58,74,88],S=40+Math.random()*40;
  return OFFS[m].map((d,i)=>hsl(((b+d)%360+360)%360,m==='mono'?S*(.5+i*.15):clamp(S+(Math.random()*20-10),25,90),L[i]))}
function regenPalette(it){const lk=it.locks||[];const bi=lk.findIndex(Boolean);const base=bi>=0?hexToHsl(it.colors[bi]).h:undefined;const f=randomPalette(it.mode||'auto',base);
  it.colors=(it.colors.length?it.colors:f).map((c,i)=>lk[i]?c:f[i%5])}
function fillPalette(it,el,bd,refill){it.colors??=[];it.locks??=[];const row=h('div',{className:'sw'});
  it.colors.forEach((c,i)=>{const dark=lum(c)<.55;const s=h('div',{className:'s'+(it.locks[i]?' locked':''),style:`background:${c};color:${dark?'#fff':'#111'}`,title:'Нажмите, чтобы скопировать '+c.toUpperCase(),
      onclick:e=>{if(e.target.closest('button,label'))return;navigator.clipboard?.writeText(c.toUpperCase());toast('Скопировано '+c.toUpperCase())}},
    h('div',{className:'sbtns'},h('button',{className:'lockb',title:it.locks[i]?'Открепить':'Закрепить — не менять при обновлении',innerHTML:ic(it.locks[i]?'lock':'unlock',12),onclick:()=>{edit(it,()=>it.locks[i]=!it.locks[i]);refill()}}),
      h('label',{title:'Изменить цвет',style:'position:relative;width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:#0003;cursor:pointer',innerHTML:ic('edit',12)},
        h('input',{type:'color',className:'cpick',value:c,onchange:e=>{edit(it,()=>it.colors[i]=e.target.value);refill()}})),
      h('button',{title:'Убрать',innerHTML:ic('x',12),onclick:()=>{edit(it,()=>{it.colors.splice(i,1);it.locks.splice(i,1)});refill()}})),
    h('span',{className:'hx'},c.toUpperCase()));row.append(s)});
  const mode=h('select',{onchange:e=>edit(it,{mode:e.target.value})},...Object.entries(SCHEMES).map(([k,v])=>h('option',{value:k},v)));mode.value=it.mode||'auto';
  bd.append(ttlInput(it,'Палитра'),row,h('div',{className:'pl-a'},
    h('button',{className:'btn sm pri',innerHTML:ic('dice',14)+'Обновить',title:'Заменить незакреплённые цвета',onclick:()=>{edit(it,()=>regenPalette(it));refill()}}),mode,
    h('label',{className:'btn sm'},'+ цвет',h('input',{type:'color',className:'cpick',onchange:e=>{edit(it,()=>it.colors.push(e.target.value));refill()}})),
    h('button',{className:'btn sm',innerHTML:ic('css',14)+'CSS',title:'Скопировать как CSS-переменные',onclick:()=>{navigator.clipboard?.writeText(it.colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n'));toast('CSS-переменные скопированы')}})))}
function paletteMenu(btn){const r=btn.getBoundingClientRect();const img=selItems().find(i=>i.type==='image');
  menu(r.left,r.top-8,[{head:'Палитры'},{icon:'dice',label:'Случайная гармоничная',sub:'Обновляйте и закрепляйте понравившиеся цвета',fn:()=>addItem({type:'palette',title:'Палитра',noFocus:true},...spotNear())},
    {icon:'image',label:'Из картинки',sub:img?'Из выделенного референса':'Сначала выделите картинку на доске',fn:()=>img?paletteFromImage(img):toast('Выделите картинку-референс, затем нажмите снова')},
    {icon:'drop',label:'От своего цвета…',sub:'Подберу гармоничные оттенки',fn:()=>colorBase(r)},
    {icon:'spark',label:'По настроению (ИИ)…',sub:'«утро в Токио», «уютная осень»…',fn:()=>{const m=prompt('Опишите настроение или тему палитры:');if(m)aiPalette(m)}}],true)}
function colorBase(r){closePops();const inp=h('input',{type:'color',value:'#7c6cff',style:'width:100%;height:44px;border:0;background:none;padding:0;cursor:pointer'});
  const p=h('div',{className:'pop meta glass'},h('label',{},'Базовый цвет'),inp,h('label',{},'Схема'),
    h('div',{className:'svc'},...Object.entries(SCHEMES).map(([k,v])=>h('button',{className:'chip',onclick:()=>{closePops();const b=hexToHsl(inp.value).h;const cols=randomPalette(k,b);cols[2]=inp.value;
      addItem({type:'palette',title:v,colors:cols,mode:k,locks:[0,0,1,0,0].map(Boolean),noFocus:true},...spotNear())}},v))));
  document.body.append(p);posPop(p,r.left,r.top-p.offsetHeight-10)}
async function paletteFromImage(it){try{const u=it.src||await imgURL(it.img);if(!u)return;const im=new Image();im.crossOrigin='anonymous';im.src=u;await im.decode();
  const c=document.createElement('canvas');c.width=c.height=56;const g=c.getContext('2d');g.drawImage(im,0,0,56,56);const d=g.getImageData(0,0,56,56).data;const m=new Map();
  for(let i=0;i<d.length;i+=4){const k=(d[i]>>4)<<8|(d[i+1]>>4)<<4|(d[i+2]>>4);const e=m.get(k)||{n:0,r:0,g:0,b:0};e.n++;e.r+=d[i];e.g+=d[i+1];e.b+=d[i+2];m.set(k,e)}
  const out=[];for(const e of[...m.values()].sort((a,b)=>b.n-a.n)){const c=[e.r/e.n,e.g/e.n,e.b/e.n];if(out.every(o=>Math.hypot(o[0]-c[0],o[1]-c[1],o[2]-c[2])>48))out.push(c);if(out.length>=6)break}
  const el=elOf(it.id);batch(()=>{const p=addItem({type:'palette',title:it.cap?'Палитра: '+it.cap:'Палитра референса',colors:out.map(c=>'#'+c.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('')),noFocus:true},it.x+(el?.offsetWidth||it.w)+40,it.y);addConn(it.id,p.id,'arrow')})}
  catch{toast('Не получилось прочитать цвета этой картинки (сайт-источник запрещает)')}}
function spotNear(w=320){const its=live(board());if(!its.length){const c=center();return[c.x-w/2,c.y-120]}
  const sel=selItems();if(sel.length){const r=bounds(sel);return[r.x+r.w+60,r.y]}const c=center();return[c.x-w/2+(Math.random()*60-30),c.y-140+(Math.random()*60-30)]}
function freeSpot(){const its=live(board());if(!its.length){const c=center();return[c.x-400,c.y-200]}const r=bounds(its);return[r.x+r.w+140,r.y]}

/* ================= таймер ================= */
const tLeft=it=>it.endAt?Math.max(0,it.endAt-now()):(it.left??it.dur??600000);
const fmtT=ms=>{const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function fillTimer(it,el,bd,refill){const run=!!it.endAt&&tLeft(it)>0;const tm=h('div',{className:'tm'+(run?' run':'')},fmtT(tLeft(it)));
  const mins=h('input',{className:'field tmin',type:'number',min:1,max:600,value:Math.round((it.dur||600000)/60000),style:'width:70px;margin:0',title:'Минуты',onchange:e=>{edit(it,{dur:clamp(+e.target.value||1,1,600)*60000,endAt:0,left:null});refill()}});
  bd.append(ttlInput(it,'Таймер'),tm,h('div',{className:'bar'},h('div',{className:'fill tfill'})),
    h('div',{className:'tctl'},run?h('button',{className:'btn sm pri',innerHTML:ic('pause',14)+'Пауза',onclick:()=>{edit(it,{left:tLeft(it),endAt:0});refill()}})
      :h('button',{className:'btn sm pri',innerHTML:ic('play',14)+'Старт',onclick:()=>{edit(it,{endAt:now()+(tLeft(it)||it.dur),left:null});refill()}}),
      h('button',{className:'btn sm',innerHTML:ic('reset',14),title:'Сбросить',onclick:()=>{edit(it,{endAt:0,left:null});refill()}})),
    h('div',{className:'tctl'},...[5,10,15,25].map(m=>h('button',{className:'chip'+((it.dur||0)===m*60000?' on':''),onclick:()=>{edit(it,{dur:m*60000,endAt:0,left:null});refill()}},m+' мин')),mins))}
const firedT=new Set();
function beep(){try{const a=new AudioContext();[0,.35,.7].forEach(t=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;o.connect(g);g.connect(a.destination);
  g.gain.setValueAtTime(.0001,a.currentTime+t);g.gain.exponentialRampToValueAtTime(.3,a.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+t+.28);o.start(a.currentTime+t);o.stop(a.currentTime+t+.3)})}catch{}}
setInterval(()=>{const b=board();if(!b)return;for(const it of live(b)){if(it.type!=='timer')continue;const el=elOf(it.id);if(!el)continue;const l=tLeft(it),tm=el.querySelector('.tm');
  if(tm){tm.textContent=fmtT(l);tm.classList.toggle('end',!!it.endAt&&l===0)}const f=el.querySelector('.tfill');if(f)f.style.width=(100-l/(it.dur||1)*100)+'%';
  if(it.endAt&&l===0&&!firedT.has(it.id+it.endAt)){firedT.add(it.id+it.endAt);if(now()-it.endAt<5000){beep();toast(`⏰ Время вышло: ${it.title||'таймер'}`);el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}}}},250);

/* ================= приложения (встраивание) ================= */
const SERVICES=[{name:'YouTube',ex:'https://www.youtube.com/watch?v=…'},{name:'Rutube',ex:'https://rutube.ru/video/…'},{name:'Vimeo',ex:'https://vimeo.com/…'},
  {name:'Spotify',ex:'https://open.spotify.com/track/…'},{name:'Яндекс Музыка',ex:'https://music.yandex.ru/album/…/track/…'},{name:'SoundCloud',ex:'https://soundcloud.com/…'},
  {name:'Apple Music',ex:'https://music.apple.com/…'},{name:'Pinterest',ex:'https://www.pinterest.com/pin/…'},{name:'Figma',ex:'https://www.figma.com/design/…'},
  {name:'Google Docs/Таблицы',ex:'https://docs.google.com/document/d/…'},{name:'Miro',ex:'https://miro.com/app/board/…'},{name:'Google Карты',ex:'https://www.google.com/maps/embed?…'}];
function embedOf(u){let x;try{x=new URL(u)}catch{return null}const H=x.hostname.replace(/^(www|m|music)\./,m=>m==='music.'?'music.':''),p=x.pathname,q=x.searchParams;let m;
  if(/(^|\.)youtube\.com$/.test(x.hostname)&&(q.get('v')||(m=p.match(/^\/(?:shorts|live)\/([\w-]+)/))))return{svc:'YouTube',src:`https://www.youtube.com/embed/${q.get('v')||m[1]}`,w:480,h:310};
  if(x.hostname==='youtu.be')return{svc:'YouTube',src:`https://www.youtube.com/embed/${p.slice(1)}`,w:480,h:310};
  if(/rutube\.ru$/.test(x.hostname)&&(m=p.match(/\/video\/([\w]+)/)))return{svc:'Rutube',src:`https://rutube.ru/play/embed/${m[1]}`,w:480,h:310};
  if(/vimeo\.com$/.test(x.hostname)&&(m=p.match(/\/(\d+)/)))return{svc:'Vimeo',src:`https://player.vimeo.com/video/${m[1]}`,w:480,h:310};
  if(x.hostname==='open.spotify.com'&&(m=p.match(/(?:\/intl-[\w-]+)?\/(track|album|playlist|artist|episode|show)\/(\w+)/)))return{svc:'Spotify',src:`https://open.spotify.com/embed/${m[1]}/${m[2]}`,w:380,h:m[1]==='track'||m[1]==='episode'?200:420};
  if(/music\.yandex\.(ru|com|by|kz)$/.test(x.hostname)){if(m=p.match(/album\/(\d+)\/track\/(\d+)/))return{svc:'Яндекс Музыка',src:`https://music.yandex.ru/iframe/album/${m[1]}/track/${m[2]}`,w:400,h:220};
    if(m=p.match(/album\/(\d+)/))return{svc:'Яндекс Музыка',src:`https://music.yandex.ru/iframe/album/${m[1]}`,w:400,h:460};
    if(m=p.match(/users\/([^/]+)\/playlists\/(\d+)/))return{svc:'Яндекс Музыка',src:`https://music.yandex.ru/iframe/playlist/${m[1]}/${m[2]}`,w:400,h:460}}
  if(/soundcloud\.com$/.test(x.hostname))return{svc:'SoundCloud',src:`https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&visual=true`,w:420,h:320};
  if(x.hostname==='music.apple.com')return{svc:'Apple Music',src:u.replace('music.apple.com','embed.music.apple.com'),w:420,h:p.includes('/song/')||q.get('i')?200:450};
  if(/pinterest\.[a-z.]+$/.test(x.hostname)&&(m=p.match(/\/pin\/(\d+)/)))return{svc:'Pinterest',src:`https://assets.pinterest.com/ext/embed.html?id=${m[1]}`,w:300,h:560};
  if(/figma\.com$/.test(x.hostname))return{svc:'Figma',src:`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(u)}`,w:560,h:400};
  if(x.hostname==='docs.google.com'&&/\/(document|spreadsheets|presentation)\//.test(p))return{svc:{document:'Google Docs',spreadsheets:'Google Таблицы',presentation:'Google Слайды'}[p.split('/')[1]],src:u.replace(/\/(edit|view)[^/]*$/,'/preview').replace(/#.*$/,''),w:520,h:420};
  if(/miro\.com$/.test(x.hostname)&&(m=p.match(/\/app\/board\/([^/]+)/)))return{svc:'Miro',src:`https://miro.com/app/live-embed/${m[1]}/`,w:560,h:400};
  if(/google\.[a-z.]+$/.test(x.hostname)&&p.startsWith('/maps/embed'))return{svc:'Google Карты',src:u,w:480,h:360};
  return null}
function embedOrLink(url,x,y){const e=embedOf(url);if(!x&&x!==0)[x,y]=spotNear(e?.w||300);
  if(e)return addItem({type:'embed',url,svc:e.svc,src:e.src,w:e.w,h:e.h,noFocus:true},x,y);
  if(/pinterest\./.test(url))toast('Доску Pinterest целиком встроить нельзя — добавлена ссылка. Картинки можно перетаскивать прямо из Pinterest.');
  return addItem({type:'link',url,label:'',noFocus:true},x,y)}
function fillEmbed(it,el,bd){bd.append(h('iframe',{src:it.src,allow:'autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture',loading:'lazy',referrerPolicy:'strict-origin-when-cross-origin',allowFullscreen:true}))}
function appsMenu(btn){closePops();const r=btn.getBoundingClientRect();const inp=h('input',{placeholder:'Вставьте ссылку…'});
  const go=()=>{const u=inp.value.trim();if(!/^https?:\/\//i.test(u))return toast('Нужна ссылка, начинающаяся с https://');closePops();embedOrLink(u)};
  inp.onkeydown=e=>{if(e.key==='Enter')go()};
  const p=h('div',{className:'pop glass',style:'width:min(380px,94vw);padding:12px'},h('div',{className:'phd'},'Встроить приложение'),
    h('div',{className:'inrow'},inp,h('button',{className:'btn pri sm',onclick:go},'Добавить')),
    h('button',{className:'mi',onclick:()=>{closePops();pickAudio()},innerHTML:ic('music',16)+'<span>Свой трек с эквалайзером<small>mp3, m4a, ogg, wav, flac — или перетащите файл на холст</small></span>'}),h('div',{className:'phd'},'Музыка, видео, дизайн, документы'),
    h('div',{className:'svc'},...SERVICES.map(s=>h('button',{className:'chip',title:s.ex,onclick:()=>{inp.placeholder=s.ex;inp.focus()}},s.name))),
    h('small',{style:'padding:10px 4px 0;line-height:1.4'},'Проще всего — скопировать ссылку и нажать Ctrl+V прямо на холсте. Картинки из Pinterest и других сайтов можно перетаскивать на доску из браузера.'));
  document.body.append(p);posPop(p,r.left-170,r.top-p.offsetHeight-10);inp.focus()}

/* ================= импорт tldraw ================= */
const TL_INK={black:'auto',grey:'#9ca3af','light-violet':'#c4b5fd',violet:'#8b5cf6',blue:'#3b82f6','light-blue':'#60a5fa',yellow:'#f59e0b',orange:'#f97316',green:'#10b981','light-green':'#4ade80','light-red':'#f87171',red:'#ef4444',white:'#ffffff'};
const TL_CARD={yellow:1,orange:1,green:2,'light-green':2,blue:3,'light-blue':3,'light-red':4,violet:5,'light-violet':5,red:6,grey:0,black:0};
const TL_GEO={rectangle:'rect',ellipse:'ellipse',oval:'ellipse',diamond:'diamond',rhombus:'para','rhombus-2':'para',trapezoid:'para',triangle:'tri',hexagon:'hex',pentagon:'hex',octagon:'hex',cloud:'round',star:'round',heart:'round','x-box':'rect','check-box':'rect'};
function richToText(n){if(!n)return'';if(typeof n==='string')return n;if(n.type==='text')return n.text||'';if(n.type==='hardBreak')return'\n';const parts=(n.content||[]).map(richToText);
  return n.type==='doc'||n.type==='bulletList'||n.type==='orderedList'?parts.join('\n'):parts.join('')}
function tlRefs(u){const out={pages:[],shapes:[]};let s=String(u||'');try{s=decodeURIComponent(s)}catch{}
  for(const m of s.matchAll(/\b(page|shape):([\w-]+)/g))out[m[1]+'s'].push(m[1]+':'+m[2]);
  try{const x=new URL(u,'https://x.y');const d=x.searchParams.get('d')||new URLSearchParams(x.hash.slice(1)).get('d');
    if(d){if(d[0]==='p')out.pages.push('page:'+d.slice(1));else if(d[0]==='s')out.shapes.push(...d.slice(1).split('.').map(i=>'shape:'+i));else if(d[0]==='v'){const p=d.slice(1).split('.');if(p.length>4)out.pages.push('page:'+p.slice(4).join('.'))}}
    const p=x.searchParams.get('p');if(p)out.pages.push(p.startsWith('page:')?p:'page:'+p)}catch{}return out}
async function importTldraw(d,name){const recs=d.records||[];const shapes=recs.filter(r=>r.typeName==='shape').sort((a,b)=>a.index<b.index?-1:a.index>b.index?1:0);
  if(!shapes.length)return toast('В файле tldraw не нашлось фигур');
  const pages=recs.filter(r=>r.typeName==='page').sort((a,b)=>a.index<b.index?-1:a.index>b.index?1:0);
  const assets=Object.fromEntries(recs.filter(r=>r.typeName==='asset').map(a=>[a.id,a]));const byId=Object.fromEntries(shapes.map(s=>[s.id,s]));
  const pageOf=s=>{let p=s,i=0;while(p&&!String(p.parentId).startsWith('page:')&&i++<50)p=byId[p.parentId];return p?.parentId};
  const tf=s=>{const p=byId[s.parentId];if(!p)return{x:s.x,y:s.y,r:s.rotation||0};const P=tf(p),c=Math.cos(P.r),sn=Math.sin(P.r);return{x:P.x+s.x*c-s.y*sn,y:P.y+s.x*sn+s.y*c,r:P.r+(s.rotation||0)}};
  const pt=(T,q)=>{const c=Math.cos(T.r),sn=Math.sin(T.r);return[T.x+q.x*c-q.y*sn,T.y+q.x*sn+q.y*c]};
  const pos=(T,w,hh)=>{if(!T.r)return{x:T.x,y:T.y};const c=Math.cos(T.r),sn=Math.sin(T.r);return{x:T.x+w/2*c-hh/2*sn-w/2,y:T.y+w/2*sn+hh/2*c-hh/2,rot:+T.r.toFixed(4)}};
  let pids=pages.map(p=>p.id).filter(pid=>shapes.some(s=>pageOf(s)===pid));if(!pids.length)pids=[...new Set(shapes.map(pageOf))];
  const prev=cur;const root=createBoard(name||'Импорт из tldraw');const boardOf={[pids[0]]:root};
  for(const pid of pids.slice(1)){const b=createBoard(pages.find(p=>p.id===pid)?.name||'Страница');b.parent=root.id;b.parentAt=now();boardOf[pid]=b}
  const map={},sb={},links=[],arrows=[];let n=0;
  const SZ={s:2,m:3.5,l:5,xl:10},FS={s:18,m:24,l:36,xl:44},LF={s:18,m:22,l:26,xl:32},FF={draw:'draw',sans:undefined,serif:'serif',mono:'mono'};
  const TA={start:'left',middle:'center',end:'right','start-legacy':'left','middle-legacy':'center','end-legacy':'right',justify:'justify'},VA={start:'top',end:'bottom'};
  const add=(b,o,T,w,hh,s)=>{const P=pos(T,w,hh);if(P.rot)o.rot=P.rot;cur=b.id;for(const k of Object.keys(o))if(o[k]===undefined)delete o[k];const it=mk(o,P.x,P.y);b.items[it.id]=it;n++;
    if(s){map[s.id]=it.id;sb[s.id]=b;const u=s.props?.url;if(u)links.push([it,u,b])}return it};
  const draw=(b,pts,color,size,kind,s,extra={})=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),pad=size*2+12;const x=Math.min(...xs)-pad,y=Math.min(...ys)-pad;cur=b.id;
    const it=mk({type:'draw',kind,color,size,w:Math.max(...xs)-x+pad,h:Math.max(...ys)-y+pad,pts:pts.map(p=>[+(p[0]-x).toFixed(1),+(p[1]-y).toFixed(1)]),...(extra.bend?{bend:[extra.bend[0]-x,extra.bend[1]-y]}:{})},x,y);
    b.items[it.id]=it;n++;if(s){map[s.id]=it.id;sb[s.id]=b}return it};
  for(const s of shapes){const b=boardOf[pageOf(s)]||root;const T=tf(s);const p=s.props||{};const sc=p.scale||1;
    const text=(typeof p.text==='string'?p.text:richToText(p.richText)).replace(/\s+$/,'');const col=TL_CARD[p.color]??0;const inkc=TL_INK[p.color]||'auto';const ff=FF[p.font??'draw'];
    try{switch(s.type){
      case'frame':add(b,{type:'frame',title:p.name||'',w:Math.round(p.w),h:Math.round(p.h)},T,p.w,p.h,s);break;
      case'note':{const w=200*sc,hh=(200+(p.growY||0))*sc;add(b,{type:'sticky',text,c:col||1,w:Math.round(w),fs:Math.round((LF[p.size]||22)*sc),ff,ta:TA[p.align]==='center'?'center':TA[p.align]==='right'?'right':undefined,lh:1.35},T,w,hh,s);break}
      case'text':{const fs=Math.round((FS[p.size]||24)*sc);const lines=text.split('\n');const auto=p.autoSize!==false;
        const w=p.w?p.w*sc:Math.max(...lines.map(l=>l.length))*fs*.56+8,hh=lines.length*fs*1.35;
        add(b,{type:'note',bare:true,tight:true,fs,ff,lh:1.35,tc:inkc,ta:TA[p.textAlign||p.align]==='left'?undefined:TA[p.textAlign||p.align],nw:auto?1:undefined,html:esc(text).replace(/\n/g,'<br>'),w:Math.ceil(w+(auto?6:0))},T,w,hh,s);break}
      case'geo':{const w=Math.max(20,p.w||120),hh=Math.max(16,(p.h||80)+(p.growY||0));
        add(b,{type:'shape',kind:TL_GEO[p.geo]||'rect',text,c:col,nofill:p.fill==='none',fs:Math.round((LF[p.size]||22)*sc),ff,ta:{start:'left',end:'right'}[p.align],va:VA[p.verticalAlign],w:Math.round(w),h:Math.round(hh)},T,w,hh,s);break}
      case'draw':case'highlight':{const pts=[];for(const seg of p.segments||[])if(Array.isArray(seg.points))for(const q of seg.points)pts.push(pt(T,{x:q.x*sc,y:q.y*sc}));
        if(pts.length>1)draw(b,rdp(pts,.5),inkc,(SZ[p.size]||3.5)*(s.type==='highlight'?3:1)*sc,'pen',s);break}
      case'line':{const pts=Object.values(p.points||{}).sort((a,c)=>a.index<c.index?-1:1).map(q=>pt(T,q));if(pts.length>1)draw(b,pts,inkc,SZ[p.size]||3.5,'line',s);break}
      case'arrow':arrows.push({s,b,T,p,inkc,text});break;
      case'image':{const a=assets[p.assetId];const src=a?.props?.src;if(!src)break;const w=p.w||300,hh=p.h||300;const cr=p.crop;let crop,ar=hh/w;
        if(cr?.topLeft&&cr?.bottomRight){const cw=cr.bottomRight.x-cr.topLeft.x,ch=cr.bottomRight.y-cr.topLeft.y;if(cw>0&&ch>0&&(cw<.999||ch<.999)){crop={x:cr.topLeft.x,y:cr.topLeft.y,w:cw,h:ch};ar=(hh/w)*(cw/ch)}}
        const base={type:'image',bare:true,ar,w:Math.round(w),cap:'',crop};if(src.startsWith('data:')){const st=await storeImage(await(await fetch(src)).blob());base.img=st.img}else base.src=src;add(b,base,T,w,hh,s);break}
      case'embed':case'bookmark':{if(!p.url)break;const e=embedOf(p.url);const w=p.w||e?.w||300,hh=p.h||e?.h||120;(e?add(b,{type:'embed',url:p.url,svc:e.svc,src:e.src,w:Math.round(w),h:Math.round(hh)},T,w,hh,s):add(b,{type:'link',url:p.url,label:p.title||''},T,w,hh,s));break}
      case'group':break;
      default:if(text)add(b,{type:'note',bare:true,html:esc(text),w:260},T,260,40,s)}}catch(err){console.warn('tldraw shape',s.type,err)}}
  const binds=recs.filter(r=>r.typeName==='binding'&&r.type==='arrow');
  for(const{s,b,T,p,inkc,text}of arrows){const end=t=>{const bd=binds.find(r=>r.fromId===s.id&&r.props?.terminal===t);const old=p[t];return bd?.toId||(old?.type==='binding'?old.boundShapeId:null)};
    const P0=p.start&&p.start.x!=null?pt(T,p.start):null,P1=p.end&&p.end.x!=null?pt(T,p.end):null;
    let a=map[end('start')],z=map[end('end')];const hs=p.arrowheadStart&&p.arrowheadStart!=='none',he=(p.arrowheadEnd??'arrow')!=='none';
    let bendV=null;if(p.bend&&P0&&P1){const dx=P1[0]-P0[0],dy=P1[1]-P0[1],L=Math.hypot(dx,dy)||1;bendV={x:Math.round(-p.bend*dy/L),y:Math.round(p.bend*dx/L)}}
    if(a&&z&&a!==z&&sb[end('start')]===sb[end('end')]){if(hs&&!he)[a,z]=[z,a];const c={id:uid(),type:'_conn',from:a,to:z,style:'arrow',color:inkc,at:now(),head:hs&&he?'both':hs||he?'end':'none'};
      if(bendV)c.bend=bendV;if(text)c.label=text;if(p.dash==='dashed'||p.dash==='dotted')c.dash=true;b.items[c.id]=c;n++}
    else if(P0&&P1){const mid=[(P0[0]+P1[0])/2+(bendV?.x||0),(P0[1]+P1[1])/2+(bendV?.y||0)];draw(b,[P0,P1],inkc,SZ[p.size]||3.5,he?'arrow':'line',s,{bend:bendV?mid:null})}}
  const edges=new Map();
  for(const[it,u,src]of links){const r=tlRefs(u);const sid=r.shapes.find(k=>map[k]);const pid=r.pages.find(k=>boardOf[k]);
    const tgt=sid?sb[sid]:pid?boardOf[pid]:null;it.link=sid?`board:${sb[sid].id}#${map[sid]}`:pid?'board:'+boardOf[pid].id:/^https?:/i.test(u)?u:undefined;if(!it.link)delete it.link;
    if(tgt&&tgt!==src){if(!edges.has(src.id))edges.set(src.id,[]);edges.get(src.id).push(tgt)}}
  const seen=new Set([root.id]),q=[root];while(q.length){const b=q.shift();for(const t of edges.get(b.id)||[])if(!seen.has(t.id)){seen.add(t.id);t.parent=b.id;t.parentAt=now();q.push(t)}}
  cur=prev;const bs=[...new Set(Object.values(boardOf))];for(const b of bs)touch(b);openBoard(root.id);
  toast(`Импортировано из tldraw: ${n} объектов`+(bs.length>1?`, ${bs.length} ${plural(bs.length,'доска','доски','досок')} — поддоски выстроены по ссылкам`:''))}

/* ================= анимации ================= */
const CONF=['#7c6cff','#22d3ee','#34d399','#fbbf24','#f472b6','#f87171'];
function confetti(x,y,n=40,k=1){for(let i=0;i<n;i++){const d=document.createElement('i');d.className='confetti';d.style.background=CONF[i%CONF.length];document.body.append(d);
  const a=Math.random()*Math.PI*2,v=(50+Math.random()*150)*k,dx=Math.cos(a)*v,dy=Math.sin(a)*v-110*k,r=Math.random()*720-360;
  d.animate([{transform:`translate(${x}px,${y}px) rotate(0deg) scale(1)`,opacity:1},{transform:`translate(${x+dx}px,${y+dy+240*k}px) rotate(${r}deg) scale(.6)`,opacity:0}],{duration:800+Math.random()*600,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=()=>d.remove()}}
function burst(el){const r=el.getBoundingClientRect();if(r.width)confetti(r.left+r.width/2,r.top+r.height/2,12,.4)}
function celebrate(el){const r=el.getBoundingClientRect();confetti(r.left+r.width/2,r.top+24,60,1);toast('🎉 Выполнено на 100%!')}
function tweenNum(el,to,suf='',store=el){const from=store._v??to;store._v=to;cancelAnimationFrame(store._r);if(from===to){el.textContent=to+suf;return}const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e)+suf;if(k<1)store._r=requestAnimationFrame(step)};store._r=requestAnimationFrame(step)}
function flip(el,old){if(!el||!old)return;const n=el.getBoundingClientRect();if(!n.width)return;el.animate([{transform:`translate(${(old.left-n.left)/view.s}px,${(old.top-n.top)/view.s}px) scale(1.04)`},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1.1)'})}

/* ================= фигуры и майнд-карта ================= */
const SHAPES={rect:'Прямоугольник (шаг)',round:'Скруглённый',ellipse:'Овал (начало/конец)',diamond:'Ромб (решение)',para:'Параллелограмм (ввод/вывод)',hex:'Шестиугольник (подготовка)',cyl:'Цилиндр (база данных)',doc:'Документ',tri:'Треугольник',mind:'Узел майнд-карты'};
function shapePath(k,w,hh){const p=2;switch(k){
  case'round':case'mind':return`<rect x="${p}" y="${p}" width="${w-2*p}" height="${hh-2*p}" rx="${k==='mind'?(hh-2*p)/2:Math.min(w,hh)/5}"/>`;
  case'ellipse':return`<ellipse cx="${w/2}" cy="${hh/2}" rx="${w/2-p}" ry="${hh/2-p}"/>`;
  case'diamond':return`<polygon points="${w/2},${p} ${w-p},${hh/2} ${w/2},${hh-p} ${p},${hh/2}"/>`;
  case'para':{const o=Math.min(w*.18,hh*.6);return`<polygon points="${o+p},${p} ${w-p},${p} ${w-o-p},${hh-p} ${p},${hh-p}"/>`}
  case'hex':{const o=Math.min(w*.2,hh*.5);return`<polygon points="${o},${p} ${w-o},${p} ${w-p},${hh/2} ${w-o},${hh-p} ${o},${hh-p} ${p},${hh/2}"/>`}
  case'cyl':{const ry=Math.min(hh*.14,18);return`<path d="M${p} ${ry+p}A${w/2-p} ${ry} 0 0 1 ${w-p} ${ry+p}V${hh-ry-p}A${w/2-p} ${ry} 0 0 1 ${p} ${hh-ry-p}Z"/><path d="M${p} ${ry+p}A${w/2-p} ${ry} 0 0 0 ${w-p} ${ry+p}" fill="none"/>`}
  case'tri':return`<polygon points="${w/2},${p} ${w-p},${hh-p} ${p},${hh-p}"/>`;
  case'doc':{const v=Math.min(hh*.14,14);return`<path d="M${p} ${p}H${w-p}V${hh-v}Q${w*.75} ${hh-2.6*v} ${w/2} ${hh-v}T${p} ${hh-v}Z"/>`}
  default:return`<rect x="${p}" y="${p}" width="${w-2*p}" height="${hh-2*p}" rx="4"/>`}}
function shapeSvg(it){const col=COLORS[it.c]||'#8b90a0';const s=document.createElementNS(NS,'svg');s.setAttribute('class','shp');s.setAttribute('width',it.w);s.setAttribute('height',it.h);
  s.innerHTML=`<g style="fill:${it.nofill?'transparent':`color-mix(in srgb,${col} 24%,var(--card))`};stroke:${col};stroke-width:2;stroke-linejoin:round">${shapePath(it.kind||'round',it.w,it.h)}</g>`;return s}
function refreshShape(el,it){el.querySelector('svg.shp')?.replaceWith(shapeSvg(it))}
function fillShape(it,el,bd){el.querySelector('svg.shp')?.remove();el.prepend(shapeSvg(it));
  const t=h('div',{className:'txt',contentEditable:'plaintext-only'});t.dataset.ph=it.kind==='mind'?'Идея':'';t.textContent=it.text||'';applyText(t,it);if(it.va)bd.style.alignItems={top:'flex-start',bottom:'flex-end'}[it.va]||'';
  t.addEventListener('input',()=>edit(it,{text:t.textContent}));
  t.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();mindChild(it,e.shiftKey?'sib':'child')}else if(e.key==='Enter'&&!e.shiftKey&&it.kind==='mind'){e.preventDefault();mindChild(it,'sib')}});
  bd.append(t)}
function mindChild(it,mode){const B=board();let par=it;if(mode==='sib'){const pc=hidden(B,'_conn').find(c=>c.to===it.id);if(pc&&B.items[pc.from])par=B.items[pc.from];else mode='child'}
  const kids=hidden(B,'_conn').filter(c=>c.from===par.id).map(c=>B.items[c.to]).filter(k=>k&&!k.del&&k.type==='shape');
  const pe=elOf(par.id);const mind=it.kind==='mind';const w=mind?170:it.w,hh=mind?54:it.h;
  const x=mind?par.x+(pe?.offsetWidth||par.w)+90:par.x,y=mind?(kids.length?Math.max(...kids.map(k=>k.y+(k.h||54)))+22:par.y+((par.h||54)-hh)/2):par.y+(pe?.offsetHeight||par.h)+70;
  const fx=!mind&&kids.length?Math.max(...kids.map(k=>k.x+k.w))+40:x;
  batch(()=>{const n=addItem({type:'shape',kind:it.kind,c:mind?(par.kind==='mind'&&par.c===5?pick([1,2,3,4,6,7]):par.c):it.c,w,h:hh,text:''},fx,mind?y:y);addConn(par.id,n.id,'arrow')})}
function addShape(k){const d=k==='diamond'?[170,120]:k==='ellipse'?[170,90]:k==='mind'?[200,64]:[180,100];return addItem({type:'shape',kind:k,c:k==='mind'?5:3,w:d[0],h:d[1]},...spotNear(d[0]))}

/* ================= диаграммы ================= */
const CHARTS={bar:'Столбчатая',hbar:'Горизонтальная',line:'Линейная',area:'С областями',pie:'Круговая',donut:'Кольцевая',radar:'Радар',gauge:'Спидометр'};
const CSRC={manual:'Свои данные',status:'Задачи: готово / открыто',kanban:'Канбан по колонкам',who:'Открытые задачи по людям',deadline:'Задачи по срокам',progress:'Прогресс доски (%)'};
const PAL=['#7c6cff','#22d3ee','#34d399','#fbbf24','#f472b6','#f87171','#60a5fa','#a78bfa'];
function chartData(it,b=board()){const T=allTasks(b);switch(it.src||'manual'){
  case'status':return[{l:'Готово',v:T.filter(t=>t.done).length},{l:'Открыто',v:T.filter(t=>!t.done).length}];
  case'kanban':{const m=new Map();for(const k of live(b))if(k.type==='kanban')for(const c of k.cols)m.set(c.title,(m.get(c.title)||0)+c.tasks.length);return[...m].map(([l,v])=>({l,v}))}
  case'who':{const m=new Map();for(const t of T)if(!t.done){const w=t.who||'Без исполнителя';m.set(w,(m.get(w)||0)+1)}return[...m].map(([l,v])=>({l,v}))}
  case'deadline':{const g={'Просрочено':0,'До 3 дней':0,'Неделя':0,'Позже':0,'Без срока':0};for(const t of T){if(t.done)continue;if(!t.due){g['Без срока']++;continue}const d=daysTo(t.due);g[d<0?'Просрочено':d<=3?'До 3 дней':d<=7?'Неделя':'Позже']++}return Object.entries(g).map(([l,v])=>({l,v}))}
  case'progress':return[{l:'Готовность проекта',v:Math.round((boardProgress(b)?.p||0)*100)}];
  default:return it.data||[]}}
function chartSvg(kind,data){const W=320,H=kind==='hbar'?Math.max(110,data.length*28+16):190;const vals=data.map(d=>+d.v||0),mx=Math.max(1,...vals);let s='';
  const lab=(x,y,t,a='middle',c='')=>`<text x="${x}" y="${y}" text-anchor="${a}" class="${c}">${esc(String(t??'').slice(0,16))}</text>`;
  if(!data.length)return`<svg class="ch" viewBox="0 0 ${W} 60">${lab(W/2,34,'Нет данных')}</svg>`;
  switch(kind){
  case'bar':{const n=data.length,bw=(W-20)/n;data.forEach((d,i)=>{const hh=Math.max(1,(vals[i]/mx)*(H-48)),x=10+i*bw+bw*.16,w=bw*.68,y=H-24-hh;
    s+=`<rect class="grow" style="animation-delay:${i*60}ms" x="${x}" y="${y}" width="${w}" height="${hh}" rx="5" fill="${PAL[i%8]}"/>`+lab(x+w/2,y-5,vals[i],'middle','v fadein')+lab(x+w/2,H-8,d.l)});break}
  case'hbar':{const lw=96;data.forEach((d,i)=>{const w=(vals[i]/mx)*(W-lw-40),y=8+i*28;s+=lab(lw-6,y+15,d.l,'end')+`<rect class="growx" style="animation-delay:${i*60}ms" x="${lw}" y="${y+3}" width="${Math.max(2,w)}" height="18" rx="5" fill="${PAL[i%8]}"/>`+lab(lw+w+6,y+16,vals[i],'start','v fadein')});break}
  case'line':case'area':{const n=Math.max(1,data.length-1),pts=data.map((d,i)=>[18+i*(W-36)/n,H-26-(vals[i]/mx)*(H-52)]);const ln='M'+pts.map(p=>p.join(' ')).join('L');
    s+=`<line x1="10" y1="${H-26}" x2="${W-10}" y2="${H-26}" stroke="var(--line2)"/>`;if(kind==='area')s+=`<path class="fadein" d="${ln}L${pts[pts.length-1][0]} ${H-26}L${pts[0][0]} ${H-26}Z" fill="${PAL[0]}" opacity=".22"/>`;
    s+=`<path class="draw" pathLength="1" d="${ln}" fill="none" stroke="${PAL[0]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach((p,i)=>{s+=`<circle class="fadein" style="animation-delay:${300+i*60}ms" cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${PAL[0]}"/>`+lab(p[0],p[1]-8,vals[i],'middle','v fadein')+lab(p[0],H-8,data[i].l)});break}
  case'pie':case'donut':{const tot=vals.reduce((a,b)=>a+b,0)||1,cx=88,cy=H/2,r=72,ir=kind==='donut'?44:0;let a=-Math.PI/2;const P=(ang,rr)=>`${(cx+rr*Math.cos(ang)).toFixed(2)} ${(cy+rr*Math.sin(ang)).toFixed(2)}`;
    data.forEach((d,i)=>{const f=vals[i]/tot;if(!f)return;const a2=a+f*Math.PI*2-(f>=1?.0001:0),L=f>.5?1:0;
      const path=ir?`M${P(a,r)}A${r} ${r} 0 ${L} 1 ${P(a2,r)}L${P(a2,ir)}A${ir} ${ir} 0 ${L} 0 ${P(a,ir)}Z`:`M${cx} ${cy}L${P(a,r)}A${r} ${r} 0 ${L} 1 ${P(a2,r)}Z`;
      s+=`<path class="fadein" style="animation-delay:${i*80}ms;transform-origin:${cx}px ${cy}px" d="${path}" fill="${PAL[i%8]}" stroke="var(--card)" stroke-width="2"/>`;a=a2});
    if(ir)s+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" class="v" style="font-size:18px">${Math.round(vals[0]/tot*100)}%</text>`;
    data.forEach((d,i)=>{const y=cy-data.length*10+i*20+12;s+=`<rect x="180" y="${y-9}" width="10" height="10" rx="3" fill="${PAL[i%8]}"/>`+lab(196,y,`${d.l} · ${vals[i]}`,'start')});break}
  case'radar':{const n=Math.max(3,data.length),cx=W/2,cy=H/2+4,r=68;const P=(i,k)=>[(cx+r*k*Math.cos(-Math.PI/2+i*2*Math.PI/n)).toFixed(1),(cy+r*k*Math.sin(-Math.PI/2+i*2*Math.PI/n)).toFixed(1)];
    for(const k of[.33,.66,1])s+=`<polygon points="${[...Array(n)].map((_,i)=>P(i,k).join(',')).join(' ')}" fill="none" stroke="var(--line2)"/>`;
    s+=`<polygon class="fadein" style="transform-origin:${cx}px ${cy}px" points="${[...Array(n)].map((_,i)=>P(i,(vals[i]||0)/mx).join(',')).join(' ')}" fill="${PAL[0]}" fill-opacity=".3" stroke="${PAL[0]}" stroke-width="2"/>`;
    for(let i=0;i<n;i++){const[x,y]=P(i,1.2);s+=lab(x,+y+3,data[i]?.l||'')}break}
  case'gauge':{const v=clamp(vals[0]||0,0,100),cx=W/2,cy=H-34,r=104;const P=ang=>`${(cx+r*Math.cos(ang)).toFixed(2)} ${(cy+r*Math.sin(ang)).toFixed(2)}`;
    s+=`<path d="M${P(Math.PI)}A${r} ${r} 0 0 1 ${P(0)}" fill="none" stroke="var(--line2)" stroke-width="18" stroke-linecap="round"/>`;
    if(v>0)s+=`<path class="draw" pathLength="1" d="M${P(Math.PI)}A${r} ${r} 0 0 1 ${P(Math.PI+v/100*Math.PI*.9999)}" fill="none" stroke="url(#gg)" stroke-width="18" stroke-linecap="round"/>`;
    s+=`<text x="${cx}" y="${cy-12}" text-anchor="middle" class="v" style="font-size:36px">${Math.round(v)}%</text>`+lab(cx,cy+18,data[0]?.l||'');break}}
  return`<svg class="ch" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="gg"><stop offset="0" stop-color="${PAL[0]}"/><stop offset="1" stop-color="${PAL[1]}"/></linearGradient></defs>${s}</svg>`}
function fillChart(it,el,bd,refill){const box=h('div',{className:'chbox'});const draw=(anim=true)=>{const d=chartData(it);el._sig=JSON.stringify(d)+it.kind;box.classList.toggle('noanim',!anim);box.innerHTML=chartSvg(it.kind||'bar',d)};draw();
  const kind=h('select',{title:'Тип диаграммы',onchange:e=>{edit(it,{kind:e.target.value});draw()}},...Object.entries(CHARTS).map(([k,v])=>h('option',{value:k},v)));kind.value=it.kind||'bar';
  const src=h('select',{title:'Источник данных',onchange:e=>{edit(it,{src:e.target.value});refill()}},...Object.entries(CSRC).map(([k,v])=>h('option',{value:k},v)));src.value=it.src||'manual';
  const ed=h('div',{className:'ced'},h('div',{className:'r'},kind,src));
  if((it.src||'manual')==='manual'){it.data??=[];it.data.forEach((d,i)=>ed.append(h('div',{className:'r'},h('input',{value:d.l,placeholder:'Подпись',oninput:e=>{edit(it,()=>d.l=e.target.value);draw(false)}}),
      h('input',{className:'n',type:'number',value:d.v,oninput:e=>{edit(it,()=>d.v=+e.target.value||0);draw(false)}}),ibtn('x','Убрать',()=>{edit(it,()=>it.data.splice(i,1));refill()}))));
    ed.append(h('button',{className:'addrow',onclick:()=>{edit(it,()=>it.data.push({l:'',v:0}));refill()}},'+ значение'))}
  bd.append(ttlInput(it,'Диаграмма'),box,ed)}
function ganttSvg(b,W){const T=allTasks(b).filter(t=>t.due).sort((a,c)=>a.due.localeCompare(c.due)).slice(0,60);
  if(!T.length)return'<div class="empty">Задайте задачам сроки (иконка 👤 у задачи) — они появятся здесь</div>';
  const day=864e5,today=new Date().setHours(0,0,0,0);const st=T.map(t=>Math.min(dateOf(t.due).getTime(),new Date(t.card.cat||t.card.at).setHours(0,0,0,0)));
  const t0=Math.min(today,...st)-day,t1=Math.max(today,...T.map(t=>dateOf(t.due).getTime()))+2*day;const LW=Math.min(170,W*.32),PW=W-LW-30,rowH=26,H=T.length*rowH+30;
  const X=t=>LW+(t-t0)/(t1-t0)*PW;let s='';const span=(t1-t0)/day,step=span>90?14:span>30?7:span>12?2:1;
  for(let t=t0;t<=t1;t+=day*step){const d=new Date(t);s+=`<line x1="${X(t)}" y1="18" x2="${X(t)}" y2="${H}" stroke="var(--line)"/><text x="${X(t)+2}" y="12" class="gt">${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}</text>`}
  T.forEach((t,i)=>{const y=24+i*rowH,a=X(st[i]),z=X(dateOf(t.due).getTime()+day),over=!t.done&&daysTo(t.due)<0,col=t.done?'#34d399':over?'#f87171':PAL[i%8];
    s+=`<text x="${LW-8}" y="${y+13}" text-anchor="end" class="gl${t.done?' gd':''}">${esc((t.text||'Без названия').slice(0,26))}</text><rect class="growx" style="animation-delay:${i*40}ms" x="${a}" y="${y+2}" width="${Math.max(6,z-a)}" height="17" rx="6" fill="${col}" opacity="${t.done?.55:.92}"/>`+(t.who?`<text x="${z+5}" y="${y+15}" class="gt">${esc(t.who)}</text>`:'')});
  const tx=X(today);s+=`<line x1="${tx}" y1="14" x2="${tx}" y2="${H}" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${tx}" y="${H+12}" text-anchor="middle" class="gt" style="fill:var(--bad)">сегодня</text>`;
  return`<svg class="ch" viewBox="0 0 ${W} ${H+16}">${s}</svg>`}
function fillGantt(it,el,bd){const g=h('div',{className:'gbox'});g._s=ganttSvg(board(),Math.max(300,it.w-28));g.innerHTML=g._s;
  bd.append(ttlInput(it,'Таймлайн задач'),g,h('div',{className:'muted',style:'margin-top:6px'},'Строится сам из задач со сроками · зелёные — готово, красные — просрочено'))}
function refreshAuto(el,it){if(it.type==='gantt'){const g=el.querySelector('.gbox');if(g){const s=ganttSvg(board(),Math.max(300,it.w-28));if(g._s!==s){g._s=s;g.innerHTML=s}}return}
  const d=chartData(it),sig=JSON.stringify(d)+it.kind;if(el._sig===sig)return;el._sig=sig;const box=el.querySelector('.chbox');if(box){box.classList.remove('noanim');box.innerHTML=chartSvg(it.kind||'bar',d)}}
function newMind(){const[x,y]=spotNear(200);batch(()=>{const c=addItem({type:'shape',kind:'mind',c:5,w:220,h:70,text:'Главная идея',noFocus:true},x,y);setSel([c.id]);
  const t=elOf(c.id)?.querySelector('.txt');if(t){t.focus();placeEnd(t)}});toast('Tab — новая ветка, Enter — соседняя идея')}
function diagramMenu(btn){const r=btn.getBoundingClientRect();menu(r.left,r.top-8,[{head:'Майнд-карта'},{icon:'spark',label:'Новая майнд-карта',sub:'Tab — ветка, Enter — соседняя идея',fn:newMind},
  {head:'Блок-схема · Tab в фигуре — следующий шаг'},...['rect','round','ellipse','diamond','para','cyl','hex','doc','tri'].map(k=>({icon:'shapes',label:SHAPES[k],fn:()=>addShape(k)})),
  {head:'Диаграммы'},...Object.entries(CHARTS).map(([k,v])=>({icon:'chart',label:v,sub:k==='gauge'?'Прогресс проекта':k==='pie'||k==='donut'?'Задачи: готово / открыто':k==='hbar'?'Задачи по людям':'',
    fn:()=>addItem({type:'chart',kind:k,src:k==='gauge'?'progress':k==='pie'||k==='donut'?'status':k==='hbar'?'who':'manual',noFocus:true},...spotNear(360))})),
  {head:'Сортировка'},{icon:'check',label:'Сортировка по важности',sub:'Зоны «Необходимо», «Менее важно», «Не нужно»',fn:arrangeZones},
  {head:'Планирование'},{icon:'gantt',label:'Таймлайн задач (диаграмма Ганта)',sub:'Из задач со сроками',fn:()=>addItem({type:'gantt',noFocus:true},...spotNear(720))}],true)}
function linkPop(anchor,its){closePops();const r=anchor.getBoundingClientRect();const it=its[0];const inp=h('input',{placeholder:'https://…',value:it.link&&!it.link.startsWith('board:')?it.link:''});
  const set=v=>{const B=board();snap(its.map(x=>x.id),true);if(v?.startsWith('board:'))adopt(v.slice(6).split('#')[0],cur);for(const x of its){if(v)x.link=v;else delete x.link;if(x.type==='button'&&!x.text&&v?.startsWith('board:'))x.text=boards[v.slice(6).split('#')[0]]?.title||'';stamp(x);elOf(x.id)?.replaceWith(renderItem(x))}touch(B);closePops();buildSel();drawLinks()};
  const p=h('div',{className:'pop glass',style:'width:min(340px,94vw);padding:12px'},h('div',{className:'phd'},'Ссылка на сайт'),
    h('div',{className:'inrow'},inp,h('button',{className:'btn pri sm',onclick:()=>{const v=inp.value.trim();if(!/^https?:\/\//i.test(v))return toast('Нужна ссылка, начинающаяся с https://');set(v)}},'OK')),
    h('div',{className:'phd'},'Или на доску'),...Object.values(boards).filter(b=>!b.deleted&&b.id!==cur).map(b=>h('button',{className:'mi',onclick:()=>set('board:'+b.id),innerHTML:ic('menu',15)+'<span>'+esc(b.title||'Без названия')+'</span>'})),
    h('button',{className:'mi',onclick:()=>{const b=createBoard((itemText(it)||'').slice(0,40)||'Вложенная доска','empty');b.parent=cur;touch(b);set('board:'+b.id)},innerHTML:ic('plus',15)+'<span>Создать вложенную доску</span>'}),
    it.link?h('button',{className:'mi',style:'color:var(--bad)',onclick:()=>set(null),innerHTML:ic('x',15)+'<span>Убрать ссылку</span>'}):null);
  inp.onkeydown=e=>{if(e.key==='Enter')p.querySelector('.btn.pri').click()};document.body.append(p);posPop(p,r.left-140,r.bottom+8)}

/* ================= вдохновение ================= */
const PROMPTS=['Как бы это выглядело при бюджете в 10 раз меньше?','Что можно убрать, чтобы стало лучше?','Опишите проект тремя словами — и подберите референсы под них',
 'Как решил бы эту задачу ребёнок?','Какой самый смелый вариант, который вы бы точно не стали делать? Почему?','Найдите референс из совсем другой области: архитектура, природа, кино',
 'Что человек почувствует в первые 5 секунд?','Соедините две несвязанные карточки с этой доски — что получится?','Как это сделали бы в 1980-х? А в 2080-х?',
 'Какое ограничение добавить специально, чтобы стало интереснее?','Нарисуйте худший вариант — что из него можно взять?','Сделайте версию проекта за 1 час',
 'Какой цвет у этого проекта? А звук? А фактура?','Что сказал бы самый строгий критик?','10 вариантов названия за 2 минуты — без фильтра','Как объяснить идею без слов?',
 'Что взять у лучшего конкурента — и что сделать ровно наоборот?','Какая одна деталь сделает проект запоминающимся?','Для кого это точно НЕ предназначено?',
 'Что будет, если всё увеличить в 10 раз? А уменьшить?','Какую проблему вы решаете на самом деле?','Как бы это сделал ваш любимый автор или бренд?','Что здесь можно превратить в игру?',
 'Какая метафора лучше всего описывает проект?','Чего пользователь боится — и как это снять?'];
const WORDS='маяк,оригами,туман,неон,компас,янтарь,эхо,мозаика,спираль,ракушка,витраж,ветер,паутина,кристалл,трамвай,зеркало,сад,карусель,вулкан,фонарь,бумага,приливы,созвездие,лабиринт,пазл,шёлк,гравитация,ритм,мост,песок,пар,чертёж,ключ,поезд,окно,тень,магнит,бетон,пузырь,мёд,лёд,радио,зерно,кино,рынок,облако,коллаж,кофе,шахматы,перо,сканер,сигнал,гнездо,пульс,ткань,призма,дым,танец,роботы,полароид'.split(',');
function topicOf(){const s=selItems()[0];return(s&&itemText(s).slice(0,60))||board()?.title||'проект'}
function placeGroup(title,stickies,{cols=4,w=210,gap=24,frameW,target}={}){return batch(()=>{const[x,y]=target?(()=>{const r=itemBox(target);return[r.x+r.w+120,r.y]})():freeSpot();
  const rows=Math.ceil(stickies.length/cols),fw=frameW||cols*(w+gap)+gap,fh=rows*(170+gap)+gap+60;
  const f=addItem({type:'frame',title,w:fw,h:fh,noFocus:true,noSelect:true},x,y);
  stickies.forEach((s,i)=>addItem({type:'sticky',w,noFocus:true,noSelect:true,...s},x+gap+(i%cols)*(w+gap),y+70+Math.floor(i/cols)*(170+gap)));
  if(target)addConn(target.id,f.id,'arrow');setSel([f.id]);setTimeout(()=>focusArea(f.id),50);return f})}
function focusArea(id){const el=elOf(id);if(!el)return;const W=vp.clientWidth,H=vp.clientHeight;const s=clamp(Math.min((W-80)/el.offsetWidth,(H-240)/el.offsetHeight),.2,1);
  animateTo({s,x:W/2-(el.offsetLeft+el.offsetWidth/2)*s,y:H/2-(el.offsetTop+el.offsetHeight/2)*s+20})}
const INSP={
  scamper:()=>{const t=topicOf(),tg=selItems()[0];placeGroup('SCAMPER: '+t,[['Заменить','Что можно заменить: материал, формат, аудиторию, канал?'],['Комбинировать','С чем объединить? Какие идеи слить вместе?'],['Адаптировать','Что позаимствовать из другой сферы или эпохи?'],['Изменить','Что увеличить, уменьшить, преувеличить, упростить?'],['Применить иначе','Где ещё и для кого это может пригодиться?'],['Убрать','Что удалить без потери сути? Что лишнее?'],['Перевернуть','Что если сделать наоборот или в другом порядке?']].map(([a,b],i)=>({text:`${a}\n${b}`,c:i%7+1})),{target:tg})},
  hats:()=>{const t=topicOf();placeGroup('Шесть шляп: '+t,[['⚪ Факты','Что мы точно знаем? Каких данных не хватает?',7],['🔴 Чувства','Что подсказывает интуиция? Что нравится и пугает?',6],['⚫ Риски','Что может пойти не так? Слабые места?',5],['🟡 Выгоды','Почему это сработает? Лучший сценарий?',1],['🟢 Идеи','Новые варианты, альтернативы, «а что если»?',2],['🔵 Процесс','Что решаем, кто делает, какой следующий шаг?',3]].map(([a,b,c])=>({text:`${a}\n${b}`,c})),{cols:3,target:selItems()[0]})},
  crazy8:()=>{batch(()=>{const f=placeGroup('Crazy 8s — 8 идей за 8 минут: '+topicOf(),[...Array(8)].map((_,i)=>({text:`${i+1}.`,c:1})),{cols:4});
    addItem({type:'timer',title:'Crazy 8s',dur:8*60000,noFocus:true,noSelect:true},f.x+f.w+30,f.y)})},
  reverse:()=>{const t=topicOf();placeGroup('Обратный штурм: '+t,[{text:`Как сделать «${t}» гарантированно провальным?\nПишите худшие идеи 👇`,c:6},{text:''},{text:''},{text:'Теперь переверните каждую плохую идею в хорошую ✨',c:2}],{cols:4})},
  words:()=>addItem({type:'sticky',text:'Случайные ассоциации: '+[...WORDS].sort(()=>Math.random()-.5).slice(0,3).join(' · ')+'\nКак каждое слово связано с проектом?',c:4,noFocus:true},...spotNear(210)),
  prompt:()=>addItem({type:'sticky',text:pick(PROMPTS),c:5,noFocus:true},...spotNear(210)),
  timer:m=>addItem({type:'timer',title:m===25?'Фокус (помидор)':'Таймер',dur:m*60000,noFocus:true},...spotNear(260))};
const REFS=[['Pinterest','https://www.pinterest.com/search/pins/?q='],['Behance','https://www.behance.net/search/projects?search='],['Dribbble','https://dribbble.com/search/'],
  ['Unsplash','https://unsplash.com/s/photos/'],['Are.na','https://www.are.na/search/'],['Google Картинки','https://www.google.com/search?tbm=isch&q=']];
function openInspire(){openWin('inspire','Вдохновение',renderInspire)}
function renderInspire(body){const tile=(icon,t,s,fn)=>h('button',{className:'tile',onclick:fn,innerHTML:`<span class="ti">${ic(icon,17)}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span>`});
  const hasAI=!!aiCfg().key;const sel=selItems();
  body.append(h('div',{className:'sec'},'Генерация с ИИ'),hasAI?h('div',{className:'grid2'},
      tile('spark','Идеи для доски','6 свежих идей с учётом всего, что на доске',()=>aiIdeas()),
      tile('spark',sel.length?'Развить выделенное':'Развить карточку',sel.length?'Идеи вокруг выделенных карточек':'Сначала выделите карточку',()=>sel.length?aiIdeas(sel.map(i=>i.id)):toast('Выделите карточку на доске')),
      tile('spark','Что упущено?','Слепые зоны, вопросы и риски',()=>aiGaps()),
      tile('palette','Палитра по настроению','Опишите настроение — получите цвета',()=>{const m=prompt('Опишите настроение или тему:');if(m)aiPalette(m)}))
    :h('button',{className:'tile',style:'width:100%',onclick:()=>{closeWin('inspire');openSettings()},innerHTML:`<span class="ti">${ic('spark',17)}</span><span><b>Подключить ИИ (Claude)</b><small>Добавьте ключ API в настройках — и ИИ будет генерировать идеи по вашей доске</small></span>`}),
    h('div',{className:'sec'},'Техники'),h('div',{className:'grid2'},
      tile('dice','SCAMPER','7 вопросов, чтобы развить идею',INSP.scamper),tile('user','Шесть шляп','Посмотреть с 6 сторон',INSP.hats),
      tile('timer','Crazy 8s','8 идей за 8 минут + таймер',INSP.crazy8),tile('reset','Обратный штурм','Как всё испортить — и перевернуть',INSP.reverse),
      tile('bulb','Случайные слова','3 ассоциации для неожиданных связей',INSP.words),tile('msg','Вопрос-подсказка','Творческий вопрос на стикере',INSP.prompt)),
    h('div',{className:'sec'},'Таймер для команды'),h('div',{className:'filters'},...[5,10,25].map(m=>h('button',{className:'chip',onclick:()=>INSP.timer(m)},m===25?'25 мин · помидор':m+' мин'))));
  const q=h('input',{value:topicOf(),placeholder:'Что ищем?'});
  body.append(h('div',{className:'sec'},'Найти референсы'),h('div',{className:'inrow'},q),h('div',{className:'filters'},...REFS.map(([n,u])=>h('button',{className:'chip',onclick:()=>window.open(u+encodeURIComponent(q.value.trim()),'_blank','noopener')},n+' ↗'))),
    h('div',{className:'muted',style:'padding:2px'},'Понравившиеся картинки перетаскивайте прямо на доску.'))}

/* ================= ИИ (Claude) ================= */
const aiCfg=()=>JSON.parse(localStorage.ai||'{}');
let sdkP=null;
async function aiClient(){const c=aiCfg();if(!c.key){openSettings();throw new Error('Добавьте ключ API Claude в настройках')}
  sdkP??=import('https://esm.sh/@anthropic-ai/sdk');const{default:Anthropic}=await sdkP;return new Anthropic({apiKey:c.key,dangerouslyAllowBrowser:true})}
const SYS='Ты — помощник в приложении-доске для творческих проектов и управления задачами. Отвечай по-русски, конкретно и по делу, опираясь на содержимое доски пользователя. Без вступлений и общих слов. Пиши коротко: карточки на доске маленькие.';
async function aiCall({text,images=[],schema,effort='medium'}){const client=await aiClient();const model=aiCfg().model||'claude-opus-5-5';
  const output_config={effort};if(schema)output_config.format={type:'json_schema',schema};
  const params={model,max_tokens:16000,system:SYS,messages:[{role:'user',content:[...images.map(im=>({type:'image',source:{type:'base64',media_type:im.type,data:im.data}})),{type:'text',text}]}],output_config};
  let res;try{res=model==='claude-haiku-5-5'?await client.messages.create(params):await client.beta.messages.create({...params,betas:['server-side-fallback-2026-07-01'],fallbacks:'default'})}
  catch(e){throw new Error(e?.status===401?'Ключ API не подходит':e?.status===429?'Слишком много запросов — попробуйте через минуту':e?.status===400&&/credit/i.test(e?.message||'')?'На аккаунте Anthropic закончились средства':(e?.message||'Ошибка соединения с ИИ'))}
  if(res.stop_reason==='refusal')throw new Error('ИИ отказался отвечать на этот запрос');
  const txt=res.content.filter(b=>b.type==='text').map(b=>b.text).join('\n');return schema?JSON.parse(txt):txt}
const arr=(props)=>({type:'array',items:props});
const obj=(props)=>({type:'object',properties:props,required:Object.keys(props),additionalProperties:false});
const STR={type:'string'};
function outline(b,ids){const its=ids?ids.map(id=>b.items[id]).filter(i=>i&&!i.del):live(b);const lines=[`Проект: ${b.title||'Без названия'}`,`Сегодня: ${new Date().toISOString().slice(0,10)}`];
  const name=id=>{const t=b.items[id];return t?cardLabel(t).slice(0,50):'?'};
  for(const it of its){if(it.type==='draw'||it.type==='pin')continue;let s=`- [${TYPES[it.type]?.name||it.type}] `;
    switch(it.type){case'todo':s+=(it.title||'Чек-лист')+'\n'+(it.rows||[]).map(r=>`   ${r.done?'[x]':'[ ]'} ${r.text}${r.due?' (срок '+r.due+')':''}${r.who?' @'+r.who:''}`).join('\n');break;
      case'kanban':s+=(it.title||'Канбан')+'\n'+it.cols.map(c=>`   ${c.title}: `+(c.tasks.map(t=>t.text+(t.due?' (срок '+t.due+')':'')+(t.who?' @'+t.who:'')).join('; ')||'—')).join('\n');break;
      case'progress':s+=`${it.title||'Прогресс'}: ${Math.round(progressOf(it,b)*100)}%`;break;
      case'deadline':s+=`${it.title||'Дедлайн'}: ${it.date}`;break;
      case'embed':s+=`${it.svc}: ${it.url}`;break;
      case'timer':s+=it.title||'Таймер';break;
      default:s+=itemText(it)||'(пусто)'}
    const cm=hidden(b,'_cmt').filter(c=>c.item===it.id);if(cm.length)s+='\n   Комментарии: '+cm.map(c=>`${c.by}: ${c.text}`).join(' | ');
    const v=hidden(b,'_vote').filter(c=>c.item===it.id).length;if(v)s+=`\n   Голосов: ${v}`;lines.push(s)}
  for(const c of hidden(b,'_conn'))if(!ids||ids.includes(c.from)||ids.includes(c.to))lines.push(`Связь: ${name(c.from)} → ${name(c.to)}`);
  return lines.join('\n').slice(0,60000)}
async function boardImages(b,ids,max=4){const its=(ids?ids.map(i=>b.items[i]):live(b)).filter(i=>i?.type==='image'&&i.img&&!i.del).slice(0,max);const out=[];
  for(const it of its){const blob=await idb.get('images',it.img);if(blob)out.push({type:blob.type||'image/webp',data:b64(new Uint8Array(await blob.arrayBuffer()))})}return out}
async function aiRun(label,fn){openAI();const w=wins.ai;w._busy=label;w._out=null;renderWin('ai',true);
  try{w._out=await fn()}catch(e){w._out=h('div',{className:'empty',style:'color:var(--bad)'},e.message)}w._busy=null;if(wins.ai)renderWin('ai',true)}
function openAI(o={}){const w=openWin('ai','ИИ-помощник',renderAI);if(o.ids){w._ids=o.ids}else if(!w._ids)w._ids=null;renderWin('ai',true)}
function renderAI(body,w){if(!aiCfg().key){body.append(h('div',{className:'empty'},'Подключите Claude: нужен ключ API (console.anthropic.com → API Keys). Ключ хранится только на этом устройстве.'),
  h('div',{style:'text-align:center'},h('button',{className:'btn pri',onclick:()=>{closeWin('ai');openSettings()}},'Открыть настройки')));return}
  const ids=w._ids?.filter(id=>board()?.items[id]&&!board().items[id].del);
  body.append(h('div',{className:'ctx2',onclick:()=>{w._ids=null;renderWin('ai',true)},title:ids?.length?'Нажмите, чтобы анализировать всю доску':''},h('div',{className:'muted'},'Контекст'),
    h('div',{},ids?.length?`Выделено карточек: ${ids.length} · нажмите, чтобы взять всю доску`:'Вся доска «'+(board()?.title||'')+'»')));
  const tile=(icon,t,s,fn)=>h('button',{className:'tile',onclick:fn,innerHTML:`<span class="ti">${ic(icon,17)}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span>`});
  body.append(h('div',{className:'grid2',style:'margin-top:8px'},tile('activity','Анализ','Итог, риски, следующие шаги',()=>aiAnalyze(ids)),tile('bulb','Идеи','6 идей стикерами на доску',()=>aiIdeas(ids)),
    tile('check','Разбить на задачи','Чек-лист со сроками',()=>aiTasks(ids)),tile('spark','Что упущено?','Слепые зоны и вопросы',()=>aiGaps(ids))));
  const ta=h('textarea',{className:'ta',rows:2,placeholder:'Спросите что угодно о доске… (Enter — отправить)'});
  const ask=()=>{const q=ta.value.trim();if(!q)return;aiRun('Думаю…',async()=>{const t=await aiCall({text:`${outline(board(),ids)}\n\nВопрос пользователя: ${q}`,images:await boardImages(board(),ids,2)});return mdLite(t,q)})};
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}});
  body.append(h('div',{className:'cbox'},ta,h('button',{className:'btn pri',innerHTML:ic('send',16),onclick:ask})));
  if(w._busy)body.append(h('div',{className:'empty'},h('span',{className:'spin'}),' ',w._busy));else if(w._out)body.append(h('div',{className:'ai-out',style:'margin-top:12px'},w._out))}
function mdLite(t,q){const d=h('div');if(q)d.append(h('div',{className:'muted',style:'margin-bottom:6px'},'Вопрос: '+q));
  const html=esc(t).replace(/^#{1,4}\s*(.+)$/gm,'<h4>$1</h4>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^\s*[-*•]\s+(.+)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>').replace(/\n/g,'<br>');
  d.append(h('div',{innerHTML:html}),h('div',{className:'filters',style:'margin-top:10px'},h('button',{className:'chip',onclick:()=>addItem({type:'note',html:clean(html),w:340,noFocus:true},...spotNear(340))},'+ Заметкой на доску')));return d}
function listBlock(title,items,addFn,addLabel){if(!items?.length)return null;return h('div',{},h('h4',{},title),h('ul',{},...items.map(x=>h('li',{},x))),
  addFn?h('div',{className:'filters'},h('button',{className:'chip',onclick:e=>{addFn();e.currentTarget.disabled=true;e.currentTarget.textContent='Добавлено ✓'}},addLabel)):null)}
function aiAnalyze(ids){aiRun('Изучаю доску…',async()=>{const b=board();
  const r=await aiCall({text:`Проанализируй доску проекта. Оцени состояние, найди риски и предложи конкретные следующие шаги.\n\n${outline(b,ids)}`,images:await boardImages(b,ids),
    schema:obj({summary:STR,risks:arr(STR),next_steps:arr(STR),ideas:arr(STR),questions:arr(STR)})});
  return h('div',{},h('h4',{},'Итог'),h('div',{},r.summary),
    listBlock('Следующие шаги',r.next_steps,()=>addItem({type:'todo',title:'Следующие шаги (ИИ)',rows:r.next_steps.map(t=>({id:uid(),text:t,done:false})),noFocus:true},...spotNear()),'+ Чек-листом на доску'),
    listBlock('Риски',r.risks,()=>addItem({type:'todo',title:'Риски (ИИ)',c:6,rows:r.risks.map(t=>({id:uid(),text:t,done:false})),noFocus:true},...spotNear()),'+ Чек-листом на доску'),
    listBlock('Идеи',r.ideas,()=>placeGroup('Идеи от ИИ',r.ideas.map(t=>({text:t,c:5}))),'+ Стикерами на доску'),
    listBlock('Вопросы, на которые стоит ответить',r.questions,()=>placeGroup('Открытые вопросы',r.questions.map(t=>({text:t,c:3}))),'+ Стикерами на доску'))})}
function aiIdeas(ids){aiRun('Придумываю идеи…',async()=>{const b=board();const tg=ids?.length===1?b.items[ids[0]]:null;
  const r=await aiCall({text:`Предложи 6 свежих, неочевидных и конкретных идей${ids?' для развития выделенных карточек':' для этого проекта'}. Каждая идея — короткий заголовок и одно предложение пояснения.\n\n${outline(b,ids)}`,images:await boardImages(b,ids,3),
    schema:obj({ideas:arr(obj({title:STR,text:STR}))}),effort:'medium'});
  placeGroup('Идеи от ИИ',r.ideas.map((x,i)=>({text:`${x.title}\n${x.text}`,c:[5,3,2,1,4,7][i%6]})),{cols:3,target:tg});
  return h('div',{},h('h4',{},'Добавлено на доску'),h('ul',{},...r.ideas.map(x=>h('li',{},h('b',{},x.title),' — ',x.text))))})}
function aiGaps(ids){aiRun('Ищу слепые зоны…',async()=>{const b=board();
  const r=await aiCall({text:`Что упущено в этом проекте? Найди слепые зоны: о чём не подумали, какие вопросы не заданы, чего не хватает для успеха. До 6 пунктов.\n\n${outline(b,ids)}`,
    schema:obj({gaps:arr(obj({title:STR,why:STR}))})});
  return h('div',{},listBlock('Слепые зоны',r.gaps.map(g=>g.title+' — '+g.why),()=>placeGroup('Что упущено (ИИ)',r.gaps.map(g=>({text:`${g.title}\n${g.why}`,c:6})),{cols:3}),'+ Стикерами на доску'))})}
function aiTasks(ids){aiRun('Составляю план…',async()=>{const b=board();
  const r=await aiCall({text:`Разбей ${ids?'выделенное':'проект'} на конкретные выполнимые задачи (5–10), по порядку. Для каждой оцени, через сколько дней от сегодня она должна быть готова.\n\n${outline(b,ids)}`,
    schema:obj({title:STR,tasks:arr(obj({text:STR,days:{type:'integer'}}))})});
  const rows=r.tasks.map(t=>({id:uid(),text:t.text,done:false,due:new Date(now()+Math.max(0,t.days)*864e5).toISOString().slice(0,10)}));
  const it=addItem({type:'todo',title:r.title,rows,noFocus:true},...spotNear());if(ids?.length===1)addConn(ids[0],it.id,'arrow');
  return h('div',{},h('h4',{},'Чек-лист добавлен на доску'),h('ul',{},...rows.map(x=>h('li',{},x.text+' · до '+fmtDate(x.due)))))})}
async function aiPalette(mood){if(!aiCfg().key){openSettings();return toast('Добавьте ключ API Claude в настройках')}toast('Подбираю цвета…');
  try{const r=await aiCall({text:`Подбери гармоничную палитру из 5 цветов (HEX, формат #rrggbb) для настроения: «${mood}». Дай короткое название палитры.`,schema:obj({name:STR,colors:arr(STR)})});
    const cols=r.colors.filter(c=>/^#[0-9a-f]{6}$/i.test(c)).slice(0,6);if(!cols.length)throw new Error('ИИ вернул неверные цвета');addItem({type:'palette',title:r.name,colors:cols,noFocus:true},...spotNear())}
  catch(e){toast(e.message)}}

/* ================= шаблоны ================= */
const iso=d=>new Date(now()+d*864e5).toISOString().slice(0,10);
const task=(text,o={})=>({id:uid(),text,...o});
const TEMPLATES={
 empty:{name:'Пустая доска',desc:'Чистый холст',icon:'plus',hue:'#64748b',make:()=>[]},
 mood:{name:'Мудборд',desc:'Референсы, палитра, музыка',icon:'image',hue:'#ec4899',make:()=>[
   {type:'heading',x:0,y:0,text:'Мудборд'},{type:'frame',x:0,y:80,w:760,h:520,title:'Референсы — вставьте картинки (Ctrl+V)'},
   {type:'palette',x:800,y:80,title:'Цвета',colors:randomPalette()},{type:'sticky',x:800,y:330,text:'Настроение в трёх словах:\n',c:1},
   {type:'note',x:1030,y:330,w:280,html:'<b>Берём:</b><ul><li><br></li></ul><b>Избегаем:</b><ul><li><br></li></ul>'}]},
 project:{name:'Управление проектом',desc:'Канбан, дедлайн, прогресс, риски',icon:'kanban',hue:'#7c6cff',make:()=>[
   {type:'heading',x:0,y:0,text:'План проекта'},
   {type:'kanban',x:0,y:80,title:'Задачи',cols:[{id:uid(),title:'Надо сделать',tasks:[task('Собрать требования',{due:iso(3)}),task('Сделать прототип',{due:iso(7)})]},{id:uid(),title:'В работе',tasks:[task('Исследование и референсы',{due:iso(1)})]},{id:uid(),title:'Готово',tasks:[task('Идея проекта')]}]},
   {type:'progress',x:700,y:80,title:'Готовность',mode:'all',c:3},{type:'deadline',x:700,y:300,title:'Сдача проекта',date:iso(21),c:6},
   {type:'todo',x:1000,y:80,title:'Риски',c:1,rows:[{id:uid(),text:'Не хватит времени на тесты',done:false}]},
   {type:'note',x:1000,y:300,html:'<b>Цель проекта</b><ul><li>Для кого?</li><li>Что считается успехом?</li></ul>'}]},
 research:{name:'Исследование',desc:'Детективная доска: пины и верёвки',icon:'rope',hue:'#ef4444',make:()=>{const a=uid(),b=uid(),c=uid(),d=uid(),pa=uid(),pb=uid(),pc=uid(),pd=uid();return[
   {type:'heading',x:0,y:0,text:'Исследование'},
   {id:a,type:'note',x:0,y:90,w:280,html:'<b>Гипотеза</b><br>Что мы предполагаем?'},{id:b,type:'sticky',x:420,y:40,text:'Факт 1\nЧто подтверждает?',c:1},
   {id:c,type:'sticky',x:420,y:320,text:'Факт 2\nЧто опровергает?',c:4},{id:d,type:'note',x:780,y:180,w:280,html:'<b>Вывод</b><br>Что из этого следует?'},
   {id:pa,type:'pin',x:140,y:104,on:a,dx:140,dy:14,color:'#ef4444'},{id:pb,type:'pin',x:525,y:54,on:b,dx:105,dy:14,color:'#ef4444'},
   {id:pc,type:'pin',x:525,y:334,on:c,dx:105,dy:14,color:'#ef4444'},{id:pd,type:'pin',x:920,y:194,on:d,dx:140,dy:14,color:'#ef4444'},
   {type:'_conn',from:pa,to:pb,style:'rope',color:'#ef4444'},{type:'_conn',from:pa,to:pc,style:'rope',color:'#ef4444'},
   {type:'_conn',from:pb,to:pd,style:'rope',color:'#ef4444'},{type:'_conn',from:pc,to:pd,style:'rope',color:'#ef4444'}]}},
 mind:{name:'Майнд-карта',desc:'Tab — ветка, Enter — соседняя идея',icon:'spark',hue:'#8b5cf6',make:()=>{const c=uid(),k=[uid(),uid(),uid(),uid()];const t=['Цели','Аудитория','Идеи','Риски'];return[
   {id:c,type:'shape',kind:'mind',c:5,x:0,y:170,w:230,h:74,text:'Главная идея',fs:20},
   ...k.map((id,i)=>({id,type:'shape',kind:'mind',c:[1,2,3,6][i],x:340,y:i*95+40,w:170,h:56,text:t[i]})),...k.map(id=>({type:'_conn',from:c,to:id,style:'arrow'}))]}},
 flow:{name:'Блок-схема',desc:'Процесс, решения, данные',icon:'shapes',hue:'#0ea5e9',make:()=>{const a=uid(),b=uid(),c=uid(),d=uid(),e=uid(),f=uid();return[
   {type:'heading',x:0,y:-90,text:'Процесс'},
   {id:a,type:'shape',kind:'ellipse',c:2,x:0,y:0,w:170,h:80,text:'Старт'},{id:b,type:'shape',kind:'para',c:3,x:250,y:0,w:190,h:80,text:'Получить заявку'},
   {id:c,type:'shape',kind:'diamond',c:1,x:520,y:-20,w:180,h:120,text:'Всё понятно?'},{id:d,type:'shape',kind:'rect',c:3,x:800,y:0,w:180,h:80,text:'Сделать задачу'},
   {id:e,type:'shape',kind:'rect',c:4,x:520,y:190,w:180,h:80,text:'Уточнить детали'},{id:f,type:'shape',kind:'ellipse',c:2,x:1060,y:0,w:170,h:80,text:'Готово'},
   {type:'_conn',from:a,to:b,style:'arrow'},{type:'_conn',from:b,to:c,style:'arrow'},{type:'_conn',from:c,to:d,style:'arrow',label:'Да'},
   {type:'_conn',from:c,to:e,style:'arrow',label:'Нет'},{type:'_conn',from:e,to:b,style:'arrow',bend:{x:0,y:110}},{type:'_conn',from:d,to:f,style:'arrow'}]}},
 brain:{name:'Мозговой штурм',desc:'Вопросы, стикеры, голосование',icon:'bulb',hue:'#f59e0b',make:()=>{const ps=[...PROMPTS].sort(()=>Math.random()-.5).slice(0,3);return[
   {type:'heading',x:0,y:0,text:'Мозговой штурм'},{type:'sticky',x:0,y:80,c:3,text:'Правила: без критики, количество важнее качества, потом голосуем 👍'},
   ...ps.map((p,i)=>({type:'sticky',x:240+i*230,y:80,c:5,text:p})),{type:'timer',x:940,y:80,title:'Штурм',dur:600000},
   {type:'frame',x:0,y:330,w:920,h:360,title:'Идеи'},{type:'frame',x:960,y:330,w:420,h:360,title:'Лучшее (по голосам)'}]}},
 launch:{name:'Запуск / спринт',desc:'Этапы, чек-листы, команда',icon:'clock',hue:'#10b981',make:()=>[
   {type:'heading',x:0,y:0,text:'Спринт'},{type:'deadline',x:0,y:80,title:'Конец спринта',date:iso(14),c:2},
   {type:'todo',x:280,y:80,title:'Подготовка',rows:[{id:uid(),text:'Цели спринта',done:false,due:iso(1)},{id:uid(),text:'Распределить задачи',done:false,due:iso(2)}]},
   {type:'todo',x:610,y:80,title:'Запуск',rows:[{id:uid(),text:'Тестирование',done:false,due:iso(12)},{id:uid(),text:'Релиз',done:false,due:iso(14)}]},
   {type:'progress',x:0,y:330,title:'Общий прогресс',mode:'all',c:3},{type:'sticky',x:940,y:80,text:'Ретро: что прошло хорошо?',c:2},{type:'sticky',x:940,y:330,text:'Ретро: что улучшить?',c:6}]},
};
createBoard=function(title,tplKey){const b={id:uid(),title,titleAt:now(),deleted:false,delAt:0,items:{},rev:0};boards[b.id]=b;
  for(const d of(TEMPLATES[tplKey]?.make()||[])){const it=d.type[0]==='_'?{...d,id:d.id||uid(),at:now()}:mk(d,d.x,d.y);b.items[it.id]=it}touch(b);return b};
function showTemplates(){const l=$('#tplList');l.textContent='';
  for(const[k,t]of Object.entries(TEMPLATES)){const i=h('span',{className:'ti',innerHTML:ic(t.icon,18)});i.style.background=t.hue;
    l.append(h('button',{className:'tpl',onclick:()=>{$('#tpl').close();const b=createBoard(k==='empty'?'Новый проект':t.name,k);openBoard(b.id);if(k==='empty')setTimeout(()=>{titleIn.focus();titleIn.select()},50)}},i,h('b',{},t.name),h('small',{},t.desc)))}
  $('#tpl').showModal()}

/* ================= совместная работа в реальном времени (P2P) ================= */
const RT={id:uid(),peers:new Map(),key:null,topic:null,es:null,on:false,q:new Map(),qt:0,curs:{}};
const liveOn=()=>localStorage.live!=='0';
async function zip(u8){if(!window.CompressionStream)return u8;return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer())}
async function unzip(u8){return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}
async function seal(o){const iv=crypto.getRandomValues(new Uint8Array(12));const z=!!window.CompressionStream;const data=await zip(enc(JSON.stringify(o)));
  return(z?'z':'r')+b64(iv)+'.'+b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},RT.key,data)))}
async function unseal(s){const[a,c]=s.slice(1).split('.');let pt=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(a)},RT.key,unb64(c)));if(s[0]==='z')pt=await unzip(pt);return JSON.parse(new TextDecoder().decode(pt))}
async function rtKey(retry=0){const r=await gh('realtime.json',{raw:true});
  if(r.ok){const j=await r.json();return crypto.subtle.importKey('raw',unb64(j.key),'AES-GCM',true,['encrypt','decrypt'])}
  if(r.status!==404||retry>1)throw new Error('realtime key '+r.status);
  const k=b64(crypto.getRandomValues(new Uint8Array(32)));const p=await gh('realtime.json',{method:'PUT',body:JSON.stringify({message:'Ключ для совместной работы',content:b64(enc(JSON.stringify({key:k})))})});
  if(!p.ok&&p.status!==422)throw new Error('realtime key save '+p.status);return rtKey(retry+1)}
async function rtStart(){if(RT.on||RT.starting||!cfg.token||!liveOn()||!window.RTCPeerConnection)return;RT.starting=true;
  try{RT.key=await rtKey();RT.topic='brd'+hex(await crypto.subtle.digest('SHA-256',await crypto.subtle.exportKey('raw',RT.key))).slice(0,32);
    RT.es=new EventSource(`https://ntfy.sh/${RT.topic}/sse`);RT.es.onmessage=ev=>rtSignal(ev.data);RT.es.onopen=()=>rtHello();RT.on=true}
  catch(e){console.warn('realtime off:',e)}RT.starting=false}
function rtStop(){RT.es?.close();RT.es=null;RT.on=false;for(const id of[...RT.peers.keys()])rtDrop(id)}
const rtPost=async o=>{try{await fetch(`https://ntfy.sh/${RT.topic}`,{method:'POST',body:await seal({...o,from:RT.id})})}catch{}};
const openPeers=()=>[...RT.peers.values()].filter(p=>p.dc?.readyState==='open');
function rtHello(reply){if(RT.on&&document.visibilityState==='visible')rtPost({t:'hello',name:me(),reply})}
async function rtSignal(data){let m;try{m=JSON.parse(data)}catch{return}if(m.event!=='message')return;let txt=m.message;
  try{if(m.attachment?.url)txt=await(await fetch(m.attachment.url)).text();var s=await unseal(txt)}catch{return}
  if(!s||s.from===RT.id||(s.to&&s.to!==RT.id))return;
  if(s.t==='hello'){const p=RT.peers.get(s.from);if(p&&(p.dc?.readyState==='open'||p.pending))return;if(!s.reply)rtHello(true);if(RT.id<s.from)rtConnect(s.from,s.name)}
  else if(s.t==='offer')rtAnswer(s);
  else if(s.t==='answer'){const p=RT.peers.get(s.from);if(p&&p.pc.signalingState==='have-local-offer')try{await p.pc.setRemoteDescription({type:'answer',sdp:s.sdp})}catch{}}}
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun.cloudflare.com:3478']}]};
const gathered=pc=>new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const t=setTimeout(r,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);r()}})});
async function rtConnect(pid,name){rtDrop(pid);const pc=new RTCPeerConnection(ICE);const p={pc,name,pending:true};RT.peers.set(pid,p);rtWire(pid,p,pc.createDataChannel('b',{ordered:true}));
  try{await pc.setLocalDescription(await pc.createOffer());await gathered(pc);rtPost({t:'offer',to:pid,name:me(),sdp:pc.localDescription.sdp})}catch{rtDrop(pid)}
  p.timer=setTimeout(()=>{if(p.dc?.readyState!=='open')rtDrop(pid)},25000)}
async function rtAnswer(s){rtDrop(s.from);const pc=new RTCPeerConnection(ICE);const p={pc,name:s.name,pending:true};RT.peers.set(s.from,p);pc.ondatachannel=e=>rtWire(s.from,p,e.channel);
  try{await pc.setRemoteDescription({type:'offer',sdp:s.sdp});await pc.setLocalDescription(await pc.createAnswer());await gathered(pc);rtPost({t:'answer',to:s.from,sdp:pc.localDescription.sdp})}catch{rtDrop(s.from)}
  p.timer=setTimeout(()=>{if(p.dc?.readyState!=='open')rtDrop(s.from)},25000)}
function rtWire(pid,p,dc){p.dc=dc;dc.onopen=()=>{p.pending=false;clearTimeout(p.timer);dcSend(dc,{t:'hi',name:me()});for(const b of Object.values(boards))dcSend(dc,{t:'board',board:ser(b)});
    updatePeople();setSync(setSync.last||'ok');toast(`${p.name||'Участник'} на связи — правки видны мгновенно`)};
  dc.onmessage=e=>{try{rtData(pid,p,JSON.parse(e.data))}catch(err){console.warn(err)}};dc.onclose=()=>rtDrop(pid);
  p.pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(p.pc.connectionState))rtDrop(pid)}}
function rtDrop(pid){const p=RT.peers.get(pid);if(!p)return;RT.peers.delete(pid);clearTimeout(p.timer);try{p.dc?.close();p.pc.close()}catch{}RT.curs[pid]?.el.remove();delete RT.curs[pid];updatePeople();setSync(setSync.last||'ok')}
function dcSend(dc,o){const s=JSON.stringify(o);if(dc.readyState==='open'&&s.length<240000)dc.send(s)}
function rtBroadcast(o){for(const p of openPeers())dcSend(p.dc,o)}
function rtQueue(bid,id){if(!RT.peers.size||!bid)return;RT.q.set(bid+'|'+id,[bid,id]);if(!RT.qt)RT.qt=setTimeout(rtFlush,40)}
function rtFlush(){RT.qt=0;const out={};for(const[bid,id]of RT.q.values()){const it=boards[bid]?.items[id];if(it)(out[bid]??=[]).push(it)}RT.q.clear();for(const[b,items]of Object.entries(out))rtBroadcast({t:'items',b,items})}
function rtLive(items){if(!RT.peers.size)return;rtBroadcast({t:'live',b:cur,items:items.map(i=>({id:i.id,x:i.x,y:i.y,w:i.w,h:i.h,pts:i.type==='draw'?i.pts:undefined}))})}
function rtData(pid,p,m){
  if(m.t==='hi'){p.name=m.name;updatePeople()}
  else if(m.t==='board'){const rb=m.board,had=!!boards[rb.id];boards[rb.id]=mergeBoard(boards[rb.id],rb);persist(boards[rb.id]);if(rb.id===cur)renderBoard(true);if(!had&&!$('#drawer').hidden)renderBoardList()}
  else if(m.t==='items'){const b=boards[m.b];if(!b)return;const ch=[];
    for(const ri of m.items){const li=b.items[ri.id];if(!li||(ri.at||0)>(li.at||0)){if(li){for(const k of Object.keys(li))delete li[k];Object.assign(li,ri)}else b.items[ri.id]=ri;ch.push(ri.id)}}
    if(!ch.length)return;persist(b);if(m.b===cur)refreshItems(ch)}
  else if(m.t==='live'){if(m.b!==cur)return;const b=board();for(const ri of m.items){const li=b.items[ri.id],el=elOf(ri.id);if(!li||!el)continue;
    Object.assign(li,{x:ri.x,y:ri.y,w:ri.w,h:ri.h});if(ri.pts){li.pts=ri.pts;el.replaceChildren(drawSvg(li))}place(el,li)}drawLinks()}
  else if(m.t==='cur')showCursor(pid,p.name,m);
  else if(m.t==='title'){const b=boards[m.b];if(b&&(m.titleAt||0)>(b.titleAt||0)){b.title=m.title;b.titleAt=m.titleAt;persist(b);if(m.b===cur&&document.activeElement!==titleIn)titleIn.value=m.title}}}
function refreshItems(ids){const b=board();const ae=document.activeElement?.closest?.('.card');let meta_=false;
  for(const id of ids){const it=b.items[id];if(!it)continue;if(it.type?.[0]==='_'){meta_=true;if(it.type==='_conn')delete spring[id];continue}const el=elOf(id);
    if(it.del||!it.type){if(el){leaveRemove(el);meta_=true}continue}if(el&&el===ae){place(el,it);el.dataset.stale=1;continue}
    const n=renderItem(it);if(el)el.replaceWith(n);else{n.classList.add('enter');cardsEl.append(n)}}
  maxZ=Math.max(maxZ,...live(b).map(i=>i.z||1));paintAll();if(selSet.size)buildSel();if(meta_)buildCtx()}
let curT=0;
vp.addEventListener('pointermove',e=>{if(!RT.peers.size||e.pointerType==='touch'||now()-curT<50)return;curT=now();const p=toWorld(e.clientX,e.clientY);rtBroadcast({t:'cur',b:cur,x:Math.round(p.x),y:Math.round(p.y)})});
function showCursor(pid,name,m){let c=RT.curs[pid];if(m.b!==cur){if(c)c.el.style.opacity=0;return}
  if(!c){const col=`hsl(${hashHue((name||'?').toLowerCase())} 70% 55%)`;const el=h('div',{className:'rcur'});
    el.innerHTML=`<div><svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 2l13 6.5-6 1.5-2.5 6z" fill="${col}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg><span style="background:${col}">${esc(name||'Гость')}</span></div>`;
    $('#curs').append(el);c=RT.curs[pid]={el}}
  c.el.style.opacity=1;c.el.style.transform=`translate(${m.x}px,${m.y}px)`;clearTimeout(c.t);c.t=setTimeout(()=>c.el.style.opacity=0,8000)}
function rtCursorsClear(){for(const c of Object.values(RT.curs))c.el.style.opacity=0}

/* ================= настройки, импорт/экспорт, верхняя панель ================= */
function openSettings(){$('#sCrt').checked=localStorage.crt!=='0';$('#sPlate').checked=localStorage.imgPlate==='1';$('#sKinds').checked=localStorage.kinds!=='0';$('#sName').value=me();$('#sOwner').value=cfg.owner||'';$('#sRepo').value=cfg.repo||'';$('#sToken').value=cfg.token||'';$('#sLive').checked=liveOn();
  const a=aiCfg();$('#sAiKey').value=a.key||'';$('#sAiModel').value=a.model||'claude-opus-5-5';$('#setMsg').textContent='';$('#settings').showModal()}
$('#sClose').onclick=()=>$('#settings').close();
$('#sOff').onclick=()=>{cfg={};localStorage.cfg='{}';rtStop();setSync('off');$('#settings').close();toast('Синхронизация отключена')};
$('#sSave').onclick=async()=>{const name=$('#sName').value.trim();if(name!==me()){localStorage.myName=name;updatePeople();paintMeta()}
  localStorage.crt=$('#sCrt').checked?'1':'0';setTheme(localStorage.theme);
  localStorage.imgPlate=$('#sPlate').checked?'1':'0';localStorage.kinds=$('#sKinds').checked?'1':'0';document.body.classList.toggle('nokinds',localStorage.kinds==='0');
  localStorage.ai=JSON.stringify({key:$('#sAiKey').value.trim(),model:$('#sAiModel').value});
  const lv=$('#sLive').checked;localStorage.live=lv?'1':'0';if(!lv)rtStop();
  const c={owner:$('#sOwner').value.trim(),repo:$('#sRepo').value.trim(),token:$('#sToken').value.trim()};const m=$('#setMsg');
  if(!c.owner&&!c.repo&&!c.token){$('#settings').close();toast('Сохранено');return}
  if(!c.owner||!c.repo||!c.token){m.textContent='Для синхронизации заполните владельца, репозиторий и токен';m.style.color='var(--bad)';return}
  if(c.owner===c.token||/\s/.test(c.owner)){m.textContent='Во «Владельце» должен быть логин GitHub (например Naito33)';m.style.color='var(--bad)';return}
  m.style.color='var(--mut)';m.textContent='Проверяю…';
  try{const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`,{cache:'no-store',headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'}});
    if(!r.ok){let hint='';if(r.status===404){const u=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+c.token}}).then(x=>x.ok?x.json():null).catch(()=>null);
        if(u?.login&&u.login.toLowerCase()!==c.owner.toLowerCase())hint=` Ваш логин по токену — «${u.login}». Его и укажите во «Владельце», если репозиторий ваш.`}
      throw new Error((r.status===401?'Токен не подходит.':r.status===404?'Репозиторий не найден или у токена нет к нему доступа.':'Ошибка '+r.status)+hint)}
    const j=await r.json();if(j.permissions&&!j.permissions.push)throw new Error('У токена нет права записи (Contents: Read and write)');
    if(cfg.owner!==c.owner||cfg.repo!==c.repo){meta.sha={};meta.pushed={};meta.uploaded={};saveMeta();rtStop()}
    cfg=c;localStorage.cfg=JSON.stringify(c);m.style.color='var(--ok)';m.textContent=j.private?'Готово! Репозиторий приватный.':'Готово. Внимание: репозиторий публичный — лучше сделать его приватным.';
    sync();setTimeout(()=>$('#settings').close(),j.private?900:3500)}
  catch(e){m.style.color='var(--bad)';m.textContent=e.message}};
$('#exportBtn').onclick=async()=>{const images={};for(const k of await idb.keys('images'))images[k]=await blobToDataURL(await idb.get('images',k));
  const data=JSON.stringify({app:'boards',v:3,boards:Object.values(boards).map(ser),images});
  h('a',{href:URL.createObjectURL(new Blob([data],{type:'application/json'})),download:`boards-backup-${new Date().toISOString().slice(0,10)}.json`}).click()};
$('#importBtn').onclick=()=>$('#importPick').click();
$('#importPick').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const d=JSON.parse(await f.text());closeDrawer();
  if(d.records||d.tldrawFileFormatVersion)return importTldraw(d,f.name.replace(/\.(tldr|json)$/i,''));
  for(const[k,u]of Object.entries(d.images||{}))await idb.put('images',k,await(await fetch(u)).blob());
  for(const rb of d.boards||[]){boards[rb.id]=mergeBoard(boards[rb.id],rb);touch(boards[rb.id])}renderBoardList();renderBoard(true);toast('Импортировано')}catch(err){console.error(err);toast('Ошибка импорта: файл не похож на резервную копию или tldraw')}};
$('#tplX').onclick=()=>$('#tpl').close();
$('#newBoard').onclick=()=>{closeDrawer();showTemplates()};
$('#openSet').onclick=()=>{closeDrawer();openSettings()};
$('#menuBtn').onclick=openDrawer;$('#scrim').onclick=closeDrawer;
$('#backBtn').innerHTML=ic('back');$('#treeBtn').innerHTML=ic('tree');$('#treeBtn').onclick=()=>wins.tree?closeWin('tree'):openWin('tree','Структура досок',renderTree);
$('#inviteBtn').onclick=()=>{$('#settings').close();inviteFlow()};
$('#subsBtn').onclick=()=>{localStorage.hideSubs=localStorage.hideSubs==='1'?'0':'1';renderBoardList()};$('#backBtn').onclick=()=>{const id=navStack.pop();if(id&&boards[id])openBoard(id);$('#backBtn').hidden=!navStack.length};
$('#searchBtn').onclick=openSearch;$('#tasksBtn').onclick=()=>wins.tasks?closeWin('tasks'):openWin('tasks','Задачи',renderTasks);
$('#actBtn').onclick=()=>wins.activity?closeWin('activity'):openWin('activity','Активность',renderActivity);
$('#themeBtn').onclick=()=>{const t=THEMES[(THEMES.indexOf(document.documentElement.dataset.theme)+1)%3];setTheme(t);toast('Тема: '+THN[t])};
sEl.onclick=()=>cfg.token?sync():openSettings();
$('#q').addEventListener('input',runSearch);
$('#q').addEventListener('keydown',e=>{const rs=$('#qres')._res||[],els=$('#qres').children;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();els[qSel]?.classList.remove('on');qSel=clamp(qSel+(e.key==='ArrowDown'?1:-1),0,Math.min(rs.length,40)-1);els[qSel]?.classList.add('on');els[qSel]?.scrollIntoView({block:'nearest'})}
  if(e.key==='Enter'&&rs[qSel])goRes(rs[qSel])});
titleIn.addEventListener('input',e=>{const b=board();if(!b)return;b.title=e.target.value;b.titleAt=now();touch(b);rtBroadcast({t:'title',b:b.id,title:b.title,titleAt:b.titleAt})});
titleIn.addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur()});
$('#zi').onclick=()=>zoomAt(vp.clientWidth/2,vp.clientHeight/2,1.3);$('#zo').onclick=()=>zoomAt(vp.clientWidth/2,vp.clientHeight/2,1/1.3);
$('#zl').onclick=()=>zoomAt(vp.clientWidth/2,vp.clientHeight/2,1/view.s);$('#zf').onclick=()=>fitView(true,true);
for(const[k,i]of[['#menuBtn','menu'],['#searchBtn','search'],['#tasksBtn','check'],['#actBtn','activity'],['#zi','plus'],['#zo','minus'],['#zf','fit']])$(k).innerHTML=ic(i,k[1]==='z'?16:18);
sEl.insertAdjacentHTML('afterbegin',ic('sync'));

/* ================= клавиатура ================= */
document.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey,dlg=document.querySelector('dialog[open]');
  if(mod&&e.code==='KeyK'){e.preventDefault();openSearch();return}
  if(e.key==='Escape'){if(op){cancelOp();return}if(document.querySelector('.pop')){closePops();return}if(dlg)return;
    if(isEditing()){document.activeElement.blur();return}if(tool!=='select'){setTool('select');return}const w=Object.keys(wins).pop();if(w&&!selSet.size){closeWin(w);return}setSel([]);return}
  if(isEditing()||dlg)return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat){spaceDown=true;document.body.classList.add('space')}return}
  if(mod&&e.code==='KeyZ'){e.preventDefault();e.shiftKey?redo():undo();return}
  if(mod&&e.code==='KeyY'){e.preventDefault();redo();return}
  if(mod&&e.code==='KeyD'){e.preventDefault();dupSel();return}
  if(mod&&e.code==='KeyA'){e.preventDefault();setSel(live(board()).map(i=>i.id));return}
  if(mod&&e.code==='KeyG'){e.preventDefault();groupSel();return}
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();deleteSel();return}
  if(e.key.startsWith('Arrow')&&selSet.size){e.preventDefault();const s=e.shiftKey?10:1;nudge(e.key==='ArrowLeft'?-s:e.key==='ArrowRight'?s:0,e.key==='ArrowUp'?-s:e.key==='ArrowDown'?s:0);return}
  if(e.key==='Enter'&&selSet.size===1){const el=elOf([...selSet][0]);const f=el?.querySelector('.txt,.rt,.ttl');if(f){e.preventDefault();f.focus();if(f.isContentEditable)placeEnd(f)}return}
  if(mod||e.altKey)return;
  if(!e.shiftKey&&['Digit1','Digit2','Digit3','Digit0'].includes(e.code)&&selSet.size){setPrio(selItems(),{Digit1:'must',Digit2:'should',Digit3:'nope',Digit0:null}[e.code]);return}
  const T={KeyV:'select',KeyH:'hand',KeyP:'pen',KeyA:'arrow',KeyI:'pin',KeyR:'rope'}[e.code];if(T){setTool(T);return}
  if(e.code==='KeyN')addOfType('sticky');else if(e.code==='KeyT')addOfType('text');else if(e.code==='KeyD'){const b=[...dock.children].find(x=>x.dataset.tip?.startsWith('Фигуры'));if(b)diagramMenu(b)}else if(e.code==='KeyF')addOfType('frame');
  else if(e.key==='='||e.key==='+')zoomAt(vp.clientWidth/2,vp.clientHeight/2,1.3);else if(e.key==='-')zoomAt(vp.clientWidth/2,vp.clientHeight/2,1/1.3);
  else if(e.shiftKey&&e.code==='Digit1')fitView(true,true);else if(e.shiftKey&&e.code==='Digit2'&&selSet.size){const r=bounds(selItems());const W=vp.clientWidth,H=vp.clientHeight,s=clamp(Math.min((W-120)/r.w,(H-260)/r.h),.2,2);animateTo({s,x:W/2-(r.x+r.w/2)*s,y:H/2-(r.y+r.h/2)*s})}});
document.addEventListener('keyup',e=>{if(e.code==='Space'){spaceDown=false;document.body.classList.remove('space')}});
addEventListener('blur',()=>{spaceDown=false;document.body.classList.remove('space')});
addEventListener('resize',()=>updateSelUI());


/* ================= музыка с эквалайзером ================= */
const EQB=[60,230,910,3600,14000],EQL=['60','230','910','3.6к','14к'];
const EQP={'Ровно':[0,0,0,0,0],'Бас':[8,5,0,-1,-2],'Вокал':[-2,-1,4,3,1],'Рок':[5,2,-2,3,5],'Электроника':[6,3,-1,2,5],'Акустика':[2,1,2,3,2],'Ночью тихо':[-3,-1,1,0,-4]};
const players={};let actx=null;
function player(it){let p=players[it.id];if(p)return p;const a=new Audio();a.preload='metadata';p=players[it.id]={a};
  for(const ev of['play','pause','timeupdate','loadedmetadata','ended'])a.addEventListener(ev,()=>{p.ui?.();if(ev==='play')vizKick()});
  imgURL(it.img).then(u=>{if(u)a.src=u;else toast('Файл трека ещё не загружен на это устройство')});a.volume=it.vol??.9;return p}
function graph(it,p){actx??=new(window.AudioContext||window.webkitAudioContext)();if(p.f)return;const src=actx.createMediaElementSource(p.a);
  p.f=EQB.map((fr,i)=>{const b=actx.createBiquadFilter();b.type=i===0?'lowshelf':i===4?'highshelf':'peaking';b.frequency.value=fr;b.Q.value=1.1;b.gain.value=(it.eq||[])[i]||0;return b});
  p.an=actx.createAnalyser();p.an.fftSize=256;p.an.smoothingTimeConstant=.8;let n=src;for(const b of p.f){n.connect(b);n=b}n.connect(p.an);p.an.connect(actx.destination)}
const fmtS=t=>isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
function fillAudio(it,el,bd){const p=player(it);const cv=h('canvas',{className:'viz',width:640,height:128});
  const pp=h('button',{className:'pp',title:'Играть / пауза'});const seek=h('input',{type:'range',className:'live',min:0,max:1000,value:0,title:'Перемотка'});const tm=h('span',{className:'atime'},'0:00');
  const vol=h('input',{type:'range',className:'live',min:0,max:100,value:Math.round((it.vol??.9)*100),style:'max-width:64px;flex:none',title:'Громкость',oninput:e=>p.a.volume=e.target.value/100,onchange:e=>edit(it,{vol:e.target.value/100})});
  p.ui=()=>{pp.innerHTML=ic(p.a.paused?'play':'pause',18);tm.textContent=fmtS(p.a.currentTime)+' / '+fmtS(p.a.duration);if(!seek._d&&p.a.duration)seek.value=p.a.currentTime/p.a.duration*1000};
  pp.onclick=async e=>{e.stopPropagation();graph(it,p);if(actx.state==='suspended')await actx.resume();
    if(p.a.paused){for(const o of Object.values(players))if(o!==p)o.a.pause();p.a.play().catch(()=>toast('Не удалось воспроизвести файл'))}else p.a.pause()};
  seek.oninput=()=>{seek._d=1;if(p.a.duration)p.a.currentTime=seek.value/1000*p.a.duration};seek.onchange=()=>seek._d=0;
  const setG=(i,v)=>{graph(it,p);p.f[i].gain.setTargetAtTime(v,actx.currentTime,.06)};
  const sl=EQB.map((_,i)=>h('input',{type:'range',className:'live',min:-12,max:12,step:1,value:(it.eq||[])[i]||0,title:EQL[i]+' Гц',oninput:e=>{const v=+e.target.value;(it.eq??=[0,0,0,0,0])[i]=v;setG(i,v)},onchange:()=>edit(it,{eq:it.eq})}));
  const eq=h('div',{className:'eqp'},h('div',{className:'eqb'},...sl.map((s,i)=>h('label',{},s,EQL[i]))),
    h('div',{className:'filters',style:'margin:8px 0 0'},...Object.entries(EQP).map(([n,v])=>h('button',{className:'chip',onclick:e=>{e.stopPropagation();edit(it,{eq:[...v]});v.forEach((g,i)=>{setG(i,g);sl[i].value=g})}},n))));
  eq.hidden=!!it.eqOff;const eqb=h('button',{className:'chip'+(it.eqOff?'':' on'),onclick:e=>{e.stopPropagation();edit(it,{eqOff:!it.eqOff});eq.hidden=!!it.eqOff;eqb.classList.toggle('on',!it.eqOff)}},'Эквалайзер');
  bd.append(ttlInput(it,'Трек'),cv,h('div',{className:'actl'},pp,seek,tm),h('div',{className:'eqv'},h('span',{innerHTML:ic('music',14)}),'Громкость',vol,h('span',{className:'sp'}),eqb),eq);
  p.ui();setTimeout(vizKick,30)}
let vizR=0;function vizKick(){if(!vizR)vizR=requestAnimationFrame(vizFrame)}
function vizFrame(){vizR=0;let any=false;const t=performance.now();
  for(const[id,p]of Object.entries(players)){const cv=elOf(id)?.querySelector('canvas.viz');if(!cv)continue;const g=cv.getContext('2d'),W=cv.width,H=cv.height;g.clearRect(0,0,W,H);
    let d=null;if(p.an&&!p.a.paused){d=new Uint8Array(p.an.frequencyBinCount);p.an.getByteFrequencyData(d);any=true}const n=44;
    for(let i=0;i<n;i++){const v=d?d[Math.floor(i*d.length*.7/n)]/255:.05+.035*Math.sin(i/2.5+t/700);const bh=Math.max(4,v*H*.94),bw=W/n*.6,x=i*W/n+(W/n-bw)/2;
      const gr=g.createLinearGradient(0,H,0,H-bh);gr.addColorStop(0,'#7c6cff');gr.addColorStop(1,'#ec4899');g.fillStyle=gr;g.beginPath();if(g.roundRect)g.roundRect(x,H-bh,bw,bh,4);else g.rect(x,H-bh,bw,bh);g.fill()}}
  if(any)vizR=requestAnimationFrame(vizFrame)}
async function addAudioFile(f,x,y){if(f.size>30e6)return toast('Файл больше 30 МБ — выберите трек поменьше');
  const ext=(f.name.match(/\.(mp3|m4a|ogg|wav|flac|aac)$/i)?.[1]||(f.type.split('/')[1]||'mp3')).toLowerCase().replace('mpeg','mp3');
  const hash=hex(await crypto.subtle.digest('SHA-256',await f.arrayBuffer())).slice(0,32)+'.'+ext;await idb.put('images',hash,new Blob([f],{type:mimeOf(hash)}));
  if(x==null)[x,y]=spotNear(340);return addItem({type:'audio',img:hash,title:f.name.replace(/\.[^.]+$/,''),noFocus:true},x,y)}
function pickAudio(){const i=h('input',{type:'file',accept:'audio/*,.mp3,.m4a,.ogg,.wav,.flac'});i.onchange=()=>[...i.files].forEach(f=>addAudioFile(f));i.click()}

/* ================= сортировка по важности ================= */
const zonesOf=B=>live(B).filter(f=>f.type==='frame'&&(f.prio||f.inbox));
function makeZones(){const[x,y]=freeSpot();return[['inbox','Разобрать',3],['must','Необходимо',2],['should','Менее важно',1],['nope','Не нужно',0]]
  .map(([p,t,c],i)=>addItem({type:'frame',title:t,c,...(p==='inbox'?{inbox:true}:{prio:p}),w:400,h:560,noFocus:true,noSelect:true},x+i*440,y))}
function arrangeZones(){const B=board();batch(()=>{const fresh=!zonesOf(B).length;const zs=fresh?makeZones():zonesOf(B);
  const set=new Set();for(const z of zs)for(const k of frameKids(z))if(isSortable(k))set.add(k);for(const s of selItems())if(isSortable(s))set.add(s);for(const c of live(B))if(isSortable(c)&&c.prio)set.add(c);
  const cards=[...set];
  if(cards.length){const old=new Map(cards.map(c=>[c.id,elOf(c.id)?.getBoundingClientRect()]));snap([...cards.map(c=>c.id),...zs.map(z=>z.id)],true);
    for(const z of zs){const key=z.inbox?'inbox':z.prio;let cy=z.y+70,mw=0;for(const c of cards.filter(c=>(c.prio||'inbox')===key).sort((a,b)=>a.y-b.y||a.x-b.x)){c.x=z.x+20;c.y=Math.round(cy);const r=itemBox(c);cy+=r.h+16;mw=Math.max(mw,r.w);place(elOf(c.id),c);stamp(c)}
      z.w=Math.max(400,mw+40);z.h=Math.max(300,cy-z.y+20);place(elOf(z.id),z);stamp(z)}
    const sz=[...zs].sort((a,b)=>a.x-b.x);for(let i=1;i<sz.length;i++){const nx=sz[i-1].x+sz[i-1].w+40,z=sz[i];if(z.x<nx){const dx=nx-z.x,key=z.inbox?'inbox':z.prio;z.x=nx;place(elOf(z.id),z);for(const c of cards)if((c.prio||'inbox')===key){c.x+=dx;place(elOf(c.id),c)}}}
    touch(B);for(const c of cards)flip(elOf(c.id),old.get(c.id))}
  drawLinks();zoneCounts();setSel([]);
  const r=bounds(zs),W=vp.clientWidth,H=vp.clientHeight,s=clamp(Math.min((W-80)/r.w,(H-220)/r.h),.15,1);animateTo({s,x:W/2-(r.x+r.w/2)*s,y:Math.max(90,(H-r.h*s)/2)-r.y*s});
  toast(cards.length?'Разложено карточек: '+cards.length+' · перетаскивайте между зонами':fresh?'Зоны готовы — перетаскивайте в них карточки или жмите 1, 2, 3 на выделенных':'Выделите карточки или отметьте важность клавишами 1, 2, 3')})}
function toggleNope(){const on=!document.body.classList.contains('hide-nope');document.body.classList.toggle('hide-nope',on);localStorage.hideNope=on?'1':'0';toast(on?'Карточки «Не нужно» скрыты':'Карточки «Не нужно» снова видны')}
document.body.classList.toggle('nokinds',localStorage.kinds==='0');document.body.classList.toggle('hide-nope',localStorage.hideNope==='1');


/* ================= шрифты и форматирование текста ================= */
const FONTS={sys:{l:'Обычный',css:''},draw:{l:'Рукописный',css:'"Shantell Sans","Segoe Print","Comic Sans MS",cursive',g:'Shantell+Sans:ital,wght@0,300..800;1,300..800'},
  serif:{l:'С засечками',css:'"PT Serif",Georgia,"Times New Roman",serif',g:'PT+Serif:ital,wght@0,400;0,700;1,400;1,700'},mono:{l:'Моноширинный',css:'"JetBrains Mono","Cascadia Code",Consolas,monospace',g:'JetBrains+Mono:ital,wght@0,400;0,700;1,400'},
  round:{l:'Округлый',css:'Nunito,"Segoe UI",sans-serif',g:'Nunito:ital,wght@0,400;0,800;1,400;1,800'},accent:{l:'Акцентный',css:'Unbounded,"Segoe UI",sans-serif',g:'Unbounded:wght@400;800'},
  cond:{l:'Узкий',css:'Oswald,"Arial Narrow",sans-serif',g:'Oswald:wght@400;600'},hand:{l:'Каллиграфия',css:'"Marck Script","Segoe Script",cursive',g:'Marck+Script'}};
const fontsLoaded=new Set();
function ensureFont(k){const f=FONTS[k];if(!f?.g||fontsLoaded.has(k))return;fontsLoaded.add(k);document.head.append(h('link',{rel:'stylesheet',href:`https://fonts.googleapis.com/css2?family=${f.g}&display=swap`}))}
function applyText(t,it){const s=t.style;if(it.ff&&FONTS[it.ff]){ensureFont(it.ff);s.fontFamily=FONTS[it.ff].css}if(it.fs)s.fontSize=it.fs+'px';if(it.fw)s.fontWeight='750';if(it.fi)s.fontStyle='italic';
  const dec=[it.fu&&'underline',it.fst&&'line-through'].filter(Boolean).join(' ');if(dec)s.textDecoration=dec;if(it.ta)s.textAlign=it.ta;if(it.tc&&it.tc!=='auto')s.color=it.tc;if(it.lh)s.lineHeight=it.lh;if(it.nw)s.whiteSpace='pre'}
const TXT_T=new Set(['note','sticky','heading','shape']);
function textPop(a,its){closePops();const r=a.getBoundingClientRect();const card=elOf(its[0].id);
  const sel=()=>{const s=getSelection();return its[0].type==='note'&&s&&!s.isCollapsed&&card?.contains(s.anchorNode)?s:null};
  const apply=f=>{snap(its.map(x=>x.id),true);for(const x of its){f(x);for(const k of Object.keys(x))if(x[k]===undefined)delete x[k];stamp(x);const el=elOf(x.id);const t=el?.querySelector('.txt');if(t){t.removeAttribute('style');applyText(t,x)}if(x.type==='shape'){refreshShape(el,x);const bd=el.querySelector('.bd');if(bd)bd.style.alignItems={top:'flex-start',bottom:'flex-end'}[x.va]||''}}
    touch(board());updateSelUI();drawLinks();render()};
  const inline=(cmd,val)=>{document.execCommand('styleWithCSS',false,true);document.execCommand(cmd,false,val);const t=card.querySelector('.txt');edit(its[0],{html:t.innerHTML})};
  const B=(icon,title,on,fn)=>h('button',{className:'cb'+(on?' on':''),title,innerHTML:ic(icon,16),onmousedown:e=>e.preventDefault(),onclick:fn});
  const chip=(label,on,fn)=>h('button',{className:'chip'+(on?' on':''),onmousedown:e=>e.preventDefault(),onclick:fn},label);
  const p=h('div',{className:'pop glass tpop'});
  function render(){p.textContent='';const it=its[0];const fs=it.fs||(it.type==='sticky'?17:it.type==='heading'?34:15);
    p.append(h('div',{className:'phd'},'Шрифт'),h('div',{className:'fonts'},...Object.entries(FONTS).map(([k,f])=>{ensureFont(k);const b=h('button',{className:'fbtn'+((it.ff||'sys')===k?' on':''),onmousedown:e=>e.preventDefault(),onclick:()=>apply(x=>x.ff=k==='sys'?undefined:k)},f.l);if(f.css)b.style.fontFamily=f.css;return b})),
      h('div',{className:'phd'},'Размер'),h('div',{className:'tline'},B('minus','Меньше',0,()=>apply(x=>x.fs=Math.max(8,(x.fs||fs)-2))),h('span',{className:'fsv'},fs+' px'),B('plus','Больше',0,()=>apply(x=>x.fs=Math.min(240,(x.fs||fs)+2))),
        ...[12,16,22,30,44,64,96].map(v=>chip(v,fs===v,()=>apply(x=>x.fs=v)))),
      h('div',{className:'phd'},'Стиль и выравнивание'),h('div',{className:'tline'},
        B('bold','Жирный',it.fw,()=>sel()?inline('bold'):apply(x=>x.fw=x.fw?undefined:1)),B('italic','Курсив',it.fi,()=>sel()?inline('italic'):apply(x=>x.fi=x.fi?undefined:1)),
        B('underline','Подчёркнутый',it.fu,()=>sel()?inline('underline'):apply(x=>x.fu=x.fu?undefined:1)),B('strike','Зачёркнутый',it.fst,()=>sel()?inline('strikeThrough'):apply(x=>x.fst=x.fst?undefined:1)),h('span',{className:'vs'}),
        ...[['al','left','По левому краю'],['ac','center','По центру'],['ar','right','По правому краю'],['aj','justify','По ширине']].map(([i,v,t])=>B(i,t,(it.ta||(it.type==='shape'?'center':'left'))===v,()=>apply(x=>x.ta=v)))),
      h('div',{className:'tline'},h('span',{className:'muted tl'},'Цвет'),...INKS.map(c=>{const b=h('button',{className:'sw2'+((it.tc||'auto')===c?' on':''),title:c==='auto'?'Как у темы':c,onmousedown:e=>e.preventDefault(),
        onclick:()=>sel()?inline('foreColor',c==='auto'?getComputedStyle(card).color:c):apply(x=>x.tc=c==='auto'?undefined:c)});b.style.background=c==='auto'?'var(--tx)':c;return b}),
        h('label',{className:'sw2 cp',title:'Любой цвет',onmousedown:e=>e.stopPropagation()},h('input',{type:'color',className:'cpick',onchange:e=>sel()?inline('foreColor',e.target.value):apply(x=>x.tc=e.target.value)}))),
      h('div',{className:'tline'},h('span',{className:'muted tl'},'Строки'),...[[1.1,'Плотно'],[undefined,'Обычно'],[1.6,'Свободно']].map(([v,l])=>chip(l,it.lh===v,()=>apply(x=>x.lh=v)))));
    if(it.type==='shape')p.append(h('div',{className:'tline'},h('span',{className:'muted tl'},'Высота'),...[['top','Сверху'],[undefined,'По центру'],['bottom','Снизу']].map(([v,l])=>chip(l,it.va===v,()=>apply(x=>x.va=v)))));
    if(it.type==='note')p.append(h('div',{className:'muted',style:'padding:6px 4px 0;line-height:1.35'},sel()?'Жирный, курсив, подчёркивание и цвет применятся к выделенному фрагменту':'Выделите часть текста — и стиль применится только к ней'))}
  render();document.body.append(p);posPop(p,r.left-140,r.bottom+8)}

/* ================= обрезка картинок ================= */
function startCrop(it){const el=elOf(it.id);if(!el||el.classList.contains('cropping'))return;closePops();const bd=el.querySelector('.bd');let c={...(it.crop||{x:0,y:0,w:1,h:1})};
  el.classList.add('cropping');const box=h('div',{className:'imw'});box.style.aspectRatio=String(1/(it.ar||1));
  const im=h('img',{className:'im',draggable:false,alt:''});(it.src?Promise.resolve(it.src):imgURL(it.img)).then(u=>{if(u)im.src=u});
  const cb=h('div',{className:'cropbox'},...['nw','ne','se','sw','n','e','s','w'].map(d=>{const x=h('div',{className:'crh'});x.dataset.d=d;return x}));box.append(im,cb);
  const pos=()=>Object.assign(cb.style,{left:c.x*100+'%',top:c.y*100+'%',width:c.w*100+'%',height:c.h*100+'%'});pos();
  const finish=ok=>{el.classList.remove('cropping');if(ok){const full=c.w>.995&&c.h>.995,oc=it.crop||{x:0,y:0,w:1,h:1},ow=it.w;
      edit(it,()=>{if(full)delete it.crop;else it.crop={x:+c.x.toFixed(4),y:+c.y.toFixed(4),w:+c.w.toFixed(4),h:+c.h.toFixed(4)};it.w=Math.max(40,Math.round(ow*(c.w/oc.w)))})}
    rerenderCard(it.id);buildSel()};
  const bar=h('div',{className:'cropbar'},h('button',{className:'btn sm',onclick:e=>{e.stopPropagation();c={x:0,y:0,w:1,h:1};pos()}},'Сбросить'),
    h('button',{className:'btn sm',onclick:e=>{e.stopPropagation();finish(false)}},'Отмена'),h('button',{className:'btn pri sm',onclick:e=>{e.stopPropagation();finish(true)}},'Готово'));
  bd.replaceChildren(box,bar);
  cb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const d=e.target.dataset.d||'move',R=box.getBoundingClientRect(),s={...c},sx=e.clientX,sy=e.clientY;
    beginOp(e.pointerId,ev=>{const dx=(ev.clientX-sx)/R.width,dy=(ev.clientY-sy)/R.height;let{x,y,w,h:hh}=s;
      if(d==='move'){x=clamp(s.x+dx,0,1-s.w);y=clamp(s.y+dy,0,1-s.h)}
      else{if(d.includes('w')){x=clamp(s.x+dx,0,s.x+s.w-.04);w=s.x+s.w-x}if(d.includes('e'))w=clamp(s.w+dx,.04,1-s.x);if(d.includes('n')){y=clamp(s.y+dy,0,s.y+s.h-.04);hh=s.y+s.h-y}if(d.includes('s'))hh=clamp(s.h+dy,.04,1-s.y)}
      c={x,y,w,h:hh};pos()},()=>{},()=>{})});
  toast('Тяните рамку и её углы · «Готово» — сохранить')}

/* ================= лупа с «рыбьим глазом» ================= */
const fishMaps={};
function fishMap(f){const key=f.toFixed(2);if(fishMaps[key])return fishMaps[key];const N=200,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),im=g.createImageData(N,N),pw=1+f*1.8;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=(x+.5)/N*2-1,dy=(y+.5)/N*2-1,r=Math.hypot(dx,dy);let ox=0,oy=0;if(r<1&&r>0){const k=(Math.pow(r,pw)-r)/r;ox=dx*k;oy=dy*k}
    const i=(y*N+x)*4;im.data[i]=Math.round(clamp(128+ox*127,0,255));im.data[i+1]=Math.round(clamp(128+oy*127,0,255));im.data[i+2]=128;im.data[i+3]=255}
  g.putImageData(im,0,0);return fishMaps[key]=cv.toDataURL()}
function fillLens(it,el){el.replaceChildren();const id='fe'+it.id,W=it.w,f=it.fish??.6;
  const s=document.createElementNS(NS,'svg');s.setAttribute('width','0');s.setAttribute('height','0');s.style.position='absolute';
  s.innerHTML=`<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feImage href="${fishMap(f)}" x="0" y="0" width="${W}" height="${W}" preserveAspectRatio="none" result="m"/><feDisplacementMap in="SourceGraphic" in2="m" scale="${W}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const inner=h('div',{className:'lens-in'},h('div',{className:'lens-w'}));if(f>0)inner.style.filter=`url(#${id})`;
  el.append(s,inner,h('div',{className:'lens-rim'}),h('div',{className:'lens-lbl'},'×'+(+(it.zoom||2.2)).toFixed(1)));setTimeout(()=>updateLens(it,el),0)}
function updateLens(it,el){el=el||elOf(it.id);const wr=el?.querySelector('.lens-w');if(!wr)return;const k=it.zoom||2.2,r=it.w/2,cx=it.x+r,cy=it.y+r,R=r/k+60;
  const frag=document.createDocumentFragment();const s1=svg.cloneNode(true),s2=ropesSvg.cloneNode(true);for(const x of[s1,s2]){x.removeAttribute('id');x.classList.add('lsvg')}frag.append(s1);
  for(const c of cardsEl.children){if(c===el||c.classList.contains('t-lens'))continue;const L=c.offsetLeft,T=c.offsetTop;if(L>cx+R||L+c.offsetWidth<cx-R||T>cy+R||T+c.offsetHeight<cy-R)continue;
    const cl=c.cloneNode(true);cl.removeAttribute('data-id');cl.classList.remove('sel','enter','lift','leave');cl.style.visibility='';
    for(const x of cl.querySelectorAll('[data-id],[id]')){x.removeAttribute('data-id');x.removeAttribute('id')}for(const im of cl.querySelectorAll('img'))im.removeAttribute('loading');for(const fr of cl.querySelectorAll('iframe'))fr.replaceWith(h('div',{style:'flex:1;background:#000;border-radius:10px'}));frag.append(cl)}
  frag.append(s2);wr.replaceChildren(frag);wr.style.transform=`translate(${r-cx*k}px,${r-cy*k}px) scale(${k})`;
  const inn=el.querySelector('.lens-in');inn.style.backgroundSize=`${24*k}px ${24*k}px`;inn.style.backgroundPosition=`${r-cx*k}px ${r-cy*k}px`}
let lensT=0;function lensTick(){const b=board();if(!b||lensT)return;lensT=setTimeout(()=>{lensT=0;for(const it of live(b))if(it.type==='lens')updateLens(it)},90)}

/* ================= кнопки-ссылки ================= */
function fillButton(it,el){const col=COLORS[it.c]||'#7c6cff';const tgt=it.link?linkLabel(it.link):'Выберите, куда ведёт';
  const b=h('div',{className:'bt',style:`--bc:${col}`,title:'Нажмите — перейти · тяните — переместить · правый клик — изменить'},h('span',{className:'btx'},it.text||(it.link?linkLabel(it.link).replace(/^→ /,''):'Кнопка')),h('span',{innerHTML:ic(it.link?.startsWith('board:')?'right':'ext',16)}));
  const t=h('div',{className:'btx2'});applyText(t,it);b.firstChild.style.cssText=t.style.cssText;el.append(b,h('div',{className:'bsub'},tgt))}
function addButton(at){const x=at?.x,y=at?.y;const it=addItem({type:'button',text:'',noFocus:true},x,y);setTimeout(()=>{const el=elOf(it.id);if(el)linkPop(el,[it])},60)}

/* ================= поворот, замок, выравнивание ================= */
function startRotate(e,it){e.preventDefault();e.stopPropagation();if(it.locked)return;const el=elOf(it.id);const r=itemBox(it),c={x:r.x+r.w/2,y:r.y+r.h/2};let moved=false;
  beginOp(e.pointerId,ev=>{const p=toWorld(ev.clientX,ev.clientY);let a=Math.atan2(p.y-c.y,p.x-c.x)+Math.PI/2;a=Math.atan2(Math.sin(a),Math.cos(a));
    if(!moved){moved=true;snap([it.id],true);document.body.classList.add('dragging')}
    if(ev.shiftKey)a=Math.round(a/(Math.PI/12))*Math.PI/12;else if(Math.abs(a)<.06)a=0;
    if(a)it.rot=+a.toFixed(4);else delete it.rot;place(el,it);updateSelUI();drawLinks();lensTick()},
  ()=>{document.body.classList.remove('dragging');if(moved){stamp(it);touch(board())}},()=>document.body.classList.remove('dragging'))}
function alignSel(mode){const its=selItems().filter(i=>!i.locked&&i.type!=='pin');if(its.length<2)return;const bs=its.map(i=>({i,r:itemBox(i)})),R=bounds(its);
  const old=new Map(its.map(i=>[i.id,elOf(i.id)?.getBoundingClientRect()]));snap(its.map(i=>i.id),true);
  if(mode==='dh'||mode==='dv'){const k=mode==='dh'?'x':'y',s=mode==='dh'?'w':'h';bs.sort((a,b)=>a.r[k]-b.r[k]);const gap=(R[s]-bs.reduce((a,b)=>a+b.r[s],0))/(bs.length-1);let p=R[k];for(const b of bs){b.i[k]=Math.round(p+(b.i[k]-b.r[k]));p+=b.r[s]+gap}}
  else for(const{i,r}of bs){if(mode==='l')i.x+=R.x-r.x;if(mode==='c')i.x+=Math.round(R.x+R.w/2-(r.x+r.w/2));if(mode==='r')i.x+=R.x+R.w-(r.x+r.w);if(mode==='t')i.y+=R.y-r.y;if(mode==='m')i.y+=Math.round(R.y+R.h/2-(r.y+r.h/2));if(mode==='b')i.y+=R.y+R.h-(r.y+r.h)}
  for(const i of its){place(elOf(i.id),i);stamp(i);flip(elOf(i.id),old.get(i.id))}touch(board());drawLinks();updateSelUI();lensTick()}
function alignMenu(a){const r=a.getBoundingClientRect();menu(r.left,r.bottom+6,[{head:'Выровнять'},{icon:'al',label:'По левому краю',fn:()=>alignSel('l')},{icon:'ac',label:'По центру (горизонтально)',fn:()=>alignSel('c')},
  {icon:'ar',label:'По правому краю',fn:()=>alignSel('r')},{icon:'alignv',label:'По верхнему краю',fn:()=>alignSel('t')},{icon:'alignv',label:'По середине (вертикально)',fn:()=>alignSel('m')},{icon:'alignv',label:'По нижнему краю',fn:()=>alignSel('b')},
  {head:'Распределить'},{icon:'aj',label:'Равные промежутки по горизонтали',fn:()=>alignSel('dh')},{icon:'aj',label:'Равные промежутки по вертикали',fn:()=>alignSel('dv')}])}

/* ================= дерево досок: родители и поддоски ================= */
function isAnc(a,b){let x=boards[b],g=0;while(x&&g++<60){if(x.id===a)return true;x=boards[x.parent]}return false}
function setParent(child,parent){const c=boards[child];if(!c||child===parent||(parent&&isAnc(child,parent)))return false;if(parent)c.parent=parent;else delete c.parent;c.parentAt=now();touch(c);return true}
function adopt(child,parent){const c=boards[child];if(!c||c.parent||child===parent||isAnc(child,parent)||chain(parent)[0]?.id===child)return;if(setParent(child,parent)){toast(`«${c.title}» теперь поддоска «${boards[parent]?.title}»`);renderCrumbs()}}
function adoptFromLinks(b){for(const it of live(b)){const l=it.link||(it.type==='link'?it.url:'');if(l?.startsWith('board:'))adopt(l.slice(6).split('#')[0],b.id)}}
function chain(id){const out=[];let b=boards[id],g=0;while(b&&g++<30){out.unshift(b);const p=b.parent&&boards[b.parent];b=p&&!p.deleted?p:null}return out}
const kidsOf=id=>Object.values(boards).filter(b=>!b.deleted&&b.parent===id).sort(bOrder);
function renderCrumbs(){const c=$('#crumbs');if(!c)return;c.textContent='';const ch=chain(cur);
  for(const b of ch.slice(0,-1))c.append(h('button',{className:'crumb',title:'Перейти к родительской доске',onclick:()=>{navStack.push(cur);openBoard(b.id);$('#backBtn').hidden=false}},b.title||'Без названия'),h('span',{className:'csep'},'›'))}
function renderTree(body){const root=chain(cur)[0];if(!root)return;const showAll=renderTree.all;
  const row=(b,d)=>{const k=kidsOf(b.id),p=boardProgress(b);const r=h('div',{className:'trow tree'+(b.id===cur?' on':''),style:`padding-left:${8+d*20}px`},
    h('span',{innerHTML:ic(k.length?'tree':'menu',15),className:'muted'}),h('div',{className:'tx',onclick:()=>{if(b.id!==cur){navStack.push(cur);openBoard(b.id);$('#backBtn').hidden=false}}},
      h('div',{},b.title||'Без названия'),h('small',{},(k.length?k.length+' '+plural(k.length,'поддоска','поддоски','поддосок')+' · ':'')+(p?Math.round(p.p*100)+'% задач':live(b).length+' карточек'))),
    ibtn('plus','Создать поддоску',()=>{const n=createBoard('Новая поддоска','empty');setParent(n.id,b.id);navStack.push(cur);openBoard(n.id);$('#backBtn').hidden=false;setTimeout(()=>{titleIn.focus();titleIn.select()},60)}));
    body.append(r);for(const c of k)row(c,d+1)};
  body.append(h('div',{className:'filters'},h('button',{className:'chip'+(showAll?'':' on'),onclick:()=>{renderTree.all=false;renderWin('tree',true)}},'Эта ветка'),h('button',{className:'chip'+(showAll?' on':''),onclick:()=>{renderTree.all=true;renderWin('tree',true)}},'Все доски')));
  if(showAll){for(const b of Object.values(boards).filter(b=>!b.deleted&&(!b.parent||!boards[b.parent]||boards[b.parent].deleted)).sort(bOrder))row(b,0)}else row(root,0);
  body.append(h('div',{className:'muted',style:'padding:10px 4px 0;line-height:1.4'},'Ссылка или кнопка на доску без родителя делает её поддоской текущей. Родителя можно сменить в списке проектов (☰ → ⋯).'))}
function boardMenu(x,y,b){menu(x,y,[{icon:'edit',label:'Переименовать',fn:()=>{const t=prompt('Название доски:',b.title);if(t?.trim()){b.title=t.trim();b.titleAt=now();touch(b);renderBoardList();if(b.id===cur){titleIn.value=b.title}renderCrumbs()}}},
  {icon:'tree',label:'Сделать поддоской…',sub:'Выбрать родительскую доску',fn:()=>{const opts=Object.values(boards).filter(o=>!o.deleted&&o.id!==b.id&&!isAnc(b.id,o.id));
    menu(x,y,[{head:'Родитель для «'+b.title+'»'},...opts.map(o=>({icon:'menu',label:o.title||'Без названия',fn:()=>{setParent(b.id,o.id);renderBoardList();renderCrumbs()}}))])}},
  ...(b.parent?[{icon:'back',label:'Сделать главной (без родителя)',fn:()=>{setParent(b.id,null);renderBoardList();renderCrumbs()}}]:[]),
  {icon:'plus',label:'Создать поддоску',fn:()=>{const n=createBoard('Новая поддоска','empty');setParent(n.id,b.id);openBoard(n.id);setTimeout(()=>{titleIn.focus();titleIn.select()},60)}},'-',
  {icon:'trash',label:'Удалить доску',danger:true,fn:()=>{if(!confirm(`Удалить доску «${b.title}»? Поддоски станут главными.`))return;b.deleted=true;b.delAt=now();touch(b);
    if(b.id===cur){const n=Object.values(boards).find(o=>!o.deleted);openBoard(n?n.id:createBoard('Новый проект').id)}renderBoardList()}}])}


/* ================= перетаскивание досок в списке ================= */
const bOrder=(a,b)=>(a.order??1e9)-(b.order??1e9)||(a.title||'').localeCompare(b.title||'');
let blistSuppress=false;
function placeBoard(id,tgt,mode){const t=boards[tgt],par=t.parent&&boards[t.parent]&&!boards[t.parent].deleted?t.parent:null;
  const sib=Object.values(boards).filter(b=>!b.deleted&&b.id!==id&&((b.parent&&boards[b.parent]&&!boards[b.parent].deleted?b.parent:null)===par)).sort(bOrder);
  sib.splice(sib.indexOf(t)+(mode==='after'?1:0),0,boards[id]);
  if(boards[id].parent!==par&&!setParent(id,par))return;sib.forEach((b,i)=>{if(b.order!==i*10){b.order=i*10;b.parentAt=now();touch(b)}})}
$('#blist').addEventListener('pointerdown',e=>{const row=e.target.closest('.bi');if(!row||e.button!==0||e.target.closest('button'))return;const id=row.dataset.bid;if(!id)return;
  const sx=e.clientX,sy=e.clientY,touchP=e.pointerType==='touch';let ready=!touchP,drag=false,ghost=null,mode=null,tgt=null;const dr=$('#drawer');
  const lt=touchP?setTimeout(()=>{ready=true;navigator.vibrate?.(15);row.classList.add('lifted');$('#blist').style.touchAction='none'},380):0;
  const clear=()=>{for(const x of document.querySelectorAll('.bi.drop-inside,.bi.drop-before,.bi.drop-after'))x.classList.remove('drop-inside','drop-before','drop-after');$('#rootDrop').classList.remove('on')};
  const end=()=>{clearTimeout(lt);ghost?.remove();row.classList.remove('dragsrc','lifted');dr.classList.remove('dnd');clear();$('#blist').style.touchAction=''};
  beginOp(e.pointerId,ev=>{if(!ready){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){clearTimeout(lt);end();endOp()}return}
    if(!drag){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<6)return;drag=true;row.classList.add('dragsrc');dr.classList.add('dnd');ghost=h('div',{className:'bghost glass'},boards[id]?.title||'Доска');document.body.append(ghost)}
    ghost.style.left=ev.clientX+14+'px';ghost.style.top=ev.clientY+10+'px';clear();
    const el=document.elementFromPoint(ev.clientX,ev.clientY),r2=el?.closest('.bi');mode=null;tgt=null;
    if(r2&&r2.dataset.bid&&r2.dataset.bid!==id&&!isAnc(id,r2.dataset.bid)){const rr=r2.getBoundingClientRect(),f=(ev.clientY-rr.top)/rr.height;mode=f<.25?'before':f>.75?'after':'inside';tgt=r2.dataset.bid;r2.classList.add('drop-'+mode)}
    else if(el?.closest('#rootDrop')){mode='root';$('#rootDrop').classList.add('on')}
    else if(el?.closest('#scrim')||!el?.closest('#drawer'))mode='canvas';
    const lb=$('#blist').getBoundingClientRect();if(ev.clientY<lb.top+30)$('#blist').scrollTop-=10;else if(ev.clientY>lb.bottom-30)$('#blist').scrollTop+=10;
    ghost.dataset.hint={inside:'↳ сделать поддоской «'+(boards[tgt]?.title||'')+'»',before:'↑ поставить выше',after:'↓ поставить ниже',root:'⇱ сделать главной доской',canvas:'Отпустите — кнопка-ссылка на эту доску'}[mode]||''},
  ev=>{const m=mode,t=tgt;end();if(!drag)return;blistSuppress=true;setTimeout(()=>blistSuppress=false,50);
    if(m==='inside'){if(setParent(id,t)){const col=new Set(JSON.parse(localStorage.collapsed||'[]'));col.delete(t);localStorage.collapsed=JSON.stringify([...col]);localStorage.hideSubs='0';toast(`«${boards[id].title}» — теперь поддоска «${boards[t].title}»`)}}
    else if(m==='before'||m==='after')placeBoard(id,t,m);
    else if(m==='root'){setParent(id,null);toast(`«${boards[id].title}» — теперь главная доска`)}
    else if(m==='canvas'&&id!==cur){closeDrawer();const p=toWorld(ev.clientX,ev.clientY);batch(()=>addItem({type:'button',text:boards[id].title,link:'board:'+id,noFocus:true},p.x-110,p.y-26));adopt(id,cur)}
    renderBoardList();renderCrumbs();if(wins.tree)renderWin('tree',true)},end)});

/* ================= мини-карта ================= */
const mmBox=$('#minimap'),mmCv=mmBox.querySelector('canvas');let mmR=0;
const mmOn=()=>localStorage.minimap!=='0'&&innerWidth>700;
function scheduleMinimap(){if(!mmR)mmR=requestAnimationFrame(drawMinimap)}
function mmGeom(){const b=board();const its=b?live(b):[];const W=vp.clientWidth,H=vp.clientHeight;const v={x:-view.x/view.s,y:-view.y/view.s,w:W/view.s,h:H/view.s};
  let r=its.length?bounds(its):{x:v.x,y:v.y,w:v.w,h:v.h};const x0=Math.min(r.x,v.x),y0=Math.min(r.y,v.y),x1=Math.max(r.x+r.w,v.x+v.w),y1=Math.max(r.y+r.h,v.y+v.h);
  const CW=mmCv.width,CH=mmCv.height,pad=8,k=Math.min((CW-2*pad)/(x1-x0||1),(CH-2*pad)/(y1-y0||1));return{its,v,k,ox:pad-x0*k+((CW-2*pad)-(x1-x0)*k)/2,oy:pad-y0*k+((CH-2*pad)-(y1-y0)*k)/2}}
function drawMinimap(){mmR=0;mmBox.hidden=!mmOn()||!board();if(mmBox.hidden)return;const g=mmCv.getContext('2d'),{its,v,k,ox,oy}=mmGeom();g.clearRect(0,0,mmCv.width,mmCv.height);
  const tx=getComputedStyle(document.body).color;
  for(const it of its){const r=itemBox(it);const x=ox+r.x*k,y=oy+r.y*k,w=Math.max(2,r.w*k),hh=Math.max(2,r.h*k);
    if(it.type==='frame'){g.strokeStyle=COLORS[it.c]||'#8b90a0';g.globalAlpha=.7;g.lineWidth=1;g.strokeRect(x,y,w,hh)}
    else{g.fillStyle=it.type==='sticky'?(COLORS[it.c]||'#fbbf24'):it.type==='image'?'#94a3b8':it.type==='draw'?(it.color&&it.color!=='auto'?it.color:tx):(COLORS[it.c]||tx);g.globalAlpha=it.type==='draw'?.5:.55;g.fillRect(x,y,w,hh)}}
  g.globalAlpha=1;g.strokeStyle='#7c6cff';g.lineWidth=2;g.fillStyle='rgba(124,108,255,.12)';g.fillRect(ox+v.x*k,oy+v.y*k,v.w*k,v.h*k);g.strokeRect(ox+v.x*k,oy+v.y*k,v.w*k,v.h*k)}
mmCv.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const go=ev=>{const R=mmCv.getBoundingClientRect(),{k,ox,oy}=mmGeom();const wx=((ev.clientX-R.left)*mmCv.width/R.width-ox)/k,wy=((ev.clientY-R.top)*mmCv.height/R.height-oy)/k;
    tv=null;view.x=vp.clientWidth/2-wx*view.s;view.y=vp.clientHeight/2-wy*view.s;applyView()};go(e);beginOp(e.pointerId,go,()=>{},()=>{})});
$('#mmBtn').onclick=()=>{localStorage.minimap=mmOn()?'0':'1';scheduleMinimap();if(!mmOn())mmBox.hidden=true};
addEventListener('resize',scheduleMinimap);

/* ================= показ разделов как слайдов ================= */
let pres=null;
function startPresent(){const fr=live(board()).filter(i=>i.type==='frame').sort((a,b)=>Math.round(a.y/300)-Math.round(b.y/300)||a.x-b.x);
  if(!fr.length)return toast('Создайте разделы (F) — каждый станет слайдом');setSel([]);closePops();document.body.classList.add('presenting');pres={fr,i:0};
  const hud=h('div',{id:'phud',className:'glass'},ibtn('left','Назад (←)',()=>presGo(-1)),h('span',{id:'pnum'}),ibtn('right','Дальше (→, пробел)',()=>presGo(1)),h('span',{className:'vs'}),ibtn('x','Выйти (Esc)',stopPresent));document.body.append(hud);presGo(0)}
function presGo(d){if(!pres)return;pres.i=clamp(pres.i+d,0,pres.fr.length-1);const f=pres.fr[pres.i];const W=innerWidth,H=innerHeight,s=clamp(Math.min((W-60)/f.w,(H-110)/(f.h||400)),.1,3);
  animateTo({s,x:W/2-(f.x+f.w/2)*s,y:(H-50)/2-(f.y+(f.h||400)/2)*s});$('#pnum').textContent=`${pres.i+1} / ${pres.fr.length} · ${f.title||'Раздел'}`}
function stopPresent(){document.body.classList.remove('presenting');$('#phud')?.remove();pres=null}
document.addEventListener('keydown',e=>{if(!pres)return;if(['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();presGo(1)}
  else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();presGo(-1)}else if(e.key==='Escape'){e.stopImmediatePropagation();stopPresent()}},true);

/* ================= приглашение друга ================= */
const appURL=()=>location.origin+location.pathname;
function inviteText(){if(!cfg.owner||!cfg.repo)return null;return`Привет! Присоединяйся к моим доскам в Partitura.
1) Прими приглашение от GitHub (придёт на почту или на github.com/notifications).
2) Создай токен: https://github.com/settings/tokens/new?scopes=repo&description=%D0%94%D0%BE%D1%81%D0%BA%D0%B8 — срок на твой выбор, галочка «repo» уже стоит, нажми «Generate token» и скопируй его.
3) Открой ${appURL()}?join=${encodeURIComponent(cfg.owner+'/'+cfg.repo)} — вставь токен и своё имя.`}
function inviteFlow(){if(!cfg.owner)return toast('Сначала настройте синхронизацию с GitHub');const t=inviteText();
  openWin('invite','Пригласить друга',body=>{body.append(
    h('div',{className:'sec'},'Шаг 1 — дать доступ к хранилищу'),h('div',{className:'muted',style:'line-height:1.45'},'Откройте настройки доступа репозитория, нажмите «Add people» и введите логин или почту друга на GitHub (если аккаунта нет — пусть создаст на github.com, это бесплатно).'),
    h('div',{className:'filters',style:'margin-top:8px'},h('button',{className:'btn pri sm',onclick:()=>window.open(`https://github.com/${cfg.owner}/${cfg.repo}/settings/access`,'_blank','noopener')},'Открыть доступы репозитория ↗')),
    h('div',{className:'sec'},'Шаг 2 — отправить приглашение'),h('div',{className:'muted',style:'line-height:1.45'},'Скопируйте текст и отправьте другу в мессенджер — в нём ссылка, по которой у него сразу заполнятся настройки.'),
    h('textarea',{className:'ta',rows:7,readOnly:true,value:t,style:'margin-top:8px;font-size:12.5px'}),
    h('div',{className:'filters',style:'margin-top:8px'},h('button',{className:'btn pri sm',onclick:()=>{navigator.clipboard?.writeText(t);toast('Приглашение скопировано')}},'Скопировать приглашение'),
      navigator.share?h('button',{className:'btn sm',onclick:()=>navigator.share({title:'Доски',text:t}).catch(()=>{})},'Поделиться…'):null),
    h('div',{className:'muted',style:'margin-top:10px;line-height:1.45'},'Когда друг подключится, вы увидите его курсор и правки в реальном времени, а его имя — в шапке доски.'))})}
(()=>{const j=new URLSearchParams(location.search).get('join');if(!j)return;history.replaceState(null,'',location.pathname);const[o,r]=j.split('/');
  setTimeout(()=>{openSettings();if(!cfg.token){$('#sOwner').value=o||'';$('#sRepo').value=r||''}const m=$('#setMsg');m.style.color='var(--acc)';
    m.innerHTML=`Вас пригласили в доски <b>${esc(o)}/${esc(r)}</b>. Вставьте свой токен (<a href="https://github.com/settings/tokens/new?scopes=repo&description=%D0%94%D0%BE%D1%81%D0%BA%D0%B8" target="_blank" rel="noopener" style="color:var(--acc)">создать</a>) и имя, затем «Сохранить».`},400)})();


/* ================= тема «Терминал», бренд, ASCII ================= */
const THEMES=['term','dark','light'],THN={term:'Терминал',dark:'Тёмная',light:'Светлая'};
if(localStorage.themeV!=='2'){localStorage.theme='term';localStorage.themeV='2'}
setTheme=function(t){if(!THEMES.includes(t))t='term';document.documentElement.dataset.theme=t;localStorage.theme=t;const nx=THEMES[(THEMES.indexOf(t)+1)%3];
  $('#themeBtn').innerHTML=ic(nx==='light'?'sun':nx==='dark'?'moon':'term');$('#themeBtn').title=`Тема: ${THN[t]} → ${THN[nx]}`;
  document.querySelector('meta[name=theme-color]').content={term:'#040804',dark:'#0d0e12',light:'#f2f3f7'}[t];if(t==='term')ensureFont('mono');
  document.body.classList.toggle('crt',t==='term'&&localStorage.crt!=='0');drawLinks();if(typeof scheduleMinimap==='function')scheduleMinimap()};
ICONS.term=P('m4 17 6-6-6-6|M12 19h8');
const LOGO_SVG=(s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="18" rx="2.5"/><path d="M5 8h14M5 11h14M5 14h14M5 17h14" opacity=".28"/><path d="m6.5 9.5 3 2.5-3 2.5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15.5h5" stroke-width="2.4" stroke-linecap="round"/></svg>`;
(()=>{const b=h('div',{id:'brand',title:'Partitura'});b.innerHTML=LOGO_SVG()+'<span>partitura<i class="cur"></i></span>';$('#menuBtn').after(b)})();
const FONT6={P:['██████╗ ','██╔══██╗','██████╔╝','██╔═══╝ ','██║     ','╚═╝     '],A:[' █████╗ ','██╔══██╗','███████║','██╔══██║','██║  ██║','╚═╝  ╚═╝'],
  R:['██████╗ ','██╔══██╗','██████╔╝','██╔══██╗','██║  ██║','╚═╝  ╚═╝'],T:['████████╗','╚══██╔══╝','   ██║   ','   ██║   ','   ██║   ','   ╚═╝   '],
  I:['██╗','██║','██║','██║','██║','╚═╝'],U:['██╗   ██╗','██║   ██║','██║   ██║','██║   ██║','╚██████╔╝',' ╚═════╝ ']};
const banner=w=>[0,1,2,3,4,5].map(r=>[...w].map(c=>FONT6[c][r]).join('')).join('\n');
function asciiBox(lines){const w=Math.max(...lines.map(l=>l.length));return['┌'+'─'.repeat(w+2)+'┐',...lines.map(l=>'│ '+l.padEnd(w)+' │'),'└'+'─'.repeat(w+2)+'┘'].join('\n')}
function bootScreen(){if(sessionStorage.booted||localStorage.theme!=='term')return;sessionStorage.booted=1;
  const nB=Object.values(boards).filter(b=>!b.deleted).length,nI=Object.values(boards).reduce((a,b)=>a+live(b).length,0);
  const lines=[['ok',`[  OK  ] монтирую ~/boards ............. ${nB} ${plural(nB,'доска','доски','досок')}, ${nI} ${plural(nI,'карточка','карточки','карточек')}`],
    ['ok',`[  OK  ] синхронизация ................ ${cfg.owner?'github://'+cfg.owner+'/'+cfg.repo:'локально (не настроена)'}`],
    ['ok',`[  OK  ] p2p-канал .................... ${cfg.token&&localStorage.live!=='0'?'слушаю пиров':'выключен'}`],
    ['ok','[  OK  ] шрифты, палитры, вдохновение . загружено'],['ok',`[  OK  ] оператор ..................... ${me()||'гость'}`],
    ['dim','partitura v2026.11 :: нажмите любую клавишу']];
  const el=h('div',{id:'boot'});el.append(h('pre',{},banner('PARTITURA')),h('div',{className:'sub'},'ДОСКИ · ИДЕИ · КОМАНДА'));const log=h('div',{className:'log'});el.append(log);document.body.append(el);
  let i=0,done=false;const close=()=>{if(done)return;done=true;el.classList.add('hide');setTimeout(()=>el.remove(),500);removeEventListener('keydown',close,true)};
  const step=()=>{if(done)return;if(i<lines.length){const[c,t]=lines[i++];log.append(h('div',{className:c},t));setTimeout(step,i===lines.length?450:130)}else setTimeout(close,650)};
  setTimeout(step,250);el.addEventListener('click',close);addEventListener('keydown',close,true)}
function emptyHint(){let e=$('#emptyHint');const b=board();const show=b&&!live(b).length;if(!show){e?.remove();return}if(e)return;
  e=h('pre',{id:'emptyHint'});e.innerHTML=esc(asciiBox(['> доска пуста_','','[N] стикер   [T] текст   [F] раздел','[D] фигуры и диаграммы   [I] пин','двойной клик — добавить что угодно','Ctrl+V — картинка, ссылка, видео','колесо — зум, зажатое колесо — камера'])).replace('пуста_','пуста<i class="cur"></i>');document.body.append(e)}

/* ================= запуск ================= */
(async()=>{setTheme(localStorage.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));buildDock();setTool('select');
  for(const b of await idb.all('boards'))boards[b.id]=b;
  const first=()=>{const b=createBoard('Мой первый проект','project');
    const tip=mk({type:'sticky',c:4,w:270,text:'Как пользоваться:\n• клик — выделить, ещё клик — редактировать\n• рамкой по фону — выделить несколько\n• колесо — зум, пробел/средняя кнопка — двигать холст\n• двойной клик по фону — добавить\n• P — карандаш, A — стрелка, I — пин, R — верёвка\n• Ctrl+V — картинка, ссылка или видео\n• 💡 и ✦ внизу — вдохновение и ИИ'},1300,80);b.items[tip.id]=tip;return b};
  if(!Object.values(boards).some(b=>!b.deleted)&&!cfg.token)first();
  const start=boards[localStorage.cur]&&!boards[localStorage.cur].deleted?localStorage.cur:Object.values(boards).find(b=>!b.deleted)?.id;
  if(start)openBoard(start);bootScreen();setSync(cfg.token?'ok':'off');
  if(cfg.token){await sync();if(!Object.values(boards).some(b=>!b.deleted))openBoard(first().id)}
  setInterval(()=>document.visibilityState==='visible'&&sync(),60000);setInterval(pollCur,4000);
  setInterval(()=>{paintMeta();if(wins.activity)renderWin('activity')},60000);
  setInterval(()=>{if(RT.on&&!openPeers().length)rtHello()},90000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){flushSaves();if(RT.q.size)rtFlush()}sync();if(document.visibilityState==='visible')rtHello()});
  if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js')})();
