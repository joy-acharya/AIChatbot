import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/", UserController.create);
router.get("/", UserController.list);

export default router;
