import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript'
import { RegisterService } from './RegisterService'

@Table({
    tableName: 'Users'
})

export class User extends Model<User> {

    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true
    })
    declare id: number

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare username: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare password: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'User'
    })
    declare role: string

    @HasMany(() => RegisterService)
    declare services: RegisterService[]

}

