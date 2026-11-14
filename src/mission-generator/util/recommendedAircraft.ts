import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import type { MissionGeneratorManifest } from "../MissionGenerator.type.js";
import { fmt } from "../../core/formatter/format.js";

export function isRecommendedAircraft(manifest: MissionGeneratorManifest, aircraft: AeroflyAircraft): boolean {
    if (!manifest.recommendedAircraft) {
        return true;
    }

    const recommendedAircraft = manifest.recommendedAircraft;

    return aircraft.tags.some((tag) => recommendedAircraft.includes(tag));
}

export function isUnrecommendedAircraft(manifest: MissionGeneratorManifest, aircraft: AeroflyAircraft): boolean {
    if (!manifest.unrecommendedAircraft) {
        return false;
    }

    const notRecommendedAircraft = manifest.unrecommendedAircraft;

    return aircraft.tags.some((tag) => notRecommendedAircraft.includes(tag));
}

export function isAppropriateAircraft(manifest: MissionGeneratorManifest, aircraft: AeroflyAircraft): boolean {
    return isRecommendedAircraft(manifest, aircraft) && !isUnrecommendedAircraft(manifest, aircraft);
}

/**
 * @returns list of recommended and unrecommended aircraft in plain text. Will also inform about current aircraft
 *   selection meeting the requirements.
 */
export function appropriateAircraftDescription(manifest: MissionGeneratorManifest, aircraft?: AeroflyAircraft): string {
    const description = [];
    if (manifest.recommendedAircraft) {
        description.push(
            fmt("Recommended aircraft type: {{ type }}", {
                type: manifest.recommendedAircraft.join(", "),
            }),
        );
    }

    if (manifest.unrecommendedAircraft) {
        description.push(
            fmt("Unrecommended aircraft type: {{ type }}", {
                type: manifest.unrecommendedAircraft.join(", "),
            }),
        );
    }

    if (aircraft) {
        description.push(
            isAppropriateAircraft(manifest, aircraft)
                ? "Currently selected aircraft is appropriate."
                : "Currently selected aircraft is not appropriate.",
        );
    }

    return description.join("\n");
}

/**
 * @see appropriateAircraftDescription
 * @returns the manifest with the `longDescription` ammended with `appropriateAircraftDescription`
 */
export function ammendManifestDescription(
    manifest: MissionGeneratorManifest,
    aircraft?: AeroflyAircraft,
): MissionGeneratorManifest {
    manifest.longDescription = (
        manifest.longDescription +
        "\n" +
        appropriateAircraftDescription(manifest, aircraft)
    ).trim();

    return manifest;
}
