import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@utils/errors';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, query, or params
 */
export function validateRequest(
  schema: Joi.ObjectSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ValidationError(
        `Invalid ${source} parameters`,
        details
      );
    }

    // Replace the original data with validated/converted data
    req[source] = value;
    next();
  };
}

/**
 * Validate request body
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return validateRequest(schema, 'body');
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return validateRequest(schema, 'query');
}

/**
 * Validate route parameters
 */
export function validateParams(schema: Joi.ObjectSchema) {
  return validateRequest(schema, 'params');
}
