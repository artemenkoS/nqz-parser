import cherio from "cherio";
import chalk from "chalk";
import express from "express";
import cors from "cors";
import { getPageContent } from "./helpers/puppeteer.js";

const app = express();
const port = 3030;

app.use(cors());

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

      const flightInfo = {
        id: flightId,
        airlineName: airline,
        flightNumber: flightNumber,
        path: {
          origin: {
            originRu: destination,
          },
          destination: { destinationRu: destination },
        },
        stad: scheduledDeparture,
        etad: actualDeparture,
        remark: { remarkRu: status },
        gate: null,
      };

      flights.push(flightInfo);
    });
    const jsonData = { data: { flights } };
    res.json(jsonData);
    console.log(chalk.green("Schedule sent succesfuly"));
  } catch (err) {
    console.log(chalk.red("Error: ", err));
    res.status(500).json({ error: "Something went wrong" }, error);
  }
});

app.listen(port, () => {
  console.log(chalk.green(`node.js server started on port  ${port}`));
});
