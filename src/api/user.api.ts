import { Router } from "express";
import { getUser, getUsers, registerUser } from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [SUPERVISOR, TEAMLEAD, SUPERADMIN]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: User already exists
 */
router.post("/register", registerUser);


/**
 * @swagger 
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Server error
 */
router.get("/", getUsers);


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: Retrieve a user by their unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/:id", getUser);


export default router;