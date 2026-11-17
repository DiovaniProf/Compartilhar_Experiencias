"use strict";

/**
 * CATÁLOGO — edite aqui para mudar títulos, imagens ou URLs.
 * As imagens devem ficar na mesma pasta que index.html, com grafia idêntica.
 * As quatro primeiras capas: Tiago.png, Andreia.png, Mariane.png, Dijalmary.png.
 * As seis capas futuras são reconhecidas automaticamente quando enviadas
 * como CAPA05.png, CAPA06.png, ... CAPA10.png.
 * O campo link é opcional. Use uma URL real quando o material estiver disponível.
 */
const CATALOGO = [
  { id:1,  titulo:"Relação Teoria e Prática", autor:"Tiago Junior Gobetti", imagem:"Tiago.png",   link:"" },
  { id:2,  titulo:"Gestão do Tempo",        autor:"Andréia de Paula Moura", imagem:"Andreia.png", link:"" },
  { id:3,  titulo:"Comunicação e Engajamento", autor:"Mariane Aurélia da Rocha", imagem:"Mariane.png", link:"" },
  { id:4,  titulo:"Ação Modelar — Relação Teoria e Prática", autor:"Dijalmary Matos Prates Chas", imagem:"Dijalmary.png", link:"" },
  { id:5,  titulo:"Espaço 05",              autor:"Nova experiência",      imagem:"CAPA05.png", link:"" },
  { id:6,  titulo:"Espaço 06",              autor:"Nova experiência",      imagem:"CAPA06.png", link:"" },
  { id:7,  titulo:"Espaço 07",              autor:"Nova experiência",      imagem:"CAPA07.png", link:"" },
  { id:8,  titulo:"Espaço 08",              autor:"Nova experiência",      imagem:"CAPA08.png", link:"" },
  { id:9,  titulo:"Espaço 09",              autor:"Nova experiência",      imagem:"CAPA09.png", link:"" },
  { id:10, titulo:"Espaço 10",              autor:"Nova experiência",      imagem:"CAPA10.png", link:"" },
];

const $ = selector => document.querySelector(selector);
const grid = $("#coverGrid");
const searchInput = $("#searchInput");
const counter = $("#counter");
const emptyState = $("#emptyState");
const dialog = $("#coverDialog");
const dialogArt = $("#dialogArt");
const dialogTitle = $("#dialogTitle");
const dialogDescription = $("#dialogDescription");
const openContent = $("#openContent");
let lastFocused = null;
let currentQuery = "";

const STATUS = new Map();
const ICON = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="5" width="24" height="22" rx="4" stroke="currentColor" stroke-width="1.6"/><path d="m7 22 7.2-7.5 4.5 4.6 3.2-3.2L27 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21" cy="11.5" r="2.3" fill="currentColor"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" fill="white"/></svg>`;

function makePlaceholder(item) {
  const node = document.createElement("div");
  node.className = "card-placeholder";
  const slotIcon = document.createElement("span");
  slotIcon.className = "slot-icon";
  slotIcon.innerHTML = ICON;
  const number = document.createElement("span");
  number.className = "slot-number";
  number.textContent = `CAPA ${String(item.id).padStart(2,"0")}`;
  const caption = document.createElement("span");
  caption.className = "slot-caption";
  caption.textContent = "ESPAÇO RESERVADO";
  node.append(slotIcon, number, caption);
  return node;
}

function filterCatalog(item) {
  const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const haystack = normalize(`${item.titulo} ${item.autor} ${item.id}`);
  return haystack.includes(normalize(currentQuery));
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "cover-card";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-button";
  button.setAttribute("aria-label", `Visualizar ${item.titulo}`);
  button.addEventListener("click", () => showDialog(item));

  const art = document.createElement("div");
  art.className = "card-art";
  const placeholder = makePlaceholder(item);
  art.appendChild(placeholder);

  const img = document.createElement("img");
  img.alt = `Capa de ${item.titulo}`;
  img.loading = item.id <= 4 ? "eager" : "lazy";
  img.decoding = "async";
  img.hidden = true;

  const badgeArea = document.createElement("div");
  badgeArea.className = "card-topline";
  const badge = document.createElement("span");
  badge.className = "card-tag pending";
  badge.textContent = "ESPAÇO RESERVADO";
  badgeArea.appendChild(badge);

  const play = document.createElement("span");
  play.className = "play-icon";
  play.innerHTML = PLAY;
  const shade = document.createElement("span");
  shade.className = "image-shade";
  art.append(img, shade, badgeArea, play);

  const info = document.createElement("div");
  info.className = "card-info";
  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.titulo;
  const meta = document.createElement("div");
  meta.className = "card-meta";
  const author = document.createElement("span");
  author.className = "card-author";
  author.textContent = item.autor;
  const status = document.createElement("span");
  status.className = "card-status pending";
  status.textContent = "Aguardando capa";
  meta.append(author, status);
  info.append(title,meta);
  button.append(art,info);
  card.appendChild(button);

  function setLoaded(loaded) {
    STATUS.set(item.id, loaded);
    placeholder.hidden = loaded;
    img.hidden = !loaded;
    badge.textContent = loaded ? "EXPERIÊNCIA" : "ESPAÇO RESERVADO";
    badge.classList.toggle("pending", !loaded);
    status.textContent = loaded ? "Capa disponível" : "Aguardando capa";
    status.classList.toggle("pending", !loaded);
    updateCounter();
  }
  img.addEventListener("load", () => setLoaded(true));
  img.addEventListener("error", () => setLoaded(false));
  img.src = item.imagem;
  return card;
}

function updateCounter() {
  const count = CATALOGO.filter(filterCatalog).length;
  counter.textContent = `${count} ${count === 1 ? "capa" : "capas"}`;
}

function renderCatalog() {
  const filtered = CATALOGO.filter(filterCatalog);
  const fragment = document.createDocumentFragment();
  filtered.forEach(item => fragment.appendChild(createCard(item)));
  grid.replaceChildren(fragment);
  emptyState.hidden = filtered.length !== 0;
  updateCounter();
}

function showDialog(item) {
  lastFocused = document.activeElement;
  dialogArt.replaceChildren();
  dialogTitle.textContent = item.titulo;
  const loaded = STATUS.get(item.id) === true;
  dialogDescription.textContent = loaded
    ? `${item.autor} • Capa em formato 16:9.`
    : `Espaço reservado. Para inserir a capa, coloque o arquivo ${item.imagem} na raiz do GitHub e atualize a página.`;
  if (loaded) {
    const img = document.createElement("img");
    img.src = item.imagem;
    img.alt = `Capa ampliada: ${item.titulo}`;
    dialogArt.appendChild(img);
  } else {
    dialogArt.appendChild(makePlaceholder(item));
  }
  if (item.link && /^(https?:\/\/|\.\/|\/)/i.test(item.link)) {
    openContent.hidden = false;
    openContent.href = item.link;
  } else {
    openContent.hidden = true;
    openContent.removeAttribute("href");
  }
  dialog.hidden = false;
  document.body.classList.add("modal-open");
  $("#closeDialog").focus();
}
function hideDialog() {
  dialog.hidden = true;
  document.body.classList.remove("modal-open");
  dialogArt.replaceChildren();
  if (lastFocused && lastFocused.isConnected) lastFocused.focus();
}

searchInput.addEventListener("input", () => {
  currentQuery = searchInput.value.trim();
  renderCatalog();
});
$("#closeDialog").addEventListener("click", hideDialog);
$("#closeDialogBottom").addEventListener("click", hideDialog);
dialog.querySelector("[data-close-dialog]").addEventListener("click", hideDialog);
document.addEventListener("keydown", event => {
  if (dialog.hidden) return;
  if (event.key === "Escape") hideDialog();
  if (event.key === "Tab") {
    const focusable = [...dialog.querySelectorAll("button:not([hidden]), a[href]:not([hidden])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length-1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  }
});
renderCatalog();
