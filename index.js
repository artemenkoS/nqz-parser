import cherio from "cherio";
import chalk from "chalk";
import fs from "fs";
import { getPageContent } from "./helpers/puppeteer.js";

const URL = "https://www.nn-airport.kz/flight-status";

(async function main() {
  try {
    const content = await getPageContent(URL);

    const cleanedContent = content.replace(
      /<!--\s*<td>([\s\S]*?)<\/td>\s*-->/g,
      "<td>$1</td>"
    );

    const $ = cherio.load(cleanedContent);

    console.log($);

    const flights = [];

    $("tr[data-id]").each((element) => {
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

    fs.writeFileSync("./data/output.json", jsonData);

    console.log(chalk.green("JSON data has been successfully saved."));
  } catch (err) {
    console.log(chalk.red("Error: ", err));
  }
})();
