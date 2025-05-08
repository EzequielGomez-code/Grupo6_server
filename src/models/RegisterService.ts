import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from './User'

@Table({
    tableName: 'RegisterServices'
})

export class RegisterService extends Model<RegisterService> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare cedula: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: () => {
            // Generar un código aleatorio para la moto
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let codigoAleatorio = '';
            for (let i = 0; i < 8; i++) {
                codigoAleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return `MOTO-${codigoAleatorio}`;
        }
    })
    declare codigoMoto: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nombreCompleto: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare telefono: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare email: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare tipoDeMoto: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare placaMoto: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare modeloMoto: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare descripcionServicio: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'Recibido'
    })
    declare estado: string

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0
    })
    declare total: number

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0
    })
    declare totalDOP: number

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare userId: number

    @BelongsTo(() => User)
    declare user: User
}

