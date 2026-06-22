// @ts-check
import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { escSvg, formatCount } from "../common/external-card.js";

const DEFAULT_CARD_WIDTH = 400;
const MIN_CARD_WIDTH = 250;
const PAD = 25;

// Stack Overflow logo from Simple Icons (viewBox 0 0 24 24), scaled to 16×16.
const SO_ICON =
  `<g transform="scale(.667)">` +
  `<path fill="#F48024" d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"/>` +
  `</g>`;
const SO_ORANGE = "#F48024";
const GOLD = "#FFCC01";
const SILVER = "#9FA6AD";
const BRONZE = "#AD8060";
const AVATAR_R = 22; // avatar circle radius
const AVATAR_D = AVATAR_R * 2;

/**
 * Build a deterministic letter-avatar placeholder (shown when profile_image_data is null).
 *
 * @param {string} name
 * @param {object} colors
 */
const avatarPlaceholder = (name, colors) => {
  // Use only the first alphanumeric character; fall back to "?" to avoid
  // injecting SVG-unsafe characters like <, &, > from API-supplied names.
  const firstAlnum =
    (name || "").match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ?? "?";
  return (
    `<circle cx="${AVATAR_R}" cy="${AVATAR_R}" r="${AVATAR_R}" fill="${SO_ORANGE}" opacity="0.85" />` +
    `<text x="${AVATAR_R}" y="${AVATAR_R + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="${colors.bgColor}">${firstAlnum}</text>`
  );
};

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
 * @param {string|number=} options.card_width Override card width in pixels (min 250, default 400).
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
    card_width: rawCardWidth,
  } = options;

  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    parseInt(String(rawCardWidth), 10) || DEFAULT_CARD_WIDTH,
  );
  const innerW = cardWidth - PAD * 2;
  const col3 = innerW / 3;

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
    profile_image_data = null,
    link,
    site,
  } = data;

  const siteLabel = site === "stackoverflow" ? "Stack Overflow" : escSvg(site);

  // ── Avatar section (y=0..AVATAR_D) ─────────────────────────────────────────
  const avatarSection = profile_image_data
    ? `<defs>
        <clipPath id="so-avatar">
          <circle cx="${AVATAR_R}" cy="${AVATAR_R}" r="${AVATAR_R}" />
        </clipPath>
      </defs>
      <image href="${profile_image_data}" x="0" y="0" width="${AVATAR_D}" height="${AVATAR_D}" clip-path="url(#so-avatar)" />`
    : avatarPlaceholder(display_name, colors);

  // Display name + site label right of avatar.
  const safeLink = link ? escSvg(link) : null;
  const nameX = AVATAR_D + 10;
  const nameSection = safeLink
    ? `<a href="${safeLink}" target="_blank" rel="noopener">
        <text x="${nameX}" y="17" font-size="14" font-weight="600" fill="${colors.titleColor}">${escSvg(display_name)}</text>
      </a>
      <text x="${nameX}" y="34" font-size="11" fill="${colors.textColor}" opacity="0.6">${siteLabel}</text>`
    : `<text x="${nameX}" y="17" font-size="14" font-weight="600" fill="${colors.titleColor}">${escSvg(display_name)}</text>
       <text x="${nameX}" y="34" font-size="11" fill="${colors.textColor}" opacity="0.6">${siteLabel}</text>`;

  const profileRow = `<g>${avatarSection}${nameSection}</g>`;

  // ── Divider ─────────────────────────────────────────────────────────────────
  const divider = (y) =>
    `<line x1="0" y1="${y}" x2="${innerW}" y2="${y}" stroke="${colors.textColor}" stroke-width="0.5" opacity="0.15"/>`;

  const div1Y = AVATAR_D + 12; // ≈ 56

  // ── Stats row: Reputation / Answers / Questions ──────────────────────────────
  const statsY = div1Y + 8; // ≈ 64
  const statsSection = `
    <g transform="translate(0, ${statsY})">
      <text x="2" y="11" font-size="10" fill="${colors.textColor}" opacity="0.6">Reputation</text>
      <text x="2" y="34" font-size="22" font-weight="700" fill="${SO_ORANGE}">${formatCount(reputation)}</text>

      <text x="${col3 + 2}" y="11" font-size="10" fill="${colors.textColor}" opacity="0.6">Answers</text>
      <text x="${col3 + 2}" y="34" font-size="22" font-weight="700" fill="${colors.textColor}">${formatCount(answer_count)}</text>

      <text x="${col3 * 2 + 2}" y="11" font-size="10" fill="${colors.textColor}" opacity="0.6">Questions</text>
      <text x="${col3 * 2 + 2}" y="34" font-size="22" font-weight="700" fill="${colors.textColor}">${formatCount(question_count)}</text>
    </g>`;

  const div2Y = statsY + 44; // ≈ 116

  // ── Badges row ───────────────────────────────────────────────────────────────
  const badgesY = div2Y + 10; // ≈ 126
  const CR = 8; // badge circle radius
  const badgesSection = `
    <g transform="translate(0, ${badgesY})">
      <text x="2" y="11" font-size="10" fill="${colors.textColor}" opacity="0.6">Badges</text>

      <circle cx="${col3 * 0.6 + CR}" cy="7" r="${CR}" fill="${GOLD}"/>
      <text x="${col3 * 0.6 + CR * 2 + 4}" y="12" font-size="13" fill="${colors.textColor}">${badge_counts.gold}</text>

      <circle cx="${col3 * 1.1 + CR}" cy="7" r="${CR}" fill="${SILVER}"/>
      <text x="${col3 * 1.1 + CR * 2 + 4}" y="12" font-size="13" fill="${colors.textColor}">${badge_counts.silver}</text>

      <circle cx="${col3 * 1.6 + CR}" cy="7" r="${CR}" fill="${BRONZE}"/>
      <text x="${col3 * 1.6 + CR * 2 + 4}" y="12" font-size="13" fill="${colors.textColor}">${badge_counts.bronze}</text>
    </g>`;

  const bodyHeight = badgesY + 26; // ≈ 162
  const totalHeight = 55 + bodyHeight + 10;

  const card = new Card({
    width: cardWidth,
    height: totalHeight,
    border_radius,
    defaultTitle: `${siteLabel} Stats`,
    customTitle: custom_title,
    titlePrefixIcon: SO_ICON,
    colors,
  });
  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();

  const body = `<g transform="translate(${PAD}, 0)">${profileRow}${divider(div1Y)}${statsSection}${divider(div2Y)}${badgesSection}</g>`;
  return card.render(body);
};

export { renderStackOverflow };
