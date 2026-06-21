/**
 * Renders error message on the card.
 *
 * @param {object} args Function arguments.
 * @param {string} args.message Main error message.
 * @param {string} [args.secondaryMessage=""] The secondary error message.
 * @param {object} [args.renderOptions={}] Render options.
 * @param {string=} args.renderOptions.title_color Card title color.
 * @param {string=} args.renderOptions.text_color Card text color.
 * @param {string=} args.renderOptions.bg_color Card background color.
 * @param {string=} args.renderOptions.border_color Card border color.
 * @param {Parameters<typeof getCardColors>[0]["theme"]=} args.renderOptions.theme Card theme.
 * @param {boolean=} args.renderOptions.show_repo_link Whether to show repo link or not.
 * @returns {string} The SVG markup.
 */
export function renderError({
  message,
  secondaryMessage,
  renderOptions,
}: {
  message: string;
  secondaryMessage?: string | undefined;
  renderOptions?:
    | {
        title_color?: string | undefined;
        text_color?: string | undefined;
        bg_color?: string | undefined;
        border_color?: string | undefined;
        theme?: Parameters<typeof getCardColors>[0]["theme"] | undefined;
        show_repo_link?: boolean | undefined;
      }
    | undefined;
}): string;
/**
 * Creates a node to display the primary programming language of the repository/gist.
 *
 * @param {string} langName Language name.
 * @param {string} langColor Language color.
 * @returns {string} Language display SVG object.
 */
export function createLanguageNode(langName: string, langColor: string): string;
/**
 * Create a node to indicate progress in percentage along a horizontal line.
 *
 * @param {Object} params Object that contains the createProgressNode parameters.
 * @param {number} params.x X-axis position.
 * @param {number} params.y Y-axis position.
 * @param {number} params.width Width of progress bar.
 * @param {string} params.color Progress color.
 * @param {number} params.progress Progress value.
 * @param {string} params.progressBarBackgroundColor Progress bar bg color.
 * @param {number} params.delay Delay before animation starts.
 * @returns {string} Progress node.
 */
export function createProgressNode({
  x,
  y,
  width,
  color,
  progress,
  progressBarBackgroundColor,
  delay,
}: {
  x: number;
  y: number;
  width: number;
  color: string;
  progress: number;
  progressBarBackgroundColor: string;
  delay: number;
}): string;
/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 *
 * @param {string} icon The icon to display.
 * @param {number|string} label The label to display.
 * @param {string} testid The testid to assign to the label.
 * @param {number} iconSize The size of the icon.
 * @returns {string} Icon with label SVG object.
 */
export function iconWithLabel(
  icon: string,
  label: number | string,
  testid: string,
  iconSize: number,
): string;
/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 *
 * @param {object} props Function properties.
 * @param {string[]} props.items Array of items to layout.
 * @param {number} props.gap Gap between items.
 * @param {"column" | "row"=} props.direction Direction to layout items.
 * @param {number[]=} props.sizes Array of sizes for each item.
 * @returns {string[]} Array of items with proper layout.
 */
export function flexLayout({
  items,
  gap,
  direction,
  sizes,
}: {
  items: string[];
  gap: number;
  direction?: ("column" | "row") | undefined;
  sizes?: number[] | undefined;
}): string[];
/**
 * Retrieve text length based on Segoe UI font.
 *
 * @see https://stackoverflow.com/a/48172630/10629172
 * @param {string} str String to measure.
 * @param {number} fontSize Font size.
 * @returns {number} Text length.
 */
export function measureText(str: string, fontSize?: number): number;
/**
 * Split text into the lines it would wrap to when laid out greedily at the
 * given font size inside a box of width `maxWidth`. Uses `measureText` so the
 * estimate reflects actual font metrics rather than a fixed character count.
 * The browser still does the real wrap inside the foreignObject; this is only
 * used to size the SVG.
 *
 * @param {string} text Text to split.
 * @param {number} fontSize Font size in px (matches `measureText`).
 * @param {number} maxWidth Available wrap width in px.
 * @returns {string[]} Estimated wrapped lines.
 */
export function splitWrappedText(
  text: string,
  fontSize: number,
  maxWidth: number,
): string[];
/**
 * Estimate how many lines a string will wrap to when laid out greedily at the
 * given font size inside a box of width `maxWidth`, capped at `maxLines`.
 *
 * @param {string} text Text to estimate.
 * @param {number} fontSize Font size in px (matches `measureText`).
 * @param {number} maxWidth Available wrap width in px.
 * @param {number} maxLines Cap on the returned line count.
 * @returns {number} Estimated line count, at least 1, at most `maxLines`.
 */
export function countWrappedLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines: number,
): number;
/**
 * Renders multi-line text via a `foreignObject` so the browser performs
 * native, font-aware wrapping. Content overflowing `lineCount` lines is
 * clipped (with an ellipsis on the last visible line) by CSS line-clamp.
 *
 * @param {object} props Function properties.
 * @param {string} props.text Text to render (will be HTML-encoded).
 * @param {number} props.x X position of the foreignObject.
 * @param {number} props.y Y position of the foreignObject.
 * @param {number} props.width Width of the wrap box.
 * @param {number} props.height Height of the wrap box.
 * @param {number} props.lineCount Maximum number of lines to display.
 * @param {string} props.className CSS class applied to the inner element.
 * @param {string=} props.testId Optional test id for the inner element.
 * @returns {string} foreignObject SVG node.
 */
export function wrappedTextNode({
  text,
  x,
  y,
  width,
  height,
  lineCount,
  className,
  testId,
}: {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineCount: number;
  className: string;
  testId?: string | undefined;
}): string;
/**
 * CSS rules used to render multi-line text inside a `foreignObject`. Apply this
 * to a CSS class (e.g. `.description`) shared with `wrappedTextNode` so the
 * browser handles wrapping and the line count is taken from the `--lines`
 * custom property set on the element.
 *
 * @param {string} color Text color (CSS `color` property).
 * @returns {string} CSS rules block (without the surrounding selector).
 */
export function wrappedTextStyles(color: string): string;
import { getCardColors } from "./color.js";
//# sourceMappingURL=render.d.ts.map
