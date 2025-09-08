const config = require('../../config');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const panelConfig = {
      name: config.PANEL.NAME,
      subtitle: config.PANEL.SUBTITLE,
      description: config.PANEL.DESCRIPTION,
      version: config.PANEL.VERSION,
      company: config.PANEL.COMPANY,
      logoEmoji: config.PANEL.LOGO_EMOJI,
      primaryColor: config.PANEL.THEME.PRIMARY_COLOR,
      secondaryColor: config.PANEL.THEME.SECONDARY_COLOR,
      backgroundGradient: config.PANEL.THEME.BACKGROUND_GRADIENT
    };

    return res.status(200).json(panelConfig);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erro ao obter configurações do painel' });
  }
};


