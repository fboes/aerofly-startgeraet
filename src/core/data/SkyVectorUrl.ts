import {
    AeroflyFlight,
    AeroflyNavRouteBase,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { URLSearchParams } from "url";
import { GeoCoordinates } from "./GeoCoordinates.js";

export class SkyVectorUrl {
    private readonly baseURL = "https://skyvector.com";

    constructor(private aeroflyFlight: AeroflyFlight) {}

    getRouteURL(cruiseSpeed_kts: number | undefined = undefined): URL {
        const cruiseSpeed = cruiseSpeed_kts ? "N" + (cruiseSpeed_kts ?? 0).toFixed().padStart(4, "0") : "";
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

        // Note: SkyVector does not support "+" for space, but "%20". So we need to replace it with "%20"
        return new URL("?" + parameters.toString().replace("+", "%20"), this.baseURL);
    }

    getOriginURL(): URL {
        return this.getAirportURL(this.aeroflyFlight.navigation.waypoints.at(0)?.identifier ?? "");
    }

    getDestinationURL(): URL {
        return this.getAirportURL(this.aeroflyFlight.navigation.waypoints.at(-1)?.identifier ?? "");
    }

    getAirportURL(icaoCode: string): URL {
        return new URL(`/airport/${encodeURIComponent(icaoCode)}`, this.baseURL);
    }

    private getWaypointIdentifiers(): string[] {
        return this.aeroflyFlight.navigation.waypoints
            .filter((c) => {
                return !(c instanceof AeroflyNavRouteDepartureRunway || c instanceof AeroflyNavRouteDestinationRunway);
            })
            .map((c) => {
                return this.getWaypointIdentifier(c);
            });
    }

    private getWaypointIdentifier(c: AeroflyNavRouteBase): string {
        if (!(c instanceof AeroflyNavRouteWaypoint)) {
            return c.identifier;
        }

        if (c.identifier.match(/^[A-Z]{2,5}$/)) {
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
