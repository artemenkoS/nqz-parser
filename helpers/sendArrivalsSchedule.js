import cherio from "cherio";
import chalk from "chalk";
import { getPageContent } from "./puppeteer.js";
import { getAirlineName } from "./getAirlineName.js";
import { URL } from "../constants.js";

export async function sendArrivalsSchedule(req, res) {
  try {
    const content = await getPageContent(URL);

    const $ = cherio.load(content);
    const flights = [];

    $("tr[data-id]").each((index, element) => {
      const $row = $(element);

      const flightId = $row.attr("data-id");
      const flightNumber = $row.find("td:nth-child(1)").text();
      const airlineCode = flightNumber.split(" ")[0];

      let airline = getAirlineName(flightNumber);

      const destination = $row.find("td:nth-child(2)").text();
      const scheduledDeparture = $row.find("td:nth-child(4)").text();
      const actualDeparture = $row.find("td:nth-child(3)").text();
      const status = $row.find("td:nth-child(5)").text();

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
    console.log(chalk.green("Schedule sent successfully"));
  } catch (err) {
    console.log(chalk.red("Error: ", err));
    res.status(500).json({ error: "Something went wrong" }, err);
  }
}
