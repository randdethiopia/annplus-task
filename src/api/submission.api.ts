import { Router } from "express";
import { createSubmission, getSubmission, getSubmissions, updateSubmission } from "../controllers/submission.controller";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

const adminRoles = ["SUPERADMIN", "TEAMLEAD", "SUPERVISOR"] as const;
const collectorAndAdminRoles = ["DATA_COLLECTOR", ...adminRoles] as const;

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Create a submission
 *     tags: [Submission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - uploadUrl
 *               - mimeType
 *             properties:
 *               taskId:
 *                 type: string
 *               uploadUrl:
 *                 type: string
 *               mediaType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       400:
 *         description: Invalid request body
 *   get:
 *     summary: Get all submissions
 *     tags: [Submission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.post("/", verifyToken, authorizeRoles(...collectorAndAdminRoles), createSubmission);
router.get("/", verifyToken, authorizeRoles(...adminRoles), getSubmissions);


/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get a submission by id
 *     tags: [Submission]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission id
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", verifyToken, authorizeRoles(...collectorAndAdminRoles), getSubmission);


/**
 * @swagger
 * /api/submissions/{id}:
 *   patch:
 *     summary: Update a submission
 *     tags: [Submission]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               approverNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission updated successfully
 */
router.patch("/:id", verifyToken, authorizeRoles(...adminRoles), updateSubmission);

export default router;