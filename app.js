/* Crescimento Infantil OMS v0.2 - atualização online + cache local validado */
const APP_VERSION='0.2';
const CACHE_KEY='who_refs_v2';
const ONLINE={
  // Representação machine-readable dos coeficientes LMS das referências WHO.
  // O app tenta atualizar a cada abertura e só substitui o cache após validação.
  who2006:'https://raw.githubusercontent.com/rcpch/growth-references/refs/heads/main/who2006/WHO2006.csv',
  who2007:'https://raw.githubusercontent.com/rcpch/growth-references/refs/heads/main/who2006/WHO2007.csv'
};
const OFFICIAL={
  who2006:'https://www.who.int/toolkits/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age',
  who2007:'https://www.who.int/toolkits/growth-reference-data-for-5to19-years/indicators/bmi-for-age'
};
let sex='M', ref2006=[], ref2007=[], refMeta={mode:'', fetchedAt:null};
const $=id=>document.getElementById(id);

if(window.Telegram?.WebApp){Telegram.WebApp.ready();Telegram.WebApp.expand();}

document.querySelectorAll('.sex-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.sex-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); sex=b.dataset.sex;
}));

function parseCSV(text){return text.trim().split(/\r?\n/).map(line=>line.split(','));}
function parse2006(text){
  const rows=parseCSV(text).slice(4), out=[];
  for(const r of rows){
    const m=Number(r[0]), years=Number(r[1]); if(!Number.isFinite(m)||!Number.isFinite(years)) continue;
    if(Math.abs(years-m/12)>0.006) continue;
    out.push({m,boys:{L:+r[14],M:+r[15],S:+r[16]},girls:{L:+r[17],M:+r[18],S:+r[19]}});
  }
  return out;
}
function parse2007(text){
  const rows=parseCSV(text).slice(4), out=[];
  for(const r of rows){
    const m=+r[0]; if(!Number.isFinite(m)) continue;
    out.push({m,boys:{L:+r[14],M:+r[15],S:+r[16]},girls:{L:+r[17],M:+r[18],S:+r[19]}});
  }
  return out;
}
function sanePoint(p){return p&&Number.isFinite(p.L)&&Number.isFinite(p.M)&&Number.isFinite(p.S)&&p.M>5&&p.M<40&&p.S>0&&p.S<1;}
function validateRefs(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length<55||b.length<150) throw Error('quantidade insuficiente');
  const aMonths=a.map(x=>x.m), bMonths=b.map(x=>x.m);
  if(Math.min(...aMonths)>0||Math.max(...aMonths)<60) throw Error('WHO2006 incompleta');
  if(Math.min(...bMonths)>61||Math.max(...bMonths)<180) throw Error('WHO2007 incompleta');
  for(const row of [...a,...b]) if(!Number.isFinite(row.m)||!sanePoint(row.boys)||!sanePoint(row.girls)) throw Error('coeficiente inválido');
  return true;
}
async function fetchText(url){
  const r=await fetch(url,{cache:'no-store',headers:{'Accept':'text/plain,*/*'}});
  if(!r.ok) throw Error(`HTTP ${r.status}`);
  return r.text();
}
function saveCache(a,b){
  const payload={version:2,fetchedAt:new Date().toISOString(),a,b};
  localStorage.setItem(CACHE_KEY,JSON.stringify(payload)); return payload;
}
function loadCache(){
  const raw=localStorage.getItem(CACHE_KEY); if(!raw) return null;
  const j=JSON.parse(raw); validateRefs(j.a,j.b); return j;
}
function fmtDate(iso){if(!iso)return'—';return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(iso));}
function showRefState(mode,at){
  refMeta={mode,fetchedAt:at};
  const el=$('ref-status');
  if(mode==='online'){el.className='status ref-status ok';el.textContent=`Referência online validada nesta abertura • ${fmtDate(at)}`;}
  else {el.className='status ref-status warn';el.textContent=`Sem atualização online: usando última cópia válida • ${fmtDate(at)}`;}
}
async function loadRefs(){
  let cached=null;
  try{cached=loadCache(); if(cached){ref2006=cached.a;ref2007=cached.b;showRefState('cache',cached.fetchedAt);$('status').textContent='Referência local pronta; verificando atualização online…';}}catch(e){localStorage.removeItem(CACHE_KEY);}
  try{
    const [ta,tb]=await Promise.all([fetchText(ONLINE.who2006),fetchText(ONLINE.who2007)]);
    const a=parse2006(ta), b=parse2007(tb); validateRefs(a,b);
    const saved=saveCache(a,b); ref2006=a;ref2007=b;showRefState('online',saved.fetchedAt);$('status').textContent='Referência atualizada e pronta.';
  }catch(err){
    if(cached){$('status').textContent='Consulta online indisponível; cálculo liberado com a última referência válida.'; return;}
    $('status').textContent='Não foi possível obter uma referência válida. Conecte-se à internet e tente novamente.';
    throw err;
  }
}
function ageMonths(birth){const now=new Date();const b=new Date(birth+'T12:00:00');return (now-b)/(1000*60*60*24)/30.4375;}
function ageLabel(months){const y=Math.floor(months/12),m=Math.floor(months-y*12);return y?`${y} ano${y!==1?'s':''} e ${m} mês${m!==1?'es':''}`:`${m} mês${m!==1?'es':''}`;}
function nearest(rows,months){let best=null,d=Infinity;for(const r of rows){const x=Math.abs(r.m-months);if(x<d){best=r;d=x;}}return best;}
function lmsZ(x,L,M,S){if(![x,L,M,S].every(Number.isFinite)||x<=0||M<=0||S<=0)return NaN;return Math.abs(L)<1e-12?Math.log(x/M)/S:(Math.pow(x/M,L)-1)/(L*S);}
function normalCDF(z){const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2);let p=1-d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z<0?1-p:p;}
function classify(z,months){
  if(months<60){if(z>3)return'Obesidade';if(z>2)return'Sobrepeso';if(z>1)return'Risco de sobrepeso';if(z<-3)return'Magreza acentuada';if(z<-2)return'Magreza';return'Faixa esperada para idade e sexo';}
  if(z>2)return'Obesidade';if(z>1)return'Sobrepeso';if(z<-3)return'Magreza acentuada';if(z<-2)return'Magreza';return'Faixa esperada para idade e sexo';
}
$('form').addEventListener('submit',e=>{
  e.preventDefault();
  const birth=$('birth').value,weight=+$('weight').value,height=+$('height').value;
  if(!birth||!weight||!height){$('status').textContent='Preencha todos os campos.';return;}
  const months=ageMonths(birth); if(months<0||months>180.999){$('status').textContent='A idade deve estar entre o nascimento e 15 anos.';return;}
  if(!ref2006.length||!ref2007.length){$('status').textContent='A referência ainda não está disponível.';return;}
  const bmi=weight/Math.pow(height/100,2),rows=months<=60?ref2006:ref2007,row=nearest(rows,Math.round(months));
  if(!row){$('status').textContent='Referência indisponível para esta idade.';return;}
  const p=sex==='M'?row.boys:row.girls,z=lmsZ(bmi,p.L,p.M,p.S);
  if(!Number.isFinite(z)){$('status').textContent='Não foi possível calcular o escore-Z.';return;}
  $('r-age').textContent=ageLabel(months);$('r-bmi').textContent=bmi.toFixed(1);$('r-z').textContent=z.toFixed(2);$('r-pct').textContent=(normalCDF(z)*100).toFixed(1)+'%';
  $('classification').textContent=classify(z,months);
  $('reference').textContent=months<60?'Referência: WHO Child Growth Standards 2006 (IMC por idade).':'Referência: WHO Growth Reference 2007 (IMC por idade).';
  $('reference-origin').textContent=refMeta.mode==='online'?`Dados online validados em ${fmtDate(refMeta.fetchedAt)}.`:`Dados do cache local, última atualização válida em ${fmtDate(refMeta.fetchedAt)}.`;
  $('result').classList.remove('hidden');$('status').textContent='Cálculo concluído.';window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
});

loadRefs().catch(()=>{});
