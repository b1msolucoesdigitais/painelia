// Arquivo de exemplo para configurações
// Copie este arquivo para config.js e ajuste as configurações

module.exports = {
  // Configurações do Servidor
  PORT: process.env.PORT || 3001,
  
  // Segurança
  JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao',
  
  // Webhook
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook',
  
  // Logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Arquivos
  AUTH_FILE: './auth.json',
  PROMPT_FILE: './prompt.txt'
};
