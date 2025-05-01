let port;
let writer;
let writtableStreamClosed;
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const portSelection = document.getElementById('port_selection');
const disconnectBtn = document.getElementById('disconnect');
const connectionStatus = document.getElementById('connectionStatus');

if(!("serial" in navigator)) {
  portSelection.disabled = true;
  connectionStatus.textContent = "No hay soporte para Web Serial API";
}

portSelection.addEventListener('click', async () => {

  try{

    // Filtra controladores Arduino Uno por Vendor/Product ID
    // Estos valores los obtienes de internet según el modelo de arduino que compres
    const filters = [
      { usbVendorId: 0x2341, usbProductId: 0x0043 },
      { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];

    // Esta línea solicita al usuario seleccionar el puerto al que se quiere conectar
    // Esta acción solo se ejecuta una vez al hacer click en el botón de selección de puerto
    // El puerto seleccionado se guarda en la variable port
    port = await navigator.serial.requestPort({filters});

    // Abre el puerto seleccionado
    // Esta acción es necesaria para poder enviar y recibir datos a través del puerto
    // El puerto se abre con una velocidad de 9600 baudios
    // Esta velocidad es la misma que se usa en el código de Arduino
    // Si el código de Arduino usa una velocidad diferente, debes cambiarla aquí también
    await port.open({ baudRate: 9600 });


    const textEncoder = new TextEncoder();
    const writableStream = port.writable;
    writer = writableStream.getWriter();


    writtableStreamClosed = writer.closed.catch((error) => {
      connectionStatus.textContent = `Error: ${error}`;
    });

    portSelection.disabled = true;
    disconnectBtn.disabled = false;
    connectionStatus.textContent = "Conectado al puerto: " + port.getInfo().usbProductId;
    sendBtn.disabled = false;

  }catch(error){
    console.error('Error al seleccionar el puerto:', error);
  }

});


disconnectBtn.addEventListener('click', async () => {
  if (writer && port) {
    try {
        // Release the lock on the writer
        writer.releaseLock();
        
        // Close the port
        await port.close();
        
        // Update UI
        portSelection.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
        
        console.log('Disconnected from Arduino');
    } catch (error) {
        console.log(`Disconnection error: ${error}`);
    }
  }
});

sendBtn.addEventListener('click', async () => {
  
  // user value handling
  const messageText = userInput.value.trim();
  if (messageText !== "") {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user');
    messageDiv.innerText = messageText;
    chatMessages.appendChild(messageDiv);
    userInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;


    // Esta sección envía el valor al puerto serial
    // El valor se envía como un número entre 0 y 5000
    // TODO: Cambiar el valor al número resultante del cálculo de tiempo
    // para que el Arduino abra la válvula el tiempo necesario
    if(writer){
      try{
        const intValue = parseInt(messageText);
        if(isNaN(intValue) || intValue < 0 || intValue > 5000){
          console.error("El valor no es un número entre 0 y 5000");
          return;
        }
  
        const data = `${intValue}\n`;
        await writer.write(new TextEncoder().encode(data));
        console.log("Valor enviado:", intValue);
  
      }catch(error){
        console.error("Error al enviar el valor:", error);
      }
    }
  }
});

// Permitir enviar con Enter
userInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

