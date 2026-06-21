/**
 * Axios response.
 */
export type AxiosResponse = import("axios").AxiosResponse;
/**
 * Fetcher function.
 */
export type FetcherFunction = (
  variables: any,
  token: string,
  retriesForTests?: number,
) => Promise<AxiosResponse>;
/**
 * @typedef {import("axios").AxiosResponse} AxiosResponse Axios response.
 * @typedef {(variables: any, token: string, retriesForTests?: number) => Promise<AxiosResponse>} FetcherFunction Fetcher function.
 */
/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @param {FetcherFunction} fetcher The fetcher function.
 * @param {any} variables Object with arguments to pass to the fetcher function.
 * @param {string | null} pat Optional PAT override.
 * @returns {Promise<any>} The response from the fetcher function.
 */
export function retryer(
  fetcher: FetcherFunction,
  variables: any,
  pat?: string | null,
): Promise<any>;
//# sourceMappingURL=retryer.d.ts.map
