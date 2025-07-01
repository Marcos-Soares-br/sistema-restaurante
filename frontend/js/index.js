document.getElementById('nomeUsuario').textContent = 'Olá, ' + (localStorage.getItem('nome') || 'Usuário');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'pages/login.html';
});

// Funcionalidades dos modals
document.addEventListener('DOMContentLoaded', () => {
    // Modal porções vendidas
    const porcoesVendidasModal = document.getElementById('porcoesVendidasModal');
    const porcoesVendidasCard = document.getElementById('porcoesVendidasCard');

    // Modal Registrar pedidos
    const registrarPedidoModal = document.getElementById('registrarPedidoModal');
    const registrarPedidoCard = document.getElementById('registrarPedidoCard');
    
    // Modal Acompanhar Pedidos
    const acompanharPedModal = document.getElementById('acompanharPedModal');
    const acompanharPedCard = document.getElementById('acompanharPedCard');
    
    // fechar Modal Buttons
    const fecharModalButtons = document.querySelectorAll('.close-modal');
    
    // abrir Modals
    porcoesVendidasCard.addEventListener('click', () => {
        porcoesVendidasModal.classList.remove('hidden');
    });

    registrarPedidoCard.addEventListener('click', () => {
        registrarPedidoModal.classList.remove('hidden');
    });
    
    acompanharPedCard.addEventListener('click', () => {
        acompanharPedModal.classList.remove('hidden');
    });
    
    // fechar Modals
    fecharModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            porcoesVendidasModal.classList.add('hidden');
            registrarPedidoModal.classList.add('hidden');
            acompanharPedModal.classList.add('hidden');
        });
    });
    
    // Close Modal when clicking outside
    window.addEventListener('click', event => {
        if (event.target === registrarPedidoModal) {
            registrarPedidoModal.classList.add('hidden');
        }
        if (event.target === acompanharPedModal) {
            acompanharPedModal.classList.add('hidden');
        }
        if (event.target === porcoesVendidasModal) {
            porcoesVendidasModal.classList.add('hidden');
        }
    });

    carregarPagFuncionario();
    fetchQuantidade();
    fetchFaturamento();
    carregarOpcoes();
    verificaCancelamento();
    setInterval(verificaCancelamento, 30000);

});


// Function to fetch and display relatório
async function fetchQuantidade() {
    let qtd = sessionStorage.getItem('qtd');

    if( !qtd ){
        try {
            qtd = await fetch('https://api-recanto-production.up.railway.app/QtdDasPorcoes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
            });

        }  catch {
            console.log('Erro ao buscar quantidade no banco de dados');
        }

        qtd = await qtd.json()
    }


    if(qtd.length > 0) {
        const pTotal = document.getElementById('pTotal');
        let tot = 0;
        qtd.forEach( (elem) => {
            tot += parseInt(elem.qtd);
        })
        pTotal.innerHTML = tot;

        const tableQtdPorcoes = document.getElementById('tableQtdPorcoes');
        qtd.forEach( (elem) => {
            const tr = document.createElement('tr')
            tr.classList.add('table-row-hover')

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="text-sm font-medium text-gray-900">${elem.produto}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 text-center">${elem.qtd}</div>
                </td>
                `;
            tableQtdPorcoes.appendChild(tr);
        })
    }

 }

 async function fetchFaturamento() {
    const pFatur = document.getElementById('pFatur');
    let faturamentoResp = sessionStorage.getItem('faturamento');
    
    if (!faturamentoResp) {
        try {
            faturamentoResp = await fetch('https://api-recanto-production.up.railway.app/Faturamento', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
            });

        }  catch {
            console.log('Erro ao buscar quantidade no banco de dados');
        }

        faturamentoResp = await faturamentoResp.json();
    }

    if(faturamentoResp[0].faturamento != undefined) {
        pFatur.innerHTML ='R$ ' + (faturamentoResp[0].faturamento.replace('.', ',') || '0,00' );
    }
    
 }

// função para carregar as opções de pedidos
async function carregarOpcoes(filtro) {
    try {
        const cardapio = localStorage.getItem('cardapio') || 'nada';
        let result= [];

        if (cardapio == 'nada') {
            const response = await fetch('https://api-recanto-production.up.railway.app/ExibirCardapio');
            if (!response.ok) {
                throw new Error('Falha ao buscar cardápio: ' + response.statusText);
            }

             result = await response.json();
             localStorage.setItem('cardapio', JSON.stringify(result));
        } else {
             result = JSON.parse(cardapio);
        }
        
        const listproduct = document.querySelector('#produtos');
        listproduct.innerHTML ='';

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

const adcBtn = document.querySelector('#adcBtn');
const rmvBtn = document.querySelector('#rmvBtn');
adcBtn.addEventListener('click', () => criarListaProdutos());
rmvBtn.addEventListener('click', () => removerDaListaProdutos());
let pedidosArray = []; 

function criarListaProdutos() {
    const item = document.querySelector('#produtos').value;
    const listProduct = document.querySelector('#listaProdutos');
    
    if (item !== "") {
        const op = document.querySelector(`#option${item}`).textContent.split('-');

        const existingItem = pedidosArray.find(pedido => pedido.item == op[0]);

        if (existingItem) {
            // Se já existe, incrementar a quantidade
            existingItem.qtd++;
        } else {
            // Se não existe, adicionar novo item ao array
            pedidosArray.push({ item: op[0], qtd: 1, id: item });
        }

        listProduct.innerHTML = '';

        // Recriar a lista com os itens atualizados
        pedidosArray.forEach((elem) => {
            const li = document.createElement('li');
            li.textContent = `${elem.qtd} > ${elem.item}`;
            listProduct.appendChild(li);
        });
    } else {
        alert("Selecione um produto!");
    }
}

function removerDaListaProdutos() {
    const item = document.querySelector('#produtos').value;
    const listProduct = document.querySelector('#listaProdutos');
    
    if (item !== "") {
        const op = document.querySelector(`#option${item}`).textContent.split('-');

        const existingItem = pedidosArray.find(pedido => pedido.item == op[0]);

        if (existingItem) {
            if (existingItem.qtd > 1) {
                existingItem.qtd--;
            } else {
                // Remover o item do array quando a quantidade chegar a 1
                pedidosArray = pedidosArray.filter(pedido => pedido.item !== op[0]);
            }

            // Atualizar a lista exibida
            listProduct.innerHTML = '';

            pedidosArray.forEach((elem) => {
                const li = document.createElement('li');
                li.textContent = `${elem.qtd} > ${elem.item}`;
                listProduct.appendChild(li);
            });
        } else {
            alert("Produto não encontrado na lista.");
        }

    } else {
        alert("Selecione um produto!");
    }
}


const registarPedidoBtn = document.querySelector('#registarPedidoBtn');
registarPedidoBtn.addEventListener('click', () => registrarPedido())

// função para registrar um novo pedido
async function registrarPedido() {
    const mesa = document.querySelector('#mesaNum');
    const desc = document.querySelector('#obs');

    if (!mesa || pedidosArray.length === 0) {
        alert('Mesa não indicada ou pedido vazio.');
        return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const hora = `${hours}:${minutes}`;

    const detalhesPedido = {
        mesa: mesa.value,
        hora: hora,
        pedido: pedidosArray, 
        desc: desc.value
    };

    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/RegistrarPedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(detalhesPedido)
        });

        if (!response.ok) {
            throw new Error('Falha ao registrar pedido: ' + response.statusText);
        }

        const result = await response.json();

        console.log('Pedido registrado:', result);
        document.getElementById('registrarPedidoModal').classList.add('hidden');
        Toastify({
            text: "Pedido Registrado!",
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
        alert('Falha ao registrar pedido.')
    }
}

const filtroProduto = document.getElementById('filtroP')
filtroProduto.addEventListener('change', () =>  carregarOpcoes(filtroProduto.value) )

function verificaCancelamento() {
    const cancelamento = localStorage.getItem('alertaPedidoCancelado')
    if (cancelamento) {
        alert(cancelamento);
        localStorage.removeItem('alertaPedidoCancelado')
    }
}

async function carregarPagFuncionario() {
    let nivelDeAcesso = localStorage.getItem('nivel');

    if (nivelDeAcesso == 'gerente') {
        const dashboard = document.getElementById('dashboard');
        const linkConfiguracoes = document.getElementById('linkConfiguracoes');

        dashboard.classList.remove('hidden');
        linkConfiguracoes.classList.remove('hidden');
    }
}
 
// Mascarar input
document.querySelector('#mesaNum').addEventListener('input', (e) => {
    if (e.target.value.length > 4) {
        e.target.value = e.target.value.slice(0,4)
    }
})