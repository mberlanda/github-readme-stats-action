// @ts-check
import { formatCount, renderExternalCard } from "../common/external-card.js";

const CPAN_BLUE = "#00758F";

/**
 * Render a CPAN (MetaCPAN) author profile card.
 *
 * @param {import("../fetchers/cpan.js").CpanData} data
 * @param {object} options Card rendering options (see renderExternalCard).
 * @returns {string} SVG string.
 */
const renderCPAN = (data, options = {}) => {
  const { pauseid, display_name, total_distributions, distributions } = data;

  const title =
    display_name !== pauseid ? `CPAN — ${display_name}` : `CPAN — ${pauseid}`;

  return renderExternalCard({
    defaultTitle: title,
    summary: [
      { label: "PAUSE ID", value: pauseid },
      { label: "Distributions", value: formatCount(total_distributions) },
    ],
    items: distributions.map((d) => ({
      name: d.name,
      displayValue: d.version,
      rawValue: d.recency,
      color: CPAN_BLUE,
    })),
    options,
  });
};

export { renderCPAN };
