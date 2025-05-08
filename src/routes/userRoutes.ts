import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { ServiceController } from '../controllers/ServiceController'


const router: Router = Router()

router.post('/', AuthController.createUser)
router.post('/login', AuthController.login)

router.post('/createRegister/:userId', ServiceController.createService )
router.get('/getRegisters', ServiceController.getServices )
router.post('/getRegisterByCedula', ServiceController.getServiceByCedula )
router.get('/getRegisterByUser/:userId', ServiceController.getServicesByUser )
router.put('/updateRegister/:id', ServiceController.updateService )





export default router
