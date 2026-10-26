import type { MissionGeneratorWaypoint } from "../../MissionGenerator.type.js";
import { Point } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs";
import path from "node:path";

export type HemsMissionLocation = MissionGeneratorWaypoint<{ type: string | undefined; point: Point }>;

export class HemsMissionLocations {
    private readonly locations: HemsMissionLocation[] = [];

    constructor(
        private readonly minRange_m: number,
        private readonly maxRange_m: number,
    ) {}

    loadLocations(identifier: string, directory: string): number {
        fs.readFileSync(this.pathLocations(identifier, directory), "utf-8");
        return this.locations.length;
    }

    private pathLocations(identifier: string, directory: string) {
        const slug = identifier.replace(/^[A-Za-z0-9\-]/v, "");
        return path.join(directory, `hems-mission-${slug}.geojson`);
    }

    getRandomEmergencyWaypoint(airportPoint: Point): HemsMissionLocation {
        const emergencyWaypoints = this.locations
            .filter((c) => c.payload?.type !== "hospital")
            .filter((wp) => {
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

    getNearestHospitalWaypoint(emergencyData: HemsMissionLocation): HemsMissionLocation | undefined {
        const emergencyPoint = new Point(emergencyData.longitude, emergencyData.latitude, emergencyData.altitude_m);

        return this.locations
            .filter((c) => c.payload?.type === "hospital")
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
