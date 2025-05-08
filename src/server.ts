import express, { Application } from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import db from './config/db'
import { User } from './models/User'

export async function connectDB() {
    try {
        await db.authenticate()
        console.log('Conexión exitosa a la base de datos')
        
        // Primero sincronizamos los modelos
        await db.sync()
        console.log('Modelos sincronizados correctamente')

        const adminExists = await User.findOne({
            where: { username: 'Admin' }
        })

        if (!adminExists) {
            await User.create({
                username: 'Admin',
                password: 'admin',
                role: 'Admin'
            });
        }
        

    } catch (error) {
        console.error('Error al conectar con la base de datos:', error)
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1)
        }
    }
}

// Conectar a la base de datos antes de iniciar el servidor
connectDB()

const app: Application = express()

// Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Para poder recibir datos en formato JSON
app.use(express.json())

// Routes
app.use('/api/users', userRoutes)


export default app