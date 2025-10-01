import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SESSION_COOKIE = "session";

// Auth helpers (server-only usage). No direct DB imports here.
export const auth = {
  async hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plain, salt);
  },
  async verifyPassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
  },
  signSession(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  },
  verifySessionToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },
  cookieName: SESSION_COOKIE,
};
