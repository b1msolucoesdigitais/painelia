const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'sua_chave_secreta_aqui_mude_em_producao';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    // Ler arquivo de autenticação
    const authData = JSON.parse(await fs.readFile(path.join(__dirname, 'auth.json'), 'utf8'));
    const user = authData.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha (a senha padrão é "password")
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter o prompt
app.get('/api/prompt', authenticateToken, async (req, res) => {
  try {
    const promptPath = path.join(__dirname, 'prompt.txt');
    const content = await fs.readFile(promptPath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('Erro ao ler prompt:', error);
    res.status(500).json({ message: 'Erro ao ler o prompt' });
  }
});

// Rota para salvar o prompt
app.post('/api/prompt', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Conteúdo do prompt é obrigatório' });
    }

    const promptPath = path.join(__dirname, 'prompt.txt');
    
    // Salvar no arquivo local
    await fs.writeFile(promptPath, content, 'utf8');

    // Enviar para webhook (simulação)
    try {
      const webhookUrl = process.env.WEBHOOK_URL || `http://localhost:${PORT}/webhook`;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content,
          timestamp: new Date().toISOString(),
          user: req.user.username
        }),
      });
    } catch (webhookError) {
      console.warn('Webhook não pôde ser chamado:', webhookError.message);
      // Não falha a operação se o webhook falhar
    }

    res.json({ message: 'Prompt salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar prompt:', error);
    res.status(500).json({ message: 'Erro ao salvar o prompt' });
  }
});

// Rota de teste do webhook
app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', req.body);
  res.json({ message: 'Webhook recebido com sucesso' });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos do frontend (após build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor integrado rodando na porta ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🔐 Credenciais padrão: admin / password`);
});
