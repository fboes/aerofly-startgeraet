import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { dateToString, getCombinedFlightCategory, getFlightplanDestinationName, getFlightplanOriginCode, getFlightplanOriginName, getHourString, getSunPositionName, } from "../../formatter/AeroflyFlightFormatter.js";
import { markdownTable } from "../../formatter/markdownTable.js";
import { getAeroflyAircraft, getAeroflyLivery } from "../../services/getAeroflyAircraft.js";
import { RoutePlanService } from "../../services/RoutePlanService.js";
import { getFlightCategory, getIcaoFlightCategory, getTimeAndDateDeparture } from "../../util/AeroflyFlightHelper.js";
export class AeroflyFlightToMarkdownConverter extends AeroflyFlightToStringConverter {
    static fileName = "Markdown Text File";
    static fileExtension = "md";
    convert(flightplan) {
        return `\
# ${this.getFlightplanTitle(flightplan)}

Flight from ${getFlightplanOriginName(flightplan)} to ${getFlightplanDestinationName(flightplan)}

${this.getAircraftSummary(flightplan)}
${this.getTimeSummary(flightplan)}
${this.getWeatherSummary(flightplan)}
${this.getFlightSummary(flightplan)}
`;
    }
    getAircraftSummary(flightplan) {
        const currentAircraft = getAeroflyAircraft(flightplan.aircraft.name);
        if (!currentAircraft) {
            return "";
        }
        const currentLivery = getAeroflyLivery(currentAircraft, flightplan.aircraft.paintscheme);
        const fuel = flightplan.fuelLoadSetting.fuelMass || flightplan.fuelLoadSetting.payloadMass
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
    getTimeSummary(flightplan) {
        return `\
## Departure time & date

${markdownTable([
            ["Timezone", "Date", "Time", "Remark"],
            ["---", "--:", "---:", "---"],
            ["UTC", ...dateToString(flightplan.timeUtc.time).split(" "), ""],
            [
                getFlightplanOriginCode(flightplan),
                ...dateToString(getTimeAndDateDeparture(flightplan)).split(" "),
                getSunPositionName(flightplan),
            ],
        ])}
`;
    }
    getWeatherSummary(flightplan) {
        return `\
## Weather

Flight category: ${getIcaoFlightCategory(flightplan)} (ICAO), ${getFlightCategory(flightplan)} (US)
`;
    }
    getFlightSummary(flightplan) {
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
    numericOutput(value, unit = "", minimumFractionDigits = 0) {
        return (Intl.NumberFormat("en-US", { minimumFractionDigits, maximumFractionDigits: minimumFractionDigits }).format(value) + unit);
    }
}
