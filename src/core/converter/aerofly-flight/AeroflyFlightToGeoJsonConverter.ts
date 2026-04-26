import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { Feature, FeatureCollection, LineString, Point } from "@fboes/geojson";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

export class AeroflyFlightToGeoJsonConverter extends AeroflyFlightToStringConverter {
    static readonly fileExtension = "geojson";

    convert(flightplan: AeroflyFlight): string {
        const geoJson = new FeatureCollection();

        flightplan.navigation.waypoints.forEach((wp, index) => {
            geoJson.addFeature(
                new Feature(this.getPointForWaypoint(wp), {
                    id: index + 1,
                    title: wp.identifier,
                    type: wp.type,
                    "marker-symbol": this.getMarkerSymbolForWaypoint(wp),
                }),
            );
        });

        const index = flightplan.navigation.waypoints.length + 2;

        geoJson.addFeature(
            new Feature(
                new LineString([
                    new Point(
                        flightplan.flightSetting.longitude,
                        flightplan.flightSetting.latitude,
                        flightplan.flightSetting.altitude_meter,
                    ),
                    ...flightplan.navigation.waypoints.map((wp): Point => {
                        return this.getPointForWaypoint(wp);
                    }),
                ]),
                {
                    id: index + 2,
                    title: this.getFlightplanTitle(flightplan),
                    type: "flightplan",
                    stroke: "#FF1493",
                },
            ),
        );

        geoJson.addFeature(
            new Feature(
                new Point(
                    flightplan.flightSetting.longitude,
                    flightplan.flightSetting.latitude,
                    flightplan.flightSetting.altitude_meter,
                ),
                {
                    title: flightplan.aircraft.name,
                    livery: flightplan.aircraft.paintscheme,
                    id: index + 3,
                    type: "aircraft_position",
                    "marker-symbol": "airfield",
                },
            ),
        );

        return JSON.stringify(geoJson, null, 2);
    }

    protected getPointForWaypoint(wp: AeroflyNavRouteBase): Point {
        return new Point(wp.longitude, wp.latitude, this.getWaypointAltitude(wp));
    }

    protected getMarkerSymbolForWaypoint(wp: AeroflyNavRouteBase): string {
        if (wp instanceof AeroflyNavRouteOrigin || wp instanceof AeroflyNavRouteDestination) {
            return "airport";
        }
        if (wp instanceof AeroflyNavRouteDepartureRunway || wp instanceof AeroflyNavRouteDestinationRunway) {
            return "triangle-stroked";
        }
        return wp instanceof AeroflyNavRouteWaypoint && wp.navaidFrequency ? "communications-tower" : "triangle";
    }
}
