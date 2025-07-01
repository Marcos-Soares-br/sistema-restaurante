const dbModel = require('../models/dbModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function cadastrarUsuario(req, res) {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });
    }

    const usuario = {
      nome,
      senha,
    };

    await dbModel.cadastrarUsuario(usuario);
    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário', details: error.message });
  }
}

async function logarUsuario(req, res) {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });
    }

    const usuarioBD = await dbModel.logarUsuario(nome);

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
}


async function listarUsuarios(req, res) {
  try {
    const usuarios = await dbModel.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { nome, senha, nivel, id } = req.body;

    if (!nivel || !senha || !id || !nome) {
      return res.status(400).json({ error: 'Nivel, nome, senha e id são obrigatórios.' });
    }

    const usuarioAtualizado = { nome, senha, nivel, id };

    await dbModel.atualizarUsuario(usuarioAtualizado);
    res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
}

async function registrarProduto(req, res) {
  try {
    const { nome, preco, setor } = req.body;

    if (!nome || !preco || !setor) {
      return res.status(400).json({ error: 'Nome, preço e setor são obrigatórios.' });
    }

    const produto = { nome, preco, setor };

    await dbModel.registrarProduto(produto);
    res.status(201).json({ message: 'Produto registrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar produto:', error);
    res.status(500).json({ error: 'Erro ao registrar produto', details: error.message });
  }
}

async function atualizarProduto(req, res) {
  try {
    const { id, novoNome, novoPreco, novoSetor} = req.body;

    if ( !id || !novoNome || !novoPreco || !novoSetor) {
      return res.status(400).json({ error: 'id, nome, preço e setor são obrigatórios.' });
    }

    const produtoAtualizado = { id, novoNome, novoPreco, novoSetor};

    await dbModel.atualizarProduto(produtoAtualizado);
    res.status(200).json({ message: 'produto atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar  produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
}

async function exibirCardapio(req, res) {
  try {
    const cardapio = await dbModel.exibirCardapio();
    res.status(200).json(cardapio);
  } catch (error) {
    console.error('Erro ao exibir cardápio:', error);
    res.status(500).json({ error: 'Erro ao exibir cardápio', details: error.message });
  }
}

async function registrarPedido(req, res) {
  try {
    const { mesa, hora, pedido, desc } = req.body;

    // Validação se a mesa e o pedido foram passados corretamente
    if (!mesa || !pedido || pedido.length === 0) {
      return res.status(400).json({ error: 'Mesa e pedido são obrigatórios.' });
    }

    // Passando os dados para o model registrar o pedido e os itens
    const result = await dbModel.registrarPedido(mesa, hora, pedido, desc);

    res.status(201).json({ message: 'Pedido registrado com sucesso.', data: result });
  } catch (error) {
    console.error('Erro ao registrar pedido:', error);
    res.status(500).json({ error: 'Erro ao registrar pedido', details: error.message });
  }
}

async function cancelarPedido(req, res) {
try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'O id é obrigatório.' });
    }

    const result = await dbModel.cancelarPedido(id);

    res.status(201).json({ message: 'Pedido cancelado com sucesso.', data: result });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro ao cancelar pedido', details: error.message });
  }
}

async function liberarPedido(req, res) {
try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'O id é obrigatório.' });
    }

    const result = await dbModel.liberarPedido(id);

    res.status(201).json({ message: 'Pedido liberado com sucesso.', data: result });
  } catch (error) {
    console.error('Erro ao liberar pedido:', error);
    res.status(500).json({ error: 'Erro ao liberar pedido', details: error.message });
  }
}

async function exibirPedidos(req, res) {
  const setor = req.query.setor;

  try {
    // Chama a função que vai exibir os pedidos com base no setor
    const result = await dbModel.exibirPedidos(setor);
    
    res.status(201).json({ message: 'Pedidos buscados com sucesso.', data: result });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao exibir pedidos', error: error.message });
  }
} 

async function excluirPedidosDaMesa(req, res) {
  try {
    const { mesa } = req.body;

    if ( !mesa) {
      return res.status(400).json({ error: 'Mesa obrigatória.' });
    }

    await dbModel.excluirPedidosDaMesa(mesa);
    res.status(200).json({ message: 'Mesa encerrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao encerrar mesa:', error);
    res.status(500).json({ error: 'Erro ao encerrar mesa', details: error.message });
  }
}

async function qtdDasPorcoes(req, res) {

  try {
    const qtdPedidos = await dbModel.qtdDasPorcoes();
    res.status(200).json(qtdPedidos);

  } catch (error) {
    console.error('Erro ao buscar a quantidade de porções:', error);
    res.status(500).json({ error: 'Erro ao buscar a quantidade de porções:', details: error.message });
  }

} 

async function registarVenda(req, res) {
  try {
    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({ error: 'Valor obrigatório.' });
    }

    await dbModel.registarVenda(valor);
    res.status(201).json({ message: 'Venda registrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ error: 'Erro ao registrar venda', details: error.message });
  }
}

async function atualizarQtd(req, res) {
  try {
    const { itens } = req.body;

    if (!itens) {
      return res.status(400).json({ error: 'Parametro obrigatório.' });
    }

    await dbModel.atualizarQtd(itens);
    res.status(201).json({ message: 'qtd registrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar qtd:', error);
    res.status(500).json({ error: 'Erro ao registrar qtd', details: error.message });
  }
}

async function faturamento(req, res) {

  try {
    const fat = await dbModel.faturamento();
    res.status(200).json(fat);

  } catch (error) {
    console.error('Erro ao buscar faturamento:', error);
    res.status(500).json({ error: 'Erro ao buscar faturamento:', details: error.message });
  }

}

async function obterMesasAtivas(req, res) {
  try {
    const mesas = await dbModel.obterMesasAtivas();
    res.status(200).json(mesas);
  } catch (error) {
    console.error('Erro ao obter mesas:', error);
    res.status(500).json({ error: 'Erro ao obter mesas', details: error.message });
  }
}

async function fechamentoDaConta(req, res) {
  const mesa = req.query.mesa;

  try {
    // Chama a função que vai exibir os pedidos com base no setor
    const result = await dbModel.fechamentoDaConta(mesa);
    
    res.status(201).json({ message: 'busca com sucesso.', data: result });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar', error: error.message });
  }
}

async function limparTabela(req, res) {
  try {
    const { tabela } = req.body;

    if (!tabela) {
      return res.status(400).json({ error: 'Parametro obrigatório.' });
    }

    await dbModel.limparTabela(tabela);
    res.status(201).json({ message: 'Tabela limpada com sucesso.' });
  } catch (error) {
    console.error('Erro ao limpar tabela:', error);
    res.status(500).json({ error: 'Erro ao limpar tabela', details: error.message });
  }
}


module.exports = {
  cadastrarUsuario, logarUsuario, listarUsuarios, atualizarUsuario,
  registrarProduto, atualizarProduto, exibirCardapio, excluirPedidosDaMesa,
  registrarPedido, cancelarPedido, liberarPedido, exibirPedidos,
  qtdDasPorcoes, atualizarQtd, registarVenda,  faturamento,
  obterMesasAtivas, fechamentoDaConta, limparTabela
};
