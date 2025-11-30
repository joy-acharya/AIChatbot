import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import { CreateUserDTO, User } from "./user.types";

export class UserService {
  static async createUser(data: CreateUserDTO): Promise<User> {
    const { name, email, password } = data;

    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name, email, passwordHash]
    );

    return {
      id: result.insertId,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    };
  }

  static async getAllUsers(): Promise<User[]> {
    const [rows]: any = await pool.query(
      `SELECT id, name, email, password_hash AS passwordHash, created_at AS createdAt FROM users`
    );

    return rows;
  }
}
