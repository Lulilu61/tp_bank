import { Schema, model } from 'mongoose';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mongoose schema
const userSchema = new Schema<User>(
  {
    firstName: { type: String, required: [true, 'firstName is required'], trim: true },
    lastName: { type: String, required: [true, 'lastName is required'], trim: true },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [EMAIL_REGEX, 'email is invalid'],
    },
    passwordHash: { type: String, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const UserModel = model<User>('User', userSchema);