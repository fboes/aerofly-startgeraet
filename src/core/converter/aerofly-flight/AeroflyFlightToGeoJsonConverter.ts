import {
    type AeroflyFlight,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.js";
import { Feature, FeatureCollection, LineString, Point } from "@fboes/geojson";

export class AeroflyFlightToGeoJsonConverter extends AeroflyFlightToStringConverter {
    static readonly fileName = "GeoJSON";
    static readonly fileExtension = "geojson";

    convert(flightplan: AeroflyFlight): string {
        const geoJson = new FeatureCollection();

        let id = 0;

        flightplan.navigation.waypoints.forEach((wp, index) => {
            geoJson.addFeature(
                new Feature(this.getPointForWaypoint(wp), {
                    id: id++,
                    sequence: index + 1,
                    title: wp.identifier,
                    type: wp.type,
                    altitude_ft: this.getWaypointAltitudeFt(wp),
                    "marker-symbol": this.getMarkerSymbolForWaypoint(wp),
                }),
            );
        });

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
                    id: id++,
                    title: this.getFlightplanTitle(flightplan),
                    description: this.getMissionBriefing(flightplan),
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
                    id: id++,
                    type: "aircraft_position",
                    altitude_ft: flightplan.flightSetting.altitude_ft,
                    "marker-symbol": "airfield",
                },
            ),
        );

        return JSON.stringify(geoJson, null, 2);
    }

    private getPointForWaypoint(wp: AeroflyNavRouteBase): Point {
        return new Point(wp.longitude, wp.latitude, this.getWaypointAltitude(wp));
    }

    private getMarkerSymbolForWaypoint(wp: AeroflyNavRouteBase): string {
        if (wp instanceof AeroflyNavRouteOrigin || wp instanceof AeroflyNavRouteDestination) {
            return "airport";
        }
        if (wp instanceof AeroflyNavRouteDepartureRunway || wp instanceof AeroflyNavRouteDestinationRunway) {
            return "triangle-stroked";
        }
        return wp instanceof AeroflyNavRouteWaypoint && wp.navaidFrequency ? "communications-tower" : "triangle";
    }
}
