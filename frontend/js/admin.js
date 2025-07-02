document.getElementById('nomeUser').textContent = 'Olá, ' + (localStorage.getItem('nome') || 'Usuário');
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = 'login.html';
});

// Registrar Produto Modal
const productModal = document.getElementById('productModal');
const registerProductCard = document.getElementById('registerProductCard');

// Modificar Produto Modal
const modifyProductModal = document.getElementById('modifyProductModal');
const modifyProductCard = document.getElementById('modifyProductCard');

// Registrar Usuário Modal
const userModal = document.getElementById('userModal');
const registerUserCard = document.getElementById('registerUserCard');

// Modificar Usuário Modal
const modifyUserModal = document.getElementById('modifyUserModal');
const modifyUserCard = document.getElementById('modifyUserCard');

// Close Modal Buttons
const closeModalButtons = document.querySelectorAll('.close-modal');

registerProductCard.addEventListener('click', () => {
    productModal.classList.remove('hidden');
});

modifyProductCard.addEventListener('click', () => {
    modifyProductModal.classList.remove('hidden');
    loadItens();
});

registerUserCard.addEventListener('click', () => {
    userModal.classList.remove('hidden');
});

modifyUserCard.addEventListener('click', () => {
    modifyUserModal.classList.remove('hidden');
    listarUsuarios();
});

// Close Modals
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        userModal.classList.add('hidden');
        productModal.classList.add('hidden');
        modifyUserModal.classList.add('hidden');
        modifyProductModal.classList.add('hidden');
    });
});

// Close Modal when clicking outside
window.addEventListener('click', event => {
    if (event.target === userModal) {
        userModal.classList.add('hidden');
    }
    if (event.target === modifyUserModal) {
        modifyUserModal.classList.add('hidden');
    }
    if (event.target === productModal) {
        productModal.classList.add('hidden');
    }
    if (event.target === modifyProductModal) {
        modifyProductModal.classList.add('hidden');
    }
});

// Function to register a new user
document.getElementById('registerUserButton').addEventListener('click', registerUser);
async function registerUser() {
    const userName = document.getElementById('inputUserName').value;
    const password = document.getElementById('inputPasswordValue').value;

    if (!userName || !password) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/CadastrarUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                nome: userName,
                senha: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            Toastify({
                text: "Usuário Cadastrado!!",
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
            userModal.classList.add('hidden');

        } else if (response.status === 403) {
            alert('Autenticação necessária. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            
        } else  {
            alert(data.error || 'Falha ao cadastrar usuário.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Function to register a new product
document.getElementById('registerProductBtn').addEventListener('click', registerProduct);
async function registerProduct() {
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const category = document.getElementById('category').value;

    if (!productName || !productPrice || !category) {
        alert('Preencha todos os campos!');
        return;
    }

    let setorPed;
    if (category == 1) { setorPed = 'cozinha'}
    else if (category == 2) { setorPed = 'copa'}
    else if (category == 3) { setorPed = 'churrasqueira'}
    else if (category == 4) { setorPed = 'outros'}

    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/RegistrarProduto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                nome: productName,
                preco: productPrice.replace(',', '.'), 
                setor: setorPed
            })
        });

        const data = await response.json();

        if (response.ok) {
            Toastify({
                text: "Produto Registrado!",
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
            productModal.classList.add('hidden');

            sessionStorage.removeItem('cardapio');

        } else if (response.status === 403) {
            alert('Autenticação necessária. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = 'login.html';

        } else  {
            alert(data.error || 'Falha ao cadastrar produto.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
}


/* MODIFICAÇÕES DE INFORMAAÇÕES*/
async function listarUsuarios() {
    const resposta = await fetch('https://api-recanto-production.up.railway.app/ListarUsuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
        });

    const usuarios = await resposta.json();

    const containerDeUsers = document.querySelector('#containerDeUsers');

    usuarios.forEach( (user) => {
        const op = document.createElement('option');
        op.value = user.id;
        op.innerHTML = `id: ${user.id} nome: ${user.nome}`;
        containerDeUsers.appendChild(op);
    })
    
}

document.getElementById('modifyUserBtn').addEventListener('click', () => modifyUser())
// modificar usuários
async function modifyUser() {

    // validar campos 
    const newnameValue = document.getElementById('newnameValue').value;
    const newPassword = document.getElementById('newInputPasswordValue').value;
    const novoNivel = document.getElementById('novoNivel').value;
    const containerDeUsers = document.getElementById('containerDeUsers').value;

    // Verificar se o campo de usuário está vazio
    if (containerDeUsers == 'nenhum' || newPassword.trim() == '' || novoNivel == '' || newnameValue.trim() == '') {
        alert('Por favor, preecher todos campos corretamente.');
        return;
    }

    try {
        const response = await fetch('https://api-recanto-production.up.railway.app/ModificarUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                nome: newnameValue,
                senha: newPassword,
                nivel: novoNivel,
                id: containerDeUsers
            })
        });

        const data = await response.json();

        if (response.ok) {
            Toastify({
                text: "Usuário Atualizado!",
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

            modifyUserModal.classList.add('hidden');

        } else if (response.status === 403) {
            alert('Autenticação necessária. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            
        } else  {
            alert(data.error || 'Falha ao modificar usuário.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

async function loadItens() {
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

        const listaCardapio = document.querySelector('#listaCardapio');
        listaCardapio.innerHTML = '';
         result.forEach( (elem) => {
            const p = document.createElement('p');
            p.style.padding = '5px 2px'
            p.style.borderBottom = 'solid 1px #ccc'
            p.innerHTML = elem.nome + ': ' + elem.id;
            listaCardapio.appendChild(p)
         })


    } catch (error) {
        console.error('Erro ao buscar cardapio:', error);
    }

}

document.getElementById('modifyProductBtn').addEventListener('click', () => modifyProduct())
async function modifyProduct() {
        const idProduto = document.getElementById('idProduct').value.trim();
        const novoNome = document.getElementById('newProductName').value.trim();
        const novoPreco = document.getElementById('newProductPrice').value.trim();
        const novoSetor = document.getElementById('newcategory').value;

        // Validação
        if (!idProduto || !novoNome || !novoSetor) {
            alert("Por favor, preencha os campos corretamente.");
            return;
        }

        if (!novoPreco || isNaN(novoPreco.replace(',', '.'))) {
            alert("Por favor, insira um preço válido (use vírgula para decimais).");
            return;
        }

        let setorPed;
        if (novoSetor == 1) { setorPed = 'cozinha'}
        else if (novoSetor == 2) { setorPed = 'copa'}
        else if (novoSetor == 3) { setorPed = 'churrasqueira'}
        else if (novoSetor == 4) { setorPed = 'outros'}

        // Montagem do corpo da requisição
        const body = {
            id: idProduto,
            novoNome: novoNome,
            novoPreco: novoPreco.replace(',', '.'),
            novoSetor: setorPed
        };

        try {
            const response = await fetch('https://api-recanto-production.up.railway.app/ModificarProduto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (response.ok) {
            Toastify({
                text: "Produto Atualizado!",
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
            
                modifyProductModal.classList.add('hidden');

                sessionStorage.removeItem('cardapio');
            } else {
                alert("Erro ao modificar produto: " + (result.message || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("Erro ao conectar com a API:", error);
            alert("Erro na conexão com o servidor.");
        }
    
}