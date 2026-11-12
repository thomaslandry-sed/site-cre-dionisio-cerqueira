
'use strict';

/* ==========================================
   CARREGAMENTO DOS COMPONENTES
   ========================================== */

async function carregarComponentes() {

  const partes = [
    {
      id: 'header-container',
      arquivo: 'components/header.html'
    },
    {
      id: 'footer-container',
      arquivo: 'components/footer.html'
    }
  ];

  try {

    await Promise.all(
      partes.map(async ({ id, arquivo }) => {

        const area = document.getElementById(id);

        if (!area) return;

        const resposta = await fetch(arquivo, {
          cache: 'no-store'
        });

        if (!resposta.ok) {
          throw new Error(
            `Falha ao carregar ${arquivo}: ${resposta.status}`
          );
        }

        area.innerHTML = await resposta.text();

      })
    );

    // Identifica a página atual.
    const pagina =
      location.pathname.split('/').pop() ||
      'index.html';

    // Destaca os links da página atual.
    document.querySelectorAll(
      '.desktop-nav a, .mobile-nav a'
    ).forEach(link => {

      const destino =
        new URL(link.href).pathname.split('/').pop() ||
        'index.html';

      const ativo =
        destino === pagina && !link.hash;

      link.classList.toggle('active', ativo);

      if (ativo) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }

    });

    // Inicializa funcionalidades compartilhadas.
    configurarBuscaInterna(pagina);
    configurarMenuInterno();

    // Atualiza o ano do rodapé.
    const ano = String(new Date().getFullYear());

    document.getElementById('year')
      ?.replaceChildren(
        document.createTextNode(ano)
      );

    document.getElementById('footer-year')
      ?.replaceChildren(
        document.createTextNode(ano)
      );

    // Barra vermelha de progresso.
    iniciarProgressoHeaderCRE();

    // Mantém a busca oculta conforme solicitado.
    ocultarPesquisaHeader();

    // Avisa às outras páginas que os componentes
    // terminaram de carregar.
    document.dispatchEvent(
      new Event('components:ready')
    );

  } catch (erro) {

    console.error(
      'Erro ao carregar componentes:',
      erro
    );

    for (const id of [
      'header-container',
      'footer-container'
    ]) {

      const area = document.getElementById(id);

      if (area && !area.children.length) {
        area.textContent =
          'Não foi possível carregar o componente. Execute com Live Server.';
      }

    }

  }

}


/* ==========================================
   BUSCA INTERNA DAS PÁGINAS
   ========================================== */

function configurarBuscaInterna(pagina) {

  // A página inicial possui sua própria busca.
  if (pagina === 'index.html') return;

  const campos = {

    'professores.html': {
      id: 'resourcesSearch',
      texto: 'Pesquisar recursos dos professores'
    },

    'orientadores.html': {
      id: 'resourcesSearch',
      texto: 'Pesquisar recursos dos orientadores'
    },

    'eventos.html': {
      id: 'eventsSearch',
      texto: 'Pesquisar eventos'
    }

  };

  const config = campos[pagina];

  const botao =
    document.getElementById('searchToggle');

  const painel =
    document.getElementById('searchPanel');

  const campo =
    document.getElementById('siteSearch');

  const limpar =
    document.getElementById('searchClear');

  const campoPagina =
    config && document.getElementById(config.id);

  if (
    !botao ||
    !painel ||
    !campo ||
    !limpar ||
    !campoPagina
  ) {

    if (botao) {
      botao.hidden = true;
    }

    return;

  }

  botao.hidden = false;

  campo.placeholder = config.texto;

  const label = painel.querySelector(
    'label[for="siteSearch"]'
  );

  if (label) {
    label.textContent = config.texto;
  }

  const explicacao = painel.querySelector('p');

  if (explicacao) {
    explicacao.textContent =
      'Filtra o conteúdo exibido nesta página.';
  }

  botao.addEventListener('click', () => {

    const abrir = painel.hidden;

    painel.hidden = !abrir;

    botao.setAttribute(
      'aria-expanded',
      String(abrir)
    );

    botao.setAttribute(
      'aria-label',
      abrir ? 'Fechar busca' : 'Abrir busca'
    );

    if (abrir) campo.focus();

  });

  function atualizarPagina() {

    campoPagina.value = campo.value;

    campoPagina.dispatchEvent(
      new Event('input', {
        bubbles: true
      })
    );

  }

  campo.addEventListener(
    'input',
    atualizarPagina
  );

  limpar.addEventListener('click', () => {

    campo.value = '';

    atualizarPagina();

    campo.focus();

  });

  campo.addEventListener('keydown', evento => {

    if (evento.key === 'Escape') {

      painel.hidden = true;

      botao.setAttribute(
        'aria-expanded',
        'false'
      );

      botao.setAttribute(
        'aria-label',
        'Abrir busca'
      );

      botao.focus();

    }

  });

}


/* ==========================================
   MENU HAMBÚRGUER LATERAL
   FUNCIONA EM TODAS AS PÁGINAS
   ========================================== */

function configurarMenuInterno() {

  const botao =
    document.getElementById('menuToggle');

  const navOriginal =
    document.getElementById('mobileNav') ||
    document.querySelector('.cre-header-nav');


  // Evita criar novamente o menu.
  if (
    !botao ||
    !navOriginal ||
    document.getElementById('creMenuDialog')
  ) {
    return;
  }

  // Cria o menu usando a API nativa <dialog>.
  // Isso coloca o menu acima do conteúdo da página.
  const dialog = document.createElement('dialog');

  dialog.id = 'creMenuDialog';
  dialog.className = 'cre-menu-dialog';

  dialog.setAttribute(
    'aria-label',
    'Menu de navegação da CRE'
  );

  // Painel interno.
  const painel = document.createElement('div');

  painel.className = 'cre-menu-dialog__painel';

  // ==========================================
  // TOPO DO MENU
  // ==========================================

  const topo = document.createElement('div');

  topo.className = 'cre-menu-dialog__topo';

  const titulo = document.createElement('strong');

  titulo.textContent = 'Menu de navegação';

  const fechar = document.createElement('button');

  fechar.type = 'button';

  fechar.className = 'cre-menu-dialog__fechar';

  fechar.setAttribute(
    'aria-label',
    'Fechar menu'
  );

  fechar.textContent = '×';

  topo.append(titulo, fechar);

  // ==========================================
  // LINKS DO MENU
  // ==========================================

  const navegacao = document.createElement('nav');

  navegacao.className = 'cre-menu-dialog__links';

  navegacao.setAttribute(
    'aria-label',
    'Links do portal'
  );

  // Copia automaticamente os links existentes
  // no mobileNav do header.html.
  navOriginal.querySelectorAll('a[href]')
    .forEach(origem => {

      const link = document.createElement('a');

      link.href = origem.href;

      link.textContent = (
        origem.querySelector('span')?.textContent ||
        origem.textContent
      )
        .trim()
        .replace(/›\s*$/, '')
        .trim();

      // Mantém o destaque da página atual.
      if (
        origem.getAttribute('aria-current') === 'page'
      ) {
        link.setAttribute(
          'aria-current',
          'page'
        );
      }

      navegacao.appendChild(link);

    });

  // ==========================================
  // RODAPÉ DO MENU LATERAL
  // ==========================================

  const rodape = document.createElement('div');

  rodape.className = 'cre-menu-dialog__rodape';

  rodape.textContent =
    'CRE Dionísio Cerqueira · Santa Catarina';

  // Monta o menu.
  painel.append(
    topo,
    navegacao,
    rodape
  );

  dialog.appendChild(painel);

  // Coloca o menu diretamente no body.
  document.body.appendChild(dialog);

  botao.setAttribute(
    'aria-controls',
    'creMenuDialog'
  );

  // ==========================================
  // ABRIR MENU
  // ==========================================

  function abrirMenu() {

    if (dialog.open) return;

    dialog.showModal();

    document.body.classList.add(
      'cre-menu-aberto'
    );

    botao.setAttribute(
      'aria-expanded',
      'true'
    );

    botao.setAttribute(
      'aria-label',
      'Fechar menu'
    );

    fechar.focus();

  }

  // ==========================================
  // FECHAR MENU
  // ==========================================

  function fecharMenu() {

    if (dialog.open) {
      dialog.close();
    }

  }

  // ==========================================
  // EVENTOS DO BOTÃO HAMBÚRGUER
  // ==========================================

  botao.addEventListener(
    'click',
    evento => {

      evento.preventDefault();

      // Evita conflito com outros controladores
      // antigos presentes no script.js.
      evento.stopImmediatePropagation();

      if (dialog.open) {
        fecharMenu();
      } else {
        abrirMenu();
      }

    },
    true
  );

  // ==========================================
  // BOTÃO X
  // ==========================================

  fechar.addEventListener(
    'click',
    fecharMenu
  );

  // ==========================================
  // FECHAR AO CLICAR EM UM LINK
  // ==========================================

  navegacao.querySelectorAll('a')
    .forEach(link => {

      link.addEventListener(
        'click',
        fecharMenu
      );

    });

  // ==========================================
  // FECHAR AO CLICAR FORA DO PAINEL
  // ==========================================

  dialog.addEventListener('click', evento => {

    if (evento.target === dialog) {
      fecharMenu();
    }

  });

  // ==========================================
  // RESTAURAR ESTADO APÓS FECHAR
  // ==========================================

  dialog.addEventListener('close', () => {

    document.body.classList.remove(
      'cre-menu-aberto'
    );

    botao.setAttribute(
      'aria-expanded',
      'false'
    );

    botao.setAttribute(
      'aria-label',
      'Abrir menu'
    );

  });

  // ==========================================
  // FECHAR AO VOLTAR PARA DESKTOP
  // ==========================================

  window.addEventListener('resize', () => {

    if (window.innerWidth > 1200) {
      fecharMenu();
    }

  });

}


/* ==========================================
   OCULTAR PESQUISA DO CABEÇALHO
   ========================================== */

function ocultarPesquisaHeader() {

  const lupa =
    document.getElementById('searchToggle');

  const painel =
    document.getElementById('searchPanel');

  if (lupa) {

    lupa.style.setProperty(
      'display',
      'none',
      'important'
    );

    lupa.hidden = true;

  }

  if (painel) {

    painel.style.setProperty(
      'display',
      'none',
      'important'
    );

    painel.hidden = true;

  }

}


/* ==========================================
   BARRA VERMELHA DE PROGRESSO
   DO CABEÇALHO
   ========================================== */

function iniciarProgressoHeaderCRE() {

  const header = document.querySelector(
    '#header-container .cre-green-header'
  );

  if (
    !header ||
    header.querySelector('.cre-scroll-progress')
  ) {
    return;
  }

  // Cria a linha vermelha no topo.
  const barra = document.createElement('div');

  barra.className = 'cre-scroll-progress';

  barra.setAttribute(
    'aria-hidden',
    'true'
  );

  header.prepend(barra);

  let pendente = false;

  // ==========================================
  // CALCULAR PROGRESSO DA ROLAGEM
  // ==========================================

  function atualizar() {

    const alturaTotal = Math.max(
      0,
      document.documentElement.scrollHeight -
      window.innerHeight
    );

    const valor = alturaTotal
      ? Math.min(
          1,
          Math.max(
            0,
            window.scrollY / alturaTotal
          )
        )
      : 0;

    barra.style.transform =
      `scaleX(${valor})`;

    pendente = false;

  }

  // Evita atualizações desnecessárias.
  function agendar() {

    if (pendente) return;

    pendente = true;

    requestAnimationFrame(atualizar);

  }

  window.addEventListener(
    'scroll',
    agendar,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    agendar
  );

  window.addEventListener(
    'load',
    agendar
  );

  // Inicializa a barra.
  atualizar();

}


/* ==========================================
   BANDEIRA INTERATIVA - EFEITO 3D
   ========================================== */

function iniciarBandeiraInterativaCRE() {

  const bandeira = document.querySelector(
    ".cre-header-flag"
  );

  if (!bandeira) return;

  // Evita inicializar o efeito mais de uma vez.
  if (bandeira.dataset.interativa === "true") return;

  bandeira.dataset.interativa = "true";

  // Não ativa a inclinação em dispositivos touch
  // ou quando o usuário prefere reduzir animações.
  if (
    !window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches ||
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  bandeira.addEventListener("pointermove", evento => {

    const rect = bandeira.getBoundingClientRect();

    // Posição do cursor em relação ao centro.
    const x =
      (evento.clientX - rect.left) / rect.width - 0.5;

    const y =
      (evento.clientY - rect.top) / rect.height - 0.5;

    // Inclinação máxima de 10 graus.
    const rotacaoY = x * 20;
    const rotacaoX = -y * 20;

    bandeira.style.setProperty(
      "--flag-x",
      `${rotacaoX}deg`
    );

    bandeira.style.setProperty(
      "--flag-y",
      `${rotacaoY}deg`
    );

  });

  // Volta suavemente à posição normal.
  bandeira.addEventListener("pointerleave", () => {

    bandeira.style.setProperty(
      "--flag-x",
      "0deg"
    );

    bandeira.style.setProperty(
      "--flag-y",
      "0deg"
    );

  });

}

// Executa após o header ser carregado.
document.addEventListener(
  "components:ready",
  iniciarBandeiraInterativaCRE
);

/* ==========================================
   INICIALIZAÇÃO DOS COMPONENTES
   ========================================== */

carregarComponentes();
