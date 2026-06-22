import { describe, expect, test } from "vitest";

import { renderRubyGems } from "../packages/core/build/cards/rubygems.js";
import { renderPyPI } from "../packages/core/build/cards/pypi.js";
import { renderStackOverflow } from "../packages/core/build/cards/stackoverflow.js";
import { renderCPAN } from "../packages/core/build/cards/cpan.js";
import { renderExternalCard } from "../packages/core/build/common/external-card.js";

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
  up_vote_count: 30,
  down_vote_count: 5,
  view_count: 150,
  profile_image_data: null,
  link: "https://stackoverflow.com/users/1234567/mauro-berlanda",
  site: "stackoverflow",
};

describe("renderStackOverflow", () => {
  test("returns valid SVG", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("shows reputation in orange (formatCount)", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("1.3k");
  });

  test("shows answer count", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain(">42<");
  });

  test("shows question count", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain(">8<");
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

  test("includes profile link in SVG anchor", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain("stackoverflow.com/users/1234567");
  });

  test("shows letter placeholder avatar when profile_image_data is null", () => {
    const svg = renderStackOverflow(SO_DATA);
    // First letter of "Mauro Berlanda" = M
    expect(svg).toContain(">M<");
  });

  test("embeds base64 avatar when profile_image_data provided", () => {
    const svg = renderStackOverflow({
      ...SO_DATA,
      profile_image_data: "data:image/jpeg;base64,AABB",
    });
    expect(svg).toContain("data:image/jpeg;base64,AABB");
  });

  test("applies custom_title", () => {
    const svg = renderStackOverflow(SO_DATA, { custom_title: "My SO Stats" });
    expect(svg).toContain("My SO Stats");
  });

  test("has correct card width", () => {
    const svg = renderStackOverflow(SO_DATA);
    expect(svg).toContain('width="400"');
  });

  test("respects card_width option", () => {
    const svg = renderStackOverflow(SO_DATA, { card_width: 300 });
    expect(svg).toContain('width="300"');
  });

  test("clamps card_width below minimum to 250", () => {
    const svg = renderStackOverflow(SO_DATA, { card_width: 50 });
    expect(svg).toContain('width="250"');
  });
});

// ── CPAN ──────────────────────────────────────────────────────────────────────

const CPAN_DATA = {
  pauseid: "KUPTA",
  display_name: "Kupta K",
  total_distributions: 12,
  distributions: [
    { name: "Acme-Module", version: "1.0.0", recency: 300 },
    { name: "Another-Dist", version: "0.5.0", recency: 150 },
    { name: "Old-Dist", version: "0.1.0", recency: 10 },
  ],
};

describe("renderCPAN", () => {
  test("returns valid SVG", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("shows display_name in title when different from pauseid", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("Kupta K");
  });

  test("uses pauseid in title when display_name equals pauseid", () => {
    const svg = renderCPAN({ ...CPAN_DATA, display_name: "KUPTA" });
    // Card encodes — as &#8212; in SVG text nodes
    expect(svg).toContain("CPAN");
    expect(svg).toContain("KUPTA");
  });

  test("shows PAUSE ID in summary", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("KUPTA");
  });

  test("shows distribution count in summary", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain(">12<");
  });

  test("lists distribution names", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("Acme-Module");
    expect(svg).toContain("Another-Dist");
  });

  test("shows version as display value", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("1.0.0");
  });

  test("includes metacpan profile link", () => {
    const svg = renderCPAN(CPAN_DATA);
    expect(svg).toContain("metacpan.org/author/KUPTA");
  });

  test("applies card_width option", () => {
    const svg = renderCPAN(CPAN_DATA, { card_width: 300 });
    expect(svg).toContain('width="300"');
  });
});

// ── renderExternalCard — shared engine edge cases ─────────────────────────────

const BASE_SUMMARY = [{ label: "Total", value: "42" }];
const BASE_ITEMS = [
  { name: "item-one", displayValue: "100/mo", rawValue: 100 },
  { name: "item-two", displayValue: "50/mo", rawValue: 50 },
];

describe("renderExternalCard", () => {
  test("summary item with link renders as anchor element", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: [
        {
          label: "Profile",
          value: "myuser",
          link: "https://example.com/myuser",
        },
      ],
      items: BASE_ITEMS,
      options: {},
    });
    expect(svg).toContain('href="https://example.com/myuser"');
    expect(svg).toContain("text-decoration");
  });

  test("summary item without link renders plain text at font-size 20", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: BASE_SUMMARY,
      items: BASE_ITEMS,
      options: {},
    });
    expect(svg).toContain('font-size="20"');
    expect(svg).not.toContain("text-decoration");
  });

  test("titlePrefixIcon content appears in SVG output", () => {
    const icon = `<g transform="scale(.667)"><path fill="red" d="M0 0h24v24H0z"/></g>`;
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: BASE_SUMMARY,
      items: BASE_ITEMS,
      titlePrefixIcon: icon,
      options: {},
    });
    expect(svg).toContain('fill="red"');
  });

  test("card_width option changes SVG width attribute", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: BASE_SUMMARY,
      items: BASE_ITEMS,
      options: { card_width: 300 },
    });
    expect(svg).toContain('width="300"');
  });

  test("card_width below 250 clamps to MIN_CARD_WIDTH", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: BASE_SUMMARY,
      items: BASE_ITEMS,
      options: { card_width: 100 },
    });
    expect(svg).toContain('width="250"');
  });

  test("all zero rawValues still renders without division-by-zero error", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: BASE_SUMMARY,
      items: [
        { name: "a", displayValue: "0", rawValue: 0 },
        { name: "b", displayValue: "0", rawValue: 0 },
      ],
      options: {},
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("XSS: malicious value in summary is escaped", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: [{ label: "Name", value: "<script>alert(1)</script>" }],
      items: BASE_ITEMS,
      options: {},
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  test("XSS: javascript: protocol in summary link is neutralised to #", () => {
    const svg = renderExternalCard({
      defaultTitle: "Test",
      summary: [
        {
          label: "Link",
          value: "click",
          link: 'javascript:alert("xss")',
        },
      ],
      items: BASE_ITEMS,
      options: {},
    });
    expect(svg).not.toContain('href="javascript:');
    expect(svg).toContain('href="#"');
  });
});
