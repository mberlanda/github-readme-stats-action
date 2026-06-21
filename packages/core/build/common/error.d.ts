/**
 * Custom error class to handle custom GRS errors.
 */
export class CustomError extends Error {
  static MAX_RETRY: string;
  static NO_TOKENS: string;
  static USER_NOT_FOUND: string;
  static GRAPHQL_ERROR: string;
  static GITHUB_REST_API_ERROR: string;
  static WAKATIME_ERROR: string;
  static INVALID_AFFILIATION: string;
  /**
   * Custom error constructor.
   *
   * @param {string} message Error message.
   * @param {string} type Error type.
   */
  constructor(message: string, type: string);
  type: string;
  secondaryMessage: string;
}
/**
 * Missing query parameter class.
 */
export class MissingParamError extends Error {
  /**
   * Missing query parameter error constructor.
   *
   * @param {string[]} missedParams An array of missing parameters names.
   * @param {string=} secondaryMessage Optional secondary message to display.
   */
  constructor(missedParams: string[], secondaryMessage?: string | undefined);
  missedParams: string[];
  secondaryMessage: string | undefined;
}
/**
 * @type {Object<string, string>} A map of error types to secondary error messages.
 */
export const SECONDARY_ERROR_MESSAGES: {
  [x: string]: string;
};
/**
 * @type {string} A general message to ask user to try again later.
 */
export const TRY_AGAIN_LATER: string;
/**
 * Retrieve secondary message from an error object.
 *
 * @param {Error} err The error object.
 * @returns {string|undefined} The secondary message if available, otherwise undefined.
 */
export function retrieveSecondaryMessage(err: Error): string | undefined;
//# sourceMappingURL=error.d.ts.map
