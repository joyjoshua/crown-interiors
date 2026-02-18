/**
 * Validation Middleware Factory
 *
 * Returns an Express middleware that validates `req.body` against
 * a given Joi schema. On failure, passes a Joi error to the global
 * error handler (which formats it into a structured 400 response).
 *
 * Usage in routes:
 *   router.post('/', validate(createInvoiceSchema), controller.create);
 */

/**
 * Creates a middleware that validates the request body with the given Joi schema.
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {import('express').RequestHandler} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: true, // Remove fields not defined in the schema
    });

    if (error) {
      // Pass the Joi error to the global error handler
      return next(error);
    }

    // Replace req.body with the validated & sanitized data
    req.body = value;
    next();
  };
};

module.exports = { validate };
