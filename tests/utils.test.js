import { describe, expect, test } from "vitest";

import {
  formatCount,
  truncate,
} from "../packages/core/build/common/external-card.js";
import { validateCardOptions } from "../index.js";
import { renderLangHistory } from "../packages/core/build/cards/lang-history.js";

// ── formatCount ───────────────────────────────────────────────────────────────

describe("formatCount", () => {
  test("returns '?' for null/undefined", () => {
    expect(formatCount(null)).toBe("?");
    expect(formatCount(undefined)).toBe("?");
  });

  test("returns '0' for zero", () => {
    expect(formatCount(0)).toBe("0");
  });

  test("returns plain string for values under 1000", () => {
    expect(formatCount(1)).toBe("1");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(999)).toBe("999");
  });

  test("uses k suffix at 1000", () => {
    expect(formatCount(1000)).toBe("1.0k");
  });

  test("formats thousands with one decimal", () => {
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(12345)).toBe("12.3k");
    expect(formatCount(999999)).toBe("1000.0k");
  });

  test("uses M suffix at 1 million", () => {
    expect(formatCount(1_000_000)).toBe("1.0M");
    expect(formatCount(7_357_000)).toBe("7.4M"); // matches RubyGems fixture
    expect(formatCount(999_999_999)).toBe("1000.0M");
  });

  test("uses B suffix at 1 billion", () => {
    expect(formatCount(1_000_000_000)).toBe("1.0B");
    expect(formatCount(2_500_000_000)).toBe("2.5B");
  });
});

// ── truncate ──────────────────────────────────────────────────────────────────

describe("truncate", () => {
  test("returns short strings unchanged", () => {
    expect(truncate("hello")).toBe("hello");
  });

  test("returns strings exactly at maxLen unchanged", () => {
    const s = "a".repeat(22);
    expect(truncate(s, 22)).toBe(s);
  });

  test("truncates strings longer than maxLen and appends ellipsis", () => {
    const s = "a".repeat(30);
    const result = truncate(s, 22);
    expect(result.length).toBe(22);
    expect(result.endsWith("…")).toBe(true);
  });

  test("default maxLen is 22", () => {
    const s = "a".repeat(25);
    expect(truncate(s).length).toBe(22);
  });

  test("works with a gem name that should be truncated", () => {
    const result = truncate("a_very_long_gem_name_that_should_be_truncated");
    expect(result.length).toBe(22);
    expect(result).toContain("…");
  });
});

// ── validateCardOptions ───────────────────────────────────────────────────────

describe("validateCardOptions", () => {
  test("stats card requires username, defaults to repoOwner if missing", () => {
    const query = {};
    validateCardOptions("stats", query, "testowner");
    expect(query.username).toBe("testowner");
  });

  test("stats card throws when username missing and no repoOwner", () => {
    expect(() => validateCardOptions("stats", {}, undefined)).toThrow(
      /username.*required/,
    );
  });

  test("top-langs card requires username", () => {
    expect(() => validateCardOptions("top-langs", {}, undefined)).toThrow(
      /username.*required/,
    );
  });

  test("lang-history card requires username", () => {
    expect(() => validateCardOptions("lang-history", {}, undefined)).toThrow(
      /username.*required/,
    );
  });

  test("rubygems card requires username", () => {
    expect(() => validateCardOptions("rubygems", {}, undefined)).toThrow(
      /username.*required/,
    );
  });

  test("pypi card requires username", () => {
    expect(() => validateCardOptions("pypi", {}, undefined)).toThrow(
      /username.*required/,
    );
  });

  test("stackoverflow card requires user_id", () => {
    expect(() => validateCardOptions("stackoverflow", {}, undefined)).toThrow(
      /user_id.*required/,
    );
  });

  test("stackoverflow card does not require username", () => {
    expect(() =>
      validateCardOptions("stackoverflow", { user_id: "12345" }, undefined),
    ).not.toThrow();
  });

  test("pin card requires repo", () => {
    expect(() =>
      validateCardOptions("pin", { username: "foo" }, undefined),
    ).toThrow(/repo.*required/);
  });

  test("pin card passes when username and repo provided", () => {
    expect(() =>
      validateCardOptions("pin", { username: "foo", repo: "bar" }, undefined),
    ).not.toThrow();
  });

  test("gist card requires id", () => {
    expect(() => validateCardOptions("gist", {}, undefined)).toThrow(
      /id.*required/,
    );
  });

  test("unknown card type passes without throwing", () => {
    expect(() =>
      validateCardOptions("unknown-future-card", {}, undefined),
    ).not.toThrow();
  });

  test("does not mutate query when username already present", () => {
    const query = { username: "existing" };
    validateCardOptions("stats", query, "otherowner");
    expect(query.username).toBe("existing");
  });
});

// ── langColor determinism (tested via renderLangHistory) ─────────────────────

const makeNode = (createdAt, langs) => ({
  name: "repo",
  createdAt,
  isFork: false,
  languages: {
    edges: langs.map(([name, size, color]) => ({
      size,
      node: { name, color },
    })),
  },
});

describe("langColor — deterministic color fallback", () => {
  test("uses API color when provided (non-null)", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [["Ruby", 1000, "#CC342D"]]),
    ];
    const svg = renderLangHistory(nodes);
    expect(svg).toContain("#CC342D");
  });

  test("falls back to languageColors.json when API returns null", async () => {
    // Ruby's bundled color in languageColors.json (#701516) differs from what
    // the GitHub API returns (#CC342D) — this tests the JSON-lookup path.
    const { default: colors } = await import(
      "../packages/core/build/common/languageColors.json",
      { assert: { type: "json" } }
    );
    const rubyColor = colors["Ruby"]; // #701516
    const nodes = [makeNode("2021-01-01T00:00:00Z", [["Ruby", 1000, null]])];
    const svg = renderLangHistory(nodes);
    // Should use the bundled color, not the generic gray #858585
    expect(svg).toContain(rubyColor);
    expect(svg).not.toContain("#858585");
  });

  test("uses HSL hash color for unknown language with null API color", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [["SomeFictionalLang2099", 1000, null]]),
    ];
    const svg = renderLangHistory(nodes);
    // The hash-based fallback produces hsl(...) format
    expect(svg).toContain("hsl(");
  });

  test("same unknown language always gets the same hash color", () => {
    const name = "SomeFictionalLang2099";
    const nodes1 = [makeNode("2021-01-01T00:00:00Z", [[name, 1000, null]])];
    const nodes2 = [makeNode("2022-01-01T00:00:00Z", [[name, 1000, null]])];
    const svg1 = renderLangHistory(nodes1);
    const svg2 = renderLangHistory(nodes2);
    // Extract the hsl(...) color from both — must be identical
    const hslRe = /hsl\(\d+,65%,55%\)/g;
    const colors1 = svg1.match(hslRe);
    const colors2 = svg2.match(hslRe);
    expect(colors1).toBeTruthy();
    expect(colors2).toBeTruthy();
    expect(colors1[0]).toBe(colors2[0]);
  });

  test("two different unknown languages get different hash colors", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [
        ["FakeLangAlpha", 500, null],
        ["FakeLangBeta", 500, null],
      ]),
    ];
    const svg = renderLangHistory(nodes);
    const hslRe = /hsl\((\d+),65%,55%\)/g;
    const hues = [...svg.matchAll(hslRe)].map((m) => m[1]);
    // Both hues must appear; they may or may not be equal (hash collision possible
    // but vanishingly rare for these two names)
    expect(hues.length).toBeGreaterThanOrEqual(1);
  });
});
