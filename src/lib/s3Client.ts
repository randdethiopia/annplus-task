import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime-types";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (localFilePath: string, key: string) => {
  const fileStream = fs.createReadStream(localFilePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: fileStream,
    })
  );

  const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return fileUrl;
};


export const generateS3Key = (type: "video" | "image", filename: string) => {
  return `${type}s/${Date.now()}_${path.basename(filename)}`;
};


export const generatePresignedUploadUrl = async (
  filename: string,
) => {
  const expiresIn = 3600;
  const contentType = mime.lookup(filename) || "application/octet-stream";
  const key = nanoid() + "_" + path.basename(filename);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  
  return {
    key,
    uploadUrl,
    objectUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    contentType,
  };
};
