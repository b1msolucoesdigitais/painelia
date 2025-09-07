// ========================================
// CONFIGURAÇÕES DO PAINEL ADMINISTRATIVO DE IA
// ========================================
// 
// AJUSTE ESTAS CONFIGURAÇÕES CONFORME NECESSÁRIO
// PARA REPLICAR O SISTEMA EM OUTROS AMBIENTES

module.exports = {
  // ========================================
  // CONFIGURAÇÕES DO SERVIDOR
  // ========================================
  SERVER: {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost'
  },

  // ========================================
  // CONFIGURAÇÕES DE SEGURANÇA
  // ========================================
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao',
    JWT_EXPIRES_IN: '24h'
  },

  // ========================================
  // CONFIGURAÇÕES DE ARQUIVOS
  // ========================================
  FILES: {
    AUTH_FILE: './auth.json',
    PROMPT_FILE: './prompt.txt',
    PROMPT_CONFIG_FILE: './prompt-config.json'
  },

  // ========================================
  // CONFIGURAÇÕES DE WEBHOOK
  // ========================================
  WEBHOOK: {
    // URL do webhook principal - AJUSTE AQUI!
    URL: process.env.WEBHOOK_URL || 'https://whook.b1m.digital/webhook/e39a7b9a-c4ee-4f9e-b22d-5522baf57692',
    
    // URL para atualização de produtos - AJUSTE AQUI!
    PRODUCTS_UPDATE_URL: process.env.PRODUCTS_WEBHOOK_URL || 'https://whook.b1m.digital/webhook/ducena-atualiza-produtos',
    
    // Headers personalizados para o webhook
    HEADERS: {
      'Content-Type': 'application/json',
      'User-Agent': 'Painel-IA-Admin/1.0.0'
    },
    
    // Timeout para requisições do webhook (ms)
    TIMEOUT: 10000,
    
    // Tentativas de reenvio em caso de falha
    RETRY_ATTEMPTS: 3,
    
    // Delay entre tentativas (ms)
    RETRY_DELAY: 1000
  },

  // ========================================
  // CONFIGURAÇÕES DE LOG
  // ========================================
  LOG: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    WEBHOOK_LOGGING: true, // Log das chamadas de webhook
    AUTH_LOGGING: true      // Log de tentativas de autenticação
  },

  // ========================================
  // CONFIGURAÇÕES DE AUTENTICAÇÃO
  // ========================================
  AUTH: {
    // Tempo de expiração do token (padrão: 24h)
    TOKEN_EXPIRES_IN: '24h',
    
    // Configurações de senha
    PASSWORD_MIN_LENGTH: 6,
    
    // Rate limiting para tentativas de login
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_TIMEOUT: 15 * 60 * 1000 // 15 minutos
  },

  // ========================================
  // CONFIGURAÇÕES DE DESENVOLVIMENTO
  // ========================================
  DEVELOPMENT: {
    // Habilitar CORS em desenvolvimento
    ENABLE_CORS: true,
    
    // Logs detalhados em desenvolvimento
    VERBOSE_LOGGING: process.env.NODE_ENV !== 'production',
    
    // Hot reload (se aplicável)
    HOT_RELOAD: false
  },

  // ========================================
  // CONFIGURAÇÕES DE PERSONALIZAÇÃO
  // ========================================
  PANEL: {
    NAME: process.env.PANEL_NAME || 'Painel Ducena - Agente de Vendas',
    SUBTITLE: process.env.PANEL_SUBTITLE || 'Gerenciador de Prompts para E-commerce',
    DESCRIPTION: process.env.PANEL_DESCRIPTION || 'Configure e gerencie prompts do agente de atendimento da Ducena',
    VERSION: process.env.PANEL_VERSION || '2.1.0',
    COMPANY: process.env.PANEL_COMPANY || 'Ducena',
    LOGO_EMOJI: process.env.PANEL_LOGO_EMOJI || '💎',
    THEME: {
      PRIMARY_COLOR: process.env.PANEL_PRIMARY_COLOR || 'pink',
      SECONDARY_COLOR: process.env.PANEL_SECONDARY_COLOR || 'purple',
      BACKGROUND_GRADIENT: process.env.PANEL_BACKGROUND_GRADIENT || 'from-pink-50 to-purple-100'
    }
  }
};

// ========================================
// INSTRUÇÕES DE USO
// ========================================
// 
// 1. WEBHOOK: Altere a URL em WEBHOOK.URL
// 2. PORTA: Altere SERVER.PORT se necessário
// 3. SEGURANÇA: Mude JWT_SECRET em produção
// 4. ARQUIVOS: Ajuste caminhos dos arquivos se necessário
// 
// Para usar variáveis de ambiente:
// - WEBHOOK_URL=https://seu-webhook.com
// - PORT=8080
// - JWT_SECRET=sua_chave_secreta
// - LOG_LEVEL=debug
//
// ========================================
