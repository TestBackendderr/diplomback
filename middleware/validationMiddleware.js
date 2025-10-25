const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Схемы валидации
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  product: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    opis: Joi.string().max(500),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('weselne', 'dziecięce', 'świąteczne', 'domowe', 'piękne')
  }),
  
  userInfo: Joi.object({
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    address: Joi.string().max(200).optional(),
    city: Joi.string().max(50).optional(),
    postalCode: Joi.string().pattern(/^[0-9]{2}-[0-9]{3}$/).optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};
