async function carregarPerguntas() {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';
  const res = await fetch('/perguntas');
  const perguntas = await res.json();

  const pendentes = perguntas.filter(p => !p.resposta);
  const respondidas = perguntas.filter(p => p.resposta);

  document.getElementById('contador').innerText = `📩 Pendentes: ${pendentes.length} | ✅ Respondidas: ${respondidas.length}`;

  [...pendentes, ...respondidas].forEach(p => {
    const div = document.createElement('div');
    div.className = 'pergunta-card';
    div.dataset.id = p.id;

    if (!p.resposta) {
      div.innerHTML = `
        <strong>${p.nome}</strong> (${p.departamento})<br/>
        <p>${p.pergunta}</p>
        <input type="text" placeholder="Responder..." id="resposta-${p.id}" />
        <button onclick="responder(${p.id})">Responder</button>
        <button onclick="apagar(${p.id})">Apagar</button>
        <button onclick="marcarFAQ(${p.id})" class="${p.faq ? 'faq-marcado' : ''}">
          ${p.faq ? '✅ FAQ' : '📌 Marcar FAQ'}
        </button>
      `;
    } else {
      div.innerHTML = `
        <strong>${p.nome}</strong> (${p.departamento})<br/>
        <p>${p.pergunta}</p>
        <div class="resposta-texto" id="resposta-texto-${p.id}">
          <strong>Resposta:</strong> <span>${p.resposta}</span>
        </div>
        <button onclick="editarResposta(${p.id})">Editar Resposta</button>
        <button onclick="apagar(${p.id})">Apagar</button>
        <button onclick="marcarFAQ(${p.id})" class="${p.faq ? 'faq-marcado' : ''}">
          ${p.faq ? '✅ FAQ' : '📌 Marcar FAQ'}
        </button>
      `;
    }

    container.appendChild(div);
  });
}

function editarResposta(id) {
  const respostaDiv = document.getElementById(`resposta-texto-${id}`);
  const textoAtual = respostaDiv.querySelector('span').textContent;

  // Substituir o texto da resposta por input e botões salvar/cancelar
  respostaDiv.innerHTML = `
    <input type="text" id="input-editar-${id}" value="${textoAtual}" />
    <button onclick="salvarRespostaEditada(${id})">Salvar</button>
    <button onclick="cancelarEdicao(${id}, '${textoAtual.replace(/'/g, "\\'")}')">Cancelar</button>
  `;
}

function verificarSenha() {
  const senhaCorreta = "adm123"; // Altere aqui se quiser
  const senhaDigitada = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  if (senhaDigitada === senhaCorreta) {
    document.getElementById("senha-container").style.display = "none";
    document.getElementById("painel").style.display = "block";
  } else {
    mensagem.textContent = "Senha incorreta!";
  }
}

async function salvarRespostaEditada(id) {
  const input = document.getElementById(`input-editar-${id}`);
  const novaResposta = input.value.trim();

  if (!novaResposta) {
    alert('Resposta não pode ser vazia.');
    return;
  }

  const res = await fetch(`/perguntas/${id}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resposta: novaResposta }),
  });

  const data = await res.json();
  alert(data.msg || data.erro);
  carregarPerguntas();
}

function cancelarEdicao(id, textoOriginal) {
  const respostaDiv = document.getElementById(`resposta-texto-${id}`);
  respostaDiv.innerHTML = `<strong>Resposta:</strong> <span>${textoOriginal}</span>`;
}

async function responder(id) {
  const resposta = document.getElementById(`resposta-${id}`).value.trim();

  if (!resposta) {
    alert('Resposta não pode ser vazia.');
    return;
  }

  const res = await fetch(`/perguntas/${id}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resposta }),
  });

  const data = await res.json();
  alert(data.msg || data.erro);
  carregarPerguntas();
}

async function apagar(id) {
  const res = await fetch(`/perguntas/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  alert(data.msg || data.erro);
  carregarPerguntas();
}

async function marcarFAQ(id) {
  const res = await fetch(`/perguntas/${id}/faq`, {
    method: 'POST',
  });

  const data = await res.json();
  alert(data.msg || data.erro);
  carregarPerguntas();
}

carregarPerguntas();
