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
  brand: joi.string().max(100).required()
})

const productUpdateSchema = joi.object({
  name: joi.string().min(3).max(100).optional(),
  description: joi.string().max(500).optional(),
  price: joi.number().positive().optional(),
  category: joi.string().max(100).optional(),
  stock: joi.number().integer().min(0).optional(),
  details: joi.string().max(1000).optional(),
  brand: joi.string().max(100).optional()
}).min(1)

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
  childrenIds: joi.array().items(joi.string().hex().length(24)).optional()
})

const updateCategorySchema = joi.object({
  name: joi.string().min(3).max(100).optional(),
  description: joi.string().max(500).optional(),
  childrenIds: joi.array().items(joi.string().hex().length(24)).optional()
}).min(1)

const createBoxSchema = joi.object({
  name: joi.string().min(3).max(100).required(),
  description: joi.string().max(500).required(),
  products: joi.array().items(joi.string().hex().length(24)).min(1).required(),
  stock: joi.number().integer().min(0).required(),
  images: joi.array().items(joi.string().uri()).min(1).required(),
  isGift: joi.boolean().default(false)
})

const createSubcribePlanSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  planType: joi.string().valid('1_month', '3_month', '6_month', '12_month').required(),
  totalDeliveries: joi.number().integer().min(1).required(),
  shippingAddress: joi.object({
    address: joi.string().max(255).required(),
    district: joi.string().max(100).required(),
    city: joi.string().max(100).required(),
    country: joi.string().max(100).required(),
    zipCode: joi.string().max(10).required(),
    phone: joi.string().pattern(/^[0-9()+\s-]{7,20}$/).required()
  }).required(),
  price: joi.number().positive().required(),
  oldPrice: joi.number().positive().required(),
  discount: joi.number().positive().required(),
  discountPercent: joi.number().positive().required(),
  gift: joi.array().items(joi.object({
    boxId: joi.string().hex().length(24).required(),
    quantity: joi.number().integer().min(1).required()
  })).required()
})


module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  productSchema,
  productUpdateSchema,
  updateAddressSchema,
  updateBrandSchema,
  brandSchema,
  updateUserSchema,
  idParamSchema,
  categorySchema,
  updateCategorySchema,
  createBoxSchema,
  createSubcribePlanSchema
};
