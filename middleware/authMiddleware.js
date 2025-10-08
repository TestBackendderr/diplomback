const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.userId = decoded.userId;
    req.userName = decoded.userName;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Access denied. Admin only." });
  }
  next();
};

module.exports = authMiddleware;
module.exports.isAdmin = isAdmin;
