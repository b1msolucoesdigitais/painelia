# 🚀 Instruções Rápidas - Painel Administrativo de IA

## ⚡ Execução Super Simples

### Comando Único
```bash
npm install
npm run dev
```

**🎉 Pronto!** Tudo rodando em http://localhost:3000

## 🌐 URLs de Acesso

- **Aplicação**: http://localhost:3000
- **Webhook**: http://localhost:3000/webhook

## 🔐 Login Padrão

- **Usuário**: `admin`
- **Senha**: `password`

## 📝 Como Usar

1. **Acesse** http://localhost:3000
2. **Faça login** com as credenciais acima
3. **Edite** o prompt no textarea
4. **Clique em "Salvar"** para:
   - Salvar localmente no arquivo `prompt.txt`
   - Enviar para o webhook configurável

## 🔧 Funcionalidades

- ✅ Autenticação segura com JWT
- ✅ Editor de prompt responsivo
- ✅ Salvamento automático em arquivo local
- ✅ Envio para webhook configurável
- ✅ Interface moderna com Tailwind CSS
- ✅ Validação de formulários
- ✅ Feedback visual em tempo real
- ✅ **🎯 SERVIDOR ÚNICO** - tudo roda junto!

## 🚨 Solução de Problemas

### Erro ao iniciar
- Verifique se a porta 3000 está livre
- Execute `npm install` na pasta raiz
- Verifique se Node.js está instalado

### Erro de autenticação
- Use as credenciais padrão: admin/password
- Verifique se o servidor está rodando

## 📁 Arquivos Importantes

- `prompt.txt` - Prompt atual da IA
- `auth.json` - Usuários e senhas
- `server.js` - Servidor principal (backend + frontend)
- `src/components/` - Componentes React

## 🎯 Próximos Passos

1. **Personalize** o prompt inicial em `prompt.txt`
2. **Configure** o webhook para sua URL desejada
3. **Adicione** novos usuários em `auth.json`
4. **Customize** a interface no frontend

## 🚀 Vantagens da Nova Arquitetura

- **✅ Um comando**: `npm run dev` roda tudo
- **✅ Uma porta**: Tudo em localhost:3000
- **✅ Um servidor**: Frontend e backend integrados
- **✅ Sem pastas desnecessárias**: Tudo na raiz
- **✅ Build automático**: Vite build + servidor Express
- **✅ Super simples**: Estrutura unificada

## 🔧 Como Funciona

1. **`npm run dev`** executa:
   - `npm run build` (cria pasta `dist` com frontend)
   - `npm start` (inicia servidor Express)
2. **Servidor Express** serve:
   - APIs do backend (`/api/*`)
   - Arquivos estáticos do frontend (`dist/`)
3. **Tudo roda** na porta 3000

---

**🎉 Sistema funcionando! Acesse http://localhost:3000 para começar.**

**⚡ Agora é só `npm run dev` e está tudo rodando!**
