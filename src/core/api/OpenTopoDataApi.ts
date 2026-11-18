import { ErrorFormatted } from "../util/ErrorFormatted.js";
import { fetchJson, handleJsonResponse } from "./fetchJson.js";
import {
    OpenTopoDataApiResultSchema,
    type OpenTopoDataApiCoordinates,
    type OpenTopoDataApiResult,
} from "./OpenTopoDataApi.type.js";

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
    const json = await handleJsonResponse<unknown>(response);

    const result = OpenTopoDataApiResultSchema.safeParse(json);

    if (!result.success) {
        const details = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        throw new ErrorFormatted(`Invalid OpenTopoData response: {{ details }}`, { details });
    }

    return result.data;
}
