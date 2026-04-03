import cron from "node-cron";
import { pipelineIngestionService } from "./ingestion.service.js";

let runningTask: cron.ScheduledTask | null = null;
let lastRun: Record<string, unknown> | null = null;

export const pipelineSchedulerService = {
  start() {
    if (runningTask) return;

    runningTask = cron.schedule("*/5 * * * *", async () => {
      try {
        lastRun = await pipelineIngestionService.runIngestionCycle();
        console.log("[pipeline] ingestion cycle completed", lastRun);
      } catch (error) {
        console.error("[pipeline] ingestion cycle failed", error);
      }
    });

    // bootstrap once at startup
    void pipelineIngestionService
      .runIngestionCycle()
      .then((result) => {
        lastRun = result;
        console.log("[pipeline] startup cycle completed", result);
      })
      .catch((error) => console.error("[pipeline] startup cycle failed", error));
  },

  status() {
    return {
      active: !!runningTask,
      lastRun,
    };
  },

  async triggerNow() {
    lastRun = await pipelineIngestionService.runIngestionCycle();
    return lastRun;
  },
};
