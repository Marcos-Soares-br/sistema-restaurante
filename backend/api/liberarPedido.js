import { autenticarToken } from '../authmidleware.js'; 
import { liberarPedido } from '../models/dbModel.js'; 

// Função Serverless para a rota "liberarPedido"
export default async function handler(req, res) {
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
    
        const result = await liberarPedido(id);
    
        res.status(201).json({ message: 'Pedido liberado com sucesso.', data: result });

      } catch (error) {
        console.error('Erro ao liberar pedido:', error);
        res.status(500).json({ error: 'Erro ao liberar pedido', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}