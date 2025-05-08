import axios from 'axios';

// Configuración de API de WhatsApp
const API_KEY = '4837252'; // API KEY para CallMeBot

/**
 * Envía un mensaje a través de WhatsApp usando CallMeBot API
 * @param telefono Número de teléfono del destinatario (formato internacional)
 * @param mensaje Texto del mensaje a enviar
 * @returns Promise<boolean> Éxito o fracaso del envío
 */
export const enviarMensajePorWhatsApp = async (telefono: string, mensaje: string): Promise<boolean> => {
  try {
    // Formatear el teléfono si es necesario
    const phoneNumber = telefono.replace(/\s+/g, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Construir la URL para la API
    const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodeURIComponent(mensaje)}&apikey=${API_KEY}`;
    
    // Realizar la petición
    const response = await axios.get(url);
    console.log('✅ Mensaje enviado:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar mensaje por CallMeBot:', error.message);
    return false;
  }
};

/**
 * Notifica una actualización de servicio al cliente y al administrador
 * @param clienteInfo Información del cliente y el servicio
 * @param estadoAnterior Estado anterior del servicio
 * @param estadoNuevo Estado nuevo del servicio
 */
export const notificarCambioEstadoServicio = async (
  clienteInfo: {
    telefono: string;
    nombreCompleto: string;
    codigoMoto: string;
  },
  estadoAnterior: string,
  estadoNuevo: string
): Promise<void> => {
  if (estadoAnterior === estadoNuevo) {
    return; // No notificar si el estado no cambió
  }

  try {
    // Mensaje para el cliente
    const mensajeCliente = `Hola, soy el bot de servicio de motos. Su servicio con código ${clienteInfo.codigoMoto} ha sido actualizado al estado: ${estadoNuevo}`;
    
    // Número de teléfono del administrador para notificaciones
    const adminPhone = "+18294747447";
    
    // Mensaje para el administrador
    const mensajeAdmin = `Actualización de servicio: El servicio ${clienteInfo.codigoMoto} para ${clienteInfo.nombreCompleto} ha cambiado de estado de ${estadoAnterior} a: ${estadoNuevo}`;
    
    // Enviar mensajes
    await enviarMensajePorWhatsApp(clienteInfo.telefono, mensajeCliente);
    await enviarMensajePorWhatsApp(adminPhone, mensajeAdmin);
    
    console.log('Notificaciones de cambio de estado enviadas exitosamente');
  } catch (error) {
    console.error('Error al enviar notificaciones de cambio de estado:', error);
  }
};

/**
 * Notifica al cliente sobre un nuevo servicio registrado
 * @param servicioInfo Información del cliente y el servicio
 */
export const notificarNuevoServicio = async (
  servicioInfo: {
    telefono: string;
    nombreCompleto: string;
    codigoMoto: string;
    total: number;
  }
): Promise<void> => {
  try {
    // Formatear el total con 2 decimales y separador de miles
    const totalFormateado = servicioInfo.total.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Mensaje para el cliente
    const mensajeCliente = 
      `¡Hola ${servicioInfo.nombreCompleto}! Su servicio ha sido registrado exitosamente.\n\n` +
      `📝 Código de seguimiento: ${servicioInfo.codigoMoto}\n` +
      `💰 Total estimado: RD$${totalFormateado}\n\n` +
      `Puede consultar el estado de su servicio en cualquier momento usando su cédula o código de moto en nuestra página web.\n\n` +
      `Gracias por confiar en nuestro taller. ¡Estamos trabajando en su moto!`;
    
    // Número de teléfono del administrador para notificaciones
    const adminPhone = "+18294747447";
    
    // Mensaje para el administrador
    const mensajeAdmin = 
      `✅ Nuevo servicio registrado:\n\n` +
      `👤 Cliente: ${servicioInfo.nombreCompleto}\n` +
      `🏍️ Código: ${servicioInfo.codigoMoto}\n` +
      `💵 Total: RD$${totalFormateado}`;
    
    // Enviar mensajes
    await enviarMensajePorWhatsApp(servicioInfo.telefono, mensajeCliente);
    await enviarMensajePorWhatsApp(adminPhone, mensajeAdmin);
    
    console.log('Notificaciones de nuevo servicio enviadas exitosamente');
  } catch (error) {
    console.error('Error al enviar notificaciones de nuevo servicio:', error);
  }
}; 