import corsMiddleware from '../corsConfig.js';
import { exibirCardapio } from '../models/dbModel.js';

// Função Serverless para a rota "Exibir Cardapio"
export default async function handler(req, res) {
  corsMiddleware(req, res, async () => {
    if (req.method === 'GET') {
      try {
        const cardapio = await exibirCardapio();
        return res.status(200).json(cardapio);  
      } catch (error) {
        console.error('Erro ao exibir cardápio:', error);
        return res.status(500).json({ error: 'Erro ao exibir cardápio', details: error.message });
      }
    } else {
      return res.status(405).json({ mensagem: 'Método não permitido!' });
    }
  });
}
