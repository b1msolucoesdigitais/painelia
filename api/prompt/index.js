const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao');
  } catch {
    return res.status(403).json({ message: 'Token inválido' });
  }

  if (req.method === 'GET') {
    try {
      const promptPath = path.join(process.cwd(), 'prompt.txt');
      const content = await fs.readFile(promptPath, 'utf8');
      return res.status(200).json({ content });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erro ao ler o prompt' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { content } = req.body || {};
      if (!content) {
        return res.status(400).json({ message: 'Conteúdo do prompt é obrigatório' });
      }

      try {
        await fs.writeFile('/tmp/prompt.txt', content, 'utf8');
      } catch {}

      if (process.env.WEBHOOK_URL) {
        try {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: content, timestamp: new Date().toISOString() })
          });
        } catch {}
      }

      return res.status(200).json({ message: 'Prompt salvo com sucesso' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erro ao salvar o prompt' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};


