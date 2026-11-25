import mongoose, { Schema, type Document, type Types } from "mongoose";

export type NoteType = "text" | "checklist";
export type NoteColor = "default" | "cyan" | "purple" | "amber" | "emerald" | "rose" | "slate";

export interface IChecklistItem {
  _id: Types.ObjectId;
  text: string;
  isChecked: boolean;
}

export interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  content: string;
  type: NoteType;
  checklist: IChecklistItem[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: Date;
  labels: string[];
  reminderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<IChecklistItem>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const noteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },
    type: {
      type: String,
      enum: ["text", "checklist"],
      default: "text",
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    color: {
      type: String,
      enum: ["default", "cyan", "purple", "amber", "emerald", "rose", "slate"],
      default: "default",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
    },
    labels: {
      type: [String],
      default: [],
    },
    reminderAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

noteSchema.index({ user: 1, isTrashed: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });

export const Note = mongoose.model<INote>("Note", noteSchema);
