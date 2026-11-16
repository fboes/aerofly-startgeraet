import type { AeroflyFlight, AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions";
import { BaseAeroflyFlightToStringConverter } from "./AeroflyFlightToStringConverter.base.js";
import { createHash } from "node:crypto";

export class AeroflyFlightToPoiCreationJson extends BaseAeroflyFlightToStringConverter {
    static readonly fileName = "POI Creation Tool JSON";
    static readonly fileExtension = "json";

    convert(flightplan: AeroflyFlight): string {
        const origin = flightplan.navigation.waypoints.at(0);
        if (!origin) {
            throw new Error("No first waypoint in flight plan for export");
        }

        const poiName = `startgeraet_export_${origin.identifier.toLowerCase().replace(/[^a-z0-9_]+/g, "")}`;

        return JSON.stringify(
            {
                schemaVersion: 1,
                app: "pct",
                name: poiName,
                poiName,
                createdAt: new Date(),
                modifiedAt: new Date(),
                reference: null,
                camera: {
                    lon: origin.longitude,
                    lat: origin.latitude,
                    zoom: 21,
                },
                objects: [
                    flightplan.navigation.waypoints.map((wp) => {
                        const alt = this.getWaypointAltitude(wp);
                        return {
                            id: this.uuid(poiName, wp),
                            height: {
                                mode: alt ? "asl" : "terrain-offset",
                                value: alt,
                                offset: alt ? undefined : 0,
                            },
                            kind: "light",
                            position: {
                                lon: wp.longitude,
                                lat: wp.latitude,
                            },
                            color: [1, 0, 0],
                            intensity: 10,
                            flashing: [0, 0, 0, 0],
                            groupIndex: 0,
                            label: wp.identifier + " #icao:" + wp.identifier,
                        };
                    }),
                ],
            },
            null,
            2,
        );
    }

    /**
     * @returns a 36 character long v4 UUID
     */
    private uuid(poiName: string, waypoint: AeroflyNavRouteBase): string {
        const hash = createHash("sha256").update(poiName).update("\0").update(JSON.stringify(waypoint)).digest();

        if (hash[6] === undefined || hash[8] === undefined) {
            throw new Error("Hash is too short to generate a UUID");
        }

        hash[6] = (hash[6] & 0x0f) | 0x40; // Version 4
        hash[8] = (hash[8] & 0x3f) | 0x80; // Variant RFC 4122

        const hex = hash.subarray(0, 16).toString("hex");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
}
