import cherio from "cherio";
import chalk from "chalk";
import express from "express";
import cors from "cors";
import fs from "fs";
import { getPageContent } from "./helpers/puppeteer.js";

const app = express();
const port = 3030;
const outputFilePath = "./data/output.json";

app.use(cors());

if (fs.existsSync(outputFilePath)) {
  fs.unlinkSync(outputFilePath);
}

app.get("/", async (req, res) => {
  try {
    const URL = "https://www.nn-airport.kz/flight-status";
    const content = await getPageContent(URL);

    const cleanedContent = content.replace(
      /<!--\s*<td>([\s\S]*?)<\/td>\s*-->/g,
      "<td>$1</td>"
    );

    const $ = cherio.load(cleanedContent);
    const flights = [];

    $("tr[data-id]").each((index, element) => {
      const $row = $(element);
      const flightId = $row.attr("data-id");
      const flightNumber = $row.find("td:nth-child(1)").text();
      const airline = $row.find("td:nth-child(2)").text().trim();
      const destination = $row.find("td:nth-child(4)").text();
      const scheduledDeparture = $row.find("td:nth-child(5)").text();
      const actualDeparture = $row.find("td:nth-child(6)").text();
      const status = $row.find("td:nth-child(7)").text();
      const terminal = $row.find("td:nth-child(8)").text();

      const flightInfo = {
        flightId,
        flightNumber,
        airline: airline,
        destination: destination.trim(),
        scheduledDeparture,
        actualDeparture,
        status,
        terminal,
      };

      flights.push(flightInfo);
    });

    const jsonData = JSON.stringify(flights, null, 2);

    fs.writeFileSync(outputFilePath, jsonData);

    res.json(flights);
    console.log(chalk.greenBright("Sent data to frontend:)"));

    fs.unlinkSync(outputFilePath);
    console.log();
  } catch (err) {
    console.log(chalk.red("Error: ", err));
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(chalk.green(`node.js server started on port  ${port}`));
});
