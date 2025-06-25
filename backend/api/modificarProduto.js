import { autenticarToken } from '../authmidleware.js'; 
import { atualizarProduto } from '../models/dbModel.js'; 

// Função Serverless para a rota ""
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { id, novoNome, novoPreco, novoSetor} = req.body;
    
        if ( !id || !novoNome || !novoPreco || !novoSetor) {
          return res.status(400).json({ error: 'id, nome, preço e setor são obrigatórios.' });
        }
    
        const produtoAtualizado = { id, novoNome, novoPreco, novoSetor};
    
        await atualizarProduto(produtoAtualizado);
        res.status(200).json({ message: 'produto atualizado com sucesso.' });

      } catch (error) {
        console.error('Erro ao atualizar  produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
      }
  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}