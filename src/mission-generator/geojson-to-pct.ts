import fs from "node:fs/promises";
import { parsePctJsonToLocations } from "./util/Location.js";
import { lightsFromLocations, xrefFromLocations } from "./generators/hems-mission/HemsPoiFiles.js";
import type { Point } from "@fboes/geojson";

const poiName = "";
const sourcePath = "";

const content = await fs.readFile(sourcePath, "utf-8");
const geoJson = JSON.parse(content);
const locations = parsePctJsonToLocations(geoJson);

const targetPath = "";
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
                    kind: "xref",
                    name: xref.name,
                    position: convertPosition(xref.position),
                    height: {
                        mode: "terrain",
                    },
                    direction: xref.direction ?? 0,
                    scale: 1,
                })),
                ...lightsFromLocations(locations).map((light) => ({
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

function convertPosition(position: Point) {
    return {
        lon: position.longitude,
        lat: position.latitude,
    };
}
