import { z } from "zod";

const noteColorEnum = z.enum(["default", "cyan", "purple", "amber", "emerald", "rose", "slate"]);

const checklistItemSchema = z.object({
  _id: z.string().optional(),
  text: z.string().trim().min(1, "Item text cannot be empty").max(300),
  isChecked: z.boolean().default(false),
});

const labelsSchema = z
  .array(z.string().trim().min(1).max(30).toLowerCase())
  .max(10, "Maximum 10 labels allowed")
  .transform((arr) => Array.from(new Set(arr)));

export const createNoteSchema = z
  .object({
    title: z.string().trim().max(200).optional().default(""),
    content: z.string().trim().max(10000).optional().default(""),
    type: z.enum(["text", "checklist"]).optional().default("text"),
    checklist: z.array(checklistItemSchema).max(100).optional().default([]),
    color: noteColorEnum.optional().default("default"),
    isPinned: z.boolean().optional().default(false),
    isArchived: z.boolean().optional().default(false),
    labels: labelsSchema.optional().default([]),
    reminderAt: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.title.length > 0 ||
      data.content.length > 0 ||
      (data.type === "checklist" && data.checklist.length > 0),
    {
      message: "Note cannot be completely empty",
      path: ["content"],
    }
  );

export const updateNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().max(10000).optional(),
  type: z.enum(["text", "checklist"]).optional(),
  checklist: z.array(checklistItemSchema).max(100).optional(),
  color: noteColorEnum.optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
  labels: labelsSchema.optional(),
  reminderAt: z.union([z.null(), z.coerce.date()]).optional(),
});

export const toggleChecklistItemSchema = z.object({
  isChecked: z.boolean(),
});
