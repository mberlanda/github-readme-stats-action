/**
 * Returns boolean if value is either "true" or "false" else the value as it is.
 *
 * @param {string | boolean} value The value to parse.
 * @returns {boolean | undefined } The parsed value.
 */
export function parseBoolean(value: string | boolean): boolean | undefined;
/**
 * Parse string to array of strings.
 *
 * @param {string} str The string to parse.
 * @returns {string[]} The array of strings.
 */
export function parseArray(str: string): string[];
/**
 * Clamp the given number between the given range.
 *
 * @param {number} number The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
export function clampValue(number: number, min: number, max: number): number;
/**
 * Lowercase and trim string.
 *
 * @param {string} name String to lowercase and trim.
 * @returns {string} Lowercased and trimmed string.
 */
export function lowercaseTrim(name: string): string;
/**
 * Split array of languages in two columns.
 *
 * @template T Language object.
 * @param {Array<T>} arr Array of languages.
 * @param {number} perChunk Number of languages per column.
 * @returns {Array<T>} Array of languages split in two columns.
 */
export function chunkArray<T>(arr: Array<T>, perChunk: number): Array<T>;
/**
 * Parse emoji from string.
 *
 * @param {string} str String to parse emoji from.
 * @returns {string} String with emoji parsed.
 */
export function parseEmojis(str: string): string;
/**
 * Get diff in minutes between two dates.
 *
 * @param {Date} d1 First date.
 * @param {Date} d2 Second date.
 * @returns {number} Number of minutes between the two dates.
 */
export function dateDiff(d1: Date, d2: Date): number;
/**
 * Parse owner affiliations.
 *
 * @param {string[]} affiliations input affiliations to be parsed.
 * @returns {string[]} Parsed affiliations.
 *
 * @throws {CustomError} If affiliations contains invalid values.
 */
export function parseOwnerAffiliations(affiliations: string[]): string[];
export function buildSearchFilter(repos?: any[], owners?: any[]): string;
//# sourceMappingURL=ops.d.ts.map
