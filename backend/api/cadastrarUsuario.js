import corsMiddleware from '../corsConfig.js';
import { autenticarToken } from '../authmidleware.js'; 
import { cadastrarUsuario } from '../models/dbModel.js'; 

// Função Serverless para a rota "Cadastrar Usuario"
export default async function handler(req, res) {
  corsMiddleware(req, res, () => {});
  
  const tokenValido = autenticarToken(req, res, () => {});

  if (!tokenValido) {
    return res.status(401).json({ mensagem: 'Token não fornecido ou inválido!' });
  }

  if (req.method === 'POST') {
    try {
      const { nome, senha } = req.body;

      if (!nome || !senha) {
        return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });
      }

      const usuario = {
        nome,
        senha,
      };

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