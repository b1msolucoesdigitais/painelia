# 💎 **Painel Ducena - Configuração para E-commerce**

## 🎯 **Objetivo**
Configurar o painel administrativo para gerenciar prompts do agente de atendimento/vendas da **Ducena** (www.ducena.com.br), especializada em semijoias personalizadas.

## 🚀 **Configuração Rápida**

### **1. Instalação**
```bash
# Clonar e instalar dependências
git clone <seu-repositorio>
cd painelia
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações
```

### **2. Configurações Específicas da Ducena**

#### **Arquivo `config.js`**
```javascript
PANEL: {
  NAME: 'Painel Ducena - Agente de Vendas',
  SUBTITLE: 'Gerenciador de Prompts para E-commerce',
  LOGO_EMOJI: '💎',
  PRIMARY_COLOR: 'pink',
  SECONDARY_COLOR: 'purple',
  BACKGROUND_GRADIENT: 'from-pink-50 to-purple-100'
}
```

#### **Variáveis de Ambiente (`.env`)**
```bash
PANEL_NAME=Painel Ducena - Agente de Vendas
PANEL_SUBTITLE=Gerenciador de Prompts para E-commerce
PANEL_COMPANY=Ducena
PANEL_LOGO_EMOJI=💎
PANEL_PRIMARY_COLOR=pink
PANEL_SECONDARY_COLOR=purple
PANEL_BACKGROUND_GRADIENT=from-pink-50 to-purple-100
```

### **3. Executar**
```bash
npm run dev
```

## 🔍 **Estrutura de Prompts para E-commerce**

### **Seções Configuradas:**

1. **🎭 Personalidade** - Agente de vendas da Ducena
2. **📋 Contexto da Empresa** - Especialização em semijoias personalizadas
3. **⚡ Ações Principais** - Processo de atendimento ao cliente
4. **🔍 Busca de Produtos Ducena** - Como buscar e apresentar produtos
5. **🚫 Restrições e Limites** - O que NÃO fazer
6. **💡 Exemplos de Respostas** - Casos práticos de atendimento
7. **🔧 Configurações Específicas** - Horários, políticas, contatos

## 📊 **Produtos da Ducena**

### **Arquivo de Produtos: `produtos-ducena.json`**
- **5 produtos de exemplo** incluídos
- **Estrutura completa** com preços, imagens e links
- **Categorias organizadas** (Colares, Pulseiras, Anéis)
- **Subcategorias específicas** (Românticos, Família, Amizade)

### **Campos dos Produtos:**
- `id`: Código único do produto
- `nome`: Nome completo do produto
- `categoria`: Categoria principal
- `subcategoria`: Subcategoria específica
- `preco_venda`: Preço normal
- `preco_promocao`: Preço promocional (se aplicável)
- `link_produto`: URL direta para compra
- `imagem_destaque`: URL da imagem principal
- `descricao`: Descrição detalhada
- `disponivel`: Status de disponibilidade
- `estoque`: Quantidade em estoque

## 🎨 **Tema Visual Ducena**

### **Cores:**
- **Primária**: Rosa (`pink`) - Representa delicadeza e feminilidade
- **Secundária**: Roxo (`purple`) - Representa elegância e sofisticação
- **Fundo**: Gradiente rosa para roxo (`from-pink-50 to-purple-100`)

### **Logo:**
- **Emoji**: 💎 (Diamante) - Representa joias e valor
- **Nome**: "Painel Ducena - Agente de Vendas"
- **Subtítulo**: "Gerenciador de Prompts para E-commerce"

## 🔧 **Funcionalidades Específicas**

### **Busca de Produtos:**
1. **Identificar necessidade** do cliente
2. **Buscar no catálogo** JSON
3. **Apresentar informações completas**:
   - ID, nome, preço (com lógica de promoção)
   - Link direto para compra
   - Imagem de destaque
4. **Orientar próximos passos**

### **Lógica de Preços:**
```javascript
// Se preco_promocao > 0 e < preco_venda, use preco_promocao
// Senão use preco_venda
const precoFinal = (preco_promocao > 0 && preco_promocao < preco_venda) 
  ? preco_promocao 
  : preco_venda;
```

### **Formato de Resposta:**
```
#1381 - Colar Masculino Apaixonados
- 💰 R$ 169,90
- 🔗 Link: https://www.ducena.com.br/colar-dia-dos-namorados
- 🖼️ Imagem: [URL da imagem]
```

## 📱 **Interface do Painel**

### **Header Personalizado:**
- **Logo**: 💎 (Diamante)
- **Título**: "Painel Ducena - Agente de Vendas"
- **Subtítulo**: "Gerenciador de Prompts para E-commerce"

### **Seções Organizadas:**
- **Layout responsivo** com grid adaptativo
- **Restrições e Exemplos** lado a lado
- **Busca de Produtos** destacada com badge "NOVO"
- **Tema visual** consistente com a marca

## 🚀 **Para Testar**

### **1. Acessar o Painel:**
```
http://localhost:3000
```

### **2. Login:**
- **Usuário**: `admin`
- **Senha**: `password`

### **3. Verificar Configurações:**
- **Nome do painel**: "Painel Ducena - Agente de Vendas"
- **Tema**: Rosa e roxo
- **Logo**: 💎 (Diamante)

### **4. Editar Prompts:**
- **7 seções** organizadas por função
- **Conteúdo específico** para e-commerce
- **Exemplos práticos** da Ducena

## 🔄 **Integração com Webhook**

### **Dados Enviados:**
```json
{
  "prompt": "prompt_completo_gerado",
  "prompt_structured": {
    "personality": { "content": "..." },
    "context": { "content": "..." },
    "actions": { "content": "..." },
    "product_search": { "content": "..." },
    "restrictions": { "content": "..." },
    "examples": { "content": "..." },
    "settings": { "content": "..." }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "user": "admin",
  "source": "painel-ducena-ecommerce",
  "version": "2.1.0"
}
```

## 📋 **Checklist de Configuração**

- [ ] **Painel configurado** com nome da Ducena
- [ ] **Tema visual** rosa e roxo aplicado
- [ ] **Prompts estruturados** para e-commerce
- [ ] **Arquivo de produtos** configurado
- [ ] **Webhook** configurado e testado
- [ ] **Interface testada** e funcionando
- [ ] **Login funcionando** com admin/password

## 🆘 **Suporte**

- **Documentação**: Este arquivo + README.md
- **Configuração**: `config.js` + `.env`
- **Produtos**: `produtos-ducena.json`
- **Prompts**: `prompt-config.json`

---

**💎 Transforme seu painel em uma ferramenta poderosa para o e-commerce da Ducena!**
