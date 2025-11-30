import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      const {passwordHash, ...safeUser} = user;
      return res.status(201).json(safeUser);
    } catch (err: any) {
      console.error("Create user error:", err);
      return res.status(500).json({ message: "Error creating user" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      const safeUsers = users.map(({passwordHash, ...rest}) => rest);
      return res.json(safeUsers);
    } catch (err: any) {
      console.error("List user error:", err);
      return res.status(500).json({ message: "Error fetching users" });
    }
  }
}
