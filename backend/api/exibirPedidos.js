import { autenticarToken } from '../authmidleware.js'; 
import { exibirPedidos } from '../models/dbModel.js'; 

// Função Serverless para a rota "exibirPedidos"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    const setor = req.query.setor;
    
      try {
        const result = await exibirPedidos(setor);
        
        res.status(201).json({ message: 'Pedidos buscados com sucesso.', data: result });
    
      } catch (error) {
        res.status(500).json({ message: 'Erro ao exibir pedidos', error: error.message });
      }
  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}