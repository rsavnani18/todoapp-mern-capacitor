import { Router, type Router as RouterType } from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router: RouterType = Router();

// Saare todo routes protected hain
router.use(protect);

router.route("/").get(getTodos).post(createTodo);
router.route("/:id").get(getTodoById).patch(updateTodo).delete(deleteTodo);

export default router;
