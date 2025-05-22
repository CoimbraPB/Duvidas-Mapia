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

    div.innerHTML = `
      <strong>${p.nome}</strong> (${p.departamento})<br/>
      <p>${p.pergunta}</p>
      ${p.resposta ? `<div class="resposta"><strong>Resposta:</strong> ${p.resposta}</div>` : ''}
      <div class="botoes">
        ${!p.resposta ? `
          <input type="text" placeholder="Responder..." id="resposta-${p.id}" />
          <button onclick="responder(${p.id})">Responder</button>
        ` : ''}
        <button onclick="apagar(${p.id})">Apagar</button>
        <button onclick="marcarFAQ(${p.id})" class="${p.faq ? 'faq-marcado' : ''}">
          ${p.faq ? '✅ FAQ' : '📌 Marcar FAQ'}
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

async function responder(id) {
  const resposta = document.getElementById(`resposta-${id}`).value;

  const res = await fetch(`/perguntas/${id}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resposta }),  // sem senha aqui
  });

  const data = await res.json();
  alert(data.msg || data.erro);
  carregarPerguntas();
}

async function apagar(id) {
  const res = await fetch(`/perguntas/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}), // sem senha aqui
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
