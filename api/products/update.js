const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao');
  } catch {
    return res.status(403).json({ message: 'Token inválido' });
  }

  try {
    if (process.env.PRODUCTS_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.PRODUCTS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_products',
            timestamp: new Date().toISOString(),
            source: 'painel-ducena-ecommerce',
            version: '2.1.0'
          })
        });
        const ok = response.ok;
        const data = await response.text().catch(() => null);
        if (!ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return res.status(200).json({ success: true, message: 'Produtos atualizados com sucesso!', response: data });
      } catch (e) {
        return res.status(500).json({ success: false, message: `Erro no webhook de produtos: ${e.message}` });
      }
    }

    return res.status(200).json({ success: true, message: 'Simulação de atualização de produtos concluída.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};


