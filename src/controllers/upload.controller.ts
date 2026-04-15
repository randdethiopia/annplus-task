import { Request, Response } from "express";
import { BadRequestError } from "../errors/api.error";
import { generatePresignedUploadUrl } from "../lib/s3Client";

export const getPresignedUploadUrl = async (req: Request, res: Response) => {
  const { filename } = req.body;

  if (typeof filename !== "string" || !filename.trim()) {
    throw new BadRequestError("filename is required");
  }

  const { key, uploadUrl, objectUrl, contentType } = await generatePresignedUploadUrl(filename.trim());

  return res.status(200).json({
    key,
    uploadUrl,
    objectUrl,
    contentType,
  });
};
