function autorizarNivel(...niveisPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario || !niveisPermitidos.includes(usuario.nivel)) {
      return res.status(403).json({ mensagem: 'Acesso negado: nível insuficiente.' });
    }

    next();
  };
}

module.exports = autorizarNivel;
