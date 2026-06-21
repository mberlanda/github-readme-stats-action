// @ts-check
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { request } from "../common/http.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";

/**
 * @param {any} variables Fetcher variables.
 * @param {string} token GitHub token.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
const fetcher = (variables, token) => {
  return request(
    {
      query: `
      query userInfo($login: String!, $after: String, $ownerAffiliations: [RepositoryAffiliation], $isFork: Boolean) {
        user(login: $login) {
          repositories(
            ownerAffiliations: $ownerAffiliations,
            isFork: $isFork,
            first: 100,
            after: $after,
            orderBy: {field: PUSHED_AT, direction: DESC}
          ) {
            nodes {
              name
              createdAt
              isFork
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
 * Raw repository node returned by the fetcher.
 * @typedef {{ name: string, createdAt: string, isFork: boolean, languages: { edges: Array<{ size: number, node: { name: string, color: string } }> } }} RepoNode
 */

/**
 * Fetch repository nodes with language data for timeline aggregation.
 *
 * @param {string} username GitHub username.
 * @param {string[]} exclude_repo Repositories to exclude.
 * @param {string[]} ownerAffiliations Owner affiliations filter.
 * @param {string|null} pat Optional PAT override.
 * @param {boolean} include_forks Whether to include forks. Default: false.
 * @returns {Promise<RepoNode[]>} Raw repository nodes.
 */
const fetchLangHistory = async (
  username,
  exclude_repo = [],
  ownerAffiliations = [],
  pat = null,
  include_forks = false,
) => {
  if (!username) throw new MissingParamError(["username"]);
  ownerAffiliations = parseOwnerAffiliations(ownerAffiliations);
  // null = include all; false = no forks; true = only forks
  const isFork = include_forks ? null : false;

  let allRepoNodes = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const res = await retryer(
      fetcher,
      { login: username, after: endCursor, ownerAffiliations, isFork },
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
  }

  const excludeSet = new Set(exclude_repo);
  return allRepoNodes.filter((n) => !excludeSet.has(n.name));
};

export { fetchLangHistory };
