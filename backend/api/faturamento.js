import { autenticarToken } from '../authmidleware.js'; 
import { faturamento } from '../models/dbModel.js'; 

// Função Serverless para a rota "faturamento"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'GET') {
    try {
        const fat = await faturamento();
        res.status(200).json(fat);
    
      } catch (error) {
        console.error('Erro ao buscar faturamento:', error);
        res.status(500).json({ error: 'Erro ao buscar faturamento:', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}