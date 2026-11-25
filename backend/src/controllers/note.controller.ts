import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Note } from "../models/note.model.js";
import { Todo } from "../models/todo.model.js";
import {
  createNoteSchema,
  updateNoteSchema,
  toggleChecklistItemSchema,
} from "../validators/note.validator.js";
import { escapeRegex } from "../utils/regex.js";

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { search, label, archived, trashed, pinned, color } = req.query;

  const isTrashed = trashed === "true";
  const isArchived = !isTrashed && archived === "true";

  const filter: Record<string, unknown> = {
    user: userId,
    isTrashed,
    ...(!isTrashed ? { isArchived } : {}),
  };

  if (pinned === "true" && !isTrashed && !isArchived) {
    filter.isPinned = true;
  }

  if (typeof color === "string" && color.trim()) {
    filter.color = color.trim();
  }

  if (typeof label === "string" && label.trim()) {
    filter.labels = label.trim().toLowerCase();
  }

  if (typeof search === "string" && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { content: { $regex: safeSearch, $options: "i" } },
      { "checklist.text": { $regex: safeSearch, $options: "i" } },
      { labels: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [notes, availableLabels] = await Promise.all([
    Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }),
    Note.distinct("labels", { user: userId, isTrashed: false }),
  ]);

  res.status(200).json({
    success: true,
    count: notes.length,
    availableLabels: availableLabels.sort(),
    notes,
  });
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid note ID" });
    return;
  }

  const note = await Note.findOne({ _id: id, user: req.user?.id });
  if (!note) {
    res.status(404).json({ success: false, message: "Note not found" });
    return;
  }

  res.status(200).json({ success: true, note });
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const data = { ...parsed.data };
  // Keep behavior: archive aur pin ek saath true nahi rehte
  if (data.isArchived) {
    data.isPinned = false;
  }

  const note = await Note.create({
    ...data,
    user: req.user?.id,
  });

  res.status(201).json({ success: true, note });
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid note ID" });
    return;
  }

  const parsed = updateNoteSchema.safeParse(req.body);
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

  // Keep state transitions:
  // 1) Trash karne par unpin + unarchive + trashedAt set
  if (updateData.isTrashed === true) {
    updateData.isPinned = false;
    updateData.isArchived = false;
    updateData.trashedAt = new Date();
  } else if (updateData.isTrashed === false) {
    unsetData.trashedAt = 1;
  }

  // 2) Archive karne par unpin; Pin karne par unarchive
  if (updateData.isArchived === true) {
    updateData.isPinned = false;
  } else if (updateData.isPinned === true) {
    updateData.isArchived = false;
  }

  const queryUpdate: Record<string, unknown> = {};
  if (Object.keys(updateData).length > 0) queryUpdate.$set = updateData;
  if (Object.keys(unsetData).length > 0) queryUpdate.$unset = unsetData;

  const note = await Note.findOneAndUpdate({ _id: id, user: req.user?.id }, queryUpdate, {
    new: true,
    runValidators: true,
  });

  if (!note) {
    res.status(404).json({ success: false, message: "Note not found" });
    return;
  }

  res.status(200).json({ success: true, note });
};

// Mobile card par direct checkbox tap ke liye fast endpoint
export const toggleChecklistItem = async (req: Request, res: Response): Promise<void> => {
  const { id, itemId } = req.params;

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(itemId)) {
    res.status(400).json({ success: false, message: "Invalid note or item ID" });
    return;
  }

  const parsed = toggleChecklistItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const note = await Note.findOneAndUpdate(
    { _id: id, user: req.user?.id, "checklist._id": itemId },
    { $set: { "checklist.$.isChecked": parsed.data.isChecked } },
    { new: true }
  );

  if (!note) {
    res.status(404).json({ success: false, message: "Note or checklist item not found" });
    return;
  }

  res.status(200).json({ success: true, note });
};

export const deleteNotePermanent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid note ID" });
    return;
  }

  const note = await Note.findOneAndDelete({ _id: id, user: req.user?.id });
  if (!note) {
    res.status(404).json({ success: false, message: "Note not found" });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Note permanently deleted",
  });
};

export const emptyTrash = async (req: Request, res: Response): Promise<void> => {
  const result = await Note.deleteMany({ user: req.user?.id, isTrashed: true });

  res.status(200).json({
    success: true,
    deletedCount: result.deletedCount,
    message: "Trash emptied successfully",
  });
};

// Keep Note ya uske unchecked items ko ToDo Tasks mein convert karne ke liye
export const convertNoteToTodos = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid note ID" });
    return;
  }

  const note = await Note.findOne({ _id: id, user: req.user?.id });
  if (!note) {
    res.status(404).json({ success: false, message: "Note not found" });
    return;
  }

  if (note.type === "checklist" && note.checklist.length > 0) {
    const uncheckedItems = note.checklist.filter((item) => !item.isChecked);
    const itemsToConvert = uncheckedItems.length > 0 ? uncheckedItems : note.checklist;

    const createdTodos = await Todo.insertMany(
      itemsToConvert.map((item) => ({
        user: req.user?.id,
        title: item.text.slice(0, 150),
        description: note.title ? `From note: ${note.title}` : undefined,
        priority: "medium",
        ...(note.reminderAt ? { dueDate: note.reminderAt } : {}),
      }))
    );

    res.status(201).json({
      success: true,
      count: createdTodos.length,
      todos: createdTodos,
    });
    return;
  }

  const todo = await Todo.create({
    user: req.user?.id,
    title: (note.title || note.content.slice(0, 60) || "Untitled Task").slice(0, 150),
    description: note.content ? note.content.slice(0, 1000) : undefined,
    priority: "medium",
    ...(note.reminderAt ? { dueDate: note.reminderAt } : {}),
  });

  res.status(201).json({
    success: true,
    count: 1,
    todos: [todo],
  });
};
