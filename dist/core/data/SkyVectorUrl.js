import { AeroflyFlight, AeroflyNavRouteBase, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestinationRunway, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { URLSearchParams } from "url";
import { GeoCoordinates } from "./GeoCoordinates.js";
export class SkyVectorUrl {
    aeroflyFlight;
    constructor(aeroflyFlight) {
        this.aeroflyFlight = aeroflyFlight;
    }
    getRouteURL(cruiseSpeed_kts = undefined) {
        const cruiseSpeed = cruiseSpeed_kts ? "N" + (cruiseSpeed_kts ?? 0).toFixed().padStart(4, "0") : "";
        const cruiseAlt = this.aeroflyFlight.navigation.cruiseAltitude_ft
            ? "A" + (this.aeroflyFlight.navigation.cruiseAltitude_ft / 100).toFixed().padStart(3, "0")
            : "";
        const parameters = new URLSearchParams({
            ll: this.aeroflyFlight.flightSetting.latitude.toString() +
                "," +
                this.aeroflyFlight.flightSetting.longitude.toString(),
            chart: "301",
            zoom: "3",
            fpl: (cruiseSpeed + cruiseAlt + " " + this.getWaypointIdentifiers().join(" ")).trim(),
        });
        // Note: SkyVector does not support "+" for space, but "%20". So we need to replace it with "%20"
        return new URL("?" + parameters.toString().replace("+", "%20"), "https://skyvector.com");
    }
    getOriginURL() {
        return this.getAirportURL(this.aeroflyFlight.navigation.waypoints.at(0)?.identifier ?? "");
    }
    getDestinationURL() {
        return this.getAirportURL(this.aeroflyFlight.navigation.waypoints.at(-1)?.identifier ?? "");
    }
    getAirportURL(icaoCode) {
        return new URL(`/airport/${encodeURIComponent(icaoCode)}`, "https://skyvector.com");
    }
    getWaypointIdentifiers() {
        return this.aeroflyFlight.navigation.waypoints
            .filter((c) => {
            return !(c instanceof AeroflyNavRouteDepartureRunway || c instanceof AeroflyNavRouteDestinationRunway);
        })
            .map((c) => {
            return this.getWaypointIdentifier(c);
        });
    }
    getWaypointIdentifier(c) {
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
        return (Math.abs(lat.degree).toFixed().padStart(2, "0") +
            lat.minutes.toFixed().padStart(2, "0") +
            lat.seconds.toFixed().padStart(2, "0") +
            coordinates.latHemisphere +
            Math.abs(lon.degree).toFixed().padStart(3, "0") +
            lon.minutes.toFixed().padStart(2, "0") +
            lon.seconds.toFixed().padStart(2, "0") +
            coordinates.lonHemisphere);
    }
}
