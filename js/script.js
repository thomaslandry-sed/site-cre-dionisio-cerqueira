// 'use strict';

// // Troque somente os registros de noticias.json para atualizar as notícias.
// // Futuramente, um GitHub Action poderá gerar esse arquivo lendo o Google Sheets.
// const NEWS_SOURCE = 'data/noticias.json';
// const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80';
// const GALLERY = [
//   {src:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',title:'Aprendizagem, encontros e novas descobertas'},
//   {src:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',title:'Conexões que fortalecem nossa rede'},
//   {src:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=85',title:'Conhecimento que inspira o futuro'}
// ];
// let allNews = [];
// let category = 'Todas';
// let searchTerm = '';
// let expanded = false;
// let galleryIndex = 0;
// const $ = (selector) => document.querySelector(selector);
// const el = (tag, cls, value) => {
//   const node = document.createElement(tag);
//   if (cls) node.className = cls;
//   if (value !== undefined) node.textContent = value;
//   return node;
// };
// function formatDate(dateString){
//   if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString||'')) return '';
//   const [year,month,day] = dateString.split('-').map(Number);
//   return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(year,month-1,day));
// }
// function validNews(item){
//   return item && item.status === 'Publicado' && item.id != null && typeof item.titulo === 'string';
// }
// async function loadNews(){
//   const grid = $('#newsGrid');
//   try{
//     const response = await fetch(NEWS_SOURCE,{cache:'no-store'});
//     if(!response.ok) throw new Error('HTTP '+response.status);
//     const rows = await response.json();
//     if(!Array.isArray(rows)) throw new Error('O JSON deve ser uma lista de notícias.');
//     allNews = rows.filter(validNews).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
//     renderNews();
//     openNewsFromUrl();
//   }catch(error){
//     console.error('Não foi possível carregar as notícias:',error);
//     grid.replaceChildren(el('div','empty-state','Não foi possível carregar as notícias. Abra o site por um servidor local ou pelo GitHub Pages e confira noticias.json.'));
//   }
// }
// function makeNewsCard(n){
//   const article=el('article','news-card');
//   const link=el('a');
//   link.href='?noticia='+encodeURIComponent(n.id);
//   link.setAttribute('aria-label','Ler notícia: '+n.titulo);
//   const imageWrap=el('div','news-image-wrap');
//   const img=el('img','news-image');
//   img.src=n.imagem||IMAGE_FALLBACK;
//   img.alt=n.titulo;
//   img.loading='lazy';
//   img.addEventListener('error',()=>{if(img.src!==IMAGE_FALLBACK)img.src=IMAGE_FALLBACK;},{once:true});
//   imageWrap.append(img);
//   const body=el('div','news-card-body');
//   const meta=el('div','news-meta');
//   meta.append(el('span','category',n.categoria||'Notícias'),el('span','',formatDate(n.data)));
//   body.append(meta,el('h3','',n.titulo),el('p','',n.resumo||''),el('span','read-link','Ler notícia ↗'));
//   link.append(imageWrap,body);
//   link.addEventListener('click',(event)=>{event.preventDefault();history.pushState({news:n.id},'',link.href);openNews(n);});
//   article.append(link);
//   return article;
// }
// function renderNews(){
//   const grid=$('#newsGrid');
//   const normalized=searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
//   const matches=allNews.filter(n=>{
//     const text=[n.titulo,n.resumo,n.categoria,n.conteudo].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
//     return (category==='Todas'||n.categoria===category)&&text.includes(normalized);
//   });
//   const shown=expanded?matches:matches.slice(0,3);
//   grid.replaceChildren(...shown.map(makeNewsCard));
//   if(!matches.length)grid.append(el('div','empty-state','Nenhuma notícia encontrada para sua busca.'));
//   $('#newsCount').textContent=matches.length===1?'1 notícia encontrada':`${matches.length} notícias encontradas`;
//   const more=$('#showMore');
//   more.hidden=matches.length<=3;
//   more.textContent=expanded?'Mostrar menos ↑':'Ver mais notícias ↗';
// }
// function openNews(n){
//   const content=$('#dialogContent');
//   content.replaceChildren();
//   const tag=el('span','category',n.categoria||'Notícias');
//   const heading=el('h2','',n.titulo);heading.id='dialogTitle';
//   const date=el('p','dialog-meta',formatDate(n.data)+' • Portal institucional • CONTEÚDO DEMONSTRATIVO');
//   content.append(tag,heading,date);
//   if(n.imagem){const img=el('img');img.src=n.imagem;img.alt=n.titulo;content.append(img);}
//   const text=el('div','dialog-body');
//   text.append(el('p','',n.conteudo||n.resumo||''));
//   content.append(text);
//   if(!$('#newsDialog').open)$('#newsDialog').showModal();
//   document.body.classList.add('modal-open');
// }
// function closeNews({updateUrl=true}={}){
//   if($('#newsDialog').open)$('#newsDialog').close();
//   document.body.classList.remove('modal-open');
//   if(updateUrl && new URL(location.href).searchParams.has('noticia')){
//     const url=new URL(location.href);url.searchParams.delete('noticia');history.replaceState({},'',url.pathname+url.search+url.hash);
//   }
// }
// function openNewsFromUrl(){
//   const id=new URL(location.href).searchParams.get('noticia');
//   const found=id&&allNews.find(n=>String(n.id)===id);
//   if(found)openNews(found);else closeNews({updateUrl:false});
// }
// function initNavigation(){
//   const menu=$('#menuToggle'), mobile=$('#mobileNav'),search=$('#searchToggle'),panel=$('#searchPanel');
//   menu.addEventListener('click',()=>{
//     const open=mobile.hidden;mobile.hidden=!open;menu.setAttribute('aria-expanded',String(open));
//     menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
//   });
//   mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');}));
//   search.addEventListener('click',()=>{
//     const open=panel.hidden;panel.hidden=!open;search.setAttribute('aria-expanded',String(open));
//     if(open)$('#siteSearch').focus();
//   });
//   $('#siteSearch').addEventListener('input',(e)=>{searchTerm=e.target.value.trim();expanded=false;renderNews();});
//   $('#searchClear').addEventListener('click',()=>{$('#siteSearch').value='';searchTerm='';renderNews();$('#siteSearch').focus();});
//   document.querySelectorAll('.filter-btn').forEach(button=>button.addEventListener('click',()=>{
//     category=button.dataset.filter;expanded=false;
//     document.querySelectorAll('.filter-btn').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
//     renderNews();
//   }));
//   $('#showMore').addEventListener('click',()=>{expanded=!expanded;renderNews();});
//   $('#dialogClose').addEventListener('click',()=>closeNews());
//   $('#newsDialog').addEventListener('close',()=>closeNews());
//   $('#newsDialog').addEventListener('click',(e)=>{if(e.target===$('#newsDialog'))closeNews();});
//   window.addEventListener('popstate',openNewsFromUrl);
//   const back=$('#backToTop');
//   window.addEventListener('scroll',()=>back.classList.toggle('visible',window.scrollY>500),{passive:true});
//   back.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
//   $('#year').textContent=new Date().getFullYear();
// }
// function initGallery(){
//   const track=$('#galleryTrack'),dots=$('#galleryDots');
//   for(const [i,picture] of GALLERY.entries()){
//     const slide=el('figure','gallery-slide');
//     const img=el('img');img.src=picture.src;img.alt=picture.title;img.loading='lazy';
//     const caption=el('figcaption','',picture.title);
//     slide.append(img,caption);track.append(slide);
//     const dot=el('button','gallery-dot');dot.type='button';dot.setAttribute('aria-label',`Ir para fotografia ${i+1}`);
//     dot.addEventListener('click',()=>moveGallery(i));dots.append(dot);
//   }
//   $('#galleryPrev').addEventListener('click',()=>moveGallery(galleryIndex-1));
//   $('#galleryNext').addEventListener('click',()=>moveGallery(galleryIndex+1));
//   $('#galleryStage').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();moveGallery(galleryIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();moveGallery(galleryIndex+1);}});
//   let startX=0;
//   $('#galleryStage').addEventListener('touchstart',e=>{startX=e.changedTouches[0].screenX;},{passive:true});
//   $('#galleryStage').addEventListener('touchend',e=>{const difference=e.changedTouches[0].screenX-startX;if(Math.abs(difference)>45)moveGallery(galleryIndex+(difference<0?1:-1));},{passive:true});
  
//   moveGallery(0);

//   // Avança automaticamente a cada 5 segundos
//   setInterval(() => {
//     moveGallery(galleryIndex + 1);
//   }, 3000);

// }
// function moveGallery(next){
//   galleryIndex=(next+GALLERY.length)%GALLERY.length;
//   $('#galleryTrack').style.transform=`translateX(-${galleryIndex*100}%)`;
//   $('#galleryCounter').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(GALLERY.length).padStart(2,'0')}`;
//   document.querySelectorAll('.gallery-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===galleryIndex);dot.setAttribute('aria-current',i===galleryIndex?'true':'false');});
// }
// function initReveal(){
//   if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(x=>x.classList.add('visible'));return;}
//   const observer=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
//   document.querySelectorAll('.reveal').forEach(x=>observer.observe(x));
// }
// // A página inicial funciona independentemente do carregamento do header/footer.
// function iniciarConteudo() {
//   initGallery();
//   initReveal();
//   loadNews();
// }

// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', iniciarConteudo, { once: true });
// } else {
//   iniciarConteudo();
// }

// // Os controles que estão dentro do header só são configurados após sua inserção.
// document.addEventListener('components:ready', () => {
//   initNavigation();
// });


// // COPIAR E-MAIL INSTITUCIONAL

// const copyEmailBtn = document.getElementById("copyEmailBtn");
// const emailInstitucional = document.getElementById("emailInstitucional");
// const copyEmailMessage = document.getElementById("copyEmailMessage");

// if (copyEmailBtn && emailInstitucional && copyEmailMessage) {
//   let timeoutMensagem;

//   copyEmailBtn.addEventListener("click", async () => {
//     const email = emailInstitucional.textContent.trim();

//     try {
//       await navigator.clipboard.writeText(email);

//       copyEmailMessage.textContent = "Copiado! ✓";

//       clearTimeout(timeoutMensagem);

//       timeoutMensagem = setTimeout(() => {
//         copyEmailMessage.textContent = "";
//       }, 2000);

//     } catch (erro) {
//       copyEmailMessage.textContent = "Erro ao copiar";
//       console.error(erro);
//     }
//   });
// }


// /* ==========================================
//    FECHAR JANELA DE NOTÍCIAS
// ========================================== */

// function configurarFechamentoNoticias() {
//   const dialog = document.querySelector(".news-dialog");
//   if (!dialog) return;

//   const botaoFechar = dialog.querySelector(".dialog-close");

//   // Fechar ao clicar no X
//   if (botaoFechar) {
//     botaoFechar.addEventListener("click", () => {
//       dialog.close();
//     });
//   }

//   // Fechar ao clicar fora da notícia
//   dialog.addEventListener("click", (evento) => {
//     if (evento.target === dialog) {
//       dialog.close();
//     }
//   });

//   // Restaurar a rolagem da página ao fechar
//   dialog.addEventListener("close", () => {
//     document.body.classList.remove("modal-open");
//   });
// }

// // Inicializar
// if (document.readyState === "loading") {
//   document.addEventListener(
//     "DOMContentLoaded",
//     configurarFechamentoNoticias
//   );
// } else {
//   configurarFechamentoNoticias();
// }
// /*Aqui*/

// /* ==========================================
//    QUADRO INTERATIVO DO MAPA
// ========================================== */

// function iniciarQuadroMapa() {
//   const quadro = document.getElementById(
//     "creFramedMap"
//   );

//   const botao = document.getElementById(
//     "creMapExpand"
//   );

//   if (!quadro || !botao) return;

//   function alternarQuadro(ampliar) {
//     quadro.classList.toggle("is-expanded", ampliar);

//     document.body.classList.toggle(
//       "cre-map-open",
//       ampliar
//     );

//     botao.setAttribute(
//       "aria-expanded",
//       String(ampliar)
//     );

//     botao.textContent = ampliar
//       ? "✕ Reduzir mapa"
//       : "⛶ Ampliar mapa";
//   }

//   botao.addEventListener("click", () => {
//     const ampliar = !quadro.classList.contains(
//       "is-expanded"
//     );

//     alternarQuadro(ampliar);
//   });

//   // Fechar usando ESC
//   document.addEventListener("keydown", evento => {
//     if (
//       evento.key === "Escape" &&
//       quadro.classList.contains("is-expanded")
//     ) {
//       alternarQuadro(false);
//       botao.focus();
//     }
//   });
// }

// if (document.readyState === "loading") {
//   document.addEventListener(
//     "DOMContentLoaded",
//     iniciarQuadroMapa
//   );
// } else {
//   iniciarQuadroMapa();
// }

// "use strict";

// /* Redes sociais da CRE. Preencha apenas as URLs oficiais abaixo. */
// const CRE_SOCIAL_PROFILES = {
//   instagram: { url: "" },
//   facebook: { url: "" },
//   youtube: { url: "" }
// };

// function creUrlPublica(url) {
//   try {
//     const link = new URL(url);
//     return ["https:", "http:"].includes(link.protocol) ? link.href : "";
//   } catch {
//     return "";
//   }
// }

// function iniciarRedesSociaisCRE() {
//   const secao = document.getElementById("redes-sociais");
//   if (!secao) return;

//   // As três redes possuem o mesmo tamanho. Nenhuma inicia em destaque.
//   for (const [plataforma, dados] of Object.entries(CRE_SOCIAL_PROFILES)) {
//     const link = secao.querySelector(`[data-social-link="${plataforma}"]`);
//     const pendente = secao.querySelector(`[data-social-pending="${plataforma}"]`);
//     if (!link || !pendente) continue;

//     const destino = creUrlPublica(dados.url);
//     link.hidden = !destino;
//     pendente.hidden = Boolean(destino);

//     if (destino) link.href = destino;
//     else link.removeAttribute("href");
//   }

//   // Iluminação suave acompanha o cursor dentro de cada cartão.
//   const respeitaReducao = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
//   if (!respeitaReducao) {
//     secao.querySelectorAll(".cre-social-card").forEach(cartao => {
//       cartao.addEventListener("pointermove", evento => {
//         if (evento.pointerType === "touch") return;
//         const retangulo = cartao.getBoundingClientRect();
//         const x = ((evento.clientX - retangulo.left) / retangulo.width) * 100;
//         const y = ((evento.clientY - retangulo.top) / retangulo.height) * 100;
//         cartao.style.setProperty("--pointer-x", `${x}%`);
//         cartao.style.setProperty("--pointer-y", `${y}%`);
//       });
//     });
//   }

//   const compartilhar = document.getElementById("creSocialShare");
//   const status = document.getElementById("creSocialShareStatus");
//   if (!compartilhar || !status) return;

//   compartilhar.addEventListener("click", async () => {
//     // Endereço da própria página, válido tanto no Live Server quanto no GitHub Pages.
//     const endereco = new URL("index.html", document.baseURI).href;
//     try {
//       if (navigator.share) {
//         await navigator.share({ title: "Portal CRE", url: endereco });
//         status.textContent = "";
//       } else {
//         await navigator.clipboard.writeText(endereco);
//         status.textContent = "Link do portal copiado!";
//       }
//     } catch (erro) {
//       if (erro.name !== "AbortError") {
//         status.textContent = "Não foi possível compartilhar o link.";
//       }
//     }
//   });
// }

// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", iniciarRedesSociaisCRE);
// } else {
//   iniciarRedesSociaisCRE();
// }
// /*Cartões*/
// /* ========================================================
//    PÁGINA NOSSA EQUIPE - CARTAS DISTRIBUÍDAS
//    Acrescentar ao FINAL de js/script.js
//    ======================================================== */
// (() => {
//   const mesa = document.getElementById('teamTable');
//   if (!mesa) return; // Mantém as demais páginas do portal intactas.

//   const botaoDistribuir = document.getElementById('teamRedeal');
//   const indicador = document.getElementById('teamMemberCount');
//   const mensagem = document.getElementById('teamLoading');
//   const dialogo = document.getElementById('teamMemberDialog');
//   const botaoFechar = document.getElementById('teamDialogClose');
//   const fotoDialogo = document.getElementById('teamDialogPhoto');
//   const nomeDialogo = document.getElementById('teamDialogName');
//   const escolaDialogo = document.getElementById('teamDialogSchool');
//   const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
//   let diretores = [];
//   let cartas = [];
//   let jaDistribuiu = false;
//   let sorteio = 0;
//   let agendamentoResize;

//   // Número pseudoaleatório reproduzível, evitando saltos bruscos ao redimensionar.
//   const variacao = (indice, fator) => Math.sin((indice + 1) * fator + sorteio) * 1;

//   function mostrarDetalhes(diretor) {
//     if (!dialogo || typeof dialogo.showModal !== 'function') return;
//     nomeDialogo.textContent = diretor.nome;
//     escolaDialogo.textContent = diretor.escola;
//     fotoDialogo.src = diretor.foto;
//     fotoDialogo.alt = diretor.imagemIlustrativa
//       ? 'Ilustração que ocupa o lugar da foto de ' + diretor.nome
//       : 'Fotografia de ' + diretor.nome;
//     dialogo.showModal();
//   }

//   if (botaoFechar) botaoFechar.addEventListener('click', () => dialogo.close());
//   if (dialogo) dialogo.addEventListener('click', evento => {
//     if (evento.target === dialogo) dialogo.close();
//   });

//   function criarCarta(diretor, indice) {
//     const carta = document.createElement('button');
//     carta.type = 'button';
//     carta.className = 'team-director-card';
//     carta.setAttribute('aria-label', 'Conhecer ' + diretor.nome + ', ' + diretor.escola);
//     carta.style.setProperty('--team-stack-angle', `${(-3 + indice * .62).toFixed(1)}deg`);
//     carta.style.setProperty('--team-delay', `${Math.min(indice * 120, 1320)}ms`);
//     carta.style.zIndex = String(indice + 2);

//     const moldura = document.createElement('div');
//     moldura.className = 'team-director-photo';
//     const foto = document.createElement('img');
//     foto.src = diretor.foto;
//     foto.loading = indice < 4 ? 'eager' : 'lazy';
//     foto.alt = diretor.imagemIlustrativa
//       ? 'Imagem ilustrativa, fotografia ainda não cadastrada'
//       : 'Fotografia de ' + diretor.nome;
//     moldura.appendChild(foto);

//     const info = document.createElement('div');
//     info.className = 'team-director-info';
//     const legenda = document.createElement('span');
//     legenda.className = 'team-director-caption';
//     legenda.textContent = 'DIREÇÃO ESCOLAR';
//     const nome = document.createElement('strong');
//     nome.className = 'team-director-name';
//     nome.textContent = diretor.nome;
//     const escola = document.createElement('span');
//     escola.className = 'team-director-school';
//     escola.textContent = diretor.escola;
//     info.append(legenda, nome, escola);
//     carta.append(moldura, info);
//     carta.addEventListener('click', () => mostrarDetalhes(diretor));
//     return carta;
//   }

//   function organizarMesa() {
//     const largura = mesa.clientWidth;
//     if (!largura || !cartas.length) return;
//     const colunas = largura >= 1110 ? 4 : largura >= 785 ? 3 : largura >= 530 ? 2 : 1;
//     const espacamento = largura < 530 ? 18 : 31;
//     const larguraCarta = Math.max(172, Math.min(largura < 530 ? 274 : 238,
//       (largura - 78 - (colunas - 1) * espacamento) / colunas));
//     const distanciaLinhas = largura < 530 ? 385 : 371;
//     const linhas = Math.ceil(cartas.length / colunas);
//     const alturaMesa = 260 + (linhas - 1) * distanciaLinhas + 163;
//     mesa.style.setProperty('--team-card-width', `${larguraCarta}px`);
//     mesa.style.height = `${alturaMesa}px`;

//     cartas.forEach((carta, i) => {
//       const linha = Math.floor(i / colunas);
//       const posicao = i % colunas;
//       const qtNaLinha = Math.min(colunas, cartas.length - linha * colunas);
//       const larguraLinha = qtNaLinha * larguraCarta + (qtNaLinha - 1) * espacamento;
//       const inicio = (largura - larguraLinha) / 2;
//       const desvioX = colunas === 1 ? 0 : variacao(i, 2.7) * 7;
//       const desvioY = variacao(i, 1.43) * 11;
//       const x = inicio + larguraCarta / 2 + posicao * (larguraCarta + espacamento) + desvioX;
//       const y = 222 + linha * distanciaLinhas + desvioY;
//       const giro = variacao(i, 1.92) * 5.6;
//       carta.style.setProperty('--team-x', `${x.toFixed(1)}px`);
//       carta.style.setProperty('--team-y', `${y.toFixed(1)}px`);
//       carta.style.setProperty('--team-rotation', `${giro.toFixed(2)}deg`);
//     });
//   }

//   function distribuir() {
//     mesa.classList.add('is-dealt');
//     jaDistribuiu = true;
//     botaoDistribuir.disabled = false;
//   }

//   function iniciarDistribuicao() {
//     if (jaDistribuiu) return;
//     if (reduzMovimento.matches) {
//       distribuir();
//       return;
//     }
//     // O observador espera a mesa entrar na tela antes de espalhar as cartas.
//     window.setTimeout(distribuir, 330);
//   }

//   botaoDistribuir.addEventListener('click', () => {
//     if (!cartas.length || botaoDistribuir.disabled) return;
//     botaoDistribuir.disabled = true;
//     mesa.classList.remove('is-dealt');
//     sorteio += 1.83;
//     organizarMesa();
//     if (reduzMovimento.matches) {
//       distribuir();
//     } else {
//       window.setTimeout(distribuir, 530);
//     }
//   });

//   window.addEventListener('resize', () => {
//     window.clearTimeout(agendamentoResize);
//     agendamentoResize = window.setTimeout(organizarMesa, 130);
//   });

//   async function carregarEquipe() {
//     try {
//       const resposta = await fetch('data/diretores.json', {cache: 'no-store'});
//       if (!resposta.ok) throw new Error('Erro HTTP ' + resposta.status);
//       const dados = await resposta.json();
//       const itens = Array.isArray(dados) ? dados : dados.diretores;
//       if (!Array.isArray(itens)) throw new Error('Formato inválido do arquivo de diretores.');
//       diretores = itens.filter(pessoa => pessoa && pessoa.nome && pessoa.escola && pessoa.foto);
//       if (!diretores.length) throw new Error('Não há diretores cadastrados.');

//       mensagem.remove();
//       cartas = diretores.map((diretor, indice) => criarCarta(diretor, indice));
//       mesa.append(...cartas);
//       mesa.setAttribute('aria-busy', 'false');
//       indicador.textContent = `${diretores.length} integrantes da direção escolar`;
//       organizarMesa();

//       if ('IntersectionObserver' in window) {
//         const observador = new IntersectionObserver(entradas => {
//           if (entradas.some(entrada => entrada.isIntersecting)) {
//             observador.disconnect();
//             iniciarDistribuicao();
//           }
//         }, {threshold: .06});
//         observador.observe(mesa);
//       } else {
//         iniciarDistribuicao();
//       }
//     } catch (erro) {
//       console.error('Falha ao carregar equipe:', erro);
//       mensagem.textContent = 'Não foi possível carregar a equipe. Abra o site pelo Live Server e verifique data/diretores.json.';
//       mesa.setAttribute('aria-busy', 'false');
//     }
//   }

//   carregarEquipe();
// })();

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
  // Não tenta carregar o carrossel/notícias em páginas internas, como equipe.html.
  if (document.getElementById('galleryTrack') && document.getElementById('galleryDots')) initGallery();
  initReveal();
  if (document.getElementById('newsGrid')) loadNews();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarConteudo, { once: true });
} else {
  iniciarConteudo();
}

// Os controles que estão dentro do header só são configurados após sua inserção.
document.addEventListener('components:ready', () => {
  // Essa rotina usa elementos exclusivos da página inicial.
  // A navegação compartilhada das outras páginas fica com components.js.
  if (document.getElementById('newsGrid')) initNavigation();
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

"use strict";

/* Redes sociais da CRE. Preencha apenas as URLs oficiais abaixo. */
const CRE_SOCIAL_PROFILES = {
  instagram: { url: "" },
  facebook: { url: "" },
  youtube: { url: "" }
};

function creUrlPublica(url) {
  try {
    const link = new URL(url);
    return ["https:", "http:"].includes(link.protocol) ? link.href : "";
  } catch {
    return "";
  }
}

function iniciarRedesSociaisCRE() {
  const secao = document.getElementById("redes-sociais");
  if (!secao) return;

  // As três redes possuem o mesmo tamanho. Nenhuma inicia em destaque.
  for (const [plataforma, dados] of Object.entries(CRE_SOCIAL_PROFILES)) {
    const link = secao.querySelector(`[data-social-link="${plataforma}"]`);
    const pendente = secao.querySelector(`[data-social-pending="${plataforma}"]`);
    if (!link || !pendente) continue;

    const destino = creUrlPublica(dados.url);
    link.hidden = !destino;
    pendente.hidden = Boolean(destino);

    if (destino) link.href = destino;
    else link.removeAttribute("href");
  }

  // Iluminação suave acompanha o cursor dentro de cada cartão.
  const respeitaReducao = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!respeitaReducao) {
    secao.querySelectorAll(".cre-social-card").forEach(cartao => {
      cartao.addEventListener("pointermove", evento => {
        if (evento.pointerType === "touch") return;
        const retangulo = cartao.getBoundingClientRect();
        const x = ((evento.clientX - retangulo.left) / retangulo.width) * 100;
        const y = ((evento.clientY - retangulo.top) / retangulo.height) * 100;
        cartao.style.setProperty("--pointer-x", `${x}%`);
        cartao.style.setProperty("--pointer-y", `${y}%`);
      });
    });
  }

  const compartilhar = document.getElementById("creSocialShare");
  const status = document.getElementById("creSocialShareStatus");
  if (!compartilhar || !status) return;

  compartilhar.addEventListener("click", async () => {
    // Endereço da própria página, válido tanto no Live Server quanto no GitHub Pages.
    const endereco = new URL("index.html", document.baseURI).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Portal CRE", url: endereco });
        status.textContent = "";
      } else {
        await navigator.clipboard.writeText(endereco);
        status.textContent = "Link do portal copiado!";
      }
    } catch (erro) {
      if (erro.name !== "AbortError") {
        status.textContent = "Não foi possível compartilhar o link.";
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarRedesSociaisCRE);
} else {
  iniciarRedesSociaisCRE();
}
