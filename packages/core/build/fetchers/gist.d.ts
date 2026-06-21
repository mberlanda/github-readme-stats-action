/**
 * Gist file.
 */
export type GistFile = {
  name: string;
  language: {
    name: string;
  };
  size: number;
};
/**
 * Gist data.
 */
export type GistData = any;
/**
 * @typedef {import('./types').GistData} GistData Gist data.
 */
/**
 * Fetch GitHub gist information by given username and ID.
 *
 * @param {string} id GitHub gist ID.
 * @param {string | null} pat Optional PAT override.
 * @returns {Promise<GistData>} Gist data.
 */
export function fetchGist(id: string, pat?: string | null): Promise<GistData>;
//# sourceMappingURL=gist.d.ts.map
