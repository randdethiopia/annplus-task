import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/enums";
import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/api.error";



interface UserData {
    name: string;
    email: string;
    password: string;
    role: Role;
}

export const createUser = async (userData: UserData) => {

    try {
        const { name, email, password, role } = userData;
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: role
            },
        });
    
        return user;
        
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ConflictError("User already exists", error.message);
            }
        }
        throw new Error("Failed to create user");
    }
}


export const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
}


export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id: id },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
}