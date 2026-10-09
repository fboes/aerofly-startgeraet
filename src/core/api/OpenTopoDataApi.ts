import { APPLICATION_INFORMATION } from "../services/getApplicationInformation.js";
import type { OpenTopoDataApiCoordinates, OpenTopoDataApiResult } from "./OpenTopoDataApi.type.js";

export class OpenTopoDataApi {
    public async fetch(
        coordinates: OpenTopoDataApiCoordinates[],
        datasetName = "aster30m",
        timeoutMs = 5000,
    ): Promise<OpenTopoDataApiResult> {
        const url = new URL(`https://api.opentopodata.org/v1/${datasetName}`);
        url.searchParams.append(
            "locations",
            coordinates.map((c) => c.lat.toString() + "," + c.lng.toString()).join("|"),
        );

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": APPLICATION_INFORMATION.userAgent,
            },
            signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.body) {
            throw new Error("No results returned");
        }

        return (await response.json()) as OpenTopoDataApiResult;
    }
}
