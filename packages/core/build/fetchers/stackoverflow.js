// @ts-check
import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @typedef {{ user_id: number, display_name: string, reputation: number, badge_counts: {gold: number, silver: number, bronze: number}, answer_count: number, question_count: number, link: string, site: string }} StackOverflowData
 */

/**
 * Fetch Stack Overflow / Stack Exchange user data.
 *
 * @param {string|number} user_id Numeric Stack Exchange user ID.
 * @param {string} site Stack Exchange site slug (default: "stackoverflow").
 * @returns {Promise<StackOverflowData>}
 */
const fetchStackOverflow = async (user_id, site = "stackoverflow") => {
  if (!user_id) throw new MissingParamError(["user_id"]);

  const numericId = parseInt(String(user_id), 10);
  if (isNaN(numericId) || numericId <= 0) {
    throw new CustomError(
      "user_id must be a positive integer (your numeric Stack Exchange user ID).",
      "INVALID_PARAM",
    );
  }

  let res;
  try {
    res = await axios.get(
      `https://api.stackexchange.com/2.3/users/${numericId}`,
      {
        params: { site, filter: "default" },
        timeout: 10000,
        // Stack Exchange responses are gzip-compressed
        responseType: "json",
        decompress: true,
      },
    );
  } catch (err) {
    throw new CustomError(
      `Failed to fetch Stack Exchange data: ${err.message}`,
      "FETCH_ERROR",
    );
  }

  const items = res.data?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new CustomError(
      `Stack Exchange user ID '${user_id}' not found on ${site}.`,
      CustomError.USER_NOT_FOUND,
    );
  }

  const u = items[0];
  return {
    user_id: u.user_id,
    display_name: u.display_name,
    reputation: u.reputation,
    badge_counts: {
      gold: u.badge_counts?.gold ?? 0,
      silver: u.badge_counts?.silver ?? 0,
      bronze: u.badge_counts?.bronze ?? 0,
    },
    answer_count: u.answer_count ?? 0,
    question_count: u.question_count ?? 0,
    link: u.link,
    site,
  };
};

export { fetchStackOverflow };
