import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";

type ValidateOptions = {
  strict?: boolean;
};

export const validate = (schema: ZodObject, options: ValidateOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeSchema = options.strict ? schema.strict() : schema;

      await activeSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation Failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };