import { Router } from 'express'
import * as PreciosController from '../controllers/PreciosController'

const router: Router = Router()

// Rutas para estimación de precios
router.post('/estimacion', PreciosController.obtenerPrecioEstimado)
router.post('/analisis', PreciosController.analizarDescripcion)
router.get('/palabrasClaveDisponibles', PreciosController.obtenerPalabrasClaveDisponibles)

export default router 