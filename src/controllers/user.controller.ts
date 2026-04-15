import { Request, Response } from "express"
import { userService } from "../services";
import { NotFoundError } from "../errors/api.error";



export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const user = await userService.createUser({ name, email, password, role });

    res.status(201).json(user);
};  


export const getUsers = async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    
    res.status(200).json(users);
};



export const getUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);

    res.status(200).json(user);
}; 