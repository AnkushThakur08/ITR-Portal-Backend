import Joi from "joi";

export const personalDetailsSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters",
    "string.max": "Name should not exceed 50 characters",
  }),

  //   email: Joi.string().email().required().messages({
  //     "string.email": "Enter a valid email address",
  //     "string.empty": "Email is required",
  //   }),

  address: Joi.string().required().messages({
    "string.empty": "Address is required",
  }),

  pincode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": "Pincode is required",
      "string.length": "Pincode must be exactly 6 characters",
      "string.pattern.base": "Pincode must contain only digits",
    }),

  pan: Joi.string()
    .length(10)
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i) // PAN format: 5 letters, 4 digits, 1 letter
    .required()
    .messages({
      "string.empty": "PAN is required",
      "string.length": "PAN must be exactly 10 characters",
      "string.pattern.base": "PAN format is invalid",
    }),

  dob: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date",
    "any.required": "Date of birth is required",
  }),

  bankAccountNumber: Joi.string()
    .pattern(/^\d{9,18}$/) // Indian bank accounts usually between 9-18 digits
    .required()
    .messages({
      "string.empty": "Bank account number is required",
      "string.pattern.base": "Bank account number must contain 9 to 18 digits",
    }),

  ifscCode: Joi.string()
    .length(11)
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/i) // IFSC: 4 letters + 0 + 6 alphanumeric
    .required()
    .messages({
      "string.empty": "IFSC code is required",
      "string.length": "IFSC code must be exactly 11 characters",
      "string.pattern.base": "IFSC code format is invalid",
    }),
});

export const incomeSourcesSchema = Joi.object({
  salaryIncome: Joi.boolean().required(),
  rentalIncome: Joi.boolean().required(),
  business: Joi.boolean().required(),
  capitalGains: Joi.boolean().required(),
  foreignSource: Joi.boolean().required(),
  otherSources: Joi.boolean().required(),
});
