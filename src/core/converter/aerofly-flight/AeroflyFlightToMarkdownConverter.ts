import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import {
    dateToString,
    getClouds,
    getFlightplanDestinationName,
    getFlightplanOriginCode,
    getFlightplanOriginName,
    getHourString,
    getMinuteString,
    getTemperature,
    getVisibility,
    getWind,
} from "../../formatter/AeroflyFlightFormatter.js";
import { markdownTable } from "../../formatter/markdownTable.js";
import { getAeroflyAircraft, getAeroflyLivery } from "../../services/getAeroflyAircraft.js";
import { RoutePlanService } from "../../services/RoutePlanService.js";
import { getFlightCategory, getIcaoFlightCategory, getLocalTimeAndDate } from "../../util/AeroflyFlightHelper.js";
import { AeroflyFlightToMetarConverter } from "./AeroflyFlightToMetarConverter.js";
import { SkyVectorUrl } from "../../data/SkyVectorUrl.js";

export class AeroflyFlightToMarkdownConverter extends AeroflyFlightToStringConverter {
    static readonly fileName = "Markdown Text File";
    static readonly fileExtension = "md";

    convert(flightplan: AeroflyFlight): string {
        return `\
# ${this.getFlightplanTitle(flightplan)}

${this.getMissionBriefing(flightplan)}

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

        // TODO: Fuel and payload are not yet accessible via the AeroflyFlight API. For now, we just set them to false.
        const fuel = false; // flightplan.fuelLoadSetting.fuelMass || flightplan.fuelLoadSetting.payloadMass;

        return `\
## Aircraft

${markdownTable([
    ["Aircraft", "Livery", "Cruise speed", "Cruise altitude"],
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

    private getTimeSummary(flightplan: AeroflyFlight) {
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

    private getWeatherSummary(flightplan: AeroflyFlight) {
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

    private getFlightSummary(flightplan: AeroflyFlight) {
        const skyvector = new SkyVectorUrl(flightplan);
        const route = new RoutePlanService(flightplan);
        const routeLegs = route.getRouteLegs();
        const routeTotalTime = routeLegs.at(-1)?.estimatedTimeEnrouteTotal_min ?? 0;
        const timeFunction: (minutes: number) => string = routeTotalTime < 60 ? getMinuteString : getHourString;

        return `\
## Flight details

${markdownTable([
    ["From", "To", "Freq¹", "Altitude¹", "Track", "HDG", "GS", "Dist", "ETE²", "ETO²"],
    ["---", "---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:"],
    ...routeLegs.map((l) => [
        l.from,
        l.to,
        l.frequency_mhz
            ? this.numericOutput(
                  l.frequency_mhz > 1 ? l.frequency_mhz : l.frequency_mhz / 1000,
                  l.frequency_mhz > 1 ? " MHz" : " kHZ",
                  l.frequency_mhz > 1 ? 1 : 0,
              )
            : "",
        l.altitude_ft ? this.numericOutput(l.altitude_ft, " ft") : "",
        this.numericOutput(l.track_deg, "°"),
        this.numericOutput(l.heading_deg, "°"),
        this.numericOutput(l.groundSpeed_kts, " kts"),
        this.numericOutput(l.distance_nm, " NM", 1),
        timeFunction(l.estimatedTimeEnroute_min),
        timeFunction(l.estimatedTimeEnrouteTotal_min),
    ]),
])}

- [Skyvector: ${getFlightplanOriginName(flightplan)}](${skyvector.getOriginURL().toString()})
- [Skyvector: ${getFlightplanDestinationName(flightplan)}](${skyvector.getDestinationURL().toString()})
- [SkyVector: ${this.getFlightplanTitle(flightplan)}](${skyvector.getRouteURL().toString()})

- ¹) Value for "To" waypoint
- ²) Duration in ${timeFunction === getMinuteString ? "mm:ss" : "hh:mm"}
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
