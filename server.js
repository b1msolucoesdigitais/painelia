// Carregar variáveis de ambiente primeiro
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Carregar configurações
const config = require('./config');

const app = express();
const PORT = config.SERVER.PORT;
const HOST = config.SERVER.HOST;

// Middleware
if (config.DEVELOPMENT.ENABLE_CORS) {
  app.use(cors());
}
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, config.SECURITY.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Função para enviar webhook com retry
async function sendWebhookWithRetry(data, attempt = 1) {
  try {
    const response = await fetch(config.WEBHOOK.URL, {
      method: 'POST',
      headers: config.WEBHOOK.HEADERS,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(config.WEBHOOK.TIMEOUT)
    });

    if (response.ok) {
      if (config.LOG.WEBHOOK_LOGGING) {
        console.log(`✅ Webhook enviado com sucesso para: ${config.WEBHOOK.URL}`);
      }
      return { success: true, status: response.status, attempts: attempt };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (attempt < config.WEBHOOK.RETRY_ATTEMPTS) {
      if (config.LOG.WEBHOOK_LOGGING) {
        console.warn(`⚠️ Tentativa ${attempt} falhou, tentando novamente em ${config.WEBHOOK.RETRY_DELAY}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, config.WEBHOOK.RETRY_DELAY));
      return sendWebhookWithRetry(data, attempt + 1);
    } else {
      if (config.LOG.WEBHOOK_LOGGING) {
        console.error(`❌ Webhook falhou após ${config.WEBHOOK.RETRY_ATTEMPTS} tentativas:`, error.message);
      }
      return { success: false, error: error.message, attempts: attempt };
    }
  }
}

// Função específica para atualização de produtos
async function updateProductsWebhook(attempt = 1) {
  try {
    const productsData = {
      action: 'update_products',
      timestamp: new Date().toISOString(),
      source: 'painel-ducena-ecommerce',
      version: '2.1.0',
      request_type: 'products_sync'
    };

    console.log(`🔄 Enviando atualização de produtos para: ${config.WEBHOOK.PRODUCTS_UPDATE_URL}`);
    
    const response = await fetch(config.WEBHOOK.PRODUCTS_UPDATE_URL, {
      method: 'POST',
      headers: config.WEBHOOK.HEADERS,
      body: JSON.stringify(productsData),
      signal: AbortSignal.timeout(config.WEBHOOK.TIMEOUT)
    });

    if (response.ok) {
      const responseData = await response.json();
      if (config.LOG.WEBHOOK_LOGGING) {
        console.log(`✅ Atualização de produtos enviada com sucesso para: ${config.WEBHOOK.PRODUCTS_UPDATE_URL}`);
      }
      return { 
        success: true, 
        status: response.status, 
        attempts: attempt,
        response: responseData
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (attempt < config.WEBHOOK.RETRY_ATTEMPTS) {
      if (config.LOG.WEBHOOK_LOGGING) {
        console.warn(`⚠️ Tentativa ${attempt} de atualização de produtos falhou, tentando novamente em ${config.WEBHOOK.RETRY_DELAY}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, config.WEBHOOK.RETRY_DELAY));
      return updateProductsWebhook(attempt + 1);
    } else {
      if (config.LOG.WEBHOOK_LOGGING) {
        console.error(`❌ Atualização de produtos falhou após ${config.WEBHOOK.RETRY_ATTEMPTS} tentativas:`, error.message);
      }
      return { success: false, error: error.message, attempts: attempt };
    }
  }
}

// Rota de logout
app.post('/api/auth/logout', (req, res) => {
  // Em um sistema JWT stateless, o logout é feito no frontend
  // removendo o token do localStorage
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota para limpar cache/sessão
app.post('/api/auth/clear-session', (req, res) => {
  res.json({ 
    message: 'Sessão limpa com sucesso',
    timestamp: new Date().toISOString(),
    instructions: 'Limpe o localStorage do navegador'
  });
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    if (password.length < config.AUTH.PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `Senha deve ter pelo menos ${config.AUTH.PASSWORD_MIN_LENGTH} caracteres` });
    }

    // Ler arquivo de autenticação
    const authData = JSON.parse(await fs.readFile(path.join(__dirname, config.FILES.AUTH_FILE), 'utf8'));
    const user = authData.users.find(u => u.username === username);

    if (!user) {
      if (config.LOG.AUTH_LOGGING) {
        console.warn(`⚠️ Tentativa de login com usuário inexistente: ${username}`);
      }
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha (a senha padrão é "password")
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      if (config.LOG.AUTH_LOGGING) {
        console.warn(`⚠️ Tentativa de login com senha incorreta para usuário: ${username}`);
      }
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { username: user.username }, 
      config.SECURITY.JWT_SECRET, 
      { expiresIn: config.AUTH.TOKEN_EXPIRES_IN }
    );

    if (config.LOG.AUTH_LOGGING) {
      console.log(`✅ Login bem-sucedido para usuário: ${username}`);
    }

    res.json({ token, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter configurações do painel
app.get('/api/config/panel', (req, res) => {
  try {
    const panelConfig = {
      name: config.PANEL.NAME,
      subtitle: config.PANEL.SUBTITLE,
      description: config.PANEL.DESCRIPTION,
      version: config.PANEL.VERSION,
      company: config.PANEL.COMPANY,
      logoEmoji: config.PANEL.LOGO_EMOJI,
      primaryColor: config.PANEL.THEME.PRIMARY_COLOR,
      secondaryColor: config.PANEL.THEME.SECONDARY_COLOR,
      backgroundGradient: config.PANEL.THEME.BACKGROUND_GRADIENT
    };
    
    res.json(panelConfig);
  } catch (error) {
    console.error('❌ Erro ao obter configurações do painel:', error);
    res.status(500).json({ message: 'Erro ao obter configurações do painel' });
  }
});

// Rota para obter o prompt (compatibilidade)
app.get('/api/prompt/structured', authenticateToken, async (req, res) => {
  try {
    const configPath = path.join(__dirname, config.FILES.PROMPT_CONFIG_FILE);
    const content = await fs.readFile(configPath, 'utf8');
    const promptConfig = JSON.parse(content);
    
    // Atualizar metadata
    promptConfig.metadata.lastUpdated = new Date().toISOString();
    
    res.json(promptConfig);
  } catch (error) {
    console.error('❌ Erro ao ler prompt estruturado:', error);
    res.status(500).json({ message: 'Erro ao ler o prompt estruturado' });
  }
});

// Rota para salvar o prompt estruturado
app.post('/api/prompt/structured', authenticateToken, async (req, res) => {
  try {
    const promptConfig = req.body;

    if (!promptConfig || typeof promptConfig !== 'object') {
      return res.status(400).json({ message: 'Configuração do prompt é obrigatória' });
    }

    // Validar estrutura básica (todas as 13 seções)
    const requiredSections = [
      'current_date',
      'greeting',
      'personality',
      'context',
      'role_objective',
      'actions',
      'product_search',
      'handoff',
      'restrictions',
      'essential_rules',
      'settings',
      'examples',
      'closing'
    ];
    for (const section of requiredSections) {
      if (!promptConfig[section] || !promptConfig[section].content) {
        return res.status(400).json({ message: `Seção '${section}' é obrigatória` });
      }
    }

    // Atualizar metadata
    promptConfig.metadata = {
      ...promptConfig.metadata,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.username
    };

    const configPath = path.join(__dirname, config.FILES.PROMPT_CONFIG_FILE);
    
    // Salvar configuração estruturada
    await fs.writeFile(configPath, JSON.stringify(promptConfig, null, 2), 'utf8');
    console.log(`✅ Prompt estruturado salvo em: ${config.FILES.PROMPT_CONFIG_FILE}`);

    // Gerar prompt completo para compatibilidade
    const fullPrompt = generateFullPrompt(promptConfig);
    const promptPath = path.join(__dirname, config.FILES.PROMPT_FILE);
    await fs.writeFile(promptPath, fullPrompt, 'utf8');
    console.log(`✅ Prompt completo gerado em: ${config.FILES.PROMPT_FILE}`);

    // Enviar para webhook configurado
    const webhookData = {
      prompt: fullPrompt,
      prompt_structured: promptConfig,
      prompt_format: 'markdown',
      prompt_sections: Object.keys(promptConfig).filter(key => key !== 'metadata'),
      total_sections: Object.keys(promptConfig).filter(key => key !== 'metadata').length,
      prompt_stats: {
        total_characters: fullPrompt.length,
        total_words: fullPrompt.split(/\s+/).length,
        total_lines: fullPrompt.split('\n').length,
        sections_count: Object.keys(promptConfig).filter(key => key !== 'metadata').length
      },
      timestamp: new Date().toISOString(),
      user: req.user.username,
      source: 'painel-ducena-ecommerce',
      version: '2.1.0'
    };

    // Enviar webhook e aguardar resultado
    const webhookResult = await sendWebhookWithRetry(webhookData);

    if (webhookResult.success) {
      console.log(`✅ Webhook enviado com sucesso para: ${config.WEBHOOK.URL}`);
    } else {
      console.warn(`⚠️ Webhook falhou após ${webhookResult.attempts} tentativas:`, webhookResult.error);
    }

    // Preparar resposta
    const response = {
      message: 'Prompt estruturado salvo com sucesso',
      local_save: true,
      prompt_generated: true,
      webhook: {
        url: config.WEBHOOK.URL,
        success: webhookResult.success,
        status: webhookResult.status || 'N/A',
        attempts: webhookResult.attempts || 1
      },
      timestamp: webhookData.timestamp
    };

    // Adicionar informações de erro se o webhook falhou
    if (!webhookResult.success) {
      response.webhook.error = webhookResult.error;
      response.webhook.message = `Webhook falhou após ${webhookResult.attempts} tentativas`;
    }

    res.json(response);
  } catch (error) {
    console.error('❌ Erro ao salvar prompt estruturado:', error);
    res.status(500).json({ message: 'Erro ao salvar o prompt estruturado' });
  }
});

// Função para gerar prompt completo a partir da configuração estruturada
function generateFullPrompt(promptConfig) {
  let fullPrompt = '';
  
  // Helper para remover emojis dos títulos
  const sanitizeTitle = (title) => {
    return (title || '').replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\uFE0F]/gu, '').trim();
  };
  
  // Cabeçalho principal (sem metadados visíveis)
  fullPrompt += `# 🤖 **AGENTE DUCENA - ASSISTENTE DE VENDAS**\n\n`;

  // 1: Data Atual
  fullPrompt += `## **${sanitizeTitle(promptConfig.current_date.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.current_date.content || ''}\n\n`;

  // 2: Saudação Inicial
  fullPrompt += `## **${sanitizeTitle(promptConfig.greeting.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.greeting.content}\n\n`;

  // 3: Personalidade
  fullPrompt += `## **${sanitizeTitle(promptConfig.personality.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.personality.content}\n\n`;

  // 4: Contexto da Empresa
  fullPrompt += `## **${sanitizeTitle(promptConfig.context.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.context.content}\n\n`;

  // 5: Função e Objetivo
  fullPrompt += `## **${sanitizeTitle(promptConfig.role_objective.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.role_objective.content}\n\n`;

  // 6: Ações Principais
  fullPrompt += `## **${sanitizeTitle(promptConfig.actions.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.actions.content}\n\n`;

  // 7: Busca de Produtos
  fullPrompt += `## **${sanitizeTitle(promptConfig.product_search.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.product_search.content}\n\n`;

  // 8: Transferência de Atendimento
  fullPrompt += `## **${sanitizeTitle(promptConfig.handoff.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.handoff.content}\n\n`;

  // 9: Restrições e Limites
  fullPrompt += `## **${sanitizeTitle(promptConfig.restrictions.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.restrictions.content}\n\n`;

  // 10: Regras Essenciais
  fullPrompt += `## **${sanitizeTitle(promptConfig.essential_rules.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.essential_rules.content}\n\n`;

  // 11: Configurações Específicas
  fullPrompt += `## **${sanitizeTitle(promptConfig.settings.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.settings.content}\n\n`;

  // 12: Exemplos de Respostas
  fullPrompt += `## **${sanitizeTitle(promptConfig.examples.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.examples.content}\n\n`;

  // 13: Encerramento
  fullPrompt += `## **${sanitizeTitle(promptConfig.closing.title).toUpperCase()}**\n\n`;
  fullPrompt += `${promptConfig.closing.content}\n\n`;
  // Removidos rodapé/instrução final e metadados conforme solicitado

  return fullPrompt;
}

// Rota para atualizar produtos
app.post('/api/products/update', authenticateToken, async (req, res) => {
  try {
    console.log(`🔄 Iniciando atualização de produtos solicitada por: ${req.user.username}`);
    
    // Enviar webhook de atualização de produtos
    const webhookResult = await updateProductsWebhook();

    if (webhookResult.success) {
      console.log(`✅ Atualização de produtos concluída com sucesso`);
      
      res.json({
        success: true,
        message: 'Produtos atualizados com sucesso!',
        webhook: {
          url: config.WEBHOOK.PRODUCTS_UPDATE_URL,
          success: true,
          status: webhookResult.status,
          attempts: webhookResult.attempts,
          response: webhookResult.response
        },
        timestamp: new Date().toISOString(),
        requestedBy: req.user.username
      });
    } else {
      console.warn(`⚠️ Falha na atualização de produtos após ${webhookResult.attempts} tentativas`);
      
      res.status(500).json({
        success: false,
        message: `Erro ao atualizar produtos: ${webhookResult.error}`,
        webhook: {
          url: config.WEBHOOK.PRODUCTS_UPDATE_URL,
          success: false,
          error: webhookResult.error,
          attempts: webhookResult.attempts
        },
        timestamp: new Date().toISOString(),
        requestedBy: req.user.username
      });
    }
  } catch (error) {
    console.error('❌ Erro na rota de atualização de produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar produtos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de teste do webhook
app.post('/webhook', (req, res) => {
  console.log('🔗 Webhook de teste recebido:', req.body);
  res.json({ 
    message: 'Webhook de teste recebido com sucesso',
    timestamp: new Date().toISOString(),
    config: {
      webhook_url: config.WEBHOOK.URL,
      retry_attempts: config.WEBHOOK.RETRY_ATTEMPTS,
      timeout: config.WEBHOOK.TIMEOUT
    }
  });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    config: {
      port: PORT,
      host: HOST,
      webhook_url: config.WEBHOOK.URL,
      jwt_expires_in: config.SECURITY.JWT_EXPIRES_IN,
      log_level: config.LOG.LEVEL
    }
  });
});

// Rota de configuração (somente em desenvolvimento)
if (config.DEVELOPMENT.VERBOSE_LOGGING) {
  app.get('/api/config', (req, res) => {
    res.json({
      server: config.SERVER,
      webhook: {
        url: config.WEBHOOK.URL,
        timeout: config.WEBHOOK.TIMEOUT,
        retry_attempts: config.WEBHOOK.RETRY_ATTEMPTS
      },
      security: {
        jwt_expires_in: config.SECURITY.JWT_EXPIRES_IN
      },
      files: config.FILES
    });
  });
}

// Rota especial para limpar cache
app.get('/clear-cache', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Limpar Cache - Painel IA</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            h1 {
                color: #374151;
                margin-bottom: 20px;
                font-size: 2rem;
            }
            p {
                color: #6b7280;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .button {
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin: 10px;
                transition: all 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .success {
                background: #10b981;
            }
            .warning {
                background: #f59e0b;
            }
            .status {
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
                font-weight: 600;
            }
            .status.success {
                background: #d1fae5;
                color: #065f46;
            }
            .status.error {
                background: #fee2e2;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧹 Limpeza de Cache</h1>
            <p>Esta página ajuda a limpar o cache e dados de sessão do navegador para resolver problemas de autenticação.</p>
            
            <button class="button" onclick="clearLocalStorage()">Limpar localStorage</button>
            <button class="button warning" onclick="clearAllData()">Limpar Tudo</button>
            <button class="button success" onclick="goToLogin()">Ir para Login</button>
            
            <div id="status"></div>
        </div>

        <script>
            function showStatus(message, type = 'success') {
                const status = document.getElementById('status');
                status.textContent = message;
                status.className = 'status ' + type;
            }

            function clearLocalStorage() {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                    showStatus('✅ localStorage e sessionStorage limpos com sucesso!');
                } catch (error) {
                    showStatus('❌ Erro ao limpar localStorage: ' + error.message, 'error');
                }
            }

            function clearAllData() {
                try {
                    // Limpar localStorage
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Tentar limpar cookies (se possível)
                    document.cookie.split(";").forEach(function(c) { 
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                    });
                    
                    showStatus('✅ Todos os dados de sessão foram limpos!');
                } catch (error) {
                    showStatus('❌ Erro ao limpar dados: ' + error.message, 'error');
                }
            }

            function goToLogin() {
                window.location.href = '/';
            }

            // Verificar se há dados no localStorage
            window.onload = function() {
                const hasData = localStorage.length > 0 || sessionStorage.length > 0;
                if (hasData) {
                    showStatus('⚠️ Dados encontrados no navegador. Recomenda-se limpar.', 'warning');
                } else {
                    showStatus('✅ Nenhum dado de sessão encontrado.', 'success');
                }
            };
        </script>
    </body>
    </html>
  `);
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Rota para servir o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log('🚀 ========================================');
  console.log('🚀 PAINEL ADMINISTRATIVO DE IA INICIADO');
  console.log('🚀 ========================================');
  console.log(`🌐 Frontend: http://${HOST}:${PORT}`);
  console.log(`🔗 Webhook Principal: ${config.WEBHOOK.URL}`);
  console.log(`🔄 Webhook Produtos: ${config.WEBHOOK.PRODUCTS_UPDATE_URL}`);
  console.log(`🔐 Credenciais padrão: admin / password`);
  console.log(`📝 Para desenvolvimento: npm run build && npm start`);
  console.log(`⚙️ Configurações carregadas de: config.js`);
  console.log(`📊 Log level: ${config.LOG.LEVEL}`);
  console.log(`🔄 Retry attempts: ${config.WEBHOOK.RETRY_ATTEMPTS}`);
  console.log('🚀 ========================================');
});
