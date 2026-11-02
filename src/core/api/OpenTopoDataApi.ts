import { fetchJson, handleJsonResponse } from "./fetchJson.js";
import type { OpenTopoDataApiCoordinates, OpenTopoDataApiResult } from "./OpenTopoDataApi.type.js";

/**
 * @see https://www.opentopodata.org/api/
 */
export async function fetchOpenTopoData(
    coordinates: OpenTopoDataApiCoordinates[],
    datasetName = "aster30m",
): Promise<OpenTopoDataApiResult> {
    const payload = coordinates.map((c) => c.lat.toString() + "," + c.lng.toString()).join("|");

    const url = new Request(`https://api.opentopodata.org/v1/${datasetName}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            locations: payload,
        }),
    });

    const response = await fetchJson(url);

    return await handleJsonResponse<OpenTopoDataApiResult>(response);
}
