import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import {
    dateToString,
    getFlightplanDestinationName,
    getFlightplanOriginCode,
    getFlightplanOriginName,
    getHourString,
    getSunPositionName,
} from "../../formatter/AeroflyFlightFormatter.js";
import { markdownTable } from "../../formatter/markdownTable.js";
import { getAeroflyAircraft, getAeroflyLivery } from "../../services/getAeroflyAircraft.js";
import { RoutePlanService } from "../../services/RoutePlanService.js";
import { getFlightCategory, getIcaoFlightCategory, getLocalTimeAndDate } from "../../util/AeroflyFlightHelper.js";

export class AeroflyFlightToMarkdownConverter extends AeroflyFlightToStringConverter {
    static readonly fileName = "Markdown Text File";
    static readonly fileExtension = "md";

    convert(flightplan: AeroflyFlight): string {
        return `\
# ${this.getFlightplanTitle(flightplan)}

Flight from ${getFlightplanOriginName(flightplan)} to ${getFlightplanDestinationName(flightplan)}

${this.getAircraftSummary(flightplan)}
${this.getTimeSummary(flightplan)}
${this.getWeatherSummary(flightplan)}
${this.getFlightSummary(flightplan)}
`;
    }

    private getAircraftSummary(flightplan: AeroflyFlight) {
        const currentAircraft = getAeroflyAircraft(flightplan.aircraft.name);
        if (!currentAircraft) {
            return "";
        }
        const currentLivery = getAeroflyLivery(currentAircraft, flightplan.aircraft.paintscheme);

        const fuel =
            flightplan.fuelLoadSetting.fuelMass || flightplan.fuelLoadSetting.payloadMass
                ? markdownTable([
                      ["Fuel load", "Payload"],
                      ["---:", "---:"],
                      [
                          this.numericOutput(flightplan.fuelLoadSetting.fuelMass, " kg"),
                          this.numericOutput(flightplan.fuelLoadSetting.payloadMass, " kg"),
                      ],
                  ])
                : "";

        return `\
## Aircraft

${markdownTable([
    ["Aircraft", "Livery", "Cruise speed", "Cruise altitude"],
    ["---", "---", "---:", "---:"],
    [
        currentAircraft.nameFull,
        currentLivery?.name ?? "Default",
        currentAircraft.cruiseSpeedKts ? this.numericOutput(currentAircraft.cruiseSpeedKts, " kts") : "not set",
        flightplan.navigation.cruiseAltitude_ft
            ? this.numericOutput(flightplan.navigation.cruiseAltitude_ft, " ft")
            : "not set",
    ],
])}\
${fuel ? "\n\n###Fuel & payload\n\n" + fuel : ""}
`;
    }

    private getTimeSummary(flightplan: AeroflyFlight) {
        return `\
## Departure time & date

${markdownTable([
    ["Timezone", "Date", "Time", "Remark"],
    ["---", "--:", "---:", "---"],
    ["UTC", ...dateToString(flightplan.timeUtc.time).split(" "), ""],
    [
        getFlightplanOriginCode(flightplan),
        ...dateToString(getLocalTimeAndDate(flightplan)).split(" "),
        getSunPositionName(flightplan),
    ],
])}
`;
    }

    private getWeatherSummary(flightplan: AeroflyFlight) {
        return `\
## Weather

Flight category: ${getIcaoFlightCategory(flightplan)} (ICAO), ${getFlightCategory(flightplan)} (US)
`;
    }

    private getFlightSummary(flightplan: AeroflyFlight) {
        const route = new RoutePlanService(flightplan);
        return `\
## Flight details

${markdownTable([
    ["From", "To", "Altitude", "Track", "HDG", "GS", "Dist", "ETE", "ETO"],
    ["---", "---", "---:", "---:", "---:", "---:", "---:", "---:", "---:"],
    ...route
        .getRouteLegs()
        .map((l) => [
            l.from,
            l.to,
            l.altitude_ft ? this.numericOutput(l.altitude_ft, " ft") : "",
            this.numericOutput(l.track_deg, "°"),
            this.numericOutput(l.heading_deg, "°"),
            this.numericOutput(l.groundSpeed_kts, " kts"),
            this.numericOutput(l.distance_nm, " NM", 1),
            getHourString(l.estimatedTimeEnroute_min),
            getHourString(l.estimatedTimeEnrouteTotal_min),
        ]),
])}
`;
    }

    private numericOutput(value: number, unit: string = "", minimumFractionDigits = 0): string {
        return (
            Intl.NumberFormat("en-US", { minimumFractionDigits, maximumFractionDigits: minimumFractionDigits }).format(
                value,
            ) + unit
        );
    }
}
