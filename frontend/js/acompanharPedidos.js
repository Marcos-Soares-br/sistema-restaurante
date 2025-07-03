import { pedirNovaAutenticacao } from "./autenticar.js";

document.getElementById('nomeUsuario').textContent = 'Olá, ' + (localStorage.getItem('nome') || 'Usuário');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'login.html';
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
        if (response.status === 403) {
            pedirNovaAutenticacao();       
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

        if (response.status === 403) {
            pedirNovaAutenticacao();
        }

        const result = await response.json();
        
        const obj = {texto: `Pedido: ${item} da mesa ${mesa} CANCELADO!`}
        const respo = await fetch('https://api-recanto-production.up.railway.app/Alertas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(obj)
        });

        if (!respo.ok) {
            throw new Error('Falha ao alertar cancelamento: ' + respo.statusText);
        }

        console.log(`Pedido cancelado: `, result);
        Toastify({
            text: "Pedido Cancelado!",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", 
            position: "right", 
            stopOnFocus: true,
            style: {
                background: "rgb(214, 218, 12)",
                "text-align": 'center',
                "min-width": "250px"
            },
        }).showToast();

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

        if (response.status === 403) {
            pedirNovaAutenticacao();
        }

        Toastify({
            text: "Pedido Liberado!",
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

// ### SUPABASE REAL TIME ###
const { createClient } = supabase;

const _supabase = createClient('https://ganhpuaasnivswggphzw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbmhwdWFhc25pdnN3Z2dwaHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTMwMTQsImV4cCI6MjA2NjM4OTAxNH0.Q7k0tgXEPUEgUr6BQrDd9f4pJVqtNJ3ZZMt9VWr2YQ0');
const channel = _supabase.channel('pedidos-channel');

channel
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'pedidos' }, 
    (payload) => {
      console.log('Mudança detectada!', payload);
      renderizarTable(); 
    })
  .subscribe();

window.cancelarPedido = cancelarPedido;
window.liberarPedido = liberarPedido;