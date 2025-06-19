import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
