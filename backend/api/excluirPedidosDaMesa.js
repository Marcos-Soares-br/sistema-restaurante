import { autenticarToken } from '../authmidleware.js'; 
import { excluirPedidosDaMesa } from '../models/dbModel.js'; 

// Função Serverless para a rota "excluirPedidosDaMesa"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { mesa } = req.body;
    
        if ( !mesa) {
          return res.status(400).json({ error: 'Mesa obrigatória.' });
        }
    
        await excluirPedidosDaMesa(mesa);
        res.status(200).json({ message: 'Mesa encerrada com sucesso.' });

      } catch (error) {
        console.error('Erro ao encerrar mesa:', error);
        res.status(500).json({ error: 'Erro ao encerrar mesa', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}