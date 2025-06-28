document.getElementById('nomeUsuario').textContent = 'Olá, ' + (localStorage.getItem('nome') || 'Usuário');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'pages/login.html';
});

// handle the title change
document.addEventListener('DOMContentLoaded', () => {
    const setorTitulo = document.getElementById('setorTitulo');
    const urlParam = new URLSearchParams(window.location.search);
    const setor = urlParam.get('setor') || '';
    setorTitulo.textContent = `Pedidos - ${setor.charAt(0).toUpperCase() + setor.slice(1)}`;
});

// DOM Elements
const pedidosTableBody = document.getElementById('pedidosTableBody');
const mesaFiltro = document.getElementById('mesaFiltro');
const emptyState = document.getElementById('emptyState');

// Função para buscar os pedidos da API
async function fetchPedidos(setor) {
    try {
        // Fazendo a requisição para a API com o setor
        const response = await fetch(`https://api-recanto-production.up.railway.app/ExibirPedidos?setor=${setor}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
        if (!response.ok) {
            throw new Error("Falha ao carregar os pedidos.");
        }
        const pedidos = await response.json(); 
        return pedidos.data; 

    } catch (error) {
        console.error("Erro ao buscar os pedidos:", error);
        return [];
    }
}


// Render table
async function renderizarTable() {
    const mesaValor = mesaFiltro.value;
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor') || '';  // Obtém o setor da URL
    
    // Fetch dos pedidos da API, passando o setor
    const pedidos = await fetchPedidos(setor);

    // gerar options das mesas
    const mesasExistentes = new Set();

    pedidos.forEach( (el) => {
        if (!mesasExistentes.has(el.mesa)) {  
            const opt = document.createElement('option');
            opt.value = el.mesa;
            opt.textContent = 'Mesa ' + el.mesa;
            mesaFiltro.appendChild(opt);
            mesasExistentes.add(el.mesa);  // Adiciona a mesa ao conjunto de mesas já existentes
        }
    });
    
    let filteredPedidos = pedidos;
    
    // Filtrando pedidos pela mesa selecionada
    if (mesaValor != 'todas') {
        filteredPedidos = filteredPedidos.filter(pedido => pedido.mesa == mesaValor);
    }
    
    pedidosTableBody.innerHTML = '';
    
    if (filteredPedidos.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    filteredPedidos.forEach(pedido => {
        if (pedido.status == 'ocultar') {
            return;
        }
        const row = document.createElement('tr');
        row.className = 'table-row-hover';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="text-sm font-medium text-gray-900">Mesa ${pedido.mesa}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 text-center">${pedido.quantidade} - ${pedido.item}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-500 text-center">${pedido.desc || '-'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 text-center">${pedido.horario}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
                <div class="flex space-x-2">
                    <button class="text-red-600 hover:text-red-900" onclick="cancelarPedido(${pedido.id}, '${pedido.item}', '${pedido.mesa}')">
                        Cancelar
                    </button>
                    <button class="text-green-600 hover:text-green-900" onclick="liberarPedido(${pedido.id})">
                        Liberar
                    </button>
                </div>
            </td>
        `;
        
        pedidosTableBody.appendChild(row);

    });
}

// Cancelar pedido
async function cancelarPedido(id, item, mesa) {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
        
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

        if (!response.ok) {
            throw new Error('Falha ao cancelar pedido: ' + response.statusText);
        }

        const result = await response.json();
        
        localStorage.setItem('alertaPedidoCancelado', `Pedido: ${item} da mesa ${mesa} CANCELADO!`);
        console.log(`Pedido cancelado: `, result);
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
    }

        renderizarTable();  
    }
}

// Liberar pedido
async function liberarPedido(id) {
    if (confirm('Tem certeza que deseja liberar este pedido?')) {

    const details = { id: id };

    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/LiberarPedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(details)
        });

        if (!response.ok) {
            throw new Error('Falha ao cancelar pedido: ' + response.statusText);
        }

        
    } catch (error) {
        console.error('Erro ao liberar pedido:', error);
    }

        renderizarTable();
    }
    
}

// Event Listeners
mesaFiltro.addEventListener('change', () => {
    renderizarTable();
});

// Inicializa
renderizarTable();

