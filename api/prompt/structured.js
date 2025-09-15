const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../../config');

function sanitizeTitle(title) {
  return (title || '').replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\uFE0F]/gu, '').trim();
}

function generateFullPrompt(promptConfig) {
  let fullPrompt = '';

  fullPrompt += `# 🤖 **AGENTE DUCENA - ASSISTENTE DE VENDAS**\n\n`;

  const sections = [
    ['current_date', 'Data Atual'],
    ['greeting', 'Saudação Inicial'],
    ['personality', 'Personalidade'],
    ['context', 'Contexto da Empresa'],
    ['role_objective', 'Função e Objetivo'],
    ['actions', 'Ações Principais'],
    ['product_search', 'Busca de Produtos'],
    ['handoff', 'Transferência de Atendimento'],
    ['restrictions', 'Restrições e Limites'],
    ['essential_rules', 'Regras Essenciais'],
    ['settings', 'Configurações Específicas'],
    ['examples', 'Exemplos de Respostas'],
    ['closing', 'Encerramento']
  ];

  for (const [key, _fallback] of sections) {
    const section = promptConfig[key] || {};
    const title = sanitizeTitle(section.title || _fallback).toUpperCase();
    const content = section.content || '';
    fullPrompt += `## **${title}**\n\n`;
    fullPrompt += `${content}\n\n`;
  }

  return fullPrompt;
}

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
      const fetchUrl = (config && config.PROMPT_FETCH && config.PROMPT_FETCH.URL) || process.env.PROMPT_FETCH_WEBHOOK_URL;

      // 1) Se houver webhook configurado, tenta buscar de lá primeiro
      if (fetchUrl) {
        try {
          const headers = { 'Content-Type': 'application/json' };
          // Headers extras opcionais via config
          if (config && config.PROMPT_FETCH && config.PROMPT_FETCH.HEADERS && typeof config.PROMPT_FETCH.HEADERS === 'object') {
            for (const k of Object.keys(config.PROMPT_FETCH.HEADERS)) headers[k] = String(config.PROMPT_FETCH.HEADERS[k]);
          }
          // Headers extras opcionais via env (JSON string)
          if (process.env.PROMPT_FETCH_WEBHOOK_HEADERS) {
            try {
              const extra = JSON.parse(process.env.PROMPT_FETCH_WEBHOOK_HEADERS);
              for (const k of Object.keys(extra || {})) headers[k] = String(extra[k]);
            } catch {}
          }

          console.log(`📥 Buscando prompt estruturado via webhook (POST): ${fetchUrl}`);
          const response = await fetch(fetchUrl, { method: 'POST', headers, body: JSON.stringify({ action: 'fetch_prompt_config' }) });
          console.log(`📥 Resposta do webhook (status): ${response.status}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const remote = await response.json();
          // Espera-se que o webhook retorne o objeto estruturado de seções
          const json = typeof remote === 'object' && remote !== null
            ? remote
            : {};

          // Validação mínima: precisa ter algumas chaves conhecidas
          const required = ['current_date','greeting','personality','context','role_objective','actions','product_search','handoff','restrictions','essential_rules','settings','examples','closing'];
          const hasRequired = required.every(key => json[key] && typeof json[key].content === 'string');

          if (hasRequired) {
            json.metadata = {
              ...(json.metadata || {}),
              source: 'webhook',
              lastUpdated: new Date().toISOString(),
            };

            // Best-effort: salva cópia local/temporária para fallback (não persiste na Vercel)
            try { await fs.writeFile('/tmp/prompt-config.json', JSON.stringify(json, null, 2), 'utf8'); } catch {}
            try { await fs.writeFile(path.join(process.cwd(), 'prompt-config.json'), JSON.stringify(json, null, 2), 'utf8'); } catch {}

            return res.status(200).json(json);
          }
        } catch (err) {
          // Falha ao obter do webhook, cai para fallback local
          console.warn('Falha ao obter prompt estruturado do webhook:', err && err.message ? err.message : err);
        }
      }

      // 2) Fallback: lê do arquivo local do projeto (em Vercel pode ser somente leitura)
      const configPath = path.join(process.cwd(), 'prompt-config.json');
      const content = await fs.readFile(configPath, 'utf8');
      const json = JSON.parse(content);
      json.metadata = {
        ...(json.metadata || {}),
        source: 'local',
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

      const fullPrompt = generateFullPrompt(promptConfig);
      try {
        await fs.writeFile('/tmp/prompt.txt', fullPrompt, 'utf8');
      } catch {}
      await fs.writeFile(path.join(process.cwd(), 'prompt.txt'), fullPrompt, 'utf8').catch(() => {});

      if (process.env.WEBHOOK_URL) {
        try {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: fullPrompt,
              prompt_structured: promptConfig,
              prompt_format: 'markdown',
              prompt_sections: Object.keys(promptConfig).filter(k => k !== 'metadata'),
              total_sections: Object.keys(promptConfig).filter(k => k !== 'metadata').length,
              prompt_stats: {
                total_characters: fullPrompt.length,
                total_words: fullPrompt.split(/\s+/).length,
                total_lines: fullPrompt.split('\n').length,
                sections_count: Object.keys(promptConfig).filter(k => k !== 'metadata').length
              },
              timestamp: new Date().toISOString()
            })
          });
        } catch {}
      }

      return res.status(200).json({ message: 'Prompt estruturado salvo com sucesso', prompt: fullPrompt });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erro ao salvar o prompt estruturado' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};


