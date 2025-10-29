const rateLimit = require('express-rate-limit');

// Общий rate limiting - увеличены лимиты для development
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 1000, // максимум 1000 запросов за минуту (очень большой лимит для dev)
  message: {
    error: 'Слишком много запросов, попробуйте позже',
    retryAfter: '1 минута'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем rate limiting в development режиме для localhost
    return process.env.NODE_ENV === 'development' && req.hostname === 'localhost';
  }
});

// Строгий лимит для авторизации - увеличен лимит
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 50, // максимум 50 попыток входа за 15 минут (увеличено)
  message: {
    error: 'Слишком много попыток входа, попробуйте позже',
    retryAfter: '15 минут'
  },
  skipSuccessfulRequests: true,
});

// Лимит для API - увеличен лимит
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 500, // максимум 500 запросов в минуту (увеличено)
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
