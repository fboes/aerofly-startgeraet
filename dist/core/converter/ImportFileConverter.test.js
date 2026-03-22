import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
const geoToUid = (lon, lat) => {
    const SCALE = 1e7;
    const MASK = 0xffffffffn;
    const latFixed = BigInt(Math.round(lat * SCALE));
    const lonFixed = BigInt(Math.round(lon * SCALE));
    return ((latFixed & MASK) << 32n) | (lonFixed & MASK);
};
describe("ImportFileConverter", () => {
    it("should convert UIDs correctly", () => {
        assert.ok(geoToUid(20, 20) > 0);
        // Hinweis: Aufruf mit (lon, lat) gemäß deiner Funktionssignatur
        // KLAS – Las Vegas McCarran
        console.log(geoToUid(-115.152236, 36.080044), "should be 3322861147320494080");
        // BLD VOR – Boulder City
        console.log(geoToUid(-114.8611, 35.9472), "should be 3337652876926259200");
        // KEYW – Key West
        console.log(geoToUid(-81.7595, 24.5561), "should be 5033935394767185920");
        // KMIA – Miami
        console.log(geoToUid(-80.287, 25.7959), "should be 5109231054766614528");
        // PANC – Anchorage
        console.log(geoToUid(-149.9981, 61.1741), "should be 1537321454123100160");
        // LON VOR – London/West Drayton
        console.log(geoToUid(-0.466667, 51.487202), "should be 9199467190412054528");
        // NZCH – Christchurch
        console.log(geoToUid(172.532, -43.4894), "should be 18064202389014784000");
    });
    it("should do some Claude tests", () => {
        const entries = [
            { name: "KLAS airport", uid: 3322861147320494080n },
            { name: "BLD VOR", uid: 3337652876926259200n },
            { name: "KEYW airport", uid: 5033935394767185920n },
            { name: "KMIA airport", uid: 5109231054766614528n },
            { name: "PANC airport", uid: 1537321454123100160n },
            { name: "LON VOR", uid: 9199467190412054528n },
            { name: "NZCH airport", uid: 18064202389014784000n },
        ];
        for (const e of entries) {
            const bits = e.uid.toString(2).padStart(64, "0");
            console.log(`${e.name.padEnd(16)}: ${bits.slice(0, 4)} ${bits.slice(4, 8)} ${bits.slice(8, 16)} ${bits.slice(16, 32)} ${bits.slice(32, 48)} ${bits.slice(48, 64)}`);
        }
    });
    it("should appease CLaude", () => {
        const MOD = BigInt("4294967296");
        console.log("KLAS  actual lo:", 1549626093325855176n % MOD);
        console.log("KLAS  expect lo:", 3322861147320494080n % MOD);
        console.log("Differenz:", (1549626093325855176n % MOD) - (3322861147320494080n % MOD));
    });
});
