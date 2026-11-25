import { Router, type Router as RouterType } from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  toggleChecklistItem,
  deleteNotePermanent,
  emptyTrash,
  convertNoteToTodos,
} from "../controllers/note.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router: RouterType = Router();

router.use(protect);

router.delete("/trash/empty", emptyTrash);
router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNoteById).patch(updateNote).delete(deleteNotePermanent);
router.patch("/:id/checklist/:itemId", toggleChecklistItem);
router.post("/:id/convert-to-todos", convertNoteToTodos);

export default router;
