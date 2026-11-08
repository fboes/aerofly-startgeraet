import fs from "node:fs/promises";
import type { Stats } from "node:fs";
import path from "node:path";
import { styleText } from "node:util";
import { parseGeoJsonToLocations } from "./util/Location.js";
import { lightsFromLocations, xrefFromLocations } from "./generators/hems-mission/HemsPoiFiles.js";
import type { Point } from "@fboes/geojson";
import { DIR_ASSETS } from "../core/util/directory.js";
import type { LocationExtended } from "./util/Location.type.js";
import { writeln, writeSuccess } from "../cli/formatter/writeCli.js";
import { DIR_FIXTURE } from "../test/loadFixture.js";
import { setLocationElevationFromApi } from "./util/setElevation.js";
import { createHash } from "node:crypto";
import type { AeroflyPoiLight, AeroflyPoiXref } from "./util/AeroflyPoiFiles.js";

const paths = fs.glob([path.join(DIR_ASSETS, "mission-generator", "**", "*.geojson")]);
for await (const sourcePath of paths) {
    writeln("Converting " + styleText("blueBright", sourcePath) + "...");
    const fstat = await fs.stat(sourcePath);
    const content = await fs.readFile(sourcePath, "utf-8");
    const geoJson = JSON.parse(content);
    const locations = parseGeoJsonToLocations(geoJson);

    writeln("> Setting elevation for " + styleText("blueBright", locations.length.toString()) + " locations...");
    await setLocationElevationFromApi(locations);

    const sourceDirectory = path.dirname(sourcePath);
    const poiName = path.basename(sourceDirectory).replace(/^[ew][0-9]+[ns][0-9]+_/, "");
    const targetPath = path.join(sourceDirectory, `__${poiName}.json`);

    writeln("> Writing " + styleText("blueBright", targetPath) + "...");
    await writeFile(targetPath, locations, poiName, fstat);
}

writeln("Copying from assets to fixture...");
fs.cp(path.join(DIR_ASSETS, "mission-generator"), path.join(DIR_FIXTURE, "mission-generator"), { recursive: true });

writeSuccess("Done");

// ---------------------------------------------------------------------------------------------------------------------

async function writeFile(targetPath: string, locations: LocationExtended[], poiName: string = "pct", fstat?: Stats) {
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
                        id: uuid(targetPath, xref),
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
                        id: uuid(targetPath, light),
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
 * @returns a 36 character long v4 UUID
 */
function uuid(filename: string, obj: AeroflyPoiXref | AeroflyPoiLight): string {
    const hash = createHash("sha256").update(filename).update("\0").update(JSON.stringify(obj)).digest();

    if (hash[6] === undefined || hash[8] === undefined) {
        throw new Error("Hash is too short to generate a UUID");
    }

    hash[6] = (hash[6] & 0x0f) | 0x40; // Version 4
    hash[8] = (hash[8] & 0x3f) | 0x80; // Variante RFC 4122

    const hex = hash.subarray(0, 16).toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
