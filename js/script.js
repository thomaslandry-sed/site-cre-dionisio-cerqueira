
'use strict';

// ==========================================
// CONFIGURAÇÕES DO PORTAL
// ==========================================

const NEWS_SOURCE = 'data/noticias.json';

const IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80';

const GALLERY = [
  {
    src: 'assets/fotos-index/1.png',
    title: 'Aprendizagem, encontros e novas descobertas'
  },
  {
    src: 'assets/fotos-index/2.jpeg',
    title: 'Conexões que fortalecem nossa rede'
  },
  {
    src: 'assets/fotos-index/3.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/4.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/5.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/6.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/7.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/8.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/9.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/10.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/11.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/12.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/13.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/14.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/15.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/16.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/17.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/18.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/19.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/20.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/21.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/22.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
    {
    src: 'assets/fotos-index/23.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
   {
    src: 'assets/fotos-index/24.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/25.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/26.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/27.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/28.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/29.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/30.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/31.png',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/32.jpeg',
    title: 'Conhecimento que inspira o futuro'
  },
  {
    src: 'assets/fotos-index/33.jpeg',
    title: 'Conhecimento que inspira o futuro'
  }
];

let allNews = [];
let category = 'Todas';
let searchTerm = '';
let expanded = false;
let galleryIndex = 0;
let newsPhotoCarouselController = null;

const $ = selector => document.querySelector(selector);

const el = (tag, cls, value) => {
  const node = document.createElement(tag);

  if (cls) node.className = cls;

  if (value !== undefined) {
    node.textContent = value;
  }

  return node;
};


// ==========================================
// NOTÍCIAS
// ==========================================

function formatDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) {
    return '';
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
}


function validNews(item) {
  return (
    item &&
    item.status === 'Publicado' &&
    item.id != null &&
    typeof item.titulo === 'string'
  );
}


async function loadNews() {
  const grid = $('#newsGrid');

  if (!grid) return;

  try {
    const response = await fetch(NEWS_SOURCE, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const rows = await response.json();

    if (!Array.isArray(rows)) {
      throw new Error(
        'O JSON deve ser uma lista de notícias.'
      );
    }

    allNews = rows
      .filter(validNews)
      .sort(
        (a, b) =>
          (b.data || '').localeCompare(a.data || '')
      );

    renderNews();
    openNewsFromUrl();

  } catch (error) {
    console.error(
      'Não foi possível carregar as notícias:',
      error
    );

    grid.replaceChildren(
      el(
        'div',
        'empty-state',
        'Não foi possível carregar as notícias. Confira data/noticias.json.'
      )
    );
  }
}


// ==========================================
// CRIAÇÃO DOS CARTÕES DE NOTÍCIAS
// ==========================================

function makeNewsCard(n) {
  const article = el('article', 'news-card');

  const link = el('a');

  link.href =
    '?noticia=' + encodeURIComponent(n.id);

  link.setAttribute(
    'aria-label',
    'Ler notícia: ' + n.titulo
  );

  const imageWrap = el(
    'div',
    'news-image-wrap'
  );

  const img = el('img', 'news-image');

  img.src = getNewsImages(n)[0]?.src || IMAGE_FALLBACK;
  img.alt = n.titulo;
  img.loading = 'lazy';

  img.addEventListener(
    'error',
    () => {
      if (img.src !== IMAGE_FALLBACK) {
        img.src = IMAGE_FALLBACK;
      }
    },
    { once: true }
  );

  imageWrap.append(img);

  const body = el(
    'div',
    'news-card-body'
  );

  const meta = el('div', 'news-meta');

  meta.append(
    el(
      'span',
      'category',
      n.categoria || 'Notícias'
    ),
    el(
      'span',
      '',
      formatDate(n.data)
    )
  );

  body.append(
    meta,
    el('h3', '', n.titulo),
    el('p', '', n.resumo || ''),
    el(
      'span',
      'read-link',
      'Ler notícia ↗'
    )
  );

  link.append(imageWrap, body);

  link.addEventListener('click', event => {
    event.preventDefault();

    history.pushState(
      { news: n.id },
      '',
      link.href
    );

    openNews(n);
  });

  article.append(link);

  return article;
}


// ==========================================
// FILTROS E LISTAGEM DAS NOTÍCIAS
// ==========================================

function renderNews() {
  const grid = $('#newsGrid');

  if (!grid) return;

  const normalized = searchTerm
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

  const matches = allNews.filter(n => {
    const text = [
      n.titulo,
      n.resumo,
      n.categoria,
      n.conteudo
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');

    return (
      (category === 'Todas' ||
        n.categoria === category) &&
      text.includes(normalized)
    );
  });

  const shown = expanded
    ? matches
    : matches.slice(0, 3);

  grid.replaceChildren(
    ...shown.map(makeNewsCard)
  );

  if (!matches.length) {
    grid.append(
      el(
        'div',
        'empty-state',
        'Nenhuma notícia encontrada para sua busca.'
      )
    );
  }

  const contador = $('#newsCount');

  if (contador) {
    contador.textContent =
      matches.length === 1
        ? '1 notícia encontrada'
        : `${matches.length} notícias encontradas`;
  }

  const more = $('#showMore');

  if (more) {
    more.hidden = matches.length <= 3;

    more.textContent = expanded
      ? 'Mostrar menos ↑'
      : 'Ver mais notícias ↗';
  }
}


// ==========================================
// JANELA DE LEITURA DAS NOTÍCIAS
// ==========================================

// ==========================================
// FOTOS ADICIONAIS DAS NOTÍCIAS
// ==========================================

// A capa (imagem) vem primeiro. As imagens extras são opcionais.
// Também aceita um array JSON salvo como texto na planilha.
function getNewsImages(n) {
  const sources = [];
  if (typeof n.imagem === 'string' && n.imagem.trim()) {
    sources.push({ src: n.imagem.trim(), legenda: '' });
  }

  let extras = n.imagens || [];
  if (typeof extras === 'string') {
    const texto = extras.trim();
    if (texto.startsWith('[')) {
      try {
        extras = JSON.parse(texto);
      } catch (erro) {
        console.warn('Lista de imagens inválida na notícia:', n.id, erro);
        extras = [];
      }
    } else {
      // Uma imagem por linha no Google Sheets.
      extras = texto.split(/\r?\n/);
    }
  }

  if (!Array.isArray(extras)) extras = [];

  for (const item of extras) {
    const src = typeof item === 'string'
      ? item.trim()
      : typeof item?.src === 'string'
        ? item.src.trim()
        : typeof item?.url === 'string'
          ? item.url.trim()
          : '';

    if (!src) continue;

    sources.push({
      src,
      legenda: typeof item?.legenda === 'string'
        ? item.legenda.trim()
        : ''
    });
  }

  // Não repetir a capa se ela também estiver em 'imagens'.
  const vistas = new Set();
  return sources.filter(foto => {
    if (vistas.has(foto.src)) return false;
    vistas.add(foto.src);
    return true;
  });
}

function criarCarrosselNoticia(n) {
  const fotos = getNewsImages(n);
  if (!fotos.length) return null;

  const carrossel = el('section', 'news-media-carousel');
  carrossel.setAttribute('aria-label', 'Fotografias da notícia');

  const palco = el('div', 'news-media-stage');
  palco.setAttribute('aria-roledescription', 'carrossel');
  palco.setAttribute('aria-label', 'Galeria de fotografias');
  palco.tabIndex = 0;

  const slides = fotos.map((foto, indice) => {
    const figura = el('figure', 'news-media-slide');
    const imagem = el('img', 'news-media-image');
    imagem.src = foto.src;
    imagem.alt = foto.legenda || `${n.titulo}, fotografia ${indice + 1} de ${fotos.length}`;
    imagem.loading = indice === 0 ? 'eager' : 'lazy';
    imagem.decoding = 'async';
    imagem.draggable = false;

    // Imagem ausente: não travar a navegação da galeria.
    imagem.addEventListener('error', () => {
      imagem.alt = 'Fotografia indisponível';
      imagem.removeAttribute('src');
      figura.classList.add('news-media-slide--erro');
    }, { once: true });

    figura.append(imagem);
    if (foto.legenda) figura.append(el('figcaption', 'news-media-caption', foto.legenda));
    palco.append(figura);
    return figura;
  });

  const info = el('div', 'news-media-footer');
  const contador = el('span', 'news-media-counter');
  contador.setAttribute('aria-live', 'polite');
  const pontos = el('div', 'news-media-dots');
  pontos.setAttribute('aria-label', 'Selecionar fotografia');

  const voltar = el('button', 'news-media-arrow news-media-arrow--prev', '‹');
  const avancar = el('button', 'news-media-arrow news-media-arrow--next', '›');
  voltar.type = avancar.type = 'button';
  voltar.setAttribute('aria-label', 'Fotografia anterior');
  avancar.setAttribute('aria-label', 'Próxima fotografia');

  let atual = 0;
  const botoesPonto = fotos.map((_, indice) => {
    const ponto = el('button', 'news-media-dot');
    ponto.type = 'button';
    ponto.setAttribute('aria-label', `Mostrar fotografia ${indice + 1}`);
    ponto.addEventListener('click', () => exibir(indice));
    pontos.append(ponto);
    return ponto;
  });

  function exibir(indice) {
    atual = (indice + fotos.length) % fotos.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== atual;
      slide.setAttribute('aria-hidden', String(i !== atual));
    });
    botoesPonto.forEach((botao, i) => {
      botao.classList.toggle('active', i === atual);
      botao.setAttribute('aria-current', i === atual ? 'true' : 'false');
    });
    contador.textContent = `Foto ${atual + 1} de ${fotos.length}`;
  }

  voltar.addEventListener('click', () => exibir(atual - 1));
  avancar.addEventListener('click', () => exibir(atual + 1));

  // Arrastar horizontalmente no celular.
  let inicioX = null;
  palco.addEventListener('touchstart', evento => {
    inicioX = evento.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  palco.addEventListener('touchend', evento => {
    if (inicioX === null) return;
    const deslocamento = evento.changedTouches[0].clientX - inicioX;
    inicioX = null;
    if (Math.abs(deslocamento) > 45) exibir(atual + (deslocamento < 0 ? 1 : -1));
  }, { passive: true });

  // Navegação pelo teclado ao focar o carrossel.
  palco.addEventListener('keydown', evento => {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    exibir(atual + (evento.key === 'ArrowRight' ? 1 : -1));
  });

  carrossel.append(palco);
  if (fotos.length > 1) {
    palco.append(voltar, avancar);
    info.append(contador, pontos);
    carrossel.append(info);
  }
  exibir(0);

  newsPhotoCarouselController = {
    proxima: () => exibir(atual + 1),
    anterior: () => exibir(atual - 1)
  };
  return carrossel;
}

function openNews(n) {
  const content = $('#dialogContent');

  if (!content) return;

  content.replaceChildren();

  const tag = el(
    'span',
    'category',
    n.categoria || 'Notícias'
  );

  const heading = el(
    'h2',
    '',
    n.titulo
  );

  heading.id = 'dialogTitle';

  const date = el(
    'p',
    'dialog-meta',
    formatDate(n.data) + ' • Portal institucional'
  );

  content.append(
    tag,
    heading,
    date
  );

  // Exibe a capa e as imagens adicionais no carrossel.
  // Notícias antigas (apenas imagem) continuam funcionando.
  newsPhotoCarouselController = null;
  const carrossel = criarCarrosselNoticia(n);
  if (carrossel) content.append(carrossel);

  const text = el(
    'div',
    'dialog-body'
  );

  text.append(
    el(
      'p',
      '',
      n.conteudo || n.resumo || ''
    )
  );

  content.append(text);

  const dialog = $('#newsDialog');

  if (dialog && !dialog.open) {
    dialog.showModal();
  }

  document.body.classList.add(
    'modal-open'
  );
}


function closeNews({
  updateUrl = true
} = {}) {

  const dialog = $('#newsDialog');

  if (dialog?.open) {
    dialog.close();
  }

  document.body.classList.remove(
    'modal-open'
  );
  newsPhotoCarouselController = null;

  if (
    updateUrl &&
    new URL(location.href)
      .searchParams.has('noticia')
  ) {
    const url = new URL(location.href);

    url.searchParams.delete('noticia');

    history.replaceState(
      {},
      '',
      url.pathname + url.search + url.hash
    );
  }
}


function openNewsFromUrl() {
  const id = new URL(location.href)
    .searchParams.get('noticia');

  const found = id &&
    allNews.find(
      n => String(n.id) === id
    );

  if (found) {
    openNews(found);
  } else {
    closeNews({
      updateUrl: false
    });
  }
}


// ==========================================
// NAVEGAÇÃO DO PORTAL
// ==========================================

function initNavigation() {
  const menu = $('#menuToggle');
  const mobile = $('#mobileNav');
  const search = $('#searchToggle');
  const panel = $('#searchPanel');

  if (menu && mobile) {
    menu.addEventListener('click', () => {
      const open = mobile.hidden;

      mobile.hidden = !open;

      menu.setAttribute(
        'aria-expanded',
        String(open)
      );

      menu.setAttribute(
        'aria-label',
        open ? 'Fechar menu' : 'Abrir menu'
      );
    });

    mobile.querySelectorAll('a')
      .forEach(a => {
        a.addEventListener('click', () => {
          mobile.hidden = true;

          menu.setAttribute(
            'aria-expanded',
            'false'
          );
        });
      });
  }

  if (search && panel) {
    search.addEventListener('click', () => {
      const open = panel.hidden;

      panel.hidden = !open;

      search.setAttribute(
        'aria-expanded',
        String(open)
      );

      if (open) {
        $('#siteSearch')?.focus();
      }
    });
  }

  const siteSearch = $('#siteSearch');

  if (siteSearch) {
    siteSearch.addEventListener(
      'input',
      event => {
        searchTerm =
          event.target.value.trim();

        expanded = false;

        renderNews();
      }
    );
  }

  $('#searchClear')?.addEventListener(
    'click',
    () => {
      if (!siteSearch) return;

      siteSearch.value = '';
      searchTerm = '';

      renderNews();
      siteSearch.focus();
    }
  );

  document.querySelectorAll('.filter-btn')
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          category =
            button.dataset.filter;

          expanded = false;

          document.querySelectorAll(
            '.filter-btn'
          ).forEach(b => {
            const active = b === button;

            b.classList.toggle(
              'is-active',
              active
            );

            b.setAttribute(
              'aria-pressed',
              String(active)
            );
          });

          renderNews();
        }
      );
    });

  $('#showMore')?.addEventListener(
    'click',
    () => {
      expanded = !expanded;
      renderNews();
    }
  );

  $('#dialogClose')?.addEventListener(
    'click',
    () => closeNews()
  );

  $('#newsDialog')?.addEventListener(
    'close',
    () => {
      document.body.classList.remove(
        'modal-open'
      );
    }
  );

  $('#newsDialog')?.addEventListener(
    'click',
    event => {
      if (event.target === $('#newsDialog')) {
        closeNews();
      }
    }
  );

  window.addEventListener(
    'popstate',
    openNewsFromUrl
  );

  const back = $('#backToTop');

  if (back) {
    window.addEventListener(
      'scroll',
      () => {
        back.classList.toggle(
          'visible',
          window.scrollY > 500
        );
      },
      { passive: true }
    );

    back.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  const year =
    $('#year') ||
    $('#footer-year');

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
}


// ==========================================
// CARROSSEL DE FOTOGRAFIAS
// ==========================================

function initGallery() {
  const track = $('#galleryTrack');
  const dots = $('#galleryDots');

  if (!track || !dots) return;

  for (
    const [i, picture]
    of GALLERY.entries()
  ) {
    const slide = el(
      'figure',
      'gallery-slide'
    );

    const img = el('img');

    img.src = picture.src;
    img.alt = picture.title;
    img.loading = 'lazy';

    const caption = el(
      'figcaption',
      '',
      picture.title
    );

    slide.append(
      img,
      caption
    );

    track.append(slide);

    const dot = el(
      'button',
      'gallery-dot'
    );

    dot.type = 'button';

    dot.setAttribute(
      'aria-label',
      `Ir para fotografia ${i + 1}`
    );

    dot.addEventListener(
      'click',
      () => moveGallery(i)
    );

    dots.append(dot);
  }

  $('#galleryPrev')?.addEventListener(
    'click',
    () => moveGallery(galleryIndex - 1)
  );

  $('#galleryNext')?.addEventListener(
    'click',
    () => moveGallery(galleryIndex + 1)
  );

  $('#galleryStage')?.addEventListener(
    'keydown',
    event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveGallery(galleryIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveGallery(galleryIndex + 1);
      }
    }
  );

  let startX = 0;

  $('#galleryStage')?.addEventListener(
    'touchstart',
    event => {
      startX =
        event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  $('#galleryStage')?.addEventListener(
    'touchend',
    event => {
      const difference =
        event.changedTouches[0].screenX -
        startX;

      if (Math.abs(difference) > 45) {
        moveGallery(
          galleryIndex +
          (difference < 0 ? 1 : -1)
        );
      }
    },
    { passive: true }
  );

  moveGallery(0);

  // Avança automaticamente a cada 3 segundos.
  setInterval(() => {
    moveGallery(galleryIndex + 1);
  }, 3000);
}


function moveGallery(next) {
  galleryIndex =
    (next + GALLERY.length) %
    GALLERY.length;

  const track = $('#galleryTrack');

  if (track) {
    track.style.transform =
      `translateX(-${galleryIndex * 100}%)`;
  }

  const counter = $('#galleryCounter');

  if (counter) {
    counter.textContent =
      `${String(galleryIndex + 1).padStart(2, '0')}` +
      ` / ${String(GALLERY.length).padStart(2, '0')}`;
  }

  document.querySelectorAll('.gallery-dot')
    .forEach((dot, i) => {
      dot.classList.toggle(
        'active',
        i === galleryIndex
      );

      dot.setAttribute(
        'aria-current',
        i === galleryIndex
          ? 'true'
          : 'false'
      );
    });
}


// ==========================================
// ANIMAÇÕES DE ENTRADA NA PÁGINA
// ==========================================

function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal')
      .forEach(
        element => element.classList.add(
          'visible'
        )
      );

    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(
            'visible'
          );

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('.reveal')
    .forEach(
      element => observer.observe(element)
    );
}


// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================

function iniciarConteudo() {
  if (
    document.getElementById('galleryTrack') &&
    document.getElementById('galleryDots')
  ) {
    initGallery();
  }

  initReveal();

  if (document.getElementById('newsGrid')) {
    loadNews();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    iniciarConteudo,
    { once: true }
  );
} else {
  iniciarConteudo();
}


// Navegação carregada após header e footer.
document.addEventListener(
  'components:ready',
  () => {
    if (document.getElementById('newsGrid')) {
      initNavigation();
    }
  }
);


// ==========================================
// COPIAR E-MAIL INSTITUCIONAL
// ==========================================

function iniciarCopiaEmail() {
  const copyEmailBtn =
    document.getElementById('copyEmailBtn');

  const emailInstitucional =
    document.getElementById('emailInstitucional');

  const copyEmailMessage =
    document.getElementById('copyEmailMessage');

  if (
    !copyEmailBtn ||
    !emailInstitucional ||
    !copyEmailMessage
  ) {
    return;
  }

  let timeoutMensagem;

  copyEmailBtn.addEventListener(
    'click',
    async () => {
      const email =
        emailInstitucional.textContent.trim();

      try {
        await navigator.clipboard.writeText(
          email
        );

        copyEmailMessage.textContent =
          'Copiado! ✓';

        clearTimeout(timeoutMensagem);

        timeoutMensagem = setTimeout(
          () => {
            copyEmailMessage.textContent = '';
          },
          2000
        );

      } catch (erro) {
        copyEmailMessage.textContent =
          'Erro ao copiar';

        console.error(erro);
      }
    }
  );
}


// ==========================================
// FECHAR JANELA DE NOTÍCIAS
// ==========================================

function configurarFechamentoNoticias() {
  const dialog =
    document.querySelector('.news-dialog');

  if (!dialog) return;

  const botaoFechar =
    dialog.querySelector('.dialog-close');

  if (botaoFechar) {
    botaoFechar.addEventListener(
      'click',
      () => dialog.close()
    );
  }

  dialog.addEventListener(
    'click',
    evento => {
      if (evento.target === dialog) {
        dialog.close();
      }
    }
  );

  dialog.addEventListener(
    'close',
    () => {
      document.body.classList.remove(
        'modal-open'
      );
    }
  );
}


// ==========================================
// QUADRO INTERATIVO DO MAPA
// ==========================================

function iniciarQuadroMapa() {
  const quadro =
    document.getElementById('creFramedMap');

  const botao =
    document.getElementById('creMapExpand');

  if (!quadro || !botao) return;

  function alternarQuadro(ampliar) {
    quadro.classList.toggle(
      'is-expanded',
      ampliar
    );

    document.body.classList.toggle(
      'cre-map-open',
      ampliar
    );

    botao.setAttribute(
      'aria-expanded',
      String(ampliar)
    );

    botao.textContent = ampliar
      ? '✕ Reduzir mapa'
      : '⛶ Ampliar mapa';
  }

  botao.addEventListener(
    'click',
    () => {
      const ampliar =
        !quadro.classList.contains(
          'is-expanded'
        );

      alternarQuadro(ampliar);
    }
  );

  document.addEventListener(
    'keydown',
    evento => {
      if (
        evento.key === 'Escape' &&
        quadro.classList.contains(
          'is-expanded'
        )
      ) {
        alternarQuadro(false);
        botao.focus();
      }
    }
  );
}


// ==========================================
// NOVO DESIGN DAS REDES SOCIAIS
// ==========================================

function iniciarRedesSociaisCRE() {
  const secao =
    document.getElementById('redes-sociais');

  if (!secao) return;

  if (secao.dataset.iniciado === 'true') {
    return;
  }

  secao.dataset.iniciado = 'true';

  const reducao = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Iluminação suave que acompanha
  // a posição do cursor nos cartões.
  if (!reducao) {
    const cartoes = secao.querySelectorAll(
      '.cre-social-card'
    );

    cartoes.forEach(cartao => {
      cartao.addEventListener(
        'pointermove',
        evento => {
          if (evento.pointerType === 'touch') {
            return;
          }

          const r =
            cartao.getBoundingClientRect();

          const x =
            ((evento.clientX - r.left) /
              r.width) * 100;

          const y =
            ((evento.clientY - r.top) /
              r.height) * 100;

          cartao.style.setProperty(
            '--pointer-x',
            `${x}%`
          );

          cartao.style.setProperty(
            '--pointer-y',
            `${y}%`
          );
        }
      );
    });
  }

  // Compartilhamento do portal.
  const botao =
    document.getElementById(
      'creSocialShare'
    );

  const status =
    document.getElementById(
      'creSocialShareStatus'
    );

  if (!botao || !status) return;

  botao.addEventListener(
    'click',
    async () => {
      const endereco = new URL(
        'index.html',
        document.baseURI
      ).href;

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Portal CRE',
            url: endereco
          });

          status.textContent = '';

        } else if (
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(
            endereco
          );

          status.textContent =
            'Link do portal copiado!';

        } else {
          status.textContent =
            'Copie o endereço do portal na barra do navegador.';
        }

      } catch (erro) {
        if (erro.name !== 'AbortError') {
          status.textContent =
            'Não foi possível compartilhar o link.';
        }
      }
    }
  );
}


// ==========================================
// INICIALIZAR FUNCIONALIDADES ADICIONAIS
// ==========================================

function iniciarExtras() {
  iniciarCopiaEmail();
  configurarFechamentoNoticias();
  iniciarQuadroMapa();
  iniciarRedesSociaisCRE();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    iniciarExtras,
    { once: true }
  );
} else {
  iniciarExtras();
}

