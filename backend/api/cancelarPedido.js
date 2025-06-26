import corsMiddleware from '../corsConfig.js';
import { autenticarToken } from '../authmidleware.js'; 
import { cancelarPedido } from '../models/dbModel.js'; 

// Função Serverless para a rota "cancelarPedido"
export default async function handler(req, res) {
  corsMiddleware(req, res, () => {});
  
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { id } = req.body;
    
        if (!id) {
          return res.status(400).json({ error: 'O id é obrigatório.' });
        }
    
        const result = await cancelarPedido(id);
    
        res.status(201).json({ message: 'Pedido cancelado com sucesso.', data: result });

      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ error: 'Erro ao cancelar pedido', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}