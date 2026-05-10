export class SimBriefApi {
    async fetch(username, timeoutMs = 5000) {
        const url = new URL("https://www.simbrief.com/api/xml.fetcher.php");
        url.searchParams.append(username.match(/^\d+$/) ? "userid" : "username", username);
        url.searchParams.append("json", "v2");
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
            const errorResponse = (await response.json());
            throw new Error(errorResponse.fetch?.status ?? `Response status: ${response.status.toString()}`);
        }
        return (await response.json());
    }
}
