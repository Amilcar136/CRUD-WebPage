// Configuración global de Toastr
toastr.options = {
  "closeButton": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "timeOut": "5000"
};

//Función para verificar la conexión al hacer clic en el botón
function verifConn() {
  fetch('/status')
    .then(response => response.json())
    .then(data => {
      if (data.connected) {
        toastr.success(data.message, 'Éxito');
      } else {
        toastr.error(data.message, 'Error');
      }
    })
    .catch(error => {
      console.error('Error al verificar la conexión:', error);
      toastr.error('No se pudo comunicar con el servidor.', 'Error de Red');
    });
}

//Función para procesar los mensajes iniciales de Flask
function procesarFlashesIniciales() {
  if (typeof flashMessages !== 'undefined' && flashMessages.length > 0) {
    flashMessages.forEach(function(message) {
      // Llama a toastr con la categoría ('success', 'error', etc.) y el mensaje
      toastr[message.category](message.text);
    });
  }
}

//Ejecuta la función de los flashes cuando el contenido de la página haya cargado
document.addEventListener('DOMContentLoaded', procesarFlashesIniciales);

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = document.querySelector('.close-button');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    // Función para abrir el modal
    function abrirModal() {
        loginModal.style.display = 'flex'; // Usamos flex para centrar
        document.body.style.overflow = 'hidden'; // Evita scroll en el fondo
        // Resetea el formulario y los mensajes de error al abrir
        loginForm.reset();
        emailError.textContent = '';
        passwordError.textContent = '';
        emailInput.classList.remove('error-input');
        passwordInput.classList.remove('error-input');
    }

    // Función para cerrar el modal
    window.cerrarModal = function() { // Hacerla global para onclick en HTML
        loginModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaura el scroll
    };

    // Abre el modal al hacer clic en el botón de Login
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que el # en el href recargue la página
            abrirModal();
        });
    }

    // Cierra el modal si se hace clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target == loginModal) {
            cerrarModal();
        }
    });

    //VALIDACIÓN DEL FORMULARIO
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita que el formulario se envíe automáticamente
        let isValid = true;

        // Validar Email
        if (emailInput.value === '') {
            emailError.textContent = 'El correo electrónico es obligatorio.';
            emailInput.classList.add('error-input');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) { // Usa tu propia función de validación
            emailError.textContent = 'Por favor, introduce un correo electrónico válido.';
            emailInput.classList.add('error-input');
            isValid = false;
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('error-input');
        }

        // Validar Contraseña
        if (passwordInput.value === '') {
            passwordError.textContent = 'La contraseña es obligatoria.';
            passwordInput.classList.add('error-input');
            isValid = false;
        } else if (passwordInput.value.length < 6) { // Por ejemplo, mínimo 6 caracteres
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            passwordInput.classList.add('error-input');
            isValid = false;
        } else {
            passwordError.textContent = '';
            passwordInput.classList.remove('error-input');
        }

        if (isValid) {
            //Opción 1: Autenticación Asíncrona (Recomendado para modales)
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries()); // Convierte FormData a objeto JS
            
            fetch('/login', { // Asume que tienes una ruta /login en Flask
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Importante para enviar JSON
                },
                body: JSON.stringify(data), // Envía los datos como JSON
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    toastr.success('¡Inicio de sesión exitoso! Redirigiendo...', 'Login Exitoso');
                    cerrarModal();
                    // Opcional: Redirigir o recargar para reflejar el estado de login
                    setTimeout(() => window.location.reload(), 1500); 
                } else {
                    toastr.error(result.message || 'Credenciales incorrectas.', 'Error de Login');
                    passwordInput.value = ''; // Limpiar contraseña por seguridad
                }
            })
            .catch(error => {
                console.error('Error durante el fetch de login:', error);
                toastr.error('Error de comunicación con el servidor.', 'Error');
            });

            // ### Opción 2: Envío de formulario tradicional (Descomentar si prefieres esto) ###
            // loginForm.submit(); 
        }
    });

    // Función auxiliar para validar formato de email (puedes hacerla más robusta)
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});