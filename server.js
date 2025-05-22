import express from 'express';
import pkg from 'pg';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Banco de dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Fornecida pelo Railway
  ssl: {
    rejectUnauthorized: false, // Necessário para Railway e outros serviços externos
  }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Criação da tabela, se não existir
(async () => {
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS perguntas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      departamento TEXT NOT NULL,
      pergunta TEXT NOT NULL,
      resposta TEXT,
      faq INTEGER DEFAULT 0,
      data TEXT
    )
  `);
  client.release();
})();

// Enviar pergunta
app.post('/perguntas', async (req, res) => {
  const { nome, departamento, pergunta } = req.body;
  if (!nome || !departamento || !pergunta) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const data = new Date().toLocaleString('pt-BR');
  await pool.query('INSERT INTO perguntas (nome, departamento, pergunta, data) VALUES ($1, $2, $3, $4)', [
    nome, departamento, pergunta, data
  ]);
  res.json({ msg: 'Pergunta enviada com sucesso.' });
});

// Listar perguntas
app.get('/perguntas', async (req, res) => {
  const result = await pool.query('SELECT * FROM perguntas ORDER BY id DESC');
  res.json(result.rows);
});

// Listar perguntas por departamento
app.get('/perguntas/departamento/:departamento', async (req, res) => {
  const { departamento } = req.params;
  const result = await pool.query('SELECT * FROM perguntas WHERE departamento = $1 ORDER BY id DESC', [departamento]);
  res.json(result.rows);
});

// Responder pergunta
app.post('/perguntas/:id/responder', async (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  if (!resposta) return res.status(400).json({ erro: 'Resposta vazia.' });

  await pool.query('UPDATE perguntas SET resposta = $1 WHERE id = $2', [resposta, id]);
  res.json({ msg: 'Resposta enviada com sucesso.' });
});

// Apagar pergunta
app.delete('/perguntas/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM perguntas WHERE id = $1', [id]);
  res.json({ msg: 'Pergunta apagada com sucesso.' });
});

// Marcar/desmarcar como FAQ
app.post('/perguntas/:id/faq', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT faq FROM perguntas WHERE id = $1', [id]);
  if (result.rows.length === 0) return res.status(404).json({ erro: 'Pergunta não encontrada.' });

  const novoStatus = result.rows[0].faq ? 0 : 1;
  await pool.query('UPDATE perguntas SET faq = $1 WHERE id = $2', [novoStatus, id]);

  res.json({ msg: novoStatus ? 'Pergunta marcada como FAQ.' : 'FAQ removido.' });
});

// Obter perguntas FAQ
app.get('/faq', async (req, res) => {
  const result = await pool.query('SELECT * FROM perguntas WHERE faq = 1 ORDER BY id DESC');
  res.json(result.rows);
});

// Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://teams.microsoft.com");
  next();
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
