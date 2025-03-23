import jwt from 'jsonwebtoken';

import { SECRET_KEY } from '../config.js';

export const authRequired = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const data = jwt.verify(token, SECRET_KEY,)
    req.user = data
    next();
  } catch (e) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};