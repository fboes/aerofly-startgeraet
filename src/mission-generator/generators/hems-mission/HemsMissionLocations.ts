import type { LocationPayloaded } from "../../util/Location.type.js";
import { Feature, FeatureCollection, Point, Vector } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs/promises";
import path from "node:path";
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../../core/converter/parser/parseJSON.js";
import { degreeNormalize } from "../../../core/util/degree.js";
import { DIR_ASSETS } from "../../../core/util/directory.js";
import { createHemsPoiFiles } from "./HemsPoiFiles.js";
import { AeroflyPoiFiles } from "../../util/AeroflyPoiFiles.js";

export type HemsMissionLocation = LocationPayloaded<{
    type?: string;
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
     * @param airportLocation starting airport
     * @param directory the directory the mission folders are supposed to be in
     * @returns the number of found locations. `-1` is returned if no file is found.
     */
    async loadLocationsFile(airportLocation: HemsMissionLocation, directory: string): Promise<number> {
        const filePath = this.pathLocations(airportLocation, directory) + ".geojson";

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
                const altitude_m = coordinates[2] ? asJSONNumber(coordinates[2]) : undefined;

                const properties = asJSONObject(f.properties);
                const direction = properties.direction ? asJSONNumber(properties.direction) : undefined;
                const approaches = properties.approaches
                    ? asJSONArray(properties.approaches).map((a) => asJSONNumber(a))
                    : direction
                      ? [direction, degreeNormalize(direction + 180)]
                      : undefined;
                const type = properties["marker-symbol"] ? asJSONString(properties["marker-symbol"]) : undefined;

                return {
                    position: new Point(longitude, latitude, altitude_m),
                    identifier: properties.icaoCode
                        ? asJSONString(properties.icaoCode)
                        : `WP-${index.toString().padStart(3, "0")}`,
                    title: asJSONString(properties.title),
                    payload: {
                        type,
                        direction,
                        approaches,
                    },
                };
            });

        return this.locations.length;
    }

    /**
     * Will create a new GeoJSON file with the mission locations
     * @param airportLocation starting airport
     * @param directory the directory the mission folders are supposed to be in
     */
    async createLocationsFile(airportLocation: HemsMissionLocation, directory: string) {
        const pathLocations = this.pathLocations(airportLocation, directory);
        await fs.mkdir(path.dirname(pathLocations), { recursive: true });
        return fs.writeFile(
            pathLocations + ".geojson",
            JSON.stringify(await this.createFeatureCollection(airportLocation), null, 2),
        );
    }

    async createPoiFiles(airportLocation: HemsMissionLocation, directory: string) {
        const pathLocations = this.pathLocations(airportLocation, directory);
        const pathFallback = path.join(DIR_ASSETS, "poi", "fallback");
        await fs.mkdir(path.dirname(pathLocations), { recursive: true });

        // TODO: Currently this only maps emergency locations
        const poi = await createHemsPoiFiles(path.basename(pathLocations), this.findAllEmergencyLocations());

        return Promise.all([
            fs.writeFile(pathLocations + ".toc", poi.tocFileContent()),
            fs.writeFile(pathLocations + ".tsl", poi.tslFileContent()),
            poi.isAutoHeight
                ? fs.cp(pathFallback, path.join(path.dirname(pathLocations), "fallback"), { recursive: true })
                : Promise.resolve(),
        ]);
    }

    /**
     * @param airportLocation starting airport
     * @param directory the directory the mission folders are supposed to be in
     * @returns path to regular locations files, without file ending
     */
    private pathLocations(airportLocation: HemsMissionLocation, directory: string) {
        const slug = this.fileSlug(airportLocation.identifier);
        return path.join(directory, AeroflyPoiFiles.poiFolderName(airportLocation.position, slug), slug);
    }

    private fileSlug(identifier: string) {
        return "startgeraet-hems-" + identifier.replace(/[^A-Za-z0-9\-]+/gv, "");
    }

    private async createFeatureCollection(
        airportLocation: HemsMissionLocation,
        minRange_m: number = 0,
        maxRange_m: number = 60_000,
    ): Promise<FeatureCollection> {
        const averageRange_m = (minRange_m + maxRange_m) / 2;
        let i = 0;

        // await setElevationFromApi(featureCollection)

        return new FeatureCollection([
            new Feature(
                airportLocation.position,
                {
                    title: airportLocation.title ?? airportLocation.identifier,
                    icaoCode: airportLocation.identifier,
                    "marker-symbol": HemsMissionLocations.TYPE_HELIPORT,
                },
                i++,
            ),
            new Feature(
                airportLocation.position.getPointBy(new Vector(averageRange_m, 300)),
                {
                    title: "a hospital",
                    "marker-symbol": HemsMissionLocations.TYPE_HOSPITAL,
                },
                i++,
            ),
            new Feature(
                airportLocation.position.getPointBy(new Vector(averageRange_m, 60)),
                {
                    title: "some emergency site",
                },
                i++,
            ),

            new Feature(
                airportLocation.position.getPointBy(new Vector(averageRange_m, 180)),
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

    findAllEmergencyLocations(): HemsMissionLocation[] {
        return this.locations.filter(
            (c) =>
                c.payload.type !== HemsMissionLocations.TYPE_HOSPITAL &&
                c.payload.type !== HemsMissionLocations.TYPE_HELIPORT &&
                c.payload.type !== HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
        );
    }

    findRandomEmergencyLocation(airportPoint: Point, minRange_m: number, maxRange_m: number): HemsMissionLocation {
        if (minRange_m > maxRange_m) {
            throw new Error("Invalid distance range, minimum distance is greather than maximum distance");
        }
        const needsFiltering = minRange_m > 0 || maxRange_m < 99_000;

        const emergencyLocations = needsFiltering
            ? this.findAllEmergencyLocations().filter((wp) => {
                  const vector = wp.position.getVectorTo(airportPoint);
                  return vector.meters >= minRange_m && vector.meters <= maxRange_m;
              })
            : this.findAllEmergencyLocations();

        if (emergencyLocations.length === 0) {
            throw new Error(
                needsFiltering
                    ? `No emergency sites found - check data source as well as filter`
                    : `No emergency sites found - check data source`,
            );
        }

        const emergencyLocation = emergencyLocations.at(randomIntInclusive(0, emergencyLocations.length - 1));
        if (!emergencyLocation) {
            throw new Error(`No emergency site found - randomizer is broken`);
        }
        return emergencyLocation;
    }

    findAllHospitalLocations(): HemsMissionLocation[] {
        return this.locations.filter(
            (c) =>
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL ||
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
        );
    }

    findNearestHospitalLocation(emergencyData: HemsMissionLocation): HemsMissionLocation | undefined {
        return this.findAllHospitalLocations()
            .sort((a: HemsMissionLocation, b: HemsMissionLocation): number => {
                return a.position.getVectorTo(emergencyData.position).meters >
                    b.position.getVectorTo(emergencyData.position).meters
                    ? 1
                    : -1;
            })
            .at(0);
    }

    findAllHeliportLocations(): HemsMissionLocation[] {
        return this.locations.filter(
            (c) =>
                c.payload.type === HemsMissionLocations.TYPE_HELIPORT ||
                c.payload.type === HemsMissionLocations.TYPE_HOSPITAL_HELIPORT,
        );
    }

    findHeliportLocationByIcaoId(icaoId: string): HemsMissionLocation | undefined {
        return this.findAllHeliportLocations()
            .filter((h) => h.identifier === icaoId || h.title === icaoId)
            .at(0);
    }
}
