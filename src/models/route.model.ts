import mongoose from "mongoose";

export interface IRoute {
  name: string;
  description?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  color?: string;
  weight?: number;
  distance?: number; // in kilometers
  duration?: number; // in minutes
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new mongoose.Schema<IRoute>(
  {
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coordinates: [
      {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
    ],
    color: {
      type: String,
      default: "#3b82f6",
    },
    weight: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    distance: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
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
    collection: "routes",
  }
);

// Indexes
routeSchema.index({ createdBy: 1 });
routeSchema.index({ isActive: 1 });

export const RouteModel = mongoose.model<IRoute>("Route", routeSchema);

