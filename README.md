# GitHub Readme Stats Action (mberlanda fork)

Generate [GitHub Readme Stats](https://github.com/stats-organization/github-readme-stats) cards in your GitHub Actions workflow, commit them to your profile repository, and embed them directly from there.

> **This is a personal fork of [stats-organization/github-readme-stats-action](https://github.com/stats-organization/github-readme-stats-action).**
> It vendors a patched copy of the upstream core package with bug fixes and several new card types.
> See [What's different from upstream](#whats-different-from-upstream) for the full list of changes.

## Quick start

```yaml
name: Update README cards

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v6

      - name: Generate stats card
        uses: mberlanda/github-readme-stats-action@v2.2
        with:
          card: stats
          options: "username=${{ github.repository_owner }}&show_icons=true&role=OWNER,ORGANIZATION_MEMBER"
          path: profile/stats.svg
          token: ${{ secrets.GRS_PAT }}

      - name: Generate top languages card
        uses: mberlanda/github-readme-stats-action@v2.2
        with:
          card: top-langs
          options: "username=${{ github.repository_owner }}&layout=compact&langs_count=8&role=OWNER,ORGANIZATION_MEMBER&hide=HTML,CSS&lang_multiplier=Jupyter Notebook:0.1"
          path: profile/top-langs.svg
          token: ${{ secrets.GRS_PAT }}

      - name: Generate language history card
        uses: mberlanda/github-readme-stats-action@v2.2
        with:
          card: lang-history
          options: "username=${{ github.repository_owner }}&role=OWNER,ORGANIZATION_MEMBER&langs_count=7&hide=HTML,CSS"
          path: profile/lang-history.svg
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
![Language History](./profile/lang-history.svg)
```

> **Options format note:** Always pass multi-option strings as a single quoted line (`"key=val&key2=val2"`). YAML `>-` folding inserts a space before each `&` on a new line, which can corrupt option values (e.g. `layout="compact "` with a trailing space fails validation). The action trims these automatically, but single-line format is safer.

## What's different from upstream

### Bug fixes (battle-tested against real accounts)

| Bug | Upstream | This fork |
|---|---|---|
| Top-langs repo count | Shared outer variable clobbered by interleaved language entries — Go showed 2 repos instead of 11 | Fixed: each language tracks its own count independently in the reduce chain |
| Stats pagination stop | Stops when any repo on a page has < `MIN_STARS_TO_PAGINATE` stars (default 1) | Configurable; default is `0` (paginate all repos) |
| Top-langs coverage | Hard-coded single page of 100 repos | Cursor-paginated through all pages — deterministic and complete |

### New inputs

| Input | Description |
|---|---|
| `debug_fetch` | Log per-page repo counts, public/private split, star distribution, and language byte breakdown to the workflow log. Set to `"true"` to enable. |
| `core_package` | Override the npm package name for the core — useful for pointing at a differently-scoped fork |
| `min_stars_to_paginate` | Minimum stars threshold for star-count pagination (default `"0"`) |
| `fetch_multi_page_stars` | Enable multi-page star counting (default `"true"`) |

### New card types (not in upstream)

| Card | Description |
|---|---|
| `lang-history` | 100%-stacked bar chart of language usage by year (based on repo `createdAt`) |
| `rubygems` | RubyGems profile — gem count, total downloads, top gems by downloads |
| `pypi` | PyPI profile — package count, monthly downloads via pypistats.org |
| `stackoverflow` | Stack Exchange profile — reputation, answers, questions, gold/silver/bronze badges |

### New options for existing cards

| Card | Option | Description |
|---|---|---|
| `top-langs` | `include_forks` | `true` to include forked repos (default `false`) |
| `top-langs` | `lang_multiplier` | Per-language byte multiplier, e.g. `Jupyter Notebook:0.1,HTML:0.5` — reduces over-represented languages before ranking |
| `lang-history` | `include_forks` | Same as top-langs |
| `lang-history` | `hide` | Comma-separated language names to exclude |

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

External-platform cards (`rubygems`, `pypi`, `stackoverflow`) do not require a GitHub token — they call public APIs directly. You can omit the `token` input for those steps, though including it does no harm.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `card` | yes | — | Card type: `stats`, `top-langs`, `lang-history`, `rubygems`, `pypi`, `stackoverflow`, `pin`, `wakatime`, `gist` |
| `options` | no | `""` | Card options as a single-line query string (`key=value&key2=value2`) or JSON object |
| `path` | no | `profile/<card>.svg` | Output path for the SVG file (relative, must end in `.svg`) |
| `token` | no | `github.token` | GitHub token. Use a PAT with `repo`+`read:user` for private repos and org repos |
| `debug_fetch` | no | `"false"` | Log debug info during fetch — repo count per page, public/private split, star distribution, language byte breakdown |
| `min_stars_to_paginate` | no | `"0"` | Minimum stars a repo must have for star-count pagination to continue (`"0"` = all repos; `"1"` = upstream behaviour) |
| `fetch_multi_page_stars` | no | `"true"` | Count stars across all repo pages, not just the first 100 |
| `core_version` | no | `""` | Pin a specific upstream core version (e.g. `2.1.3`). Bypasses the bundled local fork |
| `core_package` | no | `""` | Override the npm package name for the core |

## Outputs

| Output | Description |
|---|---|
| `path` | Path where the SVG file was written, relative to the workspace |

## Card options reference

Options are passed as a single-line URL query string or a JSON object.

### Shared options (all GitHub cards)

| Option | Values | Notes |
|---|---|---|
| `username` | GitHub username | Defaults to the repository owner if omitted |
| `role` | `OWNER`, `COLLABORATOR`, `ORGANIZATION_MEMBER` (comma-separated) | Controls which repos are included. Use `OWNER,ORGANIZATION_MEMBER` to include org repos |
| `exclude_repo` | Comma-separated repo names | Repos to exclude |
| `theme` | e.g. `dark`, `radical`, `tokyonight` | Visual theme |
| `bg_color` | Hex colour (no `#`) | Custom background |
| `title_color` | Hex colour | |
| `text_color` | Hex colour | |
| `border_color` | Hex colour | |
| `hide_border` | `true` / `false` | |
| `border_radius` | Number | Card corner radius |
| `hide_title` | `true` / `false` | |
| `custom_title` | String | Override card title |
| `disable_animations` | `true` / `false` | |
| `locale` | BCP 47 tag | e.g. `de`, `ja`, `pt-br` |

### Stats card (`card: stats`)

| Option | Values | Notes |
|---|---|---|
| `show_icons` | `true` / `false` | |
| `include_all_commits` | `true` / `false` | Count commits via REST API (slower, includes commits outside the current year) |
| `show` | `prs_merged`, `prs_merged_percentage`, `discussions_started`, `discussions_answered`, `issues_authored`, `prs_authored` | Extra stats (comma-separated) |
| `hide` | `stars`, `commits`, `prs`, `issues`, `contribs` | Stats to hide (comma-separated) |
| `hide_rank` | `true` / `false` | |
| `rank_icon` | `default`, `github`, `percentile` | |
| `commits_year` | Four-digit year | Count commits from a specific year |
| `card_width` | Number (px) | |

### Top languages card (`card: top-langs`)

| Option | Values | Notes |
|---|---|---|
| `layout` | `normal`, `compact`, `donut`, `donut-vertical`, `pie` | |
| `langs_count` | Number (1–20) | How many languages to show |
| `hide` | Comma-separated language names | Languages to exclude (e.g. `HTML,CSS`) |
| `size_weight` | Float (default `1`) | Weight given to byte size |
| `count_weight` | Float (default `0`) | Weight given to repo count |
| `include_forks` | `true` / `false` (default `false`) | Include forked repositories |
| `lang_multiplier` | `LangName:factor,...` | Scale down over-represented languages before ranking. Example: `Jupyter Notebook:0.1,HTML:0.5` |
| `hide_progress` | `true` / `false` | |
| `hide_values` | `true` / `false` | |
| `stats_format` | `percentages`, `bytes` | |

### Language history card (`card: lang-history`)

Renders a 100%-stacked bar chart with one column per year (based on `createdAt` of each repo).

| Option | Values | Notes |
|---|---|---|
| `langs_count` | Number (1–20, default 6) | Top N languages; remainder shown as "Other" |
| `hide` | Comma-separated language names | Languages to exclude |
| `include_forks` | `true` / `false` (default `false`) | |
| `role` | Same as top-langs | |
| `exclude_repo` | Same as top-langs | |

### RubyGems card (`card: rubygems`)

No GitHub token needed — calls the public RubyGems API.

| Option | Values | Notes |
|---|---|---|
| `username` | RubyGems handle | |
| `gems_count` | Number (default 5) | How many gems to list |

### PyPI card (`card: pypi`)

No GitHub token needed. Download counts come from [pypistats.org](https://pypistats.org) (public API; non-fatal if unavailable — shows version instead).

| Option | Values | Notes |
|---|---|---|
| `username` | PyPI username | |
| `packages_count` | Number (default 5) | How many packages to list |

### Stack Overflow card (`card: stackoverflow`)

No GitHub token needed — calls the public Stack Exchange API.

| Option | Values | Notes |
|---|---|---|
| `user_id` | Numeric Stack Exchange user ID | Find yours in your profile URL: `stackoverflow.com/users/<user_id>/...` |
| `site` | Stack Exchange site slug (default `stackoverflow`) | e.g. `superuser`, `serverfault`, `math` |

### Pin card (`card: pin`)

| Option | Values | Notes |
|---|---|---|
| `username` | GitHub username | |
| `repo` | Repository name | Required |

## Examples

### Stats with org repos, all commits, and extra metrics

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: stats
    options: "username=${{ github.repository_owner }}&show_icons=true&include_all_commits=true&role=OWNER,ORGANIZATION_MEMBER&show=prs_merged,discussions_started"
    path: profile/stats.svg
    token: ${{ secrets.GRS_PAT }}
```

### Top languages — hide markup, reduce Jupyter Notebook weight

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: top-langs
    options: "username=${{ github.repository_owner }}&layout=compact&langs_count=8&role=OWNER,ORGANIZATION_MEMBER&hide=HTML,CSS&lang_multiplier=Jupyter Notebook:0.1"
    path: profile/top-langs.svg
    token: ${{ secrets.GRS_PAT }}
```

### Language history (stacked bar chart by year)

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: lang-history
    options: "username=${{ github.repository_owner }}&role=OWNER,ORGANIZATION_MEMBER&langs_count=7&hide=HTML,CSS"
    path: profile/lang-history.svg
    token: ${{ secrets.GRS_PAT }}
```

### RubyGems profile

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: rubygems
    options: "username=mberlanda&gems_count=5"
    path: profile/rubygems.svg
    # token not required for public API
```

### PyPI profile

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: pypi
    options: "username=mberlanda&packages_count=5"
    path: profile/pypi.svg
```

### Stack Overflow profile

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: stackoverflow
    options: "user_id=5687152&site=stackoverflow"
    path: profile/stackoverflow.svg
```

### Dark theme

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: stats
    options: "username=${{ github.repository_owner }}&show_icons=true&theme=dark&bg_color=0D1117"
    path: profile/stats.svg
    token: ${{ secrets.GRS_PAT }}
```

### Debug logging — verify repo coverage

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: top-langs
    options: "username=${{ github.repository_owner }}&role=OWNER,ORGANIZATION_MEMBER"
    path: profile/top-langs.svg
    token: ${{ secrets.GRS_PAT }}
    debug_fetch: "true"
```

When `debug_fetch: "true"` is set, the workflow log will include:
- Page-by-page repo counts and running total
- Public vs private repo split
- Star distribution buckets (0 / 1–9 / 10–99 / 100+)
- Language byte breakdown (top 20, with a note that `.ipynb` files include rendered outputs)
- Which repos were excluded (forks, `exclude_repo`)
- When and why pagination stopped

### Pin to a specific upstream core version

```yaml
- uses: mberlanda/github-readme-stats-action@v2.2
  with:
    card: stats
    options: "username=${{ github.repository_owner }}"
    core_version: "2.1.3"
    token: ${{ secrets.GRS_PAT }}
```

## Notes

### Language byte counts and Jupyter Notebook over-representation

GitHub Linguist reports raw file byte sizes, not lines of code. `.ipynb` (Jupyter Notebook) files are JSON blobs that include rendered cell outputs and base64-encoded images. A single notebook with inline plots can be several megabytes, dwarfing thousands of lines of Ruby or Go. Use `lang_multiplier=Jupyter Notebook:0.1` to scale it down before ranking.

### YAML multi-line options and whitespace

If you use YAML `>-` block folding to split options across lines, YAML inserts a space before each `&` at the start of a new line. The action trims these automatically, but to avoid any ambiguity use single-line quoted strings: `options: "key=val&key2=val2"`.

### API rate limits

- GitHub GraphQL: 5000 points per hour. Accounts with many repositories use more points per run (one request per 100 repos for top-langs and lang-history).
- Stack Exchange: 300 requests/day without a key. This is sufficient for a daily refresh.
- RubyGems: no documented rate limit for read-only API.
- pypistats.org: public, no documented rate limit.

### Vendored core package

The vendored core in `packages/core/` is based on `@stats-organization/github-readme-stats-core@2.1.3` with bug fixes and extensions applied directly to the build output. To update to a new upstream release, copy the new `build/` directory into `packages/core/build/`, re-apply the patches from git history, and run `pnpm install`.

Specifying `core_version` bypasses the local fork entirely — the named npm version is installed at runtime. This is useful for testing upstream releases without modifying the fork.
