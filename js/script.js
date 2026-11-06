'use strict';

// Troque somente os registros de noticias.json para atualizar as notícias.
// Futuramente, um GitHub Action poderá gerar esse arquivo lendo o Google Sheets.
const NEWS_SOURCE = 'data/noticias.json';
const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80';
const GALLERY = [
  {src:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',title:'Aprendizagem, encontros e novas descobertas'},
  {src:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',title:'Conexões que fortalecem nossa rede'},
  {src:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=85',title:'Conhecimento que inspira o futuro'}
];
let allNews = [];
let category = 'Todas';
let searchTerm = '';
let expanded = false;
let galleryIndex = 0;
const $ = (selector) => document.querySelector(selector);
const el = (tag, cls, value) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (value !== undefined) node.textContent = value;
  return node;
};
function formatDate(dateString){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString||'')) return '';
  const [year,month,day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(year,month-1,day));
}
function validNews(item){
  return item && item.status === 'Publicado' && item.id != null && typeof item.titulo === 'string';
}
async function loadNews(){
  const grid = $('#newsGrid');
  try{
    const response = await fetch(NEWS_SOURCE,{cache:'no-store'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const rows = await response.json();
    if(!Array.isArray(rows)) throw new Error('O JSON deve ser uma lista de notícias.');
    allNews = rows.filter(validNews).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
    renderNews();
    openNewsFromUrl();
  }catch(error){
    console.error('Não foi possível carregar as notícias:',error);
    grid.replaceChildren(el('div','empty-state','Não foi possível carregar as notícias. Abra o site por um servidor local ou pelo GitHub Pages e confira noticias.json.'));
  }
}
function makeNewsCard(n){
  const article=el('article','news-card');
  const link=el('a');
  link.href='?noticia='+encodeURIComponent(n.id);
  link.setAttribute('aria-label','Ler notícia: '+n.titulo);
  const imageWrap=el('div','news-image-wrap');
  const img=el('img','news-image');
  img.src=n.imagem||IMAGE_FALLBACK;
  img.alt=n.titulo;
  img.loading='lazy';
  img.addEventListener('error',()=>{if(img.src!==IMAGE_FALLBACK)img.src=IMAGE_FALLBACK;},{once:true});
  imageWrap.append(img);
  const body=el('div','news-card-body');
  const meta=el('div','news-meta');
  meta.append(el('span','category',n.categoria||'Notícias'),el('span','',formatDate(n.data)));
  body.append(meta,el('h3','',n.titulo),el('p','',n.resumo||''),el('span','read-link','Ler notícia ↗'));
  link.append(imageWrap,body);
  link.addEventListener('click',(event)=>{event.preventDefault();history.pushState({news:n.id},'',link.href);openNews(n);});
  article.append(link);
  return article;
}
function renderNews(){
  const grid=$('#newsGrid');
  const normalized=searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const matches=allNews.filter(n=>{
    const text=[n.titulo,n.resumo,n.categoria,n.conteudo].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
    return (category==='Todas'||n.categoria===category)&&text.includes(normalized);
  });
  const shown=expanded?matches:matches.slice(0,3);
  grid.replaceChildren(...shown.map(makeNewsCard));
  if(!matches.length)grid.append(el('div','empty-state','Nenhuma notícia encontrada para sua busca.'));
  $('#newsCount').textContent=matches.length===1?'1 notícia encontrada':`${matches.length} notícias encontradas`;
  const more=$('#showMore');
  more.hidden=matches.length<=3;
  more.textContent=expanded?'Mostrar menos ↑':'Ver mais notícias ↗';
}
function openNews(n){
  const content=$('#dialogContent');
  content.replaceChildren();
  const tag=el('span','category',n.categoria||'Notícias');
  const heading=el('h2','',n.titulo);heading.id='dialogTitle';
  const date=el('p','dialog-meta',formatDate(n.data)+' • Portal institucional • CONTEÚDO DEMONSTRATIVO');
  content.append(tag,heading,date);
  if(n.imagem){const img=el('img');img.src=n.imagem;img.alt=n.titulo;content.append(img);}
  const text=el('div','dialog-body');
  text.append(el('p','',n.conteudo||n.resumo||''));
  content.append(text);
  if(!$('#newsDialog').open)$('#newsDialog').showModal();
  document.body.classList.add('modal-open');
}
function closeNews({updateUrl=true}={}){
  if($('#newsDialog').open)$('#newsDialog').close();
  document.body.classList.remove('modal-open');
  if(updateUrl && new URL(location.href).searchParams.has('noticia')){
    const url=new URL(location.href);url.searchParams.delete('noticia');history.replaceState({},'',url.pathname+url.search+url.hash);
  }
}
function openNewsFromUrl(){
  const id=new URL(location.href).searchParams.get('noticia');
  const found=id&&allNews.find(n=>String(n.id)===id);
  if(found)openNews(found);else closeNews({updateUrl:false});
}
function initNavigation(){
  const menu=$('#menuToggle'), mobile=$('#mobileNav'),search=$('#searchToggle'),panel=$('#searchPanel');
  menu.addEventListener('click',()=>{
    const open=mobile.hidden;mobile.hidden=!open;menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');}));
  search.addEventListener('click',()=>{
    const open=panel.hidden;panel.hidden=!open;search.setAttribute('aria-expanded',String(open));
    if(open)$('#siteSearch').focus();
  });
  $('#siteSearch').addEventListener('input',(e)=>{searchTerm=e.target.value.trim();expanded=false;renderNews();});
  $('#searchClear').addEventListener('click',()=>{$('#siteSearch').value='';searchTerm='';renderNews();$('#siteSearch').focus();});
  document.querySelectorAll('.filter-btn').forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;expanded=false;
    document.querySelectorAll('.filter-btn').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    renderNews();
  }));
  $('#showMore').addEventListener('click',()=>{expanded=!expanded;renderNews();});
  $('#dialogClose').addEventListener('click',()=>closeNews());
  $('#newsDialog').addEventListener('close',()=>closeNews());
  $('#newsDialog').addEventListener('click',(e)=>{if(e.target===$('#newsDialog'))closeNews();});
  window.addEventListener('popstate',openNewsFromUrl);
  const back=$('#backToTop');
  window.addEventListener('scroll',()=>back.classList.toggle('visible',window.scrollY>500),{passive:true});
  back.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  $('#year').textContent=new Date().getFullYear();
}
function initGallery(){
  const track=$('#galleryTrack'),dots=$('#galleryDots');
  for(const [i,picture] of GALLERY.entries()){
    const slide=el('figure','gallery-slide');
    const img=el('img');img.src=picture.src;img.alt=picture.title;img.loading='lazy';
    const caption=el('figcaption','',picture.title);
    slide.append(img,caption);track.append(slide);
    const dot=el('button','gallery-dot');dot.type='button';dot.setAttribute('aria-label',`Ir para fotografia ${i+1}`);
    dot.addEventListener('click',()=>moveGallery(i));dots.append(dot);
  }
  $('#galleryPrev').addEventListener('click',()=>moveGallery(galleryIndex-1));
  $('#galleryNext').addEventListener('click',()=>moveGallery(galleryIndex+1));
  $('#galleryStage').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();moveGallery(galleryIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();moveGallery(galleryIndex+1);}});
  let startX=0;
  $('#galleryStage').addEventListener('touchstart',e=>{startX=e.changedTouches[0].screenX;},{passive:true});
  $('#galleryStage').addEventListener('touchend',e=>{const difference=e.changedTouches[0].screenX-startX;if(Math.abs(difference)>45)moveGallery(galleryIndex+(difference<0?1:-1));},{passive:true});
  
  moveGallery(0);

  // Avança automaticamente a cada 5 segundos
  setInterval(() => {
    moveGallery(galleryIndex + 1);
  }, 3000);

}
function moveGallery(next){
  galleryIndex=(next+GALLERY.length)%GALLERY.length;
  $('#galleryTrack').style.transform=`translateX(-${galleryIndex*100}%)`;
  $('#galleryCounter').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(GALLERY.length).padStart(2,'0')}`;
  document.querySelectorAll('.gallery-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===galleryIndex);dot.setAttribute('aria-current',i===galleryIndex?'true':'false');});
}
function initReveal(){
  if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(x=>x.classList.add('visible'));return;}
  const observer=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(x=>observer.observe(x));
}
// A página inicial funciona independentemente do carregamento do header/footer.
function iniciarConteudo() {
  initGallery();
  initReveal();
  loadNews();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarConteudo, { once: true });
} else {
  iniciarConteudo();
}

// Os controles que estão dentro do header só são configurados após sua inserção.
document.addEventListener('components:ready', () => {
  initNavigation();
});


// COPIAR E-MAIL INSTITUCIONAL

const copyEmailBtn = document.getElementById("copyEmailBtn");
const emailInstitucional = document.getElementById("emailInstitucional");
const copyEmailMessage = document.getElementById("copyEmailMessage");

if (copyEmailBtn && emailInstitucional && copyEmailMessage) {
  let timeoutMensagem;

  copyEmailBtn.addEventListener("click", async () => {
    const email = emailInstitucional.textContent.trim();

    try {
      await navigator.clipboard.writeText(email);

      copyEmailMessage.textContent = "Copiado! ✓";

      clearTimeout(timeoutMensagem);

      timeoutMensagem = setTimeout(() => {
        copyEmailMessage.textContent = "";
      }, 2000);

    } catch (erro) {
      copyEmailMessage.textContent = "Erro ao copiar";
      console.error(erro);
    }
  });
}


/* ==========================================
   FECHAR JANELA DE NOTÍCIAS
========================================== */

function configurarFechamentoNoticias() {
  const dialog = document.querySelector(".news-dialog");
  if (!dialog) return;

  const botaoFechar = dialog.querySelector(".dialog-close");

  // Fechar ao clicar no X
  if (botaoFechar) {
    botaoFechar.addEventListener("click", () => {
      dialog.close();
    });
  }

  // Fechar ao clicar fora da notícia
  dialog.addEventListener("click", (evento) => {
    if (evento.target === dialog) {
      dialog.close();
    }
  });

  // Restaurar a rolagem da página ao fechar
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });
}

// Inicializar
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    configurarFechamentoNoticias
  );
} else {
  configurarFechamentoNoticias();
}
/*Aqui*/

/* ==========================================
   QUADRO INTERATIVO DO MAPA
========================================== */

function iniciarQuadroMapa() {
  const quadro = document.getElementById(
    "creFramedMap"
  );

  const botao = document.getElementById(
    "creMapExpand"
  );

  if (!quadro || !botao) return;

  function alternarQuadro(ampliar) {
    quadro.classList.toggle("is-expanded", ampliar);

    document.body.classList.toggle(
      "cre-map-open",
      ampliar
    );

    botao.setAttribute(
      "aria-expanded",
      String(ampliar)
    );

    botao.textContent = ampliar
      ? "✕ Reduzir mapa"
      : "⛶ Ampliar mapa";
  }

  botao.addEventListener("click", () => {
    const ampliar = !quadro.classList.contains(
      "is-expanded"
    );

    alternarQuadro(ampliar);
  });

  // Fechar usando ESC
  document.addEventListener("keydown", evento => {
    if (
      evento.key === "Escape" &&
      quadro.classList.contains("is-expanded")
    ) {
      alternarQuadro(false);
      botao.focus();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    iniciarQuadroMapa
  );
} else {
  iniciarQuadroMapa();
}
