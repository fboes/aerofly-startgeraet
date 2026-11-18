import { ErrorFormatted } from "../util/ErrorFormatted.js";
import { fetchJson } from "./fetchJson.js";
import { SimBriefApiErrorSchema, SimBriefApiPayloadSchema, type SimBriefApiPayload } from "./SimBriefApi.type.js";

/**
 * @see https://developers.navigraph.com/docs/simbrief/fetching-ofp-data
 * @see https://forum.navigraph.com/t/fetching-a-users-latest-ofp-data/5297
 */
export async function fetchSimBriefFlightPlan(username: string): Promise<SimBriefApiPayload> {
    const url = new URL("https://www.simbrief.com/api/xml.fetcher.php");
    url.searchParams.append(username.match(/^\d+$/) ? "userid" : "username", username);
    url.searchParams.append("json", "v2");

    const response = await fetchJson(url);
    if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        const errorResponse = SimBriefApiErrorSchema.safeParse(body);

        throw new ErrorFormatted(
            (errorResponse.success && errorResponse.data.fetch?.status) || `Response status: {{ status }}`,
            { status: response.status.toString() },
        );
    }

    const result = SimBriefApiPayloadSchema.safeParse(await response.json());

    if (!result.success) {
        const details = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        throw new ErrorFormatted(`Invalid SimBrief response: {{ details }}`, { details });
    }

    return result.data;
}
