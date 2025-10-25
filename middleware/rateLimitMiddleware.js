const rateLimit = require('express-rate-limit');

// Общий rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за 15 минут
  message: {
    error: 'Слишком много запросов, попробуйте позже',
    retryAfter: '15 минут'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Строгий лимит для авторизации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за 15 минут
  message: {
    error: 'Слишком много попыток входа, попробуйте позже',
    retryAfter: '15 минут'
  },
  skipSuccessfulRequests: true,
});

// Лимит для API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 30, // максимум 30 запросов в минуту
  message: {
    error: 'Превышен лимит API запросов',
    retryAfter: '1 минута'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter
};
