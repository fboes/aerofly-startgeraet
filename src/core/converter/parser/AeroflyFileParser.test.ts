import { describe, it } from "node:test";
import assert from "node:assert";
import { AeroflyFileParser } from "./AeroflyFileParser.js";

describe("AeroflyFileParser", () => {
    it("should replace information in empty groups", () => {
        const mcf = `\
<[file][][]
    <[tmsettings_sim][][]
        <[tmsettings_clouds][clouds][]>
        <[tmsettings_clouds][clouds][]
            <[float64][cumulus_density][0]> // CLR
            <[float64][cumulus_height][0]> // 0 ft AGL
            <[float64][cirrus_density][0]> // CLR
            <[float64][cirrus_height][0]> // 0 ft AGL
            <[float64][cumulus_mediocris_density][0]> // CLR
            <[float64][cumulus_mediocris_height][0]> // 0 ft AGL
        >
    >
>
`;

        const parser = new AeroflyFileParser();
        const newMcf = parser.setGroup(mcf, "tmsettings_clouds", 2, "<EXAMPLE>");

        assert.ok(newMcf);
        assert.ok(newMcf.includes("tmsettings_clouds"));
        assert.ok(newMcf.includes("<EXAMPLE>"));

        // console.log(newMcf);
    });

    it("should replace information in filled groups", () => {
        const mcf = `\
<[file][][]
    <[tmsettings_sim][][]
        <[tmsettings_clouds][clouds][]
            <[float64][cumulus_density][0]> // CLR
            <[float64][cumulus_height][0]> // 0 ft AGL
            <[float64][cirrus_density][0]> // CLR
            <[float64][cirrus_height][0]> // 0 ft AGL
            <[float64][cumulus_mediocris_density][0]> // CLR
            <[float64][cumulus_mediocris_height][0]> // 0 ft AGL
        >
        <[tmsettings_clouds][clouds][]>
    >
>
`;

        const parser = new AeroflyFileParser();
        const newMcf = parser.setGroup(mcf, "tmsettings_clouds", 2, "<EXAMPLE>");

        assert.ok(newMcf);
        assert.ok(newMcf.includes("tmsettings_clouds"));
        assert.ok(newMcf.includes("<EXAMPLE>"));

        // console.log(newMcf);
    });
});
