import { autenticarToken } from '../authmidleware.js'; 
import { listarUsuarios } from '../models/dbModel.js'; 

// Função Serverless para a rota "Listar Usuario"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    try {
        const usuarios = await listarUsuarios();
        res.status(200).json(usuarios);

      } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}