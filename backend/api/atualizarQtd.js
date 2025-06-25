import { autenticarToken } from '../authmidleware.js'; 
import { atualizarQtd } from '../models/dbModel.js'; 

// Função Serverless para a rota "atualizarQtd"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { itens } = req.body;
    
        if (!itens) {
          return res.status(400).json({ error: 'Parametro obrigatório.' });
        }
    
        await atualizarQtd(itens);
        res.status(201).json({ message: 'qtd atualizada com sucesso.' });

      } catch (error) {
        console.error('Erro ao atualizar qtd:', error);
        res.status(500).json({ error: 'Erro ao atualizar qtd', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}