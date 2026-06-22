// @ts-check
import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @typedef {{ name: string, downloads: number, version: string, info: string }} Gem
 * @typedef {{ username: string, total_gems: number, total_downloads: number, gems: Gem[] }} RubyGemsData
 */

/**
 * Fetch RubyGems profile data for a given username.
 *
 * @param {string} username RubyGems handle.
 * @param {number} gems_count Max gems to include in the list.
 * @returns {Promise<RubyGemsData>}
 */
const fetchRubyGems = async (username, gems_count = 5) => {
  if (!username) throw new MissingParamError(["username"]);

  let res;
  try {
    res = await axios.get(
      `https://rubygems.org/api/v1/owners/${encodeURIComponent(username)}/gems.json`,
    );
  } catch (err) {
    if (err.response?.status === 404) {
      throw new CustomError(
        `RubyGems user '${username}' not found.`,
        CustomError.USER_NOT_FOUND,
      );
    }
    throw new CustomError(
      `Failed to fetch RubyGems data: ${err.message}`,
      "FETCH_ERROR",
    );
  }

  /** @type {any[]} */
  const all = res.data;
  if (!Array.isArray(all)) {
    throw new CustomError("Unexpected RubyGems API response.", "FETCH_ERROR");
  }

  const totalDownloads = all.reduce((s, g) => s + (g.downloads || 0), 0);
  const sorted = [...all].sort(
    (a, b) => (b.downloads || 0) - (a.downloads || 0),
  );

  return {
    username,
    total_gems: all.length,
    total_downloads: totalDownloads,
    gems: sorted.slice(0, gems_count).map((g) => ({
      name: g.name,
      downloads: g.downloads || 0,
      version: g.version || "",
      info: g.info || "",
    })),
  };
};

export { fetchRubyGems };
