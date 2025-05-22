import Joi from "joi";


export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters",
    "string.max": "Name should not exceed 50 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a 10-digit number",
      "string.empty": "Phone number is required",
    }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),

  userType: Joi.string().valid("individual", "business").optional().messages({
    "any.only": "User type must be either individual or business",
  }),
});

export const verifyOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  otp: Joi.string().length(6).required(),
});

export const loginWithPasswordSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const loginWithOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
});

export const sendOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
});


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});




