import { autenticarToken } from '../authmidleware.js'; 
import { registrarPedido } from '../models/dbModel.js'; 

// Função Serverless para a rota "registrarPedido"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { mesa, hora, pedido, desc } = req.body;
    
        if (!mesa || !pedido || pedido.length === 0) {
          return res.status(400).json({ error: 'Mesa e pedido são obrigatórios.' });
        }
    
        const result = await registrarPedido(mesa, hora, pedido, desc);
    
        res.status(201).json({ message: 'Pedido registrado com sucesso.', data: result });

      } catch (error) {
        console.error('Erro ao registrar pedido:', error);
        res.status(500).json({ error: 'Erro ao registrar pedido', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}