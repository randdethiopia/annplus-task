import { Router } from "express";
import { getDataCollectors, registerDataCollector } from "../controllers/data-collector.controller";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

const adminRoles = ["SUPERADMIN", "TEAMLEAD", "SUPERVISOR"] as const;

/**
 * @swagger
 * /api/data-collector/register:
 *   post:
 *     summary: Register a new data collector
 *     tags: [DataCollector]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               telegramUsername:
 *                 type: string
 *     responses:
 *       201:
 *         description: Data collector registered successfully
 *       400:
 *         description: Invalid request
 */
router.post("/register", registerDataCollector)



/**
 * @swagger
 * /api/data-collector:
 *   get:
 *     summary: Get all data collectors
 *     tags: [DataCollector]
 *     responses:
 *       200:
 *         description: Data collectors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   telegramUsername:
 *                     type: string
 */
router.get("/", verifyToken, authorizeRoles(...adminRoles), getDataCollectors)

export default router;