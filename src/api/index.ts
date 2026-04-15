import { Router } from "express";
import User from "./user.api";
import Auth from "./auth.api";
import DataCollector from "./data-collector.api";
import Task from "./task.api"
import Submission from "./submission.api";
import Upload from "./upload.api";

const router = Router();

router.use("/users", User);
router.use("/auth", Auth);
router.use("/data-collector", DataCollector);
router.use("/tasks", Task);
router.use("/submissions", Submission);
router.use("/upload", Upload);





export default router;