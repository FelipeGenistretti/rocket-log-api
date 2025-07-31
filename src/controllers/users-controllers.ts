import { Prisma } from "@prisma/client"
import { Request, Response } from "express"
import { email, z } from "zod" 
import { hash } from "bcrypt"
import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"

class UsersController {
    async create(request: Request, response: Response){
        const bodySchema = z.object({
            name: z.string().trim().min(1),
            email:z.string().email(),
            password:z.string().min(6)
        })
        const { name, email, password } = await bodySchema.parseAsync(request.body);

        const userWithSameEmail = await prisma.user.findFirst({where:{email}})
        if(userWithSameEmail){
            throw new AppError("User with same email already exists")
        }

        const hashedPassword = await hash(password, 8)

        const user = await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword
            }
        })

        const { password: _, ...userWithoutPassword } = user;

        return response.status(201).json({message: "ok", userWithoutPassword})
    }
}

export { UsersController }