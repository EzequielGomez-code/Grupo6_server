import { User } from "../models/User"
import { Request, Response } from "express"

export class AuthController {

    static async createUser(req: Request, res: Response) {

        const { username, password } = req.body

        const user = await User.create({ username, password })

        res.status(201).json(user)
    }

    static async login(req: Request, res: Response) {
        
        const { username, password } = req.body

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' })
            return 
        }

        const user = await User.findOne({ where: { username, password } })

        res.status(200).json(user)
    }

}
