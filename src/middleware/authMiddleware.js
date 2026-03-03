const jwt = require('jsonwebtoken');


// ===============================
// AUTHENTICATE USER
// ===============================
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// ===============================
// ADMIN ONLY ACCESS
// ===============================
exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};


// ===============================
// TENANT ONLY ACCESS
// ===============================
exports.authorizeTenant = (req, res, next) => {
  if (req.user.role !== 'tenant') {
    return res.status(403).json({ message: "Tenant access only" });
  }

  next();
};