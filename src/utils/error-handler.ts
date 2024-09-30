import fs from "fs";

export const ErrorHandler = (useTypescript: boolean) => {
  const asyncError = useTypescript
    ? "src/middleware/async-error.ts"
    : "src/middleware/async-error.js";

  const asyncErrorContent = useTypescript
    ? `/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
  (asyncFunc: Function) =>
  (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(asyncFunc(request, response, next)).catch(next);
  };`
    : `export const CatchAsyncError =
  (asyncFunc) =>
  (request, response, next) => {
    Promise.resolve(asyncFunc(request, response, next)).catch(next);
  };`;
  fs.writeFileSync(asyncError, asyncErrorContent);

  const errorHandler = useTypescript
    ? "src/utils/error-handler.ts"
    : "src/utils/error-handler.js";

  const errorHandlerContent = useTypescript
    ? `class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;`
    : `class ErrorHandler extends Error {

  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;`;
  fs.writeFileSync(errorHandler, errorHandlerContent);

  const errors = useTypescript
    ? "src/middleware/error.ts"
    : "src/middleware/error.js";
  const errorContents = useTypescript
    ? `/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/error-handler";

export const middlewareErrorHandler = (
  err: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Set default error code and message if not set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Log the error for debugging purposes
  console.error("Error log:", err);

  // Wrong MongoDB ObjectId error (CastError)
  if (err.name === "CastError") {
    const message = \`Resource not found. Invalid: \${err.path}\`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value: any) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (MongoDB error)
  if (err.code === 11000) {
    const message = \`Duplicate field value entered: \${Object.keys(
      err.keyValue
    ).join(", ")}\`;
    err = new ErrorHandler(message, 400);
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // Missing required parameters
  if (err.name === "MissingRequiredParameters") {
    const message = "Missing required parameters.";
    err = new ErrorHandler(message, 400);
  }

  // Unauthorized access
  if (err.name === "UnauthorizedAccess") {
    const message = "Unauthorized access.";
    err = new ErrorHandler(message, 401);
  }

  // Forbidden access
  if (err.name === "ForbiddenAccess") {
    const message = "Forbidden access.";
    err = new ErrorHandler(message, 403);
  }

  // Send the error response
  response.status(err.statusCode).send({
    success: false,
    message: err.message,
  });
};
`
    : `/* eslint-disable no-unused-vars */
import ErrorHandler from "../utils/error-handler.js";

export const middlewareErrorHandler = (
  err,
  request,
  response,
  next
) => {
  // Set default error code and message if not set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Log the error for debugging purposes
  console.error("Error log:", err);

  // Wrong MongoDB ObjectId error (CastError)
  if (err.name === "CastError") {
    const message = \`Resource not found. Invalid: \${err.path}\`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (MongoDB error)
  if (err.code === 11000) {
    const message = \`Duplicate field value entered: \${Object.keys(
      err.keyValue
    ).join(", ")}\`;
    err = new ErrorHandler(message, 400);
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // Missing required parameters
  if (err.name === "MissingRequiredParameters") {
    const message = "Missing required parameters.";
    err = new ErrorHandler(message, 400);
  }

  // Unauthorized access
  if (err.name === "UnauthorizedAccess") {
    const message = "Unauthorized access.";
    err = new ErrorHandler(message, 401);
  }

  // Forbidden access
  if (err.name === "ForbiddenAccess") {
    const message = "Forbidden access.";
    err = new ErrorHandler(message, 403);
  }

  // Send the error response
  response.status(err.statusCode).send({
    success: false,
    message: err.message,
  });
};
`;
  fs.writeFileSync(errors, errorContents);
};
