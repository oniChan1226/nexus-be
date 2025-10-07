import { NextFunction, Request, Response } from "express"
import { ZodObject, ZodError } from "zod"

/**
 * Generic Zod validation middleware.
 * Accepts a schema like z.object({ body, params, query })
 */
export const validateResource =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.issues,
        })
      }
      next(err)
    }
  }
