const axios = require('axios');
const cheerio = require('cheerio');

const buscarPrecioEnEbay = async (consulta) => {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(consulta)}&_sop=12&_ipg=10`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let precios = [];

    $('span.s-item__price').each((i, el) => {
      const texto = $(el).text().replace(/[^\d.,]/g, '').replace(',', '');
      const numero = parseFloat(texto);
      if (!isNaN(numero)) precios.push(numero);
    });

    if (precios.length === 0) return 0;

    // Promedio de los 5 primeros precios
    const topPrecios = precios.slice(0, 5);
    const promedio = topPrecios.reduce((a, b) => a + b, 0) / topPrecios.length;
    return promedio;
  } catch (error) {
    console.error('❌ Error al hacer scraping:', error.message);
    return 0;
  }
};

module.exports = { buscarPrecioEnEbay };
