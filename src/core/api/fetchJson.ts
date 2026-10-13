import { APPLICATION_INFORMATION } from "../services/getApplicationInformation.js";

/**
 * Like `fetch`, but with a timeout.
 * If the request takes longer than `timeoutMs`, it will be aborted.
 * Will also include headers for fetching JSON .
 */
export async function fetchJson(url: URL, headers = {}, timeoutMs = 5000): Promise<Response> {
    //console.log(url.toString());
    return fetch(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": APPLICATION_INFORMATION.userAgent,
            ...headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
    });
}

/**
 * Throw error on non-OK response, otherwise return the JSON body.
 */
export async function handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}
