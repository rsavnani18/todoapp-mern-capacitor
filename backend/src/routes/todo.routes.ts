import { Router, type Router as RouterType } from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  convertTodoToNote,
} from "../controllers/todo.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router: RouterType = Router();

router.use(protect);

router.route("/").get(getTodos).post(createTodo);
router.route("/:id").get(getTodoById).patch(updateTodo).delete(deleteTodo);
router.post("/:id/convert-to-note", convertTodoToNote);

export default router;
