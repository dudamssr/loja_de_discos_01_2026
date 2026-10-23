const API_URL = "http://localhost:3000";
const tokenSalvo = localStorage.getItem("vinylToken");
const usuarioSalvo = localStorage.getItem("vinylUsuario");
let usuarioLogado;

try {
  usuarioLogado = JSON.parse(usuarioSalvo || "null");
  if (!tokenSalvo || !usuarioLogado || !usuarioLogado.id || !usuarioLogado.nome) throw new Error("Sessão inválida");
} catch (erro) {
  localStorage.removeItem("vinylToken");
  localStorage.removeItem("vinylUsuario");
  window.location.replace("./login.html");
  throw erro;
}

const el = id => document.getElementById(id);
el("usuarioNome").textContent = usuarioLogado.nome;
el("usuarioNomeCompleto").textContent = usuarioLogado.nome;
el("usuarioEmail").textContent = usuarioLogado.email || "Conta conectada";
el("usuarioAvatar").textContent = usuarioLogado.nome.trim().charAt(0).toUpperCase();
el("avNumeroRegistro").textContent = String(Date.now()).slice(-6);

el("usuarioBotao").addEventListener("click", event => {
  event.stopPropagation();
  const aberto = el("usuarioDropdown").classList.toggle("aberto");
  el("usuarioBotao").setAttribute("aria-expanded", String(aberto));
});
document.addEventListener("click", event => {
  if (!el("usuarioMenu").contains(event.target)) {
    el("usuarioDropdown").classList.remove("aberto");
    el("usuarioBotao").setAttribute("aria-expanded", "false");
  }
});
el("botaoSair").addEventListener("click", () => {
  localStorage.removeItem("vinylToken");
  localStorage.removeItem("vinylUsuario");
  window.location.replace("./login.html");
});
el("menuButton").addEventListener("click", () => el("navPrincipal").classList.toggle("open"));
document.querySelectorAll("#navPrincipal a").forEach(link => link.addEventListener("click", () => el("navPrincipal").classList.remove("open")));

let discos = [];
let toastTimer;
const moeda = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const nomeDisco = d => `${d.titulo || "Disco sem título"} — ${d.artista || "Artista não informado"}`;
function mostrarToast(mensagem, erro = false) {
  const toast = el("avToast");
  toast.textContent = mensagem;
  toast.className = `toast show${erro ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = "toast", 3500);
}
async function requisicao(caminho, opcoes = {}) {
  const headers = { "Content-Type": "application/json", ...(opcoes.headers || {}) };
  if (tokenSalvo) headers.Authorization = `Bearer ${tokenSalvo}`;
  const resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || `Erro HTTP ${resposta.status}`);
  return dados;
}
function estoque(d) { return Number(d.quantidade || 0); }
function minimo(d) { return Number(d.estoqueMinimo ?? 1); }
function obterGenero(d) { return String(d.genero || d.categoria || d.estilo || "Não informado").trim(); }
function atualizarEstatisticas() {
  el("avTotalDiscos").textContent = discos.length;
  el("avTotalUnidades").textContent = discos.reduce((total, d) => total + estoque(d), 0);
  el("avEstoqueBaixo").textContent = discos.filter(d => estoque(d) <= minimo(d)).length;
}
function atualizarGeneros() {
  const filtro = el("avFiltroGenero");
  const atual = filtro.value;
  const generos = [...new Set(discos.map(obterGenero).filter(g => g !== "Não informado"))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  filtro.innerHTML = '<option value="todos">Todos os gêneros</option>' + generos.map(g => `<option value="${escapar(g)}">${escapar(g)}</option>`).join("");
  if (generos.includes(atual)) filtro.value = atual;
}
function discosFiltrados() {
  const termo = el("avBusca").value.trim().toLocaleLowerCase("pt-BR");
  const disponibilidade = el("avFiltroEstoque").value;
  const genero = el("avFiltroGenero").value;
  return discos.filter(d => {
    const texto = `${d.titulo || ""} ${d.artista || ""}`.toLocaleLowerCase("pt-BR");
    const qtd = estoque(d);
    const correspondeEstoque = disponibilidade === "todos" || (disponibilidade === "disponivel" && qtd > 0) || (disponibilidade === "baixo" && qtd <= minimo(d)) || (disponibilidade === "esgotado" && qtd <= 0);
    const correspondeGenero = genero === "todos" || obterGenero(d) === genero;
    return texto.includes(termo) && correspondeEstoque && correspondeGenero;
  });
}
function renderizarAcervo() {
  const filtrados = discosFiltrados();
  el("avQuantidadeResultados").textContent = `${filtrados.length} ${filtrados.length === 1 ? "disco encontrado" : "discos encontrados"}`;
  if (!filtrados.length) {
    el("avGrid").innerHTML = `<div class="av-empty">${discos.length ? "Nenhum disco corresponde aos filtros escolhidos." : "Nenhum disco foi encontrado na API. Confira o servidor ou cadastre discos no gerenciamento."}</div>`;
    return;
  }
  el("avGrid").innerHTML = filtrados.map(d => {
    const qtd = estoque(d);
    const baixo = qtd <= minimo(d);
    const valor = d.precoVenda ?? d.preco ?? d.precoCusto ?? 0;
    const genero = obterGenero(d);
    const iniciais = String(d.titulo || "VC").trim().split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase();
    return `<article class="av-card"><div class="av-album-art"><span class="av-album-initials">${escapar(iniciais)}</span></div><h3 title="${escapar(d.titulo)}">${escapar(d.titulo || "Disco sem título")}</h3><p class="av-artist">${escapar(d.artista || "Artista não informado")}</p><div class="av-card-bottom"><span class="av-card-price">${moeda(valor)}</span><span class="av-stock ${baixo ? "low" : ""}">${qtd} un.</span></div><div class="av-card-footer"><span class="av-genre">${escapar(genero)}</span><button type="button" class="av-sell-card" data-vender="${Number(d.id)}" ${qtd <= 0 ? "disabled" : ""}>Vender ↗</button></div></article>`;
  }).join("");
}
function atualizarSelectVenda() {
  const atual = el("avVendaDisco").value;
  el("avVendaDisco").innerHTML = '<option value="">Selecione um disco</option>' + discos.filter(d => estoque(d) > 0).map(d => `<option value="${Number(d.id)}">${escapar(nomeDisco(d))} (estoque: ${estoque(d)})</option>`).join("");
  if (discos.some(d => String(d.id) === atual && estoque(d) > 0)) el("avVendaDisco").value = atual;
  atualizarResumoVenda();
}
function atualizarResumoVenda() {
  const disco = discos.find(d => String(d.id) === el("avVendaDisco").value);
  const qtd = Math.max(0, Number(el("avVendaQuantidade").value || 0));
  const valor = Math.max(0, Number(el("avValorUnitario").value || 0));
  el("avTotalVenda").textContent = moeda(qtd * valor);
  if (!disco) {
    el("avDiscoSelecionado").innerHTML = '<div class="av-mini-record">◉</div><div><strong>Escolha um disco</strong><small>O estoque aparecerá aqui</small></div>';
    el("avVendaQuantidade").removeAttribute("max");
    return;
  }
  el("avDiscoSelecionado").innerHTML = `<div class="av-mini-record">◉</div><div><strong>${escapar(disco.titulo)}</strong><small>${estoque(disco)} unidade(s) disponível(is)</small></div>`;
  el("avVendaQuantidade").max = String(estoque(disco));
  if (!el("avValorUnitario").value) el("avValorUnitario").value = Number(disco.precoVenda ?? disco.preco ?? disco.precoCusto ?? 0) || "";
}
async function carregarAcervo() {
  el("avApiStatus").textContent = "Conectando à API...";
  el("avStatusDot").style.background = "var(--cream)";
  try {
    const dados = await requisicao("/discos");
    discos = Array.isArray(dados) ? dados : (dados.discos || dados.dados || []);
    el("avApiStatus").textContent = "API conectada · catálogo atualizado";
    el("avStatusDot").style.background = "#80b88a";
    atualizarEstatisticas();
    atualizarGeneros();
    renderizarAcervo();
    atualizarSelectVenda();
  } catch (erro) {
    el("avApiStatus").textContent = "API indisponível";
    el("avStatusDot").style.background = "var(--coral)";
    el("avGrid").innerHTML = `<div class="av-empty">Não foi possível carregar o acervo. Verifique se o servidor está ativo em localhost:3000.<br><small>${escapar(erro.message)}</small></div>`;
    el("avTotalDiscos").textContent = "—";
    el("avTotalUnidades").textContent = "—";
    el("avEstoqueBaixo").textContent = "—";
    el("avQuantidadeResultados").textContent = "Catálogo indisponível";
  }
}
el("avBusca").addEventListener("input", renderizarAcervo);
el("avFiltroEstoque").addEventListener("change", renderizarAcervo);
el("avFiltroGenero").addEventListener("change", renderizarAcervo);
el("avAtualizar").addEventListener("click", carregarAcervo);
el("avLimparFiltros").addEventListener("click", () => { el("avBusca").value = ""; el("avFiltroEstoque").value = "todos"; el("avFiltroGenero").value = "todos"; renderizarAcervo(); });
el("avGrid").addEventListener("click", event => {
  const botao = event.target.closest("[data-vender]");
  if (!botao) return;
  el("avVendaDisco").value = botao.dataset.vender;
  el("avVendaQuantidade").value = "1";
  el("avValorUnitario").value = "";
  atualizarResumoVenda();
  el("vendas").scrollIntoView({ behavior: "smooth" });
});
el("avVendaDisco").addEventListener("change", () => { el("avValorUnitario").value = ""; atualizarResumoVenda(); });
el("avVendaQuantidade").addEventListener("input", atualizarResumoVenda);
el("avValorUnitario").addEventListener("input", atualizarResumoVenda);
el("avVendaForm").addEventListener("submit", async event => {
  event.preventDefault();
  const disco = discos.find(d => String(d.id) === el("avVendaDisco").value);
  const quantidade = Number(el("avVendaQuantidade").value);
  const valorUnitario = Number(el("avValorUnitario").value);
  const mensagem = el("avVendaMensagem");
  mensagem.classList.remove("error");
  if (!disco) { mensagem.textContent = "Selecione um disco."; mensagem.classList.add("error"); return; }
  if (!Number.isInteger(quantidade) || quantidade < 1) { mensagem.textContent = "Informe uma quantidade válida."; mensagem.classList.add("error"); return; }
  if (quantidade > estoque(disco)) { mensagem.textContent = `Estoque insuficiente. Há ${estoque(disco)} unidade(s) disponível(is).`; mensagem.classList.add("error"); return; }
  if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) { mensagem.textContent = "Informe um valor unitário válido."; mensagem.classList.add("error"); return; }
  const botao = el("avRegistrarVenda");
  botao.disabled = true;
  mensagem.textContent = "Registrando saída de estoque...";
  try {
    await requisicao("/movimentacoes", { method: "POST", body: JSON.stringify({ discoId: Number(disco.id), tipo: "SAIDA", quantidade, usuarioId: Number(usuarioLogado.id) }) });
    mensagem.textContent = `Saída registrada. Total informado: ${moeda(quantidade * valorUnitario)}. O estoque foi atualizado.`;
    mostrarToast("Saída registrada com sucesso!");
    el("avVendaQuantidade").value = "1";
    await carregarAcervo();
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.classList.add("error");
    mostrarToast(erro.message, true);
  } finally {
    botao.disabled = false;
  }
});

carregarAcervo();
