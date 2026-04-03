import { app } from "./app.js";
import { closePool } from "./config/db.js";
import { env } from "./config/env.js";
import { pipelineSchemaService } from "./modules/pipeline/schema.service.js";
import { pipelineSchedulerService } from "./modules/pipeline/scheduler.service.js";

const startServer = async () => {
  await pipelineSchemaService.ensureSchema();

  const server = app.listen(env.PORT, () => {
    console.log(`Lindamwananchi backend running on port ${env.PORT}`);
    pipelineSchedulerService.start();
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Gracefully shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

void startServer().catch(async (error) => {
  console.error("Failed to start backend server", error);
  await closePool();
  process.exit(1);
});
