import { apiClient } from "./apiClient";

type EmergencyContact = {
  id: number;
  user_id: number;
  contact_name: string;
  contact_phone: string;
  relationship: string;
};

export const sosService = {
  async getContact(userId: number): Promise<EmergencyContact | null> {
    try {
      return await apiClient.get<EmergencyContact | null>(`/sos/contact?userId=${userId}`);
    } catch {
      return null;
    }
  },

  async setContact(payload: { userId: number; contactName: string; contactPhone: string; relationship: string }) {
    return apiClient.post("/sos/contact", payload);
  },

  async trigger(payload: { userId: number; latitude?: number; longitude?: number; message?: string }) {
    return apiClient.post("/sos/trigger", payload);
  },
};
