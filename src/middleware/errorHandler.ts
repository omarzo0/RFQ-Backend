import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";
import { AppError, ValidationError } from "../types";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: any = undefined;

  // Log the error
  logger.error("Error caught by global handler:", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;

    if (error instanceof ValidationError) {
      details = error.details;
    }
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        details = { field: error.meta?.target };
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference to related record";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
        if (process.env.NODE_ENV === "development") {
          details = { code: error.code, meta: error.meta };
        }
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
    if (process.env.NODE_ENV === "development") {
      details = { validation: error.message };
    }
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  } else if (error.name === "ValidationError") {
    // Express-validator or other validation errors
    statusCode = 400;
    message = "Validation failed";
    details = error;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error";
    details = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    error: "Error",
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
