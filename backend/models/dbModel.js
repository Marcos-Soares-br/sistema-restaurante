import bcrypt from 'bcrypt'
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const envie = postgres(process.env.DATABASE_URL);

async function cadastrarUsuario(usuario) {
  try {
    const senhaHash = await bcrypt.hash(usuario.senha, 10);

    await envie`INSERT INTO users (nome_users, senha_users, nivel_users) VALUES (${usuario.nome}, ${senhaHash}, 'funcionario');`;
    
  } catch {
    console.log('Usuário não foi criado.')
  }
}

async function logarUsuario(nome) {
  try {

    const rows = await envie`SELECT nome_users, senha_users, nivel_users FROM users WHERE nome_users = ${nome};`;

    if (rows.length === 0) {
      return null;
    }

    return rows[0];

  } catch (erro) {
    console.log('Usuário não logado: ' + erro);
    return null;
  }
}

async function listarUsuarios() {
  try {
    const rows = await envie`SELECT id_users, nome_users, nivel_users FROM users;`;

      return rows.map(row => ({
        id: row.id_users,
        nome: row.nome_users,
        nivel: row.nivel_users
      }));
    
  } catch (erro) {
    console.log('Erro: ' + erro);
  }
}

async function atualizarUsuario(usuario) {
  try {
    const senhaHash = await bcrypt.hash(usuario.senha, 10);

    await envie`UPDATE users SET nome_users = ${usuario.nome}, senha_users = ${senhaHash}, nivel_users = ${usuario.nivel} 
                WHERE id_users = ${usuario.id};`;

  } finally {
    
  }
}

async function registrarProduto(produto) {
  
  try {
    await envie`
      INSERT INTO cardapio (nome_item_cardapio, preco_item_cardapio, setor_item_cardapio)
      VALUES (${produto.nome}, ${produto.preco}, ${produto.setor});
    `;

    await envie`
      INSERT INTO quantidades (nome_item_quantidades, qtd_quantidades)
      VALUES (${produto.nome}, ${0});
    `;
  } finally {

  }

}

async function atualizarProduto(produto) {
  try {
    await envie`UPDATE cardapio
      SET nome_item_cardapio = ${produto.novoNome} , preco_item_cardapio = ${produto.novoPreco}, setor_item_cardapio = ${produto.novoSetor}
      WHERE id_item_cardapio = ${produto.id};`;

  } finally {

  }
}

async function exibirCardapio() {
  try {
    const rows = await envie`SELECT id_item_cardapio, nome_item_cardapio, preco_item_cardapio, setor_item_cardapio FROM cardapio`;

      return rows.map(row => ({
        id: row.id_item_cardapio,
        nome: row.nome_item_cardapio,  
        preco: row.preco_item_cardapio,  
        tipo: row.setor_item_cardapio     
      }));

  } finally {

  }
}


async function registrarPedido(mesa, hora, pedido, desc) {  
  try {
    // Iniciar transação
    await envie.begin( async envie => {
       const [resultPedido] = await envie`
      INSERT INTO pedidos (numMesa_pedidos, horaDeRegistro_pedidos, descricao_pedidos)
      VALUES (${mesa}, ${hora}, ${desc || ''}) RETURNING id_pedidos
    `

    const pedidoId = resultPedido.id_pedidos;

    for (let item of pedido) {
      await envie`
      INSERT INTO itens_pedido (id_pedido_itenspedido, id_itemcardapio_itenspedido, quantidade_itenspedido, status_pedidos)
      VALUES (${pedidoId}, ${item.id}, ${item.qtd}, 'mostrar')
    ` 
    }

    return { pedidoId, mesa, items: pedido };
    });


  } catch (error) {
    throw new Error('Erro ao registrar pedido no banco de dados: ' + error.message);

  } 
}

async function exibirPedidos(setor) {
  try {
    const rows = await envie`SELECT ip.id_itenspedido AS id, p.numMesa_pedidos AS mesa, c.nome_item_cardapio AS item, ip.quantidade_itenspedido AS quantidade, 
    p.horaDeRegistro_pedidos AS horario, p.descricao_pedidos AS descr, ip.status_pedidos AS status
    FROM pedidos p
    JOIN itens_pedido ip ON p.id_pedidos = ip.id_pedido_itenspedido
    JOIN cardapio c ON ip.id_itemcardapio_itenspedido = c.id_item_cardapio
    WHERE c.setor_item_cardapio = ${setor}
    ORDER BY p.horaDeRegistro_pedidos;`;

    return rows.map(row => ({
      id: row.id,
      mesa: row.mesa,
      item: row.item,
      quantidade: row.quantidade,
      horario: row.horario,
      desc: row.descr,
      status: row.status
    }));

  } finally {
  }
}

async function excluirPedidosDaMesa(mesa) {
  try {
    await envie`DELETE FROM pedidos WHERE numMesa_pedidos = ${mesa};`;

  } finally {
  }
}

async function cancelarPedido(id) {
  try {
    await envie`DELETE FROM itens_pedido WHERE id_itenspedido = ${id};`;

  } finally {
  }
}

async function liberarPedido(id) {
  try {
    await envie`UPDATE itens_pedido SET status_pedidos = 'ocultar'  WHERE id_itenspedido = ${id};`;

  } finally {
  }
}

async function qtdDasPorcoes() {
  try {
    const rows = await envie`SELECT q.nome_item_quantidades AS nome, q.qtd_quantidades AS quantidade
    FROM quantidades q
    WHERE q.qtd_quantidades > 0
    ORDER BY q.qtd_quantidades DESC;`;

      return rows.map(row => ({
        produto: row.nome,
        qtd: row.quantidade
      }));


  } catch(erro) {
    console.log('Erro: ' + erro)
  }
}

async function registarVenda(valor) {
  try {
    await envie`INSERT INTO vendas (valor_vendas) values (${valor})`;

  } finally {
  }
}

async function atualizarQtd(itens) {
  try {
    for (const item of itens) {
      await envie`UPDATE quantidades
        SET qtd_quantidades = (qtd_quantidades + ${item.quantidade}) 
        WHERE nome_item_quantidades = ${item.nome};`;
    }
    
  } finally {
  }
}


async function faturamento() {
  try {
    const rows = await envie`SELECT SUM(v.valor_vendas) AS valor FROM vendas v`;

    return `faturamento: ${rows.valor}`;

  } finally {
  }
}

async function obterMesasAtivas() {
  try {
    const rows = await envie`SELECT DISTINCT numMesa_pedidos FROM pedidos;`;

    return rows.map(row => ({
      num: row.nummesa_pedidos
    }));

  } catch(erro) {
    console.log('Erro: ' + erro)
  }

}

async function fechamentoDaConta(mesaNumero) {
  try {    
    const rows = await envie`
      SELECT p.numMesa_pedidos AS mesa, 
             ip.id_itenspedido AS id,
             c.nome_item_cardapio AS item, 
             ip.quantidade_itenspedido AS quantidade, 
             c.preco_item_cardapio AS preco,
             (ip.quantidade_itenspedido * c.preco_item_cardapio) AS total  -- Calculando o total
      FROM pedidos p
      JOIN itens_pedido ip ON p.id_pedidos = ip.id_pedido_itenspedido
      JOIN cardapio c ON ip.id_itemcardapio_itenspedido = c.id_item_cardapio
      WHERE p.numMesa_pedidos = ${mesaNumero};`;

    return rows.map(row => ({
      id: row.id,
      mesa: row.mesa,
      item: row.item,
      quantidade: row.quantidade,
      preco: row.preco,
      total: row.total  
    }));
    
  } finally {
  }
}

async function resetarInfos() {
  try {
    await envie`TRUNCATE TABLE vendas`;

    await envie`UPDATE quantidades SET qtd_quantidades = 0 WHERE nome_item_quantidades != 'paralelepipedo';`;

  } catch (error) {
    console.error('Erro ao resetar dados:', error);
  } 
}

async function registrarAlerta(texto) {
  try {
    await envie`INSERT INTO alertas (texto_alertas)VALUES (${texto});`;

  } catch (error) {
    console.error('Erro ao registar alerta: ', error);
  } 

}

async function listarAlertas() {
  try {
    const rows = await envie`SELECT * FROM alertas`;

    return rows.map(row => ({
        id: row.id_alertas,
        texto: row.texto_alertas,
      }));
    
  } catch (error) {
    console.error('Erro ao listar alertas: ', error);
  }

}

async function deletarAlerta(id) {
  try {
    await envie`DELETE FROM alertas WHERE id_alertas  = ${id};`; 
    
  } catch (error) {
    console.error('Erro ao deletar alerta: ', error);
  }
}

export  { 
  cadastrarUsuario, logarUsuario, listarUsuarios, atualizarUsuario, 
  registrarProduto, atualizarProduto, exibirCardapio, excluirPedidosDaMesa,
  registrarPedido, exibirPedidos, cancelarPedido, liberarPedido,
  qtdDasPorcoes, atualizarQtd, registarVenda, faturamento,
  obterMesasAtivas, fechamentoDaConta, resetarInfos, 
  registrarAlerta, listarAlertas, deletarAlerta
};