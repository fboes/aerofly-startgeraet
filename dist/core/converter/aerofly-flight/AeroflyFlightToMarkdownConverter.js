import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { dateToString, getClouds, getFlightplanDestinationName, getFlightplanOriginCode, getFlightplanOriginName, getHourString, getTemperature, getVisibility, getWind, } from "../../formatter/AeroflyFlightFormatter.js";
import { markdownTable } from "../../formatter/markdownTable.js";
import { getAeroflyAircraft, getAeroflyLivery } from "../../services/getAeroflyAircraft.js";
import { RoutePlanService } from "../../services/RoutePlanService.js";
import { getFlightCategory, getIcaoFlightCategory, getLocalTimeAndDate } from "../../util/AeroflyFlightHelper.js";
import { AeroflyFlightToMetarConverter } from "./AeroflyFlightToMetarConverter.js";
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
        const fuel = flightplan.fuelLoadSetting.fuelMass || flightplan.fuelLoadSetting.payloadMass;
        return `\
## Aircraft

${markdownTable([
            ["Aircraft", "Livery", "Cruise speed", "Cruise altitude", "Fuel load", "Payload"],
            ["---", "---", "---:", "---:", "---:", "---:"],
            [
                currentAircraft.nameFull,
                currentLivery?.name ?? "Default",
                currentAircraft.cruiseSpeedKts ? this.numericOutput(currentAircraft.cruiseSpeedKts, " kts") : "not set",
                flightplan.navigation.cruiseAltitude_ft
                    ? this.numericOutput(flightplan.navigation.cruiseAltitude_ft, " ft")
                    : "not set",
                fuel ? this.numericOutput(flightplan.fuelLoadSetting.fuelMass, " kg") : "",
                fuel ? this.numericOutput(flightplan.fuelLoadSetting.payloadMass, " kg") : "",
            ],
        ])}
`;
    }
    getTimeSummary(flightplan) {
        return `\
## Departure time & date

${markdownTable([
            ["Timezone", "Date", "Time"],
            ["---", "--:", "---:"],
            ["UTC", ...dateToString(flightplan.timeUtc.time).split(" ")],
            [getFlightplanOriginCode(flightplan), ...dateToString(getLocalTimeAndDate(flightplan)).split(" ")],
        ])}
`;
    }
    getWeatherSummary(flightplan) {
        const m = new AeroflyFlightToMetarConverter();
        return `\
## Weather

> ${m.convert(flightplan)}

${markdownTable([
            ["Wind", "Clouds", "Visibility", "Temperature", "Flight Categegory"],
            ["---", "--:", "--:", "--:", "---"],
            [
                getWind(flightplan),
                getClouds(flightplan, " <br> "),
                getVisibility(flightplan, "<br>"),
                getTemperature(flightplan),
                `${getIcaoFlightCategory(flightplan)} (ICAO) <br> ${getFlightCategory(flightplan)} (US)`,
            ],
        ])}
`;
    }
    getFlightSummary(flightplan) {
        const route = new RoutePlanService(flightplan);
        return `\
## Flight details

${markdownTable([
            ["From", "To", "Freq¹", "Altitude¹", "Track", "HDG", "GS", "Dist", "ETE²", "ETO²"],
            ["---", "---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:"],
            ...route
                .getRouteLegs()
                .map((l) => [
                l.from,
                l.to,
                l.frequency_mhz
                    ? this.numericOutput(l.frequency_mhz > 1 ? l.frequency_mhz : l.frequency_mhz / 1000, l.frequency_mhz > 1 ? " MHz" : " kHZ", l.frequency_mhz > 1 ? 1 : 0)
                    : "",
                l.altitude_ft ? this.numericOutput(l.altitude_ft, " ft") : "",
                this.numericOutput(l.track_deg, "°"),
                this.numericOutput(l.heading_deg, "°"),
                this.numericOutput(l.groundSpeed_kts, " kts"),
                this.numericOutput(l.distance_nm, " NM", 1),
                getHourString(l.estimatedTimeEnroute_min),
                getHourString(l.estimatedTimeEnrouteTotal_min),
            ]),
        ])}

- ¹) Value for "To" waypoint
- ²) Duration in hh:mm
`;
    }
    numericOutput(value, unit = "", minimumFractionDigits = 0) {
        return (Intl.NumberFormat("en-US", { minimumFractionDigits, maximumFractionDigits: minimumFractionDigits }).format(value) + unit);
    }
}
