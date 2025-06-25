const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController.js');
const autenticarToken = require('../authmidleware.js'); 

router.post('/CadastrarUsuario', autenticarToken, dbController.cadastrarUsuario);
router.post('/LogarUsuario', dbController.logarUsuario);
router.get('/ListarUsuarios', autenticarToken, dbController.listarUsuarios);
router.post('/ModificarUsuario', autenticarToken, dbController.atualizarUsuario);

router.post('/RegistrarProduto', autenticarToken, dbController.registrarProduto);
router.post('/ModificarProduto', autenticarToken, dbController.atualizarProduto); 

router.get('/ExibirCardapio', dbController.exibirCardapio);

router.post('/RegistrarPedido', autenticarToken, dbController.registrarPedido);
router.post('/CancelarPedido', autenticarToken, dbController.cancelarPedido);
router.post('/LiberarPedido', autenticarToken, dbController.liberarPedido);
router.get('/ExibirPedidos', autenticarToken, dbController.exibirPedidos);
router.post('/ExcluirPedidosDaMesa', autenticarToken, dbController.excluirPedidosDaMesa);

router.get('/QtdDasPorcoes', autenticarToken, dbController.qtdDasPorcoes);
router.post('/RegistarVenda', autenticarToken, dbController.registarVenda);
router.post('/AtualizarQtd', autenticarToken, dbController.atualizarQtd);
router.get('/Faturamento', autenticarToken, dbController.faturamento);

router.get('/ObterMesasAtivas', autenticarToken, dbController.obterMesasAtivas);
router.get('/FechamentoDaConta', autenticarToken, dbController.fechamentoDaConta);

router.post('/LimparTabela', autenticarToken, dbController.limparTabela);



module.exports = router;
