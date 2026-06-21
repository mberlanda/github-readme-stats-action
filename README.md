# GitHub Readme Stats Action (mberlanda fork)

Generate [GitHub Readme Stats](https://github.com/stats-organization/github-readme-stats) cards in your GitHub Actions workflow, commit them to your profile repository, and embed them directly from there.

> **This is a personal fork of [stats-organization/github-readme-stats-action](https://github.com/stats-organization/github-readme-stats-action).**
> It vendors a patched copy of the upstream core package with fixes for pagination and org-repo coverage.
> See [What's different from upstream](#whats-different-from-upstream) for the full list of changes.

## Quick start

```yaml
name: Update README cards

on:
  schedule:
    - cron: "0 0 * * *" # Runs once daily at midnight
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v6

      - name: Generate stats card
        uses: mberlanda/github-readme-stats-action@main
        with:
          card: stats
          options: >-
            username=${{ github.repository_owner }}
            &show_icons=true
            &role=OWNER,ORGANIZATION_MEMBER
          path: profile/stats.svg
          token: ${{ secrets.GRS_PAT }}

      - name: Generate top languages card
        uses: mberlanda/github-readme-stats-action@main
        with:
          card: top-langs
          options: >-
            username=${{ github.repository_owner }}
            &layout=compact
            &langs_count=8
            &role=OWNER,ORGANIZATION_MEMBER
          path: profile/top-langs.svg
          token: ${{ secrets.GRS_PAT }}

      - name: Commit cards
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add profile/*.svg
          git commit -m "chore: update README cards" || exit 0
          git push
```

Then embed from your profile README:

```md
![Stats](./profile/stats.svg)
![Top Languages](./profile/top-langs.svg)
```

## What's different from upstream

| Area | Upstream behaviour | This fork |
|---|---|---|
| Stats pagination | Stops when any repo on a page has 0 stars | Configurable via `min_stars_to_paginate` (default `0` — paginate everything) |
| Multi-page stars | Disabled by default | Enabled by default via `fetch_multi_page_stars: "true"` |
| Top-langs pagination | Hard-coded `first: 100`, no pagination | Cursor-paginated through all pages |
| Top-langs ordering | Unordered (arbitrary) | Sorted by `PUSHED_AT DESC` — most recently active repos first |
| Org repos | Must pass `role=` in options manually | Still manual, but documented and shown in examples |
| Custom core package | Not supported | Supported via `core_package` input |

## Setting up a PAT for private repos and org repos

`GITHUB_TOKEN` is scoped to the single repository where the workflow runs. It cannot read your other private repositories. To include them:

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Select these scopes:
   - `repo` — read private repositories across your account
   - `read:user` — read your user profile
4. Copy the token, then go to your profile repository → **Settings → Secrets and variables → Actions**
5. Add a new secret named `GRS_PAT` and paste the token

Use `token: ${{ secrets.GRS_PAT }}` in every step instead of `${{ secrets.GITHUB_TOKEN }}`.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `card` | yes | — | Card type: `stats`, `top-langs`, `pin`, `wakatime`, `gist` |
| `options` | no | `""` | Card options as a query string (`key=value&...`) or JSON object |
| `path` | no | `profile/<card>.svg` | Output path for the SVG file (relative, must end in `.svg`) |
| `token` | no | `github.token` | GitHub token. Use a PAT with `repo`+`read:user` for private repos |
| `min_stars_to_paginate` | no | `"0"` | Minimum stars a repo must have for star-count pagination to continue. `"0"` paginates all repos; `"1"` matches upstream behaviour |
| `fetch_multi_page_stars` | no | `"true"` | Set to `"true"` to count stars across all repo pages, not just the first 100 |
| `core_version` | no | `""` | Pin a specific upstream core version (e.g. `2.1.3`). When set, the bundled local fork is bypassed and that exact npm version is installed |
| `core_package` | no | `""` | Override the npm package name for the core. Useful when pointing at a differently-scoped custom fork |

## Card options (`options` input)

Options are passed as a URL query string or a JSON object and forwarded directly to the card renderer. The most useful ones for full coverage:

### Shared

| Option | Values | Notes |
|---|---|---|
| `username` | GitHub username | Defaults to the repository owner if omitted |
| `role` | `OWNER`, `COLLABORATOR`, `ORGANIZATION_MEMBER` (comma-separated) | Controls which repos are included. Use `OWNER,ORGANIZATION_MEMBER` to add org repos |
| `exclude_repo` | Comma-separated repo names | Repos to exclude from all counts |
| `theme` | e.g. `dark`, `radical`, `tokyonight` | Visual theme |
| `bg_color` | Hex colour (no `#`) | Custom background |
| `hide_border` | `true` / `false` | |

### Stats card (`card: stats`)

| Option | Values | Notes |
|---|---|---|
| `show_icons` | `true` / `false` | Show stat icons |
| `include_all_commits` | `true` / `false` | Count all commits via REST API (slower, but includes commits outside the current year) |
| `show` | Comma-separated: `prs_merged`, `prs_merged_percentage`, `discussions_started`, `discussions_answered`, `issues_authored`, `prs_authored` | Extra stats to show |
| `hide` | Comma-separated: `stars`, `commits`, `prs`, `issues`, `contribs` | Stats to hide |
| `hide_rank` | `true` / `false` | |
| `commits_year` | Four-digit year | Count commits from a specific year only |
| `rank_icon` | `default`, `github`, `percentile` | |

### Top languages card (`card: top-langs`)

| Option | Values | Notes |
|---|---|---|
| `layout` | `normal`, `compact`, `donut`, `donut-vertical`, `pie` | Card layout |
| `langs_count` | Number | How many languages to show |
| `hide` | Comma-separated language names | Languages to exclude |
| `size_weight` | Float (default `1`) | Weight given to lines-of-code size |
| `count_weight` | Float (default `0`) | Weight given to number of repos using a language |

## Examples

### Full stats with org repos and all commits

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: stats
    options: >-
      username=${{ github.repository_owner }}
      &show_icons=true
      &include_all_commits=true
      &role=OWNER,ORGANIZATION_MEMBER
      &show=prs_merged,discussions_started
      &hide_rank=false
    path: profile/stats.svg
    token: ${{ secrets.GRS_PAT }}
```

### Top languages including org repos

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: top-langs
    options: >-
      username=${{ github.repository_owner }}
      &layout=compact
      &langs_count=8
      &role=OWNER,ORGANIZATION_MEMBER
    path: profile/top-langs.svg
    token: ${{ secrets.GRS_PAT }}
```

### Stats card with dark theme

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: stats
    options: username=${{ github.repository_owner }}&show_icons=true&theme=dark&bg_color=0D1117
    token: ${{ secrets.GRS_PAT }}
```

### Pin a repository

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: pin
    options: username=mberlanda&repo=my-repo
    token: ${{ secrets.GRS_PAT }}
```

### WakaTime card

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: wakatime
    options: username=your-wakatime-username&layout=compact
    token: ${{ secrets.GRS_PAT }}
```

### Pin to a specific upstream core version

```yaml
- uses: mberlanda/github-readme-stats-action@main
  with:
    card: stats
    options: username=${{ github.repository_owner }}
    core_version: 2.1.3
    token: ${{ secrets.GRS_PAT }}
```

## Outputs

| Output | Description |
|---|---|
| `path` | Path where the SVG file was written, relative to the workspace |

## Notes

- The vendored core package in `packages/core/` is based on `@stats-organization/github-readme-stats-core@2.1.3`. When the upstream releases a new version, update by copying the new `build/` output into that directory and re-running `pnpm install`.
- Top-languages pagination fetches every page of repos ordered by last push date. For accounts with hundreds of repos this adds extra API calls; the GitHub GraphQL API rate limit is 5000 points/hour.
- Specifying `core_version` bypasses the local fork entirely — the named npm version is installed at runtime. This is useful for testing upstream releases without changing the fork.
