import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title too short").max(100),
    description: z.string().optional(),
    videoCount: z.coerce.number().int().nonnegative("Must be 0 or more").default(0),
    imageCount: z.coerce.number().int().nonnegative("Must be 0 or more").default(0),
  }),
});

export const reassignTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid Task ID format"), // Validates it's a Prisma CUID
  }),
  body: z.object({
    collectorId: z.string().cuid("Invalid Collector ID format"),
  }),
});