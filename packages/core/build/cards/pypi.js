// @ts-check
import { formatCount, renderExternalCard } from "../common/external-card.js";

const PYPI_BLUE = "#006DAD";

/**
 * Render a PyPI profile card.
 *
 * @param {import("../fetchers/pypi.js").PyPIData} data
 * @param {object} options Card rendering options (see renderExternalCard).
 * @returns {string} SVG string.
 */
const renderPyPI = (data, options = {}) => {
  const { username, total_packages, packages } = data;

  const totalDownloads = packages.reduce(
    (s, p) => s + (p.downloads_last_month ?? 0),
    0,
  );

  return renderExternalCard({
    defaultTitle: `PyPI — ${username}`,
    summary: [
      { label: "Packages", value: String(total_packages) },
      { label: "Downloads / month", value: formatCount(totalDownloads) },
    ],
    items: packages.map((p) => ({
      name: p.name,
      displayValue:
        p.downloads_last_month !== null
          ? `${formatCount(p.downloads_last_month)}/mo`
          : p.version || "?",
      rawValue: p.downloads_last_month ?? 0,
      color: PYPI_BLUE,
    })),
    options,
  });
};

export { renderPyPI };
