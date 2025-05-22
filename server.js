import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;
(async () => {
  db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS perguntas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      departamento TEXT NOT NULL,
      pergunta TEXT NOT NULL,
      resposta TEXT,
      faq INTEGER DEFAULT 0,
      data TEXT
    )
  `);
})();

// Enviar pergunta
app.post('/perguntas', async (req, res) => {
  const { nome, departamento, pergunta } = req.body;
  if (!nome || !departamento || !pergunta) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const data = new Date().toLocaleString('pt-BR');
  await db.run('INSERT INTO perguntas (nome, departamento, pergunta, data) VALUES (?, ?, ?, ?)', [
    nome, departamento, pergunta, data
  ]);
  res.json({ msg: 'Pergunta enviada com sucesso.' });
});

// Listar perguntas
app.get('/perguntas', async (req, res) => {
  const perguntas = await db.all('SELECT * FROM perguntas ORDER BY id DESC');
  res.json(perguntas);
});

// Listar perguntas por departamento
app.get('/perguntas/departamento/:departamento', async (req, res) => {
  const { departamento } = req.params;
  const perguntas = await db.all('SELECT * FROM perguntas WHERE departamento = ? ORDER BY id DESC', [departamento]);
  res.json(perguntas);
});

// Responder pergunta
app.post('/perguntas/:id/responder', async (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;

  if (!resposta) return res.status(400).json({ erro: 'Resposta vazia.' });

  await db.run('UPDATE perguntas SET resposta = ? WHERE id = ?', [resposta, id]);
  res.json({ msg: 'Resposta enviada com sucesso.' });
});

// Apagar pergunta
app.delete('/perguntas/:id', async (req, res) => {
  const { id } = req.params;

  await db.run('DELETE FROM perguntas WHERE id = ?', [id]);
  res.json({ msg: 'Pergunta apagada com sucesso.' });
});

// Marcar/desmarcar como FAQ
app.post('/perguntas/:id/faq', async (req, res) => {
  const { id } = req.params;
  const pergunta = await db.get('SELECT faq FROM perguntas WHERE id = ?', id);
  if (!pergunta) return res.status(404).json({ erro: 'Pergunta não encontrada.' });

  const novoStatus = pergunta.faq ? 0 : 1;
  await db.run('UPDATE perguntas SET faq = ? WHERE id = ?', [novoStatus, id]);

  res.json({ msg: novoStatus ? 'Pergunta marcada como FAQ.' : 'FAQ removido.' });
});

// Obter perguntas FAQ
app.get('/faq', async (req, res) => {
  const faqs = await db.all('SELECT * FROM perguntas WHERE faq = 1 ORDER BY id DESC');
  res.json(faqs);
});

// 🔧 Escutar em todas as interfaces (incluindo 191.228.51.71)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em: http://191.228.51.71:${PORT}`);
});
