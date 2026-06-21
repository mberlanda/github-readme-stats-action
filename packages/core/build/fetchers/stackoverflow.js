// @ts-check
import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @typedef {{
 *   user_id: number,
 *   display_name: string,
 *   reputation: number,
 *   badge_counts: {gold: number, silver: number, bronze: number},
 *   answer_count: number,
 *   question_count: number,
 *   up_vote_count: number,
 *   down_vote_count: number,
 *   view_count: number,
 *   profile_image_data: string|null,
 *   link: string,
 *   site: string
 * }} StackOverflowData
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
    // "unsafe" filter is required to expose answer_count, question_count,
    // up_vote_count, down_vote_count, view_count, and profile_image.
    res = await axios.get(
      `https://api.stackexchange.com/2.3/users/${numericId}`,
      {
        params: { site, filter: "unsafe" },
        timeout: 10000,
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

  // Fetch and base64-encode the profile picture so it can be embedded in SVG
  // (GitHub sanitizes external <image> hrefs in rendered SVGs).
  let profile_image_data = null;
  if (u.profile_image) {
    try {
      const imgUrl = u.profile_image.replace(/[?&]s=\d+/, "") + "?s=44";
      const imgRes = await axios.get(imgUrl, {
        responseType: "arraybuffer",
        timeout: 5000,
      });
      const ct = imgRes.headers["content-type"] || "image/jpeg";
      const b64 = Buffer.from(imgRes.data).toString("base64");
      profile_image_data = `data:${ct};base64,${b64}`;
    } catch {
      // non-fatal — card renders without avatar
    }
  }

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
    up_vote_count: u.up_vote_count ?? 0,
    down_vote_count: u.down_vote_count ?? 0,
    view_count: u.view_count ?? 0,
    profile_image_data,
    link: u.link,
    site,
  };
};

export { fetchStackOverflow };
