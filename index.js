import express from "express";
import cors from "cors";
import chalk from "chalk";

import { sendArrivalsSchedule } from "./helpers/sendArrivalsSchedule.js";
import { sendDeparturesSchedule } from "./helpers/sendDeparturesSchedule.js";

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());

app.use((req, _, next) => {
  const now = new Date();
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const clientPort = req.headers["x-forwarded-port"] || req.socket.remotePort;

  console.log(
    chalk.blue(
      `Incoming request from ${clientIp}:${clientPort} at ${now.toLocaleString()}`
    )
  );
  next();
});

app.get("/", async (req, res) => {
  const flightLeg = req.query.flightLeg;

  if (flightLeg === "DEP") {
    await sendDeparturesSchedule(req, res);
  } else {
    await sendArrivalsSchedule(req, res);
  }
});

app.listen(port, () => {
  console.log(chalk.green(`node.js server started on port ${port}`));
});
