
"use strict";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const RECURSOS_URL = "data/professores.json";

// ==========================================
// ÍCONES SVG DOS CARTÕES
// ==========================================

const ICONES = {
  folder: `
    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3V7Z"/>
  `,

  form: `
    <rect x="5" y="3" width="14" height="18" rx="2"/>
    <path d="M9 8h6M9 12h6M9 16h4"/>
  `,

  book: `
    <path d="M12 6c-3-2-7-2-9-1v14c2-1 6-1 9 1 3-2 7-2 9-1V5c-2-1-6-1-9 1ZM12 6v14"/>
  `,

  calendar: `
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M7 3v4M17 3v4M3 10h18M8 15l2 2 5-5"/>
  `,

  screen: `
    <rect x="3" y="4" width="18" height="13" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  `,

  clipboard: `
    <rect x="5" y="5" width="14" height="16" rx="2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h5"/>
  `,

  // ÍCONE DE TUTORIAIS: LIVRO ABERTO
  tutorial: `
    <path d="M12 7v14"/>
    <path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4
             4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13
             a1 1 0 0 1-1 1h-4a4 4 0 0 0-4 2
             4 4 0 0 0-4-2H4a1 1 0 0 1-1-1Z"/>
  `,

  // ÍCONE DE SITE EXTERNO
  globe: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3c2.5 2.7 4 5.8 4 9s-1.5 6.3-4 9"/>
    <path d="M12 3c-2.5 2.7-4 5.8-4 9s1.5-6.3 4-9"/>
  `
};

// ==========================================
// LOGOTIPOS DE SERVIÇOS EXTERNOS
// ==========================================

const LOGOTIPOS = {
  drive: "assets/icons/google-drive.svg",
  forms: "assets/icons/google-forms.svg",
  docs: "assets/icons/google-docs.svg",
  website: "assets/icons/website-icon.png",
  tutorial: "assets/icons/tutorial.svg"
  
};

// ==========================================
// CORES DOS CARTÕES
// ==========================================

const PALETAS = {
  verde: ["#176c52", "#3ab186"],
  oceano: ["#146c77", "#43aeba"],
  floresta: ["#1e6850", "#75ad6a"],
  azul: ["#235a85", "#4c9bc2"],
  dourado: ["#9b6523", "#d6aa53"],
  roxo: ["#5f5085", "#9888c4"]
};

// ==========================================
// VARIÁVEIS
// ==========================================

let recursos = [];
let categoriaAtiva = "Todos";

const grid = document.getElementById("resourcesGrid");
const search = document.getElementById("resourcesSearch");
const clear = document.getElementById("resourcesClear");
const counter = document.getElementById("resourcesCount");

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

// Normalizar textos para pesquisa
function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

// Validar links externos
function linkValido(valor) {
  try {
    const url = new URL(valor);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

// Criar elementos HTML
function criar(tag, classe, texto) {
  const el = document.createElement(tag);

  if (classe) {
    el.className = classe;
  }

  if (texto !== undefined) {
    el.textContent = texto;
  }

  return el;
}

// ==========================================
// CRIAR CARTÕES DOS PROFESSORES
// ==========================================

function criarCard(item, indice) {

  const cartao = criar("article", "teacher-card");

  // ========================================
  // CAPA DO CARTÃO
  // ========================================

  const capa = criar("div", "teacher-cover");

  const cores = PALETAS[item.cor] || PALETAS.verde;

  capa.style.setProperty("--cover1", cores[0]);
  capa.style.setProperty("--cover2", cores[1]);

  // Número do recurso
  capa.append(
    criar(
      "span",
      "teacher-cover-no",
      `RECURSO ${String(indice + 1).padStart(2, "0")}`
    )
  );

  // ========================================
  // ÍCONE OU LOGOTIPO
  // ========================================

  const simbolo = criar(
    "span",
    "teacher-cover-icon"
  );

  const tipoIcone = String(item.icone || "folder")
    .trim()
    .toLowerCase();

  // LOGOTIPOS DO GOOGLE
  if (
    Object.prototype.hasOwnProperty.call(
      LOGOTIPOS,
      tipoIcone
    )
  ) {

    const imagem = document.createElement("img");

    imagem.src = LOGOTIPOS[tipoIcone];
    imagem.alt = "";
    imagem.className = "teacher-brand-logo";
    imagem.loading = "lazy";
    imagem.decoding = "async";

    // Identificar possíveis erros de carregamento
    imagem.addEventListener("error", () => {
      console.error(
        "Erro ao carregar o logotipo:",
        imagem.src
      );
    });

    simbolo.append(imagem);

  } else {

    // ÍCONES SVG NORMAIS
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    svg.innerHTML =
      ICONES[tipoIcone] || ICONES.folder;

    simbolo.append(svg);
  }

  // CORREÇÃO: INSERIR ÍCONE NA CAPA
  capa.append(
    simbolo,
    criar("span", "teacher-cover-arrow", "↗")
  );

  // ========================================
  // CONTEÚDO DO CARTÃO
  // ========================================

  const corpo = criar(
    "div",
    "teacher-card-body"
  );

  corpo.append(
    criar(
      "span",
      "teacher-card-category",
      item.categoria || "Recurso"
    ),

    criar(
      "h3",
      "",
      item.titulo || "Sem título"
    ),

    criar(
      "p",
      "",
      item.descricao || ""
    )
  );

  // ========================================
  // LINK DO RECURSO
  // ========================================

  if (linkValido(item.url)) {

    const link = criar(
      "a",
      "teacher-card-link",
      "Acessar recurso  ↗"
    );

    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.setAttribute(
      "aria-label",
      `Acessar ${item.titulo} (abre em nova aba)`
    );

    corpo.append(link);

    // Permitir clicar também na capa
    const linkCapa = criar(
      "a",
      "teacher-cover-target"
    );

    linkCapa.href = item.url;
    linkCapa.target = "_blank";
    linkCapa.rel = "noopener noreferrer";

    linkCapa.setAttribute(
      "aria-label",
      `Acessar ${item.titulo} (abre em nova aba)`
    );

    capa.append(linkCapa);

  } else {

    corpo.append(
      criar(
        "span",
        "teacher-card-pending",
        "Link em breve"
      )
    );
  }

  // Adicionar capa e conteúdo
  cartao.append(capa, corpo);

  return cartao;
}

// ==========================================
// EXIBIR E FILTRAR RECURSOS
// ==========================================

function renderizar() {

  const termos = normalizar(
    search.value.trim()
  ).split(/\s+/).filter(Boolean);

  const filtrados = recursos
    .map((item, indice) => ({ item, indice }))

    // FILTRO POR CATEGORIA
    .filter(({ item }) => {
      return (
        categoriaAtiva === "Todos" ||
        normalizar(item.categoria).trim() ===
        normalizar(categoriaAtiva).trim()
      );
    })

    // FILTRO POR PESQUISA
    .filter(({ item }) => {

      const texto = normalizar([
        item.titulo,
        item.descricao,
        item.categoria
      ].join(" "));

      return termos.every(
        termo => texto.includes(termo)
      );
    });

  // ATUALIZAR CARTÕES
  grid.replaceChildren(
    ...filtrados.map(({ item, indice }) =>
      criarCard(item, indice)
    )
  );

  // NENHUM RESULTADO
  if (!filtrados.length) {

    grid.append(
      criar(
        "p",
        "teachers-message",
        "Nenhum recurso encontrado. Tente outra busca ou categoria."
      )
    );
  }

  // CONTADOR
  counter.textContent =
    `${filtrados.length} ${
      filtrados.length === 1
        ? "recurso"
        : "recursos"
    }`;

  // BOTÃO LIMPAR PESQUISA
  clear.hidden = !search.value;
}

// ==========================================
// CARREGAR RECURSOS DO JSON
// ==========================================

async function carregarRecursos() {

  try {

    const resposta = await fetch(RECURSOS_URL, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error(
        "O JSON precisa conter uma lista de recursos."
      );
    }

    // SOMENTE RECURSOS PUBLICADOS
    recursos = dados.filter(item =>
      item &&
      item.publicado !== false &&
      typeof item.titulo === "string"
    );

    renderizar();

  } catch (erro) {

    console.error(
      "Falha ao carregar recursos:",
      erro
    );

    counter.textContent = "Indisponível";

    grid.replaceChildren(
      criar(
        "p",
        "teachers-message",
        "Não foi possível carregar os recursos. Confira data/professores.json e utilize o Live Server."
      )
    );
  }
}

// ==========================================
// PESQUISA
// ==========================================

search.addEventListener("input", renderizar);

// LIMPAR PESQUISA
clear.addEventListener("click", () => {

  search.value = "";

  renderizar();

  search.focus();
});

// ==========================================
// FILTROS POR CATEGORIA
// ==========================================

document.querySelectorAll(".teachers-filter")
  .forEach(botao => {

    botao.addEventListener("click", () => {

      categoriaAtiva =
        botao.dataset.category || "Todos";

      document.querySelectorAll(".teachers-filter")
        .forEach(b => {

          const ativo = b === botao;

          b.classList.toggle(
            "is-active",
            ativo
          );

          b.setAttribute(
            "aria-pressed",
            String(ativo)
          );
        });

      renderizar();
    });
  });

// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarRecursos();
