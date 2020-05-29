import { Document } from "mongoose";

export interface Model extends Document {
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
