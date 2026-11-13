/* ========================================================
   NOSSA EQUIPE: DOIS QUADROS DE CARTAS INDEPENDENTES
   1. Diretores: data/diretores.json
   2. Funcionários: data/funcionarios.json
   Reutiliza os estilos existentes em css/styles.css.
   ======================================================== */
(() => {
  'use strict';

  const dialogo = document.getElementById('teamMemberDialog');
  const botaoFechar = document.getElementById('teamDialogClose');
  const fotoDialogo = document.getElementById('teamDialogPhoto');
  const nomeDialogo = document.getElementById('teamDialogName');
  const infoDialogo = document.getElementById('teamDialogSchool');
  const funcaoDialogo = document.getElementById('teamDialogRole');
  const rotuloDialogo = document.getElementById('teamDialogLabel');
  const kickerDialogo = document.getElementById('teamDialogKicker');
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Um único diálogo serve às cartas dos dois quadros.
  function mostrarDetalhes(pessoa, tipo) {
    if (!dialogo || typeof dialogo.showModal !== 'function') return;

    const funcionario = tipo === 'funcionarios';
    nomeDialogo.textContent = pessoa.nome;
    fotoDialogo.src = pessoa.foto;
    fotoDialogo.alt = pessoa.imagemIlustrativa
      ? `Ilustração que ocupa o lugar da foto de ${pessoa.nome}`
      : `Fotografia de ${pessoa.nome}`;

    if (funcaoDialogo) {
      funcaoDialogo.textContent = funcionario
        ? (pessoa.cargo || 'Equipe da Coordenadoria')
        : 'Direção escolar';
    }
    if (rotuloDialogo) {
      rotuloDialogo.textContent = funcionario ? 'SETOR / ATUAÇÃO' : 'UNIDADE ESCOLAR';
    }
    if (kickerDialogo) {
      kickerDialogo.textContent = funcionario ? 'EQUIPE DA COORDENADORIA' : 'NOSSA EQUIPE';
    }
    infoDialogo.textContent = funcionario
      ? (pessoa.setor || 'Coordenadoria Regional de Educação')
      : pessoa.escola;

    if (!dialogo.open) dialogo.showModal();
  }

  botaoFechar?.addEventListener('click', () => dialogo.close());
  dialogo?.addEventListener('click', evento => {
    if (evento.target === dialogo) dialogo.close();
  });

  const TEMPO_RECOLHIMENTO = 900;
  const PASSO_RECOLHIMENTO = 70;
  const MAX_ATRASO_RECOLHIMENTO = 560;
  const PAUSA_NA_PILHA = 250;
  const TEMPO_ESPALHAMENTO = 1050;
  const aguardar = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  function iniciarQuadro(config) {
    const mesa = document.getElementById(config.mesa);
    const botaoDistribuir = document.getElementById(config.botao);
    const indicador = document.getElementById(config.indicador);
    const mensagem = document.getElementById(config.mensagem);
    if (!mesa || !botaoDistribuir || !mensagem || mesa.dataset.iniciado === 'true') return;
    mesa.dataset.iniciado = 'true';

    let pessoas = [];
    let cartas = [];
    let jaDistribuiu = false;
    let sorteio = 0;
    let agendamentoResize;
    let redistribuindo = false;

    const variacao = (indice, fator) => Math.sin((indice + 1) * fator + sorteio);

    function criarCarta(pessoa, indice) {
      const carta = document.createElement('button');
      carta.type = 'button';
      carta.className = 'team-director-card'; // Reutiliza o CSS das cartas existentes.
      const complemento = config.tipo === 'funcionarios'
        ? (pessoa.cargo || pessoa.setor || 'Coordenadoria')
        : pessoa.escola;
      carta.setAttribute('aria-label', `Conhecer ${pessoa.nome}, ${complemento}`);
      carta.style.setProperty('--team-stack-angle', `${(-3 + indice * .62).toFixed(1)}deg`);
      carta.style.setProperty('--team-delay', `${Math.min(indice * 120, 1320)}ms`);
      carta.style.setProperty('--team-return-delay',
        `${Math.min((pessoas.length - 1 - indice) * PASSO_RECOLHIMENTO, MAX_ATRASO_RECOLHIMENTO)}ms`);
      carta.style.zIndex = String(indice + 2);

      const moldura = document.createElement('div');
      moldura.className = 'team-director-photo';
      const foto = document.createElement('img');
      foto.src = pessoa.foto;
      foto.loading = indice < 4 ? 'eager' : 'lazy';
      foto.alt = pessoa.imagemIlustrativa
        ? 'Imagem ilustrativa, fotografia ainda não cadastrada'
        : `Fotografia de ${pessoa.nome}`;
      moldura.append(foto);
      carta.append(moldura);
      carta.addEventListener('click', () => mostrarDetalhes(pessoa, config.tipo));
      return carta;
    }

    function organizarMesa() {
      const largura = mesa.clientWidth;
      if (!largura || !cartas.length) return;

      const colunas = largura >= 1110 ? 4 : largura >= 785 ? 3 : largura >= 530 ? 2 : 1;
      const espacamento = largura < 530 ? 18 : 31;
      const larguraCarta = Math.max(172, Math.min(largura < 530 ? 274 : 238,
        (largura - 78 - (colunas - 1) * espacamento) / colunas));
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

    async function distribuir() {
      mesa.classList.remove('is-gathering');
      mesa.classList.add('is-animating');
      botaoDistribuir.disabled = true;
      mesa.classList.add('is-dealt');
      jaDistribuiu = true;
      if (!reduzMovimento.matches) {
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
        mesa.classList.add('is-gathering');
        mesa.classList.remove('is-dealt');
        if (!reduzMovimento.matches) {
          const ultimoAtraso = Math.min((cartas.length - 1) * PASSO_RECOLHIMENTO,
            MAX_ATRASO_RECOLHIMENTO);
          await aguardar(TEMPO_RECOLHIMENTO + ultimoAtraso + 100);
        }
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

    async function carregarPessoas() {
      try {
        const resposta = await fetch(new URL(config.arquivo, document.baseURI), { cache: 'no-store' });
        if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} em ${config.arquivo}`);
        const dados = await resposta.json();
        const itens = Array.isArray(dados) ? dados : dados[config.chave];
        if (!Array.isArray(itens)) throw new Error('Formato inválido do arquivo JSON.');

        pessoas = itens.filter(pessoa => pessoa && pessoa.nome && pessoa.foto &&
          (config.tipo === 'funcionarios' || pessoa.escola));
        if (!pessoas.length) {
          throw new Error(`Nenhuma pessoa cadastrada em ${config.arquivo}`);
        }

        mensagem.remove();
        cartas = pessoas.map(criarCarta);
        mesa.append(...cartas);
        mesa.setAttribute('aria-busy', 'false');
        if (indicador) {
          indicador.textContent = config.tipo === 'funcionarios'
            ? `${pessoas.length} integrantes da Coordenadoria`
            : `${pessoas.length} integrantes da direção escolar`;
        }
        organizarMesa();

        if ('IntersectionObserver' in window) {
          const observador = new IntersectionObserver(entradas => {
            if (entradas.some(entrada => entrada.isIntersecting)) {
              observador.disconnect();
              iniciarDistribuicao();
            }
          }, { threshold: .06 });
          observador.observe(mesa);
        } else {
          iniciarDistribuicao();
        }
      } catch (erro) {
        console.error(`Falha ao carregar ${config.arquivo}:`, erro);
        mensagem.textContent = config.tipo === 'funcionarios'
          ? 'Não foi possível carregar os funcionários. Confira data/funcionarios.json.'
          : 'Não foi possível carregar a equipe. Confira data/diretores.json.';
        mesa.setAttribute('aria-busy', 'false');
      }
    }

    void carregarPessoas();
  }

  iniciarQuadro({
    tipo: 'diretores',
    mesa: 'teamTable',
    botao: 'teamRedeal',
    indicador: 'teamMemberCount',
    mensagem: 'teamLoading',
    arquivo: 'data/diretores.json',
    chave: 'diretores'
  });

  iniciarQuadro({
    tipo: 'funcionarios',
    mesa: 'staffTable',
    botao: 'staffRedeal',
    indicador: 'staffMemberCount',
    mensagem: 'staffLoading',
    arquivo: 'data/funcionarios.json',
    chave: 'funcionarios'
  });
})();
