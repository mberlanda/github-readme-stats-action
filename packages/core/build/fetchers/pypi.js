// @ts-check
import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * @typedef {{ name: string, version: string, summary: string, downloads_last_month: number|null }} PyPIPackage
 * @typedef {{ username: string, total_packages: number, packages: PyPIPackage[] }} PyPIData
 */

/**
 * Parse the PyPI XML-RPC response for user_packages.
 * Returns package names (strings at odd indices in the flat string list).
 *
 * @param {string} xml Raw XML-RPC response body.
 * @returns {string[]} Package names.
 */
const parseXmlRpcPackages = (xml) => {
  const strings = [...xml.matchAll(/<string>([^<]+)<\/string>/g)].map(
    (m) => m[1],
  );
  // Each inner array is [role, package_name]; package names are at odd indices.
  return strings.filter((_, i) => i % 2 === 1);
};

/**
 * Fetch monthly download count for one package from pypistats.org.
 * Returns null if pypistats is unavailable.
 *
 * @param {string} packageName
 * @returns {Promise<number|null>}
 */
const fetchDownloads = async (packageName) => {
  try {
    const res = await axios.get(
      `https://pypistats.org/api/packages/${encodeURIComponent(packageName)}/recent`,
      { timeout: 5000 },
    );
    return res.data?.data?.last_month ?? null;
  } catch {
    return null;
  }
};

/**
 * Fetch PyPI profile data for a given username.
 *
 * @param {string} username PyPI username.
 * @param {number} packages_count Max packages to include.
 * @returns {Promise<PyPIData>}
 */
const fetchPyPI = async (username, packages_count = 5) => {
  if (!username) throw new MissingParamError(["username"]);

  // Step 1: list packages via XML-RPC
  let xmlRes;
  try {
    xmlRes = await axios.post(
      "https://pypi.org/pypi",
      `<?xml version='1.0'?><methodCall><methodName>user_packages</methodName><params><param><value><string>${username}</string></value></param></params></methodCall>`,
      { headers: { "Content-Type": "text/xml" }, timeout: 10000 },
    );
  } catch (err) {
    throw new CustomError(
      `Failed to fetch PyPI package list: ${err.message}`,
      "FETCH_ERROR",
    );
  }

  const packageNames = parseXmlRpcPackages(xmlRes.data);
  if (packageNames.length === 0) {
    throw new CustomError(
      `No PyPI packages found for user '${username}'.`,
      CustomError.USER_NOT_FOUND,
    );
  }

  // Step 2: fetch package info and downloads (up to packages_count)
  const topNames = packageNames.slice(0, packages_count);
  const packages = await Promise.all(
    topNames.map(async (name) => {
      let version = "";
      let summary = "";
      try {
        const info = await axios.get(
          `https://pypi.org/pypi/${encodeURIComponent(name)}/json`,
          {
            timeout: 5000,
          },
        );
        version = info.data?.info?.version || "";
        summary = info.data?.info?.summary || "";
      } catch {
        // ignore — use empty strings
      }
      const downloads = await fetchDownloads(name);
      return { name, version, summary, downloads_last_month: downloads };
    }),
  );

  // Sort by downloads descending (nulls last)
  packages.sort(
    (a, b) => (b.downloads_last_month ?? -1) - (a.downloads_last_month ?? -1),
  );

  return {
    username,
    total_packages: packageNames.length,
    packages,
  };
};

export { fetchPyPI };
