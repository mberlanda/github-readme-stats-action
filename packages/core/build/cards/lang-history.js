// @ts-check
import { createRequire } from "module";
import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { clampValue } from "../common/ops.js";

const require = createRequire(import.meta.url);
/** @type {Record<string, string>} */
const GITHUB_LANG_COLORS = require("../common/languageColors.json");

// Layout constants (all in body-relative coordinates; body is translated by (0, paddingY+20) = (0, 55))
const CARD_WIDTH = 500;
const CHART_LEFT = 45; // space for y-axis percentage labels
const CHART_RIGHT_PAD = 20;
const CHART_Y = 5; // chart top (in body coords)
const CHART_HEIGHT = 165;
const CHART_BOTTOM = CHART_Y + CHART_HEIGHT; // = 170
const CHART_USABLE_WIDTH = CARD_WIDTH - CHART_LEFT - CHART_RIGHT_PAD; // = 435
const X_LABEL_Y = CHART_BOTTOM + 14; // = 184
const LEGEND_Y = X_LABEL_Y + 18; // = 202
const LEGEND_ROW_HEIGHT = 22;
const LEGEND_COLS = 4;
const LEGEND_ITEM_WIDTH = (CARD_WIDTH - 50) / LEGEND_COLS; // 50 = 2 × paddingX
const BAR_GAP = 6;
const OTHER_LANG_COLOR = "#858585";

/**
 * Deterministic language color lookup:
 * 1. API-supplied color (canonical GitHub Linguist value)
 * 2. bundled languageColors.json (same source, useful when API returns null)
 * 3. Hash-based HSL so every unnamed language still gets a unique, vivid color.
 *
 * @param {string} name
 * @param {string|null|undefined} apiColor
 * @returns {string}
 */
const langColor = (name, apiColor) => {
  if (apiColor) return apiColor;
  if (GITHUB_LANG_COLORS[name]) return GITHUB_LANG_COLORS[name];
  // djb2 hash → hue in [0,360)
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h) ^ name.charCodeAt(i);
  const hue = (h >>> 0) % 360;
  return `hsl(${hue},65%,55%)`;
};
const GRID_LINES = [
  { pct: 100, y: CHART_Y },
  { pct: 50, y: CHART_Y + CHART_HEIGHT / 2 },
  { pct: 0, y: CHART_BOTTOM },
];

/**
 * Group raw repo nodes into a per-year language size map.
 *
 * @param {Array<{createdAt: string, languages: {edges: Array<{size: number, node: {name: string, color: string}}>}}>} repoNodes
 * @param {string[]} hide Language names to exclude.
 * @returns {{ historyData: Record<string, Record<string, {size: number, color: string}>>, langColors: Record<string, string> }}
 */
const groupByYear = (repoNodes, hide = []) => {
  const hideSet = new Set(hide.map((h) => h.toLowerCase().trim()));
  /** @type {Record<string, Record<string, {size: number, color: string}>>} */
  const historyData = {};
  /** @type {Record<string, string>} */
  const langColors = {};

  for (const node of repoNodes) {
    const year = node.createdAt.slice(0, 4);
    if (!historyData[year]) historyData[year] = {};

    for (const edge of node.languages.edges) {
      const { name, color } = edge.node;
      if (hideSet.has(name.toLowerCase().trim())) continue;
      const resolvedColor = langColor(name, color);
      if (!historyData[year][name])
        historyData[year][name] = { size: 0, color: resolvedColor };
      historyData[year][name].size += edge.size;
      if (!langColors[name]) langColors[name] = resolvedColor;
    }
  }

  return { historyData, langColors };
};

/**
 * Render a stacked bar chart (100% normalized) of languages per year.
 *
 * @param {Array<{createdAt: string, languages: {edges: Array<{size: number, node: {name: string, color: string}}>}}>} repoNodes Raw repo nodes from fetcher.
 * @param {object} options Rendering options.
 * @param {string=} options.custom_title Custom card title.
 * @param {boolean=} options.hide_title Hide card title.
 * @param {boolean=} options.hide_border Hide card border.
 * @param {string=} options.title_color Title color.
 * @param {string=} options.text_color Text color.
 * @param {string=} options.bg_color Background color.
 * @param {string=} options.border_color Border color.
 * @param {string=} options.theme Theme name.
 * @param {number|string=} options.langs_count Number of top languages to show (default 6).
 * @param {string[]=} options.hide Languages to hide.
 * @param {number=} options.border_radius Card border radius.
 * @param {boolean=} options.disable_animations Disable CSS animations.
 * @returns {string} SVG string.
 */
const renderLangHistory = (
  repoNodes,
  {
    custom_title,
    hide_title = false,
    hide_border = false,
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
    langs_count = 6,
    hide = [],
    border_radius,
    disable_animations = false,
  } = {},
) => {
  const colors = getCardColors({
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });
  const { historyData, langColors } = groupByYear(repoNodes, hide);

  const years = Object.keys(historyData).sort();
  if (years.length === 0) {
    const card = new Card({
      width: CARD_WIDTH,
      height: 80,
      colors,
      defaultTitle: "Languages Over Years",
      customTitle: custom_title,
      border_radius,
    });
    card.setHideBorder(hide_border);
    return card.render(
      `<text x="25" y="20" class="lang-name">No data available.</text>`,
    );
  }

  // Pick top N languages by total bytes across all years
  const maxLangs = clampValue(Number(langs_count) || 6, 1, 20);
  const langTotals = {};
  for (const yearData of Object.values(historyData)) {
    for (const [name, { size }] of Object.entries(yearData)) {
      langTotals[name] = (langTotals[name] || 0) + size;
    }
  }
  const topLangs = Object.entries(langTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxLangs)
    .map(([name]) => name);

  const hasOther = Object.keys(langTotals).length > maxLangs;
  const topLangSet = new Set(topLangs);
  const legendList = hasOther ? [...topLangs, "Other"] : topLangs;

  /** @param {string} name */
  const getLangColor = (name) =>
    name === "Other"
      ? OTHER_LANG_COLOR
      : langColors[name] || langColor(name, null);

  // Bar dimensions
  const N = years.length;
  const barWidth = Math.floor((CHART_USABLE_WIDTH - (N - 1) * BAR_GAP) / N);

  // Build stacked bars
  let barsHTML = "";
  let xLabelsHTML = "";

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const yearData = historyData[year];
    const barX = CHART_LEFT + i * (barWidth + BAR_GAP);

    // Compute sizes: topLangs + Other
    let otherSize = 0;
    const topSizes = {};
    for (const [name, { size }] of Object.entries(yearData)) {
      if (topLangSet.has(name)) {
        topSizes[name] = (topSizes[name] || 0) + size;
      } else {
        otherSize += size;
      }
    }
    const total =
      Object.values(topSizes).reduce((a, b) => a + b, 0) + otherSize;

    if (total > 0) {
      let yOff = 0;
      // Draw top langs in consistent order, then Other
      for (const lang of topLangs) {
        const pct = ((topSizes[lang] || 0) / total) * 100;
        const h = Math.round((pct / 100) * CHART_HEIGHT);
        if (h > 0) {
          barsHTML += `<rect x="${barX}" y="${CHART_Y + yOff}" width="${barWidth}" height="${h}" fill="${getLangColor(lang)}" />`;
          yOff += h;
        }
      }
      if (hasOther && otherSize > 0) {
        const h = CHART_HEIGHT - yOff; // use remainder to avoid rounding gaps
        if (h > 0) {
          barsHTML += `<rect x="${barX}" y="${CHART_Y + yOff}" width="${barWidth}" height="${h}" fill="${OTHER_LANG_COLOR}" />`;
        }
      }
    }

    // Year label: "'YY" format
    const shortYear = `'${year.slice(2)}`;
    const labelX = barX + barWidth / 2;
    xLabelsHTML += `<text x="${labelX}" y="${X_LABEL_Y}" text-anchor="middle" font-size="9" fill="${colors.textColor}">${shortYear}</text>`;
  }

  // Y-axis gridlines and percentage labels
  let gridHTML = "";
  for (const { pct, y } of GRID_LINES) {
    const isDashed = pct !== 0;
    gridHTML +=
      `<line x1="${CHART_LEFT}" y1="${y}" x2="${CARD_WIDTH - CHART_RIGHT_PAD}" y2="${y}" stroke="${colors.textColor}" stroke-width="0.5" opacity="0.3"${isDashed ? ` stroke-dasharray="3,3"` : ""} />` +
      `<text x="${CHART_LEFT - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="${colors.textColor}" opacity="0.7">${pct}%</text>`;
  }

  // Legend items
  let legendHTML = "";
  for (let idx = 0; idx < legendList.length; idx++) {
    const lang = legendList[idx];
    const col = idx % LEGEND_COLS;
    const row = Math.floor(idx / LEGEND_COLS);
    const lx = 25 + col * LEGEND_ITEM_WIDTH;
    const ly = LEGEND_Y + row * LEGEND_ROW_HEIGHT;
    legendHTML +=
      `<rect x="${lx}" y="${ly - 8}" width="8" height="8" rx="2" fill="${getLangColor(lang)}" />` +
      `<text x="${lx + 12}" y="${ly}" font-size="10" fill="${colors.textColor}">${lang}</text>`;
  }

  const legendRows = Math.ceil(legendList.length / LEGEND_COLS);
  const totalHeight = 55 + LEGEND_Y + legendRows * LEGEND_ROW_HEIGHT + 10;

  const card = new Card({
    width: CARD_WIDTH,
    height: totalHeight,
    border_radius,
    defaultTitle: "Languages Over Years",
    customTitle: custom_title,
    colors,
  });
  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();

  const body = `${gridHTML}${barsHTML}${xLabelsHTML}${legendHTML}`;
  return card.render(body);
};

export { renderLangHistory, groupByYear };
