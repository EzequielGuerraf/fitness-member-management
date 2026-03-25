import cors from "cors";
import express from "express";
import { membersRoutes } from "./modules/members/members.routes";
import { membershipsRoutes } from "./modules/memberships/memberships.routes";
import { plansRoutes } from "./modules/plans/plans.routes";
import { checkInsRoutes } from "./modules/checkins/checkins.routes";
import { asyncHandler } from "./lib/async-handler";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.status(200).json({
    data: {
      name: "Fitness Member Management API",
      version: "1.0.0"
    }
  });
});

app.get(
  "/health",
  asyncHandler(async (_request, response) => {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      data: {
        status: "ok"
      }
    });
  })
);

app.use("/members", membersRoutes);
app.use("/members", membershipsRoutes);
app.use("/members", checkInsRoutes);
app.use("/plans", plansRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
