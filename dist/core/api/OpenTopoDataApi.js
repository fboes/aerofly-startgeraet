export class OpenTopoDataApi {
    async fetch(coordinates, datasetName = "aster30m", timeoutMs = 5000) {
        const url = new URL(`https://api.opentopodata.org/v1/${datasetName}`);
        url.searchParams.append("locations", coordinates.map((c) => c.lat.toString() + "," + c.lng.toString()).join("|"));
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.body) {
            throw new Error("No results returned");
        }
        return (await response.json());
    }
}
