import { describe, expect, test } from "vitest";

import { renderRubyGems } from "../packages/core/build/cards/rubygems.js";
import { renderPyPI } from "../packages/core/build/cards/pypi.js";
import { renderStackOverflow } from "../packages/core/build/cards/stackoverflow.js";

// ── RubyGems ──────────────────────────────────────────────────────────────────

const RUBY_DATA = {
  username: "mberlanda",
  total_gems: 3,
  total_downloads: 7357000,
  gems: [
    {
      name: "bulk_insert",
      downloads: 7344043,
      version: "1.9.0",
      info: "Bulk inserts",
    },
    {
      name: "jsonschema_serializer",
      downloads: 13010,
      version: "0.1.0",
      info: "JSON schema",
    },
    { name: "tiny_gem", downloads: 100, version: "0.0.1", info: "tiny" },
  ],
};

describe("renderRubyGems", () => {
  test("returns valid SVG", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("shows username in title", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain("mberlanda");
  });

  test("shows gem count in summary", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain(">3<");
  });

  test("formats large download counts with M suffix", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain("7.4M");
  });

  test("lists gem names", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain("bulk_insert");
    expect(svg).toContain("jsonschema_serializer");
  });

  test("truncates long gem names", () => {
    const data = {
      ...RUBY_DATA,
      gems: [
        {
          name: "a_very_long_gem_name_that_should_be_truncated",
          downloads: 100,
          version: "1.0",
          info: "",
        },
      ],
    };
    const svg = renderRubyGems(data);
    expect(svg).toContain("…");
  });

  test("applies custom_title", () => {
    const svg = renderRubyGems(RUBY_DATA, { custom_title: "My Gems" });
    expect(svg).toContain("My Gems");
  });

  test("has correct card width", () => {
    const svg = renderRubyGems(RUBY_DATA);
    expect(svg).toContain('width="400"');
  });
});

// ── PyPI ──────────────────────────────────────────────────────────────────────

const PYPI_DATA = {
  username: "mberlanda",
  total_packages: 2,
  packages: [
    {
      name: "quantik-core",
      version: "0.1.1",
      summary: "A game package",
      downloads_last_month: 64,
    },
    {
      name: "other-pkg",
      version: "0.0.1",
      summary: "Another package",
      downloads_last_month: null,
    },
  ],
};

describe("renderPyPI", () => {
  test("returns valid SVG", () => {
    const svg = renderPyPI(PYPI_DATA);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("shows username in title", () => {
    const svg = renderPyPI(PYPI_DATA);
    expect(svg).toContain("mberlanda");
  });

  test("shows package count in summary", () => {
    const svg = renderPyPI(PYPI_DATA);
    expect(svg).toContain(">2<");
  });

  test("lists package names", () => {
    const svg = renderPyPI(PYPI_DATA);
    expect(svg).toContain("quantik-core");
  });

  test("shows /mo suffix for packages with download data", () => {
    const svg = renderPyPI(PYPI_DATA);
    expect(svg).toContain("/mo");
  });

  test("handles null downloads_last_month gracefully", () => {
    const svg = renderPyPI(PYPI_DATA);
    // Should not throw; other-pkg will show version instead
    expect(svg).toContain("</svg>");
  });

  test("applies custom_title", () => {
    const svg = renderPyPI(PYPI_DATA, { custom_title: "Python Packages" });
    expect(svg).toContain("Python Packages");
  });
});

// ── Stack Overflow ────────────────────────────────────────────────────────────

const SO_DATA = {
  user_id: 1234567,
  display_name: "Mauro Berlanda",
  reputation: 1250,
  badge_counts: { gold: 1, silver: 5, bronze: 20 },
  answer_count: 42,
  question_count: 8,
  link: "https://stackoverflow.com/users/1234567/mauro-berlanda",
  site: "stackoverflow",
};

describe("renderStackOverflow", () => {
  test("returns valid SVG", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("shows reputation", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("1.3k");
  });

  test("shows answer count", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain(">42<");
  });

  test("shows badge counts", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain(">1<"); // gold
    expect(svg).toContain(">5<"); // silver
    expect(svg).toContain(">20<"); // bronze
  });

  test("shows display name", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("Mauro Berlanda");
  });

  test("shows Stack Overflow label for default site", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("Stack Overflow");
  });

  test("applies custom_title", () => {
    const svg = renderStackOverflow(SO_DATA, { custom_title: "My SO Stats" });
    expect(svg).toContain("My SO Stats");
  });

  test("has correct card width", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain('width="400"');
  });
});
