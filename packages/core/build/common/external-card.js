// @ts-check
/**
 * Shared rendering utilities for external-platform profile cards
 * (RubyGems, PyPI, Stack Overflow, …).
 */
import { Card } from "./Card.js";
import { getCardColors } from "./color.js";
import { createProgressNode } from "./render.js";

export const CARD_WIDTH = 400;
const MIN_CARD_WIDTH = 250;

/** Escape a string for safe embedding in an SVG text node or attribute. */
export const escSvg = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const CARD_PADDING = 25;
const VALUE_COL_WIDTH = 70;
const ITEM_HEIGHT = 40;
const SUMMARY_HEIGHT = 48; // summary + divider
const ITEMS_Y = SUMMARY_HEIGHT + 8; // where first item starts (body coords)
const BODY_OFFSET = 55; // Card translates body by (0, paddingY+20) = (0,55)

/**
 * Format a large integer with M/k suffix.
 * @param {number} n
 * @returns {string}
 */
export const formatCount = (n) => {
  if (!n && n !== 0) return "?";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
};

/**
 * Truncate a string at maxLen, appending '…' if needed.
 * @param {string} s
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (s, maxLen = 22) =>
  s.length > maxLen ? s.slice(0, maxLen - 1) + "…" : s;

/**
 * Render a two-column summary row.
 * @param {{label: string, value: string}[]} stats Up to 3 stats.
 * @param {string} textColor
 * @param {number} innerWidth
 * @returns {string}
 */
const renderSummary = (stats, textColor, innerWidth) => {
  const colWidth = innerWidth / Math.min(stats.length, 3);
  const items = stats
    .slice(0, 3)
    .map(
      ({ label, value }, i) => `
      <text x="${i * colWidth + 2}" y="12" font-size="11" fill="${textColor}" opacity="0.7">${escSvg(label)}</text>
      <text x="${i * colWidth + 2}" y="34" font-size="20" font-weight="600" fill="${textColor}">${escSvg(value)}</text>`,
    )
    .join("");
  return `<g transform="translate(${CARD_PADDING}, 0)">${items}</g>`;
};

/**
 * Render a horizontal divider.
 * @param {string} color
 * @param {number} cardWidth
 * @returns {string}
 */
const renderDivider = (color, cardWidth) =>
  `<line x1="${CARD_PADDING}" y1="${SUMMARY_HEIGHT}" x2="${cardWidth - CARD_PADDING}" y2="${SUMMARY_HEIGHT}" stroke="${color}" stroke-width="1" opacity="0.15"/>`;

/**
 * Render a single item row (name + progress bar + value).
 * @param {{name: string, displayValue: string, pct: number, color: string, index: number}} item
 * @param {string} textColor
 * @param {string} bgColor
 * @param {number} innerWidth
 * @param {number} progressWidth
 * @returns {string}
 */
const renderItem = (
  { name, displayValue, pct, color, index },
  textColor,
  bgColor,
  innerWidth,
  progressWidth,
) => {
  const y = ITEMS_Y + index * ITEM_HEIGHT;
  const delay = (index + 3) * 150;
  return `
    <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(${CARD_PADDING}, ${y})">
      <text x="2" y="13" font-size="11" fill="${textColor}">${escSvg(truncate(name))}</text>
      <text x="${innerWidth}" y="13" font-size="11" fill="${textColor}" text-anchor="end">${escSvg(displayValue)}</text>
      ${createProgressNode({ x: 0, y: 20, width: progressWidth, color, progress: pct, progressBarBackgroundColor: bgColor, delay })}
    </g>`;
};

/**
 * Render a complete external-platform profile card.
 *
 * @param {object} params
 * @param {string} params.defaultTitle Default card title.
 * @param {{label: string, value: string}[]} params.summary Up to 3 header stats.
 * @param {{name: string, displayValue: string, rawValue: number, color?: string}[]} params.items Ordered list of items.
 * @param {object} params.options Card rendering options.
 * @param {string=} params.options.custom_title
 * @param {boolean=} params.options.hide_title
 * @param {boolean=} params.options.hide_border
 * @param {string=} params.options.title_color
 * @param {string=} params.options.text_color
 * @param {string=} params.options.bg_color
 * @param {string=} params.options.border_color
 * @param {string=} params.options.theme
 * @param {number=} params.options.border_radius
 * @param {boolean=} params.options.disable_animations
 * @param {string|number=} params.options.card_width Override card width in pixels (min 250, default 400).
 * @returns {string} SVG string.
 */
export const renderExternalCard = ({
  defaultTitle,
  summary,
  items,
  options = {},
}) => {
  const {
    custom_title,
    hide_title = false,
    hide_border = false,
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
    border_radius,
    disable_animations = false,
    card_width: rawCardWidth,
  } = options;

  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    parseInt(String(rawCardWidth), 10) || CARD_WIDTH,
  );
  const innerWidth = cardWidth - CARD_PADDING * 2;
  const progressWidth = innerWidth - VALUE_COL_WIDTH;

  const colors = getCardColors({
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  const maxVal = items.reduce((m, i) => Math.max(m, i.rawValue || 0), 1);
  const DEFAULT_ITEM_COLOR = "#4c71f4";

  const itemsHTML = items
    .map((item, index) =>
      renderItem(
        {
          name: item.name,
          displayValue: item.displayValue,
          pct: Math.max(2, ((item.rawValue || 0) / maxVal) * 100),
          color: item.color || DEFAULT_ITEM_COLOR,
          index,
        },
        colors.textColor,
        colors.bgColor,
        innerWidth,
        progressWidth,
      ),
    )
    .join("");

  const totalHeight = BODY_OFFSET + ITEMS_Y + items.length * ITEM_HEIGHT + 15;

  const card = new Card({
    width: cardWidth,
    height: totalHeight,
    border_radius,
    defaultTitle,
    customTitle: custom_title,
    colors,
  });
  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();
  card.setCSS(`
    .stagger { opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards; }
  `);

  const body =
    renderSummary(summary, colors.textColor, innerWidth) +
    renderDivider(colors.textColor, cardWidth) +
    itemsHTML;
  return card.render(body);
};
