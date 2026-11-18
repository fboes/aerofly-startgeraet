import {
    AeroflyNavigationConfig,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
    type AeroflyFlight,
} from "@fboes/aerofly-custom-missions";
import { BaseStringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.base.js";
import { parseGeoJson, type GeoJsonFeature } from "../../validator/GeoJson.js";

type GeoJsonFeaturePoint = {
    longitude: number;
    latitude: number;
    altitude_m: number;
    title: string;
    type: string;
};

type GeoJsonFeatureLineString = {
    coordinates: {
        longitude: number;
        latitude: number;
        altitude_m: number;
    }[];
    title: string;
};

type GeoJsonPayload = {
    points: GeoJsonFeaturePoint[];
    lineStrings: GeoJsonFeatureLineString[];
};

/**
 * Imports GeoJSON files.
 */
export class GeoJsonToAeroflyFlightConverter extends BaseStringToAeroflyFlightConverter {
    static readonly fileName = "GeoJSON File";
    static readonly fileExtension = "geojson";

    /**
     * @returns a single index for Point data, and multiple indices for all
     * LineString data
     */
    getIndices(content: string): string[] {
        const geoJson = this.ensureGeoJSONPayload(JSON.parse(content));
        return [
            ...(geoJson.points.length > 2 ? ["Point data (with identifiers)"] : []),
            ...geoJson.lineStrings.map((feature) => `LineString: ${feature.title} (w/o identifiers)`),
        ];
    }

    /**
     * Converts GeoJSON. If index is 0 and Points are present, this will import
     * the points. If no Points are present or an index > 0 is set, it will
     * import the corresponding LineString.
     */
    convert(content: string, flightplan: AeroflyFlight, index: number = 0): void {
        const geoJson = this.ensureGeoJSONPayload(JSON.parse(content));

        const aeroflyWaypoints: AeroflyNavRouteBase[] =
            geoJson.points.length > 2
                ? index === 0
                    ? this.pointsToWaypoint(geoJson.points)
                    : this.lineStringToWaypoint(geoJson.lineStrings.at(index - 1))
                : this.lineStringToWaypoint(geoJson.lineStrings.at(index));

        flightplan.navigation = new AeroflyNavigationConfig(
            this.getCruiseAltitudeM(aeroflyWaypoints) || flightplan.navigation.cruiseAltitude,
            aeroflyWaypoints,
        );
        flightplan._missionTitle = "";
        flightplan._missionBriefing = "";
    }

    private ensureGeoJSONPayload(geoJson: unknown): GeoJsonPayload {
        const features = this.ensureGeoJSONFeatures(geoJson);
        return {
            points: this.ensureGeoJSONFeaturePoints(features),
            lineStrings: this.ensureGeoJSONFeatureLineStrings(features),
        };
    }

    /**
     * @returns GeoJSON feature objects
     */
    private ensureGeoJSONFeatures(possiblyGeoJson: unknown): GeoJsonFeature[] {
        const geoJson = parseGeoJson(possiblyGeoJson);

        return geoJson.features;
    }

    /**
     * @returns only features with geometry of type "Point"
     */
    private ensureGeoJSONFeaturePoints(features: GeoJsonFeature[]): GeoJsonFeaturePoint[] {
        return features
            .filter((f) => f.type === "Feature" && f.geometry.type === "Point")
            .map((f, index): GeoJsonFeaturePoint => {
                const longitude = f.geometry.coordinates[0] as number | undefined;
                const latitude = f.geometry.coordinates[1] as number | undefined;
                const altitude_m = f.geometry.coordinates[2] as number | undefined;
                if (!longitude || !latitude) {
                    throw new Error("Not enough coordinates in GeoJson");
                }
                return {
                    longitude,
                    latitude,
                    altitude_m: altitude_m ?? 0,
                    title: f.properties.title ?? this.indexToIdentifier(index),
                    type: f.properties.type ?? "",
                };
            })
            .filter((f) => !f.type.startsWith("aircraft"));
    }

    /**
     * @returns only features with geometry of type "LineString"
     */
    private ensureGeoJSONFeatureLineStrings(features: GeoJsonFeature[]): GeoJsonFeatureLineString[] {
        return features
            .filter((f) => f.type === "Feature" && f.geometry.type === "LineString")
            .map((f, index): GeoJsonFeatureLineString => {
                const coordinates = f.geometry.coordinates as number[][];

                return {
                    coordinates: coordinates.map((c) => {
                        const longitude = f.geometry.coordinates[0] as number | undefined;
                        const latitude = f.geometry.coordinates[1] as number | undefined;
                        if (!longitude || !latitude) {
                            throw new Error("Not enough coordinates in GeoJson");
                        }
                        return {
                            longitude,
                            latitude,
                            altitude_m: c[2] ?? 0,
                        };
                    }),
                    title: f.properties.title ?? "#" + index.toFixed().padStart(2, "0"),
                };
            });
    }

    private pointsToWaypoint(points: GeoJsonFeaturePoint[]): AeroflyNavRouteBase[] {
        return points.map(
            (waypoint, index): AeroflyNavRouteBase =>
                this.convertWaypointToAerofly(waypoint, index === 0, index === points.length - 1),
        );
    }

    private lineStringToWaypoint(lineString: GeoJsonFeatureLineString | undefined): AeroflyNavRouteBase[] {
        if (lineString === undefined) {
            throw new Error("No valid LineString feature found for conversion");
        }
        return lineString.coordinates.map(
            (waypoint, index): AeroflyNavRouteBase =>
                new AeroflyNavRouteWaypoint(this.indexToIdentifier(index), waypoint.longitude, waypoint.latitude, {
                    altitude: waypoint.altitude_m ?? undefined,
                }),
        );
    }

    /**
     * @returns the actual Aerofly waypoints, converted from GeoJsonPoint
     */
    private convertWaypointToAerofly(
        waypoint: GeoJsonFeaturePoint,
        isFirst: boolean,
        isLast: boolean,
    ): AeroflyNavRouteBase {
        if (isFirst) {
            return new AeroflyNavRouteOrigin(waypoint.title, waypoint.longitude, waypoint.latitude, {
                elevation: waypoint.altitude_m ?? undefined,
            });
        }
        if (isLast) {
            return new AeroflyNavRouteDestination(waypoint.title, waypoint.longitude, waypoint.latitude, {
                elevation: waypoint.altitude_m ?? undefined,
            });
        }
        return new AeroflyNavRouteWaypoint(waypoint.title, waypoint.longitude, waypoint.latitude, {
            altitude: waypoint.altitude_m ?? undefined,
        });
    }

    private indexToIdentifier(index: number): string {
        return `WP-${index.toFixed().padStart(4, "0")}`;
    }
}
