/* ========================================================
   PÁGINA NOSSA EQUIPE - CARTAS DISTRIBUÍDAS
   Arquivo independente: js/equipe.js
   ======================================================== */
(() => {
  const mesa = document.getElementById('teamTable');
  if (!mesa) return; // Mantém as demais páginas do portal intactas.
  if (mesa.dataset.iniciado === 'true') return;
  mesa.dataset.iniciado = 'true';

  const botaoDistribuir = document.getElementById('teamRedeal');
  const indicador = document.getElementById('teamMemberCount');
  const mensagem = document.getElementById('teamLoading');
  const dialogo = document.getElementById('teamMemberDialog');
  const botaoFechar = document.getElementById('teamDialogClose');
  const fotoDialogo = document.getElementById('teamDialogPhoto');
  const nomeDialogo = document.getElementById('teamDialogName');
  const escolaDialogo = document.getElementById('teamDialogSchool');
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  let diretores = [];
  let cartas = [];
  let jaDistribuiu = false;
  let sorteio = 0;
  let agendamentoResize;
  let redistribuindo = false;

  // Duração da volta ao baralho, sincronizada com a regra CSS is-gathering.
  const TEMPO_RECOLHIMENTO = 900;
  const PASSO_RECOLHIMENTO = 70;
  const MAX_ATRASO_RECOLHIMENTO = 560;
  const PAUSA_NA_PILHA = 250;
  const TEMPO_ESPALHAMENTO = 1050;
  const aguardar = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));

  // Número pseudoaleatório reproduzível, evitando saltos bruscos ao redimensionar.
  const variacao = (indice, fator) => Math.sin((indice + 1) * fator + sorteio) * 1;

  function mostrarDetalhes(diretor) {
    if (!dialogo || typeof dialogo.showModal !== 'function') return;
    nomeDialogo.textContent = diretor.nome;
    escolaDialogo.textContent = diretor.escola;
    fotoDialogo.src = diretor.foto;
    fotoDialogo.alt = diretor.imagemIlustrativa
      ? 'Ilustração que ocupa o lugar da foto de ' + diretor.nome
      : 'Fotografia de ' + diretor.nome;
    dialogo.showModal();
  }

  if (botaoFechar) botaoFechar.addEventListener('click', () => dialogo.close());
  if (dialogo) dialogo.addEventListener('click', evento => {
    if (evento.target === dialogo) dialogo.close();
  });

  function criarCarta(diretor, indice) {
    const carta = document.createElement('button');
    carta.type = 'button';
    carta.className = 'team-director-card';
    carta.setAttribute('aria-label', 'Conhecer ' + diretor.nome + ', ' + diretor.escola);
    carta.style.setProperty('--team-stack-angle', `${(-3 + indice * .62).toFixed(1)}deg`);
    carta.style.setProperty('--team-delay', `${Math.min(indice * 120, 1320)}ms`);
    // As cartas retornam na ordem inversa da distribuição.
    carta.style.setProperty('--team-return-delay',
      `${Math.min((diretores.length - 1 - indice) * PASSO_RECOLHIMENTO, MAX_ATRASO_RECOLHIMENTO)}ms`);
    carta.style.zIndex = String(indice + 2);

    const moldura = document.createElement('div');
    moldura.className = 'team-director-photo';
    const foto = document.createElement('img');
    foto.src = diretor.foto;
    foto.loading = indice < 4 ? 'eager' : 'lazy';
    foto.alt = diretor.imagemIlustrativa
      ? 'Imagem ilustrativa, fotografia ainda não cadastrada'
      : 'Fotografia de ' + diretor.nome;
    moldura.appendChild(foto);

    // O nome, a escola e o título já fazem parte da arte da foto.
    // Mantemos nome/escola no JSON para descrição acessível e diálogo.
    carta.append(moldura);
    carta.addEventListener('click', () => mostrarDetalhes(diretor));
    return carta;
  }

  function organizarMesa() {
    const largura = mesa.clientWidth;
    if (!largura || !cartas.length) return;
    const colunas = largura >= 1110 ? 4 : largura >= 785 ? 3 : largura >= 530 ? 2 : 1;
    const espacamento = largura < 530 ? 18 : 31;
    const larguraCarta = Math.max(172, Math.min(largura < 530 ? 274 : 238,
      (largura - 78 - (colunas - 1) * espacamento) / colunas));
    // Cartões verticais 2:3: o espaçamento acompanha a altura real
    // para evitar que fotos inteiras se sobreponham ou saiam da mesa.
    const alturaCarta = (larguraCarta - 16) * 1.5 + 16;
    const distanciaLinhas = alturaCarta + (largura < 530 ? 45 : 55);
    const linhas = Math.ceil(cartas.length / colunas);
    const yInicial = Math.max(235, alturaCarta / 2 + 82);
    const alturaMesa = Math.ceil(yInicial + (linhas - 1) * distanciaLinhas + alturaCarta / 2 + 76);
    mesa.style.setProperty('--team-card-width', `${larguraCarta}px`);
    mesa.style.height = `${alturaMesa}px`;

    cartas.forEach((carta, i) => {
      const linha = Math.floor(i / colunas);
      const posicao = i % colunas;
      const qtNaLinha = Math.min(colunas, cartas.length - linha * colunas);
      const larguraLinha = qtNaLinha * larguraCarta + (qtNaLinha - 1) * espacamento;
      const inicio = (largura - larguraLinha) / 2;
      const desvioX = colunas === 1 ? 0 : variacao(i, 2.7) * 7;
      const desvioY = variacao(i, 1.43) * 11;
      const x = inicio + larguraCarta / 2 + posicao * (larguraCarta + espacamento) + desvioX;
      const y = yInicial + linha * distanciaLinhas + desvioY;
      const giro = variacao(i, 1.92) * 5.6;
      carta.style.setProperty('--team-x', `${x.toFixed(1)}px`);
      carta.style.setProperty('--team-y', `${y.toFixed(1)}px`);
      carta.style.setProperty('--team-rotation', `${giro.toFixed(2)}deg`);
    });
  }

  // Etapa 2: espalhar todas as cartas depois que a pilha estiver completa.
  async function distribuir() {
    mesa.classList.remove('is-gathering');
    mesa.classList.add('is-animating');
    botaoDistribuir.disabled = true;
    mesa.classList.add('is-dealt');
    jaDistribuiu = true;

    if (!reduzMovimento.matches) {
      // Espera a última carta terminar sua transição, inclusive o atraso.
      const ultimoAtraso = Math.min((cartas.length - 1) * 120, 1320);
      await aguardar(TEMPO_ESPALHAMENTO + ultimoAtraso + 100);
    }

    mesa.classList.remove('is-animating');
    botaoDistribuir.disabled = false;
  }

  function iniciarDistribuicao() {
    if (jaDistribuiu) return;
    if (reduzMovimento.matches) {
      void distribuir();
    } else {
      window.setTimeout(() => { void distribuir(); }, 330);
    }
  }

  botaoDistribuir.addEventListener('click', async () => {
    if (!cartas.length || botaoDistribuir.disabled || redistribuindo) return;
    redistribuindo = true;
    botaoDistribuir.disabled = true;
    mesa.classList.add('is-animating');

    try {
      // Etapa 1: recolher as cartas da mesa até a posição da pilha central.
      // CSS cuida do movimento. Os atrasos são invertidos em relação à saída.
      mesa.classList.add('is-gathering');
      mesa.classList.remove('is-dealt');

      if (!reduzMovimento.matches) {
        const ultimoAtraso = Math.min((cartas.length - 1) * PASSO_RECOLHIMENTO,
          MAX_ATRASO_RECOLHIMENTO);
        await aguardar(TEMPO_RECOLHIMENTO + ultimoAtraso + 100);
      }

      // Somente depois que TODAS voltaram, sortear novas posições e espalhar.
      sorteio += 1.83;
      organizarMesa();
      mesa.classList.remove('is-gathering');
      if (!reduzMovimento.matches) await aguardar(PAUSA_NA_PILHA);
      await distribuir();
    } finally {
      redistribuindo = false;
      mesa.classList.remove('is-animating', 'is-gathering');
      botaoDistribuir.disabled = false;
    }
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(agendamentoResize);
    agendamentoResize = window.setTimeout(organizarMesa, 130);
  });

  async function carregarEquipe() {
    try {
      const resposta = await fetch(new URL('data/diretores.json', document.baseURI), {cache: 'no-store'});
      if (!resposta.ok) throw new Error('Erro HTTP ' + resposta.status);
      const dados = await resposta.json();
      const itens = Array.isArray(dados) ? dados : dados.diretores;
      if (!Array.isArray(itens)) throw new Error('Formato inválido do arquivo de diretores.');
      diretores = itens.filter(pessoa => pessoa && pessoa.nome && pessoa.escola && pessoa.foto);
      if (!diretores.length) throw new Error('Não há diretores cadastrados.');

      mensagem.remove();
      cartas = diretores.map((diretor, indice) => criarCarta(diretor, indice));
      mesa.append(...cartas);
      mesa.setAttribute('aria-busy', 'false');
      indicador.textContent = `${diretores.length} integrantes da direção escolar`;
      organizarMesa();

      if ('IntersectionObserver' in window) {
        const observador = new IntersectionObserver(entradas => {
          if (entradas.some(entrada => entrada.isIntersecting)) {
            observador.disconnect();
            iniciarDistribuicao();
          }
        }, {threshold: .06});
        observador.observe(mesa);
      } else {
        iniciarDistribuicao();
      }
    } catch (erro) {
      console.error('Falha ao carregar equipe:', erro);
      mensagem.textContent = 'Não foi possível carregar a equipe. Verifique se data/diretores.json existe e se você abriu a página pelo Live Server.';
      mesa.setAttribute('aria-busy', 'false');
    }
  }

  carregarEquipe();
})();
