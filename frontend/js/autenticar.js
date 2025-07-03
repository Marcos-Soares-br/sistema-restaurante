  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
  }

/* Caso o usuário set manualmente o token, ele tem acesso ao conteúdo da página,
   porém não pode acessar as rotas protegidas 
*/

function pedirNovaAutenticacao() {
  alert('Autenticação necessária. Faça login novamente.');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

export {pedirNovaAutenticacao}