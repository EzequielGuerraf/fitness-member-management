import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.status(200).json({ message: "Fitness Member Management API" });
});

app.get("/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

export default app;
