import { Request, Response } from "express";
import { dataCollectorService } from "../services";
import { envConfig } from "../config";


export const registerDataCollector = async (req: Request, res: Response) => {
    const collectorData = req.body;
    const collector = await dataCollectorService.createDataCollector(collectorData);

    const telegramRedirect = `https://t.me/${envConfig.botUsername}`;

    res.status(201).json({
        message: "Data collector registered successfully",
        collector,
        redirect: telegramRedirect
    });
};



export const getDataCollectors = async (req: Request, res: Response) => {
    const collectors = await dataCollectorService.getAllDataCollectors();
    
    res.status(200).json({
        message: "Data collectors retrieved successfully",
        data: collectors
    });
};


export const getDataCollector = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const collector = await dataCollectorService.getDataCollectorById(id);

    if (!collector) {
        return res.status(404).json({
            message: "Data collector not found"
        });
    }

    res.status(200).json({
        message: "Data collector retrieved successfully",
        data: collector
    });
};