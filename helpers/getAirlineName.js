import { AIRLINE_NAMES } from "../constants.js";

export function getAirlineName(flightNumber) {
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

  return airline;
}
