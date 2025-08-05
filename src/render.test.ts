import { describe, test, expect, vi, beforeEach } from "vitest";
import renderTree, { renderViewForNode } from "./render";
import { html } from "../test/helpers";
import type { DefoHTMLElement } from "./types";

const prefix = "defo";

describe("renderViewForNode", () => {
  let fakeView: ReturnType<typeof vi.fn>;
  let node: DefoHTMLElement;
  const viewName = "fakeView";

  beforeEach(() => {
    document.body.innerHTML = "";
    fakeView = vi.fn();
    node = html` <div data-defo-fake-view="" /> `;
  });

  test("calls passed view function", () => {
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(fakeView).toHaveBeenCalled();
  });

  test("... once only", () => {
    renderViewForNode(node, prefix, { fakeView }, viewName);
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(fakeView).toHaveBeenCalledTimes(1);
  });

  test("should decorate the node with view API methods", () => {
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(node._defoUpdate?.[viewName]).toBeInstanceOf(Function);
    expect(node._defoDestroy?.[viewName]).toBeInstanceOf(Function);
  });

  test("should call multiple views separately", () => {
    // First call the original fakeView
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(fakeView).toHaveBeenCalledTimes(1);

    // Then call a new view on the same node
    const newFakeView = vi.fn();
    node.setAttribute(`data-${prefix}-new-fake-view`, "true");
    renderViewForNode(node, prefix, { newFakeView, fakeView }, "newFakeView");
    expect(newFakeView).toHaveBeenCalled();
    expect(fakeView).toHaveBeenCalledTimes(1); // Should still be 1
  });

  test("should not call views that aren't specified on the node", () => {
    const otherView = vi.fn();
    renderViewForNode(node, prefix, { otherView }, "otherView");
    expect(otherView).not.toHaveBeenCalled();
  });

  test("should gracefully handle a view function being undefined", () => {
    let threw = false;
    try {
      renderViewForNode(node, prefix, {}, "missingView");
    } catch (error) {
      threw = true;
    }
    expect(threw).toBe(false);
  });
});

describe("renderTree", () => {
  let fakeView: ReturnType<typeof vi.fn>;
  let scope: DefoHTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    fakeView = vi.fn();
    scope = html`
      <section>
        <div data-defo-fake-view="1"></div>
        <div data-defo-fake-view="2"></div>
        <div data-defo-fake-view="3">
          <span data-defo-fake-view="4"></span>
        </div>
      </section>
    `;
  });

  test("calls passed view function for each node", () => {
    renderTree({ prefix, scope, views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(4);
  });

  test("... once only", () => {
    renderTree({ prefix, scope, views: { fakeView } });
    renderTree({ prefix, scope, views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(4);
  });
});
