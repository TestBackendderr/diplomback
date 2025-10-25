const fs = require('fs');
const path = require('path');

// Создаем папку для логов если её нет
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logToFile = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  const logFile = path.join(logsDir, `${type}.log`);
  fs.appendFileSync(logFile, logMessage);
};

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Логируем запрос
  logToFile(`${req.method} ${req.url} - IP: ${req.ip}`, 'access');
  
  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Логируем ответ
    logToFile(`${req.method} ${req.url} - ${status} - ${duration}ms`, 'response');
    
    // Логируем ошибки
    if (status >= 400) {
      logToFile(`ERROR: ${req.method} ${req.url} - ${status} - ${data}`, 'error');
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = loggerMiddleware;
