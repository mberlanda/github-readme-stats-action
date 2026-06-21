import { describe, expect, test } from "vitest";

import {
  trimTopLanguages,
  renderTopLanguages,
} from "../packages/core/build/cards/top-languages.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal topLangs record keyed by lang name. */
const makeLangs = (...entries) =>
  Object.fromEntries(
    entries.map(([name, size, color = "#aabbcc"]) => [
      name.toLowerCase(),
      { name, size, color },
    ]),
  );

// ── trimTopLanguages ──────────────────────────────────────────────────────────

describe("trimTopLanguages — Other bucket", () => {
  test("no Other when langs ≤ langs_count", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000]);
    const { langs } = trimTopLanguages(topLangs, 5, []);
    expect(langs.map((l) => l.name)).not.toContain("Other");
  });

  test("Other added when langs > langs_count (total stays at langs_count)", () => {
    const topLangs = makeLangs(
      ["Ruby", 5000],
      ["Go", 3000],
      ["Python", 2000],
      ["Rust", 1000],
    );
    // langs_count=3: reserve 1 slot → show top 2 + Other = 3 total
    const { langs } = trimTopLanguages(topLangs, 3, []);
    const names = langs.map((l) => l.name);
    expect(names).toContain("Other");
    expect(names.length).toBe(3); // never exceeds langs_count
  });

  test("Other is always the last entry", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000], ["Python", 2000]);
    const { langs } = trimTopLanguages(topLangs, 2, []);
    expect(langs[langs.length - 1].name).toBe("Other");
  });

  test("Other size is the sum of all excluded langs", () => {
    const topLangs = makeLangs(
      ["Ruby", 5000],
      ["Go", 3000],
      ["Python", 2000],
      ["Rust", 1000],
    );
    // langs_count=3 → top 2 shown (Ruby, Go), rest = Python(2000)+Rust(1000)
    const { langs } = trimTopLanguages(topLangs, 3, []);
    const other = langs.find((l) => l.name === "Other");
    expect(other.size).toBe(3000); // Python(2000) + Rust(1000)
  });

  test("Other color is the default gray #858585", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000], ["Python", 2000]);
    const { langs } = trimTopLanguages(topLangs, 2, []);
    const other = langs.find((l) => l.name === "Other");
    expect(other.color).toBe("#858585");
  });

  test("totalLanguageSize covers all non-hidden langs (including Other)", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000], ["Python", 2000]);
    // langs_count=3: 3 langs exactly, no overflow → no Other
    const { langs, totalLanguageSize } = trimTopLanguages(topLangs, 3, []);
    const manualTotal = langs.reduce((s, l) => s + l.size, 0);
    expect(totalLanguageSize).toBe(manualTotal);
    expect(totalLanguageSize).toBe(10000); // 5000+3000+2000
  });

  test("percentages sum to 100% when Other is included", () => {
    const topLangs = makeLangs(
      ["Ruby", 5000],
      ["Go", 3000],
      ["Python", 2000],
      ["Rust", 1000],
    );
    // langs_count=3: show Ruby+Go + Other(Python+Rust)
    const { langs, totalLanguageSize } = trimTopLanguages(topLangs, 3, []);
    const totalPct = langs.reduce(
      (s, l) => s + (l.size / totalLanguageSize) * 100,
      0,
    );
    expect(totalPct).toBeCloseTo(100, 5);
  });
});

describe("trimTopLanguages — hide interaction", () => {
  test("hidden langs are excluded and do not appear in Other", () => {
    const topLangs = makeLangs(
      ["Ruby", 5000],
      ["HTML", 9999],
      ["Go", 3000],
      ["CSS", 8888],
    );
    // hide HTML and CSS; remaining: Ruby(5000), Go(3000)
    // langs_count=2 with 2 remaining → no overflow, no Other
    const { langs } = trimTopLanguages(topLangs, 2, ["HTML", "CSS"]);
    const names = langs.map((l) => l.name);
    expect(names).not.toContain("HTML");
    expect(names).not.toContain("CSS");
    expect(names).toContain("Ruby");
    expect(names).toContain("Go");
    expect(names).not.toContain("Other");
  });

  test("hidden langs are excluded and Go lands in Other when count is tight", () => {
    const topLangs = makeLangs(
      ["Ruby", 5000],
      ["HTML", 9999],
      ["Go", 3000],
      ["CSS", 8888],
      ["Python", 2000],
    );
    // hide HTML and CSS; remaining: Ruby(5000), Go(3000), Python(2000)
    // langs_count=2 → show top 1 (Ruby) + Other(Go+Python)
    const { langs } = trimTopLanguages(topLangs, 2, ["HTML", "CSS"]);
    const names = langs.map((l) => l.name);
    expect(names).not.toContain("HTML");
    expect(names).not.toContain("CSS");
    expect(names).toContain("Ruby");
    expect(names).toContain("Other"); // Go and Python land in Other
  });

  test("hidden langs excluded from totalLanguageSize", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["HTML", 9999], ["Go", 3000]);
    const { totalLanguageSize } = trimTopLanguages(topLangs, 10, ["HTML"]);
    expect(totalLanguageSize).toBe(8000); // Ruby + Go only
  });

  test("case-insensitive hide matching", () => {
    const topLangs = makeLangs(["Jupyter Notebook", 5000], ["Ruby", 3000]);
    const { langs } = trimTopLanguages(topLangs, 5, ["jupyter notebook"]);
    const names = langs.map((l) => l.name);
    expect(names).not.toContain("Jupyter Notebook");
  });
});

describe("trimTopLanguages — sorting and clamping", () => {
  test("langs are sorted by size descending", () => {
    const topLangs = makeLangs(["Go", 1000], ["Ruby", 5000], ["Python", 3000]);
    const { langs } = trimTopLanguages(topLangs, 10, []);
    expect(langs.map((l) => l.name)).toEqual(["Ruby", "Python", "Go"]);
  });

  test("langs_count clamped to minimum 1", () => {
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000]);
    const { langs } = trimTopLanguages(topLangs, 0, []);
    expect(langs.length).toBeGreaterThanOrEqual(1);
  });

  test("langs_count=1 shows only top lang with no Other (can't reserve a slot)", () => {
    // When langs_count=1, reserving a slot would leave 0 named langs.
    // Instead just show the top 1 lang with no Other bucket.
    const topLangs = makeLangs(["Ruby", 5000], ["Go", 3000], ["Python", 1000]);
    const { langs } = trimTopLanguages(topLangs, 1, []);
    expect(langs[0].name).toBe("Ruby");
    expect(langs.length).toBe(1);
    expect(langs.some((l) => l.name === "Other")).toBe(false);
  });

  test("empty input returns empty langs and zero total", () => {
    const { langs, totalLanguageSize } = trimTopLanguages({}, 5, []);
    expect(langs).toEqual([]);
    expect(totalLanguageSize).toBe(0);
  });
});

// ── renderTopLanguages — Other in rendered SVG ────────────────────────────────

describe("renderTopLanguages — Other in SVG", () => {
  const topLangs = makeLangs(
    ["Ruby", 5000, "#CC342D"],
    ["Go", 3000, "#00ADD8"],
    ["Python", 2000, "#3572A5"],
    ["Rust", 1000, "#dea584"],
  );

  test("SVG contains Other label when overflow", () => {
    const svg = renderTopLanguages(topLangs, { langs_count: 2 });
    expect(svg).toContain("Other");
  });

  test("SVG does not contain Other when all langs fit", () => {
    const svg = renderTopLanguages(topLangs, { langs_count: 10 });
    expect(svg).not.toContain("Other");
  });

  test("SVG contains Other in compact layout", () => {
    const svg = renderTopLanguages(topLangs, {
      langs_count: 2,
      layout: "compact",
    });
    expect(svg).toContain("Other");
  });

  test("SVG contains Other in donut layout", () => {
    const svg = renderTopLanguages(topLangs, {
      langs_count: 2,
      layout: "donut",
    });
    expect(svg).toContain("Other");
  });

  test("SVG is valid when langs_count=1 (no Other — can't reserve slot)", () => {
    const svg = renderTopLanguages(topLangs, { langs_count: 1 });
    expect(svg).toContain("<svg");
    // langs_count=1 cannot reserve a slot for Other; just shows top lang
    expect(svg).not.toContain("Other");
    expect(svg).toContain("Ruby");
  });

  test("hidden langs excluded and not visible in SVG", () => {
    const svg = renderTopLanguages(topLangs, {
      langs_count: 10,
      hide: ["Rust"],
    });
    expect(svg).not.toContain("Rust");
    expect(svg).toContain("Ruby");
  });
});
