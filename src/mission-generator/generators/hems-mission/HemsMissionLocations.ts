import type { MissionGeneratorWaypoint } from "../../MissionGenerator.type.js";
import { Point } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs";
import path from "node:path";
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../../core/converter/parser/parseJSON.js";

export type HemsMissionLocation = MissionGeneratorWaypoint<{ type: string | undefined; point: Point }>;

export class HemsMissionLocations {
    private locations: HemsMissionLocation[] = [];

    constructor(
        private readonly minRange_m: number,
        private readonly maxRange_m: number,
    ) {}

    loadLocations(identifier: string, directory: string): number {
        const content = fs.readFileSync(this.pathLocations(identifier, directory), "utf-8");

        const geoJson = JSON.parse(content);

        this.locations = asJSONArray(geoJson.features)
            .filter((f) => {
                const geometry = asJSONObject(f.geometry);
                return asJSONString(f.type) === "Feature" && asJSONString(geometry.type) === "Point";
            })
            .map((f, index): HemsMissionLocation => {
                const properties = asJSONObject(f.properties);
                const geometry = asJSONObject(f.geometry);
                const coordinates = asJSONArray(geometry.coordinates);

                const longitude = asJSONNumber(coordinates[0]);
                const latitude = asJSONNumber(coordinates[1]);
                const altitude_m = coordinates[0] ? asJSONNumber(coordinates[0]) : undefined;

                return {
                    longitude,
                    latitude,
                    altitude_m,
                    identifier: properties.icaoCode
                        ? asJSONString(properties.icaoCode)
                        : `WP-${index.toFixed().padStart(4, "0")}`,
                    title: asJSONString(properties.title),
                    payload: {
                        type: properties["marker-symbol"] ? asJSONString(properties["marker-symbol"]) : undefined,
                        point: new Point(longitude, latitude, altitude_m),
                    },
                };
            });

        return this.locations.length;
    }

    private pathLocations(identifier: string, directory: string) {
        const slug = identifier.replace(/[^A-Za-z0-9\-]/v, "");
        return path.join(directory, `hems-mission-${slug}.geojson`);
    }

    getAllLocations() {
        return this.locations;
    }

    getAllEmergencyWaypoints(): HemsMissionLocation[] {
        return this.locations.filter((c) => c.payload?.type !== "hospital");
    }

    getRandomEmergencyWaypoint(airportPoint: Point): HemsMissionLocation {
        const emergencyWaypoints = this.getAllEmergencyWaypoints().filter((wp) => {
            if (wp.payload === undefined) {
                return true;
            }

            const vector = wp.payload.point.getVectorTo(airportPoint);
            return vector.meters < this.minRange_m || vector.meters > this.maxRange_m;
        });
        if (emergencyWaypoints.length === 0) {
            throw new Error(`No emergency sites found - check data source as well as filter`);
        }

        const emergencyWaypoint = emergencyWaypoints[randomIntInclusive(0, emergencyWaypoints.length - 1)];
        if (!emergencyWaypoint) {
            throw new Error(`No emergency site found - check data source as well as filter`);
        }
        return emergencyWaypoint;
    }

    getAllHospitalWaypoints(): HemsMissionLocation[] {
        return this.locations.filter((c) => c.payload?.type === "hospital");
    }

    getNearestHospitalWaypoint(emergencyData: HemsMissionLocation): HemsMissionLocation | undefined {
        const emergencyPoint = new Point(emergencyData.longitude, emergencyData.latitude, emergencyData.altitude_m);

        return this.getAllHospitalWaypoints()
            .sort((a: HemsMissionLocation, b: HemsMissionLocation): number => {
                if (a.payload === undefined) {
                    return 1;
                }

                if (b.payload === undefined) {
                    return -1;
                }
                return a.payload?.point.getVectorTo(emergencyPoint).meters >
                    b.payload?.point.getVectorTo(emergencyPoint).meters
                    ? -1
                    : 1;
            })
            .at(0);
    }
}
