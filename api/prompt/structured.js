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
      const configPath = path.join(process.cwd(), 'prompt-config.json');
      const content = await fs.readFile(configPath, 'utf8');
      const json = JSON.parse(content);
      json.metadata = {
        ...(json.metadata || {}),
        lastUpdated: new Date().toISOString(),
      };
      return res.status(200).json(json);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erro ao ler o prompt estruturado' });
    }
  }

  if (req.method === 'POST') {
    try {
      const promptConfig = req.body || {};
      if (!promptConfig || typeof promptConfig !== 'object') {
        return res.status(400).json({ message: 'Configuração do prompt é obrigatória' });
      }

      // validação simples: sections com content
      const required = ['current_date','greeting','personality','context','role_objective','actions','product_search','handoff','restrictions','essential_rules','settings','examples','closing'];
      for (const key of required) {
        if (!promptConfig[key] || !promptConfig[key].content) {
          return res.status(400).json({ message: `Seção '${key}' é obrigatória` });
        }
      }

      promptConfig.metadata = {
        ...(promptConfig.metadata || {}),
        lastUpdated: new Date().toISOString(),
      };

      const configPath = path.join(process.cwd(), 'prompt-config.json');
      try {
        await fs.writeFile('/tmp/prompt-config.json', JSON.stringify(promptConfig, null, 2), 'utf8');
      } catch {}
      await fs.writeFile(configPath, JSON.stringify(promptConfig, null, 2), 'utf8').catch(() => {});

      if (process.env.WEBHOOK_URL) {
        try {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt_structured: promptConfig, timestamp: new Date().toISOString() })
          });
        } catch {}
      }

      return res.status(200).json({ message: 'Prompt estruturado salvo com sucesso' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erro ao salvar o prompt estruturado' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};


