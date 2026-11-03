import { type Feature, type FeatureCollection, Point } from "@fboes/geojson";
import { fetchOpenTopoData } from "../../core/api/OpenTopoDataApi.js";
import type { OpenTopoDataApiCoordinates } from "../../core/api/OpenTopoDataApi.type.js";
import type { MissionGeneratorLocation } from "../MissionGenerator.type.js";

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
    waypoints: MissionGeneratorLocation[],
): Promise<MissionGeneratorLocation[]> {
    const pointsWithoutElevation = waypoints
        .filter((w: MissionGeneratorLocation) => w.position.elevation === null || w.position.elevation === undefined)
        .map(
            (w: MissionGeneratorLocation): OpenTopoDataApiCoordinates => ({
                lng: w.position.longitude,
                lat: w.position.latitude,
            }),
        );

    if (pointsWithoutElevation.length === 0) {
        return waypoints;
    }

    const elevations = await fetchOpenTopoData(pointsWithoutElevation);

    waypoints.forEach((w, index) => {
        w.position.elevation = elevations.results[index]?.elevation ?? null;
    });

    return waypoints;
}
