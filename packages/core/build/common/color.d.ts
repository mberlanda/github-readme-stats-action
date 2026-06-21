/**
 * Object containing card colors.
 */
export type CardColors = {
  titleColor: string;
  iconColor: string;
  textColor: string;
  bgColor: string | string[];
  borderColor: string;
  ringColor: string;
};
/**
 * Retrieves a gradient if color has more than one valid hex codes else a single color.
 *
 * @param {string} color The color to parse.
 * @param {string | string[]} fallbackColor The fallback color.
 * @returns {string | string[]} The gradient or color.
 */
export function fallbackColor(
  color: string,
  fallbackColor: string | string[],
): string | string[];
/**
 * Object containing card colors.
 * @typedef {{
 *  titleColor: string;
 *  iconColor: string;
 *  textColor: string;
 *  bgColor: string | string[];
 *  borderColor: string;
 *  ringColor: string;
 * }} CardColors
 */
/**
 * Returns theme based colors with proper overrides and defaults.
 *
 * @param {Object} args Function arguments.
 * @param {string=} args.title_color Card title color.
 * @param {string=} args.text_color Card text color.
 * @param {string=} args.icon_color Card icon color.
 * @param {string=} args.bg_color Card background color.
 * @param {string=} args.border_color Card border color.
 * @param {string=} args.ring_color Card ring color.
 * @param {string=} args.theme Card theme.
 * @returns {CardColors} Card colors.
 */
export function getCardColors({
  title_color,
  text_color,
  icon_color,
  bg_color,
  border_color,
  ring_color,
  theme,
}: {
  title_color?: string | undefined;
  text_color?: string | undefined;
  icon_color?: string | undefined;
  bg_color?: string | undefined;
  border_color?: string | undefined;
  ring_color?: string | undefined;
  theme?: string | undefined;
}): CardColors;
//# sourceMappingURL=color.d.ts.map
