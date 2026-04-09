const joi = require('joi');

const registerSchema = joi.object({
  name: joi.string().min(3).max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().required()
});

const resetPasswordSchema = joi.object({
  token: joi.string().required(),
  password: joi.string().min(6).required()
});

const updateUserSchema = joi.object({
  name: joi.string().min(3).max(100).optional(),
  city: joi.string().max(100).optional(),
  district: joi.string().max(100).optional(),
  address: joi.string().max(255).optional(),
  phone: joi.string().pattern(/^[0-9()+\s-]{7,20}$/).optional()
}).min(1);

const idParamSchema = joi.object({
  _id: joi.string().hex().length(24).required()
});

const productSchema = joi.object({
  name: joi.string().min(3).max(100).required(),
  description: joi.string().max(500).required(),
  price: joi.number().positive().required(),
  category: joi.string().max(100).required(),
  stock: joi.number().integer().min(0).required(),
  details: joi.string().max(1000).optional(),
  brand: joi.string().max(100).required(),
  images: joi.array().items(joi.string().uri()).min(1).required()
})

const updateAddressSchema = joi.object({
  country: joi.string().max(100).optional(),
  city: joi.string().max(100).optional(),
  district: joi.string().max(100).optional(),
  address: joi.string().max(255).optional(),
  phone: joi.string().pattern(/^[0-9()+\s-]{7,20}$/).optional()
})

const brandSchema = joi.object({
  name: joi.string().min(3).max(100).required(),
  description: joi.string().max(500).optional(),
  cityAddress: joi.string().max(255).optional(),
  logo: joi.string().uri().optional()
});

const updateBrandSchema = joi.object({
  name: joi.string().min(3).max(100).optional(),
  description: joi.string().max(500).optional(),
  cityAddress: joi.string().max(255).optional(),
  logo: joi.string().uri().optional()
}).min(1);

const categorySchema = joi.object({
  name: joi.string().min(3).max(100).required(),
  description: joi.string().max(500).optional(),
  level: joi.number().integer().required(),
})

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  productSchema,
  updateAddressSchema,
  updateBrandSchema,
  brandSchema,
  updateUserSchema,
  idParamSchema,
  categorySchema
};
