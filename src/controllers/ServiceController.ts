import { Request, Response } from "express"
import { RegisterService } from "../models/RegisterService"
import { User } from "../models/User";
import { notificarCambioEstadoServicio, notificarNuevoServicio } from "../utils/whatsapp";
const { buscarPrecioEnEbay } = require("../utils/scraper");
const { convertirMXNaDOP } = require("../utils/conversion");
const palabrasClaveMotos = require("../utils/palabras");
import { Op } from "sequelize";

export class ServiceController {

    static async createService(req: Request, res: Response) {
        try {
            // Extraer el id del usuario que crea el servicio
            const { userId } = req.params;
            const serviceData = req.body;
            
            if (!userId) {
                res.status(400).json({ 
                   message: "El ID del usuario es requerido para crear un servicio" 
               });
                return
            }
            
            // Calcular el total basado en la descripción del servicio usando web scraping
            let totalMXN = 0;
            let totalDOP = 0;
            let piezasDetectadas = [];
            
            if (serviceData.descripcionServicio) {
                try {
                    // Usar la misma lógica que en PreciosController pero aquí directamente
                    const descripcionLower = serviceData.descripcionServicio.toLowerCase();
                    
                    // Costo base del servicio (mano de obra)
                    const costoBaseDOP = 2100.00;
                    
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
                            
                            totalMXN += precioMXN;
                        }
                    }
                    
                    // Sumar el precio de todas las piezas en DOP
                    let totalPiezasDOP = 0;
                    piezasDetectadas.forEach(pieza => {
                        totalPiezasDOP += pieza.precioDOP;
                    });
                    
                    // El total es la suma del costo base más el total de las piezas
                    totalDOP = costoBaseDOP + totalPiezasDOP;
                    
                    // Log para depuración
                    console.log('Piezas detectadas:', piezasDetectadas);
                    console.log('Total calculado (MXN):', totalMXN);
                    console.log('Total calculado (DOP):', totalDOP);
                    
                    // Actualizar los totales en los datos del servicio
                    serviceData.total = totalMXN;
                    serviceData.totalDOP = totalDOP;
                } catch (preciosError) {
                    console.error('Error al calcular precios:', preciosError);
                    // Si hay un error, usar valores por defecto
                    serviceData.total = 35.00;
                    serviceData.totalDOP = 2100.00;
                }
            }
            
            // Crear el servicio con el ID del usuario y los totales calculados
            const service = await RegisterService.create({
                ...serviceData,
                userId
            });
            
            // Enviar notificación por WhatsApp al cliente
            if (service.telefono) {
                try {
                    await notificarNuevoServicio({
                        telefono: service.telefono,
                        nombreCompleto: service.nombreCompleto,
                        codigoMoto: service.codigoMoto,
                        total: service.totalDOP || service.total * 3.1 // Usar tasa MXN a DOP
                    });
                    console.log('Notificación WhatsApp enviada al cliente');
                } catch (notifyError) {
                    console.error("Error al enviar notificación WhatsApp:", notifyError);
                    // Continuamos con la creación aunque falle la notificación
                }
            }

            res.status(201).json(service);
        } catch (error) {
            console.error("Error al crear servicio:", error);
            res.status(500).json({ 
                message: "Error al crear el servicio", 
                error 
            });
        }
    }

    static async getServices(req: Request, res: Response) {
        try {
            // Obtener todos los servicios con la información del usuario que los creó
            const services = await RegisterService.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username', 'role'] // Solo incluir estos atributos del usuario
                    }
                ]
            });

            res.status(200).json(services);
        } catch (error) {
            console.error("Error al obtener servicios:", error);
            
            // Si hay un error con eager loading, intentar obtener solo los servicios
            try {
                const services = await RegisterService.findAll();
                res.status(200).json(services);
            } catch (fallbackError) {
                res.status(500).json({ 
                    message: "Error al obtener los servicios", 
                    error 
                });
            }
        }
    }

    static async getServiceByCedula(req: Request, res: Response) {
        try {
            const { cedula, codigoMoto } = req.body;
            
            console.log("Búsqueda recibida:", { cedula, codigoMoto });
            
            // Verificar que al menos uno de los parámetros esté presente y no sea una cadena vacía
            if ((!cedula || cedula === "") && (!codigoMoto || codigoMoto === "")) {
                res.status(400).json({ 
                    message: "Se requiere al menos la cédula o el código de moto para realizar la búsqueda" 
                });
                return 
            }
            
            // Construir la condición de búsqueda
            const whereCondition: any = {};
            if (cedula && cedula !== "") whereCondition.cedula = cedula;
            if (codigoMoto && codigoMoto !== "") whereCondition.codigoMoto = codigoMoto;
            
            console.log("Condición de búsqueda:", whereCondition);
            
            // Si ambos están presentes, buscará un registro que coincida con ambos
            const service = await RegisterService.findOne({
                where: whereCondition
            });

            res.status(200).json(service);
            
            
        } catch (error) {
            console.error("Error al buscar servicio:", error);
            res.status(500).json({ 
                message: "Error al obtener el servicio", 
                error 
            });
            return 
        }
    }
    
    static async getServicesByUser(req: Request, res: Response) {
        const { cedula } = req.params;
        
        try {
                const services = await RegisterService.findAll({
                where: { cedula }
            });
            
            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ 
                message: "Error al obtener el historial de servicios del usuario",
                error
            });
        }
    }

    static async updateService(req: Request, res: Response) {
        try {
            const service = await RegisterService.findByPk(req.params.id)
            
            if (!service) {
                res.status(404).json({ message: "Servicio no encontrado" });
                return 
            }
            
            const prevState = service.estado;
            await service.update(req.body);
            
            // Si el estado ha cambiado, enviar notificación por WhatsApp
            if (prevState !== service.estado && service.telefono) {
                try {
                    // Usar la función de utilidad para notificar
                    await notificarCambioEstadoServicio(
                        {
                            telefono: service.telefono,
                            nombreCompleto: service.nombreCompleto,
                            codigoMoto: service.codigoMoto || service.id.toString()
                        },
                        prevState,
                        service.estado
                    );
                } catch (notifyError) {
                    console.error("Error al enviar notificaciones:", notifyError);
                    // Continuamos con la actualización aunque falle la notificación
                }
            }
            
            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ 
                message: "Error al actualizar el servicio", 
                error 
            });
        }
    }

    static async deleteService(req: Request, res: Response) {
        try {
            const service = await RegisterService.findByPk(req.params.id)

            if (!service) {
                res.status(404).json({ message: "Servicio no encontrado" });
                return;
            }

            await service.destroy()
            res.status(200).json({ message: "Servicio eliminado correctamente" })
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar el servicio",
                error
            });
        }
    }
}
