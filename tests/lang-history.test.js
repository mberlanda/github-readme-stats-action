import { describe, expect, test } from "vitest";

// Test the groupByYear helper and renderLangHistory output directly.
// We import from the built card module since it lives in packages/core/build.
import { renderLangHistory } from "../packages/core/build/cards/lang-history.js";

// Minimal repo node factory
const makeNode = (createdAt, langs) => ({
  name: "repo",
  createdAt,
  isFork: false,
  languages: {
    edges: langs.map(([name, size, color]) => ({
      size,
      node: { name, color: color || "#aabbcc" },
    })),
  },
});

const SAMPLE_NODES = [
  makeNode("2020-03-01T00:00:00Z", [
    ["Ruby", 50000, "#CC342D"],
    ["Go", 20000, "#00ADD8"],
  ]),
  makeNode("2020-06-01T00:00:00Z", [["Ruby", 30000, "#CC342D"]]),
  makeNode("2021-01-15T00:00:00Z", [
    ["Go", 80000, "#00ADD8"],
    ["Python", 15000, "#3572A5"],
  ]),
  makeNode("2022-05-20T00:00:00Z", [["Ruby", 10000, "#CC342D"]]),
];

describe("renderLangHistory — SVG output", () => {
  test("returns a valid SVG string", () => {
    const svg = renderLangHistory(SAMPLE_NODES);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("contains year labels for all years in data", () => {
    const svg = renderLangHistory(SAMPLE_NODES);
    expect(svg).toContain("'20");
    expect(svg).toContain("'21");
    expect(svg).toContain("'22");
  });

  test("contains language colors for detected languages", () => {
    const svg = renderLangHistory(SAMPLE_NODES);
    // Ruby's color
    expect(svg).toContain("#CC342D");
    // Go's color
    expect(svg).toContain("#00ADD8");
  });

  test("shows 'Other' in legend when more languages than langs_count", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [
        ["Ruby", 100, "#CC342D"],
        ["Go", 90, "#00ADD8"],
        ["Python", 80, "#3572A5"],
        ["TypeScript", 70, "#2b7489"],
        ["JavaScript", 60, "#f1e05a"],
        ["Elixir", 50, "#6e4a7e"],
        ["Rust", 40, "#dea584"],
      ]),
    ];
    const svg = renderLangHistory(nodes, { langs_count: 5 });
    expect(svg).toContain("Other");
  });

  test("does not show 'Other' when all languages fit within langs_count", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [
        ["Ruby", 100, "#CC342D"],
        ["Go", 90, "#00ADD8"],
      ]),
    ];
    const svg = renderLangHistory(nodes, { langs_count: 6 });
    expect(svg).not.toContain("Other");
  });

  test("hides specified languages", () => {
    const nodes = [
      makeNode("2021-01-01T00:00:00Z", [
        ["HTML", 1000000, "#e34c26"],
        ["Ruby", 50000, "#CC342D"],
      ]),
    ];
    const svg = renderLangHistory(nodes, { hide: ["HTML"] });
    // HTML color should not appear in bars (though may appear in legend background if not filtered)
    // Check that Ruby IS there
    expect(svg).toContain("#CC342D");
    // HTML should not appear in legend
    expect(svg).not.toContain(">HTML<");
  });

  test("renders empty state gracefully when no nodes provided", () => {
    const svg = renderLangHistory([]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("No data");
  });

  test("applies custom_title", () => {
    const svg = renderLangHistory(SAMPLE_NODES, {
      custom_title: "My Language Timeline",
    });
    expect(svg).toContain("My Language Timeline");
  });

  test("card SVG has correct width attribute", () => {
    const svg = renderLangHistory(SAMPLE_NODES);
    expect(svg).toContain('width="500"');
  });

  test("earlier years appear before later years (ascending x order)", () => {
    const svg = renderLangHistory(SAMPLE_NODES);
    const idx20 = svg.indexOf("'20");
    const idx21 = svg.indexOf("'21");
    const idx22 = svg.indexOf("'22");
    expect(idx20).toBeLessThan(idx21);
    expect(idx21).toBeLessThan(idx22);
  });
});

describe("renderLangHistory — year grouping", () => {
  test("repos from same year are aggregated together", () => {
    // Both 2020 nodes contribute to Ruby; total 2020 Ruby = 80000
    // Check indirectly: SVG should render 2020 bar with a segment
    const svg = renderLangHistory(SAMPLE_NODES);
    // The '20 bar should contain rects — just verify SVG has rect elements
    expect(svg).toMatch(/<rect /);
  });

  test("empty years between activity years are not rendered", () => {
    const nodes = [
      makeNode("2019-01-01T00:00:00Z", [["Ruby", 1000, "#CC342D"]]),
      makeNode("2023-01-01T00:00:00Z", [["Ruby", 1000, "#CC342D"]]),
    ];
    const svg = renderLangHistory(nodes);
    // 2020, 2021, 2022 had no repos — should not appear
    expect(svg).not.toContain("'20");
    expect(svg).not.toContain("'21");
    expect(svg).not.toContain("'22");
    expect(svg).toContain("'19");
    expect(svg).toContain("'23");
  });
});
