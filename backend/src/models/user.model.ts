import { Schema, model, type HydratedDocument } from 'mongoose';

export interface IUser {
  name: string;
  phone: string;
  isPhoneVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = model<IUser>('User', userSchema);
