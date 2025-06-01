import Joi from "joi";

export const adminLoginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required()
    .messages({
      "string.email": "Enter a valid email",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

export const adminSignupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters",
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required()
    .messages({
      "string.email": "Enter a valid email",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("admin", "superadmin").required().messages({
    "any.only": "Role must be admin or superadmin",
    "any.required": "Role is required",
  }),
});

export const updateUserByAdminSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/),
  itrType: Joi.string().valid("ITR1", "ITR2", "ITR3", "ITR4"),
  status: Joi.string().valid(
    "pending",
    "in_progress",
    "completed",
    "blocked",
    "pending_on_client",
    "payment_pending"
  ),
  assignedTo: Joi.string().hex().length(24),
});
