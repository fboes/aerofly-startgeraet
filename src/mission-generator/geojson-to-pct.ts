import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { parseGeoJsonToLocations } from "./util/Location.js";
import { lightsFromLocations, xrefFromLocations } from "./generators/hems-mission/HemsPoiFiles.js";
import type { Point } from "@fboes/geojson";
import { DIR_ASSETS } from "../core/util/directory.js";
import type { LocationExtended } from "./util/Location.type.js";
import { writeln, writeSuccess } from "../cli/formatter/writeCli.js";
import { DIR_FIXTURE } from "../test/loadFixture.js";

const paths = fs.glob([
    path.join(DIR_ASSETS, "mission-generator", "**", "*.geojson"),
    path.join(DIR_FIXTURE, "mission-generator", "**", "*.geojson"),
]);
for await (const sourcePath of paths) {
    writeln("Converting " + styleText("blueBright", sourcePath) + "...");
    const content = await fs.readFile(sourcePath, "utf-8");
    const geoJson = JSON.parse(content);
    const locations = parseGeoJsonToLocations(geoJson);

    const sourceDirectory = path.dirname(sourcePath);
    const poiName = path.basename(sourceDirectory).replace(/^[ew][0-9]+[ns][0-9]+_/, "");
    const targetPath = path.join(sourceDirectory, `__${poiName}.json`);
    await writeFile(targetPath, locations, poiName);
}
writeSuccess("Done");

// ---------------------------------------------------------------------------------------------------------------------

async function writeFile(targetPath: string, locations: LocationExtended[], poiName: string = "pct") {
    await fs.writeFile(
        targetPath,
        JSON.stringify(
            {
                schemaVersion: 1,
                app: "pct",
                name: poiName,
                poiName,
                createdAt: new Date(),
                modifiedAt: new Date(),
                reference: null,
                camera: {},
                objects: [
                    ...xrefFromLocations(locations).map((xref) => ({
                        id: uuid(),
                        kind: "xref",
                        name: xref.name,
                        position: convertPosition(xref.position),
                        height: {
                            mode: "terrain",
                        },
                        direction: xref.direction ?? 0,
                        scale: 1,
                        label: xref.label ?? "",
                    })),
                    ...lightsFromLocations(locations).map((light) => ({
                        id: uuid(),
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
 * @returns a randomly generated, 36 character long v4 UUID
 */
function uuid(): string {
    return crypto.randomUUID();
}
