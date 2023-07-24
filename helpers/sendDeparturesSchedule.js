import cherio from "cherio";
import chalk from "chalk";
import { getPageContent } from "./puppeteer.js";
import { AIRLINE_NAMES } from "../constants.js";

// Replace 'departuresTable' with the actual ID of the departures table in the HTML
const departuresTable = "departuresTable";

export async function sendDeparturesSchedule(req, res) {
  try {
    const URL = "https://www.nn-airport.kz/flight-status";
    const content = await getPageContent(URL);

    const $ = cherio.load(content);
    const flights = [];

    $(`#${departuresTable} tr`).each((index, element) => {
      const $row = $(element);

      if (index === 0) return;

      const flightNumber = $row.find("td:nth-child(1)").text();
      const airlineCode = flightNumber.split(" ")[0];

      let airline = "";
      if (airlineCode in AIRLINE_NAMES) {
        const flightNumberLength = flightNumber.split(" ")[1].length;
        if (typeof AIRLINE_NAMES[airlineCode] === "object") {
          airline = AIRLINE_NAMES[airlineCode][flightNumberLength] || "Unknown";
        } else {
          airline = AIRLINE_NAMES[airlineCode];
        }
      } else {
        airline = "Unknown";
      }

      const destination = $row.find("td:nth-child(2)").text();
      const scheduledDeparture = $row.find("td:nth-child(4)").text();
      const actualDeparture = $row.find("td:nth-child(3)").text();
      const status = $row.find("td:nth-child(5)").text();

      const flightInfo = {
        airlineName: airline,
        flightNumber: flightNumber,
        path: {
          origin: {
            originRu: { destinationRu: destination },
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
    console.log(chalk.green("Departures schedule sent successfully"));
  } catch (err) {
    console.log(chalk.red("Error: ", err));
    res.status(500).json({ error: "Something went wrong" }, error);
  }
}
