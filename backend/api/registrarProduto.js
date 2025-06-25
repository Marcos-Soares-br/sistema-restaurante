import { autenticarToken } from '../authmidleware.js'; 
import { registrarProduto } from '../models/dbModel.js'; 

// Função Serverless para a rota "Registra Pedidos"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { nome, preco, setor } = req.body;
    
        if (!nome || !preco || !setor) {
          return res.status(400).json({ error: 'Nome, preço e setor são obrigatórios.' });
        }
    
        const produto = { nome, preco, setor };
    
        await registrarProduto(produto);
        res.status(201).json({ message: 'Produto registrado com sucesso.' });
        
      } catch (error) {
        console.error('Erro ao registrar produto:', error);
        res.status(500).json({ error: 'Erro ao registrar produto', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}