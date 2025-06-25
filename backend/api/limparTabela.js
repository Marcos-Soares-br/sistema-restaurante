import { autenticarToken } from '../authmidleware.js'; 
import { limparTabela } from '../models/dbModel.js'; 

// Função Serverless para a rota "limparTabela"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
    const { tabela } = req.body;

    if (!tabela) {
      return res.status(400).json({ error: 'Parametro obrigatório.' });
    }

    await limparTabela(tabela);
    res.status(201).json({ message: 'Tabela limpada com sucesso.' });

  } catch (error) {
    console.error('Erro ao limpar tabela:', error);
    res.status(500).json({ error: 'Erro ao limpar tabela', details: error.message });
  }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}