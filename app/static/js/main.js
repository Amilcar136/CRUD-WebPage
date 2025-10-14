// 1. Configuración global de Toastr
toastr.options = {
  "closeButton": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "timeOut": "5000"
};

// 2. Función para verificar la conexión al hacer clic en el botón
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

// 3. Función para procesar los mensajes iniciales de Flask
//    Busca la variable 'flashMessages' que crearemos en el HTML.
function procesarFlashesIniciales() {
  if (typeof flashMessages !== 'undefined' && flashMessages.length > 0) {
    flashMessages.forEach(function(message) {
      // Llama a toastr con la categoría ('success', 'error', etc.) y el mensaje
      toastr[message.category](message.text);
    });
  }
}

// 4. Ejecuta la función de los flashes cuando el contenido de la página haya cargado
document.addEventListener('DOMContentLoaded', procesarFlashesIniciales);