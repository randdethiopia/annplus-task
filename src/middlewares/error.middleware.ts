import { Request, Response, NextFunction } from "express"
import { ApiError } from "../errors/api.error";



export const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = {
        message: "Internal server error",
        status: "500"
    };

    console.log("Error occurred:", err);

    if ( err instanceof ApiError) {
        error.message = err.message;
        error.status = err.status.toString();
    }

    return res.status(Number(error.status)).json(error);
};
