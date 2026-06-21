// @ts-check
import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { request } from "../common/http.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";
/**
 * Top languages fetcher — paginated, sorted by most recently pushed.
 *
 * @param {any} variables Fetcher variables.
 * @param {string} token GitHub token.
 * @returns {Promise<import("axios").AxiosResponse>} Languages fetcher response.
 */
const fetcher = (variables, token) => {
  return request(
    {
      query: `
      query userInfo($login: String!, $after: String, $ownerAffiliations: [RepositoryAffiliation]) {
        user(login: $login) {
          # do not fetch forks; order by push date so the most recently active repos
          # are fetched first and fill the first pages.
          repositories(
            ownerAffiliations: $ownerAffiliations,
            isFork: false,
            first: 100,
            after: $after,
            orderBy: {field: PUSHED_AT, direction: DESC}
          ) {
            nodes {
              name
              isPrivate
              stargazerCount
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    color
                    name
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `token ${token}`,
    },
  );
};
/**
 * @typedef {import("./types").TopLangData} TopLangData Top languages data.
 */
/**
 * Fetch top languages for a given username.
 *
 * @param {string} username GitHub username.
 * @param {string[]} exclude_repo List of repositories to exclude. Default: [].
 * @param {number} size_weight Weightage to be given to size.
 * @param {number} count_weight Weightage to be given to count.
 * @param {string[]} ownerAffiliations The owner affiliations to filter by. Default: OWNER.
 * @param {string|null} pat Optional PAT override.
 * @returns {Promise<TopLangData>} Top languages data.
 */
const fetchTopLanguages = async (
  username,
  exclude_repo = [],
  size_weight = 1,
  count_weight = 0,
  ownerAffiliations = [],
  pat = null,
) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  ownerAffiliations = parseOwnerAffiliations(ownerAffiliations);

  // Paginate through all repos (sorted by PUSHED_AT DESC so recent repos come first).
  const debugFetch = process.env.DEBUG_FETCH_STATS === "true";
  let allRepoNodes = [];
  let hasNextPage = true;
  let endCursor = null;
  let pageNum = 0;
  while (hasNextPage) {
    pageNum++;
    const res = await retryer(
      fetcher,
      {
        login: username,
        after: endCursor,
        ownerAffiliations,
      },
      pat,
    );
    if (res.data.errors) {
      logger.error(res.data.errors);
      if (res.data.errors[0].type === "NOT_FOUND") {
        throw new CustomError(
          res.data.errors[0].message || "Could not fetch user.",
          CustomError.USER_NOT_FOUND,
        );
      }
      if (res.data.errors[0].message) {
        throw new CustomError(
          wrapTextMultiline(res.data.errors[0].message, 525, 12)[0],
          res.statusText,
        );
      }
      throw new CustomError(
        "Something went wrong while trying to retrieve the language data using the GraphQL API.",
        CustomError.GRAPHQL_ERROR,
      );
    }
    const pageNodes = res.data.data.user.repositories.nodes;
    allRepoNodes = allRepoNodes.concat(pageNodes);
    hasNextPage = res.data.data.user.repositories.pageInfo.hasNextPage;
    endCursor = res.data.data.user.repositories.pageInfo.endCursor;
    if (debugFetch) {
      console.log(
        `[top-langs] Page ${pageNum}: fetched ${pageNodes.length} repos (running total: ${allRepoNodes.length})`,
      );
    }
  }
  if (debugFetch) {
    const publicCount = allRepoNodes.filter((n) => !n.isPrivate).length;
    const privateCount = allRepoNodes.filter((n) => n.isPrivate).length;
    const buckets = { 0: 0, "1-9": 0, "10-99": 0, "100+": 0 };
    for (const n of allRepoNodes) {
      const s = n.stargazerCount;
      if (s === 0) buckets["0"]++;
      else if (s <= 9) buckets["1-9"]++;
      else if (s <= 99) buckets["10-99"]++;
      else buckets["100+"]++;
    }
    console.log(
      `[top-langs] Total: ${allRepoNodes.length} repos | public=${publicCount} private=${privateCount}`,
    );
    console.log(
      `[top-langs] Stars: 0=${buckets["0"]} | 1-9=${buckets["1-9"]} | 10-99=${buckets["10-99"]} | 100+=${buckets["100+"]}`,
    );
  }

  /** @type {Record<string, boolean>} */
  let repoToHide = {};
  const allExcludedRepos = [
    ...exclude_repo,
    ...getConfig().excludeRepositories,
  ];
  if (allExcludedRepos) {
    allExcludedRepos.forEach((repoName) => {
      repoToHide[repoName] = true;
    });
  }
  // filter out hidden repositories (repos are already ordered by PUSHED_AT from the API)
  let repoNodes = allRepoNodes.filter((node) => !repoToHide[node.name]);

  let repoCount = 0;
  repoNodes = repoNodes
    .filter((node) => node.languages.edges.length > 0)
    // flatten the list of language nodes
    .reduce((acc, curr) => curr.languages.edges.concat(acc), [])
    .reduce((acc, prev) => {
      // get the size of the language (bytes)
      let langSize = prev.size;
      // if we already have the language in the accumulator
      // & the current language name is same as previous name
      // add the size to the language size and increase repoCount.
      if (acc[prev.node.name] && prev.node.name === acc[prev.node.name].name) {
        langSize = prev.size + acc[prev.node.name].size;
        repoCount += 1;
      } else {
        // reset repoCount to 1
        // language must exist in at least one repo to be detected
        repoCount = 1;
      }
      return {
        ...acc,
        [prev.node.name]: {
          name: prev.node.name,
          color: prev.node.color,
          size: langSize,
          count: repoCount,
        },
      };
    }, {});
  if (debugFetch) {
    const langsSorted = Object.entries(repoNodes).sort(
      (a, b) => b[1].size - a[1].size,
    );
    console.log(
      `[top-langs] Language sizes (GitHub Linguist byte counts — raw file bytes, NOT lines of code):`,
    );
    console.log(
      `[top-langs] Note: Jupyter Notebook .ipynb files are JSON containing cell outputs and base64-encoded images, which inflates their byte count far beyond the actual code written.`,
    );
    for (const [name, data] of langsSorted.slice(0, 20)) {
      const note =
        name === "Jupyter Notebook"
          ? "  ⚠  includes rendered output/images"
          : "";
      console.log(
        `[top-langs]   ${name.padEnd(30)} ${String(data.size).padStart(12)} bytes  (${data.count} repos)${note}`,
      );
    }
  }
  Object.keys(repoNodes).forEach((name) => {
    // comparison index calculation
    repoNodes[name].size =
      Math.pow(repoNodes[name].size, size_weight) *
      Math.pow(repoNodes[name].count, count_weight);
  });
  const topLangs = Object.keys(repoNodes)
    .sort((a, b) => repoNodes[b].size - repoNodes[a].size)
    .reduce((result, key) => {
      result[key] = repoNodes[key];
      return result;
    }, {});
  return topLangs;
};
export { fetchTopLanguages };
