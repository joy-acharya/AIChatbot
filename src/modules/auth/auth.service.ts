import jwt, { Secret, SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import { RegisterDTO, LoginDTO, JWTPayload } from "./auth.types";
import dotenv from "dotenv";


dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || "defaultsecret";
const JWT_EXPIRES_IN: StringValue | number = (process.env.JWT_EXPIRES_IN as StringValue) || "7d";



export class AuthService {
  static async register(data: RegisterDTO) {
    const { name, email, password } = data;

    // 1. Check if email already exists
    const [existing]: any = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (existing.length > 0) {
      throw new Error("Email already exists");
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert new user
    const [result]: any = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name, email, passwordHash]
    );

    const userId = result.insertId;

    // 4. Generate JWT
    const token = this.generateToken({ id: userId, email });

    return {
      id: userId,
      name,
      email,
      token,
    };
  }

  static async login(data: LoginDTO) {
    const { email, password } = data;

    const [rows]: any = await pool.query(
      `SELECT id, name, email, password_hash FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = rows[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("Invalid email or password");

    const token = this.generateToken({ id: user.id, email: user.email });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }
}
