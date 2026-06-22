// @ts-check
import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @typedef {{ name: string, version: string, abstract: string, date: string }} CpanDist
 * @typedef {{ pauseid: string, display_name: string, total_distributions: number, distributions: CpanDist[] }} CpanData
 */

const METACPAN_BASE = "https://fastapi.metacpan.org/v1";

/**
 * Fetch CPAN profile data for a given PAUSE ID using the MetaCPAN API.
 *
 * @param {string} pauseid CPAN PAUSE ID (case-insensitive; will be uppercased).
 * @param {number} distributions_count Max distributions to include.
 * @returns {Promise<CpanData>}
 */
const fetchCPAN = async (pauseid, distributions_count = 5) => {
  if (!pauseid) throw new MissingParamError(["username"]);

  const id = pauseid.toUpperCase();

  let authorRes;
  try {
    authorRes = await axios.get(`${METACPAN_BASE}/author/${id}`, {
      timeout: 8000,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new CustomError(
        `CPAN author '${pauseid}' not found.`,
        CustomError.USER_NOT_FOUND,
      );
    }
    throw new CustomError(
      `Failed to fetch CPAN author data: ${err.message}`,
      "FETCH_ERROR",
    );
  }

  const authorName = authorRes.data?.name || id;

  // Fetch latest releases by this author (up to 100 to compute total)
  const fetchSize = Math.max(distributions_count + 50, 100);
  let releasesRes;
  try {
    releasesRes = await axios.post(
      `${METACPAN_BASE}/release/_search`,
      {
        query: {
          bool: {
            must: [{ term: { author: id } }, { term: { status: "latest" } }],
          },
        },
        _source: ["distribution", "version", "abstract", "date"],
        sort: [{ date: "desc" }],
        size: fetchSize,
      },
      { timeout: 8000 },
    );
  } catch (err) {
    throw new CustomError(
      `Failed to fetch CPAN releases: ${err.message}`,
      "FETCH_ERROR",
    );
  }

  const hits = releasesRes.data?.hits?.hits ?? [];
  const rawTotal = releasesRes.data?.hits?.total;
  const total =
    typeof rawTotal === "object" ? (rawTotal.value ?? 0) : (rawTotal ?? 0);

  const now = Date.now();
  const distributions = hits.slice(0, distributions_count).map((h) => {
    const src = h._source || {};
    return {
      name: src.distribution || "?",
      version: src.version || "?",
      abstract: src.abstract || "",
      date: src.date || "",
      // Recency score: newer = larger bar (days since release, inverted, capped at 365)
      recency: Math.max(
        1,
        365 -
          Math.min(365, (now - new Date(src.date || 0).getTime()) / 86_400_000),
      ),
    };
  });

  return {
    pauseid: id,
    display_name: authorName,
    total_distributions: Math.max(total, hits.length),
    distributions,
  };
};

export { fetchCPAN };
