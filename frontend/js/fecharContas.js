import { pedirNovaAutenticacao } from "./autenticar.js";

document.getElementById('nomeUsuario').textContent = 'Olá, ' + (localStorage.getItem('nome') || 'Usuário');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'login.html';
});

addEventListener('DOMContentLoaded', () => {
    gerarBtnsMesa();

    mostrarOpcoes(document.getElementById('filtroP').value);
});

async function gerarBtnsMesa() {
    const containerDeMesas = document.getElementById('containerDeMesas');
    const mesas = await obterMesasAtivas();

    containerDeMesas.innerHTML = ''
    mesas.forEach( (mesa) => {
        const div = document.createElement('div');

        div.setAttribute('class', 'mesa cursor-pointer bg-white border rounded-lg p-3 text-center shadow-sm');
        div.setAttribute('data-mesa', `${mesa.num}`);

        div.innerHTML = `<div class="text-3xl text-primary">${mesa.num}</div>`;

        containerDeMesas.appendChild(div);
    });

    // atribuindo eventos aos botões
    document.querySelectorAll('.mesa').forEach(mesa => {
    mesa.addEventListener('click', () => {
        const numeroMesa = mesa.dataset.mesa;
        selecionarMesa(numeroMesa);
    });
});
}

async function obterMesasAtivas() {
    try {
        const mesas = await fetch(`https://api-recanto-production.up.railway.app/ObterMesasAtivas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if(mesas.status == 403) {
            pedirNovaAutenticacao();
        }
            
        return await mesas.json();

    } catch (error) {
        console.error('Erro ao buscar pedidos: ', error);
    }
}

async function buscarPedidos(m) {
    try {
        const pedidos = await fetch(`https://api-recanto-production.up.railway.app/FechamentoDaConta?mesa=${m}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            return await pedidos.json();

    } catch (error) {
        console.error('Erro ao buscar pedidos: ', error);
    }
}
// Dados das mesas
let dadosDaBusca;
let dadosMesas = {} ;

// Produtos disponíveis
const produtos = JSON.parse(localStorage.getItem('cardapio'));


// Variáveis globais
let mesaSelecionada = null;

// Elementos DOM
const detalhesMesa = document.getElementById('detalhes-mesa');
const semMesaSelecionada = document.getElementById('sem-mesa-selecionada');
const numeroMesa = document.getElementById('numero-mesa');
const itensConsumo = document.getElementById('itens-consumo');
const valorTotal = document.getElementById('valor-total');
const btnAdicionar = document.getElementById('btn-adicionar');
const btnFinalizar = document.getElementById('btn-finalizar');
const modalAdicionar = document.getElementById('modal-adicionar');
const fecharModal = document.getElementById('fechar-modal');
const cancelarAdicao = document.getElementById('cancelar-adicao');
const confirmarAdicao = document.getElementById('confirmar-adicao');
const selectProduto = document.getElementById('listaProdExtras');
const inputQuantidade = document.getElementById('quantidade');
const modalFinalizar = document.getElementById('modal-finalizar');
const fecharModalFinalizar = document.getElementById('fechar-modal-finalizar');
const cancelarFinalizacao = document.getElementById('cancelar-finalizacao');
const confirmarFinalizacao = document.getElementById('confirmar-finalizacao');
const mesaFinalizar = document.getElementById('mesa-finalizar');
const subtotalFinalizar = document.getElementById('subtotal-finalizar');
const totalFinalizar = document.getElementById('total-finalizar');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const fecharConfirmacao = document.getElementById('fechar-confirmacao');
const mesaConfirmacao = document.getElementById('mesa-confirmacao');

// Inicializar eventos

btnAdicionar.addEventListener('click', () => {
    modalAdicionar.classList.remove('hidden');
});

fecharModal.addEventListener('click', () => {
    modalAdicionar.classList.add('hidden');
});

cancelarAdicao.addEventListener('click', () => {
    modalAdicionar.classList.add('hidden');
});

confirmarAdicao.addEventListener('click', () => {
    adicionarProduto();
});

btnFinalizar.addEventListener('click', () => {
    abrirModalFinalizar();
});

fecharModalFinalizar.addEventListener('click', () => {
    modalFinalizar.classList.add('hidden');
});

cancelarFinalizacao.addEventListener('click', () => {
    modalFinalizar.classList.add('hidden');
});

confirmarFinalizacao.addEventListener('click', () => {
    finalizarConta();
});

fecharConfirmacao.addEventListener('click', () => {
    modalConfirmacao.classList.add('hidden');
});

// Funções
async function selecionarMesa(numero) {
    dadosDaBusca = await buscarPedidos(numero);
    dadosDaBusca = dadosDaBusca.data;

    dadosMesas = {}; /* resetar dados da mesa */

    dadosDaBusca.forEach((dado) => {
        if (dadosMesas[dado.mesa] == undefined) {
            dadosMesas[dado.mesa] = { itens: [] };
        }

        dadosMesas[dado.mesa].itens.push({
            id: dado.id, 
            nome: dado.item,
            quantidade: dado.quantidade,
            valorUnitario: dado.preco
        });
    });

    // Remover seleção anterior
    document.querySelectorAll('.mesa').forEach(m => {
        m.classList.remove('border-red-600');
        m.classList.remove('active');
    });
    
    // Selecionar nova mesa
    const mesaElement = document.querySelector(`.mesa[data-mesa="${numero}"]`);
    if (mesaElement) {
        mesaElement.classList.add('active');
        mesaElement.classList.add('border-red-600');
    }
    
    mesaSelecionada = numero;
    
    // Verificar se a mesa tem dados
    if (dadosMesas[numero]) {
        // Mostrar detalhes da mesa
        detalhesMesa.classList.remove('hidden');
        semMesaSelecionada.classList.add('hidden');
        
        // Atualizar informações
        numeroMesa.textContent = numero;
        
        // Carregar itens
        carregarItens();
    } else {
        // Mesa vazia
        detalhesMesa.classList.add('hidden');
        semMesaSelecionada.classList.remove('hidden');
    }
}

function carregarItens() {
    if (!mesaSelecionada || !dadosMesas[mesaSelecionada]) return;
    
    const itens = dadosMesas[mesaSelecionada].itens;
    itensConsumo.innerHTML = '';
    
    let total = 0;
    
    itens.forEach(item => {
        const subtotal = item.quantidade * item.valorUnitario;
        total += subtotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-3 px-6 text-left">${item.nome}</td>
            <td class="py-3 px-6 text-center">${item.quantidade}</td>
            <td class="py-3 px-6 text-center">R$ ${item.valorUnitario.replace('.', ',')}</td>
            <td class="py-3 px-6 text-right">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
            <td class="py-3 px-6 text-center">
                <button class="text-red-500 hover:text-red-700" onclick="removerItem(${item.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </td>
        `;
        itensConsumo.appendChild(tr);
    });
    
    valorTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function adicionarProduto() {
    const produtoId = selectProduto.value;
    const quantidade = parseInt(inputQuantidade.value);
    
    if (!produtoId || quantidade <= 0) {
        alert('Por favor, selecione um produto e uma quantidade válida.');
        return;
    }
    
    if (!dadosMesas[mesaSelecionada]) {
        dadosMesas[mesaSelecionada] = {
            itens: []
        };
    }
    
    // Verificar se o produto já existe na mesa
    const itemExistente = dadosMesas[mesaSelecionada].itens.find(item => item.id == produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        dadosMesas[mesaSelecionada].itens.push({
            id: parseInt(produtoId),
            nome: produtos[produtoId].nome,
            quantidade: quantidade,
            valorUnitario: produtos[produtoId].preco
        });
    }
    
    // Atualizar a interface
    carregarItens();
    modalAdicionar.classList.add('hidden');
    
    // Resetar o formulário
    selectProduto.value = '';
    inputQuantidade.value = 1;
}

async function removerItem(id) {
    if (!dadosMesas[mesaSelecionada]) return;
    if(!confirm('Realmente quer apagar esse pedido?')) return;
    
    dadosMesas[mesaSelecionada].itens = dadosMesas[mesaSelecionada].itens.filter(item => item.id !== id);
    carregarItens();

    const details = { id: id };
    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/CancelarPedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(details)
        });

        if (response.status === 403) {
            pedirNovaAutenticacao();
        }
        
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
    }
    
}

function abrirModalFinalizar() {
    if (!mesaSelecionada || !dadosMesas[mesaSelecionada]) return;
    
    const itens = dadosMesas[mesaSelecionada].itens;
    let subtotal = 0;
    
    itens.forEach(item => {
        subtotal += item.quantidade * item.valorUnitario;
    });
    
    const total = subtotal;
    
    mesaFinalizar.textContent = mesaSelecionada;
    subtotalFinalizar.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    totalFinalizar.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    modalFinalizar.classList.remove('hidden');
}

async function finalizarConta() {
    // 1- registrar a venda
    let valorVenda = totalFinalizar.textContent.replace('R$', '');
    valorVenda = valorVenda.replace(',', '.');

    const details = { valor: valorVenda.trim() };
    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/RegistrarVenda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(details)
        });

        if (response.status == 403) {
            pedirNovaAutenticacao();
        }

        sessionStorage.removeItem('faturamento');
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
    }

    // 2- atualizar a quantidade de porções vendidas
    const itens = dadosMesas[mesaSelecionada].itens;
    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/AtualizarQdt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(itens)
        });

        if (!response.ok) {
            throw new Error('Falha ao registrar qtd: ' + response.statusText);
        }

        sessionStorage.removeItem('qtd');
    } catch (error) {
        console.error('Erro ao registrar qtd:', error);
    }
    
    // 3- Excluir os pedidos da mesa para librera-la
     try {
        const param = {mesa: mesaSelecionada};
        const response = await fetch('https://api-recanto-production.up.railway.app/ExcluirPedidosDaMesa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(param)
        });

        if (!response.ok) {
            throw new Error('Falha ao encerrar mesa: ' + response.statusText);
        }

        Toastify({
            text: `Mesa encerrada: ${mesaSelecionada}`,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", 
            position: "right", 
            stopOnFocus: true,
            style: {
                background: "rgb(34, 197, 94)",
                "text-align": 'center',
                "min-width": "250px"
            },
        }).showToast();

    } catch (error) {
        console.error('Erro ao encerrar mesa:', error);
    }

    

    // Fechar modal de finalização
    modalFinalizar.classList.add('hidden');
    
    // Mostrar confirmação
    mesaConfirmacao.textContent = mesaSelecionada;
    modalConfirmacao.classList.remove('hidden');
    
    // Limpar dados da mesa
    delete dadosMesas[mesaSelecionada];
    
    // Atualizar interface
    document.querySelector(`.mesa[data-mesa="${mesaSelecionada}"]`).style.display = 'none';
    document.querySelector(`.mesa[data-mesa="${mesaSelecionada}"]`).classList.remove('active');
    
    // Esconder detalhes da mesa
    detalhesMesa.classList.add('hidden');
    semMesaSelecionada.classList.remove('hidden');
    
    // Resetar mesa selecionada
    mesaSelecionada = null;
}

async function mostrarOpcoes(filtro) {
    try {
        const cardapio = sessionStorage.getItem('cardapio') || 'nada';
        let result= [];

        if (cardapio == 'nada') {
            const response = await fetch('https://api-recanto-production.up.railway.app/ExibirCardapio');
            if (!response.ok) {
                throw new Error('Falha ao buscar cardápio: ' + response.statusText);
            }

             result = await response.json();
             sessionStorage.setItem('cardapio', JSON.stringify(result));
        } else {
             result = JSON.parse(cardapio);
        }
        
        const listproduct = document.querySelector('#listaProdExtras');
        listproduct.innerHTML =''

        if (!filtro) {
            result.forEach( (elem) => {
            const op = document.createElement('option');
            op.id = 'option'+elem.id
            op.value = elem.id;
            op.text = elem.nome + ' - R$ ' + elem.preco.replace('.', ',');
            listproduct.appendChild(op)
         });

        } else {
            result.forEach( (elem) => {
                if (elem.nome.includes(filtro)) {
                    const op = document.createElement('option');
                    op.id = 'option'+elem.id
                    op.value = elem.id;
                    op.text = elem.nome + ' - R$ ' + elem.preco.replace('.', ',');
                    listproduct.appendChild(op)
                }
         });
        }
         
    } catch (error) {
        console.error('Error registering order:', error);
    }
}

const filtroProduto = document.getElementById('filtroP')
filtroProduto.addEventListener('input', () => mostrarOpcoes(filtroProduto.value))

// Função global para remover item (acessível pelo onclick no HTML)
window.removerItem = removerItem;