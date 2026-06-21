// @ts-check
import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { formatCount } from "../common/external-card.js";

const CARD_WIDTH = 400;
const CARD_PADDING = 25;
const SO_ORANGE = "#F48024";

/**
 * Render a Stack Overflow / Stack Exchange profile card.
 *
 * @param {import("../fetchers/stackoverflow.js").StackOverflowData} data
 * @param {object} options Card rendering options.
 * @param {string=} options.custom_title
 * @param {boolean=} options.hide_title
 * @param {boolean=} options.hide_border
 * @param {string=} options.title_color
 * @param {string=} options.text_color
 * @param {string=} options.bg_color
 * @param {string=} options.border_color
 * @param {string=} options.theme
 * @param {number=} options.border_radius
 * @param {boolean=} options.disable_animations
 * @returns {string} SVG string.
 */
const renderStackOverflow = (data, options = {}) => {
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
  } = options;

  const colors = getCardColors({
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });
  const {
    display_name,
    reputation,
    badge_counts,
    answer_count,
    question_count,
    site,
  } = data;

  const siteLabel = site === "stackoverflow" ? "Stack Overflow" : site;
  const totalBadges =
    badge_counts.gold + badge_counts.silver + badge_counts.bronze;

  // Summary row: Reputation + Answers + Questions
  const col = (CARD_WIDTH - CARD_PADDING * 2) / 3;
  const summaryHTML = `
    <g transform="translate(${CARD_PADDING}, 0)">
      <text x="2" y="12" font-size="11" fill="${colors.textColor}" opacity="0.7">Reputation</text>
      <text x="2" y="34" font-size="20" font-weight="600" fill="${SO_ORANGE}">${formatCount(reputation)}</text>

      <text x="${col + 2}" y="12" font-size="11" fill="${colors.textColor}" opacity="0.7">Answers</text>
      <text x="${col + 2}" y="34" font-size="20" font-weight="600" fill="${colors.textColor}">${formatCount(answer_count)}</text>

      <text x="${col * 2 + 2}" y="12" font-size="11" fill="${colors.textColor}" opacity="0.7">Questions</text>
      <text x="${col * 2 + 2}" y="34" font-size="20" font-weight="600" fill="${colors.textColor}">${formatCount(question_count)}</text>
    </g>`;

  // Divider
  const dividerY = 48;
  const dividerHTML = `<line x1="${CARD_PADDING}" y1="${dividerY}" x2="${CARD_WIDTH - CARD_PADDING}" y2="${dividerY}" stroke="${colors.textColor}" stroke-width="1" opacity="0.15"/>`;

  // Badges row
  const badgeY = dividerY + 14;
  const badgesHTML = `
    <g transform="translate(${CARD_PADDING}, ${badgeY})">
      <text x="2" y="12" font-size="11" fill="${colors.textColor}" opacity="0.7">Badges</text>
      <text x="2" y="34" font-size="16" font-weight="600" fill="${colors.textColor}">${totalBadges}</text>

      <circle cx="${col + 8}" cy="22" r="8" fill="#FFCC01"/>
      <text x="${col + 20}" y="27" font-size="13" fill="${colors.textColor}">${badge_counts.gold}</text>

      <circle cx="${col * 1.5 + 8}" cy="22" r="8" fill="#9FA6AD"/>
      <text x="${col * 1.5 + 20}" y="27" font-size="13" fill="${colors.textColor}">${badge_counts.silver}</text>

      <circle cx="${col * 2 + 8}" cy="22" r="8" fill="#AD8060"/>
      <text x="${col * 2 + 20}" y="27" font-size="13" fill="${colors.textColor}">${badge_counts.bronze}</text>
    </g>`;

  // Display name sub-label
  const nameY = badgeY + 52;
  const nameHTML = `
    <text x="${CARD_PADDING + 2}" y="${nameY}" font-size="11" fill="${colors.textColor}" opacity="0.5">${display_name} · ${siteLabel}</text>`;

  const totalHeight = 55 + nameY + 18;

  const card = new Card({
    width: CARD_WIDTH,
    height: totalHeight,
    border_radius,
    defaultTitle: `${siteLabel} Stats`,
    customTitle: custom_title,
    colors,
  });
  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();

  return card.render(summaryHTML + dividerHTML + badgesHTML + nameHTML);
};

export { renderStackOverflow };
