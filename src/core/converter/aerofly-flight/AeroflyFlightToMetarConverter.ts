import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { getFlightplanOriginCode } from "../../formatter/AeroflyFlightFormatter.js";

export class AeroflyFlightToMetarConverter {
    // static readonly fileName: string;
    // static readonly fileExtension: string;

    convert(flightplan: AeroflyFlight): string {
        return `METAR ${getFlightplanOriginCode(flightplan)} ${this.getTimeAndDate(flightplan)} ${this.getWind(flightplan)} ${this.getVisibility(flightplan)} ${this.getClouds(flightplan)} ${this.getTemperature(flightplan)} Q1013`;
    }

    private getTimeAndDate(flightplan: AeroflyFlight): string {
        return (
            flightplan.timeUtc.time.getUTCDate().toFixed().padStart(2, "0") +
            flightplan.timeUtc.time.getUTCHours().toFixed().padStart(2, "0") +
            flightplan.timeUtc.time.getUTCMinutes().toFixed().padStart(2, "0") +
            "Z"
        );
    }

    private getWind(flightplan: AeroflyFlight): string {
        return (
            flightplan.wind.directionInDegree.toFixed().padStart(3, "0") +
            flightplan.wind.speed_kts.toFixed().padStart(2, "0") +
            (flightplan.wind.gust_kts ? "G" + flightplan.wind.gust_kts.toFixed().padStart(2, "0") : "") +
            "KT"
        );
    }

    private getVisibility(flightplan: AeroflyFlight): string {
        return flightplan.visibility_meter < 10000
            ? flightplan.visibility_meter.toFixed().padStart(4, "0")
            : Math.round(flightplan.visibility_sm).toFixed() + "SM";
    }

    private getClouds(flightplan: AeroflyFlight): string {
        return (
            flightplan.clouds
                .filter((cloud) => cloud.density > 0)
                .map((cloud) => {
                    return cloud.density_code + (cloud.height_ft / 100).toFixed().padStart(3, "0");
                })
                .join(" ") || "CLR"
        );
    }

    private getTemperature(flightplan: AeroflyFlight): string {
        return (
            this.tempString(flightplan.wind.temperature_celsius) +
            "/" +
            this.tempString(Math.max(0, flightplan.wind.temperature_celsius - 10))
        );
    }

    private tempString(t: number): string {
        return (t < 0 ? "M" : "") + Math.abs(t).toFixed().padStart(2, "0");
    }
}
