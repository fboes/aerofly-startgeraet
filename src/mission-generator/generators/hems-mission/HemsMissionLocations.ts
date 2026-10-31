import type { MissionGeneratorPayloadWaypoint } from "../../MissionGenerator.type.js";
import { Feature, FeatureCollection, Point, Vector } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs/promises";
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
    static readonly TYPE_HOSPITAL_HELIPORT = "hospital-JP";

    private locations: HemsMissionLocation[] = [];

    /**
     * Will open the GeoJSON file with the mission locations
     * @param airportWaypoint starting airport
     * @param directory the directory the mission folders are supposed to be in
     * @returns the number of found locations. `-1` is returned if no file is found.
     */
    async loadLocationsFile(airportWaypoit: HemsMissionLocation, directory: string): Promise<number> {
        const filePath = this.pathLocations(airportWaypoit, directory);
        try {
            (await fs.stat(filePath)).isFile();
        } catch {
            return -1;
        }

        const content = await fs.readFile(filePath, "utf-8");
        const geoJson = JSON.parse(content);

        this.locations = asJSONArray(geoJson.features)
            .filter((f) => {
                const geometry = asJSONObject(f.geometry);
                return asJSONString(f.type) === "Feature" && asJSONString(geometry.type) === "Point";
            })
            .map((f, index): HemsMissionLocation => {
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

                return {
                    longitude,
                    latitude,
                    altitude_m,
                    identifier: properties.icaoCode
                        ? asJSONString(properties.icaoCode)
                        : `WP-${index.toString().padStart(3, "0")}`,
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

    /**
     * Will create a new GeoJSON file with the mission locations
     * @param airportWaypoint starting airport
     * @param directory the directory the mission folders are supposed to be in
     */
    async createLocationsFile(airportWaypoint: HemsMissionLocation, directory: string) {
        const pathLocations = this.pathLocations(airportWaypoint, directory);
        await fs.mkdir(path.dirname(pathLocations), { recursive: true });
        return fs.writeFile(pathLocations, JSON.stringify(this.createFeatureCollection(airportWaypoint), null, 2));
    }

    /**
     * @param airportWaypoint starting airport
     * @returns the correct file path to the GeoJSON file
     */
    private pathLocations(airportWaypoint: HemsMissionLocation, directory: string) {
        const slug = this.fileSlug(airportWaypoint.identifier);
        return path.join(
            directory,
            `${this.aeroflyPoiFolderCoordinates(airportWaypoint.payload.point)}_${slug}`,
            `${slug}.geojson`,
        );
    }

    /**
     * @param point holding coordinates
     * @returns something like `e01045n5324`
     */
    aeroflyPoiFolderCoordinates(point: Point): string {
        return (
            (point.longitude > 0 ? "e" : "w") +
            String(Math.abs(Math.round(point.longitude * 100))).padStart(5, "0") +
            (point.latitude > 0 ? "n" : "s") +
            String(Math.abs(Math.round(point.latitude * 100))).padStart(4, "0")
        );
    }

    private fileSlug(identifier: string) {
        return "startgeraet-hems-" + identifier.replace(/[^A-Za-z0-9\-]+/gv, "");
    }

    private createFeatureCollection(
        airportWaypoint: HemsMissionLocation,
        minRange_m: number = 0,
        maxRange_m: number = 60_000,
    ) {
        const averageRange_m = (minRange_m + maxRange_m) / 2;
        let i = 0;
        return new FeatureCollection([
            new Feature(
                airportWaypoint.payload.point,
                {
                    title: airportWaypoint.title ?? airportWaypoint.identifier,
                    icaoCode: airportWaypoint.identifier,
                    "marker-symbol": HemsMissionLocations.TYPE_HELIPORT,
                },
                i++,
            ),
            new Feature(
                airportWaypoint.payload.point.getPointBy(new Vector(averageRange_m, 300)),
                {
                    title: "a hospital",
                    "marker-symbol": HemsMissionLocations.TYPE_HOSPITAL,
                },
                i++,
            ),
            new Feature(
                airportWaypoint.payload.point.getPointBy(new Vector(averageRange_m, 60)),
                {
                    title: "some emergency site",
                },
                i++,
            ),

            new Feature(
                airportWaypoint.payload.point.getPointBy(new Vector(averageRange_m, 180)),
                {
                    title: "another emergency site",
                },
                i,
            ),
        ]);
    }

    getAllLocations() {
        return this.locations;
    }

    findAllEmergencyWaypoints(): HemsMissionLocation[] {
        return this.locations.filter(
            (c) =>
                c.payload.type !== HemsMissionLocations.TYPE_HOSPITAL &&
                c.payload.type !== HemsMissionLocations.TYPE_HELIPORT &&
                c.payload.type !== HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
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
        return this.locations.filter(
            (c) =>
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL ||
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
        );
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
        return this.locations.filter(
            (c) =>
                c.payload.type === HemsMissionLocations.TYPE_HELIPORT ||
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
        );
    }

    findHeliportWaypointByIcaoId(icaoId: string): HemsMissionLocation | undefined {
        return this.findAllHeliportWaypoints()
            .filter((h) => h.identifier === icaoId || h.title === icaoId)
            .at(0);
    }
}
