import { autenticarToken } from '../authmidleware.js'; 
import { registarVenda } from '../models/dbModel.js'; 

// Função Serverless para a rota ""
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { valor } = req.body;
    
        if (!valor) {
          return res.status(400).json({ error: 'Valor obrigatório.' });
        }
    
        await registarVenda(valor);
        res.status(201).json({ message: 'Venda registrada com sucesso.' });

      } catch (error) {
        console.error('Erro ao registrar venda:', error);
        res.status(500).json({ error: 'Erro ao registrar venda', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}