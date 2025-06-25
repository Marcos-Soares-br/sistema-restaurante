import { autenticarToken } from '../authmidleware.js'; 
import { obterMesasAtivas } from '../models/dbModel.js'; 

// Função Serverless para a rota ""
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    try {
        const mesas = await obterMesasAtivas();
        res.status(200).json(mesas);
        
      } catch (error) {
        console.error('Erro ao obter mesas:', error);
        res.status(500).json({ error: 'Erro ao obter mesas', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}