import { Request, Response } from "express";
import { authService } from "../services";




export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    
    return res.status(200).json({ user, token });
};

export const loginDataCollector = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const { collector, token } = await authService.loginDataCollector(phone, password);
    
    return res.status(200).json({ collector, token });
}



export const resetDataCollectorPassword = async (req: Request, res: Response) => {
    const collectorId = req.params.id as string;

    await authService.resetDataCollectorPassword(collectorId);
    
    return res.status(200).json({ message: "Password reset successfully" });
}