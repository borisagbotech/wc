import jwt from 'jsonwebtoken';
import { dbHelpers } from './db';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify the user still exists
    const user = await dbHelpers.get(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { ...user, token };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

export async function getUserByEmail(email) {
  return await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function createUser({ name, email, password, role = 'user' }) {
  const hashedPassword = await hashPassword(password);
  const result = await dbHelpers.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );

  return {
    id: result.lastID,
    name,
    email,
    role
  };
}
