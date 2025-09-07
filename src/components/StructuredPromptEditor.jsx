import React, { useState, useEffect } from 'react';

const StructuredPromptEditor = ({ onLogout }) => {
  const [promptConfig, setPromptConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [panelConfig, setPanelConfig] = useState({
    name: 'Painel Ducena - Agente de Vendas',
    subtitle: 'Gerenciador de Prompts para E-commerce',
    logoEmoji: '💎',
    primaryColor: 'pink',
    secondaryColor: 'purple',
    backgroundGradient: 'from-pink-50 to-purple-100'
  });

  useEffect(() => {
    loadPromptConfig();
    loadPanelConfig();
  }, []);

  const loadPanelConfig = async () => {
    try {
      const response = await fetch('/api/config/panel');
      if (response.ok) {
        const config = await response.json();
        setPanelConfig(config);
      }
    } catch (error) {
      console.log('Usando configurações padrão do painel');
    }
  };

  const loadPromptConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompt/structured', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromptConfig(data);
      } else {
        throw new Error('Erro ao carregar configuração do prompt');
      }
    } catch (error) {
      console.error('Erro ao carregar prompt:', error);
      setMessage('Erro ao carregar configuração do prompt');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/prompt/structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(promptConfig)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Prompt estruturado salvo com sucesso!');
        setMessageType('success');
      } else {
        throw new Error(data.message || 'Erro ao salvar prompt');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage(`❌ Erro ao salvar: ${error.message}`);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProducts = async () => {
    try {
      setUpdatingProducts(true);
      setMessage('🔄 Atualizando produtos... Aguarde...');
      setMessageType('info');

      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('✅ Produtos atualizados com sucesso!');
        setMessageType('success');
      } else {
        throw new Error(data.message || 'Erro ao atualizar produtos');
      }
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      setMessage(`❌ Erro ao atualizar produtos: ${error.message}`);
      setMessageType('error');
    } finally {
      setUpdatingProducts(false);
    }
  };

  const handleSectionChange = (sectionKey, content) => {
    setPromptConfig(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content
      }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${panelConfig.backgroundGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuração do prompt...</p>
        </div>
      </div>
    );
  }

  if (!promptConfig) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${panelConfig.backgroundGradient} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar configuração do prompt</p>
          <button
            onClick={loadPromptConfig}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${panelConfig.backgroundGradient}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r from-${panelConfig.primaryColor}-500 to-${panelConfig.secondaryColor}-600 rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{panelConfig.logoEmoji}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{panelConfig.name}</h1>
                <p className="text-sm text-gray-500">{panelConfig.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logado como: <span className="font-medium text-gray-900">admin</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            messageType === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            messageType === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
            'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Configuração do Prompt</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleUpdateProducts}
              disabled={updatingProducts || saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border-2 border-blue-500"
            >
              {updatingProducts ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Atualizar Produtos</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || updatingProducts}
              className="bg-gradient-to-r from-pink-700 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-pink-800 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border-2 border-pink-600"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Salvar Configuração</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personalidade */}
          <PromptSection
            section={promptConfig.personality}
            onChange={(content) => handleSectionChange('personality', content)}
            className="lg:col-span-2"
          />

          {/* Contexto */}
          <PromptSection
            section={promptConfig.context}
            onChange={(content) => handleSectionChange('context', content)}
          />

          {/* Ações */}
          <PromptSection
            section={promptConfig.actions}
            onChange={(content) => handleSectionChange('actions', content)}
          />

          {/* Busca de Produtos */}
          <PromptSection
            section={promptConfig.product_search}
            onChange={(content) => handleSectionChange('product_search', content)}
            className="lg:col-span-2"
            highlight={true}
          />

          {/* Restrições e Exemplos lado a lado */}
          <PromptSection
            section={promptConfig.restrictions}
            onChange={(content) => handleSectionChange('restrictions', content)}
          />

          <PromptSection
            section={promptConfig.examples}
            onChange={(content) => handleSectionChange('examples', content)}
          />

          {/* Configurações */}
          <PromptSection
            section={promptConfig.settings}
            onChange={(content) => handleSectionChange('settings', content)}
            className="lg:col-span-2"
          />
        </div>

        {/* Metadata */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Versão:</span>
              <span className="ml-2 font-medium text-gray-900">{promptConfig.metadata?.version || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Última atualização:</span>
              <span className="ml-2 font-medium text-gray-900">
                {promptConfig.metadata?.lastUpdated ? 
                  new Date(promptConfig.metadata.lastUpdated).toLocaleString('pt-BR') : 'N/A'
                }
              </span>
            </div>
            <div>
              <span className="text-gray-500">Seções:</span>
              <span className="ml-2 font-medium text-gray-900">{promptConfig.metadata?.totalSections || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Total de caracteres:</span>
              <span className="ml-2 font-medium text-gray-900">
                {Object.values(promptConfig)
                  .filter(section => section && typeof section === 'object' && section.content)
                  .reduce((total, section) => total + (section.content?.length || 0), 0)
                  .toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromptSection = ({ section, onChange, className = '', highlight = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className} ${
      highlight ? 'ring-2 ring-pink-200 bg-pink-50' : ''
    }`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          {section.title}
          {highlight && (
            <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full font-medium">
              NOVO
            </span>
          )}
        </h3>
        <p className="text-gray-600 text-sm">{section.description}</p>
      </div>
      
      <textarea
        value={section.content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-all duration-200"
        placeholder={`Digite o conteúdo para ${section.title.toLowerCase()}...`}
      />
      
      <div className="mt-2 text-xs text-gray-500">
        {section.content.length} caracteres
      </div>
    </div>
  );
};

export default StructuredPromptEditor;
