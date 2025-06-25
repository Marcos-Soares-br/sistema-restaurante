import { autenticarToken } from '../authmidleware.js'; 
import { atualizarUsuario } from '../models/dbModel.js'; 

// Função Serverless para a rota "Listar Usuario"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
        const { nome, senha, nivel, id } = req.body;
    
        if (!nivel || !senha || !id || !nome) {
          return res.status(400).json({ error: 'Nivel, nome, senha e id são obrigatórios.' });
        }
    
        const usuarioAtualizado = { nome, senha, nivel, id };
    
        await atualizarUsuario(usuarioAtualizado);
        res.status(200).json({ message: 'Usuário atualizado com sucesso.' });

      } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
      }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}