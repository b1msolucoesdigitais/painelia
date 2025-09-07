#!/bin/bash

echo "🚀 Iniciando Painel Administrativo de IA (Versão Simplificada)..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo ""
echo "✅ Dependências instaladas com sucesso!"
echo ""
echo "🚀 Para executar o projeto:"
echo ""
echo "npm run dev"
echo ""
echo "🌐 URL de acesso:"
echo "   http://localhost:3000"
echo ""
echo "🔐 Credenciais padrão:"
echo "   Usuário: admin"
echo "   Senha:  password"
echo ""
echo "🎯 Execute 'npm run dev' para iniciar!"
echo ""
echo "⚡ Agora tudo roda em um único comando na raiz!"
