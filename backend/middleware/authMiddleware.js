import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'codementorai_super_secret_jwt_key_2026';

export const protect = async (req, res, next) => {
  let token = req.cookies ? req.cookies.jwt : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Session expired or invalid token. Please log in again.'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this feature.'
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token = req.cookies ? req.cookies.jwt : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      req.user = { id: 'guest_user', role: 'student' };
    }
  } else {
    req.user = { id: 'guest_user', role: 'student' };
  }
  next();
};

export const adminProtect = async (req, res, next) => {
  await protect(req, res, () => {
    const role = req.user ? req.user.role : null;
    if (role === 'admin') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  });
};
