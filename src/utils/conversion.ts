// Simula una tasa de cambio real (puedes modificarla según la tasa actual)
const TASA_MXN_A_DOP = 3.1;

const convertirMXNaDOP = async (montoMXN) => {
  try {
    // Asegurar que el monto es un número
    const monto = parseFloat(montoMXN) || 0;
    
    // Convertir y redondear a 2 decimales
    const montoDOP = parseFloat((monto * TASA_MXN_A_DOP).toFixed(2));
    
    console.log(`Conversión: ${montoMXN} MXN = ${montoDOP} DOP (tasa: ${TASA_MXN_A_DOP})`);
    
    return montoDOP;
  } catch (error) {
    console.error('❌ Error al convertir moneda:', error.message);
    return montoMXN;
  }
};

module.exports = { convertirMXNaDOP };
