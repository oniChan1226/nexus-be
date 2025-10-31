import mongoose from "mongoose";

export interface ILocation {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  icon?: string;
  metadata?: {
    address?: string;
    phone?: string;
    website?: string;
    rating?: number;
    [key: string]: unknown;
  };
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new mongoose.Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: -180,
      max: 180,
    },
    category: {
      type: String,
      enum: ["park", "shop", "attraction", "restaurant", "cafe", "other"],
      default: "other",
    },
    icon: {
      type: String,
      default: "📍",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "locations",
  }
);

// Index for geospatial queries
locationSchema.index({ latitude: 1, longitude: 1 });
locationSchema.index({ category: 1 });
locationSchema.index({ isActive: 1 });

export const LocationModel = mongoose.model<ILocation>("Location", locationSchema);

