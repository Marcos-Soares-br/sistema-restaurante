import { autenticarToken } from '../authmiddleware.js'; 
import { cadastrarUsuario } from '../models/dbModel.js'; 

// Função Serverless para a rota "Cadastrar Usuario"
export default async function handler(req, res) {
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
      const usuario = req.body;

      const usuarioCadastrado = await cadastrarUsuario(usuario);

      return res.status(201).json(usuarioCadastrado);
      
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário', error });
    }
  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}