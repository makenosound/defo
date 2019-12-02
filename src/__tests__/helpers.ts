import { JSDOM } from "jsdom";
import {
  attributeNameMatchesPrefix,
  attributeNameToViewName,
  capitalize,
  dasherize,
  hasDatasetKeysMatchingPrefix,
  keyForDataset,
  lowerFirsterize,
  parseProps
} from "../helpers";
var nanohtml = require("nanohtml/dom");

const jsdom = new JSDOM();
const html = nanohtml(jsdom.window.document);

const prefix = "defo";
const notPrefix = "not";
const attributeName = `data-defo-view-name`;
const lowerFirstViewName = "viewName";
const dataSetKey = `defoViewName`;

describe("attributeNameToViewName", () => {
  test("converts a dasherized data-attribute name to a lowerFirst view name", () => {
    expect(attributeNameToViewName(attributeName)).toBe(lowerFirstViewName);
  });
});

describe("attributeNameMatchesPrefix", () => {
  test("returns true if a dasherized data-attribute name matches a given prefix", () => {
    expect(attributeNameMatchesPrefix(attributeName, prefix)).toBe(true);
  });
  test("returns false if a dasherized data-attribute name does not match a given prefix", () => {
    expect(attributeNameMatchesPrefix(attributeName, notPrefix)).toBe(false);
  });
  test("returns false if the prefix does not match exactly", () => {
    expect(
      attributeNameMatchesPrefix(
        attributeName,
        prefix.slice(0, prefix.length - 2)
      )
    ).toBe(false);
  });
});

describe("hasDatasetKeysMatchingPrefix", () => {
  test("returns true if a node has dataset keys matching a given prefix", () => {
    expect(
      hasDatasetKeysMatchingPrefix(
        html`
          <p ${attributeName}="true">Node</p>
        `,
        prefix
      )
    ).toBe(true);
  });
  test("returns false if a node does not have dataset keys matching a given prefix", () => {
    expect(
      hasDatasetKeysMatchingPrefix(
        html`
          <p data-${notPrefix}-view-name="true">Node</p>
        `,
        prefix
      )
    ).toBe(false);
  });
});

describe("keyForDataset", () => {
  it("generates a lowerFirst dataset key from a given prefix and view name", () => {
    expect(keyForDataset(prefix, lowerFirstViewName)).toBe(dataSetKey);
  });
});

describe("parseProps", () => {
  test("it should parse values to JS objects/primitives", () => {
    expect(parseProps('{"foo":[1,2,3]}')).toMatchObject({ foo: [1, 2, 3] });
    expect(parseProps("[1,2,3]")).toMatchObject([1, 2, 3]);
    expect(parseProps("true")).toBe(true);
    expect(parseProps("false")).toBe(false);
    expect(parseProps("1")).toBe(1);
  });
  test("it should gracefully handle invalid JSON", () => {
    expect(parseProps("{foo")).toBe("{foo");
    expect(parseProps("1 2 3")).toBe("1 2 3");
  });
});

describe("Case conversions", () => {
  test("lowerFirsterize converts dasherized values to be lowerFirst", () => {
    expect(lowerFirsterize("foo-bar")).toBe("fooBar");
    expect(lowerFirsterize("foo")).toBe("foo");
  });
  test("dasherize converts lowerFirst values to be dash-separated", () => {
    expect(dasherize("fooBar")).toBe("foo-bar");
    expect(dasherize("foo")).toBe("foo");
  });
  test("capitalize changes the first character to uppercase", () => {
    expect(capitalize("fooBar")).toBe("FooBar");
  });
});
