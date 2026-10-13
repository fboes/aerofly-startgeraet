import { ErrorFormatted } from "../util/ErrorFormatted.js";
import { fetchJson, handleJsonResponse } from "./fetchJson.js";
import type { SimBriefApiError, SimBriefApiPayload } from "./SimBriefApi.type.js";

export class SimBriefApi {
    /**
     * @see https://developers.navigraph.com/docs/simbrief/fetching-ofp-data
     * @see https://forum.navigraph.com/t/fetching-a-users-latest-ofp-data/5297
     */
    public async fetch(username: string): Promise<SimBriefApiPayload> {
        const url = new URL("https://www.simbrief.com/api/xml.fetcher.php");
        url.searchParams.append(username.match(/^\d+$/) ? "userid" : "username", username);
        url.searchParams.append("json", "v2");

        const response = await fetchJson(url);

        if (!response.ok) {
            const errorResponse = (await response.json()) as SimBriefApiError;
            throw new ErrorFormatted(errorResponse.fetch?.status ?? `Response status: {{ status }}`, {
                status: response.status.toString(),
            });
        }

        return await handleJsonResponse<SimBriefApiPayload>(response);
    }
}
