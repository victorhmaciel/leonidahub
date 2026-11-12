'use strict';
// As páginas abaixo são fontes oficiais externas; os cartões não inventam fatos sobre o jogo.
const content = [
 {id:'lancamento', category:'oficial', badge:'INFORMAÇÃO OFICIAL', title:'Data de lançamento confirmada', description:'Grand Theft Auto VI chega em 19 de novembro de 2026. Confira a página oficial e as plataformas anunciadas.', url:'https://www.rockstargames.com/VI', link:'Ver página oficial'},
 {id:'plataformas', category:'oficial', badge:'INFORMAÇÃO OFICIAL', title:'Onde jogar GTA VI?', description:'Veja as informações da Rockstar sobre PS5 e Xbox Series X|S e acompanhe futuros anúncios de plataformas.', url:'https://www.rockstargames.com/VI', link:'Conferir plataformas'},
 {id:'trailers', category:'midia', badge:'MÍDIA OFICIAL', title:'Trailers e novidades', description:'Acesse vídeos, imagens e novidades diretamente no portal de Grand Theft Auto VI da Rockstar.', url:'https://www.rockstargames.com/VI', link:'Ver trailers'},
 {id:'suporte', category:'suporte', badge:'SUPORTE OFICIAL', title:'Central de suporte', description:'Informações sobre instalação, pré-venda e perguntas frequentes disponibilizadas pelo suporte da Rockstar.', url:'https://support.rockstargames.com/VI', link:'Abrir suporte'},
 {id:'preload', category:'suporte', badge:'PREPARAÇÃO', title:'Tudo sobre o pré-carregamento', description:'Consulte datas e instruções de pré-carregamento no suporte oficial, conforme sua plataforma e região.', url:'https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s', link:'Consultar detalhes'},
 {id:'noticias', category:'oficial', badge:'NOTÍCIAS OFICIAIS', title:'Notícias da Rockstar', description:'Acompanhe diretamente o Newswire para não confundir comunicados oficiais com rumores.', url:'https://www.rockstargames.com/newswire', link:'Acessar Newswire'}
];
const favKey='leonida-hub-favorites-v1';
const checkKey='leonida-hub-checklist-v1';
function stored(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{/* browser can block storage */}}
let favorites=new Set(stored(favKey,[]));
let activeFilter='todos';
const searchInput=document.querySelector('#search');
const cardsElement=document.querySelector('#cards');
function renderCards(){
 const q=searchInput.value.trim().toLocaleLowerCase('pt-BR');
 const selected=content.filter(item=>{
  const typeMatch=activeFilter==='todos'||(activeFilter==='favoritos'?favorites.has(item.id):item.category===activeFilter);
  return typeMatch&&[item.title,item.description,item.badge].some(s=>s.toLocaleLowerCase('pt-BR').includes(q));
 });
 cardsElement.replaceChildren();
 for(const item of selected){
  const article=document.createElement('article');article.className='content-card';
  const body=document.createElement('div');body.className='card-body';
  const top=document.createElement('div');top.className='card-top';
  const tag=document.createElement('span');tag.className='card-category';tag.textContent=item.badge.toLocaleLowerCase('pt-BR');
  const save=document.createElement('button');save.className='save';save.type='button';save.textContent=favorites.has(item.id)?'★':'☆';save.setAttribute('aria-pressed',String(favorites.has(item.id)));save.setAttribute('aria-label',`${favorites.has(item.id)?'Remover dos':'Adicionar aos'} favoritos: ${item.title}`);
  save.dataset.favorite = item.id;
  save.addEventListener('click', () => {
   const nextSave = article.nextElementSibling?.querySelector('.save') ??
    article.previousElementSibling?.querySelector('.save');
   favorites.has(item.id) ? favorites.delete(item.id) : favorites.add(item.id);
   persist(favKey, [...favorites]);
   renderCards();
   const focusId = activeFilter === 'favoritos' ? nextSave?.dataset.favorite : item.id;
   const focusTarget = cardsElement.querySelector(`[data-favorite="${focusId}"]`) ??
    document.querySelector('[data-filter=favoritos]');
   focusTarget.focus();
  });
  top.append(tag,save);
  const heading=document.createElement('h3');heading.textContent=item.title;
  const desc=document.createElement('p');desc.textContent=item.description;
  const link=document.createElement('a');link.className='card-link';link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=item.link+' ↗';
  body.append(top,heading,desc,link);article.appendChild(body);cardsElement.appendChild(article);
 }
 document.querySelector('#empty').hidden=selected.length!==0;
}
searchInput.addEventListener('input',renderCards);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 activeFilter=button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(other=>{const chosen=other===button;other.classList.toggle('active',chosen);other.setAttribute('aria-pressed',String(chosen))});
 renderCards();
}));
document.querySelector('#saved-link').addEventListener('click', () => {
 searchInput.value = '';
 document.querySelector('[data-filter=favoritos]').click();
});
document.addEventListener('keydown',event=>{if(event.key==='/'&&document.activeElement?.tagName!=='INPUT'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();searchInput.focus()}});
const checklistItems=[
 'Verificar espaço livre no console',
 'Conferir o pré-carregamento na minha plataforma',
 'Atualizar o console e verificar a conexão',
 'Consultar a data e o horário de lançamento'
];
let checked=new Set(stored(checkKey,[]));
const checklist=document.querySelector('#checklist');
function renderChecklist(){
 checklist.replaceChildren();
 checklistItems.forEach((title,index)=>{
  const label=document.createElement('label');label.className='check-item';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=checked.has(index);
  checkbox.addEventListener('change',()=>{checkbox.checked?checked.add(index):checked.delete(index);persist(checkKey,[...checked]);updateProgress()});
  const span=document.createElement('span');span.textContent=title;label.append(checkbox,span);checklist.appendChild(label);
 });updateProgress();
}
function updateProgress(){document.querySelector('#progress-text').textContent=`${checked.size} de ${checklistItems.length} concluídos`;document.querySelector('#progress-fill').style.width=`${(checked.size/checklistItems.length)*100}%`}
document.querySelector('#reset').addEventListener('click',()=>{checked.clear();persist(checkKey,[]);renderChecklist()});
// A data de lançamento é exibida no horário local do visitante (meia-noite da data anunciada).
const releaseDate=new Date(2026,10,19,0,0,0);
function updateCountdown(){const now=new Date();const distance=releaseDate-now;const el=document.querySelector('#countdown');if(distance<=0){el.textContent='Data de lançamento alcançada';return}const days=Math.floor(distance/86400000),hours=Math.floor(distance/3600000)%24,mins=Math.floor(distance/60000)%60,secs=Math.floor(distance/1000)%60;const parts=[[days,'DIAS'],[hours,'HORAS'],[mins,'MIN'],[secs,'SEG']];el.replaceChildren();for(const [value,label] of parts){const col=document.createElement('div');const b=document.createElement('b');b.textContent=String(value).padStart(2,'0');const small=document.createElement('small');small.textContent=label;col.append(b,small);el.appendChild(col)}}
document.querySelector('#year').textContent=String(new Date().getFullYear());renderCards();renderChecklist();updateCountdown();setInterval(updateCountdown,1000);
