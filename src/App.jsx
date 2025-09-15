import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import StructuredPromptEditor from './components/StructuredPromptEditor';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar se o token é válido fazendo uma requisição de teste
      fetch('/api/config/panel')
        .then(response => {
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Token inválido, remover do localStorage
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          // Erro de conexão, remover token
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    // Após autenticar, aciona o carregamento do prompt estruturado no backend
    try {
      await fetch('/api/prompt/structured', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } catch {}
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <StructuredPromptEditor onLogout={handleLogout} />
    </div>
  );
}

export default App;
