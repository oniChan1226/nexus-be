import { z } from "zod";

// Location validators
export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(1000).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    category: z.enum(["park", "shop", "attraction", "restaurant", "cafe", "other"]).optional(),
    icon: z.string().optional(),
    metadata: z.object({
      address: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      rating: z.number().min(0).max(5).optional(),
    }).optional(),
  }),
});

export const updateLocationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Location ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    category: z.enum(["park", "shop", "attraction", "restaurant", "cafe", "other"]).optional(),
    icon: z.string().optional(),
    metadata: z.object({
      address: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      rating: z.number().min(0).max(5).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getLocationByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Location ID is required"),
  }),
});

export const getLocationsQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    latitude: z.string().optional(), // For nearby search
    longitude: z.string().optional(),
    radius: z.string().optional(), // km
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
});

// Route validators
export const createRouteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(1000).optional(),
    coordinates: z.array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
    ).min(2, "Route must have at least 2 coordinates"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    weight: z.number().min(1).max(10).optional(),
    distance: z.number().min(0).optional(),
    duration: z.number().min(0).optional(),
  }),
});

export const updateRouteSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Route ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    coordinates: z.array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
    ).min(2).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    weight: z.number().min(1).max(10).optional(),
    distance: z.number().min(0).optional(),
    duration: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getRouteByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Route ID is required"),
  }),
});

export const getRoutesQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
});

// Types
export type CreateLocationData = z.infer<typeof createLocationSchema>["body"];
export type UpdateLocationData = z.infer<typeof updateLocationSchema>["body"];
export type LocationQueryData = z.infer<typeof getLocationsQuerySchema>["query"];

export type CreateRouteData = z.infer<typeof createRouteSchema>["body"];
export type UpdateRouteData = z.infer<typeof updateRouteSchema>["body"];
export type RouteQueryData = z.infer<typeof getRoutesQuerySchema>["query"];

