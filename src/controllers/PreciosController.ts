import { Request, Response } from "express";
const { buscarPrecioEnEbay } = require("../utils/scraper");
const { convertirMXNaDOP } = require("../utils/conversion");
const palabrasClaveMotos = require("../utils/palabras");

/**
 * Devuelve un precio estimado para una pieza específica
 */
export const obtenerPrecioEstimado = async (req: Request, res: Response) => {
    try {
        const { consulta } = req.body;
        
        if (!consulta) {
            res.status(400).json({ message: "Se requiere un término de búsqueda" });
            return 
        }
        
        // Buscar precio en MXN usando el scraper
        const precioMXN = await buscarPrecioEnEbay(`${consulta} motorcycle part`);
        
        // Convertir a DOP
        const precioDOP = await convertirMXNaDOP(precioMXN);
        
        res.status(200).json({
            consulta,
            precioDOP
        });
        return 
    } catch (error) {
        console.error('Error al obtener precio estimado:', error);
        res.status(500).json({ 
            message: "Error al obtener el precio estimado", 
            error 
        });
        return 
    }
}

/**
 * Analiza una descripción completa y devuelve las piezas detectadas con sus precios
 */
export const analizarDescripcion = async (req: Request, res: Response) => {
    try {
        const { descripcion } = req.body;
        
        if (!descripcion) {
            res.status(400).json({ message: "Se requiere una descripción para analizar" });
            return 
        }
        
        // Calcular el total del servicio usando las funciones de scraping
        const resultado = await calcularTotalServicio(descripcion);
        
        // Adaptar la estructura para que coincida con lo que espera el frontend
        const piezasAdaptadas = resultado.piezasDetectadas.map(pieza => ({
            nombre: pieza.nombre,
            precioDOP: pieza.precioDOP
        }));
        
        res.status(200).json({
            piezasDetectadas: piezasAdaptadas,
            totalDOP: resultado.totalDOP
        });
        return 
    } catch (error) {
        console.error('Error al analizar descripción:', error);
        res.status(500).json({ 
            message: "Error al analizar la descripción", 
            error 
        });
        return 
    }
}

/**
 * Devuelve la lista de palabras clave utilizadas para detectar piezas
 */
export const obtenerPalabrasClaveDisponibles = async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            palabrasClaveMotos
        });
        return 
    } catch (error) {
        console.error('Error al obtener palabras clave:', error);
        res.status(500).json({ 
            message: "Error al obtener la lista de palabras clave", 
            error 
        });
        return 
    }
}

/**
 * Función auxiliar para calcular el total del servicio
 */
const calcularTotalServicio = async (descripcion: string) => {
    const descripcionLower = descripcion.toLowerCase();
    const piezasDetectadas = [];
    
    // Buscar coincidencias con palabras clave
    for (const palabra of palabrasClaveMotos) {
        if (descripcionLower.includes(palabra.toLowerCase())) {
            // Buscar precio en MXN usando el scraper
            const precioMXN = await buscarPrecioEnEbay(`${palabra} motorcycle part`);
            const precioDOP = await convertirMXNaDOP(precioMXN);
            
            piezasDetectadas.push({
                nombre: palabra,
                precioDOP: precioDOP
            });
        }
    }
    
    // Costo base del servicio (mano de obra): $35 USD = 2100 DOP
    const costoBaseDOP = 2100.00;
    
    // Sumar el precio de todas las piezas en DOP
    let totalPiezasDOP = 0;
    piezasDetectadas.forEach(pieza => {
        totalPiezasDOP += pieza.precioDOP;
    });
    
    // El total es la suma del costo base más el total de las piezas
    const totalDOP = costoBaseDOP + totalPiezasDOP;
    
    console.log('DEBUG - Cálculo del total:');
    console.log('Costo base (mano de obra):', costoBaseDOP);
    console.log('Total piezas:', totalPiezasDOP);
    console.log('TOTAL FINAL:', totalDOP);
    
    return {
        totalDOP: parseFloat(totalDOP.toFixed(2)),
        piezasDetectadas
    };
} 