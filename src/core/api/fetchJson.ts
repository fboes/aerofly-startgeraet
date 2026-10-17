import { APPLICATION_INFORMATION } from "../services/getApplicationInformation.js";

/**
 * Like `fetch`, but...
 * - If the request takes longer than `timeoutMs`, it will be aborted.
 * - Add default header for JSON
 * - Add default header for user agent
 */
export async function fetchJson(input: string | URL | Request, timeoutMs = 5000): Promise<Response> {
    // console.log(input.toString());

    const request = new Request(input);

    const headers = new Headers(request.headers);
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }
    headers.set("User-Agent", APPLICATION_INFORMATION.userAgent);

    return fetch(request, {
        headers,
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]),
    });
}

/**
 * Throw error on non-OK response, otherwise return the JSON body.
 */
export async function handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
}
