import { Request, Response } from "express";
import { submissionService } from "../services";
import { BadRequestError, NotFoundError } from "../errors/api.error";


export const createSubmission = async (req: Request, res: Response) => {
  const { taskId, uploadUrl, mediaType } = req.body;

  if (typeof taskId !== "string" || !taskId.trim()) {
    throw new BadRequestError("taskId is required");
  }

  if (typeof uploadUrl !== "string" || !uploadUrl.trim()) {
    throw new BadRequestError("uploadUrl is required");
  }

  const submission = await submissionService.createSubmission({
    taskId: taskId.trim(),
    uploadUrl: uploadUrl.trim(),
    mediaType,
    collectorId: req.user.id,
  });

  await submissionService.submitTaskIfRequirementSatisfied(taskId.trim(), req.user.id);

  if (!submission) throw new NotFoundError("Submission not created");

  return res.status(201).json({
    message: "Submission created successfully",
    submission,
  });
};

export const getSubmissions = async (req: Request, res: Response) => {
  const submissions = await submissionService.getAllSubmissions();
  return res.status(200).json(submissions);
};

export const getSubmission = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const submission = await submissionService.getSubmissionById(id);
  if (!submission) throw new NotFoundError("Submission not found");

  return res.status(200).json(submission);
};

export const updateSubmission = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = req.body;

  const submission = await submissionService.updateSubmission(id, { ...data, reviewedById: req.user.id });
  if (!submission) throw new NotFoundError("Submission not found or not updated");

  return res.status(200).json({
    message: "Submission updated successfully",
    submission,
  });
};
