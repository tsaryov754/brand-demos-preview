const $=id=>document.getElementById(id);
const storageKey='demo-requests:'+location.pathname.replace(/index\.html$/, '');
const today=new Date();today.setHours(0,0,0,0);
const start=new Date(Math.max(today.getFullYear(),2027),5,1);
let cursor=new Date(start),selected=null,requests=[];
try{requests=JSON.parse(sessionStorage.getItem(storageKey)||'[]');if(!Array.isArray(requests))requests=[]}catch{requests=[]}
const limit=new Date(start.getFullYear()+2,11,1);
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const longDate=d=>d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
function occupied(d){return [3,7,14,19,26].includes((d.getDate()+d.getMonth()*2)%31)||d<today}
function render(){
 $('month').textContent=cursor.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','');
 $('prev').disabled=cursor<=start;$('next').disabled=cursor>=limit;
 const grid=$('days');grid.replaceChildren();
 const offset=(new Date(cursor.getFullYear(),cursor.getMonth(),1).getDay()+6)%7;
 for(let i=0;i<offset;i++)grid.append(document.createElement('span'));
 const n=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
 for(let day=1;day<=n;day++){const d=new Date(cursor.getFullYear(),cursor.getMonth(),day),b=document.createElement('button');b.type='button';b.textContent=day;b.disabled=occupied(d);if(b.disabled){const status=document.createElement('small');status.textContent='Занято';b.append(status);}b.setAttribute('aria-label',`${longDate(d)} — ${b.disabled?'занято':'свободно'}`);b.setAttribute('aria-pressed',String(!!selected&&key(d)===key(selected)));if(selected&&key(d)===key(selected))b.className='chosen';b.onclick=()=>{selected=d;$('selectedDate').value=key(d);$('dateStatus').textContent=longDate(d)+' · свободно';$('submit').disabled=false;$('successView').hidden=true;$('formView').hidden=false;$('error').textContent='';render()};grid.append(b)}
}
$('prev').onclick=()=>{if(cursor>start){cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()}};
$('next').onclick=()=>{if(cursor<limit){cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()}};
$('bookingForm').onsubmit=e=>{e.preventDefault();if(!selected)return;const f=new FormData(e.target),name=String(f.get('name')).trim(),phone=String(f.get('phone')).trim();if(name.length<2){$('error').textContent='Укажите имя: минимум 2 символа.';return}if(phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15){$('error').textContent='Проверьте телефон: нужно от 7 до 15 цифр.';return}const r={date:key(selected),displayDate:longDate(selected),event:f.get('event'),guests:f.get('guests'),name,phone,comment:String(f.get('comment')||'').trim()};requests.unshift(r);try{sessionStorage.setItem(storageKey,JSON.stringify(requests))}catch{}$('successText').textContent=`${name}, тестовая заявка на ${r.displayDate} сохранена: ${r.event.toLowerCase()}, гостей — ${r.guests}.`;$('formView').hidden=true;$('successView').hidden=false;$('count').textContent=requests.length;renderRequests()};
$('again').onclick=()=>{selected=null;$('bookingForm').reset();$('selectedDate').value='';$('dateStatus').textContent='Выберите свободную дату';$('submit').disabled=true;$('successView').hidden=true;$('formView').hidden=false;render()};
function renderRequests(){const list=$('requestList');list.replaceChildren();if(!requests.length){const p=document.createElement('p');p.textContent='Заявок пока нет. Выберите дату и заполните форму, чтобы попробовать.';list.append(p)}requests.forEach(r=>{const row=document.createElement('div');row.className='request';const a=document.createElement('div'),title=document.createElement('strong'),details=document.createElement('p'),contact=document.createElement('p');title.textContent=r.displayDate;details.textContent=`${r.event} · ${r.guests} гостей · Тестовая заявка`;contact.textContent=`${r.name} · ${r.phone}`;a.append(title,details);if(r.comment){const comment=document.createElement('p');comment.className='request-comment';comment.textContent=r.comment;a.append(comment)}row.append(a,contact);list.append(row)})}
function openRequests(){$('requests').hidden=false;renderRequests();$('requests').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
$('requestsBtn').onclick=openRequests;$('viewRequests').onclick=openRequests;$('closeRequests').onclick=()=>{$('requests').hidden=true;$('requestsBtn').focus()};$('count').textContent=requests.length;render();
