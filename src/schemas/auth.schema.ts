import { z } from "zod";

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const loginCollectorSchema = z.object({
  body: z.object({
    phone: z.string(),
    password: z.string().min(1, "Password is required"),
  }),
});