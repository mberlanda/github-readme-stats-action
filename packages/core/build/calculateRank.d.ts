/**
 * Calculates the users rank.
 *
 * @param {object} params Parameters on which the user's rank depends.
 * @param {boolean} params.all_commits Whether `include_all_commits` was used.
 * @param {number} params.commits Number of commits.
 * @param {number} params.prs The number of pull requests.
 * @param {number} params.issues The number of issues.
 * @param {number} params.reviews The number of reviews.
 * @param {number} params.repos Total number of repos.
 * @param {number} params.stars The number of stars.
 * @param {number} params.followers The number of followers.
 * @returns {{ level: string, percentile: number }} The users rank.
 */
export function calculateRank({
  all_commits,
  commits,
  prs,
  issues,
  reviews,
  repos,
  stars,
  followers,
}: {
  all_commits: boolean;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  repos: number;
  stars: number;
  followers: number;
}): {
  level: string;
  percentile: number;
};
//# sourceMappingURL=calculateRank.d.ts.map
