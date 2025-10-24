//Validacion tiempo real
const emailInput = document.getElementById('email');
const passwordInput = document-getElementById('password');
const emailIcon = document.getElementById('emailIcon');
const passwordIcon = document.getElementById('passwordIcon');
const loginForm = document.getElementById('loginForm');

//Validacion de email
emailInput.addEventListener('input', async () => {
    const email = emailInput.value;

    if (email.length == 0) {
        emailIcon.textContent = '';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
        emailIcon.textContent = '✓';
        emailIcon.className = 'validation-icon valid';
    } else {
        emailIcon.textContent = '❌';
        emailIcon.className = 'validation-icon invalid';
    }
});

//Validacion de password
passwordInput.addEventListener('input', async () => {
    const password = passwordInput.value;

    if (password.length == 0) {
        passwordIcon.textContent = '';
        return;
    }

    if (password.length >= 6) {
        passwordIcon.textContent = '✓';
        passwordIcon.className = 'validation.icon valid';
    } else {
        passwordIcon.textContent = '❌';
        passwordIcon.className = 'validation.icon invalid';
    }
});

//Enviar formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    //Valida antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un correo válido');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( { email, password })
        });

        const data = await response.json();

        if (data.sucess) {
            alert('Login exitoso!');
            window.location.href = '/altas.html';
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error: ', error);
        alert('Error al iniciar sesión');
    }
});