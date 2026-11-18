'use strict';

/* ============================================================
   GALERIA DE FOTOS AVULSAS DAS MELHORIAS
   Fonte: data/galeria-melhorias.json
   Independente do comparador ANTES/DEPOIS.
   ============================================================ */
(() => {
  const trilho = document.getElementById('imprExtraTrack');
  if (!trilho) return;

  const anterior = document.getElementById('imprExtraPrev');
  const proximo = document.getElementById('imprExtraNext');
  const contador = document.getElementById('imprExtraCounter');
  const janela = document.getElementById('imprExtraDialog');
  const janelaFoto = document.getElementById('imprExtraDialogImage');
  const janelaTitulo = document.getElementById('imprExtraDialogTitle');
  const janelaEscola = document.getElementById('imprExtraDialogSchool');
  const janelaDescricao = document.getElementById('imprExtraDialogDescription');
  const janelaPosicao = document.getElementById('imprExtraDialogPosition');
  const janelaAnterior = document.getElementById('imprExtraDialogPrev');
  const janelaProximo = document.getElementById('imprExtraDialogNext');
  const janelaFechar = document.getElementById('imprExtraDialogClose');

  let fotos = [];
  let indiceAberto = 0;
  let quadroDeRolagem = 0;

  function elemento(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function mostrarEstado(texto) {
    trilho.replaceChildren(elemento('p', 'impr-extra-empty', texto));
    anterior.disabled = true;
    proximo.disabled = true;
    contador.textContent = '0 fotografias';
  }

  function abrirFotografia(indice) {
    if (!janela || typeof janela.showModal !== 'function') return;
    if (!fotos.length) return;

    indiceAberto = Math.max(0, Math.min(indice, fotos.length - 1));
    const foto = fotos[indiceAberto];

    janelaTitulo.textContent = foto.titulo;
    janelaEscola.textContent = [foto.escola, foto.municipio].filter(Boolean).join(' · ');
    janelaDescricao.textContent = foto.descricao || '';
    janelaDescricao.hidden = !foto.descricao;
    janelaFoto.src = foto.imagem;
    janelaFoto.alt = `${foto.titulo}${foto.escola ? ' na ' + foto.escola : ''}`;
    janelaPosicao.textContent = `${indiceAberto + 1} de ${fotos.length}`;
    janelaAnterior.disabled = indiceAberto === 0;
    janelaProximo.disabled = indiceAberto === fotos.length - 1;

    if (!janela.open) janela.showModal();
  }

  function criarCartao(foto, indice) {
    const cartao = elemento('article', 'impr-extra-card');

    const abrir = elemento('button', 'impr-extra-card__photo');
    abrir.type = 'button';
    abrir.setAttribute('aria-label', `Ampliar fotografia: ${foto.titulo}`);

    const imagem = elemento('img');
    imagem.src = foto.imagem;
    imagem.alt = `${foto.titulo}${foto.escola ? ' na ' + foto.escola : ''}`;
    imagem.loading = indice < 3 ? 'eager' : 'lazy';
    imagem.decoding = 'async';
    imagem.addEventListener('error', () => {
      abrir.disabled = true;
      abrir.replaceChildren(elemento('span', 'impr-extra-card__error', 'Fotografia indisponível'));
    }, { once: true });

    const ampliar = elemento('span', 'impr-extra-card__zoom', '⤢ Ampliar');
    ampliar.setAttribute('aria-hidden', 'true');
    abrir.append(imagem, ampliar);
    abrir.addEventListener('click', () => abrirFotografia(indice));

    const corpo = elemento('div', 'impr-extra-card__body');
    corpo.append(
      elemento('span', 'impr-extra-card__eyebrow', 'REGISTRO FOTOGRÁFICO'),
      elemento('h3', '', foto.titulo),
      elemento('p', 'impr-extra-card__school', [foto.escola, foto.municipio].filter(Boolean).join(' · '))
    );
    if (foto.descricao) corpo.append(elemento('p', 'impr-extra-card__description', foto.descricao));

    cartao.append(abrir, corpo);
    return cartao;
  }

  function atualizarControles() {
    if (!fotos.length) return;

    const noFim = trilho.scrollLeft >= trilho.scrollWidth - trilho.clientWidth - 3;
    const noInicio = trilho.scrollLeft <= 3;
    anterior.disabled = noInicio;
    proximo.disabled = noFim;

    const caixa = trilho.getBoundingClientRect();
    const cartas = Array.from(trilho.querySelectorAll('.impr-extra-card'));
    const visiveis = [];

    cartas.forEach((carta, i) => {
      const retangulo = carta.getBoundingClientRect();
      const sobreposicao = Math.max(0,
        Math.min(retangulo.right, caixa.right) - Math.max(retangulo.left, caixa.left)
      );
      if (sobreposicao >= retangulo.width * 0.5) visiveis.push(i + 1);
    });

    if (!visiveis.length) {
      contador.textContent = `${fotos.length} fotografias`;
    } else {
      const primeira = visiveis[0];
      const ultima = visiveis[visiveis.length - 1];
      contador.textContent = primeira === ultima
        ? `${primeira} de ${fotos.length} fotografias`
        : `${primeira}–${ultima} de ${fotos.length} fotografias`;
    }
  }

  function movimentar(sentido) {
    const carta = trilho.querySelector('.impr-extra-card');
    if (!carta) return;
    const gap = parseFloat(getComputedStyle(trilho).columnGap) || 0;
    const distancia = carta.getBoundingClientRect().width + gap;
    trilho.scrollBy({
      left: distancia * sentido,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  }

  anterior.addEventListener('click', () => movimentar(-1));
  proximo.addEventListener('click', () => movimentar(1));

  trilho.addEventListener('keydown', (evento) => {
    if (janela?.open) return;
    if (evento.key === 'ArrowRight' || evento.key === 'ArrowLeft') {
      evento.preventDefault();
      movimentar(evento.key === 'ArrowRight' ? 1 : -1);
    }
  });

  trilho.addEventListener('scroll', () => {
    if (quadroDeRolagem) return;
    quadroDeRolagem = requestAnimationFrame(() => {
      quadroDeRolagem = 0;
      atualizarControles();
    });
  }, { passive: true });

  window.addEventListener('resize', atualizarControles);

  janelaFechar?.addEventListener('click', () => janela.close());
  janelaAnterior?.addEventListener('click', () => abrirFotografia(indiceAberto - 1));
  janelaProximo?.addEventListener('click', () => abrirFotografia(indiceAberto + 1));
  janela?.addEventListener('click', (evento) => {
    if (evento.target === janela) janela.close();
  });
  janela?.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft' && indiceAberto > 0) {
      evento.preventDefault();
      abrirFotografia(indiceAberto - 1);
    } else if (evento.key === 'ArrowRight' && indiceAberto < fotos.length - 1) {
      evento.preventDefault();
      abrirFotografia(indiceAberto + 1);
    }
  });

  async function carregarGaleria() {
    try {
      const resposta = await fetch(new URL('data/galeria-melhorias.json', document.baseURI), {
        cache: 'no-store'
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      const lista = Array.isArray(dados) ? dados : dados.fotos;
      if (!Array.isArray(lista)) throw new Error('O JSON deve conter uma lista de fotografias.');

      fotos = lista.filter(item => item &&
        typeof item.titulo === 'string' && item.titulo.trim() &&
        typeof item.imagem === 'string' && item.imagem.trim()
      );

      if (!fotos.length) {
        mostrarEstado('Ainda não há fotos avulsas cadastradas. Adicione-as em data/galeria-melhorias.json.');
        return;
      }

      trilho.replaceChildren(...fotos.map(criarCartao));
      trilho.scrollLeft = 0;
      requestAnimationFrame(atualizarControles);
    } catch (erro) {
      console.error('Não foi possível carregar a galeria de melhorias:', erro);
      mostrarEstado('Não foi possível carregar a galeria. Verifique data/galeria-melhorias.json e abra a página pelo Live Server.');
    }
  }

  carregarGaleria();
})();
