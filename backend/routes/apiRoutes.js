const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController.js');
const autenticarToken = require('../authmidleware.js');
const autorizarNivel = require('../middlewareNivel.js')

router.post('/CadastrarUsuario', autenticarToken, autorizarNivel('gerente'), dbController.cadastrarUsuario);
router.post('/LogarUsuario', dbController.logarUsuario);
router.get('/ListarUsuarios', autenticarToken, autorizarNivel('gerente'), dbController.listarUsuarios);
router.post('/ModificarUsuario', autenticarToken, autorizarNivel('gerente'), dbController.atualizarUsuario);

router.post('/RegistrarProduto', autenticarToken, autorizarNivel('gerente'), dbController.registrarProduto);
router.post('/ModificarProduto', autenticarToken, autorizarNivel('gerente'), dbController.atualizarProduto); 

router.get('/ExibirCardapio', dbController.exibirCardapio);

router.post('/RegistrarPedido', autenticarToken, dbController.registrarPedido);
router.post('/CancelarPedido', autenticarToken, dbController.cancelarPedido);
router.post('/LiberarPedido', autenticarToken, dbController.liberarPedido);
router.get('/ExibirPedidos', autenticarToken, dbController.exibirPedidos);
router.post('/ExcluirPedidosDaMesa', autenticarToken, dbController.excluirPedidosDaMesa);

router.get('/QtdDasPorcoes', autenticarToken, autorizarNivel('gerente'), dbController.qtdDasPorcoes);
router.post('/RegistrarVenda', autenticarToken, dbController.registrarVenda);
router.post('/AtualizarQtd', autenticarToken, dbController.atualizarQtd);
router.get('/Faturamento', autenticarToken, autorizarNivel('gerente'), dbController.faturamento);

router.get('/ObterMesasAtivas', autenticarToken, dbController.obterMesasAtivas);
router.get('/FechamentoDaConta', autenticarToken, dbController.fechamentoDaConta);

router.put('/ResetarInfos', autenticarToken, autorizarNivel, dbController.resetarInfos);

router.get('/Alertas', autenticarToken, dbController.alertas);
router.post('/Alertas', autenticarToken, dbController.alertas);
router.delete('/Alertas', autenticarToken, dbController.alertas);

module.exports = router;