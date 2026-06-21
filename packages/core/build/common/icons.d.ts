export namespace icons {
  let star: string;
  let commits: string;
  let prs: string;
  let prs_merged: string;
  let prs_merged_percentage: string;
  let issues: string;
  let icon: string;
  let contribs: string;
  let fork: string;
  let reviews: string;
  let discussions_started: string;
  let discussions_answered: string;
  let comments: string;
  let gist: string;
}
/**
 * Get rank icon
 *
 * @param {string} rankIcon - The rank icon type.
 * @param {string} rankLevel - The rank level.
 * @param {number} percentile - The rank percentile.
 * @returns {string} - The SVG code of the rank icon
 */
export function rankIcon(
  rankIcon: string,
  rankLevel: string,
  percentile: number,
): string;
//# sourceMappingURL=icons.d.ts.map
