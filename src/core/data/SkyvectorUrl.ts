import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
import { URLSearchParams } from "url";
import { GeoCoordinates } from "./GeoCoordinates.js";

export class SkyVectorService {
    constructor(
        protected aeroflyFlight: AeroflyFlight,
        protected cruiseSpeed_kts: number | undefined = undefined,
    ) {}

    /**
     * @returns string like 'https://skyvector.com/?ll=58.64732108,16.32458497&chart=301&zoom=4&fpl=N0122A025%20ESSL%205831N01558E%20ESVE%20ESKN'
     */
    toString(): URL {
        const cruiseSpeed = this.cruiseSpeed_kts ? "N" + (this.cruiseSpeed_kts ?? 0).toFixed().padStart(4, "0") : "";
        const cruiseAlt = this.aeroflyFlight.navigation.cruiseAltitude_ft
            ? "A" + (this.aeroflyFlight.navigation.cruiseAltitude_ft / 100).toFixed().padStart(3, "0")
            : "";

        const parameters = new URLSearchParams({
            ll:
                this.aeroflyFlight.flightSetting.latitude.toString() +
                "," +
                this.aeroflyFlight.flightSetting.longitude.toString(),
            chart: "301",
            zoom: "3",
            fpl: (cruiseSpeed + cruiseAlt + " " + this.getWaypointIdentifiers().join(" ")).trim(),
        });

        return new URL("?" + parameters.toString(), "https://skyvector.com");
    }

    getWaypointIdentifiers(): string[] {
        return this.aeroflyFlight.navigation.waypoints
            .filter((c) => {
                return !(c instanceof AeroflyNavRouteDepartureRunway || c instanceof AeroflyNavRouteDestinationRunway);
            })
            .map((c) => {
                return this.getWaypointIdentifier(c);
            });
    }

    protected getWaypointIdentifier(c: AeroflyNavRouteBase): string {
        if (!(c instanceof AeroflyNavRouteWaypoint)) {
            return c.identifier;
        }

        if (c.navaidFrequency !== null) {
            return c.identifier;
        }

        // 360351N1151159W
        const coordinates = new GeoCoordinates(c.longitude, c.latitude);
        const lat = coordinates.latMinute;
        const lon = coordinates.lonMinute;

        return (
            Math.abs(lat.degree).toFixed().padStart(2, "0") +
            lat.minutes.toFixed().padStart(2, "0") +
            lat.seconds.toFixed().padStart(2, "0") +
            coordinates.latHemisphere +
            Math.abs(lon.degree).toFixed().padStart(3, "0") +
            lon.minutes.toFixed().padStart(2, "0") +
            lon.seconds.toFixed().padStart(2, "0") +
            coordinates.lonHemisphere
        );
    }
}
