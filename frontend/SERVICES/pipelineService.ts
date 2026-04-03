import { apiClient } from "./apiClient";

export type PipelineStatus = {
  active: boolean;
  lastRun: {
    fetched?: number;
    rawSaved?: number;
    incidentsCreated?: number;
    simulated?: boolean;
    at?: string;
  } | null;
};

export const pipelineService = {
  async getStatus(): Promise<PipelineStatus> {
    return apiClient.get<PipelineStatus>("/pipeline/status");
  },
};
