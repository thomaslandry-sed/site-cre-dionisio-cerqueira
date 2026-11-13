'use strict';

/* ========================================================
   MELHORIAS NAS ESCOLAS: comparador antes/depois e filtros.
   Os registros são editados em data/melhorias.json.
   ======================================================== */
(() => {
  const grid = document.getElementById('imprGrid');
  if (!grid) return;

  const busca = document.getElementById('imprSearch');
  const filtroEscola = document.getElementById('imprSchoolFilter');
  const filtroTipo = document.getElementById('imprTypeFilter');
  const botaoLimpar = document.getElementById('imprReset');
  const resultados = document.getElementById('imprResultCount');
  const avisoDemo = document.getElementById('imprDemoNotice');
  const modal = document.getElementById('imprDialog');
  const modalTitulo = document.getElementById('imprDialogTitle');
  const modalEscola = document.getElementById('imprDialogSchool');
  const modalComparador = document.getElementById('imprDialogComparison');
  const modalFechar = document.getElementById('imprDialogClose');
  let registros = [];

  const criar = (tag, classe, texto) => {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function criarImagem(caminho, alternativo, antes) {
    const img = document.createElement('img');
    img.src = caminho;
    img.alt = alternativo;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      const reserva = antes
        ? 'assets/melhorias/exemplo-antes.svg'
        : 'assets/melhorias/exemplo-depois.svg';
      if (!img.src.endsWith(reserva)) img.src = reserva;
    });
    return img;
  }

  function criarComparador(registro) {
    const comparador = criar('div', 'impr-compare');
    comparador.style.setProperty('--split', '50%');

    const antes = criar('div', 'impr-compare__before');
    antes.append(criarImagem(
      registro.antes,
      `Antes da melhoria: ${registro.titulo}, ${registro.escola}`,
      true
    ));

    const depois = criar('div', 'impr-compare__after');
    depois.append(criarImagem(
      registro.depois,
      `Depois da melhoria: ${registro.titulo}, ${registro.escola}`,
      false
    ));

    const etiquetaAntes = criar('span', 'impr-compare__label impr-compare__label--before', 'ANTES');
    const etiquetaDepois = criar('span', 'impr-compare__label impr-compare__label--after', 'DEPOIS');
    etiquetaAntes.setAttribute('aria-hidden', 'true');
    etiquetaDepois.setAttribute('aria-hidden', 'true');

    const divisoria = criar('span', 'impr-compare__separator');
    divisoria.setAttribute('aria-hidden', 'true');
    divisoria.append(criar('span', 'impr-compare__thumb', '↔'));

    const controle = document.createElement('input');
    controle.type = 'range';
    controle.className = 'impr-compare__range';
    controle.min = '0';
    controle.max = '100';
    controle.step = '1';
    controle.value = '50';
    controle.setAttribute('aria-label', `Comparar fotos de antes e depois: ${registro.titulo}, ${registro.escola}`);
    controle.setAttribute('aria-valuetext', '50% da imagem antes e 50% da imagem depois');

    controle.addEventListener('input', () => {
      const valor = Number(controle.value);
      comparador.style.setProperty('--split', `${valor}%`);
      controle.setAttribute('aria-valuetext', `${valor}% da imagem antes e ${100 - valor}% da imagem depois`);
    });

    comparador.append(antes, depois, etiquetaAntes, etiquetaDepois, divisoria, controle);
    return comparador;
  }

  function abrirDetalhes(registro) {
    if (!modal || typeof modal.showModal !== 'function') return;
    modalTitulo.textContent = registro.titulo;
    modalEscola.textContent = [registro.escola, registro.municipio].filter(Boolean).join(' · ');
    modalComparador.replaceChildren(criarComparador(registro));
    modal.showModal();
    modalComparador.querySelector('input')?.focus();
  }

  modalFechar?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', evento => {
    if (evento.target === modal) modal.close();
  });

  function criarCartao(registro) {
    const cartao = criar('article', 'impr-card');
    cartao.setAttribute('role', 'listitem');

    const topo = criar('div', 'impr-card__top');
    const identificacao = criar('div');
    const categoria = criar('span', 'impr-card__eyebrow', registro.categoria);
    if (registro.exemplo) categoria.append(criar('span', 'impr-card__demo', 'DEMONSTRAÇÃO'));
    const titulo = criar('h3', '', registro.titulo);
    const local = criar('div', 'impr-card__location', [registro.municipio, registro.local].filter(Boolean).join(' · '));
    identificacao.append(categoria, titulo, local);
    topo.append(identificacao, criar('span', 'impr-card__year', String(registro.ano || 'Registro')));

    const corpo = criar('div', 'impr-card__body');
    const descricao = criar('p', 'impr-card__description', registro.descricao || 'Registro fotográfico da melhoria realizada na unidade escolar.');
    const base = criar('div', 'impr-card__bottom');
    const escola = criar('span', 'impr-card__school', registro.escola);
    const ampliar = criar('button', 'impr-card__open', 'Ampliar fotos ↗');
    ampliar.type = 'button';
    ampliar.setAttribute('aria-label', `Ampliar comparação de ${registro.titulo} na ${registro.escola}`);
    ampliar.addEventListener('click', () => abrirDetalhes(registro));
    base.append(escola, ampliar);
    corpo.append(descricao, base);

    cartao.append(topo, criarComparador(registro), corpo);
    return cartao;
  }

  function preencherFiltro(select, valores) {
    [...new Set(valores.filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .forEach(valor => {
        const opcao = document.createElement('option');
        opcao.value = valor;
        opcao.textContent = valor;
        select.append(opcao);
      });
  }

  function atualizarEstatisticas() {
    document.getElementById('imprTotal').textContent = registros.length;
    document.getElementById('imprSchools').textContent = new Set(registros.map(item => item.escola)).size;
    document.getElementById('imprTypes').textContent = new Set(registros.map(item => item.categoria)).size;
    avisoDemo.hidden = !registros.some(item => item.exemplo);
  }

  function exibirEstado(titulo, detalhe) {
    const mensagem = criar('p', 'impr-state');
    mensagem.append(criar('strong', '', titulo), document.createTextNode(detalhe));
    grid.replaceChildren(mensagem);
    grid.setAttribute('aria-busy', 'false');
  }

  function aplicarFiltros() {
    const termo = normalizar(busca.value);
    const escola = filtroEscola.value;
    const categoria = filtroTipo.value;
    const filtrados = registros.filter(item => {
      if (escola && item.escola !== escola) return false;
      if (categoria && item.categoria !== categoria) return false;
      const conteudo = [item.escola, item.municipio, item.local, item.titulo, item.categoria, item.descricao].join(' ');
      return normalizar(conteudo).includes(termo);
    });

    resultados.textContent = filtrados.length === 1
      ? '1 registro encontrado'
      : `${filtrados.length} registros encontrados`;

    if (!filtrados.length) {
      exibirEstado('Nenhuma melhoria encontrada.', 'Experimente limpar os filtros ou pesquisar por outra escola.');
      return;
    }

    grid.replaceChildren(...filtrados.map(criarCartao));
    grid.setAttribute('aria-busy', 'false');
  }

  busca.addEventListener('input', aplicarFiltros);
  filtroEscola.addEventListener('change', aplicarFiltros);
  filtroTipo.addEventListener('change', aplicarFiltros);
  botaoLimpar.addEventListener('click', () => {
    busca.value = '';
    filtroEscola.value = '';
    filtroTipo.value = '';
    aplicarFiltros();
    busca.focus();
  });

  async function carregarMelhorias() {
    try {
      const resposta = await fetch(new URL('data/melhorias.json', document.baseURI), { cache: 'no-store' });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      const lista = Array.isArray(dados) ? dados : dados.melhorias;
      if (!Array.isArray(lista)) throw new Error('O arquivo deve conter uma lista JSON de melhorias.');

      registros = lista.filter(item =>
        item && typeof item.titulo === 'string' &&
        typeof item.escola === 'string' &&
        typeof item.categoria === 'string' &&
        typeof item.antes === 'string' &&
        typeof item.depois === 'string'
      ).sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0));

      preencherFiltro(filtroEscola, registros.map(item => item.escola));
      preencherFiltro(filtroTipo, registros.map(item => item.categoria));
      atualizarEstatisticas();
      if (!registros.length) {
        resultados.textContent = 'Nenhum registro cadastrado';
        exibirEstado('Em breve, novas transformações.', 'Adicione as melhorias em data/melhorias.json para exibir aqui as fotografias de antes e depois.');
        return;
      }
      aplicarFiltros();
    } catch (erro) {
      console.error('Erro ao carregar melhorias:', erro);
      resultados.textContent = 'Não foi possível carregar os registros';
      exibirEstado('Não foi possível carregar as melhorias.', 'Verifique se o arquivo data/melhorias.json existe e se o site foi aberto pelo Live Server.');
    }
  }

  carregarMelhorias();
})();
