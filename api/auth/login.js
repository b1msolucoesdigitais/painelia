const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    const authPath = path.join(process.cwd(), 'auth.json');
    const authData = JSON.parse(await fs.readFile(authPath, 'utf8'));
    const user = authData.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao',
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token, message: 'Login realizado com sucesso' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


