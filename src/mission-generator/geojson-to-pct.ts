import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { parseGeoJsonToLocations } from "./util/Location.js";
import {
    airportLightsFromLocation,
    lightsFromLocations,
    xrefFromLocations,
} from "./generators/hems-mission/HemsPoiFiles.js";
import type { Point } from "@fboes/geojson";
import { DIR_ASSETS } from "../core/util/directory.js";
import type { LocationExtended } from "./util/Location.type.js";
import { writeln, writeSuccess } from "../cli/formatter/writeCli.js";
import { DIR_FIXTURE } from "../test/loadFixture.js";
import { setLocationElevationFromApi } from "./util/setElevation.js";

const paths = fs.glob([
    path.join(DIR_ASSETS, "mission-generator", "**", "*.geojson"),
    // path.join(DIR_FIXTURE, "mission-generator", "**", "*.geojson"),
]);
for await (const sourcePath of paths) {
    writeln("Converting " + styleText("blueBright", sourcePath) + "...");
    const fstat = await fs.stat(sourcePath);
    const content = await fs.readFile(sourcePath, "utf-8");
    const geoJson = JSON.parse(content);
    const locations = parseGeoJsonToLocations(geoJson);

    writeln("Setting elevation for " + styleText("blueBright", locations.length.toString()) + " locations...");
    await setLocationElevationFromApi(locations);

    const sourceDirectory = path.dirname(sourcePath);
    const poiName = path.basename(sourceDirectory).replace(/^[ew][0-9]+[ns][0-9]+_/, "");
    const targetPath = path.join(sourceDirectory, `__${poiName}.json`);

    writeln("Writing " + styleText("blueBright", targetPath) + "...");
    await writeFile(targetPath, locations, poiName, fstat);
}

fs.cp(path.join(DIR_ASSETS, "mission-generator"), path.join(DIR_FIXTURE, "mission-generator"), { recursive: true });

writeSuccess("Done");

// ---------------------------------------------------------------------------------------------------------------------

async function writeFile(targetPath: string, locations: LocationExtended[], poiName: string = "pct", fstat?: fs.Stats) {
    const baseLocation = locations[0];
    if (!baseLocation) {
        throw new Error("No locations found");
    }
    await fs.writeFile(
        targetPath,
        JSON.stringify(
            {
                schemaVersion: 1,
                app: "pct",
                name: poiName,
                poiName,
                createdAt: fstat?.mtime ?? new Date(),
                modifiedAt: new Date(),
                reference: null,
                camera: {
                    lon: baseLocation.position.longitude,
                    lat: baseLocation.position.latitude,
                    zoom: 21,
                },
                objects: [
                    ...xrefFromLocations(locations).map((xref) => ({
                        id: uuid(),
                        kind: "xref",
                        name: xref.name,
                        position: convertPosition(xref.position),
                        height: {
                            mode: "asl",
                            value: (xref.position.elevation ?? 0) + (xref.heightAdjust ?? 1),
                        },
                        direction: xref.direction ?? 0,
                        scale: 1,
                        label: xref.label ?? "",
                    })),
                    ...lightsFromLocations(locations).map((light) => ({
                        id: uuid(),
                        height: {
                            mode: "asl",
                            value: (light.position.elevation ?? 0) + (light.heightAdjust ?? 1),
                        },
                        kind: "light",
                        position: convertPosition(light.position),
                        color: light.color,
                        intensity: light.intensity ?? 100,
                        flashing: light.flashing ?? [0, 0, 0, 0],
                        groupIndex: light.groupIndex ?? 0,
                        label: light.label ?? "",
                    })),
                    ...airportLightsFromLocation(locations).map((light) => ({
                        id: uuid(),
                        kind: "airport-light",
                        typeName: light.name,
                        position: convertPosition(light.position),
                        height: {
                            mode: "asl",
                            value: (light.position.elevation ?? 0) + (light.heightAdjust ?? 1),
                        },
                        orientation: light.orientation ?? 0,
                        configuration: "",
                        groupIndex: light.groupIndex ?? 0,
                        label: light.label ?? "",
                    })),
                ],
            },
            null,
            2,
        ),
        "utf-8",
    );
}

function convertPosition(position: Point) {
    return {
        lon: position.longitude,
        lat: position.latitude,
    };
}

/**
 * @returns a randomly generated, 36 character long v4 UUID
 */
function uuid(): string {
    return crypto.randomUUID();
}
