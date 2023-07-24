import express from "express";
import cors from "cors";
import chalk from "chalk";

import { sendArrivalsSchedule } from "./helpers/sendArrivalsSchedule.js";
import { sendDeparturesSchedule } from "./helpers/sendDeparturesSchedule.js";

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());

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
