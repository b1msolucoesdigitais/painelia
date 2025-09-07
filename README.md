# 🤖 Painel Administrativo de IA

Um painel administrativo moderno e profissional para gerenciar prompts de IA de forma estruturada e organizada.

## ✨ **Novidades na Versão 2.0**

### 🎯 **Editor Estruturado**
- **6 seções organizadas** por função
- **Interface moderna** com Tailwind CSS
- **Validação automática** de campos obrigatórios
- **Geração automática** do prompt completo
- **Compatibilidade** com sistema anterior

### 🔧 **Seções do Prompt**
1. **🎭 Personalidade** - Como a IA deve se comportar
2. **📋 Contexto** - Informações específicas do domínio
3. **⚡ Ações** - O que a IA deve fazer
4. **🔍 Busca de Produtos** - Ações específicas para buscar informações sobre produtos da empresa
5. **🚫 Restrições** - Limitações e regras
6. **💡 Exemplos** - Casos de uso específicos
7. **🔧 Configurações** - Parâmetros técnicos

## 🚀 **Características**

- **🔐 Autenticação JWT** com bcrypt
- **📁 Armazenamento local** (sem banco de dados)
- **🌐 Webhook automático** para n8n/outros sistemas
- **📱 Interface responsiva** e moderna
- **⚡ Sistema híbrido** (estruturado + simples)
- **🔄 Retry automático** para webhooks
- **📊 Logs detalhados** e troubleshooting

## 🛠️ **Tecnologias**

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Autenticação**: JWT + bcrypt
- **Estilização**: Tailwind CSS + CSS customizado

## 📦 **Instalação**

```bash
# Clonar o repositório
git clone <seu-repositorio>
cd painelia

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev
```

## ⚙️ **Configuração**

### **Arquivo `config.js`**
```javascript
module.exports = {
  SERVER: {
    PORT: 3000,
    HOST: 'localhost'
  },
  WEBHOOK: {
    URL: 'https://seu-webhook.com/endpoint',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  },
  SECURITY: {
    JWT_SECRET: 'sua_chave_secreta_aqui'
  }
};
```

### **Variáveis de Ambiente (`.env`)**
```bash
PORT=3000
HOST=localhost
JWT_SECRET=sua_chave_secreta_aqui
WEBHOOK_URL=https://seu-webhook.com/endpoint
```

## 🎮 **Como Usar**

### **1. Login**
- Usuário padrão: `admin`
- Senha padrão: `password`
- Credenciais configuráveis em `auth.json`

### **2. Editor Estruturado**
- **7 campos organizados** por função
- **Validação automática** de conteúdo
- **Geração automática** do prompt completo
- **Interface moderna** e intuitiva

### **3. Personalização**
- **Nome do painel** configurável via `config.js` ou variáveis de ambiente
- **Cores e tema** personalizáveis
- **Logo e branding** customizáveis
- **Subtítulo** ajustável

## 📁 **Estrutura de Arquivos**

```
painelia/
├── src/
│   ├── components/
│   │   ├── Login.jsx                 # Tela de login
│   │   ├── PromptEditor.jsx          # Editor simples (legado)
│   │   └── StructuredPromptEditor.jsx # Editor estruturado (novo)
│   ├── App.jsx                       # App principal com toggle
│   └── index.css                     # Estilos Tailwind + customizados
├── server.js                         # Servidor Express
├── config.js                         # Configurações centralizadas
├── prompt-config.json                # Prompt estruturado
├── prompt.txt                        # Prompt completo (gerado)
├── auth.json                         # Usuários e senhas
└── package.json                      # Dependências e scripts
```

## 🔄 **APIs Disponíveis**

### **Autenticação**
- `POST /api/auth/login` - Login de usuário

### **Prompt Simples (Legado)**
- `GET /api/prompt` - Obter prompt completo
- `POST /api/prompt` - Salvar prompt completo

### **Prompt Estruturado (Novo)**
- `GET /api/prompt/structured` - Obter configuração estruturada
- `POST /api/prompt/structured` - Salvar configuração estruturada

### **Webhook**
- `POST /webhook` - Endpoint para receber dados

## 🌐 **Webhook**

O sistema envia automaticamente para o webhook configurado:

```json
{
  "prompt": "prompt_completo_gerado",
  "prompt_structured": {
    "personality": { "content": "..." },
    "context": { "content": "..." },
    "actions": { "content": "..." },
    "restrictions": { "content": "..." },
    "examples": { "content": "..." },
    "settings": { "content": "..." }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "user": "admin",
  "source": "painel-ia-admin",
  "version": "2.0.0"
}
```

## 🎨 **Interface Moderna**

- **🎨 Gradientes** e sombras elegantes
- **📱 Responsivo** para todos os dispositivos
- **⚡ Animações** suaves e transições
- **🎯 Cards organizados** por seção
- **🔍 Contador de caracteres** em tempo real
- **💾 Botão de salvamento** com feedback visual
- **📊 Metadata** do sistema visível

## 🚀 **Execução**

```bash
# Desenvolvimento (build + start)
npm run dev

# Apenas build
npm run build

# Apenas start
npm start

# Instalação automática
./start.sh
```

## 🔧 **Personalização**

### **Cores e Temas**
- Editar `src/index.css` para cores customizadas
- Modificar `tailwind.config.js` para temas
- Adicionar classes CSS personalizadas

### **Seções do Prompt**
- Editar `prompt-config.json` para novas seções
- Modificar `server.js` para validação customizada
- Ajustar `StructuredPromptEditor.jsx` para layout

### **Webhook e Integrações**
- Configurar `config.js` para novos endpoints
- Adicionar headers customizados
- Implementar novos formatos de dados

## 📊 **Monitoramento**

- **Logs detalhados** no console
- **Status do webhook** em tempo real
- **Tentativas de retry** visíveis
- **Erros e troubleshooting** automático
- **Metadata** do sistema sempre atualizada

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

- **Issues**: Abra uma issue no GitHub
- **Documentação**: Consulte este README
- **Configuração**: Veja `CONFIGURACAO.md`
- **Instruções**: Consulte `INSTRUCOES.md`

---

**🎉 Transforme seu painel de IA em algo realmente profissional!**
