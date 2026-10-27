import type { MissionGeneratorPayloadWaypoint } from "../../MissionGenerator.type.js";
import { Feature, FeatureCollection, Point, Vector } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs";
import path from "node:path";
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../../core/converter/parser/parseJSON.js";
import { degreeNormalize } from "../../../core/util/degree.js";

export type HemsMissionLocation = MissionGeneratorPayloadWaypoint<{
    type?: string;
    point: Point;
    direction?: number;
    approaches?: number[];
}>;

export class HemsMissionLocations {
    static readonly TYPE_HELIPORT = "heliport";
    static readonly TYPE_HOSPITAL = "hospital";

    private locations: HemsMissionLocation[] = [];

    loadLocationsFile(identifier: string, directory: string): number {
        const content = fs.readFileSync(this.pathLocations(identifier, directory), "utf-8");

        const geoJson = JSON.parse(content);

        this.locations = asJSONArray(geoJson.features)
            .filter((f) => {
                const geometry = asJSONObject(f.geometry);
                return asJSONString(f.type) === "Feature" && asJSONString(geometry.type) === "Point";
            })
            .map((f): HemsMissionLocation => {
                const geometry = asJSONObject(f.geometry);
                const coordinates = asJSONArray(geometry.coordinates);
                const longitude = asJSONNumber(coordinates[0]);
                const latitude = asJSONNumber(coordinates[1]);
                const altitude_m = coordinates[0] ? asJSONNumber(coordinates[0]) : undefined;

                const properties = asJSONObject(f.properties);
                const direction = properties.direction ? asJSONNumber(properties.direction) : undefined;
                const approaches = properties.approaches
                    ? asJSONArray(properties.approaches).map((a) => asJSONNumber(a))
                    : direction
                      ? [direction, degreeNormalize(direction + 180)]
                      : undefined;
                const type = properties["marker-symbol"] ? asJSONString(properties["marker-symbol"]) : undefined;
                const identifier = type === HemsMissionLocations.TYPE_HOSPITAL ? "HOSPITAL" : "MEDEVAC";

                return {
                    longitude,
                    latitude,
                    altitude_m,
                    identifier: properties.icaoCode ? asJSONString(properties.icaoCode) : identifier,
                    title: asJSONString(properties.title),
                    payload: {
                        type,
                        point: new Point(longitude, latitude, altitude_m),
                        direction,
                        approaches,
                    },
                };
            });

        return this.locations.length;
    }

    createLocationsFile(airportWaypoint: HemsMissionLocation, directory: string) {
        fs.writeFileSync(
            this.pathLocations(airportWaypoint.identifier, directory),
            JSON.stringify(this.createFeatureCollection(airportWaypoint), null, 2),
        );
    }

    private pathLocations(identifier: string, directory: string) {
        const slug = identifier.replace(/[^A-Za-z0-9\-]/v, "");
        return path.join(directory, `hems-mission-${slug}.geojson`);
    }

    private createFeatureCollection(airportWaypoint: HemsMissionLocation) {
        return new FeatureCollection([
            new Feature(airportWaypoint.payload.point, {
                title: airportWaypoint.title,
                icaoCode: airportWaypoint.identifier,
                "marker-symbol": "heliport",
            }),
            new Feature(airportWaypoint.payload.point.getPointBy(new Vector(5000, 45)), {
                title: "some emergency site",
            }),
        ]);
    }

    getAllLocations() {
        return this.locations;
    }

    findAllEmergencyWaypoints(): HemsMissionLocation[] {
        return this.locations.filter(
            (c) =>
                c.payload.type !== HemsMissionLocations.TYPE_HOSPITAL &&
                c.payload.type !== HemsMissionLocations.TYPE_HELIPORT,
        );
    }

    findRandomEmergencyWaypoint(airportPoint: Point, minRange_m: number, maxRange_m: number): HemsMissionLocation {
        if (minRange_m > maxRange_m) {
            throw new Error("Invalid distance range, minimum distance is greather than maximum distance");
        }
        const needsFiltering = minRange_m > 0 || maxRange_m < 99_000;

        const emergencyWaypoints = needsFiltering
            ? this.findAllEmergencyWaypoints().filter((wp) => {
                  const vector = wp.payload.point.getVectorTo(airportPoint);
                  return vector.meters >= minRange_m && vector.meters <= maxRange_m;
              })
            : this.findAllEmergencyWaypoints();

        if (emergencyWaypoints.length === 0) {
            throw new Error(
                needsFiltering
                    ? `No emergency sites found - check data source as well as filter`
                    : `No emergency sites found- check data source`,
            );
        }

        const emergencyWaypoint = emergencyWaypoints.at(randomIntInclusive(0, emergencyWaypoints.length - 1));
        if (!emergencyWaypoint) {
            throw new Error(`No emergency site found - check data source as well as filter`);
        }
        return emergencyWaypoint;
    }

    findAllHospitalWaypoints(): HemsMissionLocation[] {
        return this.locations.filter((c) => c.payload.type === HemsMissionLocations.TYPE_HOSPITAL);
    }

    findNearestHospitalWaypoint(emergencyData: HemsMissionLocation): HemsMissionLocation | undefined {
        const emergencyPoint = new Point(emergencyData.longitude, emergencyData.latitude, emergencyData.altitude_m);

        return this.findAllHospitalWaypoints()
            .sort((a: HemsMissionLocation, b: HemsMissionLocation): number => {
                return a.payload.point.getVectorTo(emergencyPoint).meters >
                    b.payload.point.getVectorTo(emergencyPoint).meters
                    ? 1
                    : -1;
            })
            .at(0);
    }

    findAllHeliportWaypoints(): HemsMissionLocation[] {
        return this.locations.filter((c) => c.payload.type === HemsMissionLocations.TYPE_HELIPORT);
    }

    findHeliportWaypointByIcaoId(icaoId: string): HemsMissionLocation | undefined {
        return this.findAllHeliportWaypoints()
            .filter((h) => h.identifier === icaoId || h.title === icaoId)
            .at(0);
    }
}
