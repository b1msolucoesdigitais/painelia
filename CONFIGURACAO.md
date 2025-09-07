# ⚙️ Guia de Configuração - Painel Administrativo de IA

## 🎯 Visão Geral

Este guia explica como configurar e personalizar o Painel Administrativo de IA para diferentes ambientes e necessidades.

## 📁 Arquivos de Configuração

### 1. `config.js` - Configurações Principais
Arquivo JavaScript com todas as configurações do sistema.

### 2. `env.example` - Variáveis de Ambiente
Exemplo de arquivo `.env` para configurações sensíveis.

### 3. `auth.json` - Usuários e Senhas
Arquivo de autenticação dos usuários do sistema.

## 🔧 Configurações Principais

### 🌐 **Servidor**
```javascript
SERVER: {
  PORT: 3000,           // Porta do servidor
  HOST: 'localhost'      // Host do servidor
}
```

### 🔐 **Segurança**
```javascript
SECURITY: {
  JWT_SECRET: 'sua_chave_secreta_aqui_mude_em_producao',
  JWT_EXPIRES_IN: '24h'
}
```

### 🔗 **Webhook**
```javascript
WEBHOOK: {
  DEFAULT_URL: 'https://n8n.b1mdigital.com.br/webhook-test/583cf73b-23f3-4223-8b1e-983aa4305b37',
  URL: process.env.WEBHOOK_URL || 'https://n8n.b1mdigital.com.br/webhook-test/583cf73b-23f3-4223-8b1e-983aa4305b37',
  TIMEOUT: 10000,           // Timeout em ms
  RETRY_ATTEMPTS: 3,        // Tentativas de reenvio
  RETRY_DELAY: 1000         // Delay entre tentativas em ms
}
```

### 📝 **Arquivos**
```javascript
FILES: {
  AUTH_FILE: './auth.json',    // Arquivo de usuários
  PROMPT_FILE: './prompt.txt'  // Arquivo de prompt
}
```

### 📊 **Logs**
```javascript
LOG: {
  LEVEL: 'info',               // Nível de log
  WEBHOOK_LOGGING: true,       // Log de webhooks
  AUTH_LOGGING: true           // Log de autenticação
}
```

## 🚀 Como Configurar

### **Opção 1: Editar `config.js`**
1. Abra o arquivo `config.js`
2. Altere as configurações desejadas
3. Reinicie o servidor

### **Opção 2: Usar Variáveis de Ambiente**
1. Copie `env.example` para `.env`
2. Ajuste as variáveis no arquivo `.env`
3. As variáveis de ambiente têm prioridade sobre `config.js`

### **Opção 3: Híbrida**
Combine configurações em `config.js` com variáveis de ambiente para máxima flexibilidade.

## 🔗 Configurando o Webhook

### **Para o seu webhook específico:**

1. **Edite `config.js`:**
```javascript
WEBHOOK: {
  DEFAULT_URL: 'https://seu-webhook.com/endpoint',
  URL: process.env.WEBHOOK_URL || 'https://seu-webhook.com/endpoint',
  // ... outras configurações
}
```

2. **Ou use variável de ambiente:**
```bash
# No arquivo .env
WEBHOOK_URL=https://seu-webhook.com/endpoint
```

3. **Ou exporte a variável:**
```bash
export WEBHOOK_URL=https://seu-webhook.com/endpoint
npm run dev
```

## 🌍 Configurações por Ambiente

### **Desenvolvimento**
```javascript
DEVELOPMENT: {
  ENABLE_CORS: true,
  VERBOSE_LOGGING: true,
  HOT_RELOAD: false
}
```

### **Produção**
```javascript
DEVELOPMENT: {
  ENABLE_CORS: false,
  VERBOSE_LOGGING: false,
  HOT_RELOAD: false
}
```

## 🔐 Configurações de Segurança

### **JWT Secret**
⚠️ **IMPORTANTE**: Mude sempre em produção!

```bash
# No arquivo .env
JWT_SECRET=chave_super_secreta_e_complexa_aqui
```

### **Autenticação**
```javascript
AUTH: {
  TOKEN_EXPIRES_IN: '24h',
  PASSWORD_MIN_LENGTH: 6,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000
}
```

## 📊 Monitoramento e Logs

### **Níveis de Log**
- `error`: Apenas erros
- `warn`: Avisos e erros
- `info`: Informações gerais (padrão)
- `debug`: Informações detalhadas

### **Configurar via variável de ambiente:**
```bash
LOG_LEVEL=debug npm run dev
```

## 🔄 Replicando o Sistema

### **Passo a Passo:**

1. **Clone o projeto**
2. **Instale dependências:**
   ```bash
   npm install
   ```

3. **Configure o webhook:**
   - Edite `config.js` ou
   - Use variável de ambiente `WEBHOOK_URL`

4. **Configure a porta (se necessário):**
   - Edite `config.js` ou
   - Use variável de ambiente `PORT`

5. **Configure segurança:**
   - Mude `JWT_SECRET` em `config.js` ou
   - Use variável de ambiente `JWT_SECRET`

6. **Execute:**
   ```bash
   npm run dev
   ```

## 📋 Checklist de Configuração

- [ ] **Webhook configurado** para sua URL
- [ ] **Porta ajustada** (se necessário)
- [ ] **JWT_SECRET alterado** (em produção)
- [ ] **Logs configurados** para seu ambiente
- [ ] **CORS configurado** adequadamente
- [ ] **Arquivos de dados** em localizações corretas

## 🚨 Configurações de Produção

### **Obrigatório:**
- ✅ Mude `JWT_SECRET`
- ✅ Configure `WEBHOOK_URL`
- ✅ Ajuste `LOG_LEVEL` para `warn` ou `error`
- ✅ Desabilite `VERBOSE_LOGGING`

### **Recomendado:**
- 🔒 Use HTTPS
- 🔒 Configure firewall
- 🔒 Implemente rate limiting
- 🔒 Use variáveis de ambiente para configurações sensíveis

## 🆘 Solução de Problemas

### **Webhook não funciona:**
1. Verifique a URL em `config.js`
2. Teste a URL manualmente
3. Verifique logs do servidor
4. Confirme se o endpoint está ativo

### **Erro de autenticação:**
1. Verifique `JWT_SECRET`
2. Confirme se `auth.json` existe
3. Verifique permissões de arquivo

### **Porta em uso:**
1. Mude `PORT` em `config.js`
2. Use variável de ambiente `PORT`
3. Verifique se não há outros serviços rodando

## 📞 Suporte

Para dúvidas sobre configuração:
1. Verifique os logs do servidor
2. Teste as rotas de saúde (`/api/health`)
3. Use a rota de configuração (`/api/config`) em desenvolvimento
4. Verifique se todas as dependências estão instaladas

---

**🎯 Agora você pode configurar facilmente o sistema para qualquer ambiente!**
