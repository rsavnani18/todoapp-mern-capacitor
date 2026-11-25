import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Todo } from "../models/todo.model.js";
import { Note } from "../models/note.model.js";
import { createTodoSchema, updateTodoSchema } from "../validators/todo.validator.js";
import { escapeRegex } from "../utils/regex.js";

export const getTodos = async (req: Request, res: Response): Promise<void> => {
  const userId = new mongoose.Types.ObjectId(req.user?.id);
  const { completed, priority, search, sort } = req.query;

  const matchStage: Record<string, unknown> = { user: userId };

  if (completed === "true" || completed === "false") {
    matchStage.completed = completed === "true";
  }

  if (typeof priority === "string" && ["low", "medium", "high"].includes(priority)) {
    matchStage.priority = priority;
  }

  if (typeof search === "string" && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    matchStage.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (sort === "dueDate") {
    const todos = await Todo.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          hasDueDate: {
            $cond: [{ $ifNull: ["$dueDate", false] }, 0, 1],
          },
        },
      },
      { $sort: { hasDueDate: 1, dueDate: 1, createdAt: -1 } },
      { $project: { hasDueDate: 0, __v: 0 } },
    ]);

    res.status(200).json({
      success: true,
      count: todos.length,
      todos,
    });
    return;
  }

  const sortOption: Record<string, 1 | -1> =
    sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const todos = await Todo.find(matchStage).sort(sortOption);

  res.status(200).json({
    success: true,
    count: todos.length,
    todos,
  });
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid todo ID" });
    return;
  }

  const todo = await Todo.findOne({ _id: id, user: req.user?.id });
  if (!todo) {
    res.status(404).json({ success: false, message: "Todo not found" });
    return;
  }

  res.status(200).json({ success: true, todo });
};

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const todo = await Todo.create({
    ...parsed.data,
    user: req.user?.id,
  });

  res.status(201).json({ success: true, todo });
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid todo ID" });
    return;
  }

  const parsed = updateTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const updateData: Record<string, unknown> = {};
  const unsetData: Record<string, 1> = {};

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === null) {
      unsetData[key] = 1;
    } else if (value !== undefined) {
      updateData[key] = value;
    }
  }

  const queryUpdate: Record<string, unknown> = {};
  if (Object.keys(updateData).length > 0) queryUpdate.$set = updateData;
  if (Object.keys(unsetData).length > 0) queryUpdate.$unset = unsetData;

  const todo = await Todo.findOneAndUpdate({ _id: id, user: req.user?.id }, queryUpdate, {
    new: true,
    runValidators: true,
  });

  if (!todo) {
    res.status(404).json({ success: false, message: "Todo not found" });
    return;
  }

  res.status(200).json({ success: true, todo });
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid todo ID" });
    return;
  }

  const todo = await Todo.findOneAndDelete({ _id: id, user: req.user?.id });
  if (!todo) {
    res.status(404).json({ success: false, message: "Todo not found" });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Todo deleted successfully",
  });
};

// Task ko Keep Note mein convert karne ke liye
export const convertTodoToNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid todo ID" });
    return;
  }

  const todo = await Todo.findOne({ _id: id, user: req.user?.id });
  if (!todo) {
    res.status(404).json({ success: false, message: "Todo not found" });
    return;
  }

  const note = await Note.create({
    user: req.user?.id,
    title: todo.title,
    content: todo.description || "",
    type: "text",
    labels: ["from-tasks"],
    ...(todo.dueDate ? { reminderAt: todo.dueDate } : {}),
  });

  res.status(201).json({
    success: true,
    note,
  });
};
