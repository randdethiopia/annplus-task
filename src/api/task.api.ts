import { Router } from "express";
import {
  createTask,
  getTasks,
  getTasksByCollector,
  getTaskById,
  assignUserToTask,
  reviewTask,
  getCollectorTasks,
  archiveTask,
  reassignTask,
} from "../controllers/task.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               videoCount:
 *                 type: integer
 *               imageCount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/", verifyToken, createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get list of tasks
 *     tags: [Task]
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", getTasks);

/**
 * @swagger
 * /api/tasks/collector-tasks:
 *   get:
 *     summary: Get tasks for authenticated user
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUBMITTED]
 *     responses:
 *       200:
 *         description: User tasks retrieved successfully
 */
router.get("/collector-tasks", verifyToken, getCollectorTasks);

/**
 * @swagger
 * /api/tasks/collector/{collectorId}:
 *   get:
 *     summary: Get tasks for a specific data collector
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUBMITTED]
 *     responses:
 *       200:
 *         description: Collector tasks retrieved successfully
 */
router.get("/collector/:collectorId", getTasksByCollector);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   type: object
 *                 images:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                 videos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 */
router.get("/:id", getTaskById);


/** * @swagger
 * /api/tasks/archive/{id}:
 *   post:
 *     summary: Archive a task
 *     tags: [Task]
 *     responses:
 *       200:
 *         description: Task archived successfully
 */
router.post("/archive/:id", verifyToken, archiveTask);


/**
 * @swagger
 * /api/tasks/assign/{id}:
 *   post:
 *     summary: Assign users to a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collectorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users assigned to task successfully
 */
router.post("/assign/:id", verifyToken, assignUserToTask);



router.post("/reassign/:id", verifyToken, reassignTask);

/**
 * @swagger
 * /api/tasks/review/{id}:
 *   post:
 *     summary: Review a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reviewerNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task reviewed successfully
 */
router.post("/review/:id", verifyToken, reviewTask);

export default router;
