"use strict";

async function carregarComponentes() {
  const partes = [
    { id: "header-container", arquivo: "components/header.html" },
    { id: "footer-container", arquivo: "components/footer.html" }
  ];

  try {
    await Promise.all(partes.map(async ({ id, arquivo }) => {
      const area = document.getElementById(id);
      if (!area) return;
      const resposta = await fetch(arquivo, {
  cache: "no-store"
});
      if (!resposta.ok) throw new Error(`Falha ao carregar ${arquivo}: ${resposta.status}`);
      area.innerHTML = await resposta.text();
    }));

    const pagina = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach(link => {
      const destino = new URL(link.href).pathname.split("/").pop() || "index.html";
      const ativo = destino === pagina && !link.hash;
      link.classList.toggle("active", ativo);
      if (ativo) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    configurarBuscaInterna(pagina);
    configurarMenuInterno(pagina);

    document.getElementById("year")?.replaceChildren(
      document.createTextNode(String(new Date().getFullYear()))
    );
    document.dispatchEvent(new Event("components:ready"));
  } catch (erro) {
    console.error("Erro ao carregar componentes:", erro);
    for (const id of ["header-container", "footer-container"]) {
      const area = document.getElementById(id);
      if (area && !area.children.length) {
        area.textContent = "Não foi possível carregar o componente. Execute o site com um servidor local.";
      }
    }
  }
}

function configurarBuscaInterna(pagina) {
  // A página inicial já configura sua própria busca em js/script.js.
  if (pagina === "index.html") return;

  const campos = {
    "professores.html": { id: "resourcesSearch", texto: "Pesquisar recursos dos professores" },
    "orientadores.html": { id: "resourcesSearch", texto: "Pesquisar recursos dos orientadores" },
    "eventos.html": { id: "eventsSearch", texto: "Pesquisar eventos" }
  };

  const config = campos[pagina];
  const botao = document.getElementById("searchToggle");
  const painel = document.getElementById("searchPanel");
  const campo = document.getElementById("siteSearch");
  const limpar = document.getElementById("searchClear");
  const campoPagina = config && document.getElementById(config.id);

  if (!botao || !painel || !campo || !limpar || !campoPagina) {
    if (botao) botao.hidden = true;
    return;
  }

  botao.hidden = false;
  campo.placeholder = config.texto;
  const label = painel.querySelector('label[for="siteSearch"]');
  if (label) label.textContent = config.texto;
  const explicacao = painel.querySelector("p");
  if (explicacao) explicacao.textContent = "Filtra o conteúdo exibido nesta página.";

  botao.addEventListener("click", () => {
    const abrir = painel.hidden;
    painel.hidden = !abrir;
    botao.setAttribute("aria-expanded", String(abrir));
    botao.setAttribute("aria-label", abrir ? "Fechar busca" : "Abrir busca");
    if (abrir) campo.focus();
  });

  function atualizarPagina() {
    campoPagina.value = campo.value;
    campoPagina.dispatchEvent(new Event("input", { bubbles: true }));
  }

  campo.addEventListener("input", atualizarPagina);
  limpar.addEventListener("click", () => {
    campo.value = "";
    atualizarPagina();
    campo.focus();
  });
  campo.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
      painel.hidden = true;
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir busca");
      botao.focus();
    }
  });
}

function configurarMenuInterno(pagina) {
  // Home e Eventos já inicializam menu nos respectivos scripts.
  if (!["professores.html", "orientadores.html"].includes(pagina)) return;
  const botao = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileNav");
  if (!botao || !menu) return;
  botao.addEventListener("click", () => {
    const abrir = menu.hidden;
    menu.hidden = !abrir;
    botao.setAttribute("aria-expanded", String(abrir));
    botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.hidden = true;
    botao.setAttribute("aria-expanded", "false");
  }));
}


/* ==========================================
   OCULTAR PESQUISA DO CABEÇALHO
   ========================================== */

function ocultarPesquisaHeader() {
  const lupa = document.getElementById("searchToggle");
  const painel = document.getElementById("searchPanel");

  if (lupa) {
    lupa.style.setProperty("display", "none", "important");
    lupa.hidden = true;
  }

  if (painel) {
    painel.style.setProperty("display", "none", "important");
    painel.hidden = true;
  }
}

// Executar depois que os componentes forem carregados
document.addEventListener(
  "components:ready",
  ocultarPesquisaHeader
);

carregarComponentes();
