import { autenticarToken } from '../authmidleware.js'; 
import { fechamentoDaConta } from '../models/dbModel.js'; 

// Função Serverless para a rota "fechamentoDaConta"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    const mesa = req.query.mesa;
    
      try {
        const result = await fechamentoDaConta(mesa);
        
        res.status(201).json({ message: 'busca com sucesso.', data: result });
    
      } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar', error: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}