import type { AeroflyFlight } from "@fboes/aerofly-custom-missions";
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
        const asMeters = flightplan.visibility_meter < 10000 && flightplan.visibility_sm % 1 !== 0;
        return asMeters
            ? this.roundVisibilityMeters(flightplan.visibility_meter).toFixed().padStart(4, "0")
            : Math.round(flightplan.visibility_sm).toFixed() + "SM";
    }

    private roundVisibilityMeters(value: number) {
        if (value < 800) {
            return Math.floor(value / 50) * 50;
        }

        if (value < 5000) {
            return Math.floor(value / 100) * 100;
        }

        if (value === 9999) {
            return value;
        }

        return Math.floor(value / 1000) * 1000;
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
