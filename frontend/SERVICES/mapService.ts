import { apiClient } from "./apiClient";

export type NairobiLayers = {
  center: { lat: number; lng: number; label: string };
  streetLights: Array<{
    id: string;
    lat: number;
    lng: number;
    status: "functional" | "broken";
    source: string;
    sourceRef?: string;
    conditionLabel: string;
    notes?: string;
  }>;
  dangerZones: Array<{
    id: string;
    lat: number;
    lng: number;
    source: string;
    label: string;
    severity: "high" | "medium" | "low";
    crimeType?: string;
    locationName?: string;
    createdAt?: string;
  }>;
};

export const mapService = {
  async getNairobiLayers(): Promise<NairobiLayers | null> {
    try {
      return await apiClient.get<NairobiLayers>("/map/nairobi-layers");
    } catch {
      return null;
    }
  },
};
