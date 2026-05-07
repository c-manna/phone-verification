import { Schema, model, type HydratedDocument, Types } from 'mongoose';

export interface IVerificationCode {
  userId: Types.ObjectId;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type VerificationDocument = HydratedDocument<IVerificationCode>;

const verificationSchema = new Schema<IVerificationCode>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    phone: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    codeHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    used: {
      type: Boolean,
      default: false,
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

verificationSchema.index({ phone: 1, used: 1, createdAt: -1 });

export const VerificationCodeModel = model<IVerificationCode>('VerificationCode', verificationSchema);
