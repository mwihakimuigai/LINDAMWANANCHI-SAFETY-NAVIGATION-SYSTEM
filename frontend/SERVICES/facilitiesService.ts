import type { Coordinates } from "../TYPES";

export type FacilityType = "police" | "hospital";

export type Facility = {
  id: string;
  name: string;
  type: FacilityType;
  location: Coordinates;
  area: string;
  emergencyPhone?: string;
};

const FACILITIES: Facility[] = [
  { id: "p-1", name: "Central Police Station", type: "police", location: { lat: -1.2841, lng: 36.8227 }, area: "Nairobi CBD", emergencyPhone: "999" },
  { id: "p-2", name: "Kilimani Police Station", type: "police", location: { lat: -1.2963, lng: 36.7833 }, area: "Kilimani", emergencyPhone: "999" },
  { id: "p-3", name: "Kasarani Police Station", type: "police", location: { lat: -1.2224, lng: 36.8974 }, area: "Kasarani", emergencyPhone: "999" },
  { id: "p-4", name: "Embakasi Police Station", type: "police", location: { lat: -1.3071, lng: 36.9024 }, area: "Embakasi", emergencyPhone: "999" },
  { id: "p-5", name: "Langata Police Station", type: "police", location: { lat: -1.3655, lng: 36.7517 }, area: "Langata", emergencyPhone: "999" },
  { id: "h-1", name: "Kenyatta National Hospital", type: "hospital", location: { lat: -1.3005, lng: 36.8078 }, area: "Upper Hill", emergencyPhone: "0202726300" },
  { id: "h-2", name: "Nairobi Hospital", type: "hospital", location: { lat: -1.2982, lng: 36.8071 }, area: "Upper Hill", emergencyPhone: "0202845000" },
  { id: "h-3", name: "MP Shah Hospital", type: "hospital", location: { lat: -1.2605, lng: 36.8054 }, area: "Parklands", emergencyPhone: "0204291000" },
  { id: "h-4", name: "Aga Khan University Hospital", type: "hospital", location: { lat: -1.262, lng: 36.8083 }, area: "Parklands", emergencyPhone: "0203662000" },
  { id: "h-5", name: "Mama Lucy Kibaki Hospital", type: "hospital", location: { lat: -1.3093, lng: 36.9137 }, area: "Embakasi", emergencyPhone: "0709154000" },
];

const toRad = (value: number) => (value * Math.PI) / 180;

const distanceKm = (a: Coordinates, b: Coordinates) => {
  const earth = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earth * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
};

export const facilitiesService = {
  listAll() {
    return FACILITIES;
  },

  listNearby(location: Coordinates) {
    return FACILITIES.map((facility) => ({
      ...facility,
      distanceKm: distanceKm(location, facility.location),
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  },
};
