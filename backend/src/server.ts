import { env } from "./config/env";
import app from "./app";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
