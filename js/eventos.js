
"use strict";

// CONFIGURAÇÕES
// Substitua pelo ID público da agenda institucional.
const GOOGLE_CALENDAR_ID = "";

const EVENTS_SOURCE = "data/eventos.json";

const EVENT_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80";

// ESTADO DOS EVENTOS
let events = [];
let activeFilter = "todos";
let searchValue = "";

// CRIAR ELEMENTOS HTML
const el = (tag, className, text) => {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;

  return node;
};

// CONVERTER E VALIDAR DATA
function eventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return date;
}

// VERIFICAR SE O EVENTO JÁ ACONTECEU
function isPast(value) {
  const date = eventDate(value);
  const now = new Date();

  now.setHours(0, 0, 0, 0);

  return Boolean(date && date < now);
}

// CRIAR CARTÃO DO EVENTO
function cardForEvent(event) {
  const article = el("article", "event-card");

  const imageWrap = el("div", "event-image-wrap");
  const image = el("img");

  image.src = event.imagem || EVENT_IMAGE_FALLBACK;
  image.alt = event.imagem
    ? `Registro ilustrativo: ${event.titulo}`
    : "Ilustração de atividade educacional";

  image.loading = "lazy";

  image.addEventListener("error", () => {
    if (image.src !== EVENT_IMAGE_FALLBACK) {
      image.src = EVENT_IMAGE_FALLBACK;
    }
  }, { once: true });

  imageWrap.append(image);

  // DATA EM DESTAQUE
  const date = eventDate(event.data);

  if (date) {
    const tag = el("div", "event-date");

    tag.setAttribute(
      "aria-label",
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long"
      }).format(date)
    );

    tag.append(
      el("strong", "", String(date.getDate()).padStart(2, "0")),
      el(
        "span",
        "",
        new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          year: "numeric"
        }).format(date).replace(".", "")
      )
    );

    imageWrap.append(tag);
  }

  // CONTEÚDO
  const content = el("div", "event-content");
  const meta = el("div", "event-meta");

  meta.append(
    el("span", "event-category", event.categoria || "Evento"),
    el(
      "span",
      "event-status",
      isPast(event.data) ? "Realizado" : "Programado"
    )
  );

  content.append(
    meta,
    el("h3", "", event.titulo),
    el("p", "", event.descricao || "")
  );

  if (event.local) {
    content.append(
      el("span", "event-location", event.local)
    );
  }

  // LINK EXTERNO DO EVENTO
  if (event.link && /^https:\/\//.test(event.link)) {
    const link = el(
      "a",
      "event-link",
      "Mais informações ↗"
    );

    link.href = event.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    content.append(link);
  }

  article.append(imageWrap, content);

  return article;
}

// NORMALIZAR TEXTO PARA PESQUISA
function normalized(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// EXIBIR EVENTOS NA PÁGINA
function renderEvents() {
  const grid = document.getElementById("eventsGrid");

  const selected = events.filter(event => {
    if (
      activeFilter === "futuros" &&
      isPast(event.data)
    ) {
      return false;
    }

    if (
      activeFilter === "realizados" &&
      !isPast(event.data)
    ) {
      return false;
    }

    return normalized([
      event.titulo,
      event.descricao,
      event.categoria,
      event.local
    ].join(" ")).includes(normalized(searchValue));
  });

  // ORDENAR EVENTOS POR DATA
  selected.sort((a, b) => {
    const ap = isPast(a.data);
    const bp = isPast(b.data);

    if (ap !== bp) {
      return ap ? 1 : -1;
    }

    return ap
      ? b.data.localeCompare(a.data)
      : a.data.localeCompare(b.data);
  });

  grid.replaceChildren(
    ...selected.map(cardForEvent)
  );

  if (!selected.length) {
    grid.append(
      el(
        "p",
        "events-empty",
        "Nenhum evento encontrado. Experimente outro filtro."
      )
    );
  }

  document.getElementById("eventsCount").textContent =
    `${selected.length} ${
      selected.length === 1 ? "evento" : "eventos"
    }`;
}

// CARREGAR EVENTOS DO JSON
async function loadEvents() {
  try {
    const response = await fetch(EVENTS_SOURCE, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rows = await response.json();

    if (!Array.isArray(rows)) {
      throw new Error("JSON inválido");
    }

    events = rows.filter(event =>
      event &&
      event.status === "Publicado" &&
      typeof event.titulo === "string" &&
      eventDate(event.data)
    );

    renderEvents();

  } catch (error) {
    console.error("Erro ao carregar eventos:", error);

    document.getElementById("eventsGrid")
      .replaceChildren(
        el(
          "p",
          "events-empty",
          "Não foi possível carregar os eventos. Confira data/eventos.json e execute o projeto com Live Server."
        )
      );

    document.getElementById("eventsCount").textContent =
      "Indisponível";
  }
}

// CONFIGURAR GOOGLE AGENDA
function setupCalendar() {
  const id = GOOGLE_CALENDAR_ID.trim();

  if (!id) return;

  const url = new URL(
    "https://calendar.google.com/calendar/embed"
  );

  url.searchParams.set("src", id);
  url.searchParams.set("ctz", "America/Sao_Paulo");
  url.searchParams.set("hl", "pt_BR");
  url.searchParams.set("mode", "MONTH");

  const iframe = el("iframe");

  iframe.src = url.toString();
  iframe.title =
    "Agenda de eventos da Coordenadoria Regional de Educação";

  iframe.loading = "lazy";
  iframe.referrerPolicy =
    "strict-origin-when-cross-origin";

  document.getElementById("calendarEmbed")
    .replaceChildren(iframe);

  const external = new URL(
    "https://calendar.google.com/calendar/u/0/r"
  );

  document.getElementById("calendarExternalLink")
    .href = external.toString();
}

// CONFIGURAR FILTROS E PESQUISA
function setupFilters() {
  document.querySelectorAll(".events-filter")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;

        document.querySelectorAll(".events-filter")
          .forEach(other => {
            const selected = btn === other;

            other.classList.toggle(
              "is-active",
              selected
            );

            other.setAttribute(
              "aria-pressed",
              String(selected)
            );
          });

        renderEvents();
      });
    });

  document.getElementById("eventsSearch")
    .addEventListener("input", event => {
      searchValue = event.target.value.trim();

      renderEvents();
    });
}

// MENU RESPONSIVO DO HEADER
function setupSharedHeader() {
  const menu = document.getElementById("menuToggle");
  const mobile = document.getElementById("mobileNav");

  if (!menu || !mobile) return;

  menu.addEventListener("click", () => {
    const next = mobile.hidden;

    mobile.hidden = !next;

    menu.setAttribute(
      "aria-expanded",
      String(next)
    );

    menu.setAttribute(
      "aria-label",
      next ? "Fechar menu" : "Abrir menu"
    );
  });

  mobile.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobile.hidden = true;

      menu.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });
}

document.addEventListener(
  "components:ready",
  setupSharedHeader
);

// INICIALIZAR PÁGINA
function startEvents() {
  setupFilters();
  setupCalendar();
  loadEvents();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startEvents,
    { once: true }
  );
} else {
  startEvents();
}
