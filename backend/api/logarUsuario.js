import corsMiddleware from '../corsConfig.js';
import { logarUsuario } from '../models/dbModel.js'; 

// Função Serverless para a rota "Logar Usuario"
export default async function handler(req, res) {
  corsMiddleware(req, res, () => {});

  if (req.method === 'POST') {
    try {
        const { nome, senha } = req.body;
    
        if (!nome || !senha) {
          return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });
        }
    
        const usuarioBD = await logarUsuario(nome);
    
        if (!usuarioBD) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          return res.status(401).json({ error: 'Nome ou senha incorretos.' });
        }
    
        const senhaValida = await bcrypt.compare(senha, usuarioBD.senha_users);
        if (!senhaValida) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          return res.status(401).json({ error: 'Nome ou senha incorretos.' });
        }
    
        const payload = {
          nome: usuarioBD.nome_users,
          nivel: usuarioBD.nivel_users,
        };
    
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
        res.status(200).json({
          message: 'Login bem-sucedido',
          token,
          usuario: {
            nome: usuarioBD.nome_users,
            nivel: usuarioBD.nivel_users,
          }
        });
    
      } catch (error) {
        console.error('Erro ao logar usuário:', error);
        res.status(500).json({ error: 'Erro ao logar usuário', details: error.message });
      }
  } else {
    return res.status(405).json({ mensagem: 'Método não permitido!' });
  }
}