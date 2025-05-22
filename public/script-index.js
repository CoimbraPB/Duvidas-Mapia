// Função para mostrar a notificação com fade-in e fade-out
function mostrarNotificacao(mensagem, tempo = 3000) {
  const notif = document.getElementById('notificacao');
  notif.textContent = mensagem;
  notif.classList.add('show');

  setTimeout(() => {
    notif.classList.remove('show');
  }, tempo);
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const departamento = document.getElementById('departamento').value;
  const pergunta = document.getElementById('pergunta').value.trim();

  if (!nome || !departamento || !pergunta) {
    mostrarNotificacao('Preencha todos os campos.', 3000);
    return;
  }

  try {
    const res = await fetch('/perguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, departamento, pergunta }),
    });

    const data = await res.json();
    mostrarNotificacao(data.msg || data.erro || 'Mensagem enviada com sucesso!', 3000);

    document.getElementById('formulario').reset();
    await carregarPerguntas();
    await carregarFAQ();

  } catch (error) {
    mostrarNotificacao('Erro ao enviar, tente novamente.', 3000);
  }
});

let perguntasCache = [];
let faqsCache = [];

async function carregarPerguntas() {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';
  const res = await fetch('/perguntas');
  perguntasCache = await res.json();
  renderizarPerguntasFiltradas('Todos');
}

async function carregarFAQ() {
  const container = document.getElementById('faq');
  container.innerHTML = '';
  const res = await fetch('/faq');
  faqsCache = await res.json();
  renderizarFaqsFiltradas('Todos');
}

function renderizarPerguntasFiltradas(filtro) {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';

  perguntasCache.forEach(p => {
    if (!p.resposta) return;

    if (filtro !== 'Todos' && p.departamento !== filtro) return;

    const div = document.createElement('div');
    div.className = 'pergunta-card';
    div.innerHTML = `
      <p style="color: red; font-weight: bold; margin:0;">Nome: <span style="font-weight: normal; color: white;">${p.nome}</span></p>
      <p style="color: red; font-weight: bold; margin:0;">Departamento: <span style="font-weight: normal; color: white;">${p.departamento}</span></p>
      <p style="color: red; font-weight: bold; margin:0;">Resposta: <span style="font-weight: normal; color: white;">${p.resposta}</span></p>
    `;
    container.appendChild(div);
  });
}

function renderizarFaqsFiltradas(filtro) {
  const container = document.getElementById('faq');
  container.innerHTML = '';

  faqsCache.forEach(p => {
    if (!p.resposta) return;

    if (filtro !== 'Todos' && p.departamento !== filtro) return;

    const div = document.createElement('div');
    div.className = 'pergunta-card';
    div.innerHTML = `
      <p style="color: red; font-weight: bold; margin:0;">Nome: <span style="font-weight: normal; color: white;">${p.nome}</span></p>
      <p style="color: red; font-weight: bold; margin:0;">Departamento: <span style="font-weight: normal; color: white;">${p.departamento}</span></p>
      <p style="color: red; font-weight: bold; margin:0;">Resposta: <span style="font-weight: normal; color: white;">${p.resposta}</span></p>
    `;
    container.appendChild(div);
  });
}

// Função para configurar os botões filtro
function configurarFiltros() {
  const botoes = document.querySelectorAll('#filtros-departamento .btn-filtro');

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      // Remove classe ativo de todos
      botoes.forEach(b => b.classList.remove('ativo'));

      // Adiciona na clicada
      botao.classList.add('ativo');

      const filtro = botao.getAttribute('data-dep');

      renderizarPerguntasFiltradas(filtro);
      renderizarFaqsFiltradas('Todos'); // <-- Aqui o FAQ sempre mostra tudo
    });
  });
}

// Inicializa tudo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  carregarPerguntas();
  carregarFAQ();
  configurarFiltros();
});
