import { describe, expect, test } from "vitest";

import { normalizeOptions, parseOptions } from "../index.js";

describe("normalizeOptions", () => {
  test("converts array values to comma-joined strings", () => {
    expect(normalizeOptions({ hide: ["HTML", "CSS"] })).toEqual({
      hide: "HTML,CSS",
    });
  });

  test("drops null and undefined values", () => {
    expect(normalizeOptions({ a: "x", b: null, c: undefined })).toEqual({
      a: "x",
    });
  });

  test("converts non-string scalars to strings", () => {
    expect(normalizeOptions({ count: 8, flag: true })).toEqual({
      count: "8",
      flag: "true",
    });
  });
});

describe("parseOptions — query string", () => {
  test("parses a simple key=value pair", () => {
    expect(parseOptions("username=foo")).toEqual({ username: "foo" });
  });

  test("parses multiple parameters separated by &", () => {
    expect(parseOptions("username=foo&layout=compact")).toEqual({
      username: "foo",
      layout: "compact",
    });
  });

  test("trims trailing whitespace introduced by YAML >- folding", () => {
    // YAML >- replaces newlines with spaces, so `&key=val` on a new line becomes
    // ` &key=val` — the previous value ends with a trailing space.
    const yamlFolded =
      "username=foo &layout=compact &langs_count=8 &lang_multiplier=Jupyter Notebook:0.1";
    expect(parseOptions(yamlFolded)).toEqual({
      username: "foo",
      layout: "compact",
      langs_count: "8",
      lang_multiplier: "Jupyter Notebook:0.1",
    });
  });

  test("compact layout passes through cleanly after trimming", () => {
    const { layout } = parseOptions(
      "username=foo &layout=compact &langs_count=8",
    );
    // Must exactly equal "compact" — trailing space would fail card validation
    expect(layout).toBe("compact");
  });

  test("combines duplicate keys with a comma", () => {
    expect(parseOptions("hide=HTML&hide=CSS")).toEqual({ hide: "HTML,CSS" });
  });

  test("strips a leading ? from the query string", () => {
    expect(parseOptions("?username=foo&layout=compact")).toEqual({
      username: "foo",
      layout: "compact",
    });
  });

  test("returns empty object for empty string", () => {
    expect(parseOptions("")).toEqual({});
  });

  test("lang_multiplier value with colon and comma is preserved", () => {
    const { lang_multiplier } = parseOptions(
      "username=foo&lang_multiplier=Jupyter Notebook:0.1,HTML:0.5",
    );
    expect(lang_multiplier).toBe("Jupyter Notebook:0.1,HTML:0.5");
  });
});

describe("parseOptions — JSON", () => {
  test("parses a JSON object string", () => {
    expect(parseOptions('{"username":"foo","layout":"compact"}')).toEqual({
      username: "foo",
      layout: "compact",
    });
  });

  test("normalizes JSON array values to comma strings", () => {
    expect(parseOptions('{"hide":["HTML","CSS"]}')).toEqual({
      hide: "HTML,CSS",
    });
  });

  test("throws on invalid JSON", () => {
    expect(() => parseOptions("{bad json}")).toThrow("Invalid JSON");
  });
});
