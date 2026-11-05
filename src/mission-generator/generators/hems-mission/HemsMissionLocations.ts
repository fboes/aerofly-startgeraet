import { Feature, FeatureCollection, type Point, Vector } from "@fboes/geojson";
import { randomIntInclusive } from "../../../core/util/random.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { LocationExtended } from "../../util/Location.type.js";
import { parsePctJsonToLocations } from "../../util/Location.js";

export class HemsMissionLocations {
    static readonly TYPE_HELIPORT = "heliport";
    static readonly TYPE_HOSPITAL = "hospital";
    static readonly TYPE_HOSPITAL_HELIPORT = "hospital-JP";

    private locations: LocationExtended[] = [];

    /**
     * Will open the POI Creator Tool (PCT) JSON file with the mission locations
     * @param airportLocation starting airport
     * @param directory the directory the mission folders are supposed to be in
     * @returns the number of found locations. `-1` is returned if no file is found.
     */
    async loadLocationsFile(airportLocation: LocationExtended, directory: string): Promise<number> {
        const filePath = this.locationsFileGlob(airportLocation, directory);
        const file = await fs.glob(filePath).next();

        if (!file.value) {
            return -1;
        }

        const content = await fs.readFile(file.value, "utf-8");
        const pctJson = JSON.parse(content);
        this.locations = parsePctJsonToLocations(pctJson);

        return this.locations.length;
    }

    /**
     * @param airportLocation starting airport
     * @param directory the directory the mission folders are supposed to be in
     * @returns path to regular locations files, without file ending
     */
    private locationsFileGlob(airportLocation: LocationExtended, directory: string) {
        const slug = "startgeraet-hems-" + airportLocation.identifier.replace(/[^A-Za-z0-9\-]+/gv, "");
        return path.join(directory, "*_" + slug, "*.json");
    }

    private async createFeatureCollection(
        airportLocation: LocationExtended,
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

    findAllEmergencyLocations(): LocationExtended[] {
        return this.locations.filter(
            (c) =>
                c.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL) &&
                c.tags?.includes(HemsMissionLocations.TYPE_HELIPORT) &&
                c.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL_HELIPORT),
        );
    }

    findRandomEmergencyLocation(airportPoint: Point, minRange_m: number, maxRange_m: number): LocationExtended {
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

    findAllHospitalLocations(): LocationExtended[] {
        return this.locations.filter(
            (c) =>
                c.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL) ||
                c.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL_HELIPORT),
        );
    }

    findNearestHospitalLocation(emergencyData: LocationExtended): LocationExtended | undefined {
        return this.findAllHospitalLocations()
            .sort((a: LocationExtended, b: LocationExtended): number => {
                return a.position.getVectorTo(emergencyData.position).meters >
                    b.position.getVectorTo(emergencyData.position).meters
                    ? 1
                    : -1;
            })
            .at(0);
    }

    findAllHeliportLocations(): LocationExtended[] {
        return this.locations.filter(
            (c) =>
                c.tags?.includes(HemsMissionLocations.TYPE_HELIPORT) ||
                c.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL_HELIPORT),
        );
    }

    findHeliportLocationByIcaoId(icaoId: string): LocationExtended | undefined {
        return this.findAllHeliportLocations()
            .filter((h) => h.identifier === icaoId || h.title === icaoId)
            .at(0);
    }
}
