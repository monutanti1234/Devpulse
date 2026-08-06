import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token extract karo (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ID se user fetch karke req.user me attach kar do (password omit karke)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Protected route aage badhne do
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};