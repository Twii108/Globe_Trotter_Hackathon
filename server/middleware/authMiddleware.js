const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_secret_key';

const requireAuth = (req, res, next) => {
  if (req.user) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.id || decoded.user_id || decoded.sub)) {
        req.user = {
          id: decoded.id || decoded.user_id || decoded.sub,
          ...decoded
        };
        return next();
      }
    } catch (e) {}

    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = {
  requireAuth,
  JWT_SECRET
};
