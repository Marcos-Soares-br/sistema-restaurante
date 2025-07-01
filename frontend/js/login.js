document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('senha');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeSlashIcon = document.getElementById('eyeSlashIcon');
    
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        eyeIcon.classList.toggle('hidden');
        eyeSlashIcon.classList.toggle('hidden');
    });
        
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const senha = document.getElementById('senha').value;
  const button = document.querySelector('.btn-login');
  const originalText = button.innerHTML;

  if (!nome || !senha) {
    // alert('Preencha todos os campos!');
    return;
  }

  // Ativa animação de carregamento
  button.disabled = true;
  button.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Entrando...';

  try {
    
    const response = await fetch('https://api-recanto-production.up.railway.app/LogarUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: nome,
        senha: senha
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('nome', data.usuario.nome);
      localStorage.setItem('nivel', data.usuario.nivel);

      window.location.href = '../index.html';

    } else {
      const pFalha = document.getElementById('textoDeFalha');

      pFalha.classList.remove('hidden');
      password.classList.add('border');
      password.classList.add('border-red-300');
    }

  } catch (error) {
    console.error('Erro na requisição:', error);
    alert('Erro ao conectar com o servidor.');
  } finally {
    button.disabled = false;
    button.innerHTML = originalText;
  }
});
    }
);
