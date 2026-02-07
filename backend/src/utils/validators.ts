import Joi from 'joi';

/**
 * Validation schemas for API requests
 */

// Authentication
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

// Projects
export const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  location: Joi.string().max(500).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).optional(),
  budget: Joi.number().positive().required(),
  status: Joi.string()
    .valid('planning', 'active', 'complete', 'paused')
    .default('planning'),
});

export const updateProjectSchema = createProjectSchema.fork(
  ['name', 'location', 'start_date', 'budget'],
  (schema) => schema.optional()
);

// Materials
export const createMaterialSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  unit_of_measure: Joi.string().max(50).required(),
  category: Joi.string().max(100).required(),
  min_stock: Joi.number().integer().positive().optional(),
  standard_cost: Joi.number().positive().optional(),
  is_active: Joi.boolean().default(true),
});

export const updateMaterialSchema = createMaterialSchema.fork(
  ['name', 'unit_of_measure', 'category'],
  (schema) => schema.optional()
);

// Vendors
export const createVendorSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  contact_person: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  address: Joi.object().required(),
  gstin: Joi.string().max(50).optional(),
  payment_terms: Joi.string().max(100).required(),
  is_active: Joi.boolean().default(true),
});

export const updateVendorSchema = createVendorSchema.fork(
  [
    'name',
    'contact_person',
    'email',
    'phone',
    'address',
    'payment_terms',
  ],
  (schema) => schema.optional()
);

// Material Requests
export const createRequestSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  description: Joi.string().max(1000).required(),
  required_delivery_date: Joi.date().required(),
  line_items: Joi.array()
    .items(
      Joi.object({
        material_id: Joi.string().uuid().required(),
        quantity: Joi.number().positive().required(),
        unit_price_estimate: Joi.number().positive().optional(),
      })
    )
    .min(1)
    .required(),
  comments: Joi.string().max(1000).optional(),
});

export const updateRequestSchema = createRequestSchema.fork(
  ['project_id', 'description', 'required_delivery_date', 'line_items'],
  (schema) => schema.optional()
);

export const approveRequestSchema = Joi.object({
  approver_id: Joi.string().uuid().required(),
  comments: Joi.string().max(500).optional(),
});

export const rejectRequestSchema = Joi.object({
  rejector_id: Joi.string().uuid().required(),
  reason: Joi.string().max(500).required(),
});

// Quotes
export const createQuoteSchema = Joi.object({
  request_id: Joi.string().uuid().required(),
  vendor_id: Joi.string().uuid().required(),
  quote_number: Joi.string().max(100).required(),
  quote_date: Joi.date().required(),
  validity_date: Joi.date().min(Joi.ref('quote_date')).required(),
  total_amount: Joi.number().positive().required(),
  line_items: Joi.array()
    .items(
      Joi.object({
        material_id: Joi.string().uuid().required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required(),
        delivery_time: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
  payment_terms: Joi.string().max(100).required(),
  delivery_location: Joi.string().max(500).required(),
});

export const updateQuoteSchema = createQuoteSchema.fork(
  [
    'request_id',
    'vendor_id',
    'quote_number',
    'quote_date',
    'validity_date',
    'total_amount',
    'line_items',
    'payment_terms',
    'delivery_location',
  ],
  (schema) => schema.optional()
);

// Purchase Orders
export const createPOSchema = Joi.object({
  request_id: Joi.string().uuid().required(),
  quote_id: Joi.string().uuid().required(),
  special_instructions: Joi.string().max(1000).optional(),
  delivery_address: Joi.object().optional(),
});

export const approvePOSchema = Joi.object({
  approval_limit: Joi.number().positive().required(),
  comments: Joi.string().max(500).optional(),
});

export const rejectPOSchema = Joi.object({
  reason: Joi.string().max(500).required(),
});

// Pagination
export const paginationSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  page_size: Joi.number().integer().positive().default(20).max(100),
  sort_by: Joi.string().max(50).optional(),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Validate request data against a schema
 */
export function validate(
  data: unknown,
  schema: Joi.ObjectSchema
): { error?: string; details?: unknown; value?: unknown } {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return {
      error: 'Validation failed',
      details,
    };
  }

  return { value };
}
