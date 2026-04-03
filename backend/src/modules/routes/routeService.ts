import { env } from "../../config/env.js";
import { HttpError } from "../../utils/http.js";

export type RouteCoordinate = {
  lat: number;
  lng: number;
};

type OpenRouteServiceFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties?: {
    summary?: {
      distance?: number;
      duration?: number;
    };
  };
};

type OpenRouteServiceResponse = {
  type?: "FeatureCollection";
  features?: OpenRouteServiceFeature[];
  error?: {
    code?: number;
    message?: string;
  };
};

export type RoadRoute = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

export const routeService = {
  async getWalkingRoutes(start: RouteCoordinate, end: RouteCoordinate): Promise<RoadRoute[]> {
    if (!env.OPENROUTESERVICE_API_KEY?.trim()) {
      throw new HttpError(503, "OPENROUTESERVICE_API_KEY is required to generate safe routes");
    }

    const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: {
        Authorization: env.OPENROUTESERVICE_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/geo+json, application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        alternative_routes: {
          target_count: 3,
          share_factor: 0.6,
          weight_factor: 2,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.text()) || `openrouteservice request failed with ${response.status}`;
      throw new HttpError(502, `openrouteservice Directions API error: ${errorBody}`);
    }

    const payload = (await response.json()) as OpenRouteServiceResponse;
    if (!payload.features?.length) {
      throw new HttpError(
        502,
        payload.error?.message || "openrouteservice did not return any walking routes"
      );
    }

    return payload.features.map((feature) => ({
      distanceMeters: Number(feature.properties?.summary?.distance ?? 0),
      durationSeconds: Number(feature.properties?.summary?.duration ?? 0),
      geometry: feature.geometry,
    }));
  },
};
