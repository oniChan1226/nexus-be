import mongoose, { Document } from 'mongoose';
import crypto from 'crypto';

export interface IVerificationToken {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}

export interface IVerificationTokenDocument extends Document, IVerificationToken {
  _id: mongoose.Types.ObjectId;
}

interface VerificationTokenModel extends mongoose.Model<IVerificationToken> {
  createVerificationToken(
    userId: mongoose.Types.ObjectId,
    type: 'email_verification' | 'password_reset'
  ): Promise<IVerificationTokenDocument>;
  verifyToken(
    token: string,
    type: 'email_verification' | 'password_reset'
  ): Promise<IVerificationTokenDocument | null>;
}

const verificationTokenSchema = new mongoose.Schema<IVerificationToken, VerificationTokenModel>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours
  },
});

// Static method to create verification token
verificationTokenSchema.statics.createVerificationToken = async function (
  userId: mongoose.Types.ObjectId,
  type: 'email_verification' | 'password_reset'
) {
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  
  // Email verification: 24 hours, Password reset: 15 minutes
  if (type === 'email_verification') {
    expiresAt.setHours(expiresAt.getHours() + 24);
  } else {
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  }

  // Delete any existing tokens for this user and type
  await this.deleteMany({ userId, type });

  // Create new token
  return await this.create({
    userId,
    token,
    type,
    expiresAt,
  });
};

// Static method to verify token
verificationTokenSchema.statics.verifyToken = async function (
  token: string,
  type: 'email_verification' | 'password_reset'
) {
  const tokenDoc = await this.findOne({
    token,
    type,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!tokenDoc) {
    return null;
  }

  return tokenDoc;
};

export const VerificationTokenModel = mongoose.model<IVerificationToken, VerificationTokenModel>(
  'VerificationToken',
  verificationTokenSchema
);

