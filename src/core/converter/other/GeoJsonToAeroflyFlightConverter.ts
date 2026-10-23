import {
    AeroflyNavigationConfig,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
    type AeroflyFlight,
} from "@fboes/aerofly-custom-missions";
import { BaseStringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.base.js";
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString, type JSONUnvalidated } from "../parser/parseJSON.js";

type GeoJsonFeature = {
    geometry: {
        type: string;
        coordinates: JSONUnvalidated[];
    };
    properties: JSONUnvalidated;
};

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
    private ensureGeoJSONFeatures(geoJson: unknown): GeoJsonFeature[] {
        const possiblyGeoJson = asJSONObject(geoJson);
        const features = asJSONArray(possiblyGeoJson.features);

        return features.map((f) => {
            const feature = asJSONObject(f);
            const geometry = asJSONObject(feature.geometry);
            const type = asJSONString(geometry.type);
            const coordinates = asJSONArray(geometry.coordinates);
            const properties = asJSONObject(feature.properties);

            return {
                geometry: {
                    type,
                    coordinates,
                },
                properties,
            };
        });
    }

    /**
     * @returns only features with geometry of type "Point"
     */
    private ensureGeoJSONFeaturePoints(features: GeoJsonFeature[]): GeoJsonFeaturePoint[] {
        return features
            .filter((f) => f.geometry.type === "Point")
            .map((f, index): GeoJsonFeaturePoint => {
                return {
                    longitude: asJSONNumber(f.geometry.coordinates[0]),
                    latitude: asJSONNumber(f.geometry.coordinates[1]),
                    altitude_m: asJSONNumber(f.geometry.coordinates[2] ?? 0),
                    title: asJSONString(f.properties.title ?? this.indexToIdentifier(index)),
                    type: asJSONString(f.properties.type ?? ""),
                };
            })
            .filter((f) => !f.type.startsWith("aircraft"));
    }

    /**
     * @returns only features with geometry of type "LineString"
     */
    private ensureGeoJSONFeatureLineStrings(features: GeoJsonFeature[]): GeoJsonFeatureLineString[] {
        return features
            .filter((f) => f.geometry.type === "LineString")
            .map((f, index): GeoJsonFeatureLineString => {
                return {
                    coordinates: f.geometry.coordinates.map((c) => ({
                        longitude: asJSONNumber(c[0]),
                        latitude: asJSONNumber(c[1]),
                        altitude_m: asJSONNumber(c[2] ?? 0),
                    })),
                    title: asJSONString(f.properties.title ?? "#" + index.toFixed().padStart(2, "0")),
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
