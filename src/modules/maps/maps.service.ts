import { LocationModel, RouteModel } from "models";
import { ApiError, ApiResponse } from "utils";
import type {
  CreateLocationData,
  UpdateLocationData,
  LocationQueryData,
  CreateRouteData,
  UpdateRouteData,
  RouteQueryData,
} from "./maps.validator";
import mongoose from "mongoose";

export const MapsService = {
  // ==================== LOCATIONS ====================
  
  async createLocation(data: CreateLocationData, userId: string) {
    const location = await LocationModel.create({
      ...data,
      createdBy: userId,
    });

    return new ApiResponse(201, "Location created successfully", location);
  },

  async getLocations(query: LocationQueryData) {
    const {
      category,
      latitude,
      longitude,
      radius = "10", // default 10km
      limit = "50",
      page = "1",
    } = query;

    const filter: any = { isActive: true };

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Nearby search (basic implementation - for production use geospatial queries)
    let locations;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      // Simple bounding box search (for more accurate, use MongoDB geospatial)
      const latDelta = radiusKm / 111; // 1 degree ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

      filter.latitude = { $gte: lat - latDelta, $lte: lat + latDelta };
      filter.longitude = { $gte: lng - lngDelta, $lte: lng + lngDelta };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    locations = await LocationModel.find(filter)
      .populate("createdBy", "name email")
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await LocationModel.countDocuments(filter);

    return new ApiResponse(200, "Locations retrieved successfully", {
      locations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  },

  async getLocationById(locationId: string) {
    const location = await LocationModel.findOne({
      _id: locationId,
      isActive: true,
    }).populate("createdBy", "name email");

    if (!location) {
      throw new ApiError(404, "Location not found");
    }

    return new ApiResponse(200, "Location retrieved successfully", location);
  },

  async updateLocation(locationId: string, data: UpdateLocationData, userId: string) {
    const location = await LocationModel.findOne({
      _id: locationId,
      createdBy: userId,
    });

    if (!location) {
      throw new ApiError(404, "Location not found or you don't have permission to update it");
    }

    Object.assign(location, data);
    await location.save();

    return new ApiResponse(200, "Location updated successfully", location);
  },

  async deleteLocation(locationId: string, userId: string) {
    const location = await LocationModel.findOne({
      _id: locationId,
      createdBy: userId,
    });

    if (!location) {
      throw new ApiError(404, "Location not found or you don't have permission to delete it");
    }

    // Soft delete
    location.isActive = false;
    await location.save();

    return new ApiResponse(200, "Location deleted successfully");
  },

  // ==================== ROUTES ====================

  async createRoute(data: CreateRouteData, userId: string) {
    const route = await RouteModel.create({
      ...data,
      createdBy: userId,
    });

    return new ApiResponse(201, "Route created successfully", route);
  },

  async getRoutes(query: RouteQueryData, userId?: string) {
    const { limit = "50", page = "1" } = query;

    const filter: any = { isActive: true };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const routes = await RouteModel.find(filter)
      .populate("createdBy", "name email")
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await RouteModel.countDocuments(filter);

    return new ApiResponse(200, "Routes retrieved successfully", {
      routes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  },

  async getRouteById(routeId: string) {
    const route = await RouteModel.findOne({
      _id: routeId,
      isActive: true,
    }).populate("createdBy", "name email");

    if (!route) {
      throw new ApiError(404, "Route not found");
    }

    return new ApiResponse(200, "Route retrieved successfully", route);
  },

  async updateRoute(routeId: string, data: UpdateRouteData, userId: string) {
    const route = await RouteModel.findOne({
      _id: routeId,
      createdBy: userId,
    });

    if (!route) {
      throw new ApiError(404, "Route not found or you don't have permission to update it");
    }

    Object.assign(route, data);
    await route.save();

    return new ApiResponse(200, "Route updated successfully", route);
  },

  async deleteRoute(routeId: string, userId: string) {
    const route = await RouteModel.findOne({
      _id: routeId,
      createdBy: userId,
    });

    if (!route) {
      throw new ApiError(404, "Route not found or you don't have permission to delete it");
    }

    // Soft delete
    route.isActive = false;
    await route.save();

    return new ApiResponse(200, "Route deleted successfully");
  },

  // ==================== UTILITY ====================

  async getMapStats(userId?: string) {
    const totalLocations = await LocationModel.countDocuments({ isActive: true });
    const totalRoutes = await RouteModel.countDocuments({ isActive: true });

    const locationsByCategory = await LocationModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    return new ApiResponse(200, "Map statistics retrieved successfully", {
      totalLocations,
      totalRoutes,
      locationsByCategory,
    });
  },
};

