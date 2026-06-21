// @ts-check
import { formatCount, renderExternalCard } from "../common/external-card.js";

const RUBY_RED = "#CC342D";

/**
 * Render a RubyGems profile card.
 *
 * @param {import("../fetchers/rubygems.js").RubyGemsData} data
 * @param {object} options Card rendering options (see renderExternalCard).
 * @returns {string} SVG string.
 */
const renderRubyGems = (data, options = {}) => {
  const { username, total_gems, total_downloads, gems } = data;

  return renderExternalCard({
    defaultTitle: `RubyGems — ${username}`,
    summary: [
      { label: "Gems", value: String(total_gems) },
      { label: "Downloads", value: formatCount(total_downloads) },
    ],
    items: gems.map((g) => ({
      name: g.name,
      displayValue: formatCount(g.downloads),
      rawValue: g.downloads,
      color: RUBY_RED,
    })),
    options,
  });
};

export { renderRubyGems };
