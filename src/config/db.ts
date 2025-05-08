import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';

import { loadEnvFile } from 'node:process';
import { RegisterService } from '../models/RegisterService';


loadEnvFile()

// Verificar que tenemos la URL de la base de datos
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

 //Inicializar conexión a la base de datos
 const db = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 30000  // Timeout de 30 segundos
    }
  });

//Inicializar modelos
db.addModels([User, RegisterService]);

//const db = new Sequelize(
    //"Grupo6", 
    //'postgres', 
    //'12345678', 
    //{
        //host: 'localhost',
      //dialect: 'postgres',
      //models: [__dirname + '/../models//*.ts'],
      //logging: false
    //}
//)

export default db;