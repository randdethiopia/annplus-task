import { Router } from "express";
import { getPresignedUploadUrl } from "../controllers/upload.controller";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

const adminRoles = ["SUPERADMIN", "TEAMLEAD", "SUPERVISOR"] as const;
const collectorAndAdminRoles = ["DATA_COLLECTOR", ...adminRoles] as const;

/**
 * @swagger
 * /api/upload/presigned-url:
 *   post:
 *     summary: Get a pre-signed S3 upload URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *             properties:
 *               filename:
 *                 type: string
 *                 example: sample-image.png
 *     responses:
 *       200:
 *         description: Pre-signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 uploadUrl:
 *                   type: string
 *                 objectUrl:
 *                  type: string
 *                 contentType:
 *                   type: string
 *       400:
 *         description: Invalid request payload
 */
router.post(
	"/presigned-url",
	verifyToken,
	authorizeRoles(...collectorAndAdminRoles),
	getPresignedUploadUrl
);

export default router;
