const API_URL = "http://localhost:3000";

const tokenSalvo = localStorage.getItem("vinylToken");
const usuarioSalvo = localStorage.getItem("vinylUsuario");

if (!tokenSalvo || !usuarioSalvo) {
  window.location.replace("./login.html");
  throw new Error("Usuário não autenticado.");
}

let usuarioLogado;
try {
  usuarioLogado = JSON.parse(usuarioSalvo);
  if (!usuarioLogado || !usuarioLogado.id || !usuarioLogado.nome) {
    throw new Error("Dados do usuário inválidos.");
  }
} catch (erro) {
  localStorage.removeItem("vinylToken");
  localStorage.removeItem("vinylUsuario");
  window.location.replace("./login.html");
  throw erro;
}

const usuarioMenu = document.getElementById("usuarioMenu");
const usuarioBotao = document.getElementById("usuarioBotao");
const usuarioDropdown = document.getElementById("usuarioDropdown");
const botaoSair = document.getElementById("botaoSair");
const nomeUsuario = document.getElementById("usuarioNome");
const nomeCompletoUsuario = document.getElementById("usuarioNomeCompleto");
const emailUsuario = document.getElementById("usuarioEmail");
const avatarUsuario = document.getElementById("usuarioAvatar");

// Preenche os dados do usuário somente quando os elementos existem no HTML.
if (nomeUsuario) nomeUsuario.textContent = usuarioLogado.nome || "Usuário";
if (nomeCompletoUsuario) nomeCompletoUsuario.textContent = usuarioLogado.nome || "Usuário";
if (emailUsuario) emailUsuario.textContent = usuarioLogado.email || "Conta conectada";
if (avatarUsuario) avatarUsuario.textContent = (usuarioLogado.nome || "U").trim().charAt(0).toUpperCase();

const campoMovementUser = document.getElementById("movementUser");
if (campoMovementUser) campoMovementUser.value = usuarioLogado.id || "";

if (usuarioBotao && usuarioDropdown) {
  usuarioBotao.addEventListener("click", evento => {
    evento.stopPropagation();
    const aberto = usuarioDropdown.classList.toggle("aberto");
    usuarioBotao.setAttribute("aria-expanded", String(aberto));
  });
}

document.addEventListener("click", evento => {
  if (usuarioMenu && usuarioDropdown && usuarioBotao && !usuarioMenu.contains(evento.target)) {
    usuarioDropdown.classList.remove("aberto");
    usuarioBotao.setAttribute("aria-expanded", "false");
  }
});

if (botaoSair) {
  botaoSair.addEventListener("click", () => {
    localStorage.removeItem("vinylToken");
    localStorage.removeItem("vinylUsuario");
    window.location.replace("./login.html");
  });
}

const productGrid = document.getElementById("productGrid");
const manageList = document.getElementById("manageList");
const apiStatus = document.getElementById("apiStatus");
const diskCount = document.getElementById("diskCount");
const manageCount = document.getElementById("manageCount");
const searchInput = document.getElementById("searchInput");
const diskForm = document.getElementById("diskForm");
const formMessage = document.getElementById("formMessage");
const movementForm = document.getElementById("movementForm");
const movementMessage = document.getElementById("movementMessage");
const movementDisk = document.getElementById("movementDisk");
const toast = document.getElementById("toast");

let discos = [];
let toastTimer;

function mostrarToast(mensagem, erro = false) {
  toast.textContent = mensagem;
  toast.className = `toast show${erro ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = "toast", 3200);
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[caractere]));
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function iniciais(titulo) {
  return String(titulo || "VC").trim().split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase();
}

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || `Erro HTTP ${resposta.status}`);
  return dados;
}

async function carregarDiscos() {
  apiStatus.textContent = "Conectando à API...";
  try {
    const dados = await requisicao("/discos");
    discos = Array.isArray(dados) ? dados : (dados.discos || dados.dados || []);
    apiStatus.textContent = "API conectada · dados do banco";
    apiStatus.previousElementSibling.style.background = "#80b88a";
    renderizarDiscos();
    renderizarGerenciamento();
    atualizarSelectDiscos();
  } catch (erro) {
    discos = [];
    apiStatus.textContent = "Não foi possível conectar à API";
    apiStatus.previousElementSibling.style.background = "#f15d45";
    productGrid.innerHTML = `<div class="empty-state">Não consegui carregar os discos. Confira se o servidor está rodando em <strong>localhost:3000</strong> e tente atualizar.<br><br><small>${escapar(erro.message)}</small></div>`;
    manageList.innerHTML = `<p class="muted">Aguardando conexão com a API.</p>`;
    diskCount.textContent = "0 discos";
    manageCount.textContent = "0 itens";
    atualizarSelectDiscos();
  }
}

function renderizarDiscos() {
  const termo = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const filtrados = discos.filter(d => `${d.titulo} ${d.artista}`.toLocaleLowerCase("pt-BR").includes(termo));
  diskCount.textContent = `${filtrados.length} ${filtrados.length === 1 ? "disco" : "discos"}`;
  if (!filtrados.length) {
    productGrid.innerHTML = `<div class="empty-state">${discos.length ? "Nenhum disco encontrado nessa busca." : "Seu catálogo está esperando os primeiros discos."}</div>`;
    return;
  }
  productGrid.innerHTML = filtrados.map(d => {
    const quantidade = Number(d.quantidade || 0);
    const baixo = quantidade <= Number(d.estoqueMinimo ?? 1);
    return `<article class="product-card">
      <div class="album-art"><span class="album-initials">${escapar(iniciais(d.titulo))}</span></div>
      <h3 title="${escapar(d.titulo)}">${escapar(d.titulo)}</h3>
      <p class="artist">${escapar(d.artista)}</p>
      <div class="product-meta"><span class="price">${moeda(d.precoCusto)}</span><span class="stock ${baixo ? "low" : ""}">${quantidade} em estoque</span></div>
    </article>`;
  }).join("");
}

function renderizarGerenciamento() {
  manageCount.textContent = `${discos.length} ${discos.length === 1 ? "item" : "itens"}`;
  if (!discos.length) {
    manageList.innerHTML = `<p class="muted">Nenhum disco cadastrado ainda.</p>`;
    return;
  }
  manageList.innerHTML = discos.map(d => `<div class="manage-item">
    <div><strong>${escapar(d.titulo)}</strong><small>${escapar(d.artista)} · ${Number(d.quantidade || 0)} un. · ${moeda(d.precoCusto)}</small></div>
    <div class="manage-actions"><button class="mini-button" data-edit="${d.id}">Editar</button><button class="mini-button delete" data-delete="${d.id}">Excluir</button></div>
  </div>`).join("");
}

function atualizarSelectDiscos() {
  const valorAtual = movementDisk.value;
  movementDisk.innerHTML = `<option value="">Selecione um disco</option>` + discos.map(d =>
    `<option value="${Number(d.id)}">${escapar(d.titulo)} — ${escapar(d.artista)} (estoque: ${Number(d.quantidade || 0)})</option>`
  ).join("");
  if (discos.some(d => String(d.id) === valorAtual)) movementDisk.value = valorAtual;
}

function limparFormulario() {
  diskForm.reset();
  document.getElementById("diskId").value = "";
  document.getElementById("estoqueMinimo").value = "1";
  document.getElementById("formTitle").textContent = "Adicionar um disco";
  document.getElementById("saveButton").innerHTML = 'Salvar disco <span>↗</span>';
  document.getElementById("cancelEdit").classList.add("hidden");
}

diskForm.addEventListener("submit", async evento => {
  evento.preventDefault();
  formMessage.textContent = "Salvando...";
  const id = document.getElementById("diskId").value;
  const corpo = {
    titulo: document.getElementById("titulo").value.trim(),
    artista: document.getElementById("artista").value.trim(),
    precoCusto: Number(document.getElementById("precoCusto").value),
    quantidade: Number(document.getElementById("quantidade").value),
    estoqueMinimo: Number(document.getElementById("estoqueMinimo").value)
  };
  try {
    await requisicao(id ? `/discos/${id}` : "/discos", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(corpo)
    });
    formMessage.textContent = id ? "Disco atualizado com sucesso!" : "Disco cadastrado com sucesso!";
    mostrarToast(id ? "Disco atualizado!" : "Disco cadastrado!");
    limparFormulario();
    await carregarDiscos();
  } catch (erro) {
    formMessage.textContent = erro.message;
    mostrarToast(erro.message, true);
  }
});

document.getElementById("cancelEdit").addEventListener("click", () => {
  limparFormulario();
  formMessage.textContent = "";
});

manageList.addEventListener("click", async evento => {
  const editarBotao = evento.target.closest("[data-edit]");
  const excluirBotao = evento.target.closest("[data-delete]");
  if (editarBotao) {
    const disco = discos.find(d => String(d.id) === editarBotao.dataset.edit);
    if (!disco) return;
    document.getElementById("diskId").value = disco.id;
    document.getElementById("titulo").value = disco.titulo || "";
    document.getElementById("artista").value = disco.artista || "";
    document.getElementById("precoCusto").value = Number(disco.precoCusto || 0);
    document.getElementById("quantidade").value = Number(disco.quantidade || 0);
    document.getElementById("estoqueMinimo").value = Number(disco.estoqueMinimo ?? 1);
    document.getElementById("formTitle").textContent = `Editar disco #${disco.id}`;
    document.getElementById("saveButton").innerHTML = 'Salvar alterações <span>↗</span>';
    document.getElementById("cancelEdit").classList.remove("hidden");
    document.getElementById("admin").scrollIntoView({ behavior: "smooth" });
  }
  if (excluirBotao) {
    const disco = discos.find(d => String(d.id) === excluirBotao.dataset.delete);
    if (!disco || !confirm(`Tem certeza que deseja excluir "${disco.titulo}"?`)) return;
    try {
      await requisicao(`/discos/${disco.id}`, { method: "DELETE" });
      mostrarToast("Disco excluído com sucesso!");
      await carregarDiscos();
    } catch (erro) {
      mostrarToast(erro.message, true);
    }
  }
});

movementForm.addEventListener("submit", async evento => {
  evento.preventDefault();
  movementMessage.textContent = "Registrando movimentação...";
  const corpo = {
    discoId: Number(movementDisk.value),
    tipo: document.getElementById("movementType").value,
    quantidade: Number(document.getElementById("movementQuantity").value),
    usuarioId: Number(document.getElementById("movementUser").value)
  };
  try {
    await requisicao("/movimentacoes", { method: "POST", body: JSON.stringify(corpo) });
    movementMessage.textContent = "Movimentação registrada e estoque atualizado!";
    mostrarToast("Movimentação registrada!");
    await carregarDiscos();
  } catch (erro) {
    movementMessage.textContent = erro.message;
    mostrarToast(erro.message, true);
  }
});

searchInput.addEventListener("input", renderizarDiscos);
document.getElementById("reloadButton").addEventListener("click", carregarDiscos);
document.querySelectorAll("[data-genre]").forEach(botao => {
  botao.addEventListener("click", () => {
    const termo = botao.dataset.genre;
    searchInput.value = termo;
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    renderizarDiscos();
  });
});
document.getElementById("menuButton").addEventListener("click", () => {
  document.querySelector(".nav").classList.toggle("open");
});
document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => document.querySelector(".nav").classList.remove("open")));

carregarDiscos();
