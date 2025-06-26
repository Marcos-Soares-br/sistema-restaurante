import corsMiddleware from '../corsConfig.js';
import { autenticarToken } from '../authmidleware.js'; 
import { qtdDasPorcoes } from '../models/dbModel.js'; 

// Função Serverless para a rota "qtdDasPorcoes"
export default async function handler(req, res) {
  corsMiddleware(req, res, () => {});

  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    try {
        const qtdPedidos = await qtdDasPorcoes();
        res.status(200).json(qtdPedidos);
    
      } catch (error) {
        console.error('Erro ao buscar a quantidade de porções:', error);
        res.status(500).json({ error: 'Erro ao buscar a quantidade de porções:', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}