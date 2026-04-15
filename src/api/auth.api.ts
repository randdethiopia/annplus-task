import { Router } from "express";
import { loginDataCollector, loginUser, resetDataCollectorPassword } from "../controllers/auth.controller";

const authRouter = Router();


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */

authRouter.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/data-collector/login:
 *   post:
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Data collector logged in successfully
 */
authRouter.post("/data-collector/login", loginDataCollector);

authRouter.post("/data-collector/:id/reset-password", resetDataCollectorPassword);


export default authRouter;