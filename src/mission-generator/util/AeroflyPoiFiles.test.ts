import { strict as assert } from "node:assert/strict";
import { describe, it } from "node:test";
import { AeroflyPoiFiles } from "./AeroflyPoiFiles.js";
import { Point } from "@fboes/geojson";

await describe("AeroflyPoiFiles", (): void => {
    it("compiles", () => {
        const poi = new AeroflyPoiFiles("test");

        assert.ok(poi);

        poi.lights.push({
            position: new Point(10, 20),
            color: [255, 0, 0],
            intensity: 50,
            flashing: [1, 2, 3],
            groupIndex: 1,
        });

        poi.xref.push({
            name: "xref1",
            position: new Point(30, 40),
        });

        const tocLightContents = poi.tocLightContents();
        assert.ok(tocLightContents.length > 0);

        const tocFileContent = poi.tocFileContent();
        assert.ok(tocFileContent.length > 0);
        // console.log(tocFileContent);

        const tslFileContent = poi.tslFileContent();
        assert.ok(tslFileContent.length > 0);
        // console.log(tslFileContent);
    });
});
