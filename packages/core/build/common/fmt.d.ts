/**
 * Retrieves num with suffix k(thousands) precise to given decimal places.
 *
 * @param {number} num The number to format.
 * @param {number=} precision The number of decimal places to include.
 * @returns {string|number} The formatted number.
 */
export function kFormatter(
  num: number,
  precision?: number | undefined,
): string | number;
/**
 * Convert bytes to a human-readable string representation.
 *
 * @param {number} bytes The number of bytes to convert.
 * @returns {string} The human-readable representation of bytes.
 * @throws {Error} If bytes is negative or too large.
 */
export function formatBytes(bytes: number): string;
/**
 * Split text over multiple lines based on the card width.
 *
 * @param {string} text Text to split.
 * @param {number} width Available wrap width in px.
 * @param {number} fontSize Font size in px.
 * @param {number} maxLines Maximum number of lines.
 * @returns {string[]} Array of lines.
 */
export function wrapTextMultiline(
  text: string,
  width: number,
  fontSize: number,
  maxLines?: number,
): string[];
//# sourceMappingURL=fmt.d.ts.map
