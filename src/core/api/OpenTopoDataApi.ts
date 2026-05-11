export type OpenTopoDataApiResult = {
    results: OpenTopoDataApiResultItem[];
    status: "OK" | "INVALID_REQUEST" | "SERVER_ERROR";
    error?: string;
};

export type OpenTopoDataApiResultItem = {
    /**
     * in meters
     */
    elevation: number;
    location: {
        lat: number;
        lng: number;
    };
    dataset: string;
};

export type OpenTopoDataApiCoordinates = {
    lat: number;
    lng: number;
};

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
            },
            signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.body) {
            throw new Error("No results returned");
        }

        return (await response.json()) as OpenTopoDataApiResult;
    }
}
