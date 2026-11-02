import { type Feature, type FeatureCollection, Point } from "@fboes/geojson";
import { fetchOpenTopoData } from "../../core/api/OpenTopoDataApi.js";
import type { OpenTopoDataApiCoordinates } from "../../core/api/OpenTopoDataApi.type.js";
import type { MissionGeneratorWaypoint } from "../MissionGenerator.type.js";

export async function setPointElevationFromApi(points: Point[]): Promise<Point[]> {
    const pointsWithoutElevation = points
        .filter((p: Point) => p.elevation === null || p.elevation === undefined)
        .map(
            (p: Point): OpenTopoDataApiCoordinates => ({
                lng: p.longitude,
                lat: p.latitude,
            }),
        );

    if (pointsWithoutElevation.length === 0) {
        return points;
    }

    const elevations = await fetchOpenTopoData(pointsWithoutElevation);

    points.forEach((p, index) => {
        p.elevation = elevations.results[index]?.elevation ?? null;
    });

    return points;
}

export async function setFeatureElevationFromApi(featureCollection: FeatureCollection): Promise<FeatureCollection> {
    const features = featureCollection.features.filter((f: Feature) => {
        return f.geometry instanceof Point && (f.geometry.elevation === null || f.geometry.elevation === undefined);
    });

    if (features.length === 0) {
        return featureCollection;
    }

    const elevations = await fetchOpenTopoData(
        features.map((p: Feature): OpenTopoDataApiCoordinates => {
            const point = p.geometry as Point;
            return {
                lng: point.longitude,
                lat: point.latitude,
            };
        }),
    );

    features.forEach((p, index) => {
        const point = p.geometry as Point;
        point.elevation = elevations.results[index]?.elevation ?? null;
    });

    return featureCollection;
}

export async function setMisionGeneratorWaypointElevationFromApi(
    waypoints: MissionGeneratorWaypoint[],
): Promise<MissionGeneratorWaypoint[]> {
    const pointsWithoutElevation = waypoints
        .filter((w: MissionGeneratorWaypoint) => w.altitude_m === null || w.altitude_m === undefined)
        .map(
            (w: MissionGeneratorWaypoint): OpenTopoDataApiCoordinates => ({
                lng: w.longitude,
                lat: w.latitude,
            }),
        );

    if (pointsWithoutElevation.length === 0) {
        return waypoints;
    }

    const elevations = await fetchOpenTopoData(pointsWithoutElevation);

    waypoints.forEach((w, index) => {
        w.altitude_m = elevations.results[index]?.elevation ?? undefined;
    });

    return waypoints;
}
