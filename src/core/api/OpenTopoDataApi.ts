import { fetchJson, handleJsonResponse } from "./fetchJson.js";
import type { OpenTopoDataApiCoordinates, OpenTopoDataApiResult } from "./OpenTopoDataApi.type.js";

export async function fetchOpenTopoData(
    coordinates: OpenTopoDataApiCoordinates[],
    datasetName = "aster30m",
): Promise<OpenTopoDataApiResult> {
    const url = new URL(datasetName, "https://api.opentopodata.org/v1/");
    url.searchParams.append("locations", coordinates.map((c) => c.lat.toString() + "," + c.lng.toString()).join("|"));

    const response = await fetchJson(url);

    return await handleJsonResponse<OpenTopoDataApiResult>(response);
}
