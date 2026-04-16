import { Request, Response } from "express";
import { dataCollectorService, taskService } from "../services";
import { handleTaskAssignment, sendMessage } from "../bot/telegram.bot";
import { SubmissionStatus } from "../generated/prisma/enums";



export const createTask = async (req: Request, res: Response) => {
  const { title, description, videoCount, imageCount } = req.body;
  const task = await taskService.createTask({
    title,
    description,
    createdById: req.user.id,
    videoCount,
    imageCount,
  });

  return res.status(201).json(task);
};

export const getTasks = async (req: Request, res: Response) => {
  const { page, limit, status, sortOrder } = req.query;
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const  { tasks, totalPages, totalCount } = await taskService.getTasks({
    page: parsedPage,
    limit: parsedLimit,
    status: status as SubmissionStatus,
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
    userRole: req.user.role,
    userId: req.user.id,
  });
  
  return res.status(200).json({
     tasks, 
     totalCount,
     totalPages,
     page: parsedPage,
     limit: parsedLimit,
     status: status,
    });
};



export const getTasksByCollector = async (req: Request, res: Response) => {
  const collectorId = req.params.collectorId as string;
  const { page, limit, status } = req.query;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const { tasks, totalPages, totalCount } = await taskService.getTasksByCollector({
    collectorId,
    page: parsedPage,
    limit: parsedLimit,
    status: status as SubmissionStatus,
  });

  return res.status(200).json({
    collectorId,
    tasks,
    totalCount,
    totalPages,
    page: parsedPage,
    limit: parsedLimit,
    status: status ?? null,
  });
};


export const getCollectorTasks = async (req:Request, res: Response) => {
  const collectorId = req.user.id;
  const { page, limit, status } = req.query;


  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const { tasks, totalPages, totalCount } = await taskService.getTasksByCollector({
    collectorId: collectorId,
    page: parsedPage,
    limit: parsedLimit,
    status: status as SubmissionStatus,
  });

  return res.status(200).json({
    collectorId,
    tasks,
    totalCount,
    totalPages,
    page: parsedPage,
    limit: parsedLimit,
    status: status ?? null,
  });
};

export const getTaskById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const taskDetails = await taskService.getTaskById(id, req.user.role, req.user.id);

  return res.status(200).json(taskDetails);
};



export const reviewTask = async (req:Request, res: Response) => {
  const id = req.params.id as string;
  const reviewedById = req.user.id;
  const { status, reviewerNote } = req.body;

  const task = await taskService.reviewTask(id, {
    status,
    reviewerNote,
    reviewedById,
  });

  if (!task) return res.status(404).json({ message: "Task not found" });

  const collector = await dataCollectorService.getDataCollectorByTaskId(task.id);
  const chatId = collector?.telegramChatId;
  if (!chatId) return res.status(200).json(task);

  if (status === SubmissionStatus.REJECTED) {
    await sendMessage(Number(chatId), `Your task "${task.title}" has been rejected. Reason: ${reviewerNote ?? "No reason provided"}`);
  } else if (status === SubmissionStatus.APPROVED) {
    await sendMessage(Number(chatId), `Your task "${task.title}" has been reviewed. Status: ${status}`);
  }

  return res.status(200).json(task);
};


export const archiveTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const task = await taskService.archiveTask(id);

  return res.status(200).json({
    message: `Task archived successfully`,
    data: task,
  });
};

export const assignUserToTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { collectorId } = req.body;
  const { task, collector } = await taskService.assignTaskToCollector(collectorId, id);

  if (task) {
    const { id, title, description } = task;
    await handleTaskAssignment({
      chatId: collector.telegramChatId!,
      taskId: id,
      taskTitle: title,
      taskDescription: description!
    });
  }

  return res.status(200).json(task);
};


export const reassignTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { collectorId } = req.body;
  const { id: createdById } = req.user;

  const newTask = await taskService.recreateRejectedTask(id, createdById);

  const { task, collector } = await taskService.assignTaskToCollector(collectorId, newTask.id);

  if (task) {
    const { id, title, description } = task;
    await handleTaskAssignment({
      chatId: collector.telegramChatId!,
      taskId: id,
      taskTitle: title,
      taskDescription: description!
    });
  }

  return res.status(200).json(task);
};